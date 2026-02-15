/**
 * 文字標籤解析模組
 * Text Tag Parsing Module
 *
 * 此模組提供解析文字中特殊標籤的功能，
 * 用於處理小說文字中的各種標記格式。
 *
 * This module provides functionality for parsing special tags in text,
 * used for handling various markup formats in novel text.
 *
 * @module parse-txt-tag
 */

import { parse} from './lib/parse';
export * from './lib/types';

/**
 * 文字標籤解析函數
 * Text tag parsing function
 *
 * 解析文字中的標籤並返回結構化的結果。
 * Parses tags in text and returns structured results.
 */
export { parse }

/**
 * 預設匯出解析函數
 * Default export of parse function
 *
 * 提供便捷的預設匯出，可直接使用 parse 函數。
 * Provides convenient default export for direct use of parse function.
 *
 * @example
 * ```typescript
 * import parse from 'parse-txt-tag';
 * const result = parse('文字內容');
 * ```
 */
export default parse

