/**
 * Created by user on 2018/2/6/006.
 */

import { chai, relative, expect, path, assert, util } from './_local-dev';

// @ts-ignore
describe(relative(__filename), () =>
{
	// @ts-ignore
	let currentTest;

	// @ts-ignore
	beforeEach(function ()
	{
		// @ts-ignore
		currentTest = this.currentTest as ITest;

		//console.log('it:before', currentTest.title);
		//console.log('it:before', currentTest.fullTitle());
	});

	// @ts-ignore
	describe(`suite`, () =>
	{
		// @ts-ignore
		it(`label`, async function ()
		{
			//console.log('it:inner', currentTest.title);
			//console.log('it:inner', currentTest.fullTitle());

			let actual;
			let expected;

			//expect(actual).to.be.ok;
			//expect(actual).to.be.deep.equal(expected);
			//assert.isOk(actual.value, util.inspect(actual));

		});
	});
});
