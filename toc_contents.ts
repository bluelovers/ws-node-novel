/**
 * Created by user on 2018/8/13/013.
 */

import * as Promise from 'bluebird';
import * as FastGlob from 'fast-glob';
import path = require('upath2');
import * as fs from 'fs-extra';
import novelInfo, { mdconf_parse, IMdconfMeta, stringify, mdconf } from 'node-novel-info';
import { array_unique } from 'array-hyper-unique';
import * as sortObjectKeys from 'sort-object-keys2';
import { get_ids, md_href } from './index';
import * as novelGlobby from 'node-novel-globby/g';
import { sortTree } from 'node-novel-globby/lib/glob-sort';
import { normalize_strip } from '@node-novel/normalize';

/*
processTocContents('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user/豚公爵に転生したから、今度は君に好きと言いたい', './test/temp/123.txt')
	.tap(function (ls)
	{
		console.log(ls);
	})
;
*/

export function processTocContents(basePath: string, outputFile?: string)
{
	return getList(basePath)
		.then(function (ls)
		{
			return sortTree(ls)
		})
		.then(function (ls)
		{
			if (!ls.length)
			{
				return '';
			}

			let lastTop: string;
			let lastTop2: string;

			return ls.reduce(function (a, b)
			{
				let c = b.split('/');

				let nowTop = c[0];

				if (nowTop != lastTop)
				{
					let md = makeLink(nowTop, c[0], true);

					a.push(`\n\n## ${md}\n`);

					lastTop2 = undefined
				}

				let nowFile: string;

				if (c.length > 2)
				{
					let nowTop2 = c[1];

					if (nowTop2 != lastTop2)
					{
						let md = makeLink(nowTop2, c.slice(0, 2).join('/'), true);

						a.push(`\n### ${md}\n`);
					}

					lastTop2 = nowTop2;

					nowFile = c[2];
				}
				else
				{
					nowFile = c[1];
				}

				let md = makeLink(nowFile, b);

				a.push(`- ${md}`);

				lastTop = nowTop;

				return a;
			}, [
				`# CONTENTS\n`,
				path.basename(basePath),
			]).join("\n")
		})
		.tap(function (ls)
		{
			if (ls && outputFile)
			{
				return fs.outputFile(outputFile, ls);
			}
		})
	;
}

export function makeLink(title: string, link: string, isDir?: boolean)
{
	let t = normalize_strip(title, isDir);

	if (!isDir)
	{
		t = path.basename(t, '.txt');
	}

	t = md_link_escape(t);

	return `[${t}](${md_href(link)})`
}

export function md_link_escape(text: string)
{
	return text.replace(/[\[\]]/g, function (s)
	{
		return '\\' + s;
	})
}

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
