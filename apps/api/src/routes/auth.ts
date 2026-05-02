import { Router } from 'express';
import { googleCallback, refreshToken, logout } from '../controllers/auth';

const router = Router();

router.post('/google', googleCallback);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
