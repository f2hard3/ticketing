import { Exchanges, OrderCancelledEvent, OrderStatus, Subscriber } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { Order } from '../../models/order';


export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
    readonly exchange = Exchanges.OrderCancelled

    async onMessage(data: OrderCancelledEvent['data'], msg: ConsumeMessage, channel: Channel) {
        const order = await Order.findByEvent({
            id: data.id,
            version: data.version
        })
        if (!order) throw Error('Order not found')

        order.set({ status: OrderStatus.Cancelled })
        await order.save()

        channel.ack(msg)
    }
}