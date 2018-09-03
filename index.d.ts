/**
 * Created by user on 2018/5/1/001.
 */
import * as Promise from 'bluebird';
import { Console } from 'debug-color2';
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
export declare function md_href(href: string): string;
export declare function defaultFilter(value: string): boolean;
import * as self from './index';
export default self;
