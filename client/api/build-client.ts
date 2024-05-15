import axios, { AxiosInstance } from 'axios'
import { GetServerSidePropsContext, NextPageContext } from 'next'

const buildClient = ({ req }: GetServerSidePropsContext | NextPageContext): AxiosInstance => {
    return axios.create({
        baseURL: 'http://170.64.240.108/',
        headers: req.headers
    })
}

export default buildClient