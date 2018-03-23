"use strict";
/**
 * Created by user on 2018/2/4/004.
 */
const core_1 = require("./core");
/**
 * for old api user
 */
function parse(str, options = {
        oldParseApi: true,
    }) {
    return core_1.default.parse(str, options);
}
const _s = parse;
_s.default = _s.parse = parse;
module.exports = _s;
