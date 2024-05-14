import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React from 'react'
import buildClient from '../../api/build-client'
import { AppOwnProps } from '../_app'
import Link from 'next/link'

type Order = {
    id: string
    status: string
    expiresAt: string
    ticket: {
        version: number
        title: string
        price: number
    }
}

export const getServerSideProps = (async (ctx) => {
    const client = buildClient(ctx)
    const { data: orders } = await client.get<Order[]>('/api/orders')

    return { props: { orders } }
}) satisfies GetServerSideProps<{ orders: Order[]}>

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & AppOwnProps

const OrderIndex = ({ orders }: Props) => {
    const orderList = orders.map((order) => (    
        <tr key={order.id}>
            <td>{order.ticket.title}</td>
            <td>{order.status}</td>
            <td>
                <Link href={`/orders/${order.id}`}>View</Link>
            </td>
        </tr>
    ))

    return (
        <div>
            <h1>Orders</h1>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList}
                </tbody>
            </table>
        </div>
    )
}

export default OrderIndex