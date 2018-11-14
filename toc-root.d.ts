/**
 * Created by user on 2018/11/14/014.
 */
import BluebirdPromise = require('bluebird');
import { IMdconfMeta } from 'node-novel-info';
export declare function searchByRoot(rootPath: string): BluebirdPromise<string[]>;
export declare function isNovelID(dir: string, rootPath?: string): BluebirdPromise<string>;
export declare function filterList(ls: string[], rootPath?: string): BluebirdPromise<string[]>;
export declare function processDataByAuthor(ls: string[], rootPath: string): BluebirdPromise<IDataAuthor>;
export interface IDataAuthor {
    [author: string]: {
        [novelID: string]: {
            novelID: string;
            pathMain: string;
            file: string;
            meta: IMdconfMeta;
        }[];
    };
}
export declare function stringifyDataAuthor(data: IDataAuthor, rootPath: string): string;
export declare function createTocRoot(_root: string, outputFile?: string): BluebirdPromise<string>;
export default createTocRoot;
