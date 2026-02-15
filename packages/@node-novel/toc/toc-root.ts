/**
 * Created by user on 2018/11/14/014.
 * 
 * 根目錄 TOC 處理模組
 * Root Directory TOC Processing Module
 * 
 * 此模組用於從根目錄掃描並生成整個小說庫的目錄結構。
 * This module scans from the root directory and generates the TOC structure for the entire novel library.
 */

import { array_unique } from 'array-hyper-unique';
import { LF } from 'crlf-normalize';
import FastGlob from '@bluelovers/fast-glob';
import path from 'upath2';
import BluebirdPromise from 'bluebird';
import fs from 'fs-extra';
import { defaultPatternsExclude } from 'node-novel-globby/lib/options';
import { IMdconfMeta } from 'node-novel-info';
import {
	globFirst,
	loadReadmeMeta,
	getNovelTitles,
	md_anchor_gitee,
	md_href,
	md_link_escape,
	tocSortCallback,
} from './lib/util';
import { makeLink } from './toc_contents';
import sortObject from 'sort-object-keys2';
import { defaultSortCallback, createSortCallback } from '@node-novel/sort';

/**
 * 依根目錄搜尋小說
 * Search Novels by Root Directory
 * 
 * 掃描根目錄下所有符合條件的 README.md 檔案，找出所有小說項目。
 * Scans all matching README.md files under the root directory to find all novel entries.
 * 
 * @param {string} rootPath - 根目錄路徑 / Root directory path
 * @returns {BluebirdPromise<string[]>} 小說路徑陣列 / Array of novel paths
 */
export function searchByRoot(rootPath: string)
{
	return BluebirdPromise.resolve(FastGlob.async<string>([
			// 排除根目錄的 README.md / Exclude root README.md
			'!README.md',
			// 排除第一層目錄的 README.md / Exclude first-level README.md
			'!*/README.md',
			'!.*',
			'!docs',
			// 匹配深層的 README.md / Match deep-level README.md
			'*/*/**/README.md',

			// 排除暫存與原始檔案 / Exclude temp and raw files
			'!*.new.*',
			'!*.out.*',
			'!*.raw',
			'!*.raw.*',
			'!.*',
			'!node_modules',
			'!out',
			'!raw',

		], {
			cwd: rootPath,
			deep: 2,
		}))
		//.tap(v => console.info(v))
		.then(function (ls)
		{
			// 過濾並排序列表 / Filter and sort the list
			return filterList(ls.sort(), rootPath)
		})
		.tap(function (ls)
		{
			if (!ls.length)
			{
				console.warn(rootPath);

				return BluebirdPromise.reject(`list is empty`)
			}
		})
		;
}

/**
 * 檢查是否為小說 ID
 * Check if it is a Novel ID
 * 
 * 判斷指定目錄是否包含 .txt 檔案，以確認是否為有效的小說目錄。
 * Determines if the specified directory contains .txt files to confirm it's a valid novel directory.
 * 
 * @param {string} dir - 目錄路徑 / Directory path
 * @param {string} [rootPath] - 選填，根目錄路徑 / Optional, root directory path
 * @returns {BluebirdPromise<string>} 找到的第一個 .txt 檔案路徑 / First .txt file path found
 */
export function isNovelID(dir: string, rootPath?: string)
{
	// @ts-ignore
	let _path: string = path.resolve(...[rootPath, path.dirname(dir)].filter(v => typeof v !== 'undefined'));

	return globFirst([
		'**/*.txt',
		//...defaultPatternsExclude,
	], {
		cwd: _path,
		absolute: true,
		ignore: defaultPatternsExclude,
	})
	//.tap(v => console.log(v))
}

/**
 * 過濾列表
 * Filter List
 * 
 * 過濾小說路徑列表，移除重複項目（如 _out 目錄的重複）。
 * Filters novel path list, removing duplicates (such as _out directory duplicates).
 * 
 * @param {string[]} ls - 路徑列表 / Path list
 * @param {string} [rootPath] - 選填，根目錄路徑 / Optional, root directory path
 * @returns {BluebirdPromise<string[]>} 過濾後的路徑陣列 / Filtered path array
 */
export function filterList(ls: string[], rootPath?: string)
{
	return BluebirdPromise.reduce(ls, async function (arr, dir)
		{
			// 解析路徑層級 / Parse path levels
			let dl = dir.split('/');

			// 跳過超過三層的目錄 / Skip directories deeper than 3 levels
			if (dl.length > 3)
			{
				return arr;
			}

			// 檢查是否有對應的 _out 目錄 / Check for corresponding _out directory
			if (!/_out$/.test(dl[0]))
			{
				let out = [dl[0] + '_out', ...dl.slice(1)];

				// 若存在 _out 版本則跳過原始版本 / Skip original version if _out version exists
				if (ls.includes(out.join('/')))
				{
					return arr;
				}
			}

			// 確認目錄包含 .txt 檔案 / Confirm directory contains .txt files
			let hasTxt = await isNovelID(dir, rootPath);

			if (hasTxt)
			{
				arr.push(dir);
			}

			return arr;
		}, [] as string[])
		.tap(function (ls)
		{
			if (!ls.length)
			{
				return BluebirdPromise.reject(`list is empty`)
			}
		})
}

/**
 * 依作者處理資料
 * Process Data by Author
 * 
 * 將小說列表依照作者分組整理，並讀取每本小說的元資料。
 * Groups novels by author and reads metadata for each novel.
 * 
 * @template T - 元資料類型 / Metadata type
 * @param {string[]} ls - 小說路徑列表 / Novel path list
 * @param {string} rootPath - 根目錄路徑 / Root directory path
 * @param {IOptions<T>} [options] - 選項 / Options
 * @returns {BluebirdPromise<IDataAuthor<T>>} 依作者分組的資料 / Data grouped by author
 */
export function processDataByAuthor<T extends IMdconfMeta = IMdconfMeta>(ls: string[], rootPath: string, options?: IOptions<T>)
{
	return BluebirdPromise.reduce(ls, async function (data, file)
		{
			// 解析路徑 / Parse path
			let dl = file.split('/');

			// 載入元資料 / Load metadata
			let meta = await loadReadmeMeta(path.join(rootPath, file));

			// 預設作者為 'unknow' / Default author is 'unknow'
			let author = 'unknow';

			if (meta)
			{
				if (meta.novel)
				{
					// 從元資料取得作者資訊 / Get author info from metadata
					if (meta.novel.author)
					{
						author = meta.novel.author
					}
					else if (meta.novel.authors && meta.novel.authors.length)
					{
						author = meta.novel.authors[0]
					}
				}
			}
			else
			{
				return data;
			}

			// 初始化作者資料結構 / Initialize author data structure
			data[author] = data[author] || {};

			let novelID = dl[1];

			data[author][novelID] = data[author][novelID] || [];

			// 加入小說項目 / Add novel entry
			data[author][novelID].push({
				novelID: dl[1],
				pathMain: dl[0],
				file,
				author,
				// @ts-ignore
				meta,
			});

			return data;
		}, {} as IDataAuthor<T>)
		.then(data =>
		{
			// 排序作者資料 / Sort author data
			sortObject(data, {
				sort: tocSortCallback,
				useSource: true,
			});

			// 排序每個作者下的小說 / Sort novels under each author
			Object.keys(data).forEach(function (author)
			{
				sortObject(data[author], {
					sort: tocSortCallback,
					useSource: true,
				});
			});

			// 將 'unknow' 作者移至最後 / Move 'unknow' author to the end
			let key = 'unknow';
			let old = data[key];

			delete data[key];

			if (old)
			{
				data[key] = old;
			}

			return data;
		})
}

/**
 * 依作者分組的資料介面
 * Data grouped by author interface
 */
export interface IDataAuthor<T extends IMdconfMeta = IMdconfMeta>
{
	/**
	 * 作者名稱對應的小說資料
	 * Novel data mapped by author name
	 */
	[author: string]: IDataAuthorNovel<T>,
	/**
	 * 未知作者的小說資料
	 * Novel data for unknown authors
	 */
	unknow?: IDataAuthorNovel<T>,
}

/**
 * 單一作者的小說資料介面
 * Single author's novel data interface
 */
export interface IDataAuthorNovel<T extends IMdconfMeta = IMdconfMeta>
{
	/**
	 * 小說 ID 對應的項目列表
	 * Item list mapped by novel ID
	 */
	[novelID: string]: IDataAuthorNovelItem<T>[]
}

/**
 * 單一小說項目資料介面
 * Single novel item data interface
 */
export interface IDataAuthorNovelItem<T extends IMdconfMeta = IMdconfMeta>
{
	/**
	 * 小說 ID
	 * Novel ID
	 */
	novelID: string,
	/**
	 * 主路徑
	 * Main path
	 */
	pathMain: string,
	/**
	 * 檔案路徑
	 * File path
	 */
	file: string,
	/**
	 * 作者名稱
	 * Author name
	 */
	author: string | 'unknow',
	/**
	 * 元資料
	 * Metadata
	 */
	meta: T,
}

/**
 * 選項介面
 * Options interface
 */
export interface IOptions<T extends IMdconfMeta>
{
	/**
	 * 處理每個子小說的回呼函數
	 * Callback function for processing each sub-novel
	 */
	cbForEachSubNovel?(text: string, item: IDataAuthorNovelItem<T>): void | string,
}

/**
 * 將作者資料轉換為字串
 * Stringify Author Data
 * 
 * 將依作者分組的資料轉換為 Markdown 格式的字串。
 * Converts author-grouped data to Markdown-formatted string.
 * 
 * @template T - 元資料類型 / Metadata type
 * @param {IDataAuthor<T>} data - 作者資料 / Author data
 * @param {string} rootPath - 根目錄路徑 / Root directory path
 * @param {IOptions<T>} [options] - 選項 / Options
 * @returns {string} Markdown 格式的目錄字串 / Markdown-formatted TOC string
 */
export function stringifyDataAuthor<T extends IMdconfMeta = IMdconfMeta>(data: IDataAuthor<T>, rootPath: string, options?: IOptions<T>)
{
	// 初始化標題區塊 / Initialize header block
	let arr = [
		`# TOC\n`,
		`## Author\n`
	];

	let arr_author: string[] = [];

	let authors: string[] = [];

	options = options || {};

	// 遍歷每位作者 / Iterate through each author
	Object.entries(data)
		.forEach(function ([author, row], author_idx)
		{
			// 新增作者標題 / Add author heading
			arr_author.push(`### ${author}\n`);

			authors.push(author);

			// 遍歷該作者的每本小說 / Iterate through each novel by this author
			Object.entries(row)
				.forEach(function ([novelID, list])
				{

					arr_author.push(`#### ${novelID}\n`);

					// 要過濾的標題 / Titles to filter out
					let skip = [
						novelID,
					];

					let titles = [];

					let arr_item = [];

					list.forEach(function (item, index)
					{
						let link = path.dirname(item.file);

						// 檢查是否有導航目錄 / Check for navigation TOC
						let link2 = path.join(link, '導航目錄.md');

						if (fs.existsSync(path.join(rootPath, link2)))
						{
							link = link2
						}

						skip.push(novelID);

						let md = makeLink(`${novelID}`, link);

						let text = `- ${md} - *${item.pathMain}*`;

						// 呼叫自訂處理回呼 / Call custom processing callback
						if (options.cbForEachSubNovel)
						{
							let ret = options.cbForEachSubNovel(text, item);

							if (typeof ret === 'string')
							{
								text = ret;
							}
						}

						arr_item.push(text);

						// 收集所有標題 / Collect all titles
						titles = titles.concat(getNovelTitles(item.meta))
					});

					// 過濾並去重標題 / Filter and deduplicate titles
					titles = array_unique(titles)
						.filter(v => v && v != 'undefined')
						.filter(v => !skip.includes(v))
					;

					// 新增標題行 / Add titles line
					if (titles.length)
					{
						arr_author.push(`> ${titles.join(' , ')}\n`);
					}

					arr_author = arr_author.concat(arr_item);

					arr_author.push(LF);
				})
			;
		})
	;

	// 生成作者錨點連結 / Generate author anchor links
	let authors_anchor = authors.map(name => {
		return `[${md_link_escape(name)}](#${md_anchor_gitee(name)})`;
	}).join('\n  ／  ');

	arr.push(`> ${authors_anchor}\n`);

	arr = arr.concat(arr_author);

	arr.push(LF);

	return arr.join(LF)
}

/**
 * 建立根目錄 TOC
 * Create Root TOC
 * 
 * 掃描根目錄並生成完整的目錄結構，可選擇輸出至檔案。
 * Scans root directory and generates complete TOC structure, optionally outputting to file.
 * 
 * @template T - 元資料類型 / Metadata type
 * @param {string} _root - 根目錄路徑 / Root directory path
 * @param {string} [outputFile] - 選填，輸出檔案路徑 / Optional, output file path
 * @param {IOptions<T>} [options] - 選項 / Options
 * @returns {BluebirdPromise<string>} 生成的目錄內容 / Generated TOC content
 */
export function createTocRoot<T extends IMdconfMeta = IMdconfMeta>(_root: string, outputFile?: string, options?: IOptions<T>)
{
	options = options || {};

	return searchByRoot(_root)
		.then(function (ls)
		{
			return processDataByAuthor<T>(ls, _root, options);
		})
		.then(function (data)
		{
			return stringifyDataAuthor<T>(data, _root, options)
		})
		.tap(function (v)
		{
			if (outputFile)
			{
				return fs.outputFile(outputFile, v);
			}
		})
		;
}

export default createTocRoot

//createTocRoot('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel').tap(v => console.dir(v))
