import axios, { AxiosInstance } from 'axios'
import { GetServerSidePropsContext, NextPageContext } from 'next'

const buildClient = ({ req }: GetServerSidePropsContext | NextPageContext): AxiosInstance => {
    return axios.create({
        baseURL: 'http://ticketing-app-free.store',
        headers: req.headers
    })
}

export default buildClient