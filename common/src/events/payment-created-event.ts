import { Exchanges } from './exchanges';

export interface PaymentCreatedEvent {
    exchange: Exchanges.PaymentCreated
    data: {
        id: string
        orderId: string
        stripeId: string        
    }
}