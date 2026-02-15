/**
 * Module dependencies.
 * 
 * Markdown 配置解析核心模組
 * Markdown Configuration Parsing Core Module
 * 
 * 提供將 Markdown 文件解析為結構化物件，以及將物件轉換回 Markdown 的功能。
 * Provides functionality to parse Markdown files into structured objects and convert objects back to Markdown.
 */
import {
	Token,
	Tokens,
	MarkedOptions,
	Lexer,
	defaults as mdDefaults
} from 'marked';
import { crlf, LF, CRLF, CR, chkcrlf } from 'crlf-normalize';
import { isMoment } from 'moment';
import { isPlainObject } from 'is-plain-object';
import { RawObject, IRawObjectTokenPlus, ITokenText2, IRawObjectPlus, IRawObjectDataPlus } from './lib/RawObject';
import { createInlineLexer, makeCodeBlock, normalize, put, getobjectbyid } from './lib/core';

/**
 * 解析選項介面
 * Parse options interface
 */
export interface IOptionsParse
{
	/**
	 * 換行符類型 (已停用)
	 * Line ending type (deprecated)
	 * @deprecated
	 */
	crlf?: typeof LF | typeof CRLF | typeof CR,

	/**
	 * 是否使用舊版解析 API
	 * Whether to use legacy parse API
	 */
	oldParseApi?: boolean,

	/**
	 * 是否允許區塊引用
	 * Whether to allow blockquotes
	 */
	allowBlockquote?: boolean,

	/**
	 * 是否停用鍵值轉小寫
	 * Whether to disable key conversion to lowercase
	 */
	disableKeyToLowerCase?: boolean,

	/**
	 * Marked 解析器選項
	 * Marked parser options
	 */
	markedOptions?: MarkedOptions,

	/**
	 * 物件鍵值過濾器
	 * Object key filter
	 */
	filterObjectKey?,
}

/**
 * 預設解析選項
 * Default parse options
 */
export const defaultOptionsParse: IOptionsParse = {
	crlf: LF,
	allowBlockquote: true,

	markedOptions: Object.assign({},
		mdDefaults,
		{
			breaks: true,
		},
	),
};

/**
 * 解析結果物件介面
 * Parsed result object interface
 */
export interface IObjectParse
{
	[key: string]: any
}

/**
 * 解析 Markdown 字串
 * Parse Markdown String
 * 
 * 將 Markdown 格式的字串解析為結構化的 JavaScript 物件。
 * Parses a Markdown-formatted string into a structured JavaScript object.
 * 
 * @param {String | Buffer} str - 要解析的 Markdown 內容 / Markdown content to parse
 * @param {IOptionsParse} [options] - 解析選項 / Parse options
 * @returns {IObjectParse} 解析後的物件 / Parsed object
 * @api public
 */
export function parse(str: string, options?: IOptionsParse): IObjectParse
export function parse(str: Buffer, options?: IOptionsParse): IObjectParse
export function parse(str: string | Buffer, options: IOptionsParse = {}): IObjectParse
{
	{
		let markedOptions = Object.assign({}, defaultOptionsParse.markedOptions, options.markedOptions);

		options = Object.assign({}, defaultOptionsParse, options, {
			markedOptions,
		});
	}

	let source: string = str.toString();
	let eol: typeof LF | typeof CRLF | typeof CR;

	if (1)
	{
		// disable crlf options
		eol = LF;
		source = crlf(source, eol);
	}
	/*
	else if (options.crlf)
	{
		eol = options.crlf;
		source = crlf(source, eol);
	}
	else
	{
		let ck = chkcrlf(source);
		eol = ck.lf ? LF : (ck.crlf ? CRLF : CR);
	}
	 */

	let lexer = new Lexer(options.markedOptions);

	let toks = lexer.lex(source);
	let conf = {};
	let keys: string[] = [];
	let depth = 0;
	let inlist = false;

	let paragraph: string[] = [];
	let paragraph2: string[] = [];
	let last_tok: Token;
	let blockquote_start: boolean;

	let inline_lexer = createInlineLexer(toks, Object.assign({}, options, {

	}));

	/*
	let _inline_md = new MarkdownIt({
		linkify: false,
	});
	*/

	(toks as Token[]).forEach(function (tok, index)
	{
		let val: string = (tok as Tokens.Code).text ;
		let _skip: boolean;
		let type: (Token | ITokenText2)["type"] = tok.type;

		if (type == 'text' && val.match(/[a-z]+\:\/\//i))
		{
			let r = inline_lexer.output(val);
			//let r = _inline_md.renderInline(val);

			if (val !== r && /^\s*<a href=/.test(r))
			{
				type = 'text2';
			}
		}

		switch (tok.type)
		{
			case 'heading':
				while (depth-- >= tok.depth) keys.pop();
				keys.push(normalize(tok.text, options));
				depth = tok.depth;

				paragraph = [];

				break;
			case 'list_item_start':
				inlist = true;
				break;
			case 'list_item_end':
				inlist = false;
				break;
				// @ts-ignore
			case 'text2':
			case 'text':
				put(conf, keys, tok.text, undefined, undefined, options, {
					type,
				});
				break;
			case 'blockquote_start':
				blockquote_start = true;

				if (options.allowBlockquote)
				{
					paragraph2 = paragraph;
					paragraph = [];
				}
				else
				{
					_skip = true;
				}

				//console.log(tok);
				break;
			case 'blockquote_end':

				if (options.allowBlockquote && blockquote_start && paragraph.length)
				{
					val = paragraph.join(eol);
					val = val.replace(/\s+$/g, '');

					if (!options.oldParseApi)
					{
						val = new RawObject(val, {
							type: 'blockquote',
							text: paragraph,

							paragraph: paragraph2,
						}) as any;
					}

					put(conf, keys, val, true, undefined, options);

					paragraph = [];
				}
				else
				{
					_skip = true;
				}

				blockquote_start = false;
				break;
			case 'paragraph':
				paragraph.push(tok.text);
				//console.log(tok);
				break;
			case 'code':
				val = val.replace(/\s+$/g, '');

				if (!options.oldParseApi)
				{
					val = new RawObject(val, tok) as any;
					(val as any as IRawObjectPlus).getRawData().paragraph = paragraph;
				}

				put(conf, keys, val, true, undefined, options);
				break;
			case 'table':
				put(conf, keys, null, null, { headers: tok.header, rows: tok.cells }, options);
				break;
			case 'html':
				val = val.replace(/\s+$/g, '');

				if (!options.oldParseApi)
				{
					val = new RawObject(val, tok) as any;
					(val as any as IRawObjectPlus).getRawData().paragraph = paragraph;
				}

				put(conf, keys, val, true, undefined, options);
				break;
			default:
				//console.log(tok);

				_skip = true;

				break;
		}

		if (!_skip && !['paragraph'].includes(tok.type))
		{
			paragraph = [];
		}

		last_tok = tok;
	});

	{
		let parent;
		let parent2 = conf;
		let parent3;

		for (let i in keys)
		{
			let k = keys[i];

			if (/^\d+$/.test(k))
			{
				// @ts-ignore
				let kk = keys[i-1];

				// @ts-ignore
				let parent = getobjectbyid(keys.slice(0, i-1), conf);
				// @ts-ignore
				let obj = getobjectbyid(keys.slice(0, i), conf);

				let ok = true;

				for (let j in obj as object)
				{
					if (!/^\d+$/.test(j))
					{
						ok = false;
						break;
					}
				}

				if (ok)
				{
					parent[kk] = Object.values(obj);
				}
			}

		}
	}

	return conf;
}

/**
 * 將物件轉換為 Markdown 字串
 * Convert Object to Markdown String
 * 
 * 將 JavaScript 物件轉換回 Markdown 格式的字串。
 * Converts a JavaScript object back to a Markdown-formatted string.
 * 
 * @param {unknown | IRawObjectPlus} dataInput - 要轉換的資料 / Data to convert
 * @param {number} [level=1] - 標題層級 / Heading level
 * @param {string[]} [skip=[]] - 要跳過的鍵值 / Keys to skip
 * @param {string} [k] - 當前鍵值 / Current key
 * @returns {string} Markdown 格式字串 / Markdown-formatted string
 */
export function stringify(dataInput: unknown | IRawObjectPlus, level: number = 1, skip = [], k?): string
{
	let rs1: string[] = [];
	let rs2: string[] = [];

	let isRawObject: true | false;
	let data = dataInput;
	let desc;

	if (isRawObject = RawObject.isRawObject(dataInput))
	{
		let rawData = dataInput.getRawData();

		if (rawData.paragraph)
		{
			desc = rawData.paragraph.join(LF.repeat(2));
		}

		data = dataInput.getRawValue();

		isRawObject = true as true;
	}

	//console.log(k);

	if (Array.isArray(data))
	{
		if (k || k === 0)
		{
			rs2.push('#'.repeat(level) + '' + k + LF);

			data.forEach(function (value, index, array)
			{
				let bool = (!RawObject.isRawObject(value) && typeof value == 'object');

				rs2.push(stringify(value, level, [], bool ? index : null));
			})
		}
		else
		{
			data.forEach(function (value, index, array)
			{
				let bool = (!RawObject.isRawObject(value) && typeof value == 'object');

				rs1.push(stringify(value, level, [], bool ? index : null).replace(/\n+$/g, ''));
			});

			//rs1.push('');
		}
	}
	else if (typeof data == 'object')
	{
		if (k || k === 0)
		{
			rs1.push('#'.repeat(level) + ' ' + k + LF);
		}

		for (let k in data)
		{
			if (skip.includes(k))
			{
				continue;
			}

			let isRawObject = RawObject.isRawObject(data[k]);
			let row = isRawObject ? data[k].getRawValue() : data[k];

			if (Array.isArray(row))
			{
				rs2.push('#'.repeat(level) + ' ' + k + LF);
				rs2.push(stringify(row, level + 1));
			}
			else if (isPlainObject(row))
			{
				rs2.push('#'.repeat(level) + ' ' + k + LF);
				rs2.push(stringify(row, level + 1));
			}
			else if (isMoment(row))
			{
				rs1.push(`- ${k}: ${row.format()}`);
			}
			else if (isRawObject || typeof row == 'string' && /[\r\n]|^\s/g.test(row))
			{
				let lang: string;
				let val = row;

				val = val.replace(/^[\r\n]+|\s+$/g, '');

				if (isRawObject)
				{
					let rawData = data[k].getRawData() || {};

					if (rawData.type != 'html')
					{
						lang = rawData.lang;

						val = makeCodeBlock(val, lang);
					}
					else
					{
						val = LF + val + LF;
					}
				}
				else
				{
					val = makeCodeBlock(val, lang);
				}

				rs2.push('#'.repeat(level) + ' ' + k + LF);
				rs2.push(val);
			}
			else
			{
				rs1.push(`- ${k}: ${row}`);
			}
		}
	}
	else if (isRawObject || typeof data == 'string' && /[\r\n]|^\s/g.test(data))
	{
		if (k || k === 0)
		{
			rs2.push('#'.repeat(level) + ' ' + k + LF);
		}

		if (desc)
		{
			rs2.push(desc);
		}

		let val = data as string;

		val = val.replace(/^[\r\n]+|\s+$/g, '');

		if (isRawObject)
		{
			let rawData = (dataInput as IRawObjectPlus).getRawData() || {} as IRawObjectDataPlus;

			if (rawData.type != 'html')
			{
				val = makeCodeBlock(val, rawData.lang);
			}
			else
			{
				val = LF + val + LF;
			}
		}
		else
		{
			val = makeCodeBlock(val);
		}

		rs2.push(val);
	}
	else
	{
		if (desc)
		{
			rs1.push(desc);
		}

		rs1.push(`- ${ k || k === 0 ? k + ': ' : '' }${data}`);
	}

	let out = (rs1.concat([''].concat(rs2)).join(LF)).replace(/^\n+/g, '');

	if (level == 1)
	{
		out = out.replace(/^\n+|\s+$/g, '') + LF;
	}

	return out;
}

export default exports as typeof import('./core');

