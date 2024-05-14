import { TicketCreatedSubscriber } from "./events/ticket-created-subscriber"

const start = async () => {   
    console.clear()

    const subscriber = new TicketCreatedSubscriber('amqp://localhost:5672')
    await subscriber.subscribe()

    subscriber.channel.on('close', () => {
        console.log('rabbitmq connection closed')
        process.exit()
    })

    process.on('SIGINT', () => subscriber.channel.close())
    process.on('SIGTERM', () => subscriber.channel.close())
}
start()