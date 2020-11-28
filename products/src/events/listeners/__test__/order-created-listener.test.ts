import { OrderCreatedListener } from '../order-created-listener';
import { Message } from 'node-nats-streaming';
import {
  OrderCreatedEvent,
  OrderStatus,
} from '@kirderfovane_sharedlibrary/oldish_common';
import { natsWrapper } from '../../../nats-wrapper';
import { Product } from '../../../models/products';
import mongoose from 'mongoose';

const setup = async () => {
  // Create an instane of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a product
  const product = Product.build({
    title: 'concert',
    price: 99,
    userId: 'asdf',
  });
  await product.save();

  // create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asf',
    expiresAt: 'asdasd',
    product: {
      id: product.id,
      price: product.price,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, product, data, msg };
};

it('sets the userId of the product', async () => {
  const { listener, product, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedproduct = await Product.findById(product.id);

  expect(updatedproduct!.orderId).toEqual(data.id);
});
it('acks the message', async () => {
  const { listener, product, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a product updated event', async () => {
  const { listener, product, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const productUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(productUpdatedData.orderId);
});
