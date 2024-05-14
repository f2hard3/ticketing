import { Exchanges, OrderCancelledEvent, Subscriber } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';


export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
    readonly exchange = Exchanges.OrderCancelled

    async onMessage(data: OrderCancelledEvent['data'], msg: ConsumeMessage, channel: Channel) {
        const ticket = await Ticket.findById(data.ticket.id)
        if (!ticket) throw Error('Ticket not found')

        ticket.set({ orderId: undefined })
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