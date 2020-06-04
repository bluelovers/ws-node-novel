import create, { INovelStatCache, createFromJSON } from '../index';
import path from 'upath2';

describe(`novelStatCache`, () =>
{
	/**
	 * 從檔案來讀取設定
	 */
	const novelStatCache = create({
		file: path.join(__dirname, 'res', 'novel-stat.json'),
		//file_git: path.join(__dirname, 'res', 'novel-stat.json'),
	});

	test(`filterNovel`, () =>
	{

		let actual = novelStatCache.filterNovel();

		expect(actual).toMatchSnapshot();

	});

})

test(`createFromJSON`, () =>
{

	/**
	 * 從其他方式取得 data 來輸入資料
	 * 例如 透過 AJAX 取得伺服器上的 json
	 */
	const data: INovelStatCache = {
		novels: {},
		mdconf: {},
		meta: {},
		history: {},
	};

	const actual = createFromJSON(data);

	expect(actual).toMatchSnapshot();

});
