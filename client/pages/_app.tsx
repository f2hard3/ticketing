import React from 'react'
import 'bootstrap/dist/css/bootstrap.css'
import App, { AppContext, AppInitialProps, AppProps } from 'next/app'
import Header from '../components/header'
import buildClient from '../api/build-client'
import axios from 'axios'

export type AppOwnProps = {
    currentUser: {
        id: string
        email: string
    } | null
}

const AppComponent = ({ Component, pageProps, currentUser }: AppProps & AppOwnProps ) => {    
    return (
        <div>
            <Header currentUser={currentUser}/>
            <div className='container'>
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    )
}

AppComponent.getInitialProps = async (
    appContext: AppContext
): Promise<AppOwnProps & AppInitialProps> => {
    const ctx = await App.getInitialProps(appContext)

    if (typeof window === 'undefined') {
        const client = buildClient(appContext.ctx)
        /* cspell: disable-next-line */
        const { data } = await client.get<AppOwnProps>('/api/users/currentuser')
        return { ...ctx, ...data }
    } else {
        const { data } = await axios.get<AppOwnProps>('https://ticketing.dev/api/users/currentuser')
        return { ...ctx, ...data }
    }
}

export default AppComponent