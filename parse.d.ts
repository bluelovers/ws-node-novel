/**
 * Created by user on 2018/2/4/004.
 */
import mdconf from './core';
declare const _s: typeof mdconf.parse & {
    default: typeof mdconf.parse;
    parse: typeof mdconf.parse;
};
export = _s;
