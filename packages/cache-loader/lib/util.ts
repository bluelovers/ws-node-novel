/**
 * Created by user on 2019/1/6/006.
 */

import moment = require('moment');
import { _trim, createSortCallback, defaultSortCallback, EnumToLowerCase } from '@node-novel/sort';
import StrUtil = require('str-util');
import sortObject = require('sort-object-keys2');

let defaultOffset = 8;

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
		let s = StrUtil.toHalfWidth(input);
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

exports = Object.freeze(exports);