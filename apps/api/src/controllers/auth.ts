import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../utils/prisma';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { googleAuthCallbackSchema } from '@teamflow/shared';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// We define a 7-day cookie max-age
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
  });
};

export const googleCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = googleAuthCallbackSchema.parse(req.body);

    // 1. Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    const idToken = tokens.id_token;

    if (!idToken) {
       return res.status(400).json({ error: { code: 'AUTH_FAILED', message: 'No ID token returned' } });
    }

    // 2. Verify ID token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: { code: 'AUTH_FAILED', message: 'Invalid token payload' } });
    }

    const { email, name, picture, sub: googleId } = payload;

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email },
      include: { workspace: true }
    });

    if (!user) {
      // In a real app, users might need to be invited first or create a workspace.
      // For simplicity in this demo, if they don't exist, we create a default workspace for them.
      const workspace = await prisma.workspace.create({
        data: {
          name: `${name || 'User'}'s Workspace`,
          slug: `workspace-${Date.now()}`
        }
      });

      user = await prisma.user.create({
        data: {
          email,
          googleId,
          displayName: name || email.split('@')[0],
          avatarUrl: picture,
          role: 'OWNER',
          workspaceId: workspace.id,
        },
        include: { workspace: true }
      });
    }

    // 4. Update Google Integration tokens
    if (tokens.access_token) {
      await prisma.googleIntegration.upsert({
        where: { userId: user.id },
        update: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || '', // Sometimes refresh token is only sent on first auth
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        },
        create: {
          userId: user.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || '',
          expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
        }
      });
    }

    // 5. Generate Application Tokens
    const tokenPayload = {
      userId: user.id,
      workspaceId: user.workspaceId,
      role: user.role
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // We might want to store refresh token families in Redis here for security

    setRefreshTokenCookie(res, refreshToken);

    res.json({
      data: {
        accessToken,
        user: {
          id: user.id,
          workspaceId: user.workspaceId,
          email: user.email,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          role: user.role,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentRefreshToken = req.cookies?.refreshToken;
    
    if (!currentRefreshToken) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' } });
    }

    // Verify token
    let payload;
    try {
      payload = verifyRefreshToken(currentRefreshToken);
    } catch (e) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, status: 'ACTIVE' }
    });

    if (!user) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'User not found or inactive' } });
    }

    // Issue new tokens (Refresh token rotation)
    const tokenPayload = {
      userId: user.id,
      workspaceId: user.workspaceId,
      role: user.role
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('refreshToken');
  res.json({ data: { success: true } });
};
