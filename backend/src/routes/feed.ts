import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const feedRouter = Router();

feedRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const types = req.query.types
      ? (req.query.types as string).split(',')
      : undefined;
    const excludeMainstream = req.query.exclude_mainstream === 'true';
    const genres = req.query.genres
      ? (req.query.genres as string).split(',')
      : undefined;
    const excludeIds = req.query.exclude_ids
      ? (req.query.exclude_ids as string).split(',')
      : undefined;

    const swipedIds = (
      await prisma.userSwipe.findMany({
        where: { user_id: userId },
        select: { content_id: true },
      })
    ).map((s) => s.content_id);

    const excludedIds = (
      await prisma.userExclusion.findMany({
        where: { user_id: userId },
        select: { content_id: true },
      })
    ).map((e) => e.content_id);

    const allExcluded = [
      ...new Set([...swipedIds, ...excludedIds, ...(excludeIds || [])]),
    ];

    const where: any = {
      id: { notIn: allExcluded },
    };

    if (types?.length) {
      where.type = { in: types };
    }

    if (excludeMainstream) {
      where.is_mainstream = false;
    }

    if (genres?.length) {
      where.genres = { some: { genre_id: { in: genres } } };
    }

    const items = await prisma.contentItem.findMany({
      where,
      take: 20,
      include: {
        genres: { include: { genre: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json(items);
  } catch (err) {
    next(err);
  }
});
