/**
 * Created by user on 2020/6/5.
 */

import { ITriggerData } from './types';

export function _match(a: string, b: string, {
	r,
	mainFn,
}: ITriggerData)
{
	let ta: RegExpExecArray;
	let tb: RegExpExecArray;

	if ((ta = r.exec(a)) && (tb = r.exec(b)))
	{
		let r = parseFloat(ta[0]) - parseFloat(tb[0]);

		if (r !== 0)
		{
			return r;
		}

		let a1 = ta.input.slice(ta[0].length);
		let b1 = tb.input.slice(tb[0].length);

		if (a1 != b1)
		{
			let i = 0;

			while (typeof a1[i] != 'undefined' && a1[i] === b1[i] && (!/^\d$/.test(b1[i])))
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
