import { OrderCancelledEvent, OrderStatus } from '@f2hard3-ticketing/common'
import mongoose from 'mongoose'
import { ConsumeMessage } from 'amqplib'
import { rabbitmqWrapper } from '../../../rabbitmq-wrapper'
import { Order } from '../../../models/order'
import { OrderCancelledSubscriber } from '../order-cancelled-subscriber'

const setup = async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Created,
    })
    await order.save()

    const subscriber = new OrderCancelledSubscriber(rabbitmqWrapper.channel)
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
        }
    }
    // @ts-ignore
    const msg: ConsumeMessage = { content: 'message' }
    
    return { subscriber, data, msg, channel: rabbitmqWrapper.channel }
}

it('updates the status of the order', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    const order = await Order.findById(data.id)
    
    expect(order!.id).toEqual(data.id)    
    expect(order!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    expect(channel.ack).toHaveBeenCalledTimes(1)
    expect(channel.ack).toHaveBeenCalledWith(msg)
})