/**
 * Created by user on 2018/5/1/001.
 */
import Promise = require('bluebird');
import { Console } from 'debug-color2';
import { md_href } from './lib/util';
export { md_href };
export declare const console: Console;
export { Promise };
export declare function get_ids(cwd: string, filter?: typeof defaultFilter): Promise<string[]>;
export declare function processToc(DIST_NOVEL_ROOT: string, filter?: typeof defaultFilter): Promise<{
    [k: string]: IRet;
}>;
export interface IRetRow {
    titles: string[];
    tags?: string[];
    link?: string;
}
export interface IRet {
    [k: string]: IRetRow;
}
export declare function createReadmeData(cwd: string, ret: IRet, item: string): Promise<IRet>;
export declare function defaultFilter(value: string): boolean;
declare const _default: typeof import(".");
export default _default;
