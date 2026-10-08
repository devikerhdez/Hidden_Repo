import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

export const ratingsRouter = Router();

const ratingSchema = z.object({
  content_id: z.string().uuid(),
  score: z.number().int().min(0).max(5),
  review_text: z.string().max(500).optional(),
});

ratingsRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { content_id, score, review_text } = ratingSchema.parse(req.body);

    const existing = await prisma.rating.findUnique({
      where: { user_id_content_id: { user_id: userId, content_id } },
    });

    if (existing) {
      throw new AppError('Already rated this content', 409);
    }

    const rating = await prisma.rating.create({
      data: {
        user_id: userId,
        content_id,
        score,
        review_text: review_text || null,
      },
    });

    const coinsAmount = parseInt(process.env.COINS_PER_RATING || '10', 10);

    await prisma.coinTransaction.create({
      data: {
        user_id: userId,
        amount: coinsAmount,
        reason: 'rating_reward',
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: coinsAmount } },
    });

    const agg = await prisma.rating.aggregate({
      where: { content_id },
      _avg: { score: true },
      _count: { score: true },
    });

    await prisma.contentItem.update({
      where: { id: content_id },
      data: {
        community_rating: agg._avg.score
          ? parseFloat((agg._avg.score * 2).toFixed(1))
          : null,
        community_rating_count: agg._count.score,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    res.status(201).json({ rating, coins_earned: coinsAmount, total_coins: user?.coins });
  } catch (err) {
    next(err);
  }
});
