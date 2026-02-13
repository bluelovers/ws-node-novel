/**
 * Created by user on 2018/3/24/024.
 */

import mdconf, { parse, stringify } from './core';
export { mdconf, parse, stringify }

import { isPlainObject } from 'is-plain-object';

export { IOptionsParse, defaultOptionsParse, IObjectParse } from './core';

export { isPlainObject };

export {
	RawObject,
	SYMBOL_RAW_DATA,
	SYMBOL_RAW_VALUE
} from './lib/RawObject';

/**
 * mdconf2 模組
 * mdconf2 module
 */
export default exports as typeof import('./index');
