/**
 * Created by user on 2018/11/11/011.
 */

import { PathLike } from 'fs';
import { Runtime } from 'inspector';
import { URL } from "url";
import { execall } from 'execall2';

export type IPathLike = string
export type IContext = string | Buffer

export interface IOptionsRequired extends IOptions
{
	chapter: ISplitOption,
}

export interface IOptions
{
	file?: IPathLike,
	outDir?: string,

	volume?: ISplitOption,
	chapter?: ISplitOption,

	dirname?: string,
	//ix?: number,

	indexPadLength?: number;

	[key: string]: any,
}

export interface ISplitOption
{
	r: RegExp,
	cb?: ISplitCB,
}

export interface ISplitCache extends IOptions
{
	ix: number,
}

export type ISplitMatch = ReturnType<typeof execall>
export type ISplitMatchItem = ISplitMatch[0]

export interface ISplitCBParameters
{
	i: string,
	id: string,
	name: string,
	m: ISplitMatchItem,
	m_last: ISplitMatchItem,
	_files: IDataChapter,
	ii: string,
	cache: Partial<ISplitCache>,
	idx: number,
}

export interface ISplitCBReturn
{
	id: string,
	name: string,
	idx: number,
}

export interface ISplitCB extends Function
{
	(argv: ISplitCBParameters): ISplitCBReturn | void;
}

export interface IOptionsWithData<T extends IContext = string> extends IOptions
{
	data: IDataVolume<T>,
	options?: IOptionsWithData | IOptions,
}

export interface IDataVolume<T extends IContext = string>
{
	'00000_unknow'?: IDataChapter<T>,
	[dirname: string]: IDataChapter<T>,
}

export interface IDataChapter<T extends IContext = string>
{
	[chapter: string]: T
}

export type Resolvable<R> = R | PromiseLike<R>;

