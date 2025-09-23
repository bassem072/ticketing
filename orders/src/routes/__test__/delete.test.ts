import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@bastickets/common';
import { natsWrapper } from '../../nats-wrapper';

const buildTicket = async () => {
  const ticket = Ticket.build({
    title: 'Concert',
    price: 120,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  return ticket;
};

it('returns error if the order is not found', async () => {
  const orderId = new mongoose.Types.ObjectId();
  const userOne = signup();

  await request(app)
    .delete('/api/orders/' + orderId)
    .set('Cookie', userOne)
    .send()
    .expect(404);
});

it('returns error if one user tries to delete another users order', async () => {
  const ticketOne = await buildTicket();

  const userOne = signup();
  const userTwo = signup();

  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .delete('/api/orders/' + orderOne.id)
    .set('Cookie', userTwo)
    .send()
    .expect(401);
});

it('delete order for an particular user', async () => {
  const ticketOne = await buildTicket();

  const userOne = signup();

  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .delete('/api/orders/' + orderOne.id)
    .set('Cookie', userOne)
    .send()
    .expect(204);

  const response = await request(app)
    .get('/api/orders/' + orderOne.id)
    .set('Cookie', userOne)
    .send()
    .expect(200);

  expect(response.body.status).toEqual(OrderStatus.Cancelled);
  expect(orderOne.status).toEqual(OrderStatus.Created);
});

it('emits an order cancelled event', async () => {
  const ticketOne = await buildTicket();

  const userOne = signup();

  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  await request(app)
    .delete('/api/orders/' + orderOne.id)
    .set('Cookie', userOne)
    .send()
    .expect(204);

  const response = await request(app)
    .get('/api/orders/' + orderOne.id)
    .set('Cookie', userOne)
    .send()
    .expect(200);

  expect(response.body.status).toEqual(OrderStatus.Cancelled);
  expect(orderOne.status).toEqual(OrderStatus.Created);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
