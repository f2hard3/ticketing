import { Exchanges, Publisher, TicketCreatedEvent } from "@f2hard3-ticketing/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly exchange = Exchanges.TicketCreated
}