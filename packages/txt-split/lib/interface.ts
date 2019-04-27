/**
 * Created by user on 2018/11/11/011.
 */

import { PathLike } from 'fs';
import { Runtime } from 'inspector';
import { URL } from "url";
import { execall } from 'execall2';
import { isRegExp, zhRegExp } from 'regexp-cjk';

export type IPathLike = string
export type IContext = string | Buffer

export type IRegExpLike = typeof RegExp |
	typeof zhRegExp |
	{
		new(...argv): RegExp
	} |
	{
		new(...argv): zhRegExp
	}
	;

export type Diff<T extends string, U extends string> =
	({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];
// @ts-ignore
export type Omit<T, K extends keyof T> = Pick<T, Diff<keyof T, K>>;
// @ts-ignore
export type Overwrite<T, U> = Omit<T, Diff<keyof T, Diff<keyof T, keyof U>>> & U;

export interface IOptionsRequired<P = boolean | IRegExpLike> extends IOptions<P>
{
	chapter: ISplitOption,
}

export type IOptionsRequiredUser = Overwrite<IOptionsRequired, IOptionsRequiredLazyInput> | IOptionsRequired

export interface IOptionsRequiredLazyInput
{
	volume?: ISplitOptionVolume<string | RegExp | string[]>,
	chapter: ISplitOption<string | RegExp | string[]>,

	useRegExpCJK?: boolean | IRegExpLike,
}

export interface IOptions<P = boolean | IRegExpLike>
{
	file?: IPathLike,
	outDir?: string,

	volume?: ISplitOptionVolume,
	chapter?: ISplitOption,

	dirname?: string,
	//ix?: number,

	/**
	 * 檔名序列的長度 不足此長度時 會自動補 0
	 */
	indexPadLength?: number;

	/**
	 * 使用 zhRegExp 來自動處理異體字
	 *
	 * @default true
	 */
	useRegExpCJK?: P,

	/**
	 * 自動檢測並且將內容轉換為 UTF-8
	 */
	autoFsIconv?: boolean,

	beforeStart?<O extends IOptions>(options: O): void,

	/**
	 * 允許在讀取檔案後 先對檔案內容做處理變更
	 */
	readFileAfter?(txt: string): string | void,

	saveFileBefore?(txt: string, cn: string, data_vn: IDataChapter, cache: ISaveFileBeforeCache): string | null,

	[key: string]: any,
}

export interface ISaveFileBeforeCache
{
	file: string,
	full_file: string,
	data: IDataVolume,
	options: IOptions,
	cn: string,
	vn: string,
}

export type ISplitOptionVolume<T extends RegExp | string | string[] = RegExp> = ISplitOption<T> & {

	/**
	 * 禁用此規則
	 */
	disable?: boolean,

	/**
	 * 允許找不到配對
	 */
	allowNoMatch?: boolean,

}

export interface ISplitOption<T extends RegExp | string | string[] = RegExp>
{
	/**
	 * 配對章節的 RegExp
	 */
	r: T,

	flags?: string,

	/**
	 * 處理本次配對切割的 callback
	 */
	cb?: ISplitCB,

	/**
	 * 檢查 配對後的內容 如果符合 則忽略
	 * 適用於某些狀況下無法將特定內容排除 導致被錯誤切割
	 * 例如 黑之魔王 的整合
	 */
	ignoreRe?: T,
	ignoreFlags?: string,
	ignoreCb?: ISplitIgnoreCB,

	idxSkipIgnored?: boolean,
}

export interface ISplitCache extends IOptions
{
	/**
	 * 於所有章節中的序列
	 * 請勿修改此值
	 */
	readonly ix: number,
	/**
	 * txt 內容
	 * 請勿修改此值
	 */
	readonly txt: string,

	/**
	 * 目前於所有章節中已配對成功的章節數量
	 * 請勿修改此值
	 */
	readonly ic_all: number,
}

export type ISplitMatch = ReturnType<typeof execall>
export type ISplitMatchItem = ISplitMatch[0]

export interface ISplitCBParameters extends ISplitCBReturn
{
	/**
	 * 於 match 列表中的 index 序列
	 */
	i: string,
	/**
	 * 本階段的 match 值
	 */
	m: ISplitMatchItem,
	/**
	 * 上一次的 match 值
	 *
	 * 但是 實際上 這參數 才是本次 callback 真正的 match 內容
	 */
	m_last: ISplitMatchItem,
	/**
	 * 目前已經分割的檔案列表與內容
	 */
	_files: IDataChapter,
	/**
	 * 於所有章節中的序列
	 *
	 * @readonly
	 */
	ii: string,
	cache: Partial<ISplitCache>,

	/**
	 * 目前已配對成功的章節數量
	 */
	ic: number,

	/**
	 * 於所有章節中的序列
	 * 請勿修改此值
	 */
	readonly ix: number,

	/**
	 * 目前於所有章節中已配對成功的章節數量
	 * 請勿修改此值
	 */
	readonly ic_all: number,
}

export interface ISplitCBReturn
{
	/**
	 * 檔案序列(儲存檔案時會做為前置詞)
	 */
	id: string,
	/**
	 * 標題名稱 預設情況下等於 match 到的標題
	 */
	name: string,
	/**
	 * 本次 match 的 內文 start index
	 * 可通過修改數值來控制內文範圍
	 *
	 * @example
	 * idx += m_last.match.length; // 內文忽略本次 match 到的標題
	 */
	idx: number,
}

export interface ISplitCB extends Function
{
	(argv: ISplitCBParameters): ISplitCBReturn;
}

export interface ISplitIgnoreCB extends Function
{
	(argv: ISplitCBParameters): boolean;
}

export interface IOptionsWithData<T extends IContext = string> extends IOptions
{
	data: IDataVolume<T>,
	options?: IOptionsWithData | IOptions,
}

export interface IDataVolume<T extends IContext = string>
{
	'00000_unknow'?: IDataChapter<T>,

	[dirname: string]: IDataChapter<T>,
}

export interface IDataChapter<T extends IContext = string>
{
	[chapter: string]: T
}

export type Resolvable<R> = R | PromiseLike<R>;

