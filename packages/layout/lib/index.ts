/**
 * Created by user on 2019/5/29.
 */

import getMinMidMax from 'blank-line';
import crlf, { LF } from 'crlf-normalize';
import { envVal } from 'env-bool';
import { array_unique } from 'array-hyper-unique';
import {
	EnumLF,
	ICacheMap,
	IConstructorOptions,
	IRegExpCallback,
	IReplaceOptions,
	ITextLayoutOptions,
	IToStrOptions, ITrimOptionsUser,
	IWordsAll,
	IWordsParsed,
	IWordsRuntime,
	ICacheMapRow,
} from './types';
import { _isIwordsArray, _isIwordsArray2, _isIwordsUserSp, _handleTextLayout } from './util';
import StrUtil from 'str-util';

export const SP_KEY = "#_@_#";
export const SP_REGEXP = "(?:@|（·?）|-|/|\\(\\)|%|￥|_|\\?|？|\\||#|\\$|[（\\(](?:和谐|河蟹)[\\)）]|（河）（蟹）|[（\\(][河蟹]{1,2}[\\)）]| |\\.|[・·]|\\*|□|圌|[=＝]|\\\\\\\\|\\/\\/|｜)";

/**
 * 排版處理核心
 */
export class TextLayout
{
	public readonly SP_KEY: string = SP_KEY;
	public readonly SP_REGEXP: string = SP_REGEXP;

	protected _RegExpClass: typeof RegExp;

	protected _cache_ = {
		replace: [] as {
			old: string[],
			new: string[],
			data?,
		}[],
		words: new Map() as ICacheMap,
	};

	protected _data_ = {
		m0: /([^a-z0-9\-\.\s])?([a-z0-9\-\.]+(?:[a-z0-9\-\.\s]+[a-z0-9\-\.]+)?)([^a-z0-9\-\.\s])?/uig,
		r1: /[「」①→\'\":\-\+（）╮（╯＿╰）╭\(\)\[\]■【】《》~～“”‘’:：：，*＊@。ω・、。`\u3000─一\d『』◆~、？！\?\!×\.\<\>=…・]/i,

		rtrim: /[ \t\uFEFF\xA0\u3000]+$/,

		words: [] as IWordsRuntime[],
	};
	protected options: IConstructorOptions = null;

	constructor(options?: IConstructorOptions, ...argv)
	{
		let arr: string[] = (options && options.words_block) ? options.words_block.slice() : [];

		if (options)
		{
			if (options.rtrim)
			{
				this._data_.rtrim = options.rtrim;
			}

			if (options.words)
			{
				this._data_.words = options.words;
			}

			if (options.m0)
			{
				this._data_.m0 = options.m0;
			}

			if (options.r1)
			{
				this._data_.r1 = options.r1;
			}

			if (options.SP_KEY)
			{
				this.SP_KEY = options.SP_KEY;
			}

			if (options.SP_REGEXP)
			{
				let v: string | RegExp = options.SP_REGEXP;

				if (v instanceof RegExp)
				{
					v = v.source;
				}

				this.SP_REGEXP = v;
			}

			if (options.RegExpClass)
			{
				this._RegExpClass = options.RegExpClass;
			}
		}

		this.options = options || null;

		this._init(arr);
	}

	public static create(options?: IConstructorOptions, ...argv)
	{
		return new this(options, ...argv);
	}

	protected _init(arr: string[])
	{
		this._data_.words = this._words1(arr, this._data_.words as any);
		this._data_.words = this._words2(this._data_.words as any);
	}

	public get RegExp(): typeof RegExp
	{
		return this._RegExpClass || RegExp;
	}

	/**
	 * 簡易型樣式處理 適用於 屏蔽字或者人名或者因為編碼問題而變成 ? 那些之類的點
	 *
	 * @private
	 */
	_words1(arr: string[], words: IWordsParsed[] = []): IWordsRuntime[]
	{
		const SP_REGEXP = this.SP_REGEXP;
		const RC = this.RegExp;

		array_unique(arr)
			.forEach(function (value)
			{
				let a = value.split('@');

				/*
				_self._data_.words.push({
					s: new RegExp(`(${a[0]})${r}(${a[1]})`, 'g'),
					r: '$1$2',
				});
				*/

				let s = a.join(`)${SP_REGEXP}(`);

				words.push({
					s: new RC(`(${s})`, 'g'),
					r: a.map(function (value, index, array)
					{
						return '$' + (index + 1);
					}).join(''),
				});
			})
		;

		return words;
	}

	/**
	 * 將樣式轉換成實際使用的樣式物件
	 *
	 * @private
	 */
	_words2(words: IWordsAll[]): IWordsRuntime[]
	{
		const SP_REGEXP = this.SP_REGEXP;
		const RC = this.RegExp;

		return words.map(function (value: IWordsAll, index, array)
		{
			// @ts-ignore
			if (value.no_regex)
			{
				return value;
			}

			if (_isIwordsArray(value))
			{
				value = {
					_source: value,

					s: value[0],
					r: value[1],

					flags: value[2],
				} as IWordsParsed;
			}

			if (_isIwordsArray2(value))
			{
				return value[0];
			}
			else if (_isIwordsUserSp(value))
			{
				if (!value._source) value._source = value.s;

				let a = value.s.split(SP_KEY);
				let s = a.join(`)${SP_REGEXP}(`);

				// @ts-ignore
				value.s = new RC(`(${s})`, value.flags ? value.flags : 'g');

				//console.log(value.s);

				if (value.r === null)
				{
					value.r = a.map(function (value, index, array)
					{
						return '$' + (index + 1);
					}).join('');
				}
			}
			else if (typeof value.s == 'string')
			{
				// @ts-ignore
				if (!value._source) value._source = value.s;

				value.s = new RC(value.s, value.flags ? value.flags : 'g');
			}
			else if (typeof value.fn == 'function')
			{
				return value.fn;
			}

			return value as any;
		});
	}

	replace(text, options: IReplaceOptions = {}): string
	{
		if (!text || !/[^\s]/.test(text))
		{
			return text;
		}

		let _self = this;

		let _ret = this.toStr(text)
			.replace(_self._data_.rtrim, '')
		;

		if (options.pad_eng)
		{
			_ret = this.paddingEng(_ret);
		}

		if (options.words)
		{
			_ret = this.replace_words(_ret, _self._data_.words, _self._cache_.words).value;
		}

		return _ret;
	}

	/**
	 * for run rule one by one
	 */
	replace_row(_ret: string, value: IWordsRuntime, cacheMap?: ICacheMap)
	{
		let _new: string;

		if (typeof value == 'function')
		{
			_new = value(_ret, cacheMap);
		}
		else
		{
			let _r = value.s;

			_new = _ret.replace(_r, value.r as IRegExpCallback);
		}

		if (cacheMap && _new !== _ret)
		{
			let myMap = [] as {
				old: string,
				new: string,
			}[];

			if (cacheMap.has(value))
			{
				myMap = cacheMap.get(value);
			}

			myMap.push({
				old: _ret,
				new: _new,
			});

			cacheMap.set(value, myMap);
		}

		return _new;
	}

	replace_words(_ret: string, words: IWordsRuntime[], cacheMap?: ICacheMap | true)
	{
		if (cacheMap)
		{
			if (cacheMap === true)
			{
				cacheMap = new Map();
			}
		}
		else
		{
			cacheMap = null as ICacheMap;
		}

		for (let value of words)
		{
			_ret = this.replace_row(_ret, value, cacheMap);

			if (!/[\S]/.test(_ret))
			{
				break;
			}
		}

		return {
			value: _ret as string,
			cache: cacheMap,
		};
	}

	/**
	 * @deprecated
	 */
	paddingEng(text: string)
	{
		let _self = this;

		return this.toStr(text)
			.replace(_self._data_.m0, function (...argv)
			{
				if (argv[2])
				{
					let old = argv[2];

					if (argv[2].length > 1 && argv[1] && !_self._data_.r1.test(argv[1]))
					{
						argv[2] = ' ' + argv[2];
					}

					if (argv[3] && !_self._data_.r1.test(argv[3]))
					{
						argv[2] = argv[2] + ' ';
					}

					if (old != argv[2])
					{
						_self._cache_.replace.push({
							old,
							new: argv[2],

							data: argv,
						});
					}
					else
					{
						//console.debug([old, argv[2]], argv);
					}

					return (argv[1] || '') + argv[2].replace(/( ){2,}/g, '$1') + (argv[3] || '');
				}

				return argv[0];
			})
			;
	}

	/**
	 * @deprecated
	 */
	clearLF(text: string)
	{
		return this.trim(text)
			.replace(/\n{4,}/g, '\n\n')
			.replace(/\n{3,}/g, '\n\n')
			;
	}

	trim(text: Buffer | string | number, options?: ITrimOptionsUser): string
	{
		if (typeof options == 'boolean')
		{
			options = {
				trim: options,
			}
		}
		else if (typeof options == 'string')
		{
			options = {
				trim: options,
			}
		}

		let ret = this.toStr(text, options)
			.replace(/[ \t\u3000\xA0\u3000]+\n/g, '\n')
			.replace(/^\n+|[\s\u3000\xA0\u3000]+$/g, '')
		;

		if (options)
		{
			if (typeof options.trim == 'string')
			{
				ret = StrUtil.trim(ret, '\u3000' + options.trim);
			}
			else if (options.trim)
			{
				ret = StrUtil.trim(ret, '\u3000');
			}
		}

		return ret;
	}

	/**
	 * 轉換為文字並且標準化
	 */
	toStr(str: Buffer | string | number | unknown, options?: string | IToStrOptions): string
	{
		if (typeof options == 'string')
		{
			options = {
				LF: options,
			};
		}

		options = Object.assign({
			LF: "\n",
			allow_nbsp: false,
			allow_bom: false,
		}, options);

		let ret = crlf(str.toString(), options.LF || LF)
			//.replace(/\r\n|\r(?!\n)|\n/g, options.LF || "\n")
			// http://www.charbase.com/202a-unicode-left-to-right-embedding

			/*
			.replace(/[\u2000-\u200F]/g, '')
			.replace(/[\u2028-\u202F]/g, '')
			.replace(/[\u205F-\u2060]/g, '')
			*/
		;

		ret = StrUtil.normalize(ret, options);

		/*
		if (!options.allow_bom)
		{
			ret = ret.replace(/\uFEFF/g, '');
		}

		if (!options.allow_nbsp)
		{
			ret = ret.replace(/[  \xA0]/g, ' ');
		}
		*/

		return ret;
	}

	fixOptions(options: ITextLayoutOptions)
	{
		Object.entries(options)
			.forEach(([k, v]) => options[k] = envVal(v))
		;

		return options;
	}

	/**
	 * @deprecated
	 */
	reduceLine<T>(html: T, options: ITextLayoutOptions = {})
	{
		options = this.fixOptions(options);

		if (options.allow_lf2)
		{
			return html;
		}

		let old = this.trim(html as any as string, options);

		old = //html
					//.replace(/\r\n|\r(?!\n)/g, "\n")
			old
				.replace(/[ \u3000\t]+\n/g, "\n")
				.replace(/[\s\u3000]+$/g, '')
				.replace(/^[\n \t]+/g, '')
				.replace(/\n{4,}/g, "\n\n\n\n")
		;

		let _html = old;

		if (!_html.match(/[^\n]\n[^\n]/g))
		{
			let [min, mid, max] = getMinMidMax(_html.toString());

			if (min > 2)
			{
				options.allow_lf2 = false;
			}

			if (max >= 3)
			{
				if (min > 2)
				{
					let r = new RegExp(`\\n{${min - 1}}(\\n+)`, 'g');

					_html = _html
					//.replace(/\n{2}(\n*)/g, '$1')
						.replace(r, '$1')
					;
				}

				_html = _html
					.replace(/\n{3,}/g, "\n\n\n")
				//.replace(/\n{2}/g, "\n")
				;
			}

			//console.log(options);

			if (!options.allow_lf2)
			{
				_html = _html
					.replace(/\n\n/g, "\n")
				;
			}

			if (_html != old)
			{
				return _html;
			}
		}

		return html;
	}

	/**
	 * 通用型段落調整
	 *
	 * @returns {string}
	 */
	textlayout(input: any, options: ITextLayoutOptions = {}): string
	{
		options = this.fixOptions(options);

		let html = this.trim(input, options);

		html = html
				.replace(/[ \u3000\t]+\n/g, "\n")
				.replace(/[\s\u3000]+$/g, '')
				.replace(/^[\n \t]+/g, '')
				.replace(/\n{4,}/g, EnumLF.LF4)
		;

		return _handleTextLayout(html, options)
	}

}

export const create = TextLayout.create.bind(TextLayout);

export default TextLayout;
