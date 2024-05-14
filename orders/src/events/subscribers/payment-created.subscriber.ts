import { Exchanges, OrderStatus, PaymentCreatedEvent, Subscriber } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { Order } from '../../../models/order';

export class PaymentCreatedSubscriber extends Subscriber<PaymentCreatedEvent> {
    readonly exchange = Exchanges.PaymentCreated

    async onMessage(data: PaymentCreatedEvent['data'], msg: ConsumeMessage, channel: Channel) {
        const order = await Order.findById(data.orderId)
        if (!order) throw Error('Order not found')
        
        order.set({ status: OrderStatus.Complete })
        await order.save()

        channel.ack(msg)
    }
}