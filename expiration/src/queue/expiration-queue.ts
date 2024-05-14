import Queue from 'bull'
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher'
import { rabbitmqWrapper } from '../rabbitmq-wrapper'

interface Payload {
    orderId: string
}

export const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST,
    }
})

expirationQueue.process(async (job) => {    
    new ExpirationCompletePublisher(rabbitmqWrapper.channel).publish({
        orderId: job.data.orderId
    })
})