/// <reference types="node" />
import { crlf, LF, CRLF, CR } from 'crlf-normalize';
import * as deepmerge from 'deepmerge-plus';
import * as moment from 'moment';
import * as isPlainObject from 'is-plain-object';
export { isPlainObject, moment, deepmerge };
export { crlf, LF, CRLF, CR };
export declare const SYMBOL_RAW_DATA: symbol;
export declare const SYMBOL_RAW_VALUE: symbol;
export interface IOptionsParse {
    crlf?: string;
    oldParseApi?: boolean;
    allowBlockquote?: boolean;
    disableKeyToLowerCase?: boolean;
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
 * @param {Object} obj
 * @param {Array} keys
 * @param {String} str
 * @param {Object} table
 * @api private
 */
export declare function put(obj: any, keys: string[], str: string, code?: boolean, table?: ITable, options?: IOptionsParse): void;
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
