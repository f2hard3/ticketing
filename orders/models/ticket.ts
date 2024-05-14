import mongoose from 'mongoose'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'
import { Order, OrderStatus } from './order'

interface TicketAttrs {
    id: string
    title: string
    price: number
}

export interface TicketDoc extends mongoose.Document {
    version: number
    title: string
    price: number
    isReserved(): Promise<Boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>
}

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
}, {
    toJSON: {
        transform (_, ret) {
            ret.id = ret._id,
            delete ret._id
        }
    }
})
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    const { id, ...rest } = attrs
    return new Ticket({
        ...rest,
        _id: id,
    })
}
ticketSchema.statics.findByEvent = async (event: { id: string, version: number }) => {
    return Ticket.findOne({ _id: event.id, version: event.version - 1 })
}
ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({ 
        ticket: this,
        status: {
            $ne: OrderStatus.Cancelled
        }
    })
    return !!existingOrder
}
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema)


export { Ticket }