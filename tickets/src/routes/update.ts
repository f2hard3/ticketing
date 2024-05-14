import { BadRequestError, NotAuthorizedError, NotFoundError, requireAuth, validateRequest } from '@f2hard3-ticketing/common'
import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import { Ticket } from '../models/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { rabbitmqWrapper } from '../rabbitmq-wrapper'

const router = Router()
router.put(
    '/api/tickets/:id',
    requireAuth,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than zero'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { id } = req.params           
        const ticket = await Ticket.findById(id)
        if (!ticket) throw new NotFoundError()
        if (ticket.orderId) throw new BadRequestError('Cannot edit a reserved ticket')
        if (ticket?.userId !== req.currentUser!.id) throw new NotAuthorizedError()
        

        const { title, price } = req.body
        ticket.set({ title, price })
        await ticket.save()

        new TicketUpdatedPublisher(rabbitmqWrapper.channel).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        })
        res.status(200).send(ticket)
    }
)

export { router as updateTicketRouter }