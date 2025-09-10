import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { deleteFile } from '../utils/s3';

/**
 * Delete a specific image from an issue
 * @param req - Express request object with authenticated user and image ID
 * @param res - Express response object
 */
export const deleteImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { imageId } = req.params;

    // Find the image to check ownership
    const image = await prisma.image.findUnique({
      where: { id: imageId },
      include: {
        issue: true,
      },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Check if the user is the author of the issue or an admin
    const isAuthor = image.issue.authorId === req.user.id;
    const isAdminOrGovernment = req.user.role === 'ADMIN' || req.user.role === 'GOVERNMENT';

    if (!isAuthor && !isAdminOrGovernment) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to delete this image' });
    }

    // Delete the image from S3
    try {
      await deleteFile(image.url);
    } catch (deleteError) {
      console.error('Error deleting image from S3:', deleteError);
      // Continue with the database deletion even if S3 deletion fails
    }

    // Delete the image from the database
    await prisma.image.delete({
      where: {
        id: imageId,
      },
    });

    res.json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
};
