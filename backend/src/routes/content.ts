import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const contentRouter = Router();

contentRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const content = await prisma.contentItem.findUnique({
      where: { id: req.params.id as string },
      include: {
        genres: { include: { genre: true } },
      },
    });

    if (!content) throw new AppError('Content not found', 404);
    res.json(content);
  } catch (err) {
    next(err);
  }
});
