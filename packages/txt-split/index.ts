/**
 * Created by user on 2018/11/11/011.
 */

/**
 * txt-split 模組
 * txt-split module
 */
export {
	autoFile,

	makeOptions,

	outputFile,
	outputFileSync,

	readFile,
	readFileSync,
} from './lib';
export type * from './lib/interface';
export { console } from './lib/console';

/**
 * 預設匯出
 * Default export
 */
export default exports as typeof import('./index');
