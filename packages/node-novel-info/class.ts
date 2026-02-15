/**
 * Created by user on 2019/1/21/021.
 * 
 * 小說資訊處理類別
 * Novel Information Processing Class
 * 
 * 提供小說元資料的封裝與便捷存取方法。
 * Provides encapsulation and convenient access methods for novel metadata.
 */
import { parse, stringify } from './index';
import bind from 'lodash-decorators/bind';
import { filterByPrefixReturnValues } from './lib';
import { EnumNovelStatus } from './lib/const';
import cloneDeep from 'lodash/cloneDeep';
import { getNovelTitleFromMeta, chkInfo } from './lib/util';
import { cb_title_filter, arr_filter } from './lib/index';
import { IOptionsParse, IMdconfMeta, IMdconfMetaOptionsNovelSite } from './lib/types';

/**
 * NodeNovelInfo 選項類型
 * NodeNovelInfo options type
 */
export type INodeNovelInfoOptions = IOptionsParse & {};

/**
 * 預設選項
 * Default options
 */
const defaultOptions: Readonly<INodeNovelInfoOptions> = Object.freeze({});

/**
 * 小說資訊類別
 * Novel Information Class
 * 
 * 封裝小說元資料，提供便捷的存取方法。
 * Encapsulates novel metadata and provides convenient access methods.
 * 
 * @template T - 元資料類型 / Metadata type
 */
export class NodeNovelInfo<T extends IMdconfMeta>
{
	/**
	 * 原始元資料
	 * Raw metadata
	 */
	raw: T;

	/**
	 * 主路徑名稱
	 * Main path name
	 */
	pathMain?: string;
	
	/**
	 * 小說 ID
	 * Novel ID
	 */
	novelID?: string;

	/**
	 * 建構子
	 * Constructor
	 * 
	 * @param {T} mdconf - 元資料 / Metadata
	 * @param {INodeNovelInfoOptions} [options] - 選項 / Options
	 * @param {...any} argv - 額外參數 / Additional arguments
	 */
	constructor(mdconf: T, options: INodeNovelInfoOptions = defaultOptions, ...argv)
	{
		options = NodeNovelInfo.fixOptions(options);

		let ret: T = cloneDeep(mdconf);

		// 檢查元資料 / Check metadata
		if (options.chk || options.chk == null)
		{
			ret = chkInfo(ret, options) as T;
		}

		// 若需要拋出錯誤 / If need to throw error
		if (options.throw || options.throw == null)
		{
			ret = chkInfo(ret, options) as T;

			if (!ret)
			{
				throw new Error('not a valid NovelInfo data');
			}
		}

		this.raw = ret;
	}

	/**
	 * 修正選項
	 * Fix Options
	 * 
	 * @param {INodeNovelInfoOptions} [options] - 選項 / Options
	 * @returns {INodeNovelInfoOptions} 修正後的選項 / Fixed options
	 */
	@bind
	static fixOptions(options?: INodeNovelInfoOptions)
	{
		return Object.assign({}, defaultOptions, options || {})
	}

	/**
	 * 建立實例
	 * Create Instance
	 * 
	 * @template T - 元資料類型 / Metadata type
	 * @param {T} mdconf - 元資料 / Metadata
	 * @param {INodeNovelInfoOptions} [options] - 選項 / Options
	 * @param {...any} argv - 額外參數 / Additional arguments
	 * @returns {NodeNovelInfo<T>} 實例 / Instance
	 */
	@bind
	static create<T extends IMdconfMeta>(mdconf: T, options: INodeNovelInfoOptions = defaultOptions, ...argv)
	{
		return new this(mdconf, options, ...argv)
	}

	/**
	 * 從字串建立實例
	 * Create Instance from String
	 * 
	 * @param {string | Buffer} input - 輸入內容 / Input content
	 * @param {INodeNovelInfoOptions} [options] - 選項 / Options
	 * @param {...any} argv - 額外參數 / Additional arguments
	 * @returns {NodeNovelInfo<any>} 實例 / Instance
	 */
	@bind
	static createFromString(input: string | Buffer, options?: INodeNovelInfoOptions, ...argv)
	{
		if (typeof input != 'string')
		{
			input = input.toString();
		}

		options = this.fixOptions(options);

		let json = parse(input, options);

		return this.create(json, options, ...argv);
	}

	/**
	 * 解析 pathMain 基礎名稱
	 * Parse pathMain base name
	 * 
	 * @protected
	 * @returns {Object} 解析結果 / Parse result
	 */
	protected _pathMain_base()
	{
		let is_out: boolean = null;
		let pathMain_base: string = undefined;

		if (this.pathMain != null)
		{
			let _m = this.pathMain.match(/^(.+?)(_out)?$/);

			is_out = !!_m[2];
			pathMain_base = _m[1];
		}

		return {
			is_out,
			pathMain_base,
		}
	}

	/**
	 * 是否為 _out 目錄
	 * Whether it's an _out directory
	 */
	get is_out()
	{
		return this._pathMain_base().is_out;
	}

	/**
	 * pathMain 基礎名稱
	 * pathMain base name
	 */
	get pathMain_base()
	{
		return this._pathMain_base().pathMain_base;
	}

	/**
	 * 取得小說標題
	 * Get Novel Title
	 * 
	 * @param {...string[]} titles - 額外標題 / Additional titles
	 * @returns {string} 小說標題 / Novel title
	 */
	title(...titles: string[]): string
	{
		let novel = this.raw.novel;

		// 標題優先順序列表 / Title priority list
		let arr = [
			novel.title_output,
			novel.title_zh,
			novel.title_short,
			novel.title_tw,

			...titles,
			novel.title,

			novel.title_source,

			novel.title_jp,
			// @ts-ignore
			novel.title_ja,
			novel.title_cn,
		];

		for (let v of arr)
		{
			if (cb_title_filter(v))
			{
				return v;
			}
		}

		return this.titles()[0]
	}

	/**
	 * 取得所有小說標題
	 * Get All Novel Titles
	 * 
	 * @returns {string[]} 標題列表 / Title list
	 */
	titles(): string[]
	{
		return getNovelTitleFromMeta(this.raw)
			.filter(cb_title_filter)
	}

	/**
	 * 取得系列名稱
	 * Get Series Names
	 * 
	 * @returns {string[]} 系列名稱列表 / Series name list
	 */
	series_titles(): string[]
	{
		return arr_filter([
			this.raw.novel?.series?.name,
			this.raw.novel?.series?.name_short,
		].concat([]))
			.filter(cb_title_filter)
	}

	/**
	 * 取得作者列表
	 * Get Authors List
	 * 
	 * @returns {string[]} 作者列表 / Authors list
	 */
	authors(): string[]
	{
		return arr_filter([
			this.raw.novel?.author,
		].concat(this.raw.novel.authors || []))
	}

	/**
	 * 取得繪師列表
	 * Get Illustrators List
	 * 
	 * @returns {string[]} 繪師列表 / Illustrators list
	 */
	illusts(): string[]
	{
		let novel = this.raw.novel;

		// 收集所有繪師相關欄位 / Collect all illustrator-related fields
		let arr = arr_filter([
				'illust',
				'illusts',
			]
			.concat(Object.keys(novel))
			.reduce(function (a, key: string)
			{
				if (key.indexOf('illust') === 0)
				{
					a.push(key)
				}

				return a
			}, [] as string[]))
			.reduce(function (a: string[], key: string)
			{
				let v = novel[key];

				if (Array.isArray(v))
				{
					a.push(...v)
				}
				else
				{
					a.push(v)
				}

				return a
			}, []) as string[]
		;

		return arr_filter(arr).filter(cb_title_filter)
	}

	/**
	 * 取得標籤列表
	 * Get Tags List
	 * 
	 * @returns {string[]} 標籤列表 / Tags list
	 */
	tags(): string[]
	{
		return arr_filter(this.raw.novel?.tags || [])
	}

	/**
	 * 取得貢獻者/翻譯者列表
	 * Get Contributors/Translators List
	 * 
	 * @returns {string[]} 貢獻者列表 / Contributors list
	 */
	contributes(): string[]
	{
		return arr_filter(this.raw.contribute || [])
	}

	/**
	 * 取得發布網站名稱或者出版社名稱列表
	 * Get Publishers List
	 * 
	 * @returns {string[]} 發布者列表 / Publishers list
	 */
	publishers(): string[]
	{
		return arr_filter([
			this.raw.novel?.publisher,
		].concat(this.raw.novel.publishers || []))
	}

	/**
	 * 取得發布或者來源網址
	 * Get Source URLs
	 * 
	 * @returns {string[]} 來源網址列表 / Source URLs list
	 */
	sources()
	{
		return arr_filter(filterByPrefixReturnValues<string>(/^source(?:_.+)?$/, this.raw.novel)
			.concat(this.raw.novel.sources || []))
	}

	/**
	 * 小說來源的網站資料
	 * Novel Source Site Data
	 * 
	 * 請查閱 novel-downloader
	 * Please refer to novel-downloader
	 * 
	 * @returns {Array<{site: string, data: IMdconfMetaOptionsNovelSite}>} 網站資料列表 / Site data list
	 */
	sites()
	{
		return arr_filter(Object.entries(this.raw.options || {})
			.reduce(function (ls, [site, data])
			{
				if (data && ('novel_id' in data))
				{
					ls.push({
						site,
						data,
					})
				}

				return ls;
			}, [] as {
				site: string,
				data: IMdconfMetaOptionsNovelSite,
			}[]));
	}

	/**
	 * 取得小說狀態
	 * Get Novel Status
	 * 
	 * @returns {EnumNovelStatus | number} 小說狀態 / Novel status
	 */
	status(): EnumNovelStatus | number
	{
		return this.raw.novel?.novel_status
	}

	/**
	 * 轉換為 JSON
	 * Convert to JSON
	 * 
	 * @template R - 回傳類型 / Return type
	 * @param {boolean} [clone] - 是否複製 / Whether to clone
	 * @returns {R} JSON 物件 / JSON object
	 */
	toJSON<R>(clone?: boolean): R
	toJSON(clone?: boolean): T
	toJSON(clone?: boolean): T
	{
		if (clone)
		{
			return cloneDeep(this.raw);
		}

		// @ts-ignore
		return this.raw;
	}

	/**
	 * 轉換為 Markdown 字串
	 * Convert to Markdown String
	 * 
	 * @returns {string} Markdown 字串 / Markdown string
	 */
	stringify()
	{
		return stringify(this.raw)
	}

	static parse = parse;
	static stringify = stringify;
}

export default NodeNovelInfo
