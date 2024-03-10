import * as testUtils from './test-utils';
import mdconf, { RawObject } from '../index';
import { parse } from '../core';
import { getTestCasesSync } from './test-utils';
import { toMatchFile } from 'jest-file-snapshot2';
import { __ROOT_TEST_MDCONF } from '../../../__root_ws';
import { join } from 'path';

expect.extend({ toMatchFile });

describe(`mdconf integration tests`, () =>
{
	let allTestCases = getTestCasesSync();

	describe(`should pass integration tests`, () =>
	{
		allTestCases.forEach(testCase =>
		{
			describe('Test Case(s) for ' + testCase.testName, function ()
			{
				it('should match expected output with no options', () =>
				{
					let data = parse(testCase.md);

					expect(data).toMatchSnapshot();

					let output = mdconf.stringify(data);

					expect(output).toMatchSnapshot();
					expect(output).toMatchFile(join(__ROOT_TEST_MDCONF, '__file_snapshots__', 'cases', testCase.filename));

					let data3 = parse(mdconf.stringify(data));

					let data2 = RawObject.removeRawData(data);

					expect(data2).toStrictEqual(testCase.json);
					expect(data2).toStrictEqual(RawObject.removeRawData(data3));

					expect(data2).toMatchSnapshot();
					expect(data3).toMatchSnapshot();

				});
			});
		});

	});

})
