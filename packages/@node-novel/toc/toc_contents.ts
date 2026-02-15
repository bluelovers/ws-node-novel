/**
 * Created by user on 2018/8/13/013.
 * 
 * 目錄內容處理模組
 * Table of Contents Content Processing Module
 * 
 * 此模組用於處理小說目錄內容，生成 Markdown 格式的目錄列表。
 * This module processes novel table of contents content and generates Markdown-formatted directory listings.
 */

import { normalize_strip } from '@node-novel/normalize';
import { array_unique } from 'array-hyper-unique';
import BluebirdPromise from 'bluebird';
import fs from 'fs-extra';
import * as novelGlobby from 'node-novel-globby/g';
import { sortTree } from 'node-novel-globby/lib/glob-sort';
import { getNovelTitles, loadReadmeMetaSync, md_href, md_link_escape } from './lib/util';
import path from 'upath2';
export { md_href, md_link_escape }

/*
processTocContents('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user/豚公爵に転生したから、今度は君に好きと言いたい', './test/temp/123.txt')
	.tap(function (ls)
	{
		console.log(ls);
	})
;
*/

/**
 * 標題函數類型
 * Header function type
 * 
 * 定義用於生成目錄標題的函數類型，支援同步與非同步兩種模式。
 * Defines the function type for generating TOC headers, supporting both sync and async modes.
 */
export type IFnHeader = typeof makeHeader
	| typeof makeHeaderAsync
	| any
	;

/**
 * 處理目錄內容
 * Process Table of Contents Content
 * 
 * 掃描指定路徑下的所有 .txt 檔案，並生成 Markdown 格式的目錄列表。
 * 支援多層級目錄結構，自動生成對應的標題層級。
 * 
 * Scans all .txt files under the specified path and generates a Markdown-formatted TOC list.
 * Supports multi-level directory structures with automatic heading level generation.
 * 
 * @param {string} basePath - 基礎路徑，包含小說檔案的目錄 / Base path containing novel files
 * @param {string} [outputFile] - 選填，輸出檔案路徑 / Optional, output file path
 * @param {IFnHeader} [fnHeader=makeHeader] - 選填，標題生成函數 / Optional, header generation function
 * @returns {BluebirdPromise<string>} 生成的 Markdown 目錄內容 / Generated Markdown TOC content
 */
export function processTocContents(basePath: string, outputFile?: string, fnHeader: IFnHeader = makeHeader)
{
	return getList(basePath)
		.then(function (ls)
		{
			// 排序檔案樹結構 / Sort file tree structure
			return sortTree(ls)
		})
		.then(async function (ls)
		{
			if (!ls.length)
			{
				return '';
			}

			// 追蹤上一層目錄名稱 / Track previous directory name
			let lastTop: string;
			// 追蹤上上層目錄名稱 / Track second-level directory name
			let lastTop2: string;

			// 標記是否為根層級 / Flag for root level
			let lv0: boolean = true;

			return ls.reduce(function (a, b)
			{
				// 解析路徑層級 / Parse path levels
				let c = b.split('/');

				let nowTop = c[0];

				// 判斷目錄層級 / Determine directory level
				if (c.length != 1)
				{
					lv0 = false;
				}
				else if (lv0)
				{
					nowTop = 'root';
				}
				else
				{
					lastTop = undefined;
					lastTop2 = undefined;
				}

				// 當頂層目錄變更時，新增二級標題 / Add level-2 heading when top directory changes
				if (nowTop != lastTop)
				{
					let md = makeLink(nowTop, c[0], true);

					a.push(`\n\n## ${md}\n`);

					lastTop2 = undefined
				}

				let nowFile: string;

				// 處理三層以上的目錄結構 / Handle directory structure with 3+ levels
				if (c.length > 2)
				{
					let nowTop2 = c[1];

					// 當第二層目錄變更時，新增三級標題 / Add level-3 heading when second-level directory changes
					if (nowTop2 != lastTop2)
					{
						let md = makeLink(nowTop2, c.slice(0, 2).join('/'), true);

						a.push(`\n### ${md}\n`);
					}

					lastTop2 = nowTop2;

					nowFile = c[2];
				}
				else if (c.length == 1)
				{
					// 根層級檔案 / Root level file
					nowFile = b;
				}
				else
				{
					// 兩層目錄結構 / Two-level directory structure
					nowFile = c[1];
				}

				// 生成檔案連結 / Generate file link
				let md = makeLink(nowFile, b);

				a.push(`- ${md}`);

				lastTop = nowTop;

				return a;
				// @ts-ignore
			}, await fnHeader(basePath)).join("\n") + "\n\n"
		})
		.tap(function (ls)
		{
			// 若指定輸出檔案，則寫入檔案 / Write to file if output path specified
			if (ls && outputFile)
			{
				return fs.outputFile(outputFile, ls);
			}
		})
		;
}

/**
 * 非同步生成標題
 * Generate Header Asynchronously
 * 
 * 以 Bluebird Promise 包裝同步標題生成函數。
 * Wraps the sync header generation function with Bluebird Promise.
 * 
 * @param {string} basePath - 基礎路徑 / Base path
 * @param {...any} argv - 額外參數 / Additional arguments
 * @returns {BluebirdPromise<string[]>} 標題行陣列 / Array of header lines
 */
export function makeHeaderAsync(basePath: string, ...argv)
{
	return BluebirdPromise.resolve(makeHeader(basePath))
}

/**
 * 生成目錄標題
 * Generate Table of Contents Header
 * 
 * 讀取小說的 README.md 元資料，生成包含標題、作者及相關連結的目錄標題區塊。
 * Reads novel README.md metadata and generates TOC header block with title, author, and related links.
 * 
 * @param {string} basePath - 基礎路徑 / Base path
 * @param {...any} argv - 額外參數 / Additional arguments
 * @returns {string[]} 標題行陣列 / Array of header lines
 */
export function makeHeader(basePath: string, ...argv)
{

	// 初始化標題陣列，預設使用目錄名稱 / Initialize titles array with directory name as default
	let titles: string[] = [
		path.basename(basePath),
	];

	// 載入 README.md 元資料 / Load README.md metadata
	let meta = loadReadmeMetaSync(path.join(basePath, 'README.md'));

	if (meta && meta.novel)
	{
		// 從元資料取得所有標題 / Get all titles from metadata
		let arr = getNovelTitles(meta);

		if (arr.length)
		{
			titles = array_unique(titles.concat(arr));
		}
	}

	// 建立標題區塊 / Build header block
	let arr = [
		`# CONTENTS\n`,
		titles.join('  \n') + `  \n`,
	];

	// 若有作者資訊則加入 / Add author info if available
	if (meta && meta.novel && meta.novel.author)
	{
		arr.push(`作者： ${meta.novel.author}  \n`);
	}

	// 附加連結區塊 / Appended links section
	let _appended = [];

	let _path: string;

	// 檢查 README.md 是否存在 / Check if README.md exists
	_path = 'README.md';

	if (fs.existsSync(path.join(basePath, _path)))
	{
		let md = makeLink(`README.md`, _path);

		_appended.push(`- :closed_book: ${md} - 簡介與其他資料`)
	}

	{
		let _arr: string[] = [];

		// 檢查譯名對照.md 是否存在 / Check if 譯名對照.md exists
		_path = '譯名對照.md';

		if (fs.existsSync(path.join(basePath, _path)))
		{
			let md = makeLink(`譯名對照`, _path);

			_arr.push(`${md}`)
		}

		// 檢查整合樣式.md 是否存在 / Check if 整合樣式.md exists
		_path = '整合樣式.md';

		if (fs.existsSync(path.join(basePath, _path)))
		{
			let md = makeLink(`整合樣式`, _path);

			_arr.push(`${md}`)
		}

		if (_arr.length)
		{
			_appended.push(`- :pencil: ${_arr.join(' ／ ')}`)
		}
	}

	// 檢查含有原文的章節 / Check for chapters with original text
	_path = 'ja.md';

	if (fs.existsSync(path.join(basePath, _path)))
	{
		let md = makeLink(`含有原文的章節`, _path);

		_appended.push(`- ${md} - 可能為未翻譯或者吞樓，等待圖轉文之類`)
	}

	// 檢查待修正屏蔽字 / Check for blocked words to fix
	_path = '待修正屏蔽字.md';

	if (fs.existsSync(path.join(basePath, _path)))
	{
		let md = makeLink(`待修正屏蔽字`, _path);

		_appended.push(`- ${md} - 需要有人協助將 \`**\` 內的字補上`);
	}

	// 將附加連結加入標題區塊 / Append links to header block
	if (_appended.length)
	{
		arr.push("\n");
		arr.push(..._appended);
	}

	return arr;
}

/**
 * 建立 Markdown 連結
 * Create Markdown Link
 * 
 * 將標題與路徑轉換為 Markdown 格式的連結。
 * Converts title and path into a Markdown-formatted link.
 * 
 * @param {string} title - 連結標題 / Link title
 * @param {string} link - 連結路徑 / Link path
 * @param {boolean} [isDir] - 是否為目錄 / Whether it's a directory
 * @returns {string} Markdown 格式連結 / Markdown-formatted link
 */
export function makeLink(title: string, link: string, isDir?: boolean)
{
	// 標準化標題 / Normalize title
	let t = normalize_strip(title, isDir);

	if (!isDir)
	{
		// 移除 .txt 副檔名 / Remove .txt extension
		t = path.basename(t, '.txt');
	}

	// 跳脫特殊字元 / Escape special characters
	t = md_link_escape(t);

	return `[${t}](${md_href(link)})`
}

/**
 * 取得檔案列表
 * Get File List
 * 
 * 使用 glob 模式搜尋指定目錄下的所有 .txt 檔案。
 * Uses glob pattern to search for all .txt files in the specified directory.
 * 
 * @param {string} basePath - 基礎路徑 / Base path
 * @returns {BluebirdPromise<string[]>} 檔案路徑陣列 / Array of file paths
 */
export function getList(basePath: string)
{
	return novelGlobby.globbyASync([
		'**/*.txt',
	], {
		cwd: basePath,
		throwEmpty: false,
	})
}

export default processTocContents
