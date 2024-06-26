import { ValidationError } from 'express-validator';
import { CustomError } from './custom-error';
export declare class RequestValidationError extends CustomError {
    errors: ValidationError[];
    constructor(errors: ValidationError[]);
    statusCode: number;
    serializeErrors(): {
        message: any;
        field: string | undefined;
    }[];
}
