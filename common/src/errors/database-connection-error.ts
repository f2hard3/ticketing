import { CustomError } from "./custom-error"

export class DatabaseConnectionError extends CustomError {
    constructor() {
        super('Error connecting to database')
    }

    public reason = 'Error Connecting to database'
    public statusCode = 500    
    
    serializeErrors(): { message: string }[] {
        return [
            { message: this.reason }
        ]
    }
}