import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Ticket } from '../../../models/ticket'
import { Order, OrderStatus } from '../../../models/order'
import { rabbitmqWrapper } from '../../rabbitmq-wrapper'

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId()

    await request(app)
        .post('/api/orders')
        .set('Cookie', getCookie())
        .send({ ticketId })
        .expect(404)
})

it('returns an error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 100
    })
    await ticket.save()

    const order = Order.build({
        userId: 'userId',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    await request(app)
        .post('/api/orders')
        .set('Cookie', getCookie())
        .send({ ticketId: ticket.id })
        .expect(400)
})

it('reserves a ticket', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 100
    })
    await ticket.save()
    
    await request(app)
            .post('/api/orders')
            .set('Cookie', getCookie())
            .send({ ticketId: ticket.id })
            .expect(201)
})

it('emits an order created event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 100
    })
    await ticket.save()
    
    await request(app)
            .post('/api/orders')
            .set('Cookie', getCookie())
            .send({ ticketId: ticket.id })
            .expect(201)

    expect(rabbitmqWrapper.channel.publish).toHaveBeenCalled()
})