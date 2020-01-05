/**
 * Created by user on 2020/1/4.
 */
import { IParseOptions, IParseOnTag, IParseCacheMap, IAttachMap } from './types';
export declare function parse<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag>(source: string, options: IParseOptions<C, A, T>): {
    context: string;
    cache: C;
    attach: A;
};
