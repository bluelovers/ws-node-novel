/**
 * Created by user on 2018/2/4/004.
 */

import mdconf from './index';
/**
 * for old api user
 */
function parse(str, options: mdconf.IOptionsParse = {
	oldParseApi: true,
})
{
	return mdconf.parse(str, options);
}
export = parse;
