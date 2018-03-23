/// <reference types="node" />
/**
 * Created by user on 2018/2/4/004.
 */
import mdconf from './core';
declare const _s: {
    (str: string, options?: mdconf.IOptionsParse): mdconf.IObjectParse;
    (str: Buffer, options?: mdconf.IOptionsParse): mdconf.IObjectParse;
} & {
    default: {
        (str: string, options?: mdconf.IOptionsParse): mdconf.IObjectParse;
        (str: Buffer, options?: mdconf.IOptionsParse): mdconf.IObjectParse;
    };
    parse: {
        (str: string, options?: mdconf.IOptionsParse): mdconf.IObjectParse;
        (str: Buffer, options?: mdconf.IOptionsParse): mdconf.IObjectParse;
    };
};
export = _s;
