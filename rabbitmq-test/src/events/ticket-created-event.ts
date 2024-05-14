import { Exchanges } from "./exchanges";

export interface TicketCreatedEvent {
    exchange: Exchanges.TicketCreated
    data: {
        id: string
        title: string
        price: number
        userId: string
    }
}