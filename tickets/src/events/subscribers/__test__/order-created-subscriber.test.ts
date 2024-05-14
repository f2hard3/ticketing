import { OrderCreatedEvent, OrderStatus } from '@f2hard3-ticketing/common'
import { rabbitmqWrapper } from '../../../rabbitmq-wrapper'
import mongoose from 'mongoose'
import { ConsumeMessage } from 'amqplib'
import { OrderCreatedSubscriber } from '../order-created-subscriber'
import { Ticket } from '../../../models/ticket'

const setup = async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    await ticket.save()

    const subscriber = new OrderCreatedSubscriber(rabbitmqWrapper.channel)
    const data: OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: new mongoose.Types.ObjectId().toHexString(),
        expiresAt: '2025-10-25',
        ticket: {
            id: ticket.id,
            price: ticket.price
        }
    }
    // @ts-ignore
    const msg: ConsumeMessage = { content: 'message' }
    
    return { subscriber, data, msg, channel: rabbitmqWrapper.channel }
}

it('sets the orderId of the ticket', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    const ticket = await Ticket.findById(data.ticket.id)
    
    expect(ticket).toBeDefined()
    expect(ticket!.id).toEqual(data.ticket.id)    
    expect(ticket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    expect(channel.ack).toHaveBeenCalledTimes(1)
    expect(channel.ack).toHaveBeenCalledWith(msg)
})

it('publishes a ticket updated event', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    expect(channel.publish).toHaveBeenCalled()
    
    const ticketUpdatedData = JSON.parse(((channel.publish as jest.Mock).mock.calls[0][2]).toString())
    expect(data.id).toEqual(ticketUpdatedData.orderId)
})