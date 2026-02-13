/**
 * Created by user on 2020/1/15.
 */

import { inspect } from "util";
import { Token, Tokens } from 'marked';

/**
 * 用於標記原始資料的 Symbol
 * Symbol used to mark raw data
 */
export const SYMBOL_RAW_DATA = Symbol.for('raw_data');

/**
 * 用於標記原始值的 Symbol
 * Symbol used to mark raw value
 */
export const SYMBOL_RAW_VALUE = Symbol.for('raw_value');

/**
 * 原始物件資料類型
 * Raw object data type
 */
export type IRawObjectData = Token | IRawObjectBlockquote | IRawObjectDataPlus;

/**
 * 擴充的原始物件資料類型
 * Extended raw object data type
 */
export type IRawObjectDataPlus = IRawObjectTokenPlus<Tokens.HTML> | IRawObjectTokenPlus<Tokens.Code>;

/**
 * 原始物件類型
 * Raw object type
 */
export type IRawObjectPlus = RawObject<string, IRawObjectDataPlus>;

/**
 * 擴充的 Token 類型
 * Extended token type
 */
export type IRawObjectTokenPlus<T extends Tokens.HTML | Tokens.Code> = T & {
	paragraph: string[]
}

/**
 * 擴充的文字 Token 介面
 * Extended text token interface
 */
export interface ITokenText2 extends Omit<Tokens.Text, 'type'>
{
	type: 'text2';
}

/**
 * 區塊引用物件介面
 * Blockquote object interface
 */
export interface IRawObjectBlockquote
{
	type: 'blockquote',
	text: string[],

	paragraph: string[],
}

/**
 * 原始物件類別
 * Raw object class
 */
export class RawObject<RV extends unknown, RD extends IRawObjectData>
{
	[SYMBOL_RAW_DATA]: RD;
	[SYMBOL_RAW_VALUE]: RV;

	/**
	 * 建構子
	 * Constructor
	 *
	 * @param {RV} source - 原始值 / Source value
	 * @param {RD} [raw] - 原始資料 / Raw data
	 */
	constructor(source: RV, raw?: RD)
	{
		if (raw)
		{
			this[SYMBOL_RAW_DATA] = raw;
		}

		this[SYMBOL_RAW_VALUE] = source;
	}

	/**
	 * 檢查物件
	 * Inspect the object
	 *
	 * @returns {string} 檢查結果 / Inspection result
	 */
	inspect()
	{
		// @ts-ignore
		let pad = this[SYMBOL_RAW_DATA] && this[SYMBOL_RAW_DATA].type;

		return 'Raw' + this.getTypeof().replace(/^[a-z]/, function (s)
		{
			return s.toUpperCase();
		}) + `(${inspect(this.getRawValue())}${pad ? ', ' + pad : ''})`
	}

	/**
	 * Node.js 自訂檢查方法
	 * Node.js custom inspect method
	 *
	 * @returns {string} 檢查結果 / Inspection result
	 */
	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return this.inspect()
	}

	/**
	 * 轉換為 JSON
	 * Convert to JSON
	 *
	 * @returns {string} JSON 字串 / JSON string
	 */
	toJSON()
	{
		return this.toString();
	}

	/**
	 * 轉換為字串
	 * Convert to string
	 *
	 * @returns {string} 字串表示 / String representation
	 */
	toString()
	{
		return this[SYMBOL_RAW_VALUE].toString();
	}

	/**
	 * 取得類型
	 * Get type
	 *
	 * @returns {string} 類型字串 / Type string
	 */
	getTypeof()
	{
		return Array.isArray(this[SYMBOL_RAW_VALUE]) ? 'array' : typeof this[SYMBOL_RAW_VALUE];
	}

	/**
	 * 取得原始資料
	 * Get raw data
	 *
	 * @returns {RD} 原始資料 / Raw data
	 */
	getRawData(): RD
	{
		return this[SYMBOL_RAW_DATA];
	}

	/**
	 * 取得原始值
	 * Get raw value
	 *
	 * @returns {RV} 原始值 / Raw value
	 */
	getRawValue(): RV
	{
		return this[SYMBOL_RAW_VALUE];
	}

	/**
	 * 檢查是否為 RawObject
	 * Check if it is a RawObject
	 *
	 * @static
	 * @param {any} v - 要檢查的值 / Value to check
	 * @returns {boolean} 是否為 RawObject / Whether it is a RawObject
	 */
	static isRawObject = isRawObject

	/**
	 * 移除隱藏資料並取得原始資料
	 * Remove hidden data and get source data
	 *
	 * @static
	 * @param {RawObject} data - 要處理的資料 / Data to process
	 */
	static removeRawData = removeRawData

}

/**
 * 檢查是否為 RawObject
 * Check if it is a RawObject
 *
 * @template T - RawObject 類型 / RawObject type
 * @param {any | T} v - 要檢查的值 / Value to check
 * @returns {v is T} 是否為 RawObject / Whether it is a RawObject
 */
export function isRawObject<T extends RawObject<any, any>>(v: any | T): v is Extract<T, RawObject<any, any>>
export function isRawObject<T extends RawObject<unknown, IRawObjectData>>(v: any): v is T
export function isRawObject<T extends RawObject<unknown, IRawObjectData>>(v: any): v is T
{
	return (v instanceof RawObject);
}

/**
 * 移除隱藏資料並取得原始資料
 * Remove hidden data and get source data
 *
 * @template T - 資料類型 / Data type
 * @param {RawObject<T, any>} data - RawObject 資料 / RawObject data
 * @returns {T} 原始資料 / Source data
 */
export function removeRawData<T>(data: RawObject<T, any>): T
export function removeRawData<T>(data: T): T
export function removeRawData<T>(data: T): T
{
	if (isRawObject(data))
	{
		data = data.getRawValue();
	}

	if (typeof data == 'object')
	{
		for (let i in data)
		{
			data[i] = removeRawData(data[i]);
		}
	}

	return data;
}

export default RawObject;
