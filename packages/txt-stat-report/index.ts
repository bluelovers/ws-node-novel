/**
 * 文字統計報告模組
 * Text Statistics Report Module
 *
 * 此模組提供文字統計功能，包括字數計算、行數統計、漢字/假名計數等。
 * This module provides text statistics functionality, including character count,
 * line count, kanji/kana counting, etc.
 *
 * @module txt-stat-report
 * @author user
 * @created 2019/2/23
 */

import UString from 'uni-string';
import { array_unique } from 'array-hyper-unique';
import { crlf, LF } from 'crlf-normalize';
import { execall } from 'execall2';
import { removeBom, removeLine, removePunctuation, removeSpace } from './lib/util';

/**
 * 文字報告類型
 * Text report type
 *
 * txt-stat-report 模組的返回類型。
 * Return type of txt-stat-report module.
 */
export type ITxtReport = ReturnType<typeof txtReport>;

/**
 * 產生文字統計報告
 * Generate text statistics report
 *
 * 分析輸入文字並產生詳細的統計報告，包括：
 * Analyzes input text and generates detailed statistics report, including:
 * - Buffer 長度 / Buffer length
 * - JavaScript 字串長度 / JavaScript string length
 * - Unicode 字串長度 / Unicode string length
 * - 行數統計 / Line count statistics
 * - 漢字數量 / Kanji count
 * - 日文假名數量 / Japanese kana count
 * - 標點符號數量 / Punctuation count
 * - 空白字元數量 / Whitespace count
 *
 * @param input - 輸入文字 / Input text
 * @returns 統計報告物件 / Statistics report object
 */
export function txtReport(input: string)
{
	// 計算原始 buffer 長度 / Calculate raw buffer length
	let buf_length = Buffer.from(input).length;

	// 統一換行符並移除 BOM / Unify line breaks and remove BOM
	input = crlf(removeBom(input), LF);

	// JavaScript 字串長度 / JavaScript string length
	let js_length = input.length;
	// Unicode 字串長度（處理特殊字元和 emoji）/ Unicode string length (handles special characters and emoji)
	let uni_length = UString.size(input);

	// 計算總行數 / Calculate total line count
	let line_length = execall(/\n/g, input).length;

	// 計算非空白行數 / Calculate non-blank line count
	let no_blank_line_length: number;

	{
		let s = removeSpace(input)
			.replace(/\n{2,}/g, '\n')
			.replace(/^\n+|\n+$/g, '')
		;

		no_blank_line_length = execall(/\n/g, s).length;

		// 如果還有內容，行數加一 / If there's still content, increment line count
		if (removeLine(s).length)
		{
			no_blank_line_length += 1;
		}
	}

	// 計算漢字數量（包含中日韓漢字）/ Calculate kanji count (including CJK characters)
	let hanzi_length = execall(/[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/ug, input).length;
	// 計算日文假名數量（平假名 + 片假名）/ Calculate Japanese kana count (hiragana + katakana)
	let ja_length = execall(/[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/ug, input).length;

	// 計算標點符號數量 / Calculate punctuation count
	let punctuation_length: number;

	{
		let s = removePunctuation(input);

		punctuation_length = js_length - s.length;
	}

	// 計算空白字元數量 / Calculate whitespace count
	let space_length: number;

	{
		let s = removeSpace(input);

		space_length = js_length - s.length;
	}

	return {
		/**
		 * Buffer 長度（位元組）
		 * Buffer length (bytes)
		 */
		buf_length,

		/**
		 * JavaScript 字串長度（轉換分行為 LF 之後的長度）
		 * JavaScript string length (after converting line breaks to LF)
		 */
		js_length,
		/**
		 * Unicode 字串長度
		 * Unicode string length
		 *
		 * 一般狀況下會等於 js string，但如果有特殊字元或者 emoji 之類就會產生差異。
		 * Normally equals js string, but differs with special characters or emoji.
		 */
		uni_length,
		/**
		 * 總行數
		 * Total line count
		 */
		line_length,

		/**
		 * 非空白行數
		 * Non-blank line count
		 */
		no_blank_line_length,

		/**
		 * 漢字數量（包含中文以外的漢字）
		 * Kanji count (including non-Chinese kanji)
		 */
		hanzi_length,
		/**
		 * 日文假名數量（平假名 + 片假名）
		 * Japanese kana count (hiragana + katakana)
		 */
		ja_length,

		/**
		 * 標點符號數量
		 * Punctuation count
		 */
		punctuation_length,

		/**
		 * 非斷行以外的空白數量
		 * Non-line-break whitespace count
		 */
		space_length,
	}
}

/**
 * 將多個報告總和起來
 * Sum multiple reports
 *
 * 將多個文字統計報告合併為一個總和報告。
 * Merges multiple text statistics reports into a summed report.
 *
 * @template T - 報告型別 / Report type
 * @param arr - 報告陣列 / Report array
 * @returns 總和報告 / Summed report
 */
export function txtReportSum<T extends ITxtReport>(arr: T[])
{
	return arr.reduce(function (a, b)
	{
		Object.entries(b)
			.forEach(function ([k, v])
			{
				a[k] = (a[k] || 0) + v;
			})
		;

		return a
	}, {} as any as T)
}

