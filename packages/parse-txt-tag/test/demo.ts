/**
 * Created by user on 2020/1/4.
 */

import { outputFile, readFile } from 'fs-extra';
import { join } from 'path';
import { parse } from '../lib/parse';

const rootDir = join(__dirname, '..');

readFile(join(rootDir, 'test/res', '排版格式.txt'))
	.then(buf => {
		return parse(buf.toString(), {
			on: {
				default({
					tagName,
					innerContext,
					cache,
					attach,
				})
				{
					console.dir({
						tagName,
						innerContext,
					});

					return null // 如果回傳非 null 則會取代原始文字內容
				}
			}
		})
	})
	.then(v => console.dir(v))
;

