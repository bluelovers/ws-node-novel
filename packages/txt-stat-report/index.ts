/**
 * Created by user on 2019/2/23.
 */

import UString from 'uni-string';
import { array_unique } from 'array-hyper-unique';
import { crlf, LF } from 'crlf-normalize';
import { execall } from 'execall2';
import { removeBom, removeLine, removePunctuation, removeSpace } from './lib/util';

/**
 * txt-stat-report 模組
 * txt-stat-report module
 */
export type ITxtReport = ReturnType<typeof txtReport>;

/**
 * 產生文字統計報告
 * Generate text statistics report
 *
 * @param {string} input - 輸入文字 / Input text
 * @returns {ITxtReport} 統計報告 / Statistics report
 */
export function txtReport(input: string)
{
	let buf_length = Buffer.from(input).length;

	input = crlf(removeBom(input), LF);

	let js_length = input.length;
	let uni_length = UString.size(input);

	let line_length = execall(/\n/g, input).length;

	let no_blank_line_length: number;

	{
		let s = removeSpace(input)
			.replace(/\n{2,}/g, '\n')
			.replace(/^\n+|\n+$/g, '')
		;

		no_blank_line_length = execall(/\n/g, s).length;

		if (removeLine(s).length)
		{
			no_blank_line_length += 1;
		}
	}

	let hanzi_length = execall(/[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/ug, input).length;
	let ja_length = execall(/[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/ug, input).length;

	let punctuation_length: number;

	{
		let s = removePunctuation(input);

		punctuation_length = js_length - s.length;
	}

	let space_length: number;

	{
		let s = removeSpace(input);

		space_length = js_length - s.length;
	}

	return {
		/**
		 * buffer
		 */
		buf_length,

		/**
		 * js string (轉換分行為 LF 之後的長度)
		 */
		js_length,
		/**
		 * uni-string 一般狀況下會等於 js string
		 * 但如果有特殊字元或者 emoji 之類 就會產生差異
		 */
		uni_length,
		/**
		 * line 斷行
		 */
		line_length,

		/**
		 * line 斷行 (不包含空白行)
		 */
		no_blank_line_length,

		/**
		 * 漢字 (包含中文以外的漢字)
		 */
		hanzi_length,
		/**
		 * hiragana (平假名) + katakana (片假名)
		 */
		ja_length,

		/**
		 * punctuation 標點符號 與 其他符號
		 */
		punctuation_length,

		/**
		 * 非斷行以外的空白
		 */
		space_length,
	}
}

/**
 * 將多個報告總和起來
 * Sum multiple reports
 *
 * @template T - 報告型別 / Report type
 * @param {T[]} arr - 報告陣列 / Report array
 * @returns {T} 總和報告 / Summed report
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

