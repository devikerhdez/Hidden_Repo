import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

export const listsRouter = Router();

listsRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const lists = await prisma.customList.findMany({
      where: { user_id: req.user!.userId },
      include: { _count: { select: { items: true } } },
    });
    res.json(lists);
  } catch (err) {
    next(err);
  }
});

listsRouter.get('/:id', authenticate, async (req, res, next) => {
  try {
    const list = await prisma.customList.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.userId },
      include: {
        items: {
          include: { content: true },
        },
      },
    });

    if (!list) throw new AppError('List not found', 404);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

listsRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const { name } = z.object({ name: z.string().min(1).max(50) }).parse(req.body);
    const list = await prisma.customList.create({
      data: { user_id: req.user!.userId, name },
    });
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
});

listsRouter.post('/:id/items', authenticate, async (req, res, next) => {
  try {
    const { content_id } = z
      .object({ content_id: z.string().uuid() })
      .parse(req.body);

    const list = await prisma.customList.findFirst({
      where: { id: req.params.id as string, user_id: req.user!.userId },
    });
    if (!list) throw new AppError('List not found', 404);

    const item = await prisma.listItem.create({
      data: { list_id: req.params.id as string, content_id },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

listsRouter.delete('/:id/items/:content_id', authenticate, async (req, res, next) => {
  try {
    await prisma.listItem.deleteMany({
      where: {
        list_id: req.params.id as string,
        content_id: req.params.content_id as string,
      },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
