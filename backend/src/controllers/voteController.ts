import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { VoteType } from '../generated/prisma';

/**
 * Vote on an issue or comment
 * @param req - Express request object with authenticated user and vote data
 * @param res - Express response object
 */
export const vote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }

    const { type, issueId, commentId } = req.body;
    const userId = req.user.id;

    // Validate vote type
    if (!type || !Object.values(VoteType).includes(type as VoteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    // Either issueId or commentId must be provided
    if (!issueId && !commentId) {
      return res.status(400).json({ error: 'Either issueId or commentId is required' });
    }

    if (issueId && commentId) {
      return res.status(400).json({ error: 'Cannot vote on both issue and comment simultaneously' });
    }

    // Check if the issue or comment exists
    if (issueId) {
      const issue = await prisma.issue.findUnique({
        where: { id: issueId },
      });

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
    }

    if (commentId) {
      const comment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
    }

    // Check if the user has already voted on this issue or comment
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        ...(issueId && { issueId }),
        ...(commentId && { commentId }),
      },
    });

    let vote;

    if (existingVote) {
      // If the vote type is the same as existing, remove the vote (toggle off)
      if (existingVote.type === type) {
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        
        return res.json({
          message: 'Vote removed successfully',
          vote: null,
        });
      } else {
        // If the vote type is different, update the vote
        vote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: type as VoteType },
        });
      }
    } else {
      // Create a new vote
      vote = await prisma.vote.create({
        data: {
          type: type as VoteType,
          userId,
          ...(issueId && { issueId }),
          ...(commentId && { commentId }),
        },
      });
    }

    res.json({
      message: 'Vote recorded successfully',
      vote,
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
};

/**
 * Get vote counts for an issue or comment
 * @param req - Express request object with issue ID or comment ID
 * @param res - Express response object
 */
export const getVoteCounts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { issueId, commentId } = req.query;

    // Either issueId or commentId must be provided
    if (!issueId && !commentId) {
      return res.status(400).json({ error: 'Either issueId or commentId is required' });
    }

    if (issueId && commentId) {
      return res.status(400).json({ error: 'Cannot get votes for both issue and comment simultaneously' });
    }

    // Calculate upvotes and downvotes
    const upvotes = await prisma.vote.count({
      where: {
        ...(issueId && { issueId: issueId as string }),
        ...(commentId && { commentId: commentId as string }),
        type: 'UPVOTE',
      },
    });

    const downvotes = await prisma.vote.count({
      where: {
        ...(issueId && { issueId: issueId as string }),
        ...(commentId && { commentId: commentId as string }),
        type: 'DOWNVOTE',
      },
    });

    // Get the current user's vote if authenticated
    let userVote = null;
    if (req.user && req.user.id) {
      const vote = await prisma.vote.findFirst({
        where: {
          ...(issueId && { issueId: issueId as string }),
          ...(commentId && { commentId: commentId as string }),
          userId: req.user.id,
        },
      });
      
      if (vote) {
        userVote = vote.type;
      }
    }

    res.json({
      votes: {
        upvotes,
        downvotes,
        userVote,
      },
    });
  } catch (error) {
    console.error('Error getting vote counts:', error);
    res.status(500).json({ error: 'Failed to get vote counts' });
  }
};
