/**
 * Created by user on 2019/6/18.
 */
import { IGitDiffFromRow } from 'git-diff-from';
import { ITSPickExtra } from 'ts-type';
/**
 * 比對目標路徑下的 git 歷史變化
 * 適用於任何符合 `主資料夾/副資料夾/子路徑` 這種結構的資料夾
 */
export declare function novelDiffFromLog(options: ITSPickExtra<IOptions, 'novelRoot'>): INovelDiffFromLog;
export declare type IListFileRow = IGitDiffFromRow & {
    /**
     * 主資料夾 ID
     */
    pathMain: string;
    /**
     * 資料夾 ID (小說名稱)
     */
    novelID: string;
    basename: string;
    subpath: string;
};
export declare type IListNovelRow = IListFileRow[] & {
    /**
     * 主資料夾 ID
     */
    readonly pathMain: string;
    /**
     * 資料夾 ID (小說名稱)
     */
    readonly novelID: string;
};
export declare type IListMain = {
    [pathMain: string]: IListMainRow;
};
export declare type IListMainRow = {
    [novelID: string]: IListNovelRow;
};
export interface IOptions {
    /**
     * 檢查路徑
     * 目標根目錄
     */
    novelRoot: string;
    /**
     * 檢查起始點
     * 檢查 hash 或者 可輸入數字 則自動搜尋 此數字以內的紀錄
     */
    baseHash: number | string;
    /**
     * 比對目標分支或者 commit id
     */
    targetTree: string;
}
export interface INovelDiffFromLog extends IOptions {
    /**
     * 回傳列表
     */
    list: IListMain;
    /**
     * 實際比對範圍
     */
    range: {
        /**
         * 起始
         */
        from: string;
        /**
         * 終點
         */
        to: string;
    };
    count: {
        /**
         * 主資料夾數量
         */
        main: number;
        /**
         * 小說數量
         */
        novel: number;
        /**
         * 變化檔案總數
         */
        file: number;
    };
}
export default novelDiffFromLog;
