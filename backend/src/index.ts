import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { feedRouter } from './routes/feed';
import { swipesRouter } from './routes/swipes';
import { ratingsRouter } from './routes/ratings';
import { listsRouter } from './routes/lists';
import { contentRouter } from './routes/content';
import { filtersRouter } from './routes/filters';
import { coinsRouter } from './routes/coins';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/feed', feedRouter);
app.use('/swipes', swipesRouter);
app.use('/ratings', ratingsRouter);
app.use('/lists', listsRouter);
app.use('/content', contentRouter);
app.use('/filters', filtersRouter);
app.use('/coins', coinsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Hidden API running on port ${PORT}`);
});

export default app;
