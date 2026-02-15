/**
 * 文字標籤解析器
 * Text Tag Parser
 *
 * 此模組提供解析文字中 HTML 標籤的功能，
 * 支援自定義標籤處理回調函數。
 *
 * This module provides functionality for parsing HTML tags in text,
 * supporting custom tag processing callback functions.
 *
 * @module parse-txt-tag/lib/parse
 * @author user
 * @created 2020/1/4
 */

import { reTxtHtmlTag, reTxtImgTag, IAllowedHtmlTagList } from './tags';
import { toHalfWidth } from '@lazy-cjk/fullhalf';
import { _fixRubyInnerContext } from './util';
import { IParseOptions, IParseOnTag, IParseOnMapCallback, IParseCacheMap, IAttachMap } from './types';

/**
 * 解析文字中的標籤
 * Parse tags in text
 *
 * 解析來源文字中的 HTML 標籤，並根據選項中的回調函數進行處理。
 * Parses HTML tags in source text and processes them according to callback functions in options.
 *
 * @template C - 快取映射類型 / Cache map type
 * @template A - 附件映射類型 / Attachment map type
 * @template T - 標籤名稱類型 / Tag name type
 * @param source - 要解析的來源文字 / Source text to parse
 * @param options - 解析選項 / Parse options
 * @param options.on - 標籤處理回調映射 / Tag processing callback map
 * @param options.cache - 快取物件 / Cache object
 * @param options.attach - 附件物件 / Attachment object
 * @returns 解析結果，包含處理後的內容、快取和附件 / Parse result containing processed context, cache, and attach
 *
 * @example
 * ```typescript
 * const result = parse('文字內容', {
 *   on: {
 *     ruby: (data) => `<ruby>${data.innerContext}</ruby>`,
 *   }
 * });
 * ```
 */
export function parse<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag>(source: string, options: IParseOptions<C, A, T>)
{
	// 來源文字內容 / Source text content
	let context = source;

	// 解構選項，設置預設值 / Destructure options, set default values
	const { cache = {} as C, attach = {} as A } = options;
	attach.images = attach.images || {};

	// 如果有設置標籤處理回調 / If tag processing callbacks are set
	if (options.on)
	{
		// 處理 HTML 標籤 / Process HTML tags
		context = context
			.replace(reTxtHtmlTag, (s, tagName = '' as IAllowedHtmlTagList, attr = '', innerContext = '') =>
			{

				// 將標籤名轉換為半形小寫 / Convert tag name to half-width lowercase
				tagName = toHalfWidth(tagName).toLowerCase();

				// 獲取對應的回調函數 / Get corresponding callback function
				let cb = options.on[tagName] || options.on.default;

				// 如果是 ruby 標籤，修正內部內容 / If ruby tag, fix inner context
				if (tagName === 'ruby')
				{
					innerContext = _fixRubyInnerContext(innerContext)
				}

				// 如果有回調函數，執行處理 / If callback exists, execute processing
				if (cb)
				{
					let ret = cb({
						tagName,
						attr,
						innerContext,
						cache,
						attach,
					});

					// 如果回調返回非 null 值，使用該值作為替換結果 / If callback returns non-null value, use it as replacement
					if (ret != null)
					{
						return ret;
					}
				}

				// 預設處理：保留標籤結構 / Default processing: preserve tag structure
				return `<${tagName}>` + innerContext + `</${tagName}>`;
			})
		;

		// 處理圖片標籤 / Process image tags
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

	// 返回解析結果 / Return parse result
	return {
		context,
		cache,
		attach,
	};
}
