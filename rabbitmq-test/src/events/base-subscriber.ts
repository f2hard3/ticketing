import client from 'amqplib'
import { Exchanges } from './exchanges'

interface Event {
    exchange: Exchanges
    data: any
}

export abstract class Subscriber<T extends Event> {
    abstract exchange: T['exchange']
    abstract queue: string
    abstract onMessage(data: T['data'], msg: client.ConsumeMessage): void

    private connectionString: string
    channel!: client.Channel

    constructor(connectionString: string) {
        this.connectionString = connectionString
    }

    async subscribe() {
        const connection = await client.connect(this.connectionString)
        this.channel = await connection.createChannel()
        const queue = await this.channel.assertQueue(this.queue, { durable: true })
        await this.channel.bindQueue(queue.queue, this.exchange, '')

        await this.channel.consume(
            queue.queue, 
            (msg) => {           
                if (msg) {
                    console.log(`Message received': ${msg.fields.exchange} / ${this.queue}`)
                    const parsedData = this.parseMessage(msg)
                    this.onMessage(parsedData, msg)
                }
            },
            { noAck: false }
        )

        console.log('Rabbit MQ Subscriber is ready')
    }

    parseMessage(msg: client.ConsumeMessage) {
        const content = msg.content.toString()
        return JSON.parse(content)
    }
}