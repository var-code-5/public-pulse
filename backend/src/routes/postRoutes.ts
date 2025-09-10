import { Router } from 'express';
import { getAllPosts, getPostById, createPost } from '../controllers/postController';

const router = Router();

// Get all posts
router.get('/', getAllPosts);

// Get post by ID
router.get('/:id', getPostById);

// Create new post
router.post('/', createPost);

export default router;
