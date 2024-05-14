import client from 'amqplib'
import { Subscriber } from "./base-subscriber"
import { TicketCreatedEvent } from './ticket-created-event'
import { Exchanges } from './exchanges'

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
    readonly exchange = Exchanges.TicketCreated
    queue = 'payments-service'
    
    onMessage(data: TicketCreatedEvent['data'], msg: client.ConsumeMessage): void {
        console.log('Event data:', data)

        this.channel.ack(msg)
    }    
}