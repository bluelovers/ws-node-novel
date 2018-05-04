/// <reference types="marked" />
/// <reference types="node" />
/**
 * Module dependencies.
 */
import * as md from 'marked';
import { crlf, LF, CRLF, CR } from 'crlf-normalize';
import * as deepmerge from 'deepmerge-plus';
import * as moment from 'moment';
import * as isPlainObject from 'is-plain-object';
export { isPlainObject, moment, deepmerge };
export { crlf, LF, CRLF, CR };
export declare const SYMBOL_RAW_DATA: unique symbol;
export declare const SYMBOL_RAW_VALUE: unique symbol;
export interface IOptionsParse {
    crlf?: string;
    oldParseApi?: boolean;
    allowBlockquote?: boolean;
    disableKeyToLowerCase?: boolean;
    markedOptions?: md.MarkedOptions;
    filterObjectKey?: any;
}
export declare const defaultOptionsParse: IOptionsParse;
export interface IObjectParse {
    [key: string]: any;
}
/**
 * Parse the given `str` of markdown.
 *
 * @param {String | Buffer} str
 * @param {Object} options
 * @return {Object}
 * @api public
 */
export declare function parse(str: string, options?: IOptionsParse): IObjectParse;
export declare function parse(str: Buffer, options?: IOptionsParse): IObjectParse;
export declare function getobjectbyid(a: any, conf: any): any;
/**
 * Add `str` to `obj` with the given `keys`
 * which represents the traversal path.
 *
 * @api private
 */
export declare function put(obj: any, keys: string[], str: string, code?: boolean, table?: ITable, options?: IOptionsParse, others?: {
    type?: string;
}): void;
/**
 * Normalize `str`.
 */
export declare function normalize(str: string, options?: IOptionsParse): string;
export declare function stringify(dataInput: any, level?: number, skip?: any[], k?: any): string;
export declare function makeCodeBlock(value: any, lang?: string): string;
export declare class RawObject {
    constructor(source: any, raw?: any);
    inspect(): string;
    toJSON(): any;
    toString(): any;
    getTypeof(): "string" | "number" | "boolean" | "symbol" | "undefined" | "object" | "function" | "array";
    getRawData(): any;
    getRawValue(): any;
    static isRawObject(v: object): boolean;
    /**
     * will remove hidden data and get source data
     *
     * @param {RawObject} data
     */
    static removeRawData(data: RawObject): any;
    static removeRawData(data: any): any;
}
export interface ITable {
    headers: string[];
    rows: any;
}
import * as self from './core';
export default self;
export declare function createInlineLexer(toks: md.TokensList, options: IOptionsParse): any;
