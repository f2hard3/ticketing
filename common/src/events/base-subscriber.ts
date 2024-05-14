import client from 'amqplib'
import { Exchanges } from './exchanges'

interface Event {
    exchange: Exchanges
    data: any
}

export abstract class Subscriber<T extends Event> {
    abstract exchange: T['exchange']
    abstract onMessage(data: T['data'], msg: client.ConsumeMessage, channel: client.Channel): void

    protected channel: client.Channel 
    
    constructor(channel: client.Channel) {
        this.channel = channel
    }

    async subscribe() {
        const queue = await this.channel.assertQueue('', { durable: true })
        await this.channel.bindQueue(queue.queue, this.exchange, '')

        await this.channel.consume(
            queue.queue, 
            (msg) => {           
                if (msg) {
                    console.log(`Message received: ${msg.fields.exchange} / ${queue.queue}`)
                    const parsedData = this.parseMessage(msg)
                    this.onMessage(parsedData, msg, this.channel)
                }
            },
            { noAck: false }
        )

        console.log(`Rabbit MQ Subscriber ${this.exchange} is ready`)
    }

    parseMessage(msg: client.ConsumeMessage) {
        const content = msg.content.toString()
        return JSON.parse(content)
    }
}