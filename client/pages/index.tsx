import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import React from 'react'
import buildClient from '../api/build-client'
import { AppOwnProps } from './_app'
import Link from 'next/link'

export type Ticket = {
    id: string
    title: string
    price: number
    userId: string
    version: number
    orderId?: string
}

export const getServerSideProps = (async (ctx) => {
    const client = buildClient(ctx)
    const { data: tickets } = await client.get<Ticket[]>('/api/tickets')

    return { props: { tickets } }
}) satisfies GetServerSideProps<{ tickets: Ticket[]}>

type Props = InferGetServerSidePropsType<typeof getServerSideProps> & AppOwnProps

const LandingPage = ({ tickets }: Props) => {
    const ticketList = tickets.map((ticket) => (    
        <tr key={ticket.id}>
            <td>{ticket.title}</td>
            <td>{ticket.price}</td>
            <td>
                <Link href={`/tickets/${ticket.id}`}>View</Link>
            </td>
        </tr>
    ))

    return (
        <div>
            <h2>Tickets</h2>
            <table className='table'>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>
        </div>
    )
}

export default LandingPage