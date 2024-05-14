import { TicketCreatedPublisher } from './events/ticket-created-publisher'

const start = async () => {    
    console.clear()

    const publisher = new TicketCreatedPublisher('amqp://localhost:5672')

    await publisher.publish({ 
        id: '123', 
        title: 'concert', 
        price: 20,
        userId: 'test@test.com'
    })
} 

start()
