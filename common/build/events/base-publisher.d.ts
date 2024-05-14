import client from 'amqplib';
import { Exchanges } from './exchanges';
interface Event {
    exchange: Exchanges;
    data: any;
}
export declare abstract class Publisher<T extends Event> {
    abstract exchange: T['exchange'];
    protected channel: client.Channel;
    constructor(channel: client.Channel);
    publish(data: T['data']): Promise<void>;
}
export {};
