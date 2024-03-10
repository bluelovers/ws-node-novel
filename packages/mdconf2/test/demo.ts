/**
 * Created by user on 2018/1/27/027.
 */

import novelInfo from '..';
// @ts-ignore
import fs from 'fs-extra';
import { join } from 'path';
import { __ROOT_TEST_MDCONF } from '../../../__root_ws';

fs.readFile(join(__ROOT_TEST_MDCONF, './res/README.md'))
	.then(function (buf)
	{
		return novelInfo.parse(buf, {
			//chk: false
		});
	})
	.then(function (conf)
	{
		console.dir(conf, {
			depth: null
		});

		console.log(novelInfo.stringify(conf));
	})
;
