/**
 * Created by user on 2018/11/11/011.
 */

import fsIconv, { trimFilename } from 'fs-iconv';
import path from 'upath2';
import {
	IContext,
	IDataVolume,
	IOptions,
	IOptionsWithData,
	IPathLike,
	IOptionsRequired,
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
} as IOptions);

export function makeOptions<O extends IOptions>(inputFile: IPathLike, options: O): O
{
	let cache: O = Object.assign({
		...defaultOptions,
		file: inputFile,
	}, options);

	cache.dirname = path.dirname(cache.file);

	return cache;
}

export async function autoFile<O extends IOptionsRequired>(inputFile: IPathLike, options: O)
{
	let ret = await readFile(inputFile, options);

	let ls: string[] = await outputFile(ret);

	return Object.assign(ret, {
		ls,
	});
}

export async function readFile<O extends IOptions>(inputFile: IPathLike, options: O)
{
	let cache = makeOptions(inputFile, options);

	let txt = await fsIconv.readFile(cache.file)
		.then(function (data)
		{
			return _handleReadFile(data, cache.file);
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

			await fs.outputFile(path.join(path_main, file), data[vn][cn]);

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
