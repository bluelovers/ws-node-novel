/**
 * Created by user on 2018/5/1/001.
 */

import { array_unique } from 'array-hyper-unique';
import * as Promise from 'bluebird';
import { Console } from 'debug-color2';
import * as FastGlob from 'fast-glob';
import * as fs from 'fs-extra';
import { IMdconfMeta, mdconf, mdconf_parse } from 'node-novel-info';
import * as sortObjectKeys from 'sort-object-keys2';
import * as self from './index';
import { md_href } from './lib/util';
import path = require('upath2');
export { md_href }

export const console = new Console(null, {
	enabled: true,
	inspectOptions: {
		colors: true,
	},
	chalkOptions: {
		enabled: true,
	},
});

console.enabledColor = true;

export { Promise }

export function get_ids(cwd: string, filter?: typeof defaultFilter)
{
	return Promise.resolve(FastGlob<string>([
			'*',
			'!docs',
			'!.*',
			'!*.raw',
			'!raw',
		], {
			deep: 1,
			onlyDirectories: true,
			markDirectories: false,
			cwd,
		}))
		.then(function (ls)
		{
			if (filter)
			{
				return ls.filter(filter);
			}

			return ls;
		})
		;
}

export function processToc(DIST_NOVEL_ROOT: string, filter?: typeof defaultFilter)
{
	return get_ids(DIST_NOVEL_ROOT, filter)
		.then(async function (ls)
		{
			if (!ls.length)
			{
				return Promise.reject(`get_ids return empty`)
			}

			return ls;
		})
		.tap(function ()
		{
			console.debug(`[TOC] 開始建立 toc 列表`);
		})
		.reduce(async function (toc_ls, pathMain: string)
		{
			const cwd = path.join(DIST_NOVEL_ROOT, pathMain);

			const IS_OUT = /_out$/.test(pathMain);

			//console.log(`[TOC] 檢查 ${pathMain}`);

			let bool = false;

			await Promise
				.reduce(FastGlob<string>([
					'*/README.md',
				], {
					cwd,
				}), function (ret: IRet, item)
				{
					return createReadmeData(cwd, ret, item);
				}, {} as IRet)
				.tap(async function (ret)
				{
					if (!Object.keys(ret).length)
					{
						console.gray(`[TOC] 忽略 ${pathMain}`);
						return null;
					}

					bool = true;

					console.debug(`[TOC] 處理 ${pathMain}`);

					toc_ls[pathMain] = ret;

					ret = Object.keys(ret)
						.sort()
						.reduce(function (a, item_id)
						{
							let item = ret[item_id];

							item.link = `[${item_id}](${md_href(item_id)}/)`;

							let target_id = IS_OUT ? pathMain.replace(/_out$/, '') : pathMain + '_out';

							let link_path = path.join(DIST_NOVEL_ROOT, target_id, item_id);

							//console.log(link_path, fs.existsSync(link_path));

							if (fs.existsSync(link_path))
							{
								item[IS_OUT
									? 'link_source'
									: 'link_output'] = `[${item_id}](../${target_id}/${md_href(item_id)}/)`;
							}

							if (Array.isArray(item.titles))
							{
								item.titles = array_unique(item.titles)
									.filter(v => v)
								;
							}

							if (Array.isArray(item.tags))
							{
								item.tags = array_unique(item.tags)
									.filter(v => v)
								;
							}

							if (!item.titles)
							{
								delete item.titles;
							}
							else if (item.titles.length == 1)
							{
								// @ts-ignore
								item.titles = item.titles[0];
							}

							if (item.tags)
							{
								// @ts-ignore
								item.tags = item.tags.join(' , ');
							}

							sortObjectKeys(item, {
								useSource: true,
								keys: [
									'link',
									'link_output',
									'link_source',
									'titles',
									'tags',
								],
							});

							a[item_id] = item;

							return a;
						}, {})
					;

					let md = mdconf.stringify({
						toc: ret,
					});

					//console.log(pathMain, ret);
					//console.log(md);

					await fs.writeFile(path.join(cwd, 'README.md'), md);
				})
				;

			return toc_ls;
		}, {} as {
			[k: string]: IRet,
		})
		.tap(function ()
		{
			console.debug(`[TOC] 結束建立 toc 列表`);
		})
		;

}

export interface IRetRow
{
	titles: string[],
	tags?: string[],

	link?: string,
}

export interface IRet
{
	[k: string]: IRetRow
}

export function createReadmeData(cwd: string, ret: IRet, item: string): Promise<IRet>
// @ts-ignore
export async function createReadmeData(cwd: string, ret: IRet, item: string): Promise<IRet>
{
	let item_id = path.basename(path.dirname(item));

	let meta_file = path.join(cwd, item);

	let meta: IMdconfMeta = await fs.readFile(meta_file)
		.then(mdconf_parse)
		.catch(function (err)
		{
			console.error(err.toString());

			return null;
		})
	;

	ret[item_id] = {
		titles: [],
		tags: [],
	};

	{
		let titles = [] as string[];

		titles.push(item_id);

		if (meta)
		{
			titles.push(meta.novel.title);
			titles.push(meta.novel.title_zh);
			titles.push(meta.novel.title_jp);
			titles.push(meta.novel.title_en);
			titles.push(meta.novel.title_short);
			// @ts-ignore
			titles.push(meta.novel.title_tw);
			// @ts-ignore
			titles.push(meta.novel.title_cn);
			// @ts-ignore
			titles.push(meta.novel.title_source);
			// @ts-ignore
			titles.push(meta.novel.title_other);
			// @ts-ignore
			titles.push(meta.novel.title_output);

			if (meta.novel.series)
			{
				titles.push(meta.novel.series.name);
				titles.push(meta.novel.series.name_short);
			}

			if (meta.novel.author)
			{
				ret[item_id].tags.push(meta.novel.author)
			}
		}

		titles = array_unique(titles.filter(v => v));

		if (titles.length == 1 && titles[0] == item_id)
		{
			titles = null;
		}

		ret[item_id].titles = titles;
	}

	if (meta && meta.novel.tags)
	{
		ret[item_id].tags = ret[item_id].tags
			.concat(Object.values(meta.novel.tags))
		;
	}

	return ret;
}

export function defaultFilter(value: string): boolean
{
	return true;
}

export default self
