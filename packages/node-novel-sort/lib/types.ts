/**
 * Created by user on 2020/6/5.
 */

export enum EnumToLowerCase
{
	toLowerCase = 1,
	toLocaleLowerCase = 2,
}

export interface IFnSortCallback
{
	(a: string, b: string, isSub?: boolean): number;

	failbackSort(a, b): number;
	trigger(a: string, b: string, data: ITriggerData): number;
	transpile(input, isSub?, ...argv): string;
	transpileBase(input, isSub?, ...argv): string;
	fnSortCallback(a: string, b: string, isSub?: boolean): number;
}

export type ICreateSortCallbackOptions = {
	dotNum?: boolean,
	/**
	 * will change base input value
	 */
	toLowerCase?: EnumToLowerCase | boolean | ((input, isSub?, ...argv) => string),
} & IFnSortCallbackProp;

export interface IFnSortCallbackProp
{
	/**
	 * failback compare
	 */
	failbackSort?(a, b): number,

	/**
	 * compare transpile value
	 */
	trigger?(a: string, b: string, data: ITriggerData): number,

	/**
	 * will change input value for trigger only
	 */
	transpile?(input, isSub?, ...argv): string,

	/**
	 * will change base input value
	 */
	transpileBase?(input, isSub?, ...argv): string,
}

export interface ITriggerData
{
	r: RegExp,
	mainFn: IFnSortCallback,
	isSub: boolean,
}
