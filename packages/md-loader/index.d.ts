/**
 * Created by user on 2019/2/1/001.
 */
/// <reference types="node" />
import GrayMatter from 'gray-matter';
import { IOptionsParse } from 'node-novel-info';
export interface IOptions<I extends IInput, OUT extends any, PO, GO> {
    /**
     * 傳給 gray-matter 的 options
     * @see https://www.npmjs.com/package/gray-matter
     */
    matterOptions?: GrayMatter.GrayMatterOption<I, GO>;
    /**
     * 自訂 mdconf 的解析函數
     * 預設狀況下為 node-novel-info
     */
    parser?(input: I, parseOptions?: IParseOptions<PO>): IObject<OUT>;
    /**
     * 傳給 parser 的 options
     * 預設狀況下為 node-novel-info 的 IOptionsParse
     */
    parseOptions?: IParseOptions<PO>;
    /**
     * 用來將 mdconf 轉換回 md 的函數
     * 預設狀況下為 node-novel-info
     */
    stringify?(input: any): string;
}
export declare function parse<I extends IInput, D, OUT, PO, GO>(inputContent: I, options?: IOptions<I, OUT, PO, GO>): {
    /**
     * 經由 gray-matter 解析後的物件
     */
    matter: GrayMatter.GrayMatterFile<I>;
    /**
     * 排除 Front Matter 後的原始內容
     */
    content: string;
    /**
     * Front Matter 資料
     */
    data: IObject<D, {
        [key: string]: any;
    }>;
    /**
     * 回傳的 mdconf 資料 預設為 node-novel-info
     * 如果回傳的 為 {} 空物件則會被轉換為 null
     */
    mdconf: import("node-novel-info").IMdconfMeta | IObject<OUT, {
        [key: string]: any;
    }>;
    /**
     * 用來將取得的物件轉換回 md
     * 當 content, mdconf 同時存在時 content > mdconf
     */
    stringify<T1 = D, T2 = OUT>(inputData: IObject<({
        data?: IObject<T1, {
            [key: string]: any;
        }>;
    } & {
        content: string | Buffer;
    }) | ({
        data?: IObject<T1, {
            [key: string]: any;
        }>;
    } & {
        mdconf: T2;
    }), {
        [key: string]: any;
    }>): string;
};
/**
 * 用來將取得的物件轉換回 md
 * 當 content, mdconf 同時存在時 content > mdconf
 */
export declare function stringify<T1, T2>(inputData: IStringifyData<T1, T2>, options?: IObject<{
    matterOptions?: GrayMatter.GrayMatterOption<IInput, any>;
    stringify?(input: any): string;
}>): string;
/**
 * 將 inputContent 轉為 string
 */
export declare function fixContent<I extends IInput>(inputContent: I): string;
/**
 * 最後處理時 都會被轉為 string
 */
export declare type IInput = Buffer | string;
export declare type IParseOptions<PO> = (IOptionsParse | object) | PO;
/**
 * 當 content, mdconf 同時存在時 content > mdconf
 */
export declare type IStringifyData<T extends any, OUT extends any> = IObject<{
    data?: IObject<T>;
} & ({
    content: IInput;
} | {
    mdconf: OUT;
})>;
export declare type IObject<T extends any, B extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = B & T;
declare const _default: typeof import(".");
export default _default;
