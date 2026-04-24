import { type, Type } from "arktype";
import * as E from 'fp-ts/lib/Either.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import AppErrors, { ArkValidationErrors } from "#exceptions/app_error";

const FAILURE_TOKEN = Symbol("FailureToken");
type Fail = (message: string) => typeof FAILURE_TOKEN;


export type ValidationErrors = ArkValidationErrors;

export default class ValidationService {

    static validate<T extends Type>(param: {
        rules: T,
        data: T['infer'],
        customRules?: {
            [K in keyof T['infer']]?: (value: T['infer'][K], fail: Fail) => void | typeof FAILURE_TOKEN;
        }
    }): E.Either<ValidationErrors, T['infer']> {

        const validator = param.rules.onDeepUndeclaredKey("delete")
            .narrow((data, ctx) => {

                for (const [key, customRuleFn] of Object.entries(param.customRules || {})) {
                    const typedKey = key as keyof T['infer'];
                    const typedCustomRuleFn = customRuleFn as (value: T['infer'][typeof typedKey], fail: Fail) => void | typeof FAILURE_TOKEN;

                    const fail: Fail = (message: string) => {
                        ctx.reject({
                            path: [typedKey],
                            message: message,
                        });
                        return FAILURE_TOKEN;
                    };

                    const result = typedCustomRuleFn(data[typedKey], fail);

                    if ( result === FAILURE_TOKEN ) {
                        return false;
                    }
                }

                return true
            }).pipe((data: T) => Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined)) as typeof data);;


        type validator = typeof validator.infer;

        const validated = validator(param.data);

        if (validated instanceof type.errors) {

            const errors: Record<string, string>[] = [];

            validated.forEach(error => {

                const e: Record<string, string> = {}
                e[error.path[0] as string] = error.message

                errors.push(e);
            });

            return E.left(AppErrors.ValidationFailed(errors));
        }

        return E.right(validated);
    }

    static validateUsingTask<T extends Type>(data: { rules: T, data: T['infer'] }) {
        return TE.fromEither(ValidationService.validate({
            rules: data.rules,
            data: data.data
        }));
    }
}