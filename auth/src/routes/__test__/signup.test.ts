import request from 'supertest';
import { app } from '../../app';

const postRequest = request(app).post('/api/users/signup');

it('returns a 201 on successful signup', async () => {
  return postRequest
    .send({
      email: 'bassem3@gmail.com',
      password: 'bassem2751959',
    })
    .expect(201);
});

it('returns a 400 with an invalid email', async () => {
  return postRequest
    .send({
      email: 'bassem3gmail.com',
      password: 'bassem2751959',
    })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  return postRequest
    .send({
      email: 'bassem4@gmail.com',
      password: 'b',
    })
    .expect(400);
});

it('returns a 400 with missing email or password', async () => {
  return postRequest
    .send({
      email: 'bassem3@gmail.com',
    })
    .expect(400);
});

it('returns a 400 with missing email or password', async () => {
  return postRequest
    .send({
      password: 'bassem2751959',
    })
    .expect(400);
});

it('returns a 400 with missing email or password', async () => {
  await postRequest
    .send({
      email: 'bassem3@gmail.com',
    })
    .expect(400);

  await postRequest
    .send({
      password: 'bassem2751959',
    })
    .expect(400);
});

it('returns a 400 with missing email and password', async () => {
  return postRequest.send({}).expect(400);
});

it('disallows duplicate emails', async () => {
  await postRequest
    .send({
      email: 'bassem5@gmail.com',
      password: 'bassem2751959',
    })
    .expect(201);

  await postRequest
    .send({
      email: 'bassem5@gmail.com',
      password: 'bassem2751959',
    })
    .expect(400);
});

it('set a cookie after successful signup', async () => {
  const response = await postRequest
    .send({
      email: 'bassem5@gmail.com',
      password: 'bassem2751959',
    })
    .expect(400);

  expect(response.get('Set-Cookie')).toBeDefined();
});
