import { Exchanges } from "./exchanges";
export interface TicketCreatedEvent {
    exchange: Exchanges.TicketCreated;
    data: {
        id: string;
        version: number;
        title: string;
        price: number;
        userId: string;
    };
}
