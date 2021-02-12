/**
 * Created by user on 2018/11/11/011.
 */
import { IDataVolume, IOptions, IOptionsWithData, IPathLike, IOptionsRequired, IRegExpLike, IOptionsRequiredUser, Overwrite } from './interface';
export declare const defaultOptions: Readonly<IOptions<boolean | IRegExpLike>>;
export declare function makeOptions<O extends IOptions>(inputFile: IPathLike, options: O): O;
export declare function _handleOptions<O extends IOptions | IOptionsRequiredUser>(options: O): Overwrite<O, IOptionsRequired<IRegExpLike>>;
export declare function autoFile<O extends IOptionsRequired | IOptionsRequiredUser>(inputFile: IPathLike, options: O): Promise<{
    options: Overwrite<O, IOptionsRequired<IRegExpLike>>;
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
