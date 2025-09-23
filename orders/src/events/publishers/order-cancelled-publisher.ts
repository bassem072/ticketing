import { OrderCancelledEvent, Publisher, Subjects } from '@bastickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
