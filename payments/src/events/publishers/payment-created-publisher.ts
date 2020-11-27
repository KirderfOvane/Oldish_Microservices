import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
