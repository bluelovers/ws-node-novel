import { parse } from '../index';

describe(`simple`, () =>
{
	let k = parse(`
---
title: Home
---
# novel

- title: 破滅の魔導王とゴーレムの蛮妃
`, {
		parseOptions: {
			//lowCheckLevel: true,
			throw: false,
		},
	});

	test(`parse`, () =>
	{
		expect(k).toMatchSnapshot();
	});

	test(`k.stringify(k)`, () =>
	{

		let actual = k.stringify(k);
		let expected;

		expect(actual).toMatchSnapshot();

	});

	test(`k.stringify v2`, () =>
	{

		let actual = k.stringify({
			data: {
				//...k.data,
				//kkk: 777,
			},
			//content: k.content,
			mdconf: {
				...k.mdconf,
				aaa: {
					bbb: 777,
				},
			},
		});;
		let expected;

		expect(actual).toMatchSnapshot();

	});

})
