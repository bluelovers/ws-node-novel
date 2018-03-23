/**
 * Created by user on 2018/2/4/004.
 */

import mdconf from './core';
/**
 * for old api user
 */
function parse(str, options: mdconf.IOptionsParse = {
	oldParseApi: true,
})
{
	return mdconf.parse(str, options);
}

const _s = parse as typeof mdconf.parse & {
	default: typeof mdconf.parse,
	parse: typeof mdconf.parse,
};

_s.default = _s.parse = parse;


export = _s;
