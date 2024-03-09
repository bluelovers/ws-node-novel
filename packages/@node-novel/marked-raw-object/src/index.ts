/**
 * Created by user on 2020/1/15.
 */

import { inspect } from "util";
import { Token, Tokens } from 'marked';

export const SYMBOL_RAW_DATA = Symbol.for('raw_data');
export const SYMBOL_RAW_VALUE = Symbol.for('raw_value');

export type IRawObjectData = Token | IRawObjectBlockquote | IRawObjectDataPlus;
export type IRawObjectDataPlus = IRawObjectTokenPlus<Tokens.HTML> | IRawObjectTokenPlus<Tokens.Code>;

export type IRawObjectPlus = RawObject<string, IRawObjectDataPlus>;

export type IRawObjectTokenPlus<T extends Tokens.HTML | Tokens.Code> = T & {
	paragraph: string[]
}

export interface ITokenText2 extends Omit<Tokens.Text, 'type'>
{
	type: 'text2';
}

export interface IRawObjectBlockquote
{
	type: 'blockquote',
	text: string[],

	paragraph: string[],
}

export class RawObject<RV extends unknown, RD extends IRawObjectData>
{
	[SYMBOL_RAW_DATA]: RD;
	[SYMBOL_RAW_VALUE]: RV;

	constructor(source: RV, raw?: RD)
	{
		if (raw)
		{
			this[SYMBOL_RAW_DATA] = raw;
		}

		this[SYMBOL_RAW_VALUE] = source;
	}

	inspect()
	{
		// @ts-ignore
		let pad = this[SYMBOL_RAW_DATA] && this[SYMBOL_RAW_DATA].type;

		return 'Raw' + this.getTypeof().replace(/^[a-z]/, function (s)
		{
			return s.toUpperCase();
		}) + `(${inspect(this.getRawValue())}${pad ? ', ' + pad : ''})`
	}

	[Symbol.for('nodejs.util.inspect.custom')]()
	{
		return this.inspect()
	}

	toJSON()
	{
		return this.toString();
	}

	toString()
	{
		return this[SYMBOL_RAW_VALUE].toString();
	}

	getTypeof()
	{
		return Array.isArray(this[SYMBOL_RAW_VALUE]) ? 'array' : typeof this[SYMBOL_RAW_VALUE];
	}

	getRawData(): RD
	{
		return this[SYMBOL_RAW_DATA];
	}

	getRawValue(): RV
	{
		return this[SYMBOL_RAW_VALUE];
	}

	static isRawObject = isRawObject

	/**
	 * will remove hidden data and get source data
	 *
	 * @param {RawObject} data
	 */
	static removeRawData = removeRawData

}

export function isRawObject<T extends RawObject<any, any>>(v: any | T): v is Extract<T, RawObject<any, any>>
export function isRawObject<T extends RawObject<unknown, IRawObjectData>>(v: any): v is T
export function isRawObject<T extends RawObject<unknown, IRawObjectData>>(v: any): v is T
{
	return (v instanceof RawObject);
}

/**
 * will remove hidden data and get source data
 *
 * @param {RawObject} data
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
