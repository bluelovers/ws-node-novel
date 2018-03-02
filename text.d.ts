export declare const SP_REGEXP = "(?:@|（·?）|-|/|\\(\\)|%|￥|_|\\?|？|\\||#|\\$|[（\\(](?:和谐|河蟹)[\\)）]|（河）（蟹）|[（\\(][河蟹]{1,2}[\\)）]| |\\.|[・。·]|\\*|□|圌)";
export declare const SP_KEY = "#_@_#";
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
        words: any[];
    };
}
import * as NovelText from './text';
export default NovelText;
