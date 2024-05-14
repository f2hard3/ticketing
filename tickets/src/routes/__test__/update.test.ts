import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { rabbitmqWrapper } from '../../rabbitmq-wrapper'
import { Ticket } from '../../models/ticket'

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
            .put(`/api/tickets/${id}`)
            .set('Cookie', global.getCookie())
            .send({ title: 'title', price: 20 })
            .expect(404)    
})

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    await request(app)
            .put(`/api/tickets/${id}`)
            .send({ title: 'title', price: 20 })
            .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app)
                        .post('/api/tickets')
                        .set('Cookie', global.getCookie())
                        .send({ title: 'title', price: 10_000 })
    
    await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', global.getCookie())
            .send({ title: 'titleUpdated', price: 100_000 })
            .expect(401)
})

it('returns a 400 if the user provide an invalid title or price', async () => {
    const cookie = global.getCookie()

    const response = await request(app)
                        .post('/api/tickets')
                        .set('Cookie', cookie)
                        .send({ title: 'title', price: 10_000 })
    
    await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', cookie)
            .send({ title: '', price: 100_000 })
            .expect(400)

    await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', cookie)
            .send({ title: 'titleToUpdate', price: -100 })
            .expect(400)
})


it('updates the ticket provided valid inputs', async () => {
    const cookie = global.getCookie()

    const response = await request(app)
                        .post('/api/tickets')
                        .set('Cookie', cookie)
                        .send({ title: 'title', price: 10_000 })
    
    const [title, price] = ['new title', 100_000]
    await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(200)

    const getResponse = await request(app)
                                .get(`/api/tickets/${response.body.id}`)
                                .send()
                                .expect(200)
    expect(getResponse.body.title).toEqual(title)
    expect(getResponse.body.price).toEqual(price)
})

it('publishes an event', async () => {
    const cookie = global.getCookie()
    const response = await request(app)
                            .post('/api/tickets')
                            .set('Cookie', cookie)
                            .send({ title: 'title', price: 10_000 })
    const [title, price] = ['new title', 100_000]
    await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie', cookie)
            .send({ title, price })
            .expect(200)
    
            expect(rabbitmqWrapper.channel.publish).toHaveBeenCalled()
})

it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.getCookie()
    const response = await request(app)
                              .post('/api/tickets')
                              .set('Cookie', cookie)
                              .send({ title: 'title', price: 10_000 })
    
    const ticket = await Ticket.findById(response.body.id)
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
    await ticket!.save()

    const [title, price] = ['new title', 100_000]
    await request(app)
              .put(`/api/tickets/${response.body.id}`)
              .set('Cookie', cookie)
              .send({ title, price })
              .expect(400)
})