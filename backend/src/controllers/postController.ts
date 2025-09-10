import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id: Number(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, content, published, authorId } = req.body;
    
    // Check if the author exists
    const author = await prisma.user.findUnique({
      where: { id: Number(authorId) },
    });
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
        authorId: Number(authorId),
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};
