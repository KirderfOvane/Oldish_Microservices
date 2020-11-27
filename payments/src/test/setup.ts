import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
  'sk_test_51HqhpFBNnPSPvHVdhxsekEoWclg7o1Jf5AcEj3zdDUQmEdNPn7b169XD5v9PubRvYp1wuZHRI5KYQRpSzSfivKxz00t0Kiymp8';

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // build a jwt payload
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  // create the jwt
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build session object
  const session = { jwt: token };
  //turn that session into json
  const sessionJSON = JSON.stringify(session);
  //take json and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');
  //return a string that is the cookie
  return [`express:sess=${base64}`];
};
