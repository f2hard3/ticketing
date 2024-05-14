import mongoose from 'mongoose'
import { ConsumeMessage } from 'amqplib'
import { ExpirationCompleteEvent, OrderStatus, TicketUpdatedEvent } from '@f2hard3-ticketing/common'
import { rabbitmqWrapper } from '../../../rabbitmq-wrapper'
import { Ticket } from '../../../../models/ticket'
import { Order } from '../../../../models/order'
import { ExpirationCompleteSubscriber } from '../expiration-complete-subscriber'

const setup = async () => {
    const subscriber = new ExpirationCompleteSubscriber(rabbitmqWrapper.channel)
    
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const order = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    }
    // @ts-ignore
    const msg: ConsumeMessage = { content: 'message' }
    
    return { subscriber, data, msg, channel: rabbitmqWrapper.channel }
}

it('updates the order status to cancelled', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    const order = await Order.findById(data.orderId)

    expect(order!.id).toEqual(data.orderId)
    expect(order!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an orderCancelled event', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    expect(channel.publish).toHaveBeenCalledTimes(1)

    const publishedData = JSON.parse(((channel.publish as jest.Mock).mock.calls[0][2]).toString())
    expect(publishedData.id).toEqual(data.orderId)
})

it('acks the message', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    expect(channel.ack).toHaveBeenCalledTimes(1)
    expect(channel.ack).toHaveBeenCalledWith(msg)
})