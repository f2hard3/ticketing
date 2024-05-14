import { OrderCreatedEvent, OrderStatus } from '@f2hard3-ticketing/common'
import mongoose from 'mongoose'
import { ConsumeMessage } from 'amqplib'
import { OrderCreatedSubscriber } from '../order-created-subscriber'
import { rabbitmqWrapper } from '../../../rabbitmq-wrapper'
import { Order } from '../../../models/order'

const setup = async () => {
    const subscriber = new OrderCreatedSubscriber(rabbitmqWrapper.channel)
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: '2025-10-25',
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 200
        }
    }
    // @ts-ignore
    const msg: ConsumeMessage = { content: 'message' }
    
    return { subscriber, data, msg, channel: rabbitmqWrapper.channel }
}

it('replicates the order info', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    const order = await Order.findById(data.id)
    
    expect(order).toBeDefined()
    expect(order!.id).toEqual(data.id)    
    expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    expect(channel.ack).toHaveBeenCalledTimes(1)
    expect(channel.ack).toHaveBeenCalledWith(msg)
})