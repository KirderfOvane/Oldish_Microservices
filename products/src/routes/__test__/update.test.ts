import request from 'supertest';
import { app } from '../../app';
import { Product } from '../../models/products';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/products/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'asdf', price: 20 })
    .expect(404);
});
it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/products/${id}`)
    .send({ title: 'asdf', price: 20 })
    .expect(401);
});
it('returns a 401 if the user does not own the product', async () => {
  const response = await request(app)
    .post('/api/products')
    .set('Cookie', global.signin())
    .send({ title: 'asfd', price: 20 });

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'sadasd',
      price: 20,
    })
    .expect(401);
});
it('returns a 400 if the user provides an invalid title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({ title: 'asfd', price: 10 });

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'valid',
      price: -20,
    })
    .expect(400);
});
it('updates the product and provides valid input', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({ title: 'asfd', price: 10 });

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'valid', price: 20 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/products/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('valid');
  expect(ticketResponse.body.price).toEqual(20);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({ title: 'asfd', price: 10 });

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'valid', price: 20 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the product is reserved', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post('/api/products')
    .set('Cookie', cookie)
    .send({ title: 'asfd', price: 10 });

  const product = await Product.findById(response.body.id);
  product!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await product!.save();

  await request(app)
    .put(`/api/products/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'valid', price: 20 })
    .expect(400);
});
