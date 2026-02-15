/**
 * 文字分割模組
 * Text Split Module
 *
 * 此模組提供將小說文字檔案分割為卷和章節的功能。
 * This module provides functionality to split novel text files into volumes and chapters.
 *
 * 主要功能 / Main Features:
 * - 自動讀取並分割文字檔案 / Automatically read and split text files
 * - 支援自定義卷章節匹配規則 / Support custom volume/chapter matching rules
 * - 支援中日文正則表達式 / Support Chinese-Japanese regular expressions
 * - 輸出分割後的檔案 / Output split files
 *
 * @module txt-split
 * @author user
 * @created 2018/11/11
 */

/**
 * txt-split 模組公開 API
 * txt-split module public API
 */
export {
	/**
	 * 自動處理檔案
	 * Auto process file
	 *
	 * 讀取、分割並輸出檔案的一站式方法。
	 * One-stop method to read, split, and output files.
	 */
	autoFile,

	/**
	 * 建立選項
	 * Make options
	 *
	 * 合併預設選項與使用者選項。
	 * Merges default options with user options.
	 */
	makeOptions,

	/**
	 * 非同步輸出檔案
	 * Async output file
	 *
	 * 非同步寫入分割後的檔案。
	 * Asynchronously writes split files.
	 */
	outputFile,

	/**
	 * 同步輸出檔案
	 * Sync output file
	 *
	 * 同步寫入分割後的檔案。
	 * Synchronously writes split files.
	 */
	outputFileSync,

	/**
	 * 非同步讀取檔案
	 * Async read file
	 *
	 * 非同步讀取並分割文字檔案。
	 * Asynchronously reads and splits text file.
	 */
	readFile,

	/**
	 * 同步讀取檔案
	 * Sync read file
	 *
	 * 同步讀取並分割文字檔案。
	 * Synchronously reads and splits text file.
	 */
	readFileSync,
} from './lib';

/**
 * 匯出所有類型定義
 * Export all type definitions
 */
export type * from './lib/interface';

/**
 * 匯出控制台工具
 * Export console utility
 */
export { console } from './lib/console';

/**
 * 預設匯出
 * Default export
 *
 * 匯出整個模組的類型定義。
 * Exports the entire module type definition.
 */
export default exports as typeof import('./index');
