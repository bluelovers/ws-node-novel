/**
 * Created by user on 2019/6/18.
 */
import { IListFileRow, IListMain, IListMainRow, INovelDiffFromLog } from './index';
import { array_unique } from 'array-hyper-unique';
import { ITSTypeBuildIn } from 'ts-type'

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
	@ArrayUniqueDecorator
	pathMains()
	{
		return Object.keys(this.data.list);
	}

	/**
	 * 回傳所有 novelID 列表
	 */
	@ArrayUniqueDecorator
	novelIDs()
	{
		return NovelDiffFromLogParser.novelIDs(this.data.list)
	}

	/**
	 * 回傳所有檔案列表
	 */
	@ArrayUniqueDecorator
	files()
	{
		return NovelDiffFromLogParser.files(this.data.list)
	}

	@ArrayUniqueDecorator
	static novelIDs(list: INovelDiffFromLog["list"])
	{
		return Object.values(list)
			.reduce((a, b) => {
				a.push(...Object.keys(b));
				return a;
			}, [] as string[])
	}

	@ArrayUniqueDecorator
	static files(list: INovelDiffFromLog["list"])
	{
		return Object.values(list)
			.reduce((ls, listTop) => {

				Object.values(listTop)
					.forEach(ls2 => {
						ls2.forEach(v => ls.push(v))
					})
				;

				return ls;
			}, [] as IListFileRow[]);
	}
}

export function ArrayUniqueDecorator<T extends Function>(target: object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>)
{
	const old = descriptor.value;

	// @ts-ignore
	descriptor.value = function (...argv)
	{
		return array_unique(old.apply(this, argv))
	}
}

export default NovelDiffFromLogParser
