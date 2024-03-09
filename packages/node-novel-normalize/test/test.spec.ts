import { normalize_strip, normalize_val } from '../src/index';

describe(`describe`, () =>
{

	let text = '00090_2章 不希望獨占的日子結束的面具工薪族版_二百四十四話　逐漸増加的春季預予于於定.txt';

	test(`normalize_strip`, () =>
	{

		let actual = normalize_strip(text);

		expect(actual).toMatchSnapshot();

	});

	test(`normalize_val`, () =>
	{

		let actual = normalize_val(text);

		expect(actual).toMatch(/244/);

		expect(actual).toMatchSnapshot();
	});

})
