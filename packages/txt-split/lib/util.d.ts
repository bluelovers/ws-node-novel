import { IContext, IDataVolume, IOptions, IOptionsWithData, IPathLike, Resolvable } from './interface';
import Bluebird = require('bluebird');
export declare function logWarn(...argv: any[]): void;
export declare function chkEncoding<O extends IOptions>(data: IContext, file?: string, options?: O): {
    encoding: string;
    confidence: number;
    name?: string;
    id?: string;
};
export declare function padIndex(n: number | string, maxLength?: number, fillString?: string | number): string;
export declare function padIndexStart(n: number | string, maxLength?: number, fillString?: string | number): string;
export declare function padIndexEnd(n: number | string, maxLength?: number, fillString?: string | number): string;
export declare function _wrapMethod<R, F extends (...args: unknown[]) => Resolvable<R>>(fn: F): (...args: Parameters<F>) => Bluebird<R>;
export declare function _handleReadFile<O extends IOptions>(data: IContext, file: IPathLike, options?: O): string;
export declare function _outputFile<O extends Partial<IOptionsWithData>>(data: IDataVolume | IOptionsWithData, options?: O): {
    data: IDataVolume;
    options: O;
};
export declare function fix_name(name: string): string;
