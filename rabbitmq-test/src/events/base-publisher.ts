import client from 'amqplib'
import { Exchanges } from './exchanges'

interface Event {
    exchange: Exchanges
    data: any
}

export abstract class Publisher<T extends Event> {
    abstract exchange: T['exchange']

    private connectionString: string
    channel!: client.Channel

    constructor(connectionString: string) {
        this.connectionString = connectionString
    }

    async start() {
        const connection = await client.connect(this.connectionString)
        this.channel = await connection.createChannel()
        await this.channel.assertExchange(this.exchange, 'fanout')

        console.log('Rabbit MQ Publisher is ready')
    }

    publish(data: T['data']): Promise<void> {
        return new Promise((resolve, reject) => {
            const result = this.channel.publish(
                this.exchange, 
                '', 
                Buffer.from(JSON.stringify(data)),
                { deliveryMode: 2 } // 2: persistent
            )
            if (!result) reject()
            
            console.log('Event published to exchange', this.exchange)
            resolve() 
        })
        
    }
}