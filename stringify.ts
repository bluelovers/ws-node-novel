/**
 * Created by user on 2018/2/4/004.
 */

import { stringify as _stringify } from './index';

function stringify(...argv: Parameters<typeof _stringify>)
{
	return _stringify(...argv)
}

stringify.default = _stringify;
stringify.stringify = _stringify;

export = stringify;
