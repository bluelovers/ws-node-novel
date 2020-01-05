/**
 * Created by user on 2020/1/4.
 */

import { reTxtHtmlTag, reTxtImgTag, IAllowedHtmlTagList } from './tags';
import { toHalfWidth } from 'str-util/lib/fullhalf';
import { _fixRubyInnerContext } from './util';
import { IParseOptions, IParseOnTag, IParseOnMapCallback, IParseCacheMap, IAttachMap } from './types';

export function parse<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag>(source: string, options: IParseOptions<C, A, T>)
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
		let cb = (options.on[tagName] || options.on.default as IParseOnMapCallback<C, A, 'img'>);

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
