/**
 * Created by user on 2020/6/5.
 */

import naturalCompare from '@bluelovers/string-natural-compare';
import { ICreateSortCallbackOptions, IFnSortCallback, EnumToLowerCase } from './types';
import { _match, _trim } from './util';

/**
 * create a compare callback by (transpileBase value) -> trigger(transpile value) -> failbackSort
 * @param options
 */
export function createSortCallback(options: ICreateSortCallbackOptions = {}): IFnSortCallback
{
	const r = options.dotNum ? /^(\d+(?:\.\d+)?)/ : /^(\d+)/;

	const failbackSort = options.failbackSort || naturalCompare;
	const trigger = options.trigger || _match;
	let transpile = options.transpile || _trim;
	let transpileBase = options.transpileBase;

	if (options.toLowerCase)
	{
		let fnLowerCase: (input: string, ...argv) => string;

		if (typeof options.toLowerCase === 'function')
		{
			fnLowerCase = options.toLowerCase;
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

			fnLowerCase = (input: string, ...argv) => input[fn](...argv);
		}

		if (fnLowerCase)
		{
			if (transpileBase)
			{
				transpileBase = ((old) =>
				{
					return function (input, ...argv)
					{
						return fnLowerCase(old(input, ...argv), ...argv)
					}
				})(transpileBase);
			}
			else
			{
				transpileBase = fnLowerCase;
			}
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
	else
	{
		transpileBase = (input: string) => input;
	}

	fnSortCallback.failbackSort = failbackSort;
	fnSortCallback.trigger = trigger;
	fnSortCallback.transpile = transpile;
	fnSortCallback.transpileBase = transpileBase;
	fnSortCallback.fnSortCallback = fnSortCallback;

	return fnSortCallback;
}
