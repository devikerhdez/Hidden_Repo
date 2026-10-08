import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import type { ContentType } from '@prisma/client';

export const filtersRouter = Router();

filtersRouter.get('/genres', authenticate, async (req, res, next) => {
  try {
    const type = req.query.type as ContentType | undefined;
    const where = type ? { applies_to: type } : {};
    const genres = await prisma.genre.findMany({ where });
    res.json(genres);
  } catch (err) {
    next(err);
  }
});

filtersRouter.get(
  '/mainstream-suggestions',
  authenticate,
  async (_req, res, next) => {
    try {
      const suggestions = await prisma.contentItem.findMany({
        where: { is_mainstream: true },
        orderBy: { popularity_score: 'desc' },
        take: 20,
        select: { id: true, title: true, type: true, popularity_score: true },
      });
      res.json(suggestions);
    } catch (err) {
      next(err);
    }
  }
);
