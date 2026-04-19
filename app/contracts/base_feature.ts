import * as E from 'fp-ts/lib/Either.js';
import PipelineBuilder from '../services/pipeline_builder.js';
export default abstract class BaseFeature<E,A> {

    abstract handle( params?: any ): Promise<E.Either<E, A>>;

    static use<A, C>( params: A) : PipelineBuilder<never, A, C>{
        return PipelineBuilder.use( params );
    }
}