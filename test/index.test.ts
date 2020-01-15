import { expect } from 'chai';
import * as testUtils from './test-utils';
import mdconf from '../index';
//import { describe, before, it } from 'mocha';

const parse = mdconf.parse;

// @ts-ignore
describe('mdconf integration tests', function ()
{
	let allTestCases;

	// @ts-ignore
	before(async function ()
	{
		allTestCases = await testUtils.getTestCases();

		console.log(__filename);
	});

	// @ts-ignore
	it('should pass integration tests', function ()
	{
		allTestCases.forEach(testCase =>
		{
			// @ts-ignore
			describe('Test Case(s) for ' + testCase.testName, function ()
			{
				// @ts-ignore
				it('should match expected output with no options', () =>
				{
					let data = parse(testCase.md);

					console.dir(data, {
						colors: true,
					});

					console.log(mdconf.stringify(data));

					let data3 = parse(mdconf.stringify(data));

					let data2 = mdconf.RawObject.removeRawData(data);

					//console.log(data2);
					//console.log(data3);

					expect(data2).to.deep.equal(testCase.json);
					expect(data2).to.deep.equal(mdconf.RawObject.removeRawData(data3));

				});
			});
		});
	});
});
