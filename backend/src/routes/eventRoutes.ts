import { Router } from 'express';
import { RequestHandler } from 'express';
import * as eventController from '../controllers/eventController';
import { verifyFirebaseToken } from '../middleware/auth';
import { requireCitizen, requireGovernment, requireAdmin } from '../middleware/roles';

const router = Router();

// Type assertion function to fix Express middleware type incompatibilities
const asHandler = (handler: any): RequestHandler => handler;

// Public routes - no authentication needed
router.get('/', asHandler(eventController.getAllEvents));
router.get('/upcoming', asHandler(eventController.getUpcomingEvents));
router.get('/nearby', asHandler(eventController.getNearbyEvents));
router.get('/:id', asHandler(eventController.getEventById));

// Protected routes - authentication needed
router.use(asHandler(verifyFirebaseToken));

// Admin and Government routes - only admin and government can create, update, and delete events
router.post('/', 
  asHandler(requireGovernment), // This middleware allows both GOVERNMENT and ADMIN roles
  asHandler(eventController.createEvent)
);

router.put('/:id', 
  asHandler(requireGovernment), // This middleware allows both GOVERNMENT and ADMIN roles
  asHandler(eventController.updateEvent)
);

router.delete('/:id', 
  asHandler(requireGovernment), // This middleware allows both GOVERNMENT and ADMIN roles
  asHandler(eventController.deleteEvent)
);

export default router;