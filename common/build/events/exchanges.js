"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exchanges = void 0;
var Exchanges;
(function (Exchanges) {
    Exchanges["TicketCreated"] = "ticket:created";
    Exchanges["TicketUpdated"] = "ticket:updated";
    Exchanges["OrderCreated"] = "order:created";
    Exchanges["OrderCancelled"] = "order:cancelled";
    Exchanges["ExpirationComplete"] = "expiration:complete";
    Exchanges["PaymentCreated"] = "payment:created";
})(Exchanges || (exports.Exchanges = Exchanges = {}));
