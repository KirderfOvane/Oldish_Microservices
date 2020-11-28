import {
  Publisher,
  Subjects,
  ProductUpdatedEvent,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
  readonly subject = Subjects.ProductUpdated;
}
