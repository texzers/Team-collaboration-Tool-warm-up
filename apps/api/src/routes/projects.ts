import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listProjects, createProject, updateProject, deleteProject } from '../controllers/projects';

const router = Router();

router.use(requireAuth);

router.get('/', listProjects);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
