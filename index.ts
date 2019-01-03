/**
 * Created by user on 2018/3/24/024.
 */

import mdconf, { parse, stringify } from './core';
export { mdconf, parse, stringify }

export { SYMBOL_RAW_DATA, SYMBOL_RAW_VALUE, IOptionsParse, defaultOptionsParse, IObjectParse, RawObject, ITable } from './core';

export { isPlainObject, moment, deepmerge } from './core';
export { crlf, LF, CRLF, CR } from './core';

import self = require('./index');
export default self;
