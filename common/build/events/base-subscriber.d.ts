import client from 'amqplib';
import { Exchanges } from './exchanges';
interface Event {
    exchange: Exchanges;
    data: any;
}
export declare abstract class Subscriber<T extends Event> {
    abstract exchange: T['exchange'];
    abstract onMessage(data: T['data'], msg: client.ConsumeMessage, channel: client.Channel): void;
    protected channel: client.Channel;
    constructor(channel: client.Channel);
    subscribe(): Promise<void>;
    parseMessage(msg: client.ConsumeMessage): any;
}
export {};
