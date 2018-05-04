const expect = require('chai').expect;
const testUtils = require('./test-utils');
const mdconf = require('../index');
import { describe, before, it } from 'mocha';

const parse = mdconf.parse;

describe('mdconf integration tests', function ()
{
	let allTestCases;

	before(async function ()
	{
		allTestCases = await testUtils.getTestCases();

		console.log(__filename);
	});

	it('should pass integration tests', function ()
	{
		allTestCases.forEach(testCase =>
		{
			describe('Test Case(s) for ' + testCase.testName, function ()
			{
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

					expect(data2).to.deep.eql(testCase.json);
					expect(data2).to.deep.eql(mdconf.RawObject.removeRawData(data3));

				});
			});
		});
	});
});
