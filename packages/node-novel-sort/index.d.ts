/**
 * Created by user on 2018/2/12/012.
 */
import * as naturalCompare from 'string-natural-compare';
export declare enum EnumToLowerCase {
    toLowerCase = 1,
    toLocaleLowerCase = 2
}
export declare function createSortCallback(options?: {
    dotNum?: boolean;
    failbackSort?(a: any, b: any): number;
    trigger?(a: any, b: any): number;
    transpile?(input: any, isSub?: any, ...argv: any[]): string;
    toLowerCase?: EnumToLowerCase | boolean | ((input: any, isSub?: any, ...argv: any[]) => string);
}): (a: string, b: string, isSub?: boolean) => any;
export { naturalCompare };
export declare const defaultSortCallback: (a: string, b: string, isSub?: boolean) => any;
export default defaultSortCallback;
export declare function _match(a: string, b: string, { r, mainFn, isSub, }: {
    r: any;
    mainFn: any;
    isSub: any;
}): any;
export declare function _trim(input: string): string;
