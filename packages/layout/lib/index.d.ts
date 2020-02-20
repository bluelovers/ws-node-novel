/**
 * Created by user on 2019/5/29.
 */
/// <reference types="node" />
import { ICacheMap, IConstructorOptions, IReplaceOptions, ITextLayoutOptions, IToStrOptions, ITrimOptionsUser, IWordsAll, IWordsParsed, IWordsRuntime } from './types';
export declare const SP_KEY = "#_@_#";
export declare const SP_REGEXP = "(?:@|\uFF08\u00B7?\uFF09|-|/|\\(\\)|%|\uFFE5|_|\\?|\uFF1F|\\||#|\\$|[\uFF08\\(](?:\u548C\u8C10|\u6CB3\u87F9)[\\)\uFF09]|\uFF08\u6CB3\uFF09\uFF08\u87F9\uFF09|[\uFF08\\(][\u6CB3\u87F9]{1,2}[\\)\uFF09]| |\\.|[\u30FB\u00B7]|\\*|\u25A1|\u570C|[=\uFF1D]|\\\\\\\\|\\/\\/|\uFF5C)";
/**
 * 排版處理核心
 */
export declare class TextLayout {
    readonly SP_KEY: string;
    readonly SP_REGEXP: string;
    protected _RegExpClass: typeof RegExp;
    protected _cache_: {
        replace: {
            old: string[];
            new: string[];
            data?: any;
        }[];
        words: ICacheMap;
    };
    protected _data_: {
        m0: RegExp;
        r1: RegExp;
        rtrim: RegExp;
        words: IWordsRuntime[];
    };
    protected options: IConstructorOptions;
    constructor(options?: IConstructorOptions, ...argv: any[]);
    static create(options?: IConstructorOptions, ...argv: any[]): TextLayout;
    protected _init(arr: string[]): void;
    get RegExp(): typeof RegExp;
    /**
     * 簡易型樣式處理 適用於 屏蔽字或者人名或者因為編碼問題而變成 ? 那些之類的點
     *
     * @private
     */
    _words1(arr: string[], words?: IWordsParsed[]): IWordsRuntime[];
    /**
     * 將樣式轉換成實際使用的樣式物件
     *
     * @private
     */
    _words2(words: IWordsAll[]): IWordsRuntime[];
    replace(text: any, options?: IReplaceOptions): string;
    /**
     * for run rule one by one
     */
    replace_row(_ret: string, value: IWordsRuntime, cacheMap?: ICacheMap): string;
    replace_words(_ret: string, words: IWordsRuntime[], cacheMap?: ICacheMap | true): {
        value: string;
        cache: ICacheMap;
    };
    /**
     * @deprecated
     */
    paddingEng(text: string): string;
    /**
     * @deprecated
     */
    clearLF(text: string): string;
    trim(text: Buffer | string | number, options?: ITrimOptionsUser): string;
    /**
     * 轉換為文字並且標準化
     */
    toStr(str: Buffer | string | number | unknown, options?: string | IToStrOptions): string;
    fixOptions(options: ITextLayoutOptions): ITextLayoutOptions;
    /**
     * @deprecated
     */
    reduceLine<T>(html: T, options?: ITextLayoutOptions): string | T;
    /**
     * 通用型段落調整
     *
     * @returns {string}
     */
    textlayout(input: any, options?: ITextLayoutOptions): string;
}
export declare const create: typeof TextLayout.create;
export default TextLayout;
