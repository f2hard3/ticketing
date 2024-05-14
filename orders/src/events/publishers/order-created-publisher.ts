import { Exchanges, OrderCreatedEvent, Publisher } from '@f2hard3-ticketing/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly exchange = Exchanges.OrderCreated
}