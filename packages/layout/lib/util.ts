/**
 * Created by user on 2019/5/29.
 */

import { EnumLF, ITextLayoutOptions, IWordsArray, IWordsArray2, IWordsUserSP } from './types';
import { SP_KEY } from './index';
import getMinMidMax from 'blank-line';

export function _isIwordsArray(value): value is IWordsArray
{
	return Array.isArray(value) && (value.length > 1);
}

export function _isIwordsArray2(value): value is IWordsArray2
{
	return Array.isArray(value) && value.length == 1 && typeof value[0] == 'function';
}

export function _isIwordsUserSp(value): value is IWordsUserSP
{
	return typeof value.s == 'string' && new RegExp(`${SP_KEY}(.+)$`).test(value.s);
}

export function _handleTextLayout(html: string, options: ITextLayoutOptions): string
{
	if (!html.match(/[^\n]\n[^\n]/g))
	{
		let [min, mid, max] = getMinMidMax(html);

		if (min > 2)
		{
			options.allow_lf2 = false;
		}

		if (max >= 3)
		{
			if (min > 2)
			{
				let r = new RegExp(`\\n{${min - 1}}(\\n+)`, 'g');

				html = html
				//.replace(/\n{2}(\n*)/g, '$1')
					.replace(r, '$1')
				;
			}

			html = html
				.replace(/\n{3,}/g, "\n\n\n")
			//.replace(/\n{2}/g, "\n")
			;
		}

		//console.log(options);

		if (!options.allow_lf2)
		{
			html = html
				.replace(/\n\n/g, "\n")
			;
		}
	}

	/*
	html = html
	// for ts
		.toString()
		.replace(/([^\n「」【】《》“”『』（）\[\]"](?:[！？?!。]*)?)\n((?:[—]+)?[「」“”【】《》（）『』])/ug, "$1\n\n$2")

		.replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:\u3000*)[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")

		.replace(/([^\n「」【】《》“”『』（）\[\]"≪≫](?:[！？?!。]*)?)\n((?:[—]+)?[≪≫「」“”【】《》（）『』])/ug, "$1\n\n$2")

		.replace(/(）(?:[！？?!。]*)?)\n([「」【】《》『』“”])/ug, "$1\n\n$2")
	;
	*/

	html = html
		.replace(/^\n+|[\s\u3000]+$/g, '')
		.replace(/(\n){4,}/g, EnumLF.LF4)
	;

	if (options.allow_lf3)
	{
		html = html
			.replace(/(\n){3,}/g, EnumLF.LF3)
		;
	}
	else
	{
		html = html
			.replace(/(\n){3}/g, EnumLF.LF2)
		;
	}

	return html;
}
