
import { OrderCreatedSubscriber } from './events/subscribers/order-created-subscriber'
import { rabbitmqWrapper } from './rabbitmq-wrapper'
import { Exchanges } from '@f2hard3-ticketing/common'

const start = async () => {
    console.log('Starting....')
    if (!process.env.RABBITMQ_URI) {
        throw new Error('RABBITMQ_URI must be defined')
    }

    try {
        while (
                !(await rabbitmqWrapper.start(
                    process.env.RABBITMQ_URI, 
                    [Exchanges.ExpirationComplete]
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
    } catch(err) {
        console.error(err)
    }
}

start()
