/**
 * Created by user on 2018/2/14/014.
 */

import { trim as strUtilTrim } from '@lazy-cjk/str-util-trim';
import { zh2num } from '@lazy-cjk/zh2num';
import { toHalfWidth } from '@lazy-cjk/fullhalf';
import { str2num } from 'normalize-num';
import { filename as novelFilename } from '@lazy-cjk/novel-filename';
import { slugify } from '@lazy-cjk/zh-slugify';

/**
 * node-novel-normalize 模組
 * node-novel-normalize module
 */

/**
 * 設定選項介面
 * Options interface for normalization settings
 */
export interface IOptions
{
	/**
	 * 數字填充位數
	 * Number padding length
	 * @default 5
	 */
	padNum?: number,
	/**
	 * 是否檢查羅馬數字
	 * Whether to check for Roman numerals
	 * @default false
	 */
	checkRoman?: boolean,
}

/**
 * 去除字串中的數字前綴與特殊標記
 * Strip numeric prefixes and special markers from string
 *
 * @param {string} str - 要處理的字串 / Input string to process
 * @param {boolean} [isDir=false] - 是否為目錄路徑 / Whether the input is a directory path
 * @returns {string} 處理後的字串 / Processed string
 */
export function normalize_strip(str: string, isDir?: boolean)
{
	if (isDir)
	{
		// 移除目錄路徑中的數字前綴與序號標記
		// Remove numeric prefixes and sequence markers from directory paths
		if (/^p?\d{4,}[\s_](.+)(_\(\d+\))$/.exec(str))
		{
			str = RegExp.$1;
		}
		else if (/^p?\d{4,}[\s_](.+)(_\(\d+\))?$/.exec(str))
		{
			str = RegExp.$1;
		}
	}
	else
	{
		// 移除檔案名稱中的數字前綴與序號標記
		// Remove numeric prefixes and sequence markers from file names
		if (/^\d+_(.+)\.\d+$/.exec(str))
		{
			str = RegExp.$1;
		}
		else if (/^c?\d{4,}_(.+)$/.exec(str))
		{
			str = RegExp.$1;
		}
	}

	// 移除全形空格
	// Remove full-width spaces
	str = strUtilTrim(str, '　');

	return str;
}

/**
 * 將字串標準化為統一格式
 * Normalize string to a standardized format
 *
 * @param {string} str - 要處理的字串 / Input string to process
 * @param {number} [padNum=5] - 數字填充位數 / Number padding length
 * @param {IOptions} [options={}] - 處理選項 / Processing options
 * @returns {string} 標準化後的字串 / Normalized string
 */
export function normalize_val(str: string, padNum: number = 5, options: IOptions = {}): string
{
	padNum = padNum || options.padNum;

	// 使用小說檔案名稱處理器進行初步處理
	// Perform initial processing using novel filename handler
	str = novelFilename(str);

	// 處理序章標記，將其轉換為 0_ 開頭
	// Handle prologue markers by converting them to start with 0_
	if (/^(?:序|プロローグ|Prologue)/i.test(str))
	{
		str = '0_' + str;
	}

	// 處理 web 版標記
	// Handle web edition markers
	str = str.replace(/^(web)版(\d+)/i, '$1$2');

	//str = str.replace(/^[cp](\d{4,}_)/, '$1');

	// 轉換為半形並轉為小寫
	// Convert to half-width characters and lowercase
	str = toHalfWidth(str)
		.toLowerCase()
	;
	// 移除全形空格
	// Remove full-width spaces
	str = strUtilTrim(str, '　');

	// 將中文數字轉換為阿拉伯數字
	// Convert Chinese numerals to Arabic numerals
	str = zh2num(str).toString();

	// 進行第二次數字轉換，使用不同的選項
	// Perform second numeral conversion with different options
	str = zh2num(str, {
		truncateOne: 2,
		flags: 'ug',
	}).toString();

	// 使用 normalize-num 進行數字標準化
	// Normalize numerals using normalize-num
	str = str2num(str, {
		all: true,
		roman: options.checkRoman,
	});

	/*
	if (options.checkRoman)
	{
		let m = isRoman(str);

		if (m)
		{
			let n = deromanize(normalizeRoman(m[1]));
			str = n.toString() + str.slice(m[1].length);
			//console.log(m[1], n, str);
		}
	}

	str = circle2num(str);
	*/

	// 將所有數字填充到指定長度
	// Pad all numbers to the specified length
	str = str.replace(/\d+/g, function ($0)
	{
		return $0.padStart(padNum, '0');
	});

	// 標準化分隔符號與特殊字符
	// Standardize separators and special characters
	str = str
		.replace(/^第+/, '')
		//.replace(/(\d)[章話]/g, '$1_')
		//.replace(/第(\d)/g, '_$1')
		//.replace(/\./g, '_')
		.replace(/[―—－──\-―—─＝=―——─ー─]/g, '_')
		.replace(/[\s　]/g, '_')
		.replace(/[\(\)〔［【《（「『』」》）】〕］〔［〕］]/g, '_')
		.replace(/[·‧・···•・·᛫•․‧∙⋅⸱⸳・ꞏ·‧・···•˙●‧﹒]/g, '_')
		.replace(/[：：︰﹕：︓∶:]/ug, '_')
		.replace(/[・:,]/g, '_')
		.replace(/_+$/g, '')
		.replace(/_+/g, '_')

	;

	/*
	str = zh2jp(cn2tw(str) as string, {
		safe: false,
	});
	*/

	/*
	str = zhTable.auto(cn2tw(str, {
		safe: false,
		// @ts-ignore
		greedyTable: true,
	}), {
		safe: false,
		// @ts-ignore
		greedyTable: true,
	})[0];
	*/

	// 使用 slugify 進行最終標準化
	// Perform final normalization using slugify
	str = slugify(str, true);

	return str;
}

/**
 * 模組匯出處理
 * Module export handling
 */
// @ts-ignore
if (process.env.TSDX_FORMAT !== 'esm')
{
	Object.defineProperty(normalize_val, "__esModule", { value: true });

	Object.defineProperty(normalize_val, 'normalize_val', { value: normalize_val });
	Object.defineProperty(normalize_val, 'default', { value: normalize_val });

	Object.defineProperty(normalize_val, 'normalize_strip', { value: normalize_strip });

}

/**
 * 預設匯出
 * Default export
 */
export default normalize_val;
