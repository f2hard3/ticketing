import { Exchanges } from "./exchanges";

export interface OrderCancelledEvent {
    exchange: Exchanges.OrderCancelled
    data: {
        id: string
        version: number
        ticket: {
            id: string
        }
    }
}