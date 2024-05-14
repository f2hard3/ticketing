import axios from 'axios'
import { useState } from 'react'

type UseRequestParams = {
    url: string
    method: 'get' | 'post' | 'put' | 'delete'
    body: Object
    onSuccess?: Function
}

const useRequest = ({ url, method, body, onSuccess }: UseRequestParams) => {
    const [errors, setErrors] = useState<JSX.Element>(null)

    const doRequest = async (props={}) => {
        try {
            setErrors(null)
            const response = await axios[method](url, { ...body, ...props })
            
            onSuccess?.(response.data)
            
            return response.data
        } catch(err) {            
            setErrors(
                <div className='alert alert-danger'>
                    <ul className='my-0'>
                        {err.response.data.errors.map(err => (
                            <li key={err.message}>{err.message}</li>
                        ))}
                    </ul>
                </div>
            )
        }  
    }

    return { doRequest, errors }
}

export default useRequest