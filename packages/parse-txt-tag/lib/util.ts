/**
 * Created by user on 2020/1/4.
 */

import { toHalfWidth } from 'str-util/lib/fullhalf';
import { reHtmlRubyRt, reHtmlRubyRp, EnumHtmlTag } from './tags';

export function _fixRubyInnerContext(innerContext: string)
{
	let fn = _replaceHtmlTag(($0, $1, $2, $3) =>
	{
		return `<${$1}${$2}>${$3}</${$1}>`
	});

	return innerContext
		.replace(reHtmlRubyRt, fn)
		.replace(reHtmlRubyRp, fn)
		;
}

export function _replaceHtmlTag(replacer: ((substring: string, ...args: string[]) => string))
{
	return ($0: string, $1: string, $2: string, ...argv: string[]) =>
	{

		$1 = toHalfWidth($1);
		$2 = toHalfWidth($2);

		return replacer($0, $1, $2, ...argv)
	}
}

export function _convertHtmlTag001(input: string)
{
	return input
		.replace(new RegExp(EnumHtmlTag.OPEN, 'ig'), '<')
		.replace(new RegExp(EnumHtmlTag.CLOSE, 'ig'), '>')
		;
}
