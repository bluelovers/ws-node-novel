/**
 * Created by user on 2018/2/12/012.
 */

import * as naturalCompare from 'string-natural-compare';

export enum EnumToLowerCase
{
	toLowerCase = 1,
	toLocaleLowerCase = 2,
}

export declare function defaultSortCallback(a: string, b: string, isSub?: boolean): number;
export declare namespace defaultSortCallback
{
	export function failbackSort(a, b): number
	export function trigger(a, b, data: ITriggerData): number
	export function transpile(input, isSub?, ...argv): string
	export function transpileBase(input, isSub?, ...argv): string

	export function fnSortCallback(a: string, b: string, isSub?: boolean): number
}

export type IFnSortCallback = typeof defaultSortCallback;

export type ICreateSortCallbackOptions = {
	dotNum?: boolean,
	toLowerCase?: EnumToLowerCase | boolean | ((input, isSub?, ...argv) => string),
} & IFnSortCallbackProp;

export interface IFnSortCallbackProp
{
	failbackSort?(a, b): number,
	trigger?(a, b, data: ITriggerData): number,
	transpile?(input, isSub?, ...argv): string,
	transpileBase?(input, isSub?, ...argv): string,
}

export function createSortCallback(options: ICreateSortCallbackOptions = {}): IFnSortCallback
{
	const r = options.dotNum ? /^(\d+(?:\.\d+)?)/ : /^(\d+)/;

	const failbackSort = options.failbackSort || naturalCompare;
	const trigger = options.trigger || _match;
	let transpile = options.transpile || _trim;
	let transpileBase = options.transpileBase;

	if (options.toLowerCase)
	{
		if (typeof options.toLowerCase === 'function')
		{
			const fn = options.toLowerCase;

			transpile = ((old) => {
				return function (input, ...argv)
				{
					return fn(old(input, ...argv), ...argv)
				}
			})(transpile);
		}
		else
		{
			let fn = 'toLowerCase';

			if (typeof options.toLowerCase === 'number')
			{
				if (options.toLowerCase !== EnumToLowerCase.toLowerCase)
				{
					fn = 'toLocaleLowerCase';
				}
			}

			transpile = ((old) => {
				return function (input, ...argv)
				{
					return old(input, ...argv)[fn]()
				}
			})(transpile);
		}
	}

	let fnSortCallback: IFnSortCallback = function fnSortCallback(a: string, b: string, isSub?: boolean): number
	{
		if (a === b)
		{
			return 0;
		}

		let ret = trigger(transpile(a, isSub), transpile(b, isSub), {
			r,
			mainFn: fnSortCallback as IFnSortCallback,
			isSub,
		});

		return (typeof ret == 'number') ? ret : failbackSort(a, b);
	} as IFnSortCallback;

	if (transpileBase)
	{
		fnSortCallback = (function (oldFn)
		{
			return function (a: string, b: string, isSub?: boolean): number
			{
				if (a === b)
				{
					return 0;
				}

				if (isSub)
				{
					return oldFn(a, b, isSub);
				}

				return oldFn(transpileBase(a), transpileBase(b), isSub);
			} as IFnSortCallback
		})(fnSortCallback);
	}

	fnSortCallback.failbackSort = failbackSort;
	fnSortCallback.trigger = trigger;
	fnSortCallback.transpile = transpile;
	fnSortCallback.transpileBase = transpileBase;
	fnSortCallback.fnSortCallback = fnSortCallback;

	return fnSortCallback;
}

export { naturalCompare }

exports.defaultSortCallback = createSortCallback({
	dotNum: true,
});

export default exports.defaultSortCallback as typeof defaultSortCallback

export interface ITriggerData
{
	r: RegExp,
	mainFn: IFnSortCallback,
	isSub: boolean,
}

export function _match(a: string, b: string, {
	r,
	mainFn,
	isSub,
}: ITriggerData)
{
	let ta: RegExpExecArray;
	let tb: RegExpExecArray;

	if ((ta = r.exec(a)) && (tb = r.exec(b)))
	{
		let r = parseInt(ta[0]) - parseInt(tb[0]);

		if (r !== 0)
		{
			return r;
		}

		let a1 = ta.input.slice(ta[0].length);
		let b1 = tb.input.slice(tb[0].length);

		if (a1 != b1)
		{
			let i = 0;

			while (typeof a1[i] != 'undefined' && a1[i] == b1[i] && (!/^\d$/.test(b1[0])))
			{
				i++;
			}

			a1 = a1.slice(i);
			b1 = b1.slice(i);
		}

		return mainFn(a1, b1, true);
	}
}

export function _trim(input: string): string
{
	return input
		.replace(/^[_\s]+(\d+)/, '$1')
		.replace(/^\D(\d+)/, '$1')
		.trim()
		;
}
