/**
 * Created by user on 2018/11/11/011.
 */

export {
	autoFile,

	makeOptions,

	outputFile,
	outputFileSync,

	readFile,
	readFileSync,
} from './lib';
export * from './lib/interface';
export { console } from './lib/console';

import * as txtSplit from './index';
export default txtSplit;
