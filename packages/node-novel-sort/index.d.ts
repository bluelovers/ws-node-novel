/**
 * Created by user on 2018/2/12/012.
 */
import * as naturalCompare from 'string-natural-compare';
export declare enum EnumToLowerCase {
    toLowerCase = 1,
    toLocaleLowerCase = 2
}
export declare function defaultSortCallback(a: string, b: string, isSub?: boolean): number;
export declare namespace defaultSortCallback {
    function failbackSort(a: any, b: any): number;
    function trigger(a: string, b: string, data: ITriggerData): number;
    function transpile(input: any, isSub?: any, ...argv: any[]): string;
    function transpileBase(input: any, isSub?: any, ...argv: any[]): string;
    function fnSortCallback(a: string, b: string, isSub?: boolean): number;
}
export declare type IFnSortCallback = typeof defaultSortCallback;
export declare type ICreateSortCallbackOptions = {
    dotNum?: boolean;
    /**
     * will change base input value
     */
    toLowerCase?: EnumToLowerCase | boolean | ((input: any, isSub?: any, ...argv: any[]) => string);
} & IFnSortCallbackProp;
export interface IFnSortCallbackProp {
    /**
     * failback compare
     */
    failbackSort?(a: any, b: any): number;
    /**
     * compare transpile value
     */
    trigger?(a: string, b: string, data: ITriggerData): number;
    /**
     * will change input value for trigger only
     */
    transpile?(input: any, isSub?: any, ...argv: any[]): string;
    /**
     * will change base input value
     */
    transpileBase?(input: any, isSub?: any, ...argv: any[]): string;
}
/**
 * create a compare callback by (transpileBase value) -> trigger(transpile value) -> failbackSort
 * @param options
 */
export declare function createSortCallback(options?: ICreateSortCallbackOptions): IFnSortCallback;
export { naturalCompare };
declare const _default: typeof defaultSortCallback;
export default _default;
export interface ITriggerData {
    r: RegExp;
    mainFn: IFnSortCallback;
    isSub: boolean;
}
export declare function _match(a: string, b: string, { r, mainFn, }: ITriggerData): number;
export declare function _trim(input: string): string;
