/**
 * Created by user on 2018/8/13/013.
 */
import * as Promise from 'bluebird';
export declare function processTocContents(basePath: string, outputFile?: string, fnHeader?: typeof makeHeader): Promise<string>;
export declare function makeHeader(basePath: string): string[];
export declare function makeLink(title: string, link: string, isDir?: boolean): string;
export declare function md_link_escape(text: string): string;
export declare function getList(basePath: string): Promise<string[]>;
export default processTocContents;
