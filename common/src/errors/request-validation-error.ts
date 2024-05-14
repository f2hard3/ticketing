import { ValidationError } from 'express-validator'
import { CustomError } from './custom-error'

export class RequestValidationError extends CustomError {
    constructor(public errors: ValidationError[]) {
        super('Invalid request parameters')
    }

    public statusCode = 400    

    serializeErrors() {
        return this.errors.map((error) => {
            return { 
                message: error.msg, 
                field: error.type == 'field' ? error.path : undefined 
            }            
        })
    }
}