import client from 'amqplib'
import { Exchanges } from './exchanges'

interface Event {
    exchange: Exchanges
    data: any
}

export abstract class Publisher<T extends Event> {
    abstract exchange: T['exchange']

    protected channel: client.Channel 
    
    constructor(channel: client.Channel) {
        this.channel = channel
    }

    publish(data: T['data']): Promise<void> {
        return new Promise<void>((resolve, reject) => {
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