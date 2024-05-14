import { Exchanges, ExpirationCompleteEvent, Publisher } from '@f2hard3-ticketing/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly exchange = Exchanges.ExpirationComplete
}