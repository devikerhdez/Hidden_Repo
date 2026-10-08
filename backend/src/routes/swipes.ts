import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

export const swipesRouter = Router();

const swipeSchema = z.object({
  content_id: z.string().uuid(),
  action: z.enum(['skip', 'seen', 'saved']),
});

swipesRouter.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { content_id, action } = swipeSchema.parse(req.body);

    const existing = await prisma.userSwipe.findUnique({
      where: { user_id_content_id: { user_id: userId, content_id } },
    });

    if (existing) {
      throw new AppError('Already swiped on this content', 409);
    }

    const swipe = await prisma.userSwipe.create({
      data: { user_id: userId, content_id, action },
    });

    if (action === 'seen') {
      await prisma.contentItem.update({
        where: { id: content_id },
        data: { seen_count: { increment: 1 } },
      });

      const defaultList = await prisma.customList.upsert({
        where: {
          id: (
            await prisma.customList.findFirst({
              where: { user_id: userId, name: 'Visto / Jugado', is_default: true },
            })
          )?.id ?? '00000000-0000-0000-0000-000000000000',
        },
        update: {},
        create: {
          user_id: userId,
          name: 'Visto / Jugado',
          is_default: true,
        },
      });

      await prisma.listItem.upsert({
        where: {
          list_id_content_id: { list_id: defaultList.id, content_id },
        },
        update: {},
        create: { list_id: defaultList.id, content_id },
      });
    }

    if (action === 'saved') {
      await prisma.contentItem.update({
        where: { id: content_id },
        data: { saves_count: { increment: 1 } },
      });

      const pendientesList = await prisma.customList.upsert({
        where: {
          id: (
            await prisma.customList.findFirst({
              where: { user_id: userId, name: 'Pendientes', is_default: true },
            })
          )?.id ?? '00000000-0000-0000-0000-000000000000',
        },
        update: {},
        create: {
          user_id: userId,
          name: 'Pendientes',
          is_default: true,
        },
      });

      await prisma.listItem.upsert({
        where: {
          list_id_content_id: { list_id: pendientesList.id, content_id },
        },
        update: {},
        create: { list_id: pendientesList.id, content_id },
      });
    }

    res.status(201).json(swipe);
  } catch (err) {
    next(err);
  }
});
