import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { reportQueue } from '../workers/report';

export const triggerProjectReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.projectId;
    const workspaceId = req.user!.workspaceId;

    const project = await prisma.project.findFirst({
      where: { id: projectId, workspaceId }
    });

    if (!project) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignees: true }
    });

    // Add job to the BullMQ queue
    const job = await reportQueue.add('project-summary', {
      projectId,
      userId: req.user!.userId,
      type: 'PDF',
      data: { tasks }
    });

    res.status(202).json({ 
      data: { 
        jobId: job.id, 
        message: 'Report generation started. You will be notified when it is ready.' 
      } 
    });
  } catch (error) {
    next(error);
  }
};
