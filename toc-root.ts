/**
 * Created by user on 2018/11/14/014.
 */

import { LF } from 'crlf-normalize';
import * as FastGlob from 'fast-glob';
import path = require('upath2');
import BluebirdPromise = require('bluebird');
import * as fs from 'fs-extra';
import * as novelGlobby from 'node-novel-globby/g';
import { defaultPatternsExclude } from 'node-novel-globby/lib/options';
import { IMdconfMeta } from 'node-novel-info';
import { globFirst, loadReadmeMeta } from './lib/util';
import { makeLink } from './toc_contents';

export function searchByRoot(rootPath: string)
{
	return BluebirdPromise.resolve(FastGlob.async<string>([
			'!README.md',
			'!*/README.md',
			'!.*',
			'!docs',
			'*/*/**/README.md',


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
			deep: 1,
		}))
		.tap(v => console.log(v))
		.then(function (ls)
		{
			return filterList(ls, rootPath)
		})
		;
}

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

export function filterList(ls: string[], rootPath?: string)
{
	return BluebirdPromise.reduce(ls, async function (arr, dir)
	{
		let dl = dir.split('/');

		if (dl.length > 3)
		{
			return arr;
		}

		if (!/_out$/.test(dl[0]))
		{
			let out = [dl[0] + '_out', ...dl.slice(1)];

			if (ls.includes(out.join('/')))
			{
				return arr;
			}
		}

		let hasTxt = await isNovelID(dir, rootPath);

		if (hasTxt)
		{
			arr.push(dir);
		}

		return arr;
	}, [] as string[])
}

export function processDataByAuthor(ls: string[], rootPath: string)
{
	return BluebirdPromise.reduce(ls, async function (data, file)
	{
		let dl = file.split('/');

		let meta = await loadReadmeMeta(path.join(rootPath, file));

		let key = 'unknow';

		if (meta && meta.novel)
		{
			if (meta.novel.author)
			{
				key = meta.novel.author
			}
			else if (meta.novel.authors && meta.novel.authors.length)
			{
				key = meta.novel.authors[0]
			}
		}

		data[key] = data[key] || {};

		let NovelID = dl[1];

		data[key][NovelID] = data[key][NovelID] || [];

		data[key][NovelID].push({
			novelID: dl[1],
			pathMain: dl[0],
			file,
			meta,
		});

		return data;
	}, {} as IDataAuthor)
}

export interface IDataAuthor
{
	[author: string]: {
		[novelID: string]: {
			novelID: string,
			pathMain: string,
			file: string,
			meta: IMdconfMeta,
		}[]
	}
}

export function stringifyDataAuthor(data: IDataAuthor, rootPath: string)
{
	let arr = [
		`# TOC\n`,
	];

	let arr_author: string[] = [];

	arr_author.push(`## Author\n`);

	Object.entries(data)
		.forEach(function ([author, row], author_idx)
		{
			arr_author.push(`### ${author}\n`)

			Object.entries(row)
				.forEach(function ([NovelID, list])
				{

					arr_author.push(`#### ${NovelID}\n`);

					list.forEach(function (item, index)
					{
						let link = path.dirname(item.file);

						let link2 = path.join(link, '導航目錄.md');

						if (fs.existsSync(path.join(rootPath, link2)))
						{
							link = link2
						}

						let md = makeLink(`${NovelID}`, link);

						arr_author.push(`- ${md} - *${item.pathMain}*`);
					});

					arr_author.push(`\n`);
				})
			;
		})
	;

	arr = arr.concat(arr_author);

	return arr.join(LF)
}

export function createTocRoot(_root: string, outputFile?: string)
{
	return searchByRoot(_root)
		.then(function (ls)
		{
			return processDataByAuthor(ls, _root);
		})
		.then(function (ls)
		{
			return stringifyDataAuthor(ls, _root)
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

//createTocRoot('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel')
