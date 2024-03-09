/**
 * Created by user on 2019/6/18.
 */

import { gitDiffFrom, IGitDiffFromRow } from 'git-diff-from';
import { ITSPickExtra } from 'ts-type'
import { resolve } from 'upath2'
import { NovelDiffFromLogParser } from './class';

const baseHashDefault = 5;
const targetTreeDefault = 'origin/master';

/**
 * 比對目標路徑下的 git 歷史變化
 * 適用於任何符合 `主資料夾/副資料夾/子路徑` 這種結構的資料夾
 */
export function novelDiffFromLog(options: ITSPickExtra<IOptions, 'novelRoot'>): INovelDiffFromLog
{
	let { targetTree = targetTreeDefault, novelRoot = process.cwd(), baseHash = baseHashDefault } = options;

	novelRoot = resolve(novelRoot);

	let ls = gitDiffFrom(baseHash, targetTree, {
		cwd: novelRoot,
	});

	let ret: INovelDiffFromLog = {
		novelRoot,
		baseHash,
		targetTree,
		list: {},

		range: {
			from: ls.from,
			to: ls.to,
		},

		count: {
			main: 0,
			novel: 0,
			file: 0,
		},
	};

	if (ls.length)
	{
		ret.list = ls.reduce(function (a, value)
		{
			let s = value.path.split(/[\\\/]/);

			if (s.length > 2)
			{
				let pathMain = s[0];
				let novelID = s[1];

				let basename = s[s.length - 1];

				let subpath = s.slice(2).join('/');

				if (!a[pathMain])
				{
					ret.count.main++;
				}

				a[pathMain] = a[pathMain] || {};

				if (!a[pathMain][novelID])
				{
					ret.count.novel++;
				}

				if (a[pathMain][novelID] == null)
				{
					// @ts-ignore
					a[pathMain][novelID] ||= [];

					Object.defineProperties(a[pathMain][novelID], {
						pathMain: {
							enumerable: false,
							configurable: false,
							get()
							{
								return pathMain
							},
						},
						novelID: {
							enumerable: false,
							configurable: false,
							get()
							{
								return novelID
							},
						},
					});
				}

				a[pathMain][novelID].push(Object.assign(value, {
					pathMain,
					novelID,
					basename,
					subpath,
				}));

				ret.count.file++;
			}

			return a;
		}, {} as IListMain);
	}

	return ret;
}

export type IListFileRow = IGitDiffFromRow & {
	/**
	 * 主資料夾 ID
	 */
	pathMain: string,
	/**
	 * 資料夾 ID (小說名稱)
	 */
	novelID: string,
	basename: string,
	subpath: string,
}

export type IListNovelRow = IListFileRow[] & {
	/**
	 * 主資料夾 ID
	 */
	readonly pathMain: string,
	/**
	 * 資料夾 ID (小說名稱)
	 */
	readonly novelID: string,
}

export type IListMain = {
	[pathMain: string]: IListMainRow,
}

export type IListMainRow = {
	[novelID: string]: IListNovelRow
}

export interface IOptions
{
	/**
	 * 檢查路徑
	 * 目標根目錄
	 */
	novelRoot: string,
	/**
	 * 檢查起始點
	 * 檢查 hash 或者 可輸入數字 則自動搜尋 此數字以內的紀錄
	 */
	baseHash: number | string,
	/**
	 * 比對目標分支或者 commit id
	 */
	targetTree: string,
}

export interface INovelDiffFromLog extends IOptions
{
	/**
	 * 回傳列表
	 */
	list: IListMain;
	/**
	 * 實際比對範圍
	 */
	range: {
		/**
		 * 起始
		 */
		from: string;
		/**
		 * 終點
		 */
		to: string;
	};
	count: {
		/**
		 * 主資料夾數量
		 */
		main: number;
		/**
		 * 小說數量
		 */
		novel: number;
		/**
		 * 變化檔案總數
		 */
		file: number;
	};
}

export { NovelDiffFromLogParser }

export default novelDiffFromLog
