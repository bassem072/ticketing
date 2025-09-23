import request from 'supertest';
import { app } from '../../app';

const createTicket = async (title: string, price: number) => {
  return await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title,
      price,
    });
};

it('can fetch a list of tickets', async () => {
  await createTicket('paris', 15.5);
  await createTicket('cairo', 9);
  await createTicket('alex', 54);
  await createTicket('usa', 1.5);
  await createTicket('gaza', 1800);
  await createTicket('germany', 160);

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(6);
});
