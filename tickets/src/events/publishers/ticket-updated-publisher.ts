import { Exchanges, Publisher, TicketUpdatedEvent } from "@f2hard3-ticketing/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly exchange = Exchanges.TicketUpdated
}
