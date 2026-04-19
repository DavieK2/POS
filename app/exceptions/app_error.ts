import { ValidationErrors } from "#services/validation_services";

export interface TError extends AppErrors {
    readonly _tag: string;
    readonly message: string;
    readonly code: number
    readonly errors?: Record<string, any>[];
}


export interface NetworkError extends TError { _tag: 'NetworkError'; url: string; }
export interface NotFound extends TError  { _tag: 'NotFound', code: 404 }
export interface DBError extends TError  { _tag: 'DatabaseError', code: 400 }
export interface ValidationError extends TError  { _tag: 'ValidationError', code: 422 }
export interface ValidationErrorMessage  extends TError  { _tag: 'ValidationErrorMessage', code: 422 }
export interface UnhandledError extends TError { _tag: 'UnhandledError'; }
export interface HandledError extends TError { _tag: 'HandledError'; }
export interface AuthError extends TError {
    _tag: 'AuthError';
    message: string;
    code: 403
}
export interface ArkValidationErrors extends TError {
    _tag: 'ValidationFailed'; 
    message: string;
    errors : Record<string, any>[];
    code: 422
}


export interface FormError extends TError {
    _tag: 'FormError'; 
    message: string; 
    code: 400; 
}


export default class AppErrors extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, AppErrors.prototype);
    }


    static NotFound( error: AppErrors ) : NotFound{
        return {
            _tag: "NotFound",
            name: "NotFound",
            code: 404,
            message:  error.message,
        }
    }

    static FormError(error: AppErrors ) : FormError{
        return {
            _tag: "FormError",
            name: "FormError",
            code: 400,
            message: error.message,
        }
    }

    static AuthError() : AuthError{
        return {
            _tag: "AuthError",
            name: "AuthError",
            code: 403,
            message: 'Authentication is required',
        }
    }

    static ValidationFailed( errors: Record<string, any>[] ) : ValidationErrors{
        return {
            _tag: "ValidationFailed",
            name: "ValidationFailed",
            message: "Validation Failed",
            code: 422,
            errors
        }
    }

    static ValidationErrorMessage( message: string ) : ValidationErrorMessage {
        return {
            _tag: "ValidationErrorMessage",
            name: "ValidationErrorMessage",
            message,
            code: 422
        }
    }


    static UnhandledError( error: unknown, message?: string ) : UnhandledError{

        console.log( error)

        return { 
            _tag: 'UnhandledError',
            name: 'UnhandledError', 
            message: message ?? String(error),
            code: 500,
        }
    }

    static HandledError( error: unknown, message?: string, code?: number  ) : HandledError{

        console.log( error)

        return { 
            _tag: 'HandledError',
            name: 'HandledError', 
            message: message ?? String(error),
            code: code ?? 400,
        }
    }

    static DBError( error: unknown, message?: string ) : DBError {
        console.log( error )
        return { 
            _tag: 'DatabaseError',
            name: 'DatabaseError', 
            message: message ?? String(error),
            code: 400,
        }
    }
}