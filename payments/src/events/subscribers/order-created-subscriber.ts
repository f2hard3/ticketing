import { Exchanges, OrderCreatedEvent, Subscriber } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { Order } from '../../models/order';


export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
    readonly exchange = Exchanges.OrderCreated

    async onMessage(data: OrderCreatedEvent['data'], msg: ConsumeMessage, channel: Channel) {
        const { id, version, userId, status, ticket } = data
        const order = Order.build({ id, version, userId, price: ticket.price, status })
        await order.save()

        channel.ack(msg)
    }
}