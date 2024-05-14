import { TicketCreatedEvent } from '@f2hard3-ticketing/common'
import { rabbitmqWrapper } from '../../../rabbitmq-wrapper'
import { TicketCreatedSubscriber } from '../ticket-created-subscriber'
import mongoose from 'mongoose'
import { ConsumeMessage } from 'amqplib'
import { Ticket } from '../../../../models/ticket'

const setup = async () => {
    const subscriber = new TicketCreatedSubscriber(rabbitmqWrapper.channel)
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }
    // @ts-ignore
    const msg: ConsumeMessage = { content: 'message' }
    
    return { subscriber, data, msg, channel: rabbitmqWrapper.channel }
}

it('creates and saves a ticket', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    const ticket = await Ticket.findById(data.id)
    
    expect(ticket).toBeDefined()
    expect(ticket!.id).toEqual(data.id)    
    expect(ticket!.price).toEqual(data.price)
    expect(ticket!.title).toEqual(data.title)
})

it('acks the message', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    expect(channel.ack).toHaveBeenCalledTimes(1)
    expect(channel.ack).toHaveBeenCalledWith(msg)
})