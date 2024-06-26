import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@f2hard3-ticketing/common'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import { Order } from '../models/order'
import { stripe } from '../stripe'
import { Payment } from '../models/payment'
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher'
import { rabbitmqWrapper } from '../rabbitmq-wrapper'

const router = express.Router()
router.post(
    '/api/payments',
    requireAuth,
    [
        body('token')
            .notEmpty()            
            .withMessage('token must be provided'),
        body('orderId')
            .notEmpty()
            .withMessage('orderId must be provided')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { token, orderId } = req.body
        const order = await Order.findById(orderId)
        if (!order) throw new NotFoundError()
        if (order.userId !== req.currentUser?.id) 
            throw new NotAuthorizedError()
        if (order.status === OrderStatus.Cancelled) 
            throw new BadRequestError('Cannot pay for an cancelled order')

        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price * 100,
            source: token
        })
        const payment = Payment.build({ orderId, stripeId: charge.id })
        await payment.save()

        new PaymentCreatedPublisher(rabbitmqWrapper.channel).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId,
        })

        res.status(201).send({ payment })      
    }
)

export { router as createChargeRouter }