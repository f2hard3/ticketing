import { OrderCancelledEvent, OrderCreatedEvent, OrderStatus } from '@f2hard3-ticketing/common'
import { rabbitmqWrapper } from '../../../rabbitmq-wrapper'
import mongoose from 'mongoose'
import { ConsumeMessage } from 'amqplib'
import { Ticket } from '../../../models/ticket'
import { OrderCancelledSubscriber } from '../order-cancelled-subscriber'

const setup = async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    })
    ticket.set({ orderId })
    await ticket.save()

    const subscriber = new OrderCancelledSubscriber(rabbitmqWrapper.channel)
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 1,
        ticket: { id: ticket.id }
    }
    // @ts-ignore
    const msg: ConsumeMessage = { content: 'message' }
    
    return { subscriber, data, msg, channel: rabbitmqWrapper.channel }
}

it('sets the orderId of the ticket to be undefined', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    const ticket = await Ticket.findById(data.ticket.id)
    
    expect(ticket).toBeDefined()
    expect(ticket!.id).toEqual(data.ticket.id)    
    expect(ticket!.orderId).toBeUndefined()
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
    expect(ticketUpdatedData.orderId).toBeUndefined()
})