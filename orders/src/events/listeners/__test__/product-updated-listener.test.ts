import { ProductUpdatedListener } from '../product-updated-listener';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wrapper';
import { Product } from '../../../models/product';
import mongoose from 'mongoose';
import { ProductUpdatedEvent } from '@kirderfovane_sharedlibrary/oldish_common';

const setup = async () => {
  // Create a listener
  const listener = new ProductUpdatedListener(natsWrapper.client);
  // Create and save a product
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await product.save();
  // Create a fake data object
  const data: ProductUpdatedEvent['data'] = {
    id: product.id,
    version: product.version + 1,
    title: 'test',
    price: 40,
    userId: 'abc',
  };
  // Create a fake msg object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  // return all of this stuff
  return { msg, data, product, listener };
};

it('fins,updates and saves a product', async () => {
  const { msg, data, product, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedProduct = await Product.findById(product.id);

  expect(updatedProduct!.title).toEqual(data.title);
  expect(updatedProduct!.price).toEqual(data.price);
  expect(updatedProduct!.version).toEqual(data.version);
});
it('acks the message', async () => {
  const { msg, data, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('tests Optimistic Concurrency Control, does not call ack if the event version is too high', async () => {
  const { msg, data, listener, product } = await setup();

  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
