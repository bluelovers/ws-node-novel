import { join } from "path";
import { readFile } from 'fs-extra';
import { parse } from '..';

test(`parse`, async () =>
{
	const rootDir = join(__dirname, '..');

	let actual = await readFile(join(rootDir, 'test/res', '排版格式.txt'))
		.then(buf =>
		{
			return parse(buf.toString(), {
				on: {
					img(data)
					{
						let { tagName, innerContext } = data;

						console.dir({
							tagName,
							innerContext,
						});

						return null // 如果回傳非 null 則會取代原始文字內容
					},
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
					},
				},
			})
		})
	;

	expect(actual).toMatchSnapshot();

});
