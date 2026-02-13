/**
 * Created by user on 2018/1/27/027.
 */

import { deepmergeOptions } from './lib/const';
import { parse as _parse, stringify as _stringify, RawObject, mdconf } from 'mdconf2';
import { crlf, LF } from 'crlf-normalize';
import { deepmerge } from 'deepmerge-plus';
import { array_unique } from 'array-hyper-unique';
import JsonMd from './json';
import { envVal, envBool } from 'env-bool';
import { toHex } from 'hex-lib';
import { expect } from 'chai';
import { chkInfo, sortKeys, isHexValue } from './lib/util';
import { IOptionsParse, IMdconfMeta } from './lib/types';

/**
 * node-novel-info 模組
 * node-novel-info module
 */
export * from './lib/util';
export * from './lib/types';
export { IMdconfMeta, IOptionsParse } from './lib/types';
export * from './version';

export { mdconf }
export { deepmergeOptions }
export { envVal, envBool }

/**
 * 預設解析選項
 * Default parse options
 */
export const defaultOptionsParse: IOptionsParse = {
	removeRawData: true,
	disableKeyToLowerCase: true,
};

/**
 * 將資料轉換為 mdconf 字串
 * Convert data to mdconf string
 *
 * @param {any} data - 輸入資料 / Input data
 * @param {any} [d2] - 第二個參數 / Second parameter
 * @param {...any[]} argv - 其他參數 / Other parameters
 * @returns {string} mdconf 字串 / mdconf string
 */
export function stringify(data, d2?, ...argv): string
{
	data = _handleDataForStringify(data, d2, ...argv);

	return _stringify(data) + LF.repeat(2);
}

/**
 * 解析 mdconf 字串
 * Parse mdconf string
 *
 * @template T - 回傳型別 / Return type
 * @param {string | {toString(): string}} data - 輸入資料 / Input data
 * @param {IOptionsParse} [options] - 解析選項 / Parse options
 * @returns {T} 解析後的物件 / Parsed object
 */
export function parse<T = IMdconfMeta>(data: {
	toString(): string,
}, options?: IOptionsParse): T
export function parse<T = IMdconfMeta>(data: string, options?: IOptionsParse): T
export function parse<T extends IMdconfMeta>(data, options: IOptionsParse = {}): T
{
	if (options.removeRawData)
	{
		options.oldParseApi = options.removeRawData;
	}

	if (options.disableKeyToLowerCase == null)
	{
		options.disableKeyToLowerCase = true;
	}

	let ret = _parse(crlf(data.toString()), options) as IMdconfMeta;

	try
	{
		if (ret.novel?.preface)
		{
			ret.novel.preface = (Array.isArray(ret.novel.preface)) ? ret.novel.preface.join(LF) : ret.novel.preface
			;
		}

		if (!options.lowCheckLevel || ret.options)
		{
			ret.options = deepmerge(ret.options || {}, {

				textlayout: {},

			}, deepmergeOptions);
		}
	}
	catch (e)
	{
		console.error(e.toString());
	}

	if (options.chk || options.chk == null)
	{
		ret = chkInfo(ret, options);
	}

	if (options.throw || options.throw == null)
	{
		ret = chkInfo(ret, {
			...options,
			throw: true,
		});

		if (!ret)
		{
			throw new Error('not a valid node-novel-info mdconf');
		}
	}

	if (ret)
	{
		ret = sortKeys(ret);

		//console.log(777);
	}

	// @ts-ignore
	return ret;
}

/**
 * 處理資料
 * Handle data
 *
 * @template T - 回傳型別 / Return type
 * @param {any} data - 輸入資料 / Input data
 * @param {any} [d2] - 第二個參數 / Second parameter
 * @param {...any[]} argv - 其他參數 / Other parameters
 * @returns {T} 處理後的資料 / Processed data
 */
export function _handleData<T extends IMdconfMeta>(data, d2?, ...argv): T
{
	// @ts-ignore
	data = JsonMd.toNovelInfo(data, d2 || {}, {
		novel: {
			tags: [],
		},
	}, ...argv);

	data = sortKeys(data);
	data.novel.tags.unshift('node-novel');
	data.novel.tags = array_unique(data.novel.tags);

	// @ts-ignore
	return data;
}

/**
 * 處理資料以供轉換為字串
 * Handle data for string conversion
 *
 * @template T - 回傳型別 / Return type
 * @param {any} data - 輸入資料 / Input data
 * @param {any} [d2] - 第二個參數 / Second parameter
 * @param {...any[]} argv - 其他參數 / Other parameters
 * @returns {T} 處理後的資料 / Processed data
 */
export function _handleDataForStringify<T extends IMdconfMeta>(data, d2?, ...argv): T
{
	data = _handleData(data, d2, ...argv);

	if (typeof data.novel?.preface == 'string')
	{
		data.novel.preface = new RawObject(data.novel.preface, {} as any);
	}

	if ('novel_status' in data.novel && !isHexValue(data.novel.novel_status))
	{
		expect(data.novel.novel_status).a('number');

		data.novel.novel_status = toHex(data.novel.novel_status, 4);
	}

	// @ts-ignore
	return data;
}

/**
 * mdconf 解析函數別名
 * mdconf parse function alias
 */
export const mdconf_parse = parse;

/**
 * node-novel-info 模組預設匯出
 * node-novel-info module default export
 */
export default exports as typeof import('./index');
