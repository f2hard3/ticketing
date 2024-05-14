import { Exchanges, OrderCancelledEvent, Publisher } from '@f2hard3-ticketing/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly exchange = Exchanges.OrderCancelled
}