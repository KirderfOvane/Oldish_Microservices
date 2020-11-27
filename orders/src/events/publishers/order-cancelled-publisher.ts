import {
  Subjects,
  Publisher,
  OrderCancelledEvent,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
