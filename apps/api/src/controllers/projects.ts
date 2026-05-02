import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createProjectSchema, updateProjectSchema } from '@teamflow/shared';

export const listProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const workspaceId = req.user!.workspaceId;
    
    const projects = await prisma.project.findMany({
      where: { 
        workspaceId,
        archivedAt: null 
      },
      include: {
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: projects });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;

    const project = await prisma.project.create({
      data: {
        ...data,
        workspaceId,
        createdBy: userId,
      }
    });

    // Log audit action
    await prisma.auditLog.create({
      data: {
        workspaceId,
        actorId: userId,
        action: 'PROJECT_CREATED',
        targetType: 'PROJECT',
        targetId: project.id,
        ipAddress: req.ip || 'unknown',
        metadata: { name: project.name }
      }
    });

    res.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;
    const data = updateProjectSchema.parse(req.body);
    const workspaceId = req.user!.workspaceId;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: projectId, workspaceId }
    });

    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data
    });

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;
    const workspaceId = req.user!.workspaceId;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: { id: projectId, workspaceId }
    });

    if (!existing) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    // Soft delete
    await prisma.project.update({
      where: { id: projectId },
      data: { archivedAt: new Date() }
    });

    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
};
