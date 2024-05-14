import { CustomError } from './custom-error'

export class NotFoundError extends CustomError {
    constructor() {
        super('Route not found')
    }
    
    public statusCode = 404;
    
    serializeErrors() {
        return [{ message: 'Not Found' }]
    }

}