import { Publisher, Subjects, TicketCreatedEvent } from '@bastickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
