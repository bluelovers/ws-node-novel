/**
 * Created by user on 2019/1/6/006.
 * 
 * 快取載入器工具函數模組
 * Cache Loader Utility Functions Module
 * 
 * 提供時間處理、排序、物件凍結等工具函數。
 * Provides utility functions for time handling, sorting, and object freezing.
 */

import moment from 'moment';
import { defaultSortCallback, naturalCompare } from '@node-novel/sort';
import { toHalfWidth } from '@lazy-cjk/fullhalf';
import sortObject from 'sort-object-keys2';
import { _trim } from '@node-novel/sort/lib/util';
import { EnumToLowerCase } from '@node-novel/sort/lib/types';
import { createSortCallback } from '@node-novel/sort/lib/core';

/**
 * 預設時區偏移量 (UTC+8)
 * Default timezone offset (UTC+8)
 */
let defaultOffset = 8;

export { naturalCompare }

/**
 * 建立 Moment 物件
 * Create Moment Object
 * 
 * 建立帶有預設時區偏移的 Moment 物件。
 * Creates a Moment object with default timezone offset.
 * 
 * @param {...any} argv - Moment 建構參數 / Moment constructor arguments
 * @returns {moment.Moment} Moment 物件 / Moment object
 */
export function createMoment(...argv)
{
	return moment(...argv).utcOffset(defaultOffset);
}

/**
 * 今日起始時間的 Moment 物件
 * Moment object for today's start time
 */
const todayMoment = createMoment().startOf('day');

/**
 * 今日起始時間的時間戳記
 * Timestamp for today's start time
 */
export let todayMomentTimestamp = todayMoment.valueOf();

/**
 * 今日時間的 UTC 偏移量
 * UTC offset for today's time
 */
export let todayMomentOffset = todayMoment.utcOffset();

export default todayMomentTimestamp

/**
 * 取得今日起始時間戳記
 * Get Today's Start Timestamp
 * 
 * @returns {number} 今日起始時間的 Unix 時間戳記 / Unix timestamp for today's start time
 */
export function getTodayMomentTimestamp()
{
	return todayMoment.valueOf();
}

/**
 * 刷新今日時間戳記
 * Refresh Today's Timestamp
 * 
 * 檢查並更新今日時間戳記，若日期已變更則更新。
 * Checks and updates today's timestamp if the date has changed.
 * 
 * @returns {boolean} 是否已更新 / Whether updated
 */
export function refreshTodayMoment()
{
	let k = createMoment()
		//.add(7, 'days')
		.startOf('day')
	;

	if (k.valueOf() != todayMoment.valueOf())
	{
		todayMoment.set(k.toObject());

		return true;
	}
}

// 定義動態屬性 / Define dynamic properties
Object.defineProperties(exports, {
	todayMomentTimestamp: {
		get: getTodayMomentTimestamp,
	},
	todayMomentOffset: {
		get()
		{
			return todayMoment.utcOffset();
		},
	},
});

/**
 * 快取排序回呼函數
 * Cache Sort Callback Function
 * 
 * 用於快取資料排序的回呼函數，支援數字排序與全形字元轉換。
 * Callback function for cache data sorting, supporting numeric sorting and full-width character conversion.
 */
export const cacheSortCallback = createSortCallback({
	// 啟用數字排序 / Enable numeric sorting
	dotNum: true,
	/**
	 * 轉換基礎字串
	 * Transpile base string
	 */
	transpileBase(input: string, isSub?: any)
	{
		let s = toHalfWidth(input);
		return s
	},
	// 使用 toLocaleLowerCase 進行大小寫轉換 / Use toLocaleLowerCase for case conversion
	toLowerCase: EnumToLowerCase.toLocaleLowerCase,
});

/**
 * 凍結物件屬性
 * Freeze Object Property
 * 
 * 將物件的指定屬性設為不可寫入與不可設定。
 * Sets the specified property of an object to be non-writable and non-configurable.
 * 
 * @template T - 物件類型 / Object type
 * @param {T} who - 目標物件 / Target object
 * @param {keyof T} prop - 屬性名稱 / Property name
 * @param {boolean} [freeze] - 是否同時凍結屬性值 / Whether to also freeze the property value
 * @returns {T} 目標物件 / Target object
 */
export function freezeProperty<T>(who: T, prop: keyof T, freeze?: boolean)
{
	if (freeze)
	{
		try
		{
			// @ts-ignore
			who[prop] = Object.freeze(who[prop]);
		}
		catch (e)
		{

		}
	}

	Object.defineProperty(who, prop, {
		configurable: false,
		writable: false,
	});

	return who;
}

/**
 * 基礎物件排序
 * Base Object Sort
 * 
 * 依據鍵值排序物件屬性。
 * Sorts object properties by keys.
 * 
 * @template T - 物件類型 / Object type
 * @param {T} data - 要排序的物件 / Object to sort
 * @returns {T} 排序後的物件 / Sorted object
 */
export function baseSortObject<T>(data: T): T
{
	return sortObject(data, {
		useSource: true,
		keys: Object.keys(data).sort(),
	});
}

/**
 * 嘗試載入 fs-extra 模組
 * Try to Require fs-extra Module
 * 
 * 嘗試載入 fs-extra 模組，若失敗則返回 undefined。
 * Attempts to load fs-extra module, returns undefined on failure.
 * 
 * @returns {typeof import('fs-extra') | undefined} fs-extra 模組或 undefined / fs-extra module or undefined
 */
export function tryRequireFS(): typeof import('fs-extra')
{
	let fs: typeof import('fs-extra');

	try
	{
		fs = require('fs-extra');
		return fs;
	}
	catch (e)
	{

	}
}

/**
 * 解析 pathMain 基礎名稱
 * Parse pathMain Base Name
 * 
 * 解析 pathMain 字串，判斷是否為 _out 目錄並取得基礎名稱。
 * Parses pathMain string to determine if it's an _out directory and get the base name.
 * 
 * @param {string} pathMain - 主路徑名稱 / Main path name
 * @returns {Object} 解析結果 / Parse result
 * @returns {boolean} returns.is_out - 是否為 _out 目錄 / Whether it's an _out directory
 * @returns {string} returns.pathMain_base - 基礎路徑名稱 / Base path name
 * @returns {string} returns.pathMain_out - _out 路徑名稱 / _out path name
 */
export function parsePathMainBase(pathMain: string)
{
	let is_out: boolean = null;
	let pathMain_base: string = undefined;
	let pathMain_out: string = undefined;

	if (pathMain != null)
	{
		// 匹配路徑與可選的 _out 後綴 / Match path with optional _out suffix
		let _m = pathMain.match(/^(.+?)(_out)?$/);

		is_out = !!_m[2];
		pathMain_base = _m[1];
		pathMain_out = pathMain_base + '_out';
	}

	return {
		is_out,
		pathMain_base,
		pathMain_out,
	}
}
