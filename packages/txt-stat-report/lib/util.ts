/**
 * 文字統計報告工具函數
 * Text Statistics Report Utility Functions
 *
 * 此模組提供文字統計所需的各種工具函數。
 * This module provides various utility functions for text statistics.
 *
 * @module txt-stat-report/lib/util
 * @author user
 * @created 2019/2/23
 */

import { array_unique, array_unique_overwrite } from 'array-hyper-unique';

/**
 * 標點符號正則表達式
 * Punctuation regular expression
 *
 * 匹配各種標點符號和特殊符號。
 * Matches various punctuation and special symbols.
 */
export const regexpPunctuation = regexMerge([
	/\p{Punctuation}+/gu,
	/[\u2000-\u206F\u2E00-\u2E7F\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\uffe0-\uffef\u2500-\u257f\u2200-\u22ff\u25A0-\u25FF\u2600-\u26F0\u2190-\u21FF\u02b9-\u02df\u02E4-\u02f0\u2580-\u259F]+/ug,
	/[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]/gu,
	/[\u00A1-\u00BF\u00D7\u00F7]/gu,
	/[\u2100-\u214F]/gu,
]);

/**
 * 移除標點符號
 * Remove punctuation
 *
 * 從輸入文字中移除所有標點符號和特殊符號。
 * Removes all punctuation and special symbols from input text.
 *
 * @param input - 輸入文字 / Input text
 * @returns 移除標點符號後的文字 / Text with punctuation removed
 */
export function removePunctuation(input: string)
{
	return input
		.replace(regexpPunctuation, '')
		//.replace(/\p{Punctuation}+/gu, '')
		//.replace(/[\u2000-\u206F\u2E00-\u2E7F\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\uffe0-\uffef\u2500-\u257f\u2200-\u22ff\u25A0-\u25FF\u2600-\u26F0\u2190-\u21FF\u02b9-\u02df\u02E4-\u02f0\u2580-\u259F]/ug, '')
		//.replace(/[⋯]+/gu, '')
		//.replace(/['!"#$%&()*+,\-.\/\\:;<=>?@\[\]^_`{|}~°№÷×−¦]/ug, '')
		;
}

/**
 * 移除空白字元
 * Remove whitespace
 *
 * 從輸入文字中移除空白字元，但保留換行符。
 * Removes whitespace from input text, but preserves line breaks.
 *
 * @param input - 輸入文字 / Input text
 * @returns 移除空白後的文字 / Text with whitespace removed
 */
export function removeSpace(input: string)
{
	return input
		.replace(/\s+/g, function (s)
		{
			return s.replace(/[^\r\n]+/g, '')
		})
		.replace(/[\xA0 　]+/gu, '')
		;
}

/**
 * 移除換行符
 * Remove line breaks
 *
 * 從輸入文字中移除所有換行符。
 * Removes all line breaks from input text.
 *
 * @param input - 輸入文字 / Input text
 * @returns 移除換行符後的文字 / Text with line breaks removed
 */
export function removeLine(input: string)
{
	return input
		.replace(/[\r\n]+/gu, '')
		;
}

/**
 * 合併多個正則表達式
 * Merge multiple regular expressions
 *
 * 將多個正則表達式合併為一個，使用 | 運算符連接。
 * Merges multiple regular expressions into one, using | operator.
 *
 * @template T - 正則表達式類型 / RegExp type
 * @param list - 正則表達式陣列 / Array of regular expressions
 * @returns 合併後的正則表達式 / Merged regular expression
 */
export function regexMerge<T extends RegExp>(list: T[])
{
	let source: string[] = [];
	let flags: string[] = [];

	// 收集所有正則表達式的 source 和 flags / Collect all sources and flags
	list.forEach(function (a)
	{
		source.push(a.source);

		a.flags && flags.push(...a.flags.split(''));
	});

	// 移除重複 / Remove duplicates
	array_unique_overwrite(source);
	array_unique_overwrite(flags);

	return new RegExp(source.join('|'), flags.join(''));
}

/**
 * 移除 BOM 字元
 * Remove BOM character
 *
 * 從輸入文字中移除 UTF-8 BOM 字元。
 * Removes UTF-8 BOM character from input text.
 *
 * @param input - 輸入文字 / Input text
 * @returns 移除 BOM 後的文字 / Text with BOM removed
 */
export function removeBom(input: string)
{
	return input
		.replace(/\uFEFF/gu, '')
		;
}
