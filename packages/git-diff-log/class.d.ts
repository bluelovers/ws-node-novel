/**
 * Created by user on 2019/6/18.
 */
import { IListFileRow, IListMain, IListMainRow, INovelDiffFromLog } from './index';
export declare class NovelDiffFromLogParser {
    data: INovelDiffFromLog;
    constructor(data: INovelDiffFromLog);
    filterPathMains(filter: (pathMain: string, values: IListMainRow) => boolean): IListMain;
    /**
     * 回傳所有 pathMain 列表
     */
    pathMains(): string[];
    /**
     * 回傳所有 novelID 列表
     */
    novelIDs(): string[];
    /**
     * 回傳所有檔案列表
     */
    files(filter?: (value: IListFileRow) => boolean): IListFileRow[];
    static novelIDs(list: INovelDiffFromLog["list"]): string[];
    static filterFiles(list: IListFileRow[], filter: (value: IListFileRow) => boolean): IListFileRow[];
    static files(list: INovelDiffFromLog["list"], filter?: (value: IListFileRow) => boolean): IListFileRow[];
}
export declare function ArrayUniqueDecorator<T extends Function>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): void;
export default NovelDiffFromLogParser;
