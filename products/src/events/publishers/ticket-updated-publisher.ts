import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
