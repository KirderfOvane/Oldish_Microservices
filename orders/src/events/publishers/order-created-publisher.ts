import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
