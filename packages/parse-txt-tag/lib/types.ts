/**
 * Created by user on 2020/1/5.
 */

import { IAllowedHtmlTagList } from './tags';

export interface IAttachMap
{
	images?: Record<string, string>;
}

export interface IParseCacheMap extends Record<string, any>
{

}

export interface IParseOnMapCallbackData<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag>
{
	tagName: T,
	attr: string,
	innerContext: string,
	cache: C,
	attach: A,
}

export type IParseOnMapCallback<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag> = (data: IParseOnMapCallbackData<C, A, T>) => string | null;
export type IParseOnMapBase<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag> = {
	[P in Exclude<T, IParseOn>]?: IParseOnMapCallback<C, A, P>;
} & {
	s?: IParseOnMapCallback<C, A, 's'>;
	ruby?: IParseOnMapCallback<C, A, 'ruby'>;
	i?: IParseOnMapCallback<C, A, 'i'>;
	b?: IParseOnMapCallback<C, A, 'b'>;
	sup?: IParseOnMapCallback<C, A, 'sup'>;
	sub?: IParseOnMapCallback<C, A, 'sub'>;
	img?: IParseOnMapCallback<C, A, 'img'>;
}

export type IParseOnMap<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag> =
	IParseOnMapBase<C, A, Exclude<T, 'default'>>
	& {
	default?: IParseOnMapCallback<C, A, Exclude<T, 'default'>>,
}
export type IParseOnTag = IAllowedHtmlTagList | 'img';
export type IParseOn = IParseOnTag | 'default';

export interface IParseOptions<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag>
{
	on?: IParseOnMap<C, A, T>,
	cache?: C,
	attach?: A,
}
