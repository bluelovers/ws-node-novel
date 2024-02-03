/**
 * Created by user on 2018/2/14/014.
 */

import StrUtil from 'str-util';
import { trim as strUtilTrim } from '@lazy-cjk/str-util-trim';
import { zh2num, num2zh } from '@lazy-cjk/zh2num';
import { toFullNumber, toHalfNumber, toFullEnglish, toHalfEnglish, toFullWidth, toHalfWidth } from '@lazy-cjk/fullhalf';

import { str2num } from 'normalize-num';

import novelFilename from '@lazy-cjk/novel-filename';
import { slugify } from '@lazy-cjk/zh-slugify';

export interface IOptions
{
	padNum?: number,
	checkRoman?: boolean,
}

export function normalize_strip(str: string, isDir?: boolean)
{
	if (isDir)
	{
		if (/^p?\d{4,}[\s_](.+)(_\(\d+\))$/.exec(str))
		{
			str = RegExp.$1;
		}
		else if (/^p?\d{4,}[\s_](.+)(_\(\d+\))?$/.exec(str))
		{
			str = RegExp.$1;
		}
	}
	else
	{
		if (/^\d+_(.+)\.\d+$/.exec(str))
		{
			str = RegExp.$1;
		}
		else if (/^c?\d{4,}_(.+)$/.exec(str))
		{
			str = RegExp.$1;
		}
	}

	str = strUtilTrim(str, '　');

	return str;
}

export function normalize_val(str: string, padNum: number = 5, options: IOptions = {}): string
{
	padNum = padNum || options.padNum;

	//console.log(111, str);

	str = novelFilename.filename(str);

	if (/^(?:序|プロローグ|Prologue)/i.test(str))
	{
		str = '0_' + str;
	}

	str = str.replace(/^(web)版(\d+)/i, '$1$2');

	//str = str.replace(/^[cp](\d{4,}_)/, '$1');

	str = toHalfWidth(str)
		.toLowerCase()
	;
	str = strUtilTrim(str, '　');

	str = zh2num(str).toString();

	str = zh2num(str, {
		truncateOne: 2,
		flags: 'ug',
	}).toString();

	//console.log(str);

	str = str2num(str, {
		all: true,
		roman: options.checkRoman,
	});

	/*
	if (options.checkRoman)
	{
		let m = isRoman(str);

		if (m)
		{
			let n = deromanize(normalizeRoman(m[1]));
			str = n.toString() + str.slice(m[1].length);
			//console.log(m[1], n, str);
		}
	}

	str = circle2num(str);
	*/

	str = str.replace(/\d+/g, function ($0)
	{
		return $0.padStart(padNum, '0');
	});

	str = str
		.replace(/^第+/, '')
		//.replace(/(\d)[章話]/g, '$1_')
		//.replace(/第(\d)/g, '_$1')
		//.replace(/\./g, '_')
		.replace(/[―—－──\-―—─＝=―——─ー─]/g, '_')
		.replace(/[\s　]/g, '_')
		.replace(/[\(\)〔［【《（「『』」》）】〕］〔［〕］]/g, '_')
		.replace(/[·‧・···•・·᛫•․‧∙⋅⸱⸳・ꞏ·‧・···•˙●‧﹒]/g, '_')
		.replace(/[：：︰﹕：︓∶:]/ug, '_')
		.replace(/[・:,]/g, '_')
		.replace(/_+$/g, '')
		.replace(/_+/g, '_')

	;

	/*
	str = zh2jp(cn2tw(str) as string, {
		safe: false,
	});
	*/

	/*
	str = zhTable.auto(cn2tw(str, {
		safe: false,
		// @ts-ignore
		greedyTable: true,
	}), {
		safe: false,
		// @ts-ignore
		greedyTable: true,
	})[0];
	*/

	str = slugify(str, true);

	return str;
}

export default exports as typeof import('./index');
