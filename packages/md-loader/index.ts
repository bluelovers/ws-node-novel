/**
 * Created by user on 2019/2/1/001.
 */

import GrayMatter from 'gray-matter';
import { IOptionsParse, mdconf_parse, stringify as mdconf_stringify } from 'node-novel-info';

export interface IOptions<I extends IInput, OUT extends any, PO, GO>
{
	/**
	 * 傳給 gray-matter 的 options
	 * @see https://www.npmjs.com/package/gray-matter
	 */
	matterOptions?: GrayMatter.GrayMatterOption<I, GO>,

	/**
	 * 自訂 mdconf 的解析函數
	 * 預設狀況下為 node-novel-info
	 */
	parser?(input: I, parseOptions?: IParseOptions<PO>): IObject<OUT>,
	/**
	 * 傳給 parser 的 options
	 * 預設狀況下為 node-novel-info 的 IOptionsParse
	 */
	parseOptions?: IParseOptions<PO>,

	/**
	 * 用來將 mdconf 轉換回 md 的函數
	 * 預設狀況下為 node-novel-info
	 */
	stringify?(input): string,
}

export function parse<I extends IInput, D, OUT, PO, GO>(inputContent: I, options?: IOptions<I, OUT, PO, GO>)
{
	let { matterOptions, parseOptions, parser = mdconf_parse } = (options || {} as null);


	let _stringify = options.stringify || mdconf_stringify;

	if (inputContent == null || typeof stringify !== 'function' || typeof parser !== 'function')
	{
		let e = new TypeError(``);

		// @ts-ignore
		e.inputContent = inputContent;
		// @ts-ignore
		e._options = options;

		throw e
	}

	// @ts-ignore
	inputContent = fixContent(inputContent);

	let matter = GrayMatter(inputContent, matterOptions as any);
	// @ts-ignore
	let mdconf = parser(inputContent, parseOptions);

	if (!mdconf || mdconf && Object.keys(mdconf).length == 0)
	{
		mdconf = null;
	}

	return {
		/**
		 * 經由 gray-matter 解析後的物件
		 */
		matter,
		/**
		 * 排除 Front Matter 後的原始內容
		 */
		content: matter.content,
		/**
		 * Front Matter 資料
		 */
		data: matter.data as IObject<D>,
		/**
		 * 回傳的 mdconf 資料 預設為 node-novel-info
		 * 如果回傳的 為 {} 空物件則會被轉換為 null
		 */
		mdconf,
		/**
		 * 用來將取得的物件轉換回 md
		 * 當 content, mdconf 同時存在時 content > mdconf
		 */
		stringify<T1 = D, T2 = OUT>(inputData: IStringifyData<T1, T2>): string
		{
			return stringify<T1, T2>(inputData, {
				// @ts-ignore
				matterOptions,
				stringify: _stringify,
			})
		},
	}
}

/**
 * 用來將取得的物件轉換回 md
 * 當 content, mdconf 同時存在時 content > mdconf
 */
export function stringify<T1, T2>(inputData: IStringifyData<T1, T2>, options?: IObject<{
	matterOptions?: GrayMatter.GrayMatterOption<IInput, any>,
	stringify?(input): string,
}>)
{
	let { matterOptions, stringify = mdconf_stringify } = (options || {} as null);

	// @ts-ignore
	let content: string = inputData.content != null
		// @ts-ignore
		? inputData.content
		// @ts-ignore
		: inputData.mdconf ? stringify(inputData.mdconf) : null
	;

	return GrayMatter.stringify(
		fixContent(content),
		// @ts-ignore
		inputData.data,
		// @ts-ignore
		matterOptions,
	)
}

/**
 * 將 inputContent 轉為 string
 */
export function fixContent<I extends IInput>(inputContent: I): string
{
	if (inputContent != null)
	{
		// @ts-ignore
		inputContent = String(inputContent)
			.replace(/^[\r\n]+/, '')
		;

		// @ts-ignore
		return inputContent;
	}
}

/**
 * 最後處理時 都會被轉為 string
 */
export type IInput = Buffer | string;
export type IParseOptions<PO> = (IOptionsParse | object) | PO;

/**
 * 當 content, mdconf 同時存在時 content > mdconf
 */
export type IStringifyData<T extends any, OUT extends any> = IObject<{
	data?: IObject<T>,
} & ({ content: IInput; } | { mdconf: OUT, })>;

export type IObject<T extends any, B extends {
	[key: string]: any
} = {
	[key: string]: any
}> = B & T

export default exports as typeof import('./index');
