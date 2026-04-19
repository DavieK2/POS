import * as TE from 'fp-ts/lib/TaskEither.js';

export default class ResponseMessage {

    static successMessage( message: string, params?: {}) {
        return TE.right(
            {
                message,
                ...params
            }
        )
    }
}