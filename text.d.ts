/// <reference types="node" />
import { SP_REGEXP, SP_KEY } from 'tieba-harmony';
export { SP_REGEXP, SP_KEY };
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
    textlayout(html: any, options?: ITextLayoutOptions): string;
}
import * as NovelText from './text';
export default NovelText;
