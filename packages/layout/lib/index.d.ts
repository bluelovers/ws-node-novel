/**
 * Created by user on 2019/5/29.
 */
/// <reference types="node" />
export declare const SP_KEY = "#_@_#";
export declare const SP_REGEXP = "(?:@|\uFF08\u00B7?\uFF09|-|/|\\(\\)|%|\uFFE5|_|\\?|\uFF1F|\\||#|\\$|[\uFF08\\(](?:\u548C\u8C10|\u6CB3\u87F9)[\\)\uFF09]|\uFF08\u6CB3\uFF09\uFF08\u87F9\uFF09|[\uFF08\\(][\u6CB3\u87F9]{1,2}[\\)\uFF09]| |\\.|[\u30FB\u00B7]|\\*|\u25A1|\u570C|[=\uFF1D]|\\\\\\\\|\\/\\/|\uFF5C)";
export interface IOptions {
    words?: boolean;
    pad_eng?: boolean;
}
export interface IWordsOutput {
    _source?: any;
    s?: RegExp;
    r?: string | IRegExpCallback;
    flags?: string;
}
export interface IRegExpCallback {
    ($0: string, $1?: string, $2?: string, $3?: string, ...argv: any[]): string;
}
export interface IToStrOptions {
    LF?: string;
    allow_nbsp?: boolean;
    allow_bom?: boolean;
}
export interface ITextLayoutOptions extends IToStrOptions {
    allow_lf2?: boolean;
    allow_lf3?: boolean;
}
export declare class enspace {
    _cache_: {
        replace: any[];
        words: Map<any, any>;
    };
    _data_: {
        m0: RegExp;
        r1: RegExp;
        rtrim: RegExp;
        words: IWordsOutput[];
    };
    options: {};
    _words_r1: string;
    constructor(options?: any);
    static create(...argv: any[]): enspace;
    _words1(arr: string[], words?: any[]): IWordsOutput[];
    _words2(words: any): IWordsOutput[];
    replace(text: any, options?: IOptions): string;
    replace_words(_ret: any, words: IWordsOutput[], _cache_words?: any): {
        value: string;
        cache: any;
    };
    paddingEng(text: string): string;
    clearLF(text: string): string;
    trim(text: Buffer, options?: any): string;
    trim(text: string, options?: any): string;
    trim(text: number, options?: any): string;
    toStr(str: Buffer | string | number | any, options?: IToStrOptions): string;
    toStr(str: Buffer | string | number | any, options?: string): string;
    fixOptions(options: ITextLayoutOptions): ITextLayoutOptions;
    reduceLine<T>(html: T, options?: ITextLayoutOptions): string | T;
    /**
     * 通用型段落調整
     *
     * @returns {string}
     */
    textlayout(html: any, options?: ITextLayoutOptions): string;
}
