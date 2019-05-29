import { EnumLF, IRegExpCallback } from '@node-novel/layout/lib/types';

interface IDataRow
{
	[0]: string,
	[1]: string | RegExp | ((input: string, conf: IDataRow) => boolean),
}

const testCaseList = [

	[
		`心情愉快的諾艾爾稍微動了一下之後張開雙眼。\n頓時臉頰紅潤著。\n\n諾艾爾「…那個、早上好。統夜先生」\n統夜「嗯、早安。諾艾爾」\n\n雖說諾艾爾仍舊眷戀著他的身旁，但還是爬起來了。\n原本隔著她輕薄粉色的睡衣傳來的體溫也離去了。`,
		/」\n統/,
	],

].filter(v => v) as unknown as IDataRow[];

export default testCaseList
