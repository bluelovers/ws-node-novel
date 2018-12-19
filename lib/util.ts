/**
 * Created by user on 2018/11/14/014.
 */

import { _trim, createSortCallback, defaultSortCallback, EnumToLowerCase } from '@node-novel/sort';
import { array_unique } from 'array-hyper-unique';
import * as FastGlob from 'fast-glob';
import * as fs from 'fs-iconv';
import { IMdconfMeta, mdconf_parse } from 'node-novel-info';
import BluebirdPromise = require('bluebird');
import StrUtil = require('str-util');

export async function loadReadmeMeta<T extends IMdconfMeta = IMdconfMeta>(file: string): Promise<T>
{
	return fs.readFile(file)
		.then(function (data)
		{
			return mdconf_parse(data, {
				// 當沒有包含必要的內容時不產生錯誤
				throw: false,
				// 允許不標準的 info 內容
				lowCheckLevel: true,
			});
		})
		.catch(function ()
		{
			return null;
		})
	;
}

export function loadReadmeMetaSync<T extends IMdconfMeta = IMdconfMeta>(file: string): T
{
	try
	{
		let data = fs.readFileSync(file);

		// @ts-ignore
		return mdconf_parse(data, {
			// 當沒有包含必要的內容時不產生錯誤
			throw: false,
			// 允許不標準的 info 內容
			lowCheckLevel: true,
		})
	}
	catch (e)
	{

	}

	return null;
}

export function getNovelTitles<T extends IMdconfMeta = IMdconfMeta>(meta: T): string[]
{
	if (meta && meta.novel)
	{
		let arr = [
				'title',
				'title_source',
				'title_zh',
				'title_tw',
				'title_cn',
			].concat(Object.keys(meta.novel))
			.reduce(function (a, key: string)
			{
				if (key.indexOf('title') === 0)
				{
					a.push(meta.novel[key])
				}

				return a
			}, [])
		;

		arr = array_unique(arr.filter(v => v));

		return arr;
	}

	return [];
}

export function globFirst(...argv: Parameters<typeof FastGlob["stream"]>): BluebirdPromise<string>
{
	return new BluebirdPromise<string>(function (resolve, reject)
	{
		let fgs = FastGlob.stream(...argv);

		fgs.on('data', (entry) => {
			resolve(entry);

			// @ts-ignore
			fgs.destroy();
		});
		fgs.once('error', reject);
		fgs.once('end', () => resolve(undefined));
	})
}

export function md_href(href: string)
{
	return href.split('/').map(encodeURIComponent).join('/');
}

export function md_anchor_gitee(title: string)
{
	let anchor = title
		.toLowerCase()
		.replace(/[\.．\/／　＠@（）\(\)～~]/g, '')
		.replace(/[ ]/g, '-')
	;

	return md_href(anchor);
}

export function md_link_escape(text: string)
{
	return text.replace(/[\[\]]/g, function (s)
	{
		return '\\' + s;
	})
}

export const tocSortCallback = createSortCallback({
	dotNum: true,
	transpileBase(input: string, isSub?: any)
	{
		let s = StrUtil.toHalfWidth(input);
		return s
	},
	toLowerCase: EnumToLowerCase.toLocaleLowerCase,
});
