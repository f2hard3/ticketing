import axios, { AxiosInstance } from 'axios'
import { GetServerSidePropsContext, NextPageContext } from 'next'

const buildClient = ({ req }: GetServerSidePropsContext | NextPageContext): AxiosInstance => {
    return axios.create({
        baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
        headers: req.headers
    })
}

export default buildClient