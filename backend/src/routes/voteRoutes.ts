import { Router } from 'express';
import * as voteController from '../controllers/voteController';
import { verifyFirebaseToken } from '../middleware/auth';
import { requireCitizen } from '../middleware/roles';

const router = Router();

// Public routes - no authentication needed
router.get('/', voteController.getVoteCounts);

// Protected routes - authentication needed
router.use(verifyFirebaseToken);

// Routes for authenticated users
router.post('/', requireCitizen, voteController.vote);

export default router;
