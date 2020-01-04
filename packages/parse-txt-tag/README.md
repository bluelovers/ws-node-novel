# @node-novel/parse-txt-tag

    分析 node-novel 風格的 txt tag

## install

```nodemon
yarn add @node-novel/parse-txt-tag
```

## demo

```ts
import { outputFile, readFile } from 'fs-extra';
import { join } from 'path';
import { parse } from '@node-novel/parse-txt-tag';

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
```

