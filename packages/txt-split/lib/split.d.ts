import { IContext, IDataChapter, IDataVolume, ISplitCache, ISplitMatch, ISplitOption } from './interface';
export declare function splitVolumeSync<O extends Partial<ISplitCache>>(txt: IContext, cache: O): IDataVolume;
export declare function splitChapterSync<O extends Partial<ISplitCache>>(txt: IContext, cache: O, _m: ISplitMatch, splitOption: ISplitOption): IDataChapter<string>;
