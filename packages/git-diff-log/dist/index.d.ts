import { IGitDiffFromRow } from 'git-diff-from';
import { ITSPickExtra } from 'ts-type';

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
/**
 * 比對目標路徑下的 git 歷史變化
 * 適用於任何符合 `主資料夾/副資料夾/子路徑` 這種結構的資料夾
 */
export declare function novelDiffFromLog(options: ITSPickExtra<IOptions, "novelRoot">): INovelDiffFromLog;
export type IListFileRow = IGitDiffFromRow & {
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
export type IListNovelRow = IListFileRow[] & {
	/**
	 * 主資料夾 ID
	 */
	readonly pathMain: string;
	/**
	 * 資料夾 ID (小說名稱)
	 */
	readonly novelID: string;
};
export type IListMain = {
	[pathMain: string]: IListMainRow;
};
export type IListMainRow = {
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

export {
	novelDiffFromLog as default,
};

export {};
