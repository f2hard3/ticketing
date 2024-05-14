import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Order, OrderStatus } from '../../models/order'
import { stripe } from '../../stripe'
import { rabbitmqWrapper } from '../../rabbitmq-wrapper'

// jest.mock('../../stripe')

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
            .post('/api/payments')
            .set('Cookie', getCookie())
            .send({ token: 'token', orderId: new mongoose.Types.ObjectId().toHexString() })
            .expect(404)
})

it('returns a 404 when purchasing an order that does not belong to the user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 100,
        status: OrderStatus.Created
    })
    await order.save()

    await request(app)
            .post('/api/payments')
            .set('Cookie', getCookie())
            .send({ token: 'token', orderId: order.id })
            .expect(401)
})

it('returns a 400 when purchasing a cancelled order', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 100,
        status: OrderStatus.Cancelled
    })
    await order.save()
    
    await request(app)
            .post('/api/payments')
            .set('Cookie', getCookie(order.userId))
            .send({ token: 'token', orderId: order.id })
            .expect(400)
})

it('returns a 201 when with valid inputs', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: Math.floor(Math.random() * 100_000),
        status: OrderStatus.Created
    })
    await order.save()
    
    const response = await request(app)
            .post('/api/payments')
            .set('Cookie', getCookie(order.userId))
            .send({ token: 'tok_visa', orderId: order.id })
            .expect(201)

    const stripeCharges = await stripe.charges.list({ limit: 50 })    
    const stripeCharge = stripeCharges.data.find(charge => charge.amount === order.price * 100)
    expect(stripeCharge).toBeDefined()
    expect(stripeCharge?.currency).toEqual('usd')

    expect(response.body.payment).not.toBeNull()
    expect(response.body.payment.orderId).toEqual(order.id)
    expect(response.body.payment.stripeId).toEqual(stripeCharge?.id)
})

it('publishes an event', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: Math.floor(Math.random() * 100_000),
        status: OrderStatus.Created
    })
    await order.save()
    
    await request(app)
            .post('/api/payments')
            .set('Cookie', getCookie(order.userId))
            .send({ token: 'tok_visa', orderId: order.id })
            .expect(201)

    expect(rabbitmqWrapper.channel.publish).toHaveBeenCalledTimes(1)   
})