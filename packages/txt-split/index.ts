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
export type * from './lib/interface';
export { console } from './lib/console';

export default exports as typeof import('./index');
