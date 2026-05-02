import { z } from 'zod';

export const googleAuthCallbackSchema = z.object({
  code: z.string({
    required_error: 'Authorization code is required',
  }),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id: z.string(),
    workspaceId: z.string(),
    email: z.string().email(),
    displayName: z.string(),
    avatarUrl: z.string().nullable(),
    role: z.enum(['OWNER', 'ADMIN', 'MEMBER', 'GUEST']),
  }),
});

export type GoogleAuthCallbackInput = z.infer<typeof googleAuthCallbackSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
