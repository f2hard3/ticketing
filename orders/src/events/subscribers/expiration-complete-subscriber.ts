import { Exchanges, ExpirationCompleteEvent, OrderStatus, Subscriber, TicketUpdatedEvent } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib'
import { Order } from '../../../models/order'
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher'

export class ExpirationCompleteSubscriber extends Subscriber<ExpirationCompleteEvent> {
    readonly exchange = Exchanges.ExpirationComplete

    async onMessage(data: ExpirationCompleteEvent['data'], msg: ConsumeMessage, channel: Channel) {        
        const order = await Order.findById(data.orderId).populate('ticket')   
        if (!order) throw new Error('Order not found')

        if (order.status === OrderStatus.Complete) 
            return channel.ack(msg)
        
        order.set({ status: OrderStatus.Cancelled })
        await order.save()       

        await new OrderCancelledPublisher(this.channel).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        channel.ack(msg)
    }
}