import client from 'amqplib'

export const rabbitmqWrapper = {
    channel: {
        publish: jest.fn(async (_exchange: string, _routingKey: string, _content: Buffer,
            _options?: client.Options.Publish | undefined
        ) => {
            return true
        }),
        ack: jest.fn()
    } 
}
