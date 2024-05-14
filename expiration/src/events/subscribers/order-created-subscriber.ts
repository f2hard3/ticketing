import { Exchanges, OrderCreatedEvent, Subscriber } from '@f2hard3-ticketing/common'
import { Channel, ConsumeMessage } from 'amqplib';
import { expirationQueue } from '../../queue/expiration-queue';


export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
    readonly exchange = Exchanges.OrderCreated

    async onMessage(data: OrderCreatedEvent['data'], msg: ConsumeMessage, channel: Channel) {        
        const { id, expiresAt } = data
        const delay = new Date(expiresAt).getTime() - new Date().getTime()

        await expirationQueue.add({ orderId: id }, { delay })
        
        channel.ack(msg)
    }
}