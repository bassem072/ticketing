import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../model/order';
import { OrderStatus } from '@bastickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../model/payment';

it('returns 400 if user not signed in', async () => {
  await request(app).post('/api/payments').send().expect(401);
});

it('returns 400 if token or orderId not provided', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signup())
    .send()
    .expect(400);
});

it('returns 404 if order not found', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signup())
    .send({
      token: '1f35w',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns 401 if user does not have this order', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 15,
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signup())
    .send({
      token: '1f35w',
      orderId: order.id,
    })
    .expect(401);
});

it('returns 400 if the order is cancelled', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price: 15,
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  order.set({ status: OrderStatus.Cancelled });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signup(order.userId))
    .send({
      token: '1f35w',
      orderId: order.id,
    })
    .expect(400);
});

it('returns 201 with valid inputs', async () => {
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    price,
    status: OrderStatus.Created,
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signup(order.userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const charges = await stripe.charges.list({
    limit: 10,
  });

  const stripeCharge = charges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
