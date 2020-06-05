"use strict";
/**
 * Created by user on 2018/2/9/009.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.novelText = exports.tiebaHarmony = exports.chkBlankLine = exports.StrUtil = void 0;
__exportStar(require("./text"), exports);
const str_util_1 = __importDefault(require("str-util"));
exports.StrUtil = str_util_1.default;
const text_1 = require("./text");
const tieba_harmony_1 = __importDefault(require("tieba-harmony"));
exports.tiebaHarmony = tieba_harmony_1.default;
const blank_line_1 = __importDefault(require("blank-line"));
exports.chkBlankLine = blank_line_1.default;
exports.novelText = text_1.enspace.create();
exports.default = exports.novelText;
//# sourceMappingURL=index.js.map