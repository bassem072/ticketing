import request from 'supertest';
import { app } from '../../app';

it('Email does not exist', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'nonexistent@example.com',
      password: 'somepassword',
    })
    .expect(400);
});

it('Wrong password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'bassem3@gmail.com',
      password: 'correctpassword',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'bassem3@gmail.com',
      password: 'wrongpassword',
    })
    .expect(400);
});

it('Login successfully', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'bassem3@gmail.com',
      password: 'correctpassword',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'bassem3@gmail.com',
      password: 'correctpassword',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
