import React, { useEffect }  from 'react'
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const SignOut: React.FC = () => {
    const { doRequest } = useRequest({
        /* cspell: disable-next-line */
        url: '/api/users/signout',
        method: 'post',
        body: {},
        onSuccess: () => Router.push('/')
    })

    useEffect(() => {
        doRequest()
    }, []);

    return (
        <div>Signing you out...</div>
    )
}

export default SignOut