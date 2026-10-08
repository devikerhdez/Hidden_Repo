import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function generateTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' } as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' } as jwt.SignOptions
  );
  return { accessToken, refreshToken };
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { username: body.username }] },
    });

    if (exists) {
      throw new AppError(
        exists.email === body.email
          ? 'Email already registered'
          : 'Username already taken',
        409
      );
    }

    const password_hash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        username: body.username,
        password_hash,
      },
    });

    const tokens = generateTokens(user.id, user.email);

    res.status(201).json({
      user: { id: user.id, email: user.email, username: user.username },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(body.password, user.password_hash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const tokens = generateTokens(user.id, user.email);

    res.json({
      user: { id: user.id, email: user.email, username: user.username },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) throw new AppError('User not found', 404);

    const tokens = generateTokens(user.id, user.email);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
});
