import { Exchanges, OrderCreatedEvent, Subscriber } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';


export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
    readonly exchange = Exchanges.OrderCreated

    async onMessage(data: OrderCreatedEvent['data'], msg: ConsumeMessage, channel: Channel) {
        const ticket = await Ticket.findById(data.ticket.id)
        if (!ticket) throw Error('Ticket not found')

        ticket.set({ orderId: data.id })
        await ticket.save()

        await new TicketUpdatedPublisher(this.channel).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId
        })

        channel.ack(msg)
    }
}