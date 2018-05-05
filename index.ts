/**
 * Created by user on 2018/5/1/001.
 */

import * as Promise from 'bluebird';
import * as globby from 'globby';
import path = require('upath2');
import * as fs from 'fs-extra';
import novelInfo, { mdconf_parse, IMdconfMeta, stringify, mdconf } from 'node-novel-info';
import * as array_uniq from 'array-uniq';

import * as sortObjectKeys from 'sort-object-keys2';

function array_unique<T>(arr: T[]): T[]
{
	return array_uniq(arr);
}

const DIST_NOVEL_ROOT = 'D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel';

const PATH_MAIN_IDS = [
	'cm',
	'iqing',
	'sfacg',
	'user',
	'uukanshu',
	'webqxs',
	'wenku8',
];

Promise.reduce(PATH_MAIN_IDS, function (total: string[], current, index, arrayLength)
	{
		total.push(current);
		total.push(current + '_out');

		return total;
	}, [])
	.map(function (pathMain)
	{
		const cwd = path.join(DIST_NOVEL_ROOT, pathMain);

		const IS_OUT = /_out$/.test(pathMain);

		return Promise
			.reduce(globby([
				'*/README.md',
			], {
				cwd,
			}), async function (ret: {
				[k: string]: {
					titles: string[],
					tags?: string[],
				}
			}, item)
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

				// @ts-ignore
				ret[item_id] = {};

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
						titles.push(meta.novel.title_source);

						if (meta.novel.series)
						{
							titles.push(meta.novel.series.name);
							titles.push(meta.novel.series.name_short);
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
					ret[item_id].tags = array_unique(meta.novel.tags);
				}

				return ret;
			}, {} as {
				[k: string]: {
					titles: string[],
				}
			})
			.then(async function (ret)
			{
				if (!Object.keys(ret).length) return null;

				ret = Object.keys(ret)
					.sort()
					.reduce(function (a, item_id)
					{
						let item = ret[item_id];

						item.link = `[${item_id}](${md_href(item_id)}/)`;

						let target_id = IS_OUT ? pathMain.replace(/_out$/, '') : pathMain + '_out';

						if (fs.existsSync(path.join(DIST_NOVEL_ROOT, target_id, item_id)))
						{
							item[IS_OUT ? 'link_source' : 'link_output'] = `[${item_id}](../${target_id}/${md_href(item_id)}/)`;
						}

						if (!item.titles)
						{
							delete item.titles;
						}
						else if (item.titles.length == 1)
						{
							item.titles = item.titles[0];
						}

						if (item.tags)
						{
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

				//process.exit();
			})
			;
	})
;

function md_href(href)
{
	return encodeURIComponent(href);
}
