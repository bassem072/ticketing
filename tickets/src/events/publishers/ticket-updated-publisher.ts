import { Publisher, Subjects, TicketUpdatedEvent } from '@bastickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
