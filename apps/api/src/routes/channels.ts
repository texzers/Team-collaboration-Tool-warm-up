import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { listChannels, createChannel, listMessages, sendMessage } from '../controllers/channels';

const router = Router();

router.use(requireAuth);

router.get('/', listChannels);
router.post('/', createChannel);
router.get('/:channelId/messages', listMessages);
router.post('/:channelId/messages', sendMessage);

export default router;
