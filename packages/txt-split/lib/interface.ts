/**
 * 文字分割類型定義
 * Text Split Type Definitions
 *
 * 此模組定義了文字分割功能所需的各種類型和介面。
 * This module defines various types and interfaces required for text splitting functionality.
 *
 * @module txt-split/lib/interface
 * @author user
 * @created 2018/11/11
 */

import { PathLike } from 'fs';
import { Runtime } from 'inspector';
import { URL } from "url";
import { execall } from 'execall2';
import { zhRegExp } from 'regexp-cjk';

/**
 * 路徑類型
 * Path type
 */
export type IPathLike = string

/**
 * 內容類型
 * Context type
 */
export type IContext = string | Buffer

/**
 * 正則表達式類型
 * Regular expression type
 *
 * 支援原生 RegExp 或 zhRegExp。
 * Supports native RegExp or zhRegExp.
 */
export type IRegExpLike = typeof RegExp |
	typeof zhRegExp |
	{
		new(...argv): RegExp
	} |
	{
		new(...argv): zhRegExp
	}
	;

/**
 * 差集類型
 * Difference type
 *
 * 計算兩個字串聯合類型的差集。
 * Calculates the difference of two string union types.
 */
export type Diff<T extends string, U extends string> =
	({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];

/**
 * 省略類型
 * Omit type
 *
 * 從類型 T 中省略屬性 K。
 * Omits properties K from type T.
 */
// @ts-ignore
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;

/**
 * 覆寫類型
 * Overwrite type
 *
 * 使用類型 U 覆寫類型 T 的屬性。
 * Overwrites properties of type T with type U.
 */
// @ts-ignore
export type Overwrite<T, U> = Omit<T, Diff<keyof T, Diff<keyof T, keyof U>>> & U;

/**
 * 必要選項介面
 * Required options interface
 *
 * 必須包含章節分割選項。
 * Must include chapter split options.
 *
 * @interface IOptionsRequired
 * @template P - 正則類型參數 / Regex type parameter
 */
export interface IOptionsRequired<P = boolean | IRegExpLike> extends IOptions<P>
{
	/** 章節分割選項 / Chapter split options */
	chapter: ISplitOption,
}

/**
 * 使用者提供的必要選項類型
 * User-provided required options type
 */
export type IOptionsRequiredUser = Overwrite<IOptionsRequired, IOptionsRequiredLazyInput> | IOptionsRequired

/**
 * 延遲輸入的必要選項介面
 * Lazy input required options interface
 */
export interface IOptionsRequiredLazyInput
{
	/** 卷分割選項 / Volume split options */
	volume?: ISplitOptionVolume<string | RegExp | string[]>,
	/** 章節分割選項 / Chapter split options */
	chapter: ISplitOption<string | RegExp | string[]>,

	/** 是否使用中日文正則 / Whether to use CJK regex */
	useRegExpCJK?: boolean | IRegExpLike,
}

/**
 * 分割選項介面
 * Split options interface
 *
 * @interface IOptions
 * @template P - 正則類型參數 / Regex type parameter
 */
export interface IOptions<P = boolean | IRegExpLike>
{
	/** 輸入檔案路徑 / Input file path */
	file?: IPathLike,
	/** 輸出目錄 / Output directory */
	outDir?: string,

	/** 卷分割選項 / Volume split options */
	volume?: ISplitOptionVolume,
	/** 章節分割選項 / Chapter split options */
	chapter?: ISplitOption,

	/** 檔案所在目錄 / Directory containing the file */
	dirname?: string,
	//ix?: number,

	/**
	 * 檔名序列的長度 不足此長度時 會自動補 0
	 * Filename sequence length, will be padded with 0 if insufficient
	 */
	indexPadLength?: number;

	/**
	 * 使用 zhRegExp 來自動處理異體字
	 * Use zhRegExp to automatically handle variant characters
	 *
	 * @default true
	 */
	useRegExpCJK?: P,

	/**
	 * 自動檢測並且將內容轉換為 UTF-8
	 * Automatically detect and convert content to UTF-8
	 */
	autoFsIconv?: boolean,

	/**
	 * 開始前的回調
	 * Callback before start
	 */
	beforeStart?<O extends IOptions>(options: O): void,

	/**
	 * 允許在讀取檔案後 先對檔案內容做處理變更
	 * Allow processing file content after reading
	 */
	readFileAfter?(txt: string): string | void,

	/**
	 * 儲存檔案前的回調
	 * Callback before saving file
	 */
	saveFileBefore?(txt: string, cn: string, data_vn: IDataChapter, cache: ISaveFileBeforeCache): string | null,

	/** 其他屬性 / Other properties */
	[key: string]: any,
}

/**
 * 儲存檔案前回調的快取介面
 * Save file before callback cache interface
 */
export interface ISaveFileBeforeCache
{
	/** 相對檔案路徑 / Relative file path */
	file: string,
	/** 完整檔案路徑 / Full file path */
	full_file: string,
	/** 分割後的資料 / Split data */
	data: IDataVolume,
	/** 選項 / Options */
	options: IOptions,
	/** 章節名稱 / Chapter name */
	cn: string,
	/** 卷名稱 / Volume name */
	vn: string,
}

/**
 * 卷分割選項類型
 * Volume split option type
 *
 * @template T - 正則或字串類型 / Regex or string type
 */
export type ISplitOptionVolume<T extends RegExp | string | string[] = RegExp> = ISplitOption<T> & {

	/**
	 * 禁用此規則
	 * Disable this rule
	 */
	disable?: boolean,

	/**
	 * 允許找不到配對
	 * Allow no match found
	 */
	allowNoMatch?: boolean,

}

/**
 * 分割選項介面
 * Split option interface
 *
 * @interface ISplitOption
 * @template T - 正則或字串類型 / Regex or string type
 */
export interface ISplitOption<T extends RegExp | string | string[] = RegExp>
{
	/**
	 * 配對章節的 RegExp
	 * RegExp for matching chapters
	 */
	r: T,

	/** 正則表達式旗標 / Regular expression flags */
	flags?: string,

	/**
	 * 處理本次配對切割的 callback
	 * Callback for handling this match split
	 */
	cb?: ISplitCB,

	/**
	 * 檢查 配對後的內容 如果符合 則忽略
	 * Check matched content and ignore if matches
	 *
	 * 適用於某些狀況下無法將特定內容排除 導致被錯誤切割
	 * Useful when certain content cannot be excluded and causes incorrect splitting
	 */
	ignoreRe?: T,
	/** 忽略正則旗標 / Ignore regex flags */
	ignoreFlags?: string,
	/** 忽略回調 / Ignore callback */
	ignoreCb?: ISplitIgnoreCB,

	/** 是否跳過已忽略的索引 / Whether to skip ignored indices */
	idxSkipIgnored?: boolean,
}

/**
 * 分割快取介面
 * Split cache interface
 *
 * @interface ISplitCache
 * @extends IOptions
 */
export interface ISplitCache extends IOptions
{
	/**
	 * 於所有章節中的序列
	 * Index in all chapters
	 *
	 * 請勿修改此值 / Do not modify this value
	 */
	readonly ix: number,
	/**
	 * txt 內容
	 * txt content
	 *
	 * 請勿修改此值 / Do not modify this value
	 */
	readonly txt: string,

	/**
	 * 目前於所有章節中已配對成功的章節數量
	 * Number of successfully matched chapters so far
	 *
	 * 請勿修改此值 / Do not modify this value
	 */
	readonly ic_all: number,
}

/**
 * 分割匹配結果類型
 * Split match result type
 */
export type ISplitMatch = ReturnType<typeof execall>

/**
 * 分割匹配項目類型
 * Split match item type
 */
export type ISplitMatchItem = ISplitMatch[0]

/**
 * 分割回調參數介面
 * Split callback parameters interface
 *
 * @interface ISplitCBParameters
 * @extends ISplitCBReturn
 */
export interface ISplitCBParameters extends ISplitCBReturn
{
	/**
	 * 於 match 列表中的 index 序列
	 * Index in match list
	 */
	i: string,
	/**
	 * 本階段的 match 值
	 * Current match value
	 */
	m: ISplitMatchItem,
	/**
	 * 上一次的 match 值
	 * Previous match value
	 *
	 * 但是 實際上 這參數 才是本次 callback 真正的 match 內容
	 * However, this parameter is actually the real match content for this callback
	 */
	m_last: ISplitMatchItem,
	/**
	 * 目前已經分割的檔案列表與內容
	 * Currently split file list and content
	 */
	_files: IDataChapter,
	/**
	 * 於所有章節中的序列
	 * Index in all chapters
	 *
	 * @readonly
	 */
	ii: string,
	/** 快取物件 / Cache object */
	cache: Partial<ISplitCache>,

	/**
	 * 目前已配對成功的章節數量
	 * Number of successfully matched chapters so far
	 */
	ic: number,

	/**
	 * 於所有章節中的序列
	 * Index in all chapters
	 *
	 * 請勿修改此值 / Do not modify this value
	 */
	readonly ix: number,

	/**
	 * 目前於所有章節中已配對成功的章節數量
	 * Number of successfully matched chapters in all chapters so far
	 *
	 * 請勿修改此值 / Do not modify this value
	 */
	readonly ic_all: number,
}

/**
 * 分割回調返回介面
 * Split callback return interface
 */
export interface ISplitCBReturn
{
	/**
	 * 檔案序列(儲存檔案時會做為前置詞)
	 * File sequence (used as prefix when saving)
	 */
	id: string,
	/**
	 * 標題名稱 預設情況下等於 match 到的標題
	 * Title name, defaults to matched title
	 */
	name: string,
	/**
	 * 本次 match 的 內文 start index
	 * Start index of this match's content
	 *
	 * 可通過修改數值來控制內文範圍
	 * Can be modified to control content range
	 *
	 * @example
	 * idx += m_last.match.length; // 內文忽略本次 match 到的標題 / Content ignores this matched title
	 */
	idx: number,
}

/**
 * 分割回調函數介面
 * Split callback function interface
 */
export interface ISplitCB extends Function
{
	(argv: ISplitCBParameters): ISplitCBReturn;
}

/**
 * 分割忽略回調函數介面
 * Split ignore callback function interface
 */
export interface ISplitIgnoreCB extends Function
{
	(argv: ISplitCBParameters): boolean;
}

/**
 * 帶資料的選項介面
 * Options with data interface
 *
 * @interface IOptionsWithData
 * @template T - 內容類型 / Context type
 */
export interface IOptionsWithData<T extends IContext = string> extends IOptions
{
	/** 分割後的資料 / Split data */
	data: IDataVolume<T>,
	/** 選項 / Options */
	options?: IOptionsWithData | IOptions,
}

/**
 * 卷資料介面
 * Volume data interface
 *
 * @interface IDataVolume
 * @template T - 內容類型 / Context type
 */
export interface IDataVolume<T extends IContext = string>
{
	/** 未知內容 / Unknown content */
	'00000_unknow'?: IDataChapter<T>,

	/** 卷目錄名稱到章節資料的映射 / Volume directory name to chapter data mapping */
	[dirname: string]: IDataChapter<T>,
}

/**
 * 章節資料介面
 * Chapter data interface
 *
 * @interface IDataChapter
 * @template T - 內容類型 / Context type
 */
export interface IDataChapter<T extends IContext = string>
{
	/** 章節名稱到內容的映射 / Chapter name to content mapping */
	[chapter: string]: T
}

/**
 * 可解析類型
 * Resolvable type
 */
export type Resolvable<R> = R | PromiseLike<R>;

