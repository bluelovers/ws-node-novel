/**
 * Created by user on 2019/2/23.
 */

import { array_unique, array_unique_overwrite } from 'array-hyper-unique';

export const regexpPunctuation = regexMerge([
	/\p{Punctuation}+/gu,
	/[\u2000-\u206F\u2E00-\u2E7F\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\uffe0-\uffef\u2500-\u257f\u2200-\u22ff\u25A0-\u25FF\u2600-\u26F0\u2190-\u21FF\u02b9-\u02df\u02E4-\u02f0\u2580-\u259F]+/ug,
	/[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]/gu,
	/[\u00A1-\u00BF\u00D7\u00F7]/gu,
	/[\u2100-\u214F]/gu,
]);

export function removePunctuation(input: string)
{
	return input
		.replace(regexpPunctuation, '')
		//.replace(/\p{Punctuation}+/gu, '')
		//.replace(/[\u2000-\u206F\u2E00-\u2E7F\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\uffe0-\uffef\u2500-\u257f\u2200-\u22ff\u25A0-\u25FF\u2600-\u26F0\u2190-\u21FF\u02b9-\u02df\u02E4-\u02f0\u2580-\u259F]/ug, '')
		//.replace(/[⋯]+/gu, '')
		//.replace(/['!"#$%&()*+,\-.\/\\:;<=>?@\[\]^_`{|}~°№÷×−¦]/ug, '')
		;
}

export function removeSpace(input: string)
{
	return input
		.replace(/\s+/g, function (s)
		{
			return s.replace(/[^\r\n]+/g, '')
		})
		.replace(/[\xA0 　]+/gu, '')
		;
}

export function removeLine(input: string)
{
	return input
		.replace(/[\r\n]+/gu, '')
		;
}

/**
 * 合併多個 regexp 為一個
 */
export function regexMerge<T extends RegExp>(list: T[])
{
	let source: string[] = [];
	let flags: string[] = [];

	list.forEach(function (a)
	{
		source.push(a.source);

		a.flags && flags.push(...a.flags.split(''));
	});

	array_unique_overwrite(source);
	array_unique_overwrite(flags);

	return new RegExp(source.join('|'), flags.join(''));
}

export function removeBom(input: string)
{
	return input
		.replace(/\uFEFF/gu, '')
		;
}
