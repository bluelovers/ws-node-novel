/**
 * Created by user on 2018/11/14/014.
 * 
 * TOC 工具函數模組
 * TOC Utility Functions Module
 * 
 * 提供目錄處理相關的工具函數，包括元資料載入、標題取得、連結處理等。
 * Provides utility functions for TOC processing, including metadata loading, title retrieval, and link handling.
 */

import { _trim, createSortCallback, defaultSortCallback, EnumToLowerCase } from '@node-novel/sort';
import { array_unique } from 'array-hyper-unique';
import FastGlob from '@bluelovers/fast-glob';
import fs from 'fs-iconv';
import { IMdconfMeta, mdconf_parse } from 'node-novel-info';
import BluebirdPromise from 'bluebird';
import { toHalfWidth } from '@lazy-cjk/fullhalf';

/**
 * 載入 README 元資料
 * Load README Metadata
 * 
 * 非同步讀取 README.md 檔案並解析其元資料。
 * Asynchronously reads README.md file and parses its metadata.
 * 
 * @template T - 元資料類型 / Metadata type
 * @param {string} file - 檔案路徑 / File path
 * @returns {Promise<T>} 解析後的元資料 / Parsed metadata
 */
export async function loadReadmeMeta<T extends IMdconfMeta = IMdconfMeta>(file: string): Promise<T>
{
	return fs.readFile(file)
		.then(function (data)
		{
			return mdconf_parse(data, {
				// 當沒有包含必要的內容時不產生錯誤 / Don't throw error when missing required content
				throw: false,
				// 允許不標準的 info 內容 / Allow non-standard info content
				lowCheckLevel: true,
			});
		})
		.catch(function ()
		{
			return null;
		})
		;
}

/**
 * 同步載入 README 元資料
 * Load README Metadata Synchronously
 * 
 * 同步讀取 README.md 檔案並解析其元資料。
 * Synchronously reads README.md file and parses its metadata.
 * 
 * @template T - 元資料類型 / Metadata type
 * @param {string} file - 檔案路徑 / File path
 * @returns {T} 解析後的元資料，失敗時返回 null / Parsed metadata, returns null on failure
 */
export function loadReadmeMetaSync<T extends IMdconfMeta = IMdconfMeta>(file: string): T
{
	try
	{
		let data = fs.readFileSync(file);

		// @ts-ignore
		return mdconf_parse(data, {
			// 當沒有包含必要的內容時不產生錯誤 / Don't throw error when missing required content
			throw: false,
			// 允許不標準的 info 內容 / Allow non-standard info content
			lowCheckLevel: true,
		})
	}
	catch (e)
	{

	}

	return null;
}

/**
 * 取得小說標題列表
 * Get Novel Titles List
 * 
 * 從元資料中提取所有相關的標題，包括各語言版本與系列名稱。
 * Extracts all relevant titles from metadata, including various language versions and series names.
 * 
 * @template T - 元資料類型 / Metadata type
 * @param {T} meta - 小說元資料 / Novel metadata
 * @returns {string[]} 標題列表 / List of titles
 */
export function getNovelTitles<T extends IMdconfMeta = IMdconfMeta>(meta: T): string[]
{
	if (meta && meta.novel)
	{
		// 收集所有標題相關欄位 / Collect all title-related fields
		let arr = [
				'title',
				'title_source',
				'title_jp',
				'title_ja',
				'title_zh',
				'title_tw',
				'title_cn',
			].concat(Object.keys(meta.novel))
			.reduce(function (a, key: string)
			{
				// 只收集以 title 開頭的欄位 / Only collect fields starting with 'title'
				if (key.indexOf('title') === 0)
				{
					a.push(meta.novel[key])
				}

				return a
			}, [])
		;

		// 加入系列名稱 / Add series names
		if (meta.novel.series)
		{
			arr.push(meta.novel.series.name);
			arr.push(meta.novel.series.name_short);
		}

		// 過濾無效標題 / Filter invalid titles
		arr = array_unique(arr.filter(v => v && ![
			'undefined',
			'長編 【連載】',
			'連載中',
		].includes(v)));

		return arr;
	}

	return [];
}

/**
 * 取得第一個匹配的檔案
 * Get First Matched File
 * 
 * 使用 FastGlob 搜尋並返回第一個匹配的檔案路徑。
 * Uses FastGlob to search and return the first matched file path.
 * 
 * @param {...Parameters<typeof FastGlob["stream"]>} argv - FastGlob 參數 / FastGlob parameters
 * @returns {BluebirdPromise<string>} 第一個匹配的檔案路徑 / First matched file path
 */
export function globFirst(...argv: Parameters<typeof FastGlob["stream"]>): BluebirdPromise<string>
{
	return new BluebirdPromise<string>(function (resolve, reject)
	{
		let fgs = FastGlob.stream(...argv);

		// 找到第一個匹配項後立即返回 / Return immediately after finding first match
		fgs.on('data', (entry) =>
		{
			resolve(entry);

			// @ts-ignore
			fgs.destroy();
		});
		fgs.once('error', reject);
		fgs.once('end', () => resolve(undefined));
	})
}

/**
 * Markdown 連結路徑編碼
 * Markdown Link Path Encoding
 * 
 * 將路徑進行 URL 編碼，保留路徑分隔符。
 * URL-encodes the path while preserving path separators.
 * 
 * @param {string} href - 原始路徑 / Original path
 * @returns {string} 編碼後的路徑 / Encoded path
 */
export function md_href(href: string)
{
	return href.split('/').map(encodeURIComponent).join('/');
}

/**
 * 生成 Gitee 風格的 Markdown 錨點
 * Generate Gitee-style Markdown Anchor
 * 
 * 將標題轉換為 Gitee 平台相容的錨點格式。
 * Converts title to Gitee platform-compatible anchor format.
 * 
 * @param {string} title - 標題文字 / Title text
 * @returns {string} 錨點字串 / Anchor string
 */
export function md_anchor_gitee(title: string)
{
	let anchor = title
		// 英文字母轉小寫 / Convert English letters to lowercase
		.replace(/[a-z]+/ig, function (s)
		{
			return s.toLowerCase();
		})
		// 移除特殊字元 / Remove special characters
		.replace(/[\.．\/／　＠@（）\(\)～~]/g, '')
		// 空格轉為連字號 / Convert spaces to hyphens
		.replace(/[ ]/g, '-')
	;

	return md_href(anchor);
}

/**
 * 跳脫 Markdown 連結文字
 * Escape Markdown Link Text
 * 
 * 跳脫 Markdown 連結中的方括號字元。
 * Escapes square bracket characters in Markdown links.
 * 
 * @param {string} text - 原始文字 / Original text
 * @returns {string} 跳脫後的文字 / Escaped text
 */
export function md_link_escape(text: string)
{
	return text.replace(/[\[\]]/g, function (s)
	{
		return '\\' + s;
	})
}

/**
 * TOC 排序回呼函數
 * TOC Sort Callback Function
 * 
 * 用於目錄排序的回呼函數，支援數字排序與全形字元轉換。
 * Callback function for TOC sorting, supporting numeric sorting and full-width character conversion.
 */
export const tocSortCallback = createSortCallback({
	// 啟用數字排序 / Enable numeric sorting
	dotNum: true,
	/**
	 * 轉換基礎字串
	 * Transpile base string
	 * 
	 * 將全形字元轉換為半形以便排序比較。
	 * Converts full-width characters to half-width for sorting comparison.
	 */
	transpileBase(input: string, isSub?: any)
	{
		let s = toHalfWidth(input);
		return s
	},
	// 使用 toLocaleLowerCase 進行大小寫轉換 / Use toLocaleLowerCase for case conversion
	toLowerCase: EnumToLowerCase.toLocaleLowerCase,
});
