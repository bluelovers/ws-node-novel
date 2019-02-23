/**
 * Created by user on 2019/2/23.
 */
export declare const regexpPunctuation: RegExp;
export declare function removePunctuation(input: string): string;
export declare function removeSpace(input: string): string;
export declare function removeLine(input: string): string;
/**
 * 合併多個 regexp 為一個
 */
export declare function regexMerge<T extends RegExp>(list: T[]): RegExp;
export declare function removeBom(input: string): string;
