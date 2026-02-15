/**
 * 小說文字處理模組
 * Novel Text Processing Module
 *
 * 此模組提供小說文字的格式化、清理和轉換功能。
 * This module provides formatting, cleaning, and conversion functions for novel text.
 *
 * 主要功能 / Main Features:
 * - 英文文字填充 / English text padding
 * - 詞語替換規則處理 / Word replacement rule processing
 * - 換行符和空白處理 / Line break and whitespace handling
 * - 段落排版調整 / Paragraph layout adjustment
 * - 貼吧和諧詞處理 / Tieba harmony word processing
 * - 空白行檢查 / Blank line checking
 *
 * @module novel-text
 * @author user
 * @created 2018/2/9
 */

export * from './text';
import StrUtil from 'str-util';
import { enspace } from './text';
import tiebaHarmony from 'tieba-harmony';
import chkBlankLine from 'blank-line';

/**
 * 字串工具模組
 * String Utility Module
 *
 * 提供各種字串處理功能。
 * Provides various string processing functions.
 */
export { StrUtil }

/**
 * 空白行檢查模組
 * Blank Line Check Module
 *
 * 用於檢查和處理文字中的空白行。
 * Used to check and handle blank lines in text.
 */
export { chkBlankLine }

/**
 * 貼吧和諧詞處理模組
 * Tieba Harmony Word Processing Module
 *
 * 處理百度貼吧的和諧詞替換。
 * Handles Baidu Tieba harmony word replacement.
 */
export { tiebaHarmony }

/**
 * 小說文字處理器實例
 * Novel Text Processor Instance
 *
 * 預設建立的 enspace 實例，可直接用於文字處理。
 * Pre-created enspace instance, can be used directly for text processing.
 *
 * @example
 * ```typescript
 * import novelText from 'novel-text';
 * const result = novelText.replace('原始文字', { words: true });
 * ```
 */
export const novelText = enspace.create();
export default novelText;
