/**
 * Created by user on 2019/1/6/006.
 */

import todayMomentTimestamp, { baseSortObject, cacheSortCallback, freezeProperty, createMoment } from './lib/util';
import { IMdconfMeta } from 'node-novel-info';
import { EnumNovelStatus } from 'node-novel-info/lib/const';
import path = require('upath2');
import fs = require('fs-extra');
import { array_unique } from 'array-hyper-unique';
import sortObject = require('sort-object-keys2');

const openedMap = new WeakMap<Partial<INovelStatCacheOptions>, NovelStatCache>();

export { createMoment }

/**
 * 所有 timestamp 為 Unix timestamp in milliseconds 為 utc +8
 * pathMain 為 主資夾名稱
 * novelID 為 小說資料夾名稱
 */
export interface INovelStatCache
{

	meta?: {
		todayTimestamp?: number,
		timestamp?: number,
	},

	/**
	 * 小說緩存狀態
	 */
	novels: {
		[pathMain: string]: {
			[novelID: string]: INovelStatCacheNovel,
		},
	},

	/**
	 * 歷史紀錄
	 */
	history: {
		[timestamp: string]: INovelStatCacheHistory,
		[timestamp: number]: INovelStatCacheHistory,
	},

	/**
	 * 透過 node-novel-conf 解析過的 META 資料 (README.md)
	 */
	mdconf: {
		[pathMain: string]: {
			[novelID: string]: IMdconfMeta,
		},
	},
}

export interface INovelStatCacheNovel
{
	/**
	 * segment 更新時間
	 */
	segment_date?: number,
	/**
	 * epub 更新時間
	 */
	epub_date?: number,

	/**
	 * 初始化時間
	 */
	init_date?: number,

	/**
	 * 總章/卷數量
	 */
	volume?: number,
	/**
	 * 總話數
	 */
	chapter?: number,

	/**
	 * 上次的總章/卷數量
	 */
	volume_old?: number,
	/**
	 * 上次的總話數
	 */
	chapter_old?: number,

	/**
	 * segment 變動數量
	 */
	segment?: number,
	/**
	 * 上次的 segment 變動數量
	 */
	segment_old?: number,

	/**
	 * 小說狀態 flag 根據 readme.md 內設定
	 */
	novel_status?: EnumNovelStatus,

	/**
	 * 最後變動時間
	 */
	update_date?: number;
	/**
	 * 紀錄變動次數
	 */
	update_count?: number;

	/**
	 * epub filename
	 */
	epub_basename?: string,
	txt_basename?: string,
}

export interface INovelStatCacheHistory
{
	/**
	 * 本次記錄內的 epub 總數
	 */
	epub_count?: number,
	/**
	 * 本次記錄內的 epub
	 */
	epub?: Array<[string, string, INovelStatCacheNovel?]>,
	segment_count?: number,
	segment?: Array<[string, string, INovelStatCacheNovel?]>,
}

export interface INovelStatCacheOptions
{
	/**
	 * 讀寫緩存的目標 json 路徑
	 */
	file: string,
	/**
	 * 當 file 不存在時嘗試讀取此檔案
	 */
	file_git?: string,

	/**
	 * 禁止將資料寫回檔案
	 */
	readonly?: boolean,

	history_max?: number,
	history_keep?: number,

	/**
	 * options.readonly && options.data 必須同時啟用
	 */
	data?: INovelStatCache,
}

const defaultOptions: Readonly<Partial<INovelStatCacheOptions>> = Object.freeze({

	history_max: 14,
	history_keep: 7,

});

/**
 * @example NovelStatCache.create()
 */
export class NovelStatCache
{
	/**
	 * 讀寫緩存的目標 json 路徑
	 */
	file: string;
	/**
	 * 當 file 不存在時嘗試讀取此檔案
	 */
	file_git: string;

	data: INovelStatCache = null;
	options: INovelStatCacheOptions;

	inited: boolean = false;

	/**
	 * 使用 NovelStatCache.create() 代替
	 *
	 * @deprecated
	 */
	constructor(options: INovelStatCacheOptions)
	{
		options = NovelStatCache.fixOptions(options);

		let _chk: boolean = false;

		if (options.data)
		{
			if (!(options.data && options.data.history && options.data.novels && options.data.mdconf))
			{
				throw new TypeError(`options.data is not allow data`);
			}

			_chk = true;
		}

		if (!options.file && (!options.readonly || !_chk))
		{
			throw new RangeError(`options.file is required`);
		}
		else
		{
			delete options.data;
		}

		this._init(options);
	}

	protected _init(options: INovelStatCacheOptions)
	{
		if (options.data)
		{
			this.data = options.data;
		}

		delete options.data;

		this.options = options;

		this.file = this.options.file;
		this.file_git = this.options.file_git;

		freezeProperty(this, 'options', true);
		freezeProperty(this, 'file');
		freezeProperty(this, 'file_git');

		this.open();
	}

	/**
	 * 檢查 file 是否存在
	 */
	exists()
	{
		return this.file && fs.pathExistsSync(this.file)
	}

	protected open()
	{
		if (!this.inited)
		{
			this.inited = true;

			if (this.data)
			{
				//
			}
			else if (this.exists())
			{
				this.data = fs.readJSONSync(this.file);
			}
			else if (this.file_git && fs.pathExistsSync(this.file_git))
			{
				this.data = fs.readJSONSync(this.file_git);
			}

			// @ts-ignore
			this.data = this.data || {};

			this.data.history = this.data.history || {};
			this.data.novels = this.data.novels || {};
			this.data.mdconf = this.data.mdconf || {};
			this.data.meta = this.data.meta || {};

			freezeProperty(this, 'inited');
		}

		return this;
	}

	/**
	 * 取得所有在 data.novels / data.mdconf 內存在的 pathMain
	 */
	pathMainList()
	{
		return array_unique(Object.keys(this.data.novels)
			.concat(Object.keys(this.data.mdconf)))
			.sort()
		;
	}

	/**
	 * 取得指定 pathMain 的 novel 狀態集合
	 */
	pathMain(pathMain: string)
	{
		return this.data.novels[pathMain] = this.data.novels[pathMain] || {};
	}

	/**
	 * 取得指定 pathMain novelID 的 novel 狀態緩存
	 */
	novel(pathMain: string, novelID: string)
	{
		this.pathMain(pathMain);

		this.data.novels[pathMain][novelID] = this.data.novels[pathMain][novelID] || {};

		return this.data.novels[pathMain][novelID];
	}

	/**
	 * 取得指定 pathMain novelID 的 mdconf 資料
	 */
	mdconf_get(pathMain: string, novelID: string)
	{
		this.data.mdconf[pathMain] = this.data.mdconf[pathMain] || {};

		return this.data.mdconf[pathMain][novelID];
	}

	/**
	 * 設定指定 pathMain novelID 的 mdconf 資料
	 */
	mdconf_set(pathMain: string, novelID: string, meta: IMdconfMeta)
	{
		this.data.mdconf[pathMain] = this.data.mdconf[pathMain] || {};

		this.data.mdconf[pathMain][novelID] = meta;

		return this;
	}

	/**
	 * @deprecated
	 */
	_beforeSave(bool?: boolean | number)
	{
		let timestamp = this.timestamp;

		Object.entries(this.data.novels)
			.forEach(([pathMain, data], i) =>
			{
				Object.entries(this.data.novels[pathMain])
					.forEach(([novelID, data]) =>
					{
						let _a = [
								data.init_date,
								data.epub_date,
								data.segment_date,
								data.update_date,
							]
							.filter(v => v && v > 0)
						;

						if (!_a.length)
						{
							data.init_date = timestamp
						}
						else
						{
							data.init_date = _a
								.reduce((a, b) =>
								{
									return Math.min(a, b);
								})
								|| timestamp
							;
						}
					})
				;
			})
		;

		if (timestamp in this.data.history)
		{
			let _list = new Set<INovelStatCacheNovel>();

			let today = this.data.history[timestamp];

			if (today.epub)
			{
				array_unique(today.epub, {
					overwrite: true,
				});

				today.epub.sort(function (a, b)
				{
					return cacheSortCallback(a[0], b[0])
						|| cacheSortCallback(a[1], b[1])
				});

				today.epub_count = today.epub.length | 0;

				if (!today.epub_count)
				{
					delete today.epub;
					delete today.epub_count;
				}
				else
				{
					today.epub.forEach((v, i) =>
					{
						let novel = this.novel(v[0], v[1]);

						_list.add(novel);

						today.epub[i][2] = novel;
					})
				}
			}

			if (today.segment)
			{
				array_unique(today.segment, {
					overwrite: true,
				});

				today.segment.sort(function (a, b)
				{
					return cacheSortCallback(a[0], b[0])
						|| cacheSortCallback(a[1], b[1])
				});

				today.segment_count = today.segment.length | 0;

				if (!today.segment_count)
				{
					delete today.segment;
					delete today.segment_count;
				}
				else
				{
					today.segment.forEach((v, i) =>
					{
						let novel = this.novel(v[0], v[1]);

						_list.add(novel);

						today.segment[i][2] = novel;
					})
				}
			}

			if (!Object.keys(today).length)
			{
				delete this.data.history[timestamp];
			}
			else if (bool > 1 || bool == EnumBeforeSave.OPTIMIZE_AND_UPDATE)
			{
				_list.forEach(function (data)
				{
					let _a = [
							data.init_date,
							data.epub_date,
							data.segment_date,
							data.update_date,
						]
						.filter(v => v && v > 0)
					;

					let old = data.update_date;

					if (!_a.length || true)
					{
						data.update_date = timestamp
					}
					else
					{
						data.update_date = _a
							.reduce((a, b) =>
							{
								return Math.max(a, b);
							})
							|| timestamp
						;
					}

					if (old !== data.update_date)
					{
						data.update_count = (data.update_count | 0) + 1;
					}
				});

				this.data.meta.timestamp = createMoment().valueOf();
			}

			this.data.meta.todayTimestamp = timestamp;
		}

		let ks = Object.keys(this.data.history);

		if (ks.length)
		{
			let h = this.data.history;

			ks.forEach(function (k)
			{
				if (!Object.keys(h[k]).length)
				{
					delete h[k];
				}
			});

			if (ks.length >= this.options.history_max)
			{
				ks.sort().slice(0, (0 - this.options.history_keep)).forEach(k => delete this.data.history[k])
			}
		}

		sortObject(this.data, {
			useSource: true,
			keys: [
				'meta',
				'history',
				'novels',
				'mdconf',
			] as (keyof INovelStatCache)[],
		});

		return this;
	}

	/**
	 * 將資料儲存至 file
	 *
	 * @param bool - 清理物件多餘資料
	 */
	public save(bool?: boolean | number | EnumBeforeSave)
	{
		if (this.options.readonly)
		{
			throw new Error(`options.readonly is set, can't not save file`)
		}

		fs.outputJSONSync(this.file, this.toJSON(bool || true), {
			spaces: 2,
		});

		return this;
	}

	/**
	 * 取得今天的 timestamp
	 */
	get timestamp()
	{
		return todayMomentTimestamp;
	}

	/**
	 * 取得指定 timestamp 的 history 資料
	 */
	history(timestamp: number | string)
	{
		if (timestamp in this.data.history)
		{
			return this.data.history[timestamp]
		}
	}

	/**
	 * 取得所有 history 資料
	 */
	historys()
	{
		return Object.entries(this.data.history)
	}

	/**
	 * 取得前一次的 history 資料
	 */
	historyPrev()
	{
		let timestamp = this.timestamp;

		let ks: string[];

		if (timestamp in this.data.history)
		{
			ks = Object.keys(this.data.history);
			ks.pop();
		}
		else
		{
			ks = Object.keys(this.data.history);
		}

		let k = ks.pop();

		if (k in this.data.history)
		{
			return this.data.history[k];
		}

		return null;
	}

	/**
	 * 取得今天的 history 資料
	 */
	historyToday()
	{
		let timestamp = this.timestamp;

		let data = this.data.history[timestamp] = this.data.history[timestamp] || {};

		data.epub_count = data.epub_count | 0;
		data.epub = data.epub || [];

		data.segment_count = data.segment_count | 0;
		data.segment = data.segment || [];

		return this.data.history[timestamp];
	}

	static fixOptions(options?: INovelStatCacheOptions, extraOptions?: Partial<INovelStatCacheOptions>)
	{
		options = {
			file_git: undefined,
			file: undefined,
			...(defaultOptions as INovelStatCacheOptions),
			...options,
			...extraOptions,
		};

		options.history_max = options.history_max > 0 ? options.history_max : defaultOptions.history_max;

		options.history_keep = options.history_keep > 0 ? options.history_keep : defaultOptions.history_keep;

		options = baseSortObject(options);

		return options;
	}

	/**
	 * 建立 NovelStatCache 物件
	 */
	static create(options?: INovelStatCacheOptions)
	{
		options = this.fixOptions(options);

		if (openedMap.has(options))
		{
			return openedMap.get(options);
		}

		let obj = new this(options);

		openedMap.set(options, obj);

		return obj;
	}

	/**
	 * 允許用其他方式取得 data 來建立物件
	 */
	static createFromJSON(data: INovelStatCache | Buffer, options?: Partial<INovelStatCacheOptions>)
	{
		if (Buffer.isBuffer(data))
		{
			data = JSON.parse(data.toString()) as INovelStatCache;
		}

		options = this.fixOptions(options as INovelStatCacheOptions, {
			readonly: (!options || options.readonly == null) ? true : options.readonly,
			data,
		});

		return this.create(options as INovelStatCacheOptions);
	}

	/**
	 * @param bool - 清理物件多餘資料
	 */
	toJSON(bool?: boolean | number | EnumBeforeSave)
	{
		if (bool)
		{
			this._beforeSave(bool)
		}
		return this.data;
	}

}

export enum EnumBeforeSave
{
	NONE = 0,
	OPTIMIZE = 1,
	OPTIMIZE_AND_UPDATE = 2,
}

NovelStatCache.fixOptions = NovelStatCache.fixOptions.bind(NovelStatCache);
NovelStatCache.create = NovelStatCache.create.bind(NovelStatCache);
NovelStatCache.createFromJSON = NovelStatCache.createFromJSON.bind(NovelStatCache);

const { create, fixOptions, createFromJSON } = NovelStatCache;
export { create, fixOptions, createFromJSON }

export default NovelStatCache.create
exports = Object.freeze(exports);
