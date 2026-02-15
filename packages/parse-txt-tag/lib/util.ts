/**
 * 文字標籤解析工具函數
 * Text Tag Parsing Utility Functions
 *
 * 此模組提供解析器所需的輔助函數。
 * This module provides helper functions required by the parser.
 *
 * @module parse-txt-tag/lib/util
 * @author user
 * @created 2020/1/4
 */

import { toHalfWidth } from '@lazy-cjk/fullhalf';
import { reHtmlRubyRt, reHtmlRubyRp, EnumHtmlTag } from './tags';

/**
 * 修正 Ruby 標籤內部內容
 * Fix Ruby Tag Inner Context
 *
 * 處理 ruby 標籤內的 rt 和 rp 標籤，確保正確的 HTML 格式。
 * Processes rt and rp tags within ruby tags, ensuring correct HTML format.
 *
 * @param innerContext - Ruby 標籤的內部內容 / Inner context of ruby tag
 * @returns 修正後的內容 / Fixed context
 */
export function _fixRubyInnerContext(innerContext: string)
{
	// 建立標籤替換函數 / Create tag replacement function
	let fn = _replaceHtmlTag(($0, $1, $2, $3) =>
	{
		return `<${$1}${$2}>${$3}</${$1}>`
	});

	// 替換 rt 和 rp 標籤 / Replace rt and rp tags
	return innerContext
		.replace(reHtmlRubyRt, fn)
		.replace(reHtmlRubyRp, fn)
		;
}

/**
 * 建立標籤替換函數
 * Create Tag Replacement Function
 *
 * 建立一個包裝函數，自動將匹配的標籤名和屬性轉換為半形。
 * Creates a wrapper function that automatically converts matched tag names and attributes to half-width.
 *
 * @param replacer - 原始替換函數 / Original replacer function
 * @returns 包裝後的替換函數 / Wrapped replacer function
 */
export function _replaceHtmlTag(replacer: ((substring: string, ...args: string[]) => string))
{
	return ($0: string, $1: string, $2: string, ...argv: string[]) =>
	{
		// 將標籤名轉換為半形 / Convert tag name to half-width
		$1 = toHalfWidth($1);
		// 將屬性轉換為半形 / Convert attributes to half-width
		$2 = toHalfWidth($2);

		return replacer($0, $1, $2, ...argv)
	}
}

/**
 * 轉換 HTML 標籤符號
 * Convert HTML Tag Symbols
 *
 * 將各種形式的 HTML 標籤符號統一轉換為標準形式。
 * Converts various forms of HTML tag symbols to standard form.
 *
 * @param input - 輸入字串 / Input string
 * @returns 轉換後的字串 / Converted string
 */
export function _convertHtmlTag001(input: string)
{
	return input
		// 將開啟標籤符號轉換為 < / Convert opening tag symbols to <
		.replace(new RegExp(EnumHtmlTag.OPEN, 'ig'), '<')
		// 將關閉標籤符號轉換為 > / Convert closing tag symbols to >
		.replace(new RegExp(EnumHtmlTag.CLOSE, 'ig'), '>')
		;
}
