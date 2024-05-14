import { Exchanges } from '@f2hard3-ticketing/common'
import client from 'amqplib'

class RabbitMQWrapper {
    private _channel?: client.Channel
    get channel() {
        if (!this._channel) 
                throw new Error('Cannot access rabbitmq channel before creating')

        return this._channel
    }

    async start(url: string, exchanges: Exchanges[]) {
        try {
            const connection = await client.connect(url)
            this._channel = await connection.createChannel()

            exchanges.forEach(async (exchange) => {
                await this.channel.assertExchange(exchange, 'fanout', { durable: true })
                console.log(`Exchange ${exchange} is ready`)
            })
            
            return true
        } catch(err) {
            console.error('Error connecting to RabbitMQ:', err)
            return false
        }
    }
}

export const rabbitmqWrapper = new RabbitMQWrapper()