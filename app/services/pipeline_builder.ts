import { pipe } from 'fp-ts/lib/function.js';
import * as TE from 'fp-ts/lib/TaskEither.js';
import * as E from 'fp-ts/lib/Either.js';
import AppErrors, { AuthError, TError } from '#exceptions/app_error';
import { Authenticators } from '@adonisjs/auth/types';
import { Authenticator } from '@adonisjs/auth';
import User from '#modules/user/models/user';
import { AccessToken } from '@adonisjs/auth/access_tokens';
import { TransactionClientContract } from '@adonisjs/lucid/types/database';
import db from '@adonisjs/lucid/services/db';
import { v7 } from 'uuid';
import { DateTime } from 'luxon';
import { BaseModel } from '@adonisjs/lucid/orm';

export type LogMetadata = {
    dbTransaction?: TransactionClientContract;
    description: string;
    module: string;
    action: string;
    ipAddress?: string | undefined;
    [key: string]: any;
}

export type LogCallback<A = any, C = any> = (result: A, context: C) => LogMetadata;
export type LogOption<A = any, C = any> = LogMetadata | LogCallback<A, C>;

export type PipelineLog = {
    timestamp: Date;
    userId?: string | number;
    operationType: string;
    metadata: Omit<LogMetadata, 'dbTransaction'>;
    context?: Record<string, any>;
    duration?: number;
}

export type CompleteTagHandlers<E extends TError, A, E2> = {
    [K in E['_tag']]: (error: Extract<E, { _tag: K }>) => TE.TaskEither<E2, A>;
};

export type DefaultHandlers<E extends TError, A, E2> = {
    Default: (error: E | TError) => TE.TaskEither<E2, A>;
} & Partial<CompleteTagHandlers<E, A, E2>>;

export type ErrorHandlers<E extends TError, A, E2> =
    | CompleteTagHandlers<E, A, E2>
    | DefaultHandlers<E, A, E2>;

export type Auth = { 
    auth: Authenticator<Authenticators> 
}

type OperationType = 'chain' | 'chainAsync' | 'chainAndStore' | 'chainAsyncAndStore' | 'withAuth' | 'parallel' | 'batch' | 'chainConditional' | 'chainConditionalAndStore' | 'chainWhen' | 'chainWhenAndStore' | 'chainIfElse' | 'chainIfElseAndStore';

type BaseOperation = { type: OperationType; log?: LogOption; };
type ChainFn<A = any, C = any, E2 = any, B = any> = (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>;
type ChainAsyncFn<A = any, C = any, E2 = any, B = any> = (param: A, context: C) => Promise<E.Either<E2, B>>;
type ParallelFn<A = any, C = any, E2 = any, B = any> = (param: A, context: C) => TE.TaskEither<E2, B>;
type BatchFn<A = any, C = any, E2 = any, B = any> = (param: A, context: C) => E.Either<E2, B>;
type ConditionFn<A = any, C = any> = (param: A, context: C) => boolean; // New type for condition function

type ChainOperation = BaseOperation & { type: 'chain'; fn: ChainFn<any, any, any, any>; };
type ChainAsyncOperation = BaseOperation & { type: 'chainAsync'; fn: ChainAsyncFn<any, any, any, any>; onError: ((reason: unknown) => any) | undefined; };
type ChainAndStoreOperation = BaseOperation & { type: 'chainAndStore'; fn: ChainFn<any, any, any, any>; key: string; };
type ChainAsyncAndStoreOperation = BaseOperation & { type: 'chainAsyncAndStore'; fn: ChainAsyncFn<any, any, any, any>; key: string; onError: ((reason: unknown) => any) | undefined; };
type WithAuthOperation = BaseOperation & { type: 'withAuth'; };
type ParallelOperation = BaseOperation & { type: 'parallel'; fn: Record<string, ParallelFn<any, any, any, any>>; key: string; };
type BatchOperation = BaseOperation & { type: 'batch'; fn: Record<string, BatchFn<any, any, any, any>>; };
type ChainConditionalOperation = BaseOperation & { type: 'chainConditional'; fn: ChainFn<any, any, any, any>; conditionKey: string; };
type ChainConditionalAndStoreOperation = BaseOperation & { type: 'chainConditionalAndStore'; fn: ChainFn<any, any, any, any>; conditionKey: string; storeKey: string; };
// Existing conditional operations
type ChainWhenOperation = BaseOperation & { type: 'chainWhen'; fn: ChainFn<any, any, any, any>; condition: ConditionFn; };
type ChainWhenAndStoreOperation = BaseOperation & { type: 'chainWhenAndStore'; fn: ChainFn<any, any, any, any>; condition: ConditionFn; storeKey: string; };
// NEW IF/ELSE operations
type ChainIfElseOperation = BaseOperation & { 
    type: 'chainIfElse'; 
    onTrue: ChainFn<any, any, any, any>; 
    onFalse: ChainFn<any, any, any, any>; 
    condition: ConditionFn; 
};
type ChainIfElseAndStoreOperation = BaseOperation & { 
    type: 'chainIfElseAndStore'; 
    onTrue: ChainFn<any, any, any, any>; 
    onFalse: ChainFn<any, any, any, any>; 
    condition: ConditionFn; 
    storeKey: string; 
};

type Operation = 
    | ChainOperation | ChainAsyncOperation | ChainAndStoreOperation | ChainAsyncAndStoreOperation 
    | WithAuthOperation | ParallelOperation | BatchOperation | ChainConditionalOperation | ChainConditionalAndStoreOperation
    | ChainWhenOperation | ChainWhenAndStoreOperation
    // 1. UPDATED: Added to the union
    | ChainIfElseOperation | ChainIfElseAndStoreOperation;


function getSafeLogContext(data: any, seen = new WeakSet()): any {
    if (data === null || typeof data !== 'object') {
        return data;
    }

    if (data instanceof BaseModel) {
        return data.$primaryKeyValue;
    }

    if (data instanceof Date) {
        return data;
    }

    if (seen.has(data)) {
        return '[Circular Reference]';
    }
    seen.add(data);

    if (('client' in data && 'dialect' in data) || ('transaction' in data && typeof data.commit === 'function')) {
        return '[DatabaseObject]';
    }

    if (Array.isArray(data)) {
        return data.map(item => getSafeLogContext(item, seen));
    }

    const clean: Record<string, any> = {};
    
    for (const key of Object.keys(data)) {

        if (key === 'dbTransaction' || key === 'auth' || key === 'password' || key === 'token') {
             continue;
        }

        try {
            const value = data[key];
            
            if (typeof value === 'function' || typeof value === 'symbol') {
                continue;
            }

            clean[key] = getSafeLogContext(value, seen);
        } catch (err) {
            clean[key] = '[Serialization Error]';
        }
    }

    return clean;
}

class PipelineErrorHandler<E extends TError, A, C> {
    constructor(
        private readonly operations: Operation[],
        private readonly initialValue: any
    ) {}

    handle<E2>(handlers: ErrorHandlers<E, A, E2>): PipelineBuilder<E2, A, C> {
        const handlerFn = (error: E): TE.TaskEither<E2, A> => {
            if (typeof error === 'object' && error !== null && typeof (error as any)._tag === 'string') {
                const tag = (error as TError)._tag;
                const specificHandler = (handlers as any)[tag];

                if (typeof specificHandler === 'function') {
                    return (specificHandler as (err: E) => TE.TaskEither<E2, A>)(error);
                }
            }

            const defaultHandler = (handlers as DefaultHandlers<E, A, E2>).Default;
            if (typeof defaultHandler === 'function') {
                return defaultHandler(error);
            }

            const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
                ? (error as any).message : String(error);
            const errorTag = typeof error === 'object' && error !== null && '_tag' in error 
                ? (error as any)._tag : 'UnknownError';
            
            throw new Error(`Invariant Violation: No handler found for error tag "${errorTag}" (${errorMessage})`);
        };

        return new PipelineBuilder(this.operations, this.initialValue, handlerFn);
    }

    handleAll<E2>(defaultHandler: (error: E | TError) => TE.TaskEither<E2, A>): PipelineBuilder<E2, A, C> {
        return this.handle({ Default: defaultHandler } as DefaultHandlers<E, A, E2>);
    }

    mapErrors<E2 extends TError>(errorMapper: (error: E | TError) => E2): PipelineBuilder<E2, A, C> {
        return this.handleAll((error) => TE.left(errorMapper(error)));
    }
}

export default class PipelineBuilder<E, A, C> {
    private readonly operations: Operation[];
    private readonly initialValue: any;
    private readonly errorHandler: ((error: any) => TE.TaskEither<any, any>) | undefined;
    private log: Array<{ log: PipelineLog; transaction?: any }> = [];
    private authenticatedUserId?: string | number;

    constructor(
        operations: Operation[] = [],
        initialValue: any = null,
        errorHandler: ((error: any) => TE.TaskEither<any, any>) | undefined = undefined
    ) {
        this.operations = operations;
        this.initialValue = initialValue;
        this.errorHandler = errorHandler;
    }

    public static _fromTaskEither<E0, A0, C0>(data: TE.TaskEither<E0, A0>): PipelineBuilder<E0, A0, C0> {
        return new PipelineBuilder([], data);
    }

    static use<A, C>(data: A): PipelineBuilder<never, A, C> {
        return new PipelineBuilder([], data);
    }

    withAuth<A2, C>(
        this: PipelineBuilder<E, A2 & Auth, C>
    ): PipelineBuilder<E | AuthError, A2 & Auth, C & Record<`__user`, User & { currentAccessToken: AccessToken }>> {
        return new PipelineBuilder([
            ...this.operations,
            { type: 'withAuth' }
        ], this.initialValue) as any;
    }
    
    chain<E2, B>(
        action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>, 
        log?: LogOption<B, C>
    ): PipelineBuilder<E | E2, B, C>;
    
    chain<E2, B>(
        options: { 
            action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; 
            log?: LogOption<B, C> 
        }
    ): PipelineBuilder<E | E2, B, C>;

    chain<E2, B>(arg1: any, arg2?: any): PipelineBuilder<E | E2, B, C> {
        let options: { action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; log?: LogOption };
        if (typeof arg1 === 'function') {
            options = { action: arg1, log: arg2 };
        } else {
            options = arg1;
        }
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chain', fn: options.action, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler);
    }

    chainAndStore<E2, B, K extends string>(
        options: { 
            key: K; 
            action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; 
            log?: LogOption<B, C> 
        }
    ): PipelineBuilder<E | E2, B, C & Record<`__${K}`, B>>;

    chainAndStore<E2, B, K extends string>(
        key: K, 
        action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>, 
        log?: LogOption<B, C>
    ): PipelineBuilder<E | E2, B, C & Record<`__${K}`, B>>;
    
    chainAndStore<E2, B, K extends string>(arg1: any, arg2?: any, arg3?: any): PipelineBuilder<E | E2, B, C & Record<`__${K}`, B>> {
        let options: { key: K; action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; log?: LogOption };
        if (typeof arg1 === 'string' && typeof arg2 === 'function') {
            options = { key: arg1, action: arg2, log: arg3 } as any;
        } else {
            options = arg1;
        }
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chainAndStore', fn: options.action, key: options.key, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler);
    }
  
    chainAsync<E2, B>(
        action: (param: A, context: C) => Promise<E.Either<E2, B>>, 
        onError?: (reason: unknown) => E2, 
        log?: LogOption<B, C>
    ): PipelineBuilder<E | E2, B, C>;
    
    chainAsync<E2, B>(
        options: { 
            action: (param: A, context: C) => Promise<E.Either<E2, B>>; 
            log?: LogOption<B, C>; 
            onError?: (reason: unknown) => E2 
        }
    ): PipelineBuilder<E | E2, B, C>;

    chainAsync<E2, B>(arg1: any, arg2?: any, arg3?: any): PipelineBuilder<E | E2, B, C> {
        let options: { action: (param: A, context: C) => Promise<E.Either<E2, B>>; onError?: (reason: unknown) => E2; log?: LogOption };
        if (typeof arg1 === 'function') {
            options = { action: arg1, onError: arg2, log: arg3 };
        } else {
            options = arg1;
        }
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chainAsync', fn: options.action, onError: options.onError, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler);
    }

    chainAsyncAndStore<E2, B, K extends string>(
        key: K, 
        action: (param: A, context: C) => Promise<E.Either<E2, B>>, 
        onError?: (reason: unknown) => E2, 
        log?: LogOption<B, C>
    ): PipelineBuilder<E | E2, B, C & Record<`__${K}`, B>>;
    
    chainAsyncAndStore<E2, B, K extends string>(
        options: { 
            key: K; 
            action: (param: A, context: C) => Promise<E.Either<E2, B>>; 
            log?: LogOption<B, C>; 
            onError?: (reason: unknown) => E2 
        }
    ): PipelineBuilder<E | E2, B, C & Record<`__${K}`, B>>;

    chainAsyncAndStore<E2, B, K extends string>(arg1: any, arg2?: any, arg3?: any, arg4?: any): PipelineBuilder<E | E2, B, C & Record<`__${K}`, B>> {
        let options: { key: K; action: (param: A, context: C) => Promise<E.Either<E2, B>>; onError?: (reason: unknown) => E2; log?: LogOption };
        if (typeof arg1 === 'string') {
            options = { key: arg1, action: arg2, onError: arg3, log: arg4 } as any;
        } else {
            options = arg1;
        }
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chainAsyncAndStore', fn: options.action, key: options.key, onError: options.onError, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler);
    }
    
    chainConditional<E2, B>(options: { conditionKey: string; action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; log?: LogOption<B, C> }): PipelineBuilder<E | E2, A | B, C> {
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chainConditional', fn: options.action, conditionKey: options.conditionKey, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler);
    }

    chainConditionalAndStore<E2, B, K extends string>(options: { conditionKey: string; storeKey: K; action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; log?: LogOption<B, C> }): PipelineBuilder<E | E2, A | B, C & Partial<Record<`__${K}`, B>>> {
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chainConditionalAndStore', fn: options.action, conditionKey: options.conditionKey, storeKey: options.storeKey, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler);
    }

    // Executes action if the runtime condition is met, preserves A if skipped.
    chainWhen<E2, B>(options: { 
        condition: (param: A, context: C) => boolean; 
        action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; 
        log?: LogOption<B, C>; 
    }): PipelineBuilder<E | E2, A | B, C> {
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chainWhen', fn: options.action, condition: options.condition, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler);
    }

    // Executes action if the runtime condition is met, stores result in context, preserves A if skipped.
    chainWhenAndStore<E2, B, K extends string>(options: { 
        condition: (param: A, context: C) => boolean; 
        storeKey: K; 
        action: (param: A, context: C) => E.Either<E2, B> | TE.TaskEither<E2, B>; 
        log?: LogOption<B, C>; 
    }): PipelineBuilder<E | E2, A | B, C & Partial<Record<`__${K}`, B>>> {
        return new PipelineBuilder([
            ...this.operations,
            { type: 'chainWhenAndStore', fn: options.action, condition: options.condition, storeKey: options.storeKey, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler) as any;
    }

    /**
     * Executes one of two actions (onTrue or onFalse) based on a runtime condition.
     * The resulting type is the union of the return types of the two branches.
     */
    chainIfElse<E2True, E2False, BTrue, BFalse>(options: { 
        condition: (param: A, context: C) => boolean; 
        onTrue: (param: A, context: C) => E.Either<E2True, BTrue> | TE.TaskEither<E2True, BTrue>; 
        onFalse: (param: A, context: C) => E.Either<E2False, BFalse> | TE.TaskEither<E2False, BFalse>; 
        log?: LogOption<BTrue | BFalse, C>; 
    }): PipelineBuilder<E | E2True | E2False, BTrue | BFalse, C> {
        return new PipelineBuilder([
            ...this.operations,
            { 
                type: 'chainIfElse', 
                condition: options.condition, 
                onTrue: options.onTrue, 
                onFalse: options.onFalse, 
                ...(options.log && { log: options.log }) 
            }
        ], this.initialValue, this.errorHandler) as any;
    }

    /**
     * Executes one of two actions (onTrue or onFalse) based on a runtime condition and stores the result.
     * The resulting type is the union of the return types of the two branches.
     */
    chainIfElseAndStore<E2True, E2False, BTrue, BFalse, K extends string>(options: { 
        condition: (param: A, context: C) => boolean; 
        onTrue: (param: A, context: C) => E.Either<E2True, BTrue> | TE.TaskEither<E2True, BTrue>; 
        onFalse: (param: A, context: C) => E.Either<E2False, BFalse> | TE.TaskEither<E2False, BFalse>; 
        storeKey: K;
        log?: LogOption<BTrue | BFalse, C>; 
    }): PipelineBuilder<E | E2True | E2False, BTrue | BFalse, C & Record<`__${K}`, BTrue | BFalse>> {
        return new PipelineBuilder([
            ...this.operations,
            { 
                type: 'chainIfElseAndStore', 
                condition: options.condition, 
                onTrue: options.onTrue, 
                onFalse: options.onFalse, 
                storeKey: options.storeKey,
                ...(options.log && { log: options.log }) 
            }
        ], this.initialValue, this.errorHandler) as any;
    }


    chainAndStoreParallel<E2, Tasks extends Record<string, any>>(options: { tasks: { [K in keyof Tasks]: (param: A, context: C) => TE.TaskEither<E2, Tasks[K]> }; log?: LogOption<Tasks, C> }): PipelineBuilder<E | E2, Tasks, C & { [K in keyof Tasks as `__${string & K}`]: Tasks[K] }> {
        return new PipelineBuilder([
            ...this.operations,
            { type: 'parallel', fn: options.tasks, key: 'parallel', ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler) as any;
    }

    chainBatch<E2, Results extends Record<string, any>>(options: { operations: { [K in keyof Results]: (param: A, context: C) => E.Either<E2, Results[K]> }; log?: LogOption<Results, C> }): PipelineBuilder<E | E2, Results, C> {
        return new PipelineBuilder([
            ...this.operations,
            { type: 'batch', fn: options.operations, ...(options.log && { log: options.log }) }
        ], this.initialValue, this.errorHandler) as any;
    }

    catchErrors(): PipelineErrorHandler<E extends TError ? E : never, A, C> {
        return new PipelineErrorHandler<E extends TError ? E : never, A, C>(
            this.operations,
            this.initialValue
        );
    }


    private createLog(
        operationType: string,
        logOption: LogOption | undefined,
        currentResult: any,
        currentContext: any,
        duration?: number
    ): { log: PipelineLog; transaction?: any } {

        const userId = this.authenticatedUserId
        const safeContext = getSafeLogContext(currentContext);

        let metadata: LogMetadata | undefined;

        if (logOption) {
            if (typeof logOption === 'function') {
                try {
                    metadata = logOption(currentResult, currentContext);
                } catch (e) {
                    console.error('Pipeline Logging Callback Error:', e);
                    metadata = {
                        description: 'Failed to generate log metadata',
                        module: 'Pipeline',
                        action: 'LogError',
                        error: String(e)
                    };
                }
            } else {
                metadata = logOption;
            }
        }
        
        const defaultMetadata: Omit<LogMetadata, 'dbTransaction'> = {
            description: `Operation ${operationType} executed`,
            module: 'Pipeline',
            action: operationType,
        };

        const finalMetadata: Omit<LogMetadata, 'dbTransaction'> = 
            metadata ? { ...defaultMetadata, ...metadata } : defaultMetadata;
            
        const dbTransaction = metadata?.dbTransaction;
        
        return {
            log: {
                timestamp: new Date(),
                ...(userId !== undefined && { userId }),
                operationType,
                metadata: finalMetadata,
                context: safeContext,
                ...(duration !== undefined && { duration })
            },
            transaction: dbTransaction
        };
    }

    private async persistlog(): Promise<void> {
        
        if (this.log.length === 0) return;

        try {
            const logWithoutTransaction: PipelineLog[] = [];
            const logByTransaction = new Map<any, PipelineLog[]>();

            for ( const { log, transaction } of this.log ) {
                if ( !transaction ) {
                    logWithoutTransaction.push(log);
                } else {
                    if ( !logByTransaction.has(transaction) ) {
                        logByTransaction.set(transaction, []);
                    }
                    logByTransaction.get(transaction)!.push(log);
                }
            }

            const promises: Promise<any>[] = [];

            if ( logWithoutTransaction.length > 0 ) {

                const formatted = logWithoutTransaction.map( (log) => {
                    return {
                        id: v7(),
                        metadata: {
                            ...log.metadata,
                            context: log.context,
                            timestamp: log.timestamp,
                        },
                        user_id: log.userId ?? log.metadata.userId,
                        created_at: DateTime.now(),
                        updated_at: DateTime.now(),
                    }
                });

                promises.push(
                    db.insertQuery().table('audit_logs').multiInsert(formatted)
                    .then(() => console.log('📝 Pipeline log saved (no transaction)'))
                    .catch(e => console.error('Failed to save logs', e))
                );
            }

            for ( const [transaction, logs] of logByTransaction.entries() ) {
                const formatted = logs.map( (mappedLog) => ({
                    id: v7(),
                    metadata: {
                        ...mappedLog.metadata,
                        context: mappedLog.context,
                        timestamp: mappedLog.timestamp,
                    },
                    user_id: mappedLog.userId ?? mappedLog.metadata.userId,
                    created_at: DateTime.now(),
                    updated_at: DateTime.now(),
                }));
                
                promises.push(
                    transaction.table('audit_logs').multiInsert(formatted)
                    .then(() => console.log('📝 Pipeline log saved (transaction)'))
                    .catch((e: any) => console.error('Failed to save logs', e))
                );
            }

            await Promise.allSettled(promises);

        } catch (error) {
            console.error('Failed to persist pipeline log:', error);
        }
    }

    private async executeOperations(): Promise<E.Either<E, { current: A; context: C }>> {

        let current = this.initialValue;
        let context = this.initialValue;
        this.log = [];

        try {
            for (const operation of this.operations) {

                const startTime = Date.now();
                const result = await this.executeOperation(operation, current, context);
                const duration = Date.now() - startTime;
                
                if (E.isLeft(result)) {
                    if (this.errorHandler) {
                        const handledResult = await this.errorHandler(result.left)();
                        if (E.isLeft(handledResult)) {
                            await this.persistlog(); 
                            return handledResult;
                        }
                        current = handledResult.right;
                    } else {
                        await this.persistlog(); 
                        return result as any;
                    }
                } else {
                    const { newCurrent, newContext } = result.right;
                    
                    if (operation.type === 'withAuth' && newContext) {
                        const user = (newContext as any).__user;
                        if (user && user.id) {
                            this.authenticatedUserId = user.id;
                        }
                    }

                    if (operation.log) { 
                        const logEntry = this.createLog(
                            operation.type,
                            operation.log,
                            newCurrent, 
                            newContext, 
                            duration
                        );
                        this.log.push(logEntry);
                    }
                 
                    current = newCurrent;
                    context = newContext;
                }
            }

            await this.persistlog();

            return E.right({ current, context });

        } catch (error) {

            await this.persistlog();
            
            if (this.errorHandler) {
                const handledResult = await this.errorHandler(error)();
                return handledResult as any;
            }
            return E.left(error as E);
        }
    }

    private async executeOperation(
        operation: Operation,
        current: any,
        context: any
    ): Promise<E.Either<any, { newCurrent: any; newContext: any }>> {
        try {
            switch (operation.type) {
                case 'withAuth':
                    try { 
                        const typedCurrent = current as any & Auth;
                        
                        
                        if ( ! (typedCurrent.auth instanceof Authenticator) ) {
                            return E.left(AppErrors.AuthError());
                        }

                        if (!typedCurrent.auth.user) {
                            return E.left(AppErrors.AuthError());
                        }

                        this.authenticatedUserId = typedCurrent.auth.user.id;

                        return E.right({
                            newCurrent: current,
                            newContext: { ...context, __user: typedCurrent.auth.user }
                        });
                    } catch (error) {
                        return E.left(AppErrors.AuthError());
                    }
                    
                case 'chain':
                    const chainOp = operation as ChainOperation;
                    const chainResult = chainOp.fn(current as A, context as C); 
                    const chainValue = await (typeof chainResult === 'function' ? chainResult() : TE.fromEither(chainResult)());

                    if (E.isLeft(chainValue)) return chainValue;
                    return E.right({
                        newCurrent: chainValue.right,
                        newContext: context
                    });

                case 'chainAsync':
                    const asyncOp = operation as ChainAsyncOperation;
                    try {
                        const asyncResult = await asyncOp.fn(current as A, context as C);
                        if (E.isLeft(asyncResult)) return asyncResult;
                        return E.right({
                            newCurrent: asyncResult.right,
                            newContext: context
                        });
                    } catch (error) {
                        return E.left(asyncOp.onError ? asyncOp.onError(error) : error);
                    }

                case 'chainAndStore':
                    const storeOp = operation as ChainAndStoreOperation;
                    const storeResult = storeOp.fn(current as A, context as C);
                    const storeValue = await (typeof storeResult === 'function' ? storeResult() : TE.fromEither(storeResult)());
                    
                    if (E.isLeft(storeValue)) return storeValue;
                    return E.right({
                        newCurrent: storeValue.right,
                        newContext: { ...context, [`__${storeOp.key}`]: storeValue.right }
                    });

                case 'chainAsyncAndStore':
                    const asyncStoreOp = operation as ChainAsyncAndStoreOperation;
                    try {
                        const asyncStoreResult = await asyncStoreOp.fn(current as A, context as C);
                        if (E.isLeft(asyncStoreResult)) return asyncStoreResult;
                        return E.right({
                            newCurrent: asyncStoreResult.right,
                            newContext: { ...context, [`__${asyncStoreOp.key}`]: asyncStoreResult.right }
                        });
                    } catch (error) {
                        return E.left(asyncStoreOp.onError ? asyncStoreOp.onError(error) : error);
                    }

                case 'chainConditional': {
                    const conditionalOp = operation as ChainConditionalOperation;
                    const key = `__${conditionalOp.conditionKey}`;
                    const shouldRun = context?.[key] !== undefined && context?.[key] !== false && context?.[key] !== null;

                    if (!shouldRun) return E.right({ newCurrent: current, newContext: context });

                    const res = conditionalOp.fn(current as A, context as C);
                    const val = await (typeof res === 'function' ? res() : TE.fromEither(res)());

                    if (E.isLeft(val)) return val;
                    return E.right({ newCurrent: val.right, newContext: context });
                }

                case 'chainConditionalAndStore': {
                    const condStoreOp = operation as ChainConditionalAndStoreOperation;
                    const key = `__${condStoreOp.conditionKey}`;
                    const shouldRun = context?.[key] !== undefined && context?.[key] !== false && context?.[key] !== null;

                    if (!shouldRun) return E.right({ newCurrent: current, newContext: context });

                    const res = condStoreOp.fn(current as A, context as C);
                    const val = await (typeof res === 'function' ? res() : TE.fromEither(res)());

                    if (E.isLeft(val)) return val;
                    return E.right({
                        newCurrent: val.right,
                        newContext: { ...context, [`__${condStoreOp.storeKey}`]: val.right }
                    });
                }
                
                // Existing case: chainWhen implementation
                case 'chainWhen': {
                    const whenOp = operation as ChainWhenOperation;
                    
                    // 1. Evaluate the condition function with current data and context
                    const shouldRun = whenOp.condition(current as A, context as C);

                    if (!shouldRun) {
                        // If condition is false, skip and pass the current value and context forward
                        return E.right({ newCurrent: current, newContext: context });
                    }

                    // 2. Execute the action function
                    const res = whenOp.fn(current as A, context as C);
                    const val = await (typeof res === 'function' ? res() : TE.fromEither(res)());

                    // 3. Return result
                    if (E.isLeft(val)) return val;
                    return E.right({ newCurrent: val.right, newContext: context });
                }

                // Existing case: chainWhenAndStore implementation
                case 'chainWhenAndStore': {
                    const whenStoreOp = operation as ChainWhenAndStoreOperation;
                    
                    // 1. Evaluate the condition function with current data and context
                    const shouldRun = whenStoreOp.condition(current as A, context as C);

                    if (!shouldRun) {
                        // If condition is false, skip and pass the current value and context forward
                        return E.right({ newCurrent: current, newContext: context });
                    }

                    // 2. Execute the action function
                    const res = whenStoreOp.fn(current as A, context as C);
                    const val = await (typeof res === 'function' ? res() : TE.fromEither(res)());

                    // 3. Return result
                    if (E.isLeft(val)) return val;
                    return E.right({
                        newCurrent: val.right,
                        // Store the result in the context under the specified key
                        newContext: { ...context, [`__${whenStoreOp.storeKey}`]: val.right }
                    });
                }

                // NEW CASE: chainIfElse implementation
                case 'chainIfElse': {
                    const ifElseOp = operation as ChainIfElseOperation;
                    
                    // 1. Evaluate the condition
                    const shouldRunTrue = ifElseOp.condition(current as A, context as C);
                    
                    // 2. Select the appropriate function
                    const fn = shouldRunTrue ? ifElseOp.onTrue : ifElseOp.onFalse;
                    
                    // 3. Execute the selected function
                    const res = fn(current as A, context as C);
                    const val = await (typeof res === 'function' ? res() : TE.fromEither(res)());

                    // 4. Return result
                    if (E.isLeft(val)) return val;
                    return E.right({ newCurrent: val.right, newContext: context });
                }

                // NEW CASE: chainIfElseAndStore implementation
                case 'chainIfElseAndStore': {
                    const ifElseStoreOp = operation as ChainIfElseAndStoreOperation;
                    
                    // 1. Evaluate the condition
                    const shouldRunTrue = ifElseStoreOp.condition(current as A, context as C);
                    
                    // 2. Select the appropriate function
                    const fn = shouldRunTrue ? ifElseStoreOp.onTrue : ifElseStoreOp.onFalse;
                    
                    // 3. Execute the selected function
                    const res = fn(current as A, context as C);
                    const val = await (typeof res === 'function' ? res() : TE.fromEither(res)());

                    // 4. Return result and store it
                    if (E.isLeft(val)) return val;
                    return E.right({
                        newCurrent: val.right,
                        newContext: { ...context, [`__${ifElseStoreOp.storeKey}`]: val.right }
                    });
                }

                case 'parallel':
                    const parallelOp = operation as ParallelOperation;
                    const taskEntries = Object.entries(parallelOp.fn).map(([key, fn]) => 
                        pipe(
                            (fn as any)(current as A, context as C) as TE.TaskEither<any, any>,
                            TE.map(result => [key, result] as const)
                        )
                    );
                    const parallelResults = await pipe(TE.sequenceArray(taskEntries), TE.map(Object.fromEntries))();
                    
                    if (E.isLeft(parallelResults)) return parallelResults;
                    
                    const updatedContext = Object.entries(parallelResults.right).reduce(
                        (acc, [key, value]) => ({ ...acc, [`__${key}`]: value }),
                        context
                    );
                    
                    return E.right({
                        newCurrent: parallelResults.right,
                        newContext: updatedContext
                    });

                case 'batch':
                    const batchOp = operation as BatchOperation;
                    const results: any = {};
                    for (const [key, op] of Object.entries(batchOp.fn)) {
                        const result = (op as any)(current as A, context as C) as E.Either<any, any>;
                        if (E.isLeft(result)) return result;
                        results[key] = result.right;
                    }
                    return E.right({
                        newCurrent: results,
                        newContext: context
                    });

                default:
                    return E.right({ newCurrent: current, newContext: context });
            }
        } catch (error) {
            return E.left(error);
        }
    }

    async run(): Promise<E.Either<E, A>> {
        const result = await this.executeOperations();
        if (E.isLeft(result)) {
            return result;
        }
        return E.right(result.right.current);
    }

    async runWithContext(): Promise<E.Either<E, { current: A; context: C }>> {
        return await this.executeOperations();
    }

    trace(label: string): PipelineBuilder<E, A, C> {
        console.log(`🔍 Pipeline traced: ${label}`);
        return this;
    }

    getlog(): PipelineLog[] {
        return this.log.map(({ log }) => ({ ...log }));
    }
}