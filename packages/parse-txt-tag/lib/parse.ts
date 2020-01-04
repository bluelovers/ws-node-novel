/**
 * Created by user on 2020/1/4.
 */

import { reTxtHtmlTag, reTxtImgTag, IAllowedHtmlTagList } from './tags';
import { toHalfWidth } from 'str-util/lib/fullhalf';
import { ITSPartialRecord } from 'ts-type';
import { _fixRubyInnerContext } from './util';

export interface IAttachMap
{
	images?: Record<string, string>;
}

export interface IParseCacheMap extends Record<string, any>
{

}

export interface IParseOnMapCallbackData<C extends IParseCacheMap, A extends IAttachMap>
{
	tagName: IParseOnTag,
	attr: string,
	innerContext: string,
	cache: C,
	attach: A,
}

export interface IIParseOnMap<C extends IParseCacheMap, A extends IAttachMap> extends ITSPartialRecord<IParseOn, (data: IParseOnMapCallbackData<C, A>) => string | null>
{

}

export type IParseOnTag = IAllowedHtmlTagList | 'img';
export type IParseOn = IAllowedHtmlTagList | 'default';

export interface IParseOptions<C extends IParseCacheMap, A extends IAttachMap>
{
	on?: IIParseOnMap<C, A>,
	cache?: C,
	attach?: A,
}

export function parse<C extends IParseCacheMap, A extends IAttachMap>(source: string, options: IParseOptions<C, A>)
{
	let context = source;

	const { cache = {} as C, attach = {} as A } = options;
	attach.images = attach.images || {};

	if (options.on)
	{
		context = context
			.replace(reTxtHtmlTag, (s, tagName = '' as IAllowedHtmlTagList, attr = '', innerContext = '') =>
			{

				tagName = toHalfWidth(tagName).toLowerCase();

				let cb = options.on[tagName] || options.on.default;

				if (tagName === 'ruby')
				{
					innerContext = _fixRubyInnerContext(innerContext)
				}

				if (cb)
				{
					let ret = cb({
						tagName,
						attr,
						innerContext,
						cache,
						attach,
					});

					if (ret != null)
					{
						return ret;
					}
				}

				return `<${tagName}>` + innerContext + `</${tagName}>`;
			})
		;

		let tagName = 'img' as const;
		let cb = options.on[tagName] || options.on.default;

		if (cb)
		{
			context = context
				.replace(reTxtImgTag, (s, id: string) =>
				{

					let ret = cb({
						tagName,
						attr: '',
						innerContext: id,
						cache,
						attach,
					});

					if (ret != null)
					{
						return ret;
					}

					return s;
				})
			;
		}
	}

	return {
		context,
		cache,
		attach,
	};
}
