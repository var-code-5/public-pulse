import { Router } from 'express';
import { RequestHandler } from 'express';
import * as issueController from '../controllers/issueController';
import { verifyFirebaseToken } from '../middleware/auth';
import { requireCitizen, requireGovernment, requireAdmin } from '../middleware/roles';
import { uploadMultipleImages, handleUploadError } from '../middleware/upload';

const router = Router();

// Type assertion function to fix Express middleware type incompatibilities
const asHandler = (handler: any): RequestHandler => handler;

// Public routes - no authentication needed
router.get('/', asHandler(issueController.getAllIssues));
router.get('/nearby', asHandler(issueController.getNearbyIssues));
router.get('/:id', asHandler(issueController.getIssueById));

// Protected routes - authentication needed
router.use(asHandler(verifyFirebaseToken));

// Citizen routes - citizen, government, and admin can access
router.post('/', 
  asHandler(requireCitizen), 
  asHandler(uploadMultipleImages), 
  asHandler(handleUploadError), 
  asHandler(issueController.createIssue)
);
router.put('/:id', 
  asHandler(requireCitizen), 
  asHandler(uploadMultipleImages), 
  asHandler(handleUploadError), 
  asHandler(issueController.updateIssue)
);

// Government and admin only routes
router.patch('/:id/status', 
  asHandler(requireGovernment), 
  asHandler(issueController.updateIssueStatus)
);
router.patch('/:id/department', 
  asHandler(requireGovernment), 
  asHandler(issueController.assignIssueToDepartment)
);

// Admin only routes
router.delete('/:id', asHandler(requireAdmin), asHandler(issueController.deleteIssue));

export default router;
