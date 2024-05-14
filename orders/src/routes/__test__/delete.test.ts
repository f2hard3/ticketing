import request from 'supertest'
import { Ticket } from "../../../models/ticket"
import { app } from '../../app'
import { OrderStatus } from '@f2hard3-ticketing/common'
import { rabbitmqWrapper } from '../../rabbitmq-wrapper'
import mongoose from 'mongoose'

it('marks an order as cancelled', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const userOneCookie = getCookie()
    const { body: order } = await request(app)
                                    .post('/api/orders')
                                    .set('Cookie', userOneCookie)
                                    .send({ ticketId: ticket.id })
                                    .expect(201)
    await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', userOneCookie)
            .send()
            .expect(204)
    const { body: updatedOrder } = await request(app)
                                    .get(`/api/orders/${order.id}`)
                                    .set('Cookie', userOneCookie)
                                    .send({ ticketId: ticket.id })
                                    .expect(200)
    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled)
})

it('returns an error if one user tries to delete another users order', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const userCookie = getCookie()
    const { body: order } = await request(app)
                                    .post('/api/orders')
                                    .set('Cookie', userCookie)
                                    .send({ ticketId: ticket.id })
                                    .expect(201)
    await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', getCookie())
            .send()
            .expect(401)
})

it('emits a order cancelled event', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const userOneCookie = getCookie()
    const { body: order } = await request(app)
                                    .post('/api/orders')
                                    .set('Cookie', userOneCookie)
                                    .send({ ticketId: ticket.id })
                                    .expect(201)
    await request(app)
            .delete(`/api/orders/${order.id}`)
            .set('Cookie', userOneCookie)
            .send()
            .expect(204)

    expect(rabbitmqWrapper.channel.publish).toHaveBeenCalled()
})