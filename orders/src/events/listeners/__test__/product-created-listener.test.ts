import { ProductCreatedEvent } from '@kirderfovane_sharedlibrary/oldish_common';
import { ProductCreatedListener } from '../product-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { Product } from '../../../models/product';

const setup = async () => {
  // Create an instance of the listener
  const listener = new ProductCreatedListener(natsWrapper.client);
  // Create a fake data event
  const data: ProductCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    title: 'title',
    price: 25,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a product', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage fucntion with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure a product was created!
  const product = await Product.findById(data.id);

  expect(product).toBeDefined();
  expect(product!.title).toEqual(data.title);
  expect(product!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();
  // call the onMessage fucntion with the data object + message object
  await listener.onMessage(data, msg);
  // write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
