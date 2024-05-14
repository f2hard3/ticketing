import { Exchanges, PaymentCreatedEvent, Publisher } from "@f2hard3-ticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly exchange = Exchanges.PaymentCreated
}