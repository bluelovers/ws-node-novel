import * as fs from 'fs-extra';
import { readFile } from 'fs-extra';
import novelInfo from '../index';
import { join } from 'path';
import { __ROOT_TEST_MDCONF } from '../../../__root_ws';

test(`novel`, async () =>
{

	let actual = await readFile(join(__ROOT_TEST_MDCONF, './res/README.md')).then(function (buf)
	{
		return novelInfo.parse(buf, {
			//chk: false
		});
	});

	expect(actual).toMatchSnapshot();
	expect(novelInfo.stringify(actual)).toMatchSnapshot();

});
