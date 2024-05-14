import { CustomError } from "./custom-error";
export declare class DatabaseConnectionError extends CustomError {
    constructor();
    reason: string;
    statusCode: number;
    serializeErrors(): {
        message: string;
    }[];
}
