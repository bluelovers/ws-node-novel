/**
 * Created by user on 2020/1/4.
 */
import { IAllowedHtmlTagList } from './tags';
import { ITSPartialRecord } from 'ts-type';
export interface IAttachMap {
    images?: Record<string, string>;
}
export interface IParseCacheMap extends Record<string, any> {
}
export interface IParseOnMapCallbackData<C extends IParseCacheMap, A extends IAttachMap> {
    tagName: IParseOnTag;
    attr: string;
    innerContext: string;
    cache: C;
    attach: A;
}
export interface IIParseOnMap<C extends IParseCacheMap, A extends IAttachMap> extends ITSPartialRecord<IParseOn, (data: IParseOnMapCallbackData<C, A>) => string | null> {
}
export declare type IParseOnTag = IAllowedHtmlTagList | 'img';
export declare type IParseOn = IAllowedHtmlTagList | 'default';
export interface IParseOptions<C extends IParseCacheMap, A extends IAttachMap> {
    on?: IIParseOnMap<C, A>;
    cache?: C;
    attach?: A;
}
export declare function parse<C extends IParseCacheMap, A extends IAttachMap>(source: string, options: IParseOptions<C, A>): {
    context: string;
    cache: C;
    attach: A;
};
