"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscriber = void 0;
class Subscriber {
    constructor(channel) {
        this.channel = channel;
    }
    subscribe() {
        return __awaiter(this, void 0, void 0, function* () {
            const queue = yield this.channel.assertQueue('', { durable: true });
            yield this.channel.bindQueue(queue.queue, this.exchange, '');
            yield this.channel.consume(queue.queue, (msg) => {
                if (msg) {
                    console.log(`Message received: ${msg.fields.exchange} / ${queue.queue}`);
                    const parsedData = this.parseMessage(msg);
                    this.onMessage(parsedData, msg, this.channel);
                }
            }, { noAck: false });
            console.log(`Rabbit MQ Subscriber ${this.exchange} is ready`);
        });
    }
    parseMessage(msg) {
        const content = msg.content.toString();
        return JSON.parse(content);
    }
}
exports.Subscriber = Subscriber;
