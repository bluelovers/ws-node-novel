/**
 * Created by user on 2018/11/11/011.
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
import fs = require('fs-extra');
import { console } from './console';

export const defaultOptions = Object.freeze({
	file: null,
	dirname: null,
	outDir: null,
	indexPadLength: 5,
	useRegExpCJK: true,
} as IOptions);

export function makeOptions<O extends IOptions>(inputFile: IPathLike, options: O): O
{
	let cache: O = Object.assign({
		...defaultOptions,
		file: inputFile,
	}, options, {
		file: options.file || inputFile,
	});

	cache.dirname = path.dirname(cache.file);

	if (cache.useRegExpCJK)
	{
		if (typeof cache.useRegExpCJK !== 'function')
		{
			cache.useRegExpCJK = zhRegExp
		}
	}

	return cache;
}

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

	_re(opts.volume);
	_re(opts.chapter);

	function _re(data: ISplitOption<any>): data is ISplitOption
	{
		if (data)
		{
			if (data.r)
			{
				const FLAGS = data.flags || 'gim';

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
					data.r = new RE(data.r, data.r.flags || FLAGS);
				}
			}

			if (data.ignoreRe)
			{
				const FLAGS = data.ignoreFlags || 'i';

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
					data.ignoreRe = new RE(data.ignoreRe, data.ignoreRe.flags || FLAGS);
				}
			}

			return true
		}
	}

	// @ts-ignore
	return opts
}

export async function autoFile<O extends IOptionsRequired | IOptionsRequiredUser>(inputFile: IPathLike, options: O)
{
	let opts = _handleOptions(options);

	let ret = await readFile(inputFile, opts);

	let ls: string[] = await outputFile(ret);

	return Object.assign(ret, {
		ls,
	});
}

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

export async function outputFile(data: IDataVolume | IOptionsWithData,
	options?: Partial<IOptionsWithData>,
): Promise<string[]>
{
	({ data, options } = _outputFile(data, options));

	let path_main = options.outDir || path.join(options.dirname, 'out');

	let ls: string[] = [];

	for (let vn in data)
	{
		for (let cn in data[vn])
		{
			let file = path.join(trimFilename(vn), trimFilename(cn) + '.txt');

			let full_file = path.join(path_main, file);

			let txt = data[vn][cn];

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

export function outputFileSync(data: IDataVolume | IOptionsWithData,
	options?: Partial<IOptionsWithData>,
): string[]
{
	({ data, options } = _outputFile(data, options));

	let path_main = options.outDir || path.join(options.dirname, 'out');

	let ls: string[] = [];

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
