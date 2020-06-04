import testCaseList from './data/simple';
import textLayout from '../index';
import { inspect } from 'util';

describe(`textLayout.textlayout`, () =>
{
	testCaseList
		.forEach((testCase) => {
			test(inspect(testCase[1]), () =>
			{

				let actual = textLayout.textlayout(testCase[0]);

				let expected = testCase[1];

				if (typeof expected === 'string')
				{
					expect(actual).toContain(expected);
				}
				else if (typeof expected === 'function')
				{
					expect(expected(actual, testCase)).toBeTruthy();
				}
				else
				{
					expect(actual).toMatch(expected);
				}

				expect(actual).toMatchSnapshot();

			});
		})
	;

})
