/**
 * Created by user on 2018/2/14/014.
 */
export interface IOptions {
    padNum?: number;
    checkRoman?: boolean;
}
export declare function normalize_strip(str: string, isDir?: boolean): string;
export declare function normalize_val(str: string, padNum?: number, options?: IOptions): string;
import * as self from './index';
export default self;
