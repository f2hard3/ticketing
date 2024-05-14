import { Exchanges, Subscriber, TicketUpdatedEvent } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { Ticket } from '../../../models/ticket';

export class TicketUpdatedSubscriber extends Subscriber<TicketUpdatedEvent> {
    readonly exchange = Exchanges.TicketUpdated

    async onMessage(data: TicketUpdatedEvent['data'], msg: ConsumeMessage, channel: Channel) {
        const { id, version, title, price } = data
        const ticket = await Ticket.findByEvent({ id, version })        
        if (!ticket) throw new Error('Ticket not found')
        
        ticket.set({ title, price })
        await ticket.save()

        channel.ack(msg)
    }
}