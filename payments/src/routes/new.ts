import {
  AuthRequired,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  ValidationRequest,
} from '@bastickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../model/order';
import { stripe } from '../stripe';
import { Payment } from '../model/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  AuthRequired,
  [
    body('token').notEmpty().withMessage('Token must be provided'),
    body('orderId').notEmpty().withMessage('OrderId must be provided'),
  ],
  ValidationRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: 'usd',
      source: token,
    });

    const payment = Payment.build({
      orderId: order.id,
      stripeId: charge.id,
    });
    await payment.save();

    new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: order.id,
      stripeId: charge.id,
    });

    res.status(201).json({ payment });
  }
);

export { router as createChargeRouter };
