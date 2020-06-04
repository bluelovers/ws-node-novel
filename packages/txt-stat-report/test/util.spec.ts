
import { readFileSync } from 'fs';
import { removePunctuation } from '../lib/util';
import { join } from 'path';
import { txtReport } from '../index';

const source = readFileSync(join(__dirname, 'res/punctuation.txt'))
	.toString()
;

test(`removePunctuation`, () =>
{
	let actual = removePunctuation(source.replace(/\s+/g, ''));
	let expected = '';

	expect(actual).toStrictEqual(expected);
	//expect(actual).toBeInstanceOf(Date);
	expect(actual).toMatchSnapshot();

});

test(`txtReport`, () =>
{
	let actual = txtReport(source);

	expect(actual).toMatchSnapshot();

});
