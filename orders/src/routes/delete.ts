import { NotAuthorizedError, NotFoundError, OrderStatus, requireAuth } from '@f2hard3-ticketing/common'
import express, { Request, Response } from 'express'
import { Order } from '../../models/order'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { rabbitmqWrapper } from '../rabbitmq-wrapper'

const router = express.Router()
router.delete(
    '/api/orders/:id',
    requireAuth,
    async (req: Request, res: Response) => {
        const { id } = req.params
        const order = await Order.findById(id).populate('ticket')
        if (!order) throw new NotFoundError()
        if (order.userId !== req.currentUser!.id)
                throw new NotAuthorizedError()
        
        order.status = OrderStatus.Cancelled
        await order.save()

        new OrderCancelledPublisher(rabbitmqWrapper.channel).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        res.status(204).send(order)
    }
)

export { router as deleteOrderRouter }