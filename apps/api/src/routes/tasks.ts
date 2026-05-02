import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listTasks, createTask, moveTask } from '../controllers/tasks';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', listTasks);
router.post('/', createTask);
router.post('/:taskId/move', moveTask);

export default router;
