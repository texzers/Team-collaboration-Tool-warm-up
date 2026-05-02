import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from '@teamflow/shared';

export const listTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;
    const workspaceId = req.user!.workspaceId;

    // Verify project belongs to workspace
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId }
    });

    if (!project) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignees: {
          select: { id: true, displayName: true, avatarUrl: true }
        }
      },
      orderBy: { position: 'asc' }
    });

    res.json({ data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;
    const { assigneeIds, ...data } = createTaskSchema.parse(req.body);
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;

    // Verify project
    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId }
    });

    if (!project) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    // Determine position (append to end of status column)
    const lastTask = await prisma.task.findFirst({
      where: { projectId, status: data.status },
      orderBy: { position: 'desc' }
    });
    
    const position = lastTask ? lastTask.position + 65536 : 65536;

    const task = await prisma.task.create({
      data: {
        ...data,
        projectId,
        position,
        createdBy: userId,
        assignees: {
          connect: assigneeIds?.map(id => ({ id })) || []
        }
      },
      include: {
        assignees: { select: { id: true, displayName: true, avatarUrl: true } }
      }
    });

    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        actorId: userId,
        action: 'TASK_CREATED',
        metadata: { title: task.title }
      }
    });

    // TODO: Emit socket event task:created

    res.status(201).json({ data: task });
  } catch (error) {
    next(error);
  }
};

export const moveTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.taskId;
    const { status, position } = moveTaskSchema.parse(req.body);
    const workspaceId = req.user!.workspaceId;
    const userId = req.user!.userId;

    // Verify task ownership via project
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true }
    });

    if (!task || task.project.workspaceId !== workspaceId) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status, position }
    });

    if (task.status !== status) {
      await prisma.taskActivity.create({
        data: {
          taskId,
          actorId: userId,
          action: 'STATUS_CHANGED',
          metadata: { from: task.status, to: status }
        }
      });
    }

    // TODO: Emit socket event task:updated

    res.json({ data: updatedTask });
  } catch (error) {
    next(error);
  }
};
