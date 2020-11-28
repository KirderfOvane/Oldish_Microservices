import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@kirderfovane_sharedlibrary/oldish_common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Product } from '../../models/products';
import { ProductUpdatedPublisher } from '../publishers/product-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const product = await Product.findById(data.product.id);

    if (!product) {
      throw new Error('product not found');
    }

    product.set({ orderId: undefined });
    await product.save();
    await new ProductUpdatedPublisher(this.client).publish({
      id: product.id,
      orderId: product.orderId,
      userId: product.userId,
      price: product.price,
      title: product.title,
      version: product.version,
    });

    msg.ack();
  }
}
