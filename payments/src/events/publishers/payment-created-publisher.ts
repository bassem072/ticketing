import { PaymentCreatedEvent, Publisher, Subjects } from '@bastickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
