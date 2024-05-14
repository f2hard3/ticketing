import { CustomError } from './custom-error'

export class BadRequestError extends CustomError {
    constructor(public message: string) {
        super(message)
    }

    public statusCode = 400    

    serializeErrors() {        
        return [{ message: this.message }]
    }                        
}