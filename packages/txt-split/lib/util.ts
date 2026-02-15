/**
 * 文字分割工具函數
 * Text Split Utility Functions
 *
 * 此模組提供文字分割所需的各種工具函數。
 * This module provides various utility functions for text splitting.
 *
 * @module txt-split/lib/util
 */

import novelText from '@node-novel/layout';
import { console } from './console';
import { makeOptions } from './index';
import { IContext, IDataVolume, IOptions, IOptionsWithData, IPathLike, Resolvable } from './interface';
import Bluebird from 'bluebird';
import { encode, detect, IDetectData } from 'iconv-jschardet';
import { zh2num } from '@lazy-cjk/zh2num';
import { crlf, LF } from 'crlf-normalize';
import { zh2jp } from 'cjk-conv/lib/jp';

/**
 * 輸出警告訊息
 * Output warning message
 *
 * @param argv - 警告訊息參數 / Warning message arguments
 * @returns 警告訊息輸出結果 / Warning message output result
 */
export function logWarn(...argv)
{
	return console.warn(...argv)
}

/**
 * 檢查編碼
 * Check encoding
 *
 * 檢測資料的編碼格式並輸出警告訊息。
 * Detects the encoding format of data and outputs warning messages.
 *
 * @template O - 選項類型 / Options type
 * @param data - 要檢查的資料 / Data to check
 * @param file - 檔案路徑（可選）/ File path (optional)
 * @param options - 選項（可選）/ Options (optional)
 * @returns 編碼檢測結果 / Encoding detection result
 */
export function chkEncoding<O extends IOptions>(data: IContext, file?: string, options?: O): IDetectData
{
	let chk = detect(data);

	// 檢查空內容 / Check empty content
	if (data.length === 0)
	{
		logWarn(file, '此檔案沒有內容');
	}
	// 檢查非 UTF-8 編碼 / Check non-UTF-8 encoding
	else if (chk.encoding !== 'UTF-8')
	{
		logWarn(file, '此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk);
	}

	return chk
}

/**
 * 填充索引
 * Pad index
 *
 * 將數字填充為指定長度的字串，前後都會填充。
 * Pads a number to a string of specified length, padding both front and back.
 *
 * @param n - 要填充的數字或字串 / Number or string to pad
 * @param maxLength - 最大長度，預設為 5 / Maximum length, default is 5
 * @param fillString - 填充字元，預設為 '0' / Fill character, default is '0'
 * @returns 填充後的字串 / Padded string
 */
export function padIndex(n: number | string, maxLength: number = 5, fillString: string | number = '0')
{
	let s = padIndexStart(n, maxLength - 1, fillString);

	return padIndexEnd(s, maxLength, fillString);
}

/**
 * 前置填充索引
 * Pad index start
 *
 * 在字串前面填充指定字元。
 * Pads the front of a string with specified character.
 *
 * @param n - 要填充的數字或字串 / Number or string to pad
 * @param maxLength - 最大長度，預設為 4 / Maximum length, default is 4
 * @param fillString - 填充字元，預設為 '0' / Fill character, default is '0'
 * @returns 填充後的字串 / Padded string
 */
export function padIndexStart(n: number | string, maxLength: number = 4, fillString: string | number = '0')
{
	if (!['number', 'string'].includes(typeof n))
	{
		throw TypeError(`n must is string | number`)
	}

	return String(n).padStart(maxLength, String(fillString))
}

/**
 * 後置填充索引
 * Pad index end
 *
 * 在字串後面填充指定字元。
 * Pads the end of a string with specified character.
 *
 * @param n - 要填充的數字或字串 / Number or string to pad
 * @param maxLength - 最大長度，預設為 5 / Maximum length, default is 5
 * @param fillString - 填充字元，預設為 '0' / Fill character, default is '0'
 * @returns 填充後的字串 / Padded string
 */
export function padIndexEnd(n: number | string, maxLength: number = 5, fillString: string | number = '0')
{
	if (!['number', 'string'].includes(typeof n))
	{
		throw TypeError(`n must is string | number`)
	}

	return String(n).padEnd(maxLength, String(fillString))
}

/**
 * 包裝方法為 Bluebird Promise
 * Wrap method as Bluebird Promise
 *
 * 將普通函數轉換為返回 Bluebird Promise 的函數。
 * Converts a regular function to a function that returns a Bluebird Promise.
 *
 * @template R - 返回類型 / Return type
 * @template F - 函數類型 / Function type
 * @param fn - 要包裝的函數 / Function to wrap
 * @returns 包裝後的函數 / Wrapped function
 */
export function _wrapMethod<R, F extends (...args: unknown[]) => Resolvable<R>>(fn: F): (...args: Parameters<F>) => Bluebird<R>
{
	return Bluebird.method(fn)
}

/**
 * 處理讀取檔案
 * Handle read file
 *
 * 處理讀取的檔案內容，包括編碼檢測、轉換和文字清理。
 * Processes read file content, including encoding detection, conversion, and text cleaning.
 *
 * @template O - 選項類型 / Options type
 * @param data - 檔案內容 / File content
 * @param file - 檔案路徑 / File path
 * @param options - 選項 / Options
 * @returns 處理後的文字內容 / Processed text content
 */
export function _handleReadFile<O extends IOptions>(data: IContext, file: IPathLike, options?: O)
{
	let chk = chkEncoding(data, file, options);

	let txt: string;

	// 自動轉換編碼 / Auto convert encoding
	if (options && options.autoFsIconv && chk.encoding !== 'UTF-8')
	{
		logWarn('嘗試自動將內容轉換為 UTF-8', chk);

		let buf = encode(data);

		let bool = buf.equals((Buffer.isBuffer(data) ? data : Buffer.from(data)));

		if (bool)
		{
			let chk2 = detect(buf);

			logWarn(`內容變更`, chk, '=>', chk2);

			data = buf;
		}
		else
		{
			logWarn(`內容無變化`);
		}
	}

	txt = String(data);

	// 統一換行符並清理文字 / Unify line breaks and clean text
	return crlf(novelText.trim(txt), LF)
}

/**
 * 輸出檔案處理
 * Output file handling
 *
 * 處理輸出檔案的資料和選項。
 * Handles output file data and options.
 *
 * @template O - 選項類型 / Options type
 * @param data - 分割後的資料或帶選項的資料 / Split data or data with options
 * @param options - 選項 / Options
 * @returns 處理後的資料和選項 / Processed data and options
 */
export function _outputFile<O extends Partial<IOptionsWithData>>(data: IDataVolume | IOptionsWithData, options?: O): {
	data: IDataVolume,
	options: O,
}
{
	// 處理帶選項的資料 / Handle data with options
	if (data.data)
	{
		options = Object.assign({}, data.options, options);
		data = (data as IOptionsWithData).data;
	}

	options = makeOptions(options.file, options);

	return { data, options }
}

/**
 * 修正名稱
 * Fix name
 *
 * 清理和標準化章節名稱，包括繁簡轉換和數字轉換。
 * Cleans and standardizes chapter names, including traditional/simplified conversion and number conversion.
 *
 * @param name - 原始名稱 / Original name
 * @returns 修正後的名稱 / Fixed name
 */
export function fix_name(name: string): string
{
	name = novelText.trim(name, {
		trim: true,
	}).trim()
	//.replace('章', '話')
	;

	// 將中文數字轉換為阿拉伯數字 / Convert Chinese numbers to Arabic numbers
	if (!/^\d+/.test(name))
	{
		name = zh2num(name).toString();
	}

	name = name
	//.replace(/^(\d+)[\-話话\s]*/, '$1　')
		.replace(/[“”]/g, '')
	;

	// 轉換為日文漢字 / Convert to Japanese kanji
	name = zh2jp(name);

	//console.log([name]);

	return name;
}
