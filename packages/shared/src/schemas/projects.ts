import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isPrivate: z.boolean().default(false),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['ON_TRACK', 'AT_RISK', 'OVERDUE', 'COMPLETED']).optional()
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
