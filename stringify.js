"use strict";
/**
 * Created by user on 2018/2/4/004.
 */
const index_1 = require("./index");
const _s = index_1.stringify;
_s.default = _s.stringify = index_1.stringify;
module.exports = _s;
