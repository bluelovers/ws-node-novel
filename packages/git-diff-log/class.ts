/**
 * Created by user on 2019/6/18.
 */
import { IListFileRow, IListMain, IListMainRow, INovelDiffFromLog } from './index';
import { ArrayUniqueDecorator } from '@lazy-array/array-hyper-unique-decorator';

export class NovelDiffFromLogParser
{
	constructor(public data: INovelDiffFromLog)
	{

	}

	filterPathMains(filter: (pathMain: string, values: IListMainRow) => boolean)
	{
		return this
			.pathMains()
			.filter((pathMain) => filter(pathMain, this.data.list[pathMain]))
			.reduce((a, b) => {
				a[b] = this.data.list[b];
				return a;
			}, {} as IListMain)
		;
	}

	/**
	 * 回傳所有 pathMain 列表
	 */
	@ArrayUniqueDecorator()
	pathMains()
	{
		return Object.keys(this.data.list);
	}

	/**
	 * 回傳所有 novelID 列表
	 */
	@ArrayUniqueDecorator()
	novelIDs()
	{
		return NovelDiffFromLogParser.novelIDs(this.data.list)
	}

	/**
	 * 回傳所有檔案列表
	 */
	@ArrayUniqueDecorator()
	files(filter?: (value: IListFileRow) => boolean)
	{
		return NovelDiffFromLogParser.files(this.data.list, filter)
	}

	@ArrayUniqueDecorator()
	static novelIDs(list: INovelDiffFromLog["list"])
	{
		return Object.values(list)
			.reduce((a, b) => {
				a.push(...Object.keys(b));
				return a;
			}, [] as string[])
	}

	static filterFiles(list: IListFileRow[], filter: (value: IListFileRow) => boolean)
	{
		return list.filter(filter)
	}

	@ArrayUniqueDecorator()
	static files(list: INovelDiffFromLog["list"], filter?: (value: IListFileRow) => boolean)
	{
		let ls = Object.values(list)
			.reduce((ls, listTop) => {

				Object.values(listTop)
					.forEach(ls2 => {
						ls2.forEach(v => ls.push(v))
					})
				;

				return ls;
			}, [] as IListFileRow[]);

		if (filter)
		{
			return NovelDiffFromLogParser.filterFiles(ls, filter)
		}

		return ls;
	}
}

export default NovelDiffFromLogParser
