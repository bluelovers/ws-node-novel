/**
 * 文字分割核心模組
 * Text Split Core Module
 *
 * 此模組提供文字分割的核心功能，包括讀取、分割和輸出。
 * This module provides core functionality for text splitting, including reading, splitting, and output.
 *
 * @module txt-split/lib
 * @author user
 * @created 2018/11/11
 */

import fsIconv, { trimFilename } from 'fs-iconv';
import { zhRegExp } from 'regexp-cjk';
import path from 'upath2';
import {
	IContext,
	IDataVolume,
	IOptions,
	IOptionsWithData,
	IPathLike,
	IOptionsRequired, IRegExpLike,
	IOptionsRequiredUser, Overwrite, ISplitOption,
} from './interface';
import { splitVolumeSync } from './split';
import { _handleReadFile, _outputFile, _wrapMethod } from './util';
import fs from 'fs-extra';
import { console } from './console';

/**
 * 預設正則表達式旗標
 * Default regular expression flags
 */
const DEFAULT_REGEXP_FLAGS = 'gimu';

/**
 * 預設忽略正則表達式旗標
 * Default ignore regular expression flags
 */
const DEFAULT_REGEXP_FLAGS_IGNORE = 'iu';

/**
 * 預設選項
 * Default options
 *
 * 提供分割功能的預設配置。
 * Provides default configuration for splitting functionality.
 */
export const defaultOptions = Object.freeze({
	/** 輸入檔案路徑 / Input file path */
	file: null,
	/** 檔案所在目錄 / Directory containing the file */
	dirname: null,
	/** 輸出目錄 / Output directory */
	outDir: null,
	/** 索引填充長度 / Index padding length */
	indexPadLength: 5,
	/** 是否使用中日文正則 / Whether to use CJK regex */
	useRegExpCJK: true,
} as IOptions);

/**
 * 建立選項
 * Make options
 *
 * 合併預設選項與使用者提供的選項。
 * Merges default options with user-provided options.
 *
 * @template O - 選項類型 / Options type
 * @param inputFile - 輸入檔案路徑 / Input file path
 * @param options - 使用者選項 / User options
 * @returns 合併後的選項 / Merged options
 */
export function makeOptions<O extends IOptions>(inputFile: IPathLike, options: O): O
{
	let cache: O = Object.assign({
		...defaultOptions,
		file: inputFile,
	}, options, {
		file: options.file || inputFile,
	});

	cache.dirname = path.dirname(cache.file);

	// 設置中日文正則處理函數 / Set CJK regex handler function
	if (cache.useRegExpCJK)
	{
		if (typeof cache.useRegExpCJK !== 'function')
		{
			cache.useRegExpCJK = zhRegExp
		}
	}

	return cache;
}

/**
 * 處理選項
 * Handle options
 *
 * 處理並標準化選項，包括正則表達式的轉換。
 * Processes and normalizes options, including regex conversion.
 *
 * @template O - 選項類型 / Options type
 * @param options - 原始選項 / Original options
 * @returns 處理後的選項 / Processed options
 */
export function _handleOptions<O extends IOptions | IOptionsRequiredUser>(options: O): Overwrite<O, IOptionsRequired<IRegExpLike>>
{
	let opts = Object.assign({
		...defaultOptions,
	}, {
		...options,
	}, {
		volume: options.volume ? {
			...options.volume,
		} : undefined,
		chapter: options.chapter ? {
			...options.chapter,
		} : undefined,
	});

	// 處理卷和章節的正則表達式 / Process volume and chapter regex
	_re(opts.volume);
	_re(opts.chapter);

	/**
	 * 處理分割選項中的正則表達式
	 * Process regex in split options
	 *
	 * @param data - 分割選項 / Split options
	 */
	function _re(data: ISplitOption<any>): data is ISplitOption
	{
		if (data)
		{
			// 處理匹配正則 / Process match regex
			if (data.r)
			{
				const FLAGS = data.flags != null ? data.flags : DEFAULT_REGEXP_FLAGS;

				if (Array.isArray(data.r))
				{
					data.r = data.r.join('');
				}

				if (opts.useRegExpCJK || !(data.r instanceof RegExp))
				{
					let RE: RegExp;

					if (typeof opts.useRegExpCJK === 'function')
					{
						// @ts-ignore
						RE = opts.useRegExpCJK
					}
					else if (opts.useRegExpCJK === true)
					{
						// @ts-ignore
						RE = zhRegExp
					}
					else
					{
						// @ts-ignore
						RE = RegExp
					}

					// @ts-ignore
					data.r = new RE(data.r, data.r.flags != null ? data.r.flags : FLAGS);
				}
			}

			// 處理忽略正則 / Process ignore regex
			if (data.ignoreRe)
			{
				const FLAGS = data.ignoreFlags != null ? data.ignoreFlags : DEFAULT_REGEXP_FLAGS_IGNORE;

				if (Array.isArray(data.ignoreRe))
				{
					data.ignoreRe = data.ignoreRe.join('');
				}

				if (opts.useRegExpCJK || !(data.ignoreRe instanceof RegExp))
				{
					let RE: RegExp;

					if (typeof opts.useRegExpCJK === 'function')
					{
						// @ts-ignore
						RE = opts.useRegExpCJK
					}
					else if (opts.useRegExpCJK === true)
					{
						// @ts-ignore
						RE = zhRegExp
					}
					else
					{
						// @ts-ignore
						RE = RegExp
					}

					// @ts-ignore
					data.ignoreRe = new RE(data.ignoreRe, data.ignoreRe.flags != null ? data.ignoreRe.flags : FLAGS);
				}
			}

			return true
		}
	}

	// @ts-ignore
	return opts
}

/**
 * 自動處理檔案
 * Auto process file
 *
 * 一站式方法：讀取檔案、分割內容、輸出結果。
 * One-stop method: read file, split content, output results.
 *
 * @template O - 選項類型 / Options type
 * @param inputFile - 輸入檔案路徑 / Input file path
 * @param options - 處理選項 / Processing options
 * @returns 處理結果，包含選項、資料和輸出檔案列表 / Processing result with options, data, and output file list
 */
export async function autoFile<O extends IOptionsRequired | IOptionsRequiredUser>(inputFile: IPathLike, options: O)
{
	let opts = _handleOptions(options);

	let ret = await readFile(inputFile, opts);

	let ls: string[] = await outputFile(ret);

	return Object.assign(ret, {
		ls,
	});
}

/**
 * 非同步讀取檔案
 * Async read file
 *
 * 讀取文字檔案並分割為卷章節結構。
 * Reads text file and splits into volume/chapter structure.
 *
 * @template O - 選項類型 / Options type
 * @param inputFile - 輸入檔案路徑 / Input file path
 * @param options - 讀取選項 / Read options
 * @returns 讀取結果，包含選項和分割資料 / Read result with options and split data
 */
export async function readFile<O extends IOptions>(inputFile: IPathLike, options: O)
{
	let cache = makeOptions(inputFile, options);

	let txt: string = await fsIconv.readFile(cache.file)
		.then(function (data)
		{
			return _handleReadFile(data, cache.file, cache);
		})
		.then(async (txt) =>
		{

			if (options.readFileAfter)
			{
				let ret = await options.readFileAfter(txt);

				if (typeof ret === 'string')
				{
					return ret;
				}
			}

			return txt;
		})
	;

	let data = await splitVolumeSync(txt, cache);

	return {
		options: cache,
		data,
	};
}

/**
 * 同步讀取檔案
 * Sync read file
 *
 * 同步讀取文字檔案並分割為卷章節結構。
 * Synchronously reads text file and splits into volume/chapter structure.
 *
 * @template O - 選項類型 / Options type
 * @param inputFile - 輸入檔案路徑 / Input file path
 * @param options - 讀取選項 / Read options
 * @returns 讀取結果，包含選項和分割資料 / Read result with options and split data
 */
export function readFileSync<O extends IOptions>(inputFile: IPathLike, options: O)
{
	let cache = makeOptions(inputFile, options);

	let txt: IContext;

	{
		let data = fsIconv.readFileSync(cache.file);

		txt = _handleReadFile(data, cache.file)

		if (options.readFileAfter)
		{
			let ret = options.readFileAfter(txt);

			if (typeof ret === 'string')
			{
				txt = ret;
			}
		}
	}

	let data = splitVolumeSync(txt, cache);

	return {
		options: cache,
		data,
	};
}

/**
 * 非同步輸出檔案
 * Async output file
 *
 * 將分割後的資料寫入檔案系統。
 * Writes split data to file system.
 *
 * @param data - 分割後的資料或帶資料的選項 / Split data or options with data
 * @param options - 輸出選項 / Output options
 * @returns 輸出的檔案路徑列表 / List of output file paths
 */
export async function outputFile(data: IDataVolume | IOptionsWithData,
	options?: Partial<IOptionsWithData>,
): Promise<string[]>
{
	({ data, options } = _outputFile(data, options));

	let path_main = options.outDir || path.join(options.dirname, 'out');

	let ls: string[] = [];

	// 遍歷卷和章節 / Iterate through volumes and chapters
	for (let vn in data)
	{
		for (let cn in data[vn])
		{
			let file = path.join(trimFilename(vn), trimFilename(cn) + '.txt');

			let full_file = path.join(path_main, file);

			let txt = data[vn][cn];

			// 儲存前的回調處理 / Pre-save callback processing
			if (options.saveFileBefore)
			{
				let cache: Parameters<typeof options.saveFileBefore>[3] = {
					file,
					full_file,
					data,
					options,
					cn,
					vn,
				};

				let ret = options.saveFileBefore(txt, cn, data[vn], cache);

				if (ret == null)
				{
					continue;
				}

				({ file } = cache);

				txt = ret;
			}

			await fs.outputFile(path.join(path_main, file), txt);

			ls.push(file);
		}
	}

	return ls;
}

/**
 * 同步輸出檔案
 * Sync output file
 *
 * 同步將分割後的資料寫入檔案系統。
 * Synchronously writes split data to file system.
 *
 * @param data - 分割後的資料或帶資料的選項 / Split data or options with data
 * @param options - 輸出選項 / Output options
 * @returns 輸出的檔案路徑列表 / List of output file paths
 */
export function outputFileSync(data: IDataVolume | IOptionsWithData,
	options?: Partial<IOptionsWithData>,
): string[]
{
	({ data, options } = _outputFile(data, options));

	let path_main = options.outDir || path.join(options.dirname, 'out');

	let ls: string[] = [];

	// 遍歷卷和章節 / Iterate through volumes and chapters
	for (let vn in data)
	{
		for (let cn in data[vn])
		{
			let file = path.join(trimFilename(vn), trimFilename(cn) + '.txt');

			fs.outputFileSync(path.join(path_main, file), data[vn][cn]);

			ls.push(file);
		}
	}

	return ls;
}

// 包裝非同步方法以提供錯誤處理 / Wrap async methods for error handling
[
	'outputFile',
	'autoFile',
	'readFile',
]
	.forEach(function (key)
	{
		exports[key] = _wrapMethod(exports[key])
	})
;

export default autoFile
