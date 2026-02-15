/**
 * 中日文檔名處理模組
 * Chinese-Japanese Filename Processing Module
 *
 * 此模組重新導出 @lazy-cjk/novel-filename 套件的功能，
 * 提供中日文小說檔案名稱的處理和轉換功能。
 *
 * This module re-exports the @lazy-cjk/novel-filename package,
 * providing processing and conversion functions for Chinese-Japanese novel filenames.
 *
 * @module novel-text/zhjp
 * @author user
 * @created 2018/1/25
 */

export * from '@lazy-cjk/novel-filename';
import novelFilename from '@lazy-cjk/novel-filename';
export default novelFilename;
