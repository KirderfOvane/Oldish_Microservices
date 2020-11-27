import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
