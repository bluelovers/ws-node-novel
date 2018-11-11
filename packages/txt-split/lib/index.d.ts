/**
 * Created by user on 2018/11/11/011.
 */
import { IDataVolume, IOptions, IOptionsWithData, IPathLike, IOptionsRequired } from './interface';
export declare const defaultOptions: Readonly<IOptions>;
export declare function makeOptions<O extends IOptions>(inputFile: IPathLike, options: O): O;
export declare function autoFile<O extends IOptionsRequired>(inputFile: IPathLike, options: O): Promise<{
    options: O;
    data: IDataVolume<string>;
} & {
    ls: string[];
}>;
export declare function readFile<O extends IOptions>(inputFile: IPathLike, options: O): Promise<{
    options: O;
    data: IDataVolume<string>;
}>;
export declare function readFileSync<O extends IOptions>(inputFile: IPathLike, options: O): {
    options: O;
    data: IDataVolume<string>;
};
export declare function outputFile(data: IDataVolume | IOptionsWithData, options?: Partial<IOptionsWithData>): Promise<string[]>;
export declare function outputFileSync(data: IDataVolume | IOptionsWithData, options?: Partial<IOptionsWithData>): string[];
export default autoFile;
