"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = void 0;
class Publisher {
    constructor(channel) {
        this.channel = channel;
    }
    publish(data) {
        return new Promise((resolve, reject) => {
            const result = this.channel.publish(this.exchange, '', Buffer.from(JSON.stringify(data)), { deliveryMode: 2 } // 2: persistent
            );
            if (!result)
                reject();
            console.log('Event published to exchange', this.exchange);
            resolve();
        });
    }
}
exports.Publisher = Publisher;
