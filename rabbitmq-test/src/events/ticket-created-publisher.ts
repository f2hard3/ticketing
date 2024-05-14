import { Publisher } from "./base-publisher";
import { Exchanges } from "./exchanges";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly exchange = Exchanges.TicketCreated;    
}