import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { verifyFirebaseToken } from '../middleware/auth';
import { requireCitizen } from '../middleware/roles';

const router = Router();

// Public routes - no authentication needed
router.get('/issue/:issueId', commentController.getIssueComments);

// Protected routes - authentication needed
router.use(verifyFirebaseToken);

// Routes for authenticated users
router.post('/', requireCitizen, commentController.createComment);
router.put('/:id', requireCitizen, commentController.updateComment);
router.delete('/:id', requireCitizen, commentController.deleteComment);

export default router;
