import request from 'supertest';
import { app } from '../../app';

it('Current user', async () => {
  const signupCookies = await signup();

  const response = await request(app)
    .get('/api/users/current-user')
    .set('Cookie', signupCookies)
    .send({})
    .expect(200);

  expect(response.body.currentUser.email).toEqual('bassem@gmail.com');
});

it('No user', async () => {
  const response = await request(app)
    .get('/api/users/current-user')
    .send({})
    .expect(200);

  expect(response.body.currentUser).toBeNull();
});
