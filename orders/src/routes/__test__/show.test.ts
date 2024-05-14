import request from 'supertest'
import { Ticket } from "../../../models/ticket"
import { app } from '../../app'
import mongoose from 'mongoose'

it('fetches the order', async () => {
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
    const { body: fetchedOrder } = await request(app)
                            .get(`/api/orders/${order.id}`)
                            .set('Cookie', userOneCookie)
                            .send()
                            .expect(200)
    expect(fetchedOrder.id).toEqual(order.id)
    expect(fetchedOrder.ticket.id).toEqual(ticket.id)
})

it('returns an error if one user tries to fetch another users order', async () => {
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
            .get(`/api/orders/${order.id}`)
            .set('Cookie', getCookie())
            .send()
            .expect(401)
})