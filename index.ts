/**
 * Module dependencies.
 */
import * as md from 'marked';

/**
 * Parse the given `str` of markdown.
 *
 * @param {String | Buffer} str
 * @param {Object} options
 * @return {Object}
 * @api public
 */
function parse(str: string, options?): { [key: string]: any, }
function parse(str: Buffer, options?): { [key: string]: any, }
function parse(str: string | Buffer, options = {}): { [key: string]: any, }
{
	options = options || {};
	let toks = md.lexer(str.toString());
	let conf = {};
	let keys = [];
	let depth = 0;
	let inlist = false;

	toks.forEach(function (tok)
	{
		switch (tok.type)
		{
			case 'heading':
				while (depth-- >= tok.depth) keys.pop();
				keys.push(normalize(tok.text));
				depth = tok.depth;
				break;
			case 'list_item_start':
				inlist = true;
				break;
			case 'list_item_end':
				inlist = false;
				break;
			case 'text':
				put(conf, keys, tok.text);
				break;
			case 'code':
				put(conf, keys, tok.text, true);
				break;
			case 'table':
				put(conf, keys, null, null, { headers: tok.header, rows: tok.cells });
				break;
			default:
				break;
		}
	});

	return conf;
}

export = parse;

/**
 * Add `str` to `obj` with the given `keys`
 * which represents the traversal path.
 *
 * @param {Object} obj
 * @param {Array} keys
 * @param {String} str
 * @param {Object} table
 * @api private
 */
function put(obj, keys, str, code?, table?)
{
	let target = obj;
	let last;
	let key;

	for (let i = 0; i < keys.length; i++)
	{
		key = keys[i];
		last = target;
		target[key] = target[key] || {};
		target = target[key];
	}

	// code
	if (code)
	{
		if (!Array.isArray(last[key])) last[key] = [];
		last[key].push(str);
		return;
	}

	// table
	if (table)
	{
		if (!Array.isArray(last[key])) last[key] = [];
		for (let ri = 0; ri < table.rows.length; ri++)
		{
			let arrItem = {};
			for (let hi = 0; hi < table.headers.length; hi++)
			{
				arrItem[normalize(table.headers[hi])] = table.rows[ri][hi];
			}
			last[key].push(arrItem);
		}
		return;
	}

	let i = str.indexOf(':');

	// list
	if (-1 == i)
	{
		if (!Array.isArray(last[key])) last[key] = [];
		last[key].push(str.trim());
		return;
	}

	// map
	key = normalize(str.slice(0, i));
	let val = str.slice(i + 1).trim();
	target[key] = val;
}

/**
 * Normalize `str`.
 */

function normalize(str)
{
	return str.replace(/\s+/g, ' ').toLowerCase().trim();
}
