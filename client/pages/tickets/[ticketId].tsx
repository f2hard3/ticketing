import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React from 'react'
import buildClient from '../../api/build-client'
import { AppOwnProps } from '../_app'
import useRequest from '../../hooks/use-request'
import Router from 'next/router'

type Ticket = {
    id: string
    title: string
    price: number
    userId: string
    version: number
    orderId?: string
}

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
    const { ticketId } = ctx.params    
    const { data: ticket } = await client.get<Ticket>(`/api/tickets/${ticketId}`)

    return { props: { ticket } }
}) satisfies GetServerSideProps<{ ticket: Ticket}>

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & AppOwnProps

const TicketShow = ({ ticket }: Props) => {
    const { doRequest, errors } = useRequest({
        /* cspell: disable-next-line */
        url: '/api/orders', 
        method: 'post',
        body: { ticketId: ticket.id },
        onSuccess: (order: Order) => { Router.push(`/orders/${order.id}`) }
    })

    return (
        <div>
            <h1>{ticket.title}</h1>
            <h4>Price: ${ticket.price}</h4>
            {errors}
            <button className='btn btn-primary' onClick={() => doRequest()}>Purchase</button>
        </div>
    )
}

export default TicketShow