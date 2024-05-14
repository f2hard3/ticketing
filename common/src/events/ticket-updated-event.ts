import { Exchanges } from "./exchanges";

export interface TicketUpdatedEvent {
    exchange: Exchanges.TicketUpdated
    data: {
        id: string
        version: number
        title: string
        price: number
        userId: string
        orderId?: string
    }
}