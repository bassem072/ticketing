import { OrderCreatedEvent, Publisher, Subjects } from '@bastickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
