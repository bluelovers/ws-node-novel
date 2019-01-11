/**
 * Created by user on 2019/1/6/006.
 */
import moment = require('moment');
import { defaultSortCallback, naturalCompare } from '@node-novel/sort';
export { naturalCompare };
export declare function createMoment(...argv: any[]): moment.Moment;
export declare let todayMomentTimestamp: number;
export declare let todayMomentOffset: number;
export default todayMomentTimestamp;
export declare function getTodayMomentTimestamp(): number;
export declare function refreshTodayMoment(): boolean;
export declare const cacheSortCallback: typeof defaultSortCallback;
export declare function freezeProperty<T>(who: T, prop: keyof T, freeze?: boolean): T;
export declare function baseSortObject<T>(data: T): T;
export declare function tryRequireFS(): typeof import('fs-extra');
