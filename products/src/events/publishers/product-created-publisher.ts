import {
  Publisher,
  Subjects,
  ProductCreatedEvent,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
  readonly subject = Subjects.ProductCreated;
}
