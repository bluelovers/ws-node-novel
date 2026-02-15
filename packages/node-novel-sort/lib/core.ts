/**
 * Created by user on 2020/6/5.
 * 
 * 小說排序核心模組
 * Novel Sorting Core Module
 * 
 * 提供排序回呼函數的建立功能，支援自然排序、數字排序等。
 * Provides sorting callback function creation, supporting natural sorting, numeric sorting, etc.
 */

import naturalCompare from '@bluelovers/string-natural-compare';
import { ICreateSortCallbackOptions, IFnSortCallback, EnumToLowerCase } from './types';
import { _match, _trim } from './util';

/**
 * 建立排序回呼函數
 * Create Sort Callback Function
 * 
 * 建立一個排序回呼函數，處理流程為：
 * (transpileBase value) -> trigger(transpile value) -> failbackSort
 * 
 * Creates a sorting callback function with the processing flow:
 * (transpileBase value) -> trigger(transpile value) -> failbackSort
 * 
 * @param {ICreateSortCallbackOptions} [options={}] - 排序選項 / Sort options
 * @returns {IFnSortCallback} 排序回呼函數 / Sort callback function
 */
export function createSortCallback(options: ICreateSortCallbackOptions = {}): IFnSortCallback
{
	// 數字匹配正則表達式 / Number matching regex
	const r = options.dotNum ? /^(\d+(?:\.\d+)?)/ : /^(\d+)/;

	// 備用排序函數 / Fallback sort function
	const failbackSort = options.failbackSort || naturalCompare;
	// 觸發匹配函數 / Trigger match function
	const trigger = options.trigger || _match;
	// 轉換函數 / Transpile function
	let transpile = options.transpile || _trim;
	// 基礎轉換函數 / Base transpile function
	let transpileBase = options.transpileBase;

	// 處理小寫轉換選項 / Handle lowercase conversion option
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
				// 包裝現有的 transpileBase / Wrap existing transpileBase
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

	// 主要排序回呼函數 / Main sort callback function
	let fnSortCallback: IFnSortCallback = function fnSortCallback(a: string, b: string, isSub?: boolean): number
	{
		// 若兩值相等則返回 0 / Return 0 if values are equal
		if (a === b)
		{
			return 0;
		}

		// 執行觸發匹配 / Execute trigger match
		let ret = trigger(transpile(a, isSub), transpile(b, isSub), {
			r,
			mainFn: fnSortCallback as IFnSortCallback,
			isSub,
		});

		return (typeof ret == 'number') ? ret : failbackSort(a, b);
	} as IFnSortCallback;

	// 若有基礎轉換函數則包裝排序函數 / Wrap sort function if base transpile exists
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

				// 子項目直接使用原函數 / Use original function for sub-items
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

	// 設定函數屬性 / Set function properties
	fnSortCallback.failbackSort = failbackSort;
	fnSortCallback.trigger = trigger;
	fnSortCallback.transpile = transpile;
	fnSortCallback.transpileBase = transpileBase;
	fnSortCallback.fnSortCallback = fnSortCallback;

	return fnSortCallback;
}
