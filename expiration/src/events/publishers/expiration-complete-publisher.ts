import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@bastickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
