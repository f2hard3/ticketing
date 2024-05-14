import { Exchanges, Subscriber, TicketCreatedEvent } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { Ticket } from '../../../models/ticket';

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
    readonly exchange = Exchanges.TicketCreated

    async onMessage(data: TicketCreatedEvent['data'], msg: ConsumeMessage, channel: Channel) {
        const { id, title, price } = data
        const ticket = Ticket.build({ id, title, price })
        await ticket.save()

        channel.ack(msg)
    }

}