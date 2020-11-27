import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@kirderfovane_sharedlibrary/oldish_common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
