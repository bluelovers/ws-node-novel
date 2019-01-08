/**
 * Created by user on 2019/1/6/006.
 */
/// <reference types="node" />
import { createMoment } from './lib/util';
import { IMdconfMeta } from 'node-novel-info';
import { EnumNovelStatus } from 'node-novel-info/lib/const';
export { createMoment };
/**
 * 所有 timestamp 為 Unix timestamp in milliseconds 為 utc +8
 * pathMain 為 主資夾名稱
 * novelID 為 小說資料夾名稱
 */
export interface INovelStatCache {
    meta?: {
        todayTimestamp?: number;
        timestamp?: number;
    };
    /**
     * 小說緩存狀態
     */
    novels: {
        [pathMain: string]: {
            [novelID: string]: INovelStatCacheNovel;
        };
    };
    /**
     * 歷史紀錄
     */
    history: {
        [timestamp: string]: INovelStatCacheHistory;
        [timestamp: number]: INovelStatCacheHistory;
    };
    /**
     * 透過 node-novel-conf 解析過的 META 資料 (README.md)
     */
    mdconf: {
        [pathMain: string]: {
            [novelID: string]: IMdconfMeta;
        };
    };
}
export interface INovelStatCacheNovel {
    /**
     * segment 更新時間
     */
    segment_date?: number;
    /**
     * epub 更新時間
     */
    epub_date?: number;
    /**
     * 初始化時間
     */
    init_date?: number;
    /**
     * 總章/卷數量
     */
    volume?: number;
    /**
     * 總話數
     */
    chapter?: number;
    /**
     * 上次的總章/卷數量
     */
    volume_old?: number;
    /**
     * 上次的總話數
     */
    chapter_old?: number;
    /**
     * segment 變動數量
     */
    segment?: number;
    /**
     * 上次的 segment 變動數量
     */
    segment_old?: number;
    /**
     * 小說狀態 flag 根據 readme.md 內設定
     */
    novel_status?: EnumNovelStatus;
    /**
     * 最後變動時間
     */
    update_date?: number;
    /**
     * 紀錄變動次數
     */
    update_count?: number;
    /**
     * epub filename
     */
    epub_basename?: string;
    txt_basename?: string;
}
export interface INovelStatCacheHistory {
    /**
     * 本次記錄內的 epub 總數
     */
    epub_count?: number;
    /**
     * 本次記錄內的 epub
     */
    epub?: Array<[string, string, INovelStatCacheNovel?]>;
    segment_count?: number;
    segment?: Array<[string, string, INovelStatCacheNovel?]>;
}
export interface INovelStatCacheOptions {
    /**
     * 讀寫緩存的目標 json 路徑
     */
    file: string;
    /**
     * 當 file 不存在時嘗試讀取此檔案
     */
    file_git?: string;
    /**
     * 禁止將資料寫回檔案
     */
    readonly?: boolean;
    history_max?: number;
    history_keep?: number;
    /**
     * options.readonly && options.data 必須同時啟用
     */
    data?: INovelStatCache;
}
/**
 * @example NovelStatCache.create()
 */
export declare class NovelStatCache {
    /**
     * 讀寫緩存的目標 json 路徑
     */
    file: string;
    /**
     * 當 file 不存在時嘗試讀取此檔案
     */
    file_git: string;
    data: INovelStatCache;
    options: INovelStatCacheOptions;
    inited: boolean;
    /**
     * 使用 NovelStatCache.create() 代替
     *
     * @deprecated
     */
    constructor(options: INovelStatCacheOptions);
    protected _init(options: INovelStatCacheOptions): void;
    /**
     * 檢查 file 是否存在
     */
    exists(): boolean;
    protected open(): this;
    /**
     * 取得所有在 data.novels / data.mdconf 內存在的 pathMain
     */
    pathMainList(): string[];
    /**
     * 取得指定 pathMain 的 novel 狀態集合
     */
    pathMain(pathMain: string): {
        [novelID: string]: INovelStatCacheNovel;
    };
    /**
     * 取得指定 pathMain novelID 的 novel 狀態緩存
     */
    novel(pathMain: string, novelID: string): INovelStatCacheNovel;
    /**
     * 取得指定 pathMain novelID 的 mdconf 資料
     */
    mdconf_get(pathMain: string, novelID: string): IMdconfMeta;
    /**
     * 設定指定 pathMain novelID 的 mdconf 資料
     */
    mdconf_set(pathMain: string, novelID: string, meta: IMdconfMeta): this;
    /**
     * @deprecated
     */
    _beforeSave(bool?: boolean | number): this;
    /**
     * 將資料儲存至 file
     *
     * @param bool - 清理物件多餘資料
     */
    save(bool?: boolean | number | EnumBeforeSave): this;
    /**
     * 取得今天的 timestamp
     */
    readonly timestamp: number;
    /**
     * 取得指定 timestamp 的 history 資料
     */
    history(timestamp: number | string): INovelStatCacheHistory;
    /**
     * 取得所有 history 資料
     */
    historys(): [string, INovelStatCacheHistory][];
    /**
     * 取得前一次的 history 資料
     */
    historyPrev(): INovelStatCacheHistory;
    /**
     * 取得今天的 history 資料
     */
    historyToday(): INovelStatCacheHistory;
    static fixOptions(options?: INovelStatCacheOptions, extraOptions?: Partial<INovelStatCacheOptions>): INovelStatCacheOptions;
    /**
     * 建立 NovelStatCache 物件
     */
    static create(options?: INovelStatCacheOptions): NovelStatCache;
    /**
     * 允許用其他方式取得 data 來建立物件
     */
    static createFromJSON(data: INovelStatCache | Buffer, options?: Partial<INovelStatCacheOptions>): NovelStatCache;
    /**
     * @param bool - 清理物件多餘資料
     */
    toJSON(bool?: boolean | number | EnumBeforeSave): INovelStatCache;
}
export declare enum EnumBeforeSave {
    NONE = 0,
    OPTIMIZE = 1,
    OPTIMIZE_AND_UPDATE = 2
}
declare const create: typeof NovelStatCache.create, fixOptions: typeof NovelStatCache.fixOptions, createFromJSON: typeof NovelStatCache.createFromJSON;
export { create, fixOptions, createFromJSON };
declare const _default: typeof NovelStatCache.create;
export default _default;
