import { Router } from 'express';
import * as issueController from '../controllers/issueController';
import { verifyFirebaseToken } from '../middleware/auth';
import { requireCitizen, requireGovernment, requireAdmin } from '../middleware/roles';

const router = Router();

// Public routes - no authentication needed
router.get('/', issueController.getAllIssues);
router.get('/nearby', issueController.getNearbyIssues);
router.get('/:id', issueController.getIssueById);

// Protected routes - authentication needed
router.use(verifyFirebaseToken);

// Citizen routes - citizen, government, and admin can access
router.post('/', requireCitizen, issueController.createIssue);
router.put('/:id', requireCitizen, issueController.updateIssue);

// Government and admin only routes
router.patch('/:id/status', requireGovernment, issueController.updateIssueStatus);
router.patch('/:id/department', requireGovernment, issueController.assignIssueToDepartment);

// Admin only routes
router.delete('/:id', requireAdmin, issueController.deleteIssue);

export default router;
