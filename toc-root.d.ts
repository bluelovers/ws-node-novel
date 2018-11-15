/**
 * Created by user on 2018/11/14/014.
 */
import BluebirdPromise = require('bluebird');
import { IMdconfMeta } from 'node-novel-info';
export declare function searchByRoot(rootPath: string): BluebirdPromise<string[]>;
export declare function isNovelID(dir: string, rootPath?: string): BluebirdPromise<string>;
export declare function filterList(ls: string[], rootPath?: string): BluebirdPromise<string[]>;
export declare function processDataByAuthor<T extends IMdconfMeta = IMdconfMeta>(ls: string[], rootPath: string): BluebirdPromise<IDataAuthor<T>>;
export interface IDataAuthor<T extends IMdconfMeta = IMdconfMeta> {
    [author: string]: IDataAuthorNovel<T>;
    unknow?: IDataAuthorNovel<T>;
}
export interface IDataAuthorNovel<T extends IMdconfMeta = IMdconfMeta> {
    [novelID: string]: IDataAuthorNovelItem<T>[];
}
export interface IDataAuthorNovelItem<T extends IMdconfMeta = IMdconfMeta> {
    novelID: string;
    pathMain: string;
    file: string;
    author: string | 'unknow';
    meta: T;
}
export declare function stringifyDataAuthor<T extends IMdconfMeta = IMdconfMeta>(data: IDataAuthor<T>, rootPath: string): string;
export declare function createTocRoot<T extends IMdconfMeta = IMdconfMeta>(_root: string, outputFile?: string): BluebirdPromise<string>;
export default createTocRoot;
