"use strict";
/**
 * Created by user on 2018/2/4/004.
 */
const index_1 = require("./index");
/**
 * for old api user
 */
function parse(str, options = {
        oldParseApi: true,
    }) {
    return index_1.default.parse(str, options);
}
module.exports = parse;
