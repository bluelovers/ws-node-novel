import { normalize_val } from '@node-novel/normalize';
import { _match } from '../lib/util';
import { ITriggerData } from '../lib/types';
import { createSortCallback } from '../lib/core';

test(`createSortCallback`, () =>
{
	let comp = createSortCallback({
		dotNum: true,
		transpile(input: any, isSub?: any, ...argv): string
		{
			return normalize_val(input, 5);
		},
//	transpileBase(input: any, isSub?: any, ...argv): string {
//		return normalize_val(input, 5);
//	},
		trigger(a: string, b: string, data: ITriggerData): number
		{
//		console.log(666, a, b);

			return _match(a, b, data)
		},
	});

	let data = `大会議　㊤
大会議　㊦
大会議　前
大会議　後
大会議　后
`.split("\n");

	let actual = data.sort(comp);

	expect(actual).toMatchSnapshot();

});

