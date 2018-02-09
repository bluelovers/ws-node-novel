"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./text"));
const text_1 = require("./text");
exports.novelText = text_1.enspace.create();
exports.default = exports.novelText;
