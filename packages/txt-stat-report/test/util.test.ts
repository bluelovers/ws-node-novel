/**
 * Created by user on 2019/2/23.
 */

/// <reference types="mocha" />
/// <reference types="benchmark" />
/// <reference types="chai" />
/// <reference types="node" />

import { chai, relative, expect, path, assert, util, mochaAsync } from './_local-dev';

// @ts-ignore
import { ITest } from 'mocha';
import fs = require('fs-extra');
import { removePunctuation } from '../lib/util';
import UString = require('uni-string');
import { array_unique } from 'array-hyper-unique';

// @ts-ignore
describe(relative(__filename), () =>
{
	let currentTest: ITest;

	// @ts-ignore
	beforeEach(function ()
	{
		currentTest = this.currentTest as ITest;

		//console.log('it:before', currentTest.title);
		//console.log('it:before', currentTest.fullTitle());
	});

	// @ts-ignore
	describe(`suite`, () =>
	{
		// @ts-ignore
		it(`punctuation`, function ()
		{
			//console.log('it:inner', currentTest.title);
			//console.log('it:inner', currentTest.fullTitle());

			let source = fs.readFileSync(path.join(__dirname, 'res/punctuation.txt'))
				.toString()
			;

			//fs.writeFileSync(path.join(__dirname, 'res/punctuation2.txt'), array_unique(UString.split(source, '')).sort().join(''));

			let actual = removePunctuation(source.replace(/\s+/g, ''));
			let expected = '';

			//expect(actual).to.be.ok;
			expect(actual).to.be.deep.equal(expected);
			//assert.isOk(actual.value, util.inspect(actual));
		});
	});
});
