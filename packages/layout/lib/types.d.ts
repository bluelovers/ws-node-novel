export interface IConstructorOptions extends ITextLayoutHiddenData {
    words_block?: string[];
    /**
     * 一般來說不需要改動
     * @type {string}
     */
    SP_KEY?: string;
    /**
     * 可以替換成符合需求的 regexp 樣式
     * 請注意不要在樣式內用任何括號回傳的語法以及請用 `(?:xxxx)` 將 語法包起來
     *
     * @type {string}
     */
    SP_REGEXP?: string | RegExp;
    /**
     * 使用自訂的 RegExp Class
     */
    RegExpClass?: typeof RegExp;
}
export interface ITextLayoutHiddenData {
    m0?: RegExp;
    r1?: RegExp;
    rtrim?: RegExp;
    words?: IWordsRuntime[];
}
export interface IToStrOptions {
    LF?: string;
    allow_nbsp?: boolean;
    allow_bom?: boolean;
}
export interface ITrimOptions extends IToStrOptions {
    trim?: boolean | string;
}
export interface ITextLayoutOptions extends ITrimOptions {
    allow_lf2?: boolean;
    allow_lf3?: boolean;
}
export declare type IWordsRuntime = IWordsParsed | IWordsFunction;
export declare type IWordsAll = IWordsArray | IWordsArray2 | IWordsUser | IWordsUserSP;
/**
 * 推薦使用此格式 簡單方便
 */
export declare type IWordsArray = [string | RegExp, string | IRegExpCallback, string?, ...unknown[]];
/**
 * 接收目前文字內容並輸出新文字內容
 */
export interface IWordsFunction {
    /**
     * 接收目前文字內容並輸出新文字內容
     */
    (_ret: string, _cache_words: ICacheMap): string;
}
export interface IWordsArray2 {
    [0]: IWordsFunction;
    length: 1;
}
export interface IWordsOutputCore {
    _source?: IWordsAll | IWordsRuntime | string;
    r: string | IRegExpCallback;
    flags?: string;
    /**
     * 接收目前文字內容並輸出新文字內容
     */
    fn?: IWordsFunction;
    /**
     * 不處理物件直接回傳原始物件
     */
    no_regex?: boolean;
}
export interface IWordsParsed extends IWordsOutputCore {
    s: RegExp;
}
export interface IWordsUser extends IWordsOutputCore {
    s?: string | RegExp;
}
/**
 * 當 s 為 string 並且 包含 SP_KEY
 */
export interface IWordsUserSP extends IWordsOutputCore {
    /**
     * s 為 string 並且 包含 SP_KEY
     */
    s: string;
}
export interface IRegExpCallback {
    ($0: string, $1?: string, $2?: string, $3?: string, ...argv: string[]): string;
    (substring: string, ...args: any[]): string;
}
export declare type ICacheMap = Map<IWordsRuntime, ICacheMapRow[]>;
export interface ICacheMapRow {
    old: string;
    new: string;
}
export declare type ITrimOptionsUser = ITrimOptions | ITrimOptions["trim"];
export declare const enum EnumLF {
    LF1 = "\n",
    LF2 = "\n\n",
    LF3 = "\n\n\n",
    LF4 = "\n\n\n\n"
}
export interface IReplaceOptions {
    words?: boolean;
    pad_eng?: boolean;
}
