import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const coinsRouter = Router();

coinsRouter.get('/balance', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { coins: true },
    });
    res.json({ balance: user?.coins ?? 0 });
  } catch (err) {
    next(err);
  }
});

coinsRouter.get('/history', authenticate, async (req, res, next) => {
  try {
    const transactions = await prisma.coinTransaction.findMany({
      where: { user_id: req.user!.userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});
