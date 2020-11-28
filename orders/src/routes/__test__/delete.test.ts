import { app } from '../../app';
import mongoose from 'mongoose';
import request from 'supertest';
import { Product } from '../../models/product';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

//it('requireAuth catch unauthorized user',async () => {})
//it('throws error if not found',async () => {})
//it('throws error if another user tries to delete',async () => {})
it('set the order status to cancelled and sends a 204 to user', async () => {
  // create a product with product model
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  });
  await product.save();
  const user = global.signin();

  // make a req to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);
  //make a req to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);
  // expect to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'title',
    price: 20,
  });
  await product.save();
  const user = global.signin();

  // make a req to create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201);
  //make a req to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
