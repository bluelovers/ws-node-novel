import novelText from 'novel-text';
import { console } from './console';
import { makeOptions } from './index';
import { IContext, IDataVolume, IOptions, IOptionsWithData, IPathLike, Resolvable } from './interface';
import Bluebird from 'bluebird';
import { encode, detect } from 'iconv-jschardet';
import { zh2num } from 'str-util';
import { crlf, LF } from 'crlf-normalize';
import { zh2jp } from 'cjk-conv/lib/jp';

export function logWarn(...argv)
{
	return console.warn(...argv)
}

export function chkEncoding<O extends IOptions>(data: IContext, file?: string, options?: O)
{
	let chk = detect(data);

	if (data.length === 0)
	{
		logWarn(file, '此檔案沒有內容');
	}
	else if (chk.encoding !== 'UTF-8')
	{
		logWarn(file, '此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk);
	}

	return chk
}

export function padIndex(n: number | string, maxLength: number = 5, fillString: string | number = '0')
{
	let s = padIndexStart(n, maxLength - 1, fillString);

	return padIndexEnd(s, maxLength, fillString);
}

export function padIndexStart(n: number | string, maxLength: number = 4, fillString: string | number = '0')
{
	if (!['number', 'string'].includes(typeof n))
	{
		throw TypeError(`n must is string | number`)
	}

	return String(n).padStart(maxLength, String(fillString))
}

export function padIndexEnd(n: number | string, maxLength: number = 5, fillString: string | number = '0')
{
	if (!['number', 'string'].includes(typeof n))
	{
		throw TypeError(`n must is string | number`)
	}

	return String(n).padEnd(maxLength, String(fillString))
}

export function _wrapMethod<R, F extends (...args: unknown[]) => Resolvable<R>>(fn: F): (...args: Parameters<F>) => Bluebird<R>
{
	return Bluebird.method(fn)
}

export function _handleReadFile<O extends IOptions>(data: IContext, file: IPathLike, options?: O)
{
	let chk = chkEncoding(data, file, options);

	let txt: string;

	if (options && options.autoFsIconv && chk.encoding !== 'UTF-8')
	{
		logWarn('嘗試自動將內容轉換為 UTF-8', chk);

		let buf = encode(data);

		let bool = buf.equals((Buffer.isBuffer(data) ? data : Buffer.from(data)));

		if (bool)
		{
			let chk2 = detect(buf);

			logWarn(`內容變更`, chk, '=>', chk2);

			data = buf;
		}
		else
		{
			logWarn(`內容無變化`);
		}
	}

	txt = String(data);

	return crlf(novelText.trim(txt), LF)
}

export function _outputFile<O extends Partial<IOptionsWithData>>(data: IDataVolume | IOptionsWithData, options?: O): {
	data: IDataVolume,
	options: O,
}
{
	if (data.data)
	{
		options = Object.assign({}, data.options, options);
		data = (data as IOptionsWithData).data;
	}

	options = makeOptions(options.file, options);

	return { data, options }
}

export function fix_name(name: string): string
{
	name = novelText.trim(name, {
		trim: true,
	}).trim()
	//.replace('章', '話')
	;

	if (!/^\d+/.test(name))
	{
		name = zh2num(name).toString();
	}

	name = name
	//.replace(/^(\d+)[\-話话\s]*/, '$1　')
		.replace(/[“”]/g, '')
	;

	name = zh2jp(name);

	//console.log([name]);

	return name;
}
