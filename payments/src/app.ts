import express from 'express';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, CurrentUser } from '@bastickets/common';
import cookieSession from 'cookie-session';
import { createChargeRouter } from './routes/new';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(CurrentUser);

app.use(createChargeRouter);

app.all('{*splat}', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
