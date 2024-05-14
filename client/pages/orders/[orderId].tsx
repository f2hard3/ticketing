import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React, { useEffect, useState } from 'react'
import Router from 'next/router'
import StripeCheckout from 'react-stripe-checkout'
import buildClient from '../../api/build-client'
import { AppOwnProps } from '../_app'
import useRequest from '../../hooks/use-request'

type Order = {
    id: string
    version: number
    userId: string
    status: string
    expiresAt: Date
    ticket: {
        id: string
        version: number
        title: string
        price: number
    }        
}

export const getServerSideProps = (async (ctx) => {
    const client = buildClient(ctx)
    const { orderId } = ctx.params
    const { data: order } = await client.get<Order>(`/api/orders/${orderId}`)
    
    /* cspell: disable-next-line */
    const STRIPE_KEY = 'pk_test_51PFm0fRonL08HkEZ3HH3NLRgZ0SDWZUxgG2vv6Yn05Z376P1s5xn7xBGvWa5GnjhG01InDF3q7x6Ez0K4vuZcSbk00zq9qLUmD'

    return { props: { order, STRIPE_KEY } }
}) satisfies GetServerSideProps<{ order: Order, STRIPE_KEY: string}>

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & AppOwnProps

const OrderShow = ({ order, STRIPE_KEY, currentUser }: Props) => {
    const [timeLeft, setTimeLeft] = useState(0)
    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = new Date(order.expiresAt).getTime() - new Date().getTime()
            setTimeLeft(Math.round(msLeft / 1000))
        }

        findTimeLeft()
        const timerId = setInterval(findTimeLeft, 1000)

        return () => clearInterval(timerId)
    }, [order])

    const { doRequest, errors } = useRequest({
        /* cspell: disable-next-line */
        url: '/api/payments', 
        method: 'post',
        body: { orderId: order.id },
        onSuccess: () => Router.push('/orders')
    })

    if (timeLeft < 0) {
        return <div>Order Expired</div>
    }

    return (
        <div>
            <h1>Purchasing {order.ticket.title}</h1>
            <h4 suppressHydrationWarning>Time left to pay: {timeLeft} seconds</h4>
            <StripeCheckout 
                token={({ id }) => doRequest({ token: id })}
                stripeKey={STRIPE_KEY}
                amount={order.ticket.price * 100}
                email={currentUser.email}
            />
            {errors}            
        </div>
    )
}

export default OrderShow