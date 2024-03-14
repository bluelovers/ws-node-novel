/// <reference types="node" />
import Bluebird from 'bluebird';
import { IParseCommit } from 'gitlog2';
import { console } from '@git-lazy/util';
export { console };
export type IFetchAllFileLog = [string, IFetchAllFileLogRow][];
export interface IFetchAllFileLogRow {
    file: string;
    fullpath: string;
    log: IFetchAllFileLogRowLog;
}
export interface IFetchAllFileLogRowLog extends IParseCommit {
    authorDateTimestamp?: number;
    committerDateTimestamp?: number;
}
export declare function fetchFileLogRow(repo: string, file: string): Promise<IFetchAllFileLogRow>;
export declare function fetchAllFileLog(repo: string, options?: {
    sortFn?(a: IFetchAllFileLogRow, b: IFetchAllFileLogRow): number;
    sortDesc?: boolean;
}): Bluebird<IFetchAllFileLog>;
export declare function git_fake_author(name?: string, email?: string): string;
export declare function git_commit_file(row: IFetchAllFileLogRow, cwd?: string): Bluebird<import("cross-spawn-extra").SpawnASyncReturns<Buffer>>;
export declare function git_get_user(cwd: string): Promise<{
    name: string;
    email: string;
}>;
export declare function git_set_user(name: string, email: string, cwd: string): Promise<void>;
export declare function runAllJob(cwd: string): Bluebird<IFetchAllFileLog>;
