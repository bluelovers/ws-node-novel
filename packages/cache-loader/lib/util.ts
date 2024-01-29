/**
 * Created by user on 2019/1/6/006.
 */

import moment from 'moment';
import { defaultSortCallback, naturalCompare } from '@node-novel/sort';
import { toHalfWidth } from '@lazy-cjk/fullhalf';
import sortObject from 'sort-object-keys2';
import { _trim } from '@node-novel/sort/lib/util';
import { EnumToLowerCase } from '@node-novel/sort/lib/types';
import { createSortCallback } from '@node-novel/sort/lib/core';

let defaultOffset = 8;

export { naturalCompare }

export function createMoment(...argv)
{
	return moment(...argv).utcOffset(defaultOffset);
}

const todayMoment = createMoment().startOf('day');

export let todayMomentTimestamp = todayMoment.valueOf();
export let todayMomentOffset = todayMoment.utcOffset();

export default todayMomentTimestamp

export function getTodayMomentTimestamp()
{
	return todayMoment.valueOf();
}

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

export const cacheSortCallback = createSortCallback({
	dotNum: true,
	transpileBase(input: string, isSub?: any)
	{
		let s = toHalfWidth(input);
		return s
	},
	toLowerCase: EnumToLowerCase.toLocaleLowerCase,
});

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

export function baseSortObject<T>(data: T): T
{
	return sortObject(data, {
		useSource: true,
		keys: Object.keys(data).sort(),
	});
}

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

export function parsePathMainBase(pathMain: string)
{
	let is_out: boolean = null;
	let pathMain_base: string = undefined;
	let pathMain_out: string = undefined;

	if (pathMain != null)
	{
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
