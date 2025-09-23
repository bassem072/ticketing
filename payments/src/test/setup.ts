import jwt from 'jsonwebtoken';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

declare global {
  var signup: (id?: string) => string[];
}

jest.mock('../nats-wrapper.ts');
// jest.mock('../stripe.ts');

process.env.STRIPE_KEY =
  'sk_test_51S9vOL22QDJfpxguuyqLYgoJRujLW7w736htrgc3ZjFQSQUKe0p0Pc4VMs6bBAxcVp5pYD1A2ireFDsowH5cBL2G00zUAiaxO1';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'bassem';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signup = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'bassem@gmail.com',
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
};
