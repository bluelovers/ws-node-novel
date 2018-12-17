/**
 * Created by user on 2018/11/14/014.
 */

import { array_unique } from 'array-hyper-unique';
import { LF } from 'crlf-normalize';
import * as FastGlob from 'fast-glob';
import path = require('upath2');
import BluebirdPromise = require('bluebird');
import * as fs from 'fs-extra';
import * as novelGlobby from 'node-novel-globby/g';
import { defaultPatternsExclude } from 'node-novel-globby/lib/options';
import { IMdconfMeta } from 'node-novel-info';
import { globFirst, loadReadmeMeta, getNovelTitles, md_anchor_gitee, md_href, md_link_escape } from './lib/util';
import { makeLink } from './toc_contents';
import sortObject = require('sort-object-keys2');
import { defaultSortCallback, createSortCallback } from '@node-novel/sort';

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
			deep: 2,
		}))
		//.tap(v => console.info(v))
		.then(function (ls)
		{
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
		.tap(function (ls)
		{
			if (!ls.length)
			{
				return BluebirdPromise.reject(`list is empty`)
			}
		})
}

export function processDataByAuthor<T extends IMdconfMeta = IMdconfMeta>(ls: string[], rootPath: string, options?: IOptions<T>)
{
	return BluebirdPromise.reduce(ls, async function (data, file)
		{
			let dl = file.split('/');

			let meta = await loadReadmeMeta(path.join(rootPath, file));

			let author = 'unknow';

			if (meta)
			{
				if (meta.novel)
				{
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

			data[author] = data[author] || {};

			let novelID = dl[1];

			data[author][novelID] = data[author][novelID] || [];

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

			sortObject(data, {
				sort: defaultSortCallback,
				useSource: true,
			});

			Object.keys(data).forEach(function (author)
			{
				sortObject(data[author], {
					sort: defaultSortCallback,
					useSource: true,
				});
			});

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

export interface IDataAuthor<T extends IMdconfMeta = IMdconfMeta>
{
	[author: string]: IDataAuthorNovel<T>,
	unknow?: IDataAuthorNovel<T>,
}

export interface IDataAuthorNovel<T extends IMdconfMeta = IMdconfMeta>
{
	[novelID: string]: IDataAuthorNovelItem<T>[]
}

export interface IDataAuthorNovelItem<T extends IMdconfMeta = IMdconfMeta>
{
	novelID: string,
	pathMain: string,
	file: string,
	author: string | 'unknow',
	meta: T,
}

export interface IOptions<T extends IMdconfMeta>
{
	cbForEachSubNovel?(text: string, item: IDataAuthorNovelItem<T>): void | string,
}

export function stringifyDataAuthor<T extends IMdconfMeta = IMdconfMeta>(data: IDataAuthor<T>, rootPath: string, options?: IOptions<T>)
{
	let arr = [
		`# TOC\n`,
		`## Author\n`
	];

	let arr_author: string[] = [];

	let authors: string[] = [];

	options = options || {};

	Object.entries(data)
		.forEach(function ([author, row], author_idx)
		{
			arr_author.push(`### ${author}\n`);

			authors.push(author);

			Object.entries(row)
				.forEach(function ([novelID, list])
				{

					arr_author.push(`#### ${novelID}\n`);

					let skip = [
						novelID,
					];

					let titles = [];

					let arr_item = [];

					list.forEach(function (item, index)
					{
						let link = path.dirname(item.file);

						let link2 = path.join(link, '導航目錄.md');

						if (fs.existsSync(path.join(rootPath, link2)))
						{
							link = link2
						}

						skip.push(novelID);

						let md = makeLink(`${novelID}`, link);

						let text = `- ${md} - *${item.pathMain}*`;

						if (options.cbForEachSubNovel)
						{
							let ret = options.cbForEachSubNovel(text, item);

							if (typeof ret === 'string')
							{
								text = ret;
							}
						}

						arr_item.push(text);

						titles = titles.concat(getNovelTitles(item.meta))
					});

					titles = array_unique(titles)
						.filter(v => !skip.includes(v))
					;

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

	let authors_anchor = authors.map(name => {
		return `[${md_link_escape(name)}](${md_anchor_gitee(name)})`;
	}).join('  ／  ') + '\n';

	arr.push(authors_anchor);

	arr = arr.concat(arr_author);

	arr.push(LF);

	return arr.join(LF)
}

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
