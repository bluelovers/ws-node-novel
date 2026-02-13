/**
 * Created by user on 2018/2/12/012.
 */

import naturalCompare from '@bluelovers/string-natural-compare';
import { createSortCallback } from './lib/core';

/**
 * node-novel-sort 模組
 * node-novel-sort module
 */
export * from './lib/core';
export * from './lib/types';
export * from './lib/util';

export { naturalCompare }

/**
 * 預設排序回呼函數
 * Default sort callback function
 */
export const defaultSortCallback = createSortCallback({
	dotNum: true,
});

/**
 * 預設匯出
 * Default export
 */
export default defaultSortCallback
