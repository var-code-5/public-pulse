import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * Create a new comment
 * @param req - Express request object with authenticated user and comment data
 * @param res - Express response object
 */
export const createComment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { content, issueId, parentId } = req.body;
    const authorId = req.user.id;

    // Validate required fields
    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (!issueId) {
      return res.status(400).json({ error: "Issue ID is required" });
    }

    // Check if the issue exists
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    // If parentId is provided, check if the parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        return res.status(404).json({ error: "Parent comment not found" });
      }
    }

    // Create the comment with Prisma
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId,
        issueId,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            profileURL: true,
          },
        },
      },
    });

    // If this is not a reply, create a notification for the issue author
    if (!parentId && issue.authorId !== authorId) {
      await prisma.notification.create({
        data: {
          userId: issue.authorId,
          issueId,
          message: `Someone commented on your issue "${issue.title}"`,
        },
      });
    }

    // If this is a reply, create a notification for the parent comment author
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });

      if (parentComment && parentComment.authorId !== authorId) {
        await prisma.notification.create({
          data: {
            userId: parentComment.authorId,
            issueId,
            message: `Someone replied to your comment on issue "${issue.title}"`,
          },
        });
      }
    }

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

/**
 * Get all comments for an issue with pagination
 * @param req - Express request object with issue ID
 * @param res - Express response object
 */
export const getIssueComments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { issueId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // We'll only get top-level comments with pagination
    const where = {
      issueId,
      parentId: null, // Only get top-level comments
    };

    // Get total count for pagination
    const total = await prisma.comment.count({ where });

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get top-level comments with pagination
    const parentComments = await prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            profileURL: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Process parent comments and fetch their children
    const commentsWithReplies = await Promise.all(
      parentComments.map(async (parentComment) => {
        // Get all replies for this parent comment
        const childComments = await prisma.comment.findMany({
          where: {
            parentId: parentComment.id,
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                profileURL: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc", // Show oldest replies first
          },
        });

        // Process vote counts for parent comment
        const parentUpvotes = await prisma.vote.count({
          where: {
            commentId: parentComment.id,
            type: "UPVOTE",
          },
        });

        const parentDownvotes = await prisma.vote.count({
          where: {
            commentId: parentComment.id,
            type: "DOWNVOTE",
          },
        });

        // Check if the current user has voted on the parent comment
        let parentUserVote = null;
        if (req.user && req.user.id) {
          const vote = await prisma.vote.findFirst({
            where: {
              commentId: parentComment.id,
              userId: req.user.id,
            },
          });

          if (vote) {
            parentUserVote = vote.type;
          }
        }

        // Process child comments with votes
        const childCommentsWithVotes = await Promise.all(
          childComments.map(async (childComment) => {
            const upvotes = await prisma.vote.count({
              where: {
                commentId: childComment.id,
                type: "UPVOTE",
              },
            });

            const downvotes = await prisma.vote.count({
              where: {
                commentId: childComment.id,
                type: "DOWNVOTE",
              },
            });

            // Check if the current user has voted on this child comment
            let userVote = null;
            if (req.user && req.user.id) {
              const vote = await prisma.vote.findFirst({
                where: {
                  commentId: childComment.id,
                  userId: req.user.id,
                },
              });

              if (vote) {
                userVote = vote.type;
              }
            }

            return {
              ...childComment,
              votes: {
                upvotes,
                downvotes,
                userVote,
              },
            };
          })
        );

        // Return parent comment with its replies included
        return {
          ...parentComment,
          replies: childCommentsWithVotes,
          votes: {
            upvotes: parentUpvotes,
            downvotes: parentDownvotes,
            userVote: parentUserVote,
          },
        };
      })
    );

    const totalPages = Math.ceil(total / limit);

    // Get total count of all comments (parents + replies) for this issue
    const totalCommentsCount = await prisma.comment.count({
      where: {
        issueId,
      },
    });

    res.json({
      comments: commentsWithReplies,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
      totalComments: totalCommentsCount,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

/**
 * Update a comment
 * @param req - Express request object with comment ID and update data
 * @param res - Express response object
 */
export const updateComment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { id } = req.params;
    const { content } = req.body;

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the user is the author or an admin
    const isAuthor = comment.authorId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to update this comment",
      });
    }

    // Validate content
    if (!content) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            profileURL: true,
          },
        },
      },
    });

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

/**
 * Delete a comment
 * @param req - Express request object with comment ID
 * @param res - Express response object
 */
export const deleteComment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Authentication required" });
    }

    const { id } = req.params;

    // Check if the comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the user is the author or an admin
    const isAuthor = comment.authorId === req.user.id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        error: "Forbidden: You do not have permission to delete this comment",
      });
    }

    // Delete all related data using Prisma transaction
    await prisma.$transaction(async (prisma) => {
      // Delete related votes
      await prisma.vote.deleteMany({
        where: {
          commentId: id,
        },
      });

      // Delete related replies' votes
      await prisma.vote.deleteMany({
        where: {
          comment: {
            parentId: id,
          },
        },
      });

      // Delete related replies
      await prisma.comment.deleteMany({
        where: {
          parentId: id,
        },
      });

      // Finally delete the comment
      await prisma.comment.delete({
        where: {
          id,
        },
      });
    });

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
