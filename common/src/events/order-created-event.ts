import { Exchanges } from "./exchanges";
import { OrderStatus } from "./types/order-status";

export interface OrderCreatedEvent {
    exchange: Exchanges.OrderCreated
    data: {
        id: string
        version: number
        status: OrderStatus
        userId: string
        expiresAt: string
        ticket: {
            id: string
            price: number
        }
    }
}