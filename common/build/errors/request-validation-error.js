"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidationError = void 0;
const custom_error_1 = require("./custom-error");
class RequestValidationError extends custom_error_1.CustomError {
    constructor(errors) {
        super('Invalid request parameters');
        this.errors = errors;
        this.statusCode = 400;
    }
    serializeErrors() {
        return this.errors.map((error) => {
            return {
                message: error.msg,
                field: error.type == 'field' ? error.path : undefined
            };
        });
    }
}
exports.RequestValidationError = RequestValidationError;
