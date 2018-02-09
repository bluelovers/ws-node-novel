"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./text"));
const StrUtil = require("str-util");
exports.StrUtil = StrUtil;
const text_1 = require("./text");
const tieba_harmony_1 = require("tieba-harmony");
exports.tiebaHarmony = tieba_harmony_1.default;
const blank_line_1 = require("blank-line");
exports.chkBlankLine = blank_line_1.default;
exports.novelText = text_1.enspace.create();
exports.default = exports.novelText;
