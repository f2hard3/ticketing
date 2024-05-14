import mongoose from 'mongoose'
import { ConsumeMessage } from 'amqplib'
import { TicketUpdatedEvent } from '@f2hard3-ticketing/common'
import { rabbitmqWrapper } from '../../../rabbitmq-wrapper'
import { Ticket } from '../../../../models/ticket'
import { TicketUpdatedSubscriber } from '../ticket-updated-subscriber'

const setup = async () => {
    const subscriber = new TicketUpdatedSubscriber(rabbitmqWrapper.channel)
    
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 50,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }
    // @ts-ignore
    const msg: ConsumeMessage = { content: 'message' }
    
    return { subscriber, data, msg, channel: rabbitmqWrapper.channel }
}

it('finds, updates and saves a ticket', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    const ticket = await Ticket.findById(data.id)

    expect(ticket!.id).toEqual(data.id)
    expect(ticket!.version).toEqual(data.version)
    expect(ticket!.title).toEqual(data.title)
    expect(ticket!.price).toEqual(data.price)
})

it('acks the message', async () => {
    const { subscriber, data, msg, channel } = await setup()
    await subscriber.onMessage(data, msg, channel)
    
    expect(channel.ack).toHaveBeenCalledTimes(1)
    expect(channel.ack).toHaveBeenCalledWith(msg)
})

it('does not call ack if the event has a skipped version number', async () => {
    const { subscriber, data, msg, channel } = await setup()
    try {
        await subscriber.onMessage({ ...data, version: data.version + 1 }, msg, channel)
    } catch(_err) {}
    
    expect(channel.ack).not.toHaveBeenCalled()
})