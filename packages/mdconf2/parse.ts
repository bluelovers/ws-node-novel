/**
 * Created by user on 2018/2/4/004.
 */

import { parse as _parse, IOptionsParse } from './core';

/**
 * for old api user
 */
function parse(str, options: IOptionsParse = {
	oldParseApi: true,
})
{
	return _parse(str, options);
}

parse.parse = _parse;
parse.default = _parse;

export = parse;
