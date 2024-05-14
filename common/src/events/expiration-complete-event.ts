import { Exchanges } from './exchanges';

export interface ExpirationCompleteEvent {
    exchange: Exchanges.ExpirationComplete
    data: {
        orderId: string        
    }
}