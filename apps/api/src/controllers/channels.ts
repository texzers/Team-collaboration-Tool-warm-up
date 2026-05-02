import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createChannelSchema, sendMessageSchema } from '@teamflow/shared';
import { io } from '../index'; // Import the socket io instance

export const listChannels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;

    const channels = await prisma.channel.findMany({
      where: {
        workspaceId,
        OR: [
          { isPrivate: false },
          { members: { some: { id: userId } } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    res.json({ data: channels });
  } catch (error) {
    next(error);
  }
};

export const createChannel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { memberIds, ...data } = createChannelSchema.parse(req.body);
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;

    let finalMemberIds = memberIds || [];
    if (data.isPrivate && !finalMemberIds.includes(userId)) {
      finalMemberIds.push(userId);
    }

    const channel = await prisma.channel.create({
      data: {
        ...data,
        workspaceId,
        createdBy: userId,
        members: {
          connect: finalMemberIds.map(id => ({ id }))
        }
      }
    });

    res.status(201).json({ data: channel });
  } catch (error) {
    next(error);
  }
};

export const listMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channelId = req.params.channelId;
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        workspaceId,
        OR: [
          { isPrivate: false },
          { members: { some: { id: userId } } }
        ]
      }
    });

    if (!channel) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Channel not found or access denied' } });
    }

    const messages = await prisma.message.findMany({
      where: { channelId, parentId: null },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
        _count: { select: { replies: true } }
      }
    });

    let nextCursor: string | undefined = undefined;
    if (messages.length > limit) {
      const nextItem = messages.pop();
      nextCursor = nextItem!.id;
    }

    res.json({ 
      data: messages.reverse(), 
      meta: { nextCursor, hasMore: !!nextCursor } 
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const channelId = req.params.channelId;
    const data = sendMessageSchema.parse(req.body);
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;

    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        workspaceId,
        OR: [
          { isPrivate: false },
          { members: { some: { id: userId } } }
        ]
      }
    });

    if (!channel) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Channel not found or access denied' } });
    }

    const message = await prisma.message.create({
      data: {
        ...data,
        channelId,
        authorId: userId,
      },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } }
      }
    });

    // Emit socket event to channel room
    io.to(`channel:${channelId}`).emit('message:new', message);

    res.status(201).json({ data: message });
  } catch (error) {
    next(error);
  }
};
