/**
 * 文字標籤解析器類型定義
 * Text Tag Parser Type Definitions
 *
 * 此模組定義了解析器所需的各種類型和介面。
 * This module defines various types and interfaces required by the parser.
 *
 * @module parse-txt-tag/lib/types
 * @author user
 * @created 2020/1/5
 */

import { IAllowedHtmlTagList } from './tags';

/**
 * 附件映射介面
 * Attachment Map Interface
 *
 * 儲存解析過程中提取的附件資訊。
 * Stores attachment information extracted during parsing.
 *
 * @interface IAttachMap
 */
export interface IAttachMap
{
	/**
	 * 圖片映射
	 * Images map
	 *
	 * 鍵為圖片 ID，值為圖片路徑或 URL。
	 * Key is image ID, value is image path or URL.
	 */
	images?: Record<string, string>;
}

/**
 * 解析快取映射介面
 * Parse Cache Map Interface
 *
 * 用於儲存解析過程中的快取資料。
 * Used to store cache data during parsing.
 *
 * @interface IParseCacheMap
 * @extends Record<string, any>
 */
export interface IParseCacheMap extends Record<string, any>
{

}

/**
 * 標籤回調資料介面
 * Tag Callback Data Interface
 *
 * 傳遞給標籤處理回調函數的資料結構。
 * Data structure passed to tag processing callback functions.
 *
 * @interface IParseOnMapCallbackData
 * @template C - 快取映射類型 / Cache map type
 * @template A - 附件映射類型 / Attachment map type
 * @template T - 標籤名稱類型 / Tag name type
 */
export interface IParseOnMapCallbackData<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag>
{
	/**
	 * 標籤名稱
	 * Tag name
	 */
	tagName: T,

	/**
	 * 標籤屬性
	 * Tag attributes
	 */
	attr: string,

	/**
	 * 標籤內部內容
	 * Tag inner context
	 */
	innerContext: string,

	/**
	 * 快取物件
	 * Cache object
	 */
	cache: C,

	/**
	 * 附件物件
	 * Attachment object
	 */
	attach: A,
}

/**
 * 標籤處理回調函數類型
 * Tag Processing Callback Function Type
 *
 * 處理標籤並返回替換字串，返回 null 則使用預設處理。
 * Processes tag and returns replacement string, returns null for default processing.
 *
 * @template C - 快取映射類型 / Cache map type
 * @template A - 附件映射類型 / Attachment map type
 * @template T - 標籤名稱類型 / Tag name type
 */
export type IParseOnMapCallback<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag> = (data: IParseOnMapCallbackData<C, A, T>) => string | null;

/**
 * 標籤回調映射基礎類型
 * Tag Callback Map Base Type
 *
 * 定義各種標籤的回調函數。
 * Defines callback functions for various tags.
 *
 * @template C - 快取映射類型 / Cache map type
 * @template A - 附件映射類型 / Attachment map type
 * @template T - 標籤名稱類型 / Tag name type
 */
export type IParseOnMapBase<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag> = {
	[P in Exclude<T, IParseOn>]?: IParseOnMapCallback<C, A, P>;
} & {
	/** 刪除線標籤回調 / Strikethrough tag callback */
	s?: IParseOnMapCallback<C, A, 's'>;
	/** Ruby 標籤回調 / Ruby tag callback */
	ruby?: IParseOnMapCallback<C, A, 'ruby'>;
	/** 斜體標籤回調 / Italic tag callback */
	i?: IParseOnMapCallback<C, A, 'i'>;
	/** 粗體標籤回調 / Bold tag callback */
	b?: IParseOnMapCallback<C, A, 'b'>;
	/** 上標標籤回調 / Superscript tag callback */
	sup?: IParseOnMapCallback<C, A, 'sup'>;
	/** 下標標籤回調 / Subscript tag callback */
	sub?: IParseOnMapCallback<C, A, 'sub'>;
	/** 圖片標籤回調 / Image tag callback */
	img?: IParseOnMapCallback<C, A, 'img'>;
}

/**
 * 標籤回調映射類型
 * Tag Callback Map Type
 *
 * 包含預設回調的完整映射類型。
 * Complete map type including default callback.
 *
 * @template C - 快取映射類型 / Cache map type
 * @template A - 附件映射類型 / Attachment map type
 * @template T - 標籤名稱類型 / Tag name type
 */
export type IParseOnMap<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag> =
	IParseOnMapBase<C, A, Exclude<T, 'default'>>
	& {
	/** 預設回調函數 / Default callback function */
	default?: IParseOnMapCallback<C, A, Exclude<T, 'default'>>,
}

/**
 * 可處理的標籤名稱類型
 * Processable tag name type
 */
export type IParseOnTag = IAllowedHtmlTagList | 'img';

/**
 * 所有回調標籤類型（包含預設）
 * All callback tag types (including default)
 */
export type IParseOn = IParseOnTag | 'default';

/**
 * 解析選項介面
 * Parse Options Interface
 *
 * 配置解析器的行為。
 * Configures parser behavior.
 *
 * @interface IParseOptions
 * @template C - 快取映射類型 / Cache map type
 * @template A - 附件映射類型 / Attachment map type
 * @template T - 標籤名稱類型 / Tag name type
 */
export interface IParseOptions<C extends IParseCacheMap = IParseCacheMap, A extends IAttachMap = IAttachMap, T extends string = IParseOnTag>
{
	/**
	 * 標籤處理回調映射
	 * Tag processing callback map
	 */
	on?: IParseOnMap<C, A, T>,

	/**
	 * 快取物件
	 * Cache object
	 */
	cache?: C,

	/**
	 * 附件物件
	 * Attachment object
	 */
	attach?: A,
}
