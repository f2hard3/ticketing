import mongoose from 'mongoose'
import { app } from './app'
import { rabbitmqWrapper } from './rabbitmq-wrapper'
import { Exchanges } from '@f2hard3-ticketing/common'
import { TicketCreatedSubscriber } from './events/subscribers/ticket-created-subscriber'
import { ExpirationCompleteSubscriber } from './events/subscribers/expiration-complete-subscriber'
import { TicketUpdatedSubscriber } from './events/subscribers/ticket-updated-subscriber'
import { PaymentCreatedSubscriber } from './events/subscribers/payment-created.subscriber'

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
                    [Exchanges.OrderCreated, Exchanges.OrderCancelled]
                ))
        ) {
            await new Promise((resolve) => setTimeout(resolve, 5000))
        }
        console.log('RabbitMQ is ready');
        rabbitmqWrapper.channel.on('close', () => console.log('RabbitMQ Channel closed') )
        process.on('SIGINT', () => rabbitmqWrapper.channel.close())
        process.on('SIGTERM', () => rabbitmqWrapper.channel.close())

        await new TicketCreatedSubscriber(rabbitmqWrapper.channel).subscribe()
        await new TicketUpdatedSubscriber(rabbitmqWrapper.channel).subscribe()
        await new ExpirationCompleteSubscriber(rabbitmqWrapper.channel).subscribe()
        await new PaymentCreatedSubscriber(rabbitmqWrapper.channel).subscribe()
    } catch(err) {
        console.error(err)
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000')
    })
}

start()
