import mongoose from 'mongoose'
import { app } from './app'
import { rabbitmqWrapper } from './rabbitmq-wrapper'
import { Exchanges } from '@f2hard3-ticketing/common'
import { OrderCreatedSubscriber } from './events/subscribers/order-created-subscriber'
import { OrderCancelledSubscriber } from './events/subscribers/order-cancelled-subscriber'

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined')
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined')
    }

    if (!process.env.RABBITMQ_URI) {
        throw new Error('RABBITMQ_URI must be defined')
    }

    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to Mongodb')

        while (
                !(await rabbitmqWrapper.start(
                    process.env.RABBITMQ_URI, 
                    [Exchanges.PaymentCreated]
                ))
        ) {
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }
        console.log('RabbitMQ is ready');
        rabbitmqWrapper.channel.on('close', () => {
            console.log('RabbitMQ Channel closed')
        })
        process.on('SIGINT', () => {            
            rabbitmqWrapper.channel.close()
        })
        process.on('SIGTERM', () => {
            rabbitmqWrapper.channel.close()
        })
        await new OrderCreatedSubscriber(rabbitmqWrapper.channel).subscribe()
        await new OrderCancelledSubscriber(rabbitmqWrapper.channel).subscribe()
    } catch(err) {
        console.error(err)
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000')
    })
}

start()
