"use strict";
/**
 * Created by user on 2018/2/9/009.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.novelText = exports.tiebaHarmony = exports.chkBlankLine = exports.StrUtil = void 0;
const tslib_1 = require("tslib");
(0, tslib_1.__exportStar)(require("./text"), exports);
const str_util_1 = (0, tslib_1.__importDefault)(require("str-util"));
exports.StrUtil = str_util_1.default;
const text_1 = require("./text");
const tieba_harmony_1 = (0, tslib_1.__importDefault)(require("tieba-harmony"));
exports.tiebaHarmony = tieba_harmony_1.default;
const blank_line_1 = (0, tslib_1.__importDefault)(require("blank-line"));
exports.chkBlankLine = blank_line_1.default;
exports.novelText = text_1.enspace.create();
exports.default = exports.novelText;
//# sourceMappingURL=index.js.map