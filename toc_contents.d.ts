/**
 * Created by user on 2018/8/13/013.
 */
import * as BluebirdPromise from 'bluebird';
export declare type IFnHeader = typeof makeHeader | typeof makeHeaderAsync | any;
export declare function processTocContents(basePath: string, outputFile?: string, fnHeader?: IFnHeader): BluebirdPromise<string>;
export declare function makeHeaderAsync(basePath: string, ...argv: any[]): BluebirdPromise<string[]>;
export declare function makeHeader(basePath: string, ...argv: any[]): string[];
export declare function makeLink(title: string, link: string, isDir?: boolean): string;
export declare function md_link_escape(text: string): string;
export declare function getList(basePath: string): BluebirdPromise<string[]>;
export default processTocContents;
