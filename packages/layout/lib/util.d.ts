/**
 * Created by user on 2019/5/29.
 */
import { ITextLayoutOptions, IWordsArray, IWordsArray2, IWordsUserSP } from './types';
export declare function _isIwordsArray(value: any): value is IWordsArray;
export declare function _isIwordsArray2(value: any): value is IWordsArray2;
export declare function _isIwordsUserSp(value: any): value is IWordsUserSP;
export declare function _handleTextLayout(html: string, options: ITextLayoutOptions): string;
