"use strict";
/**
 * Created by user on 2019/5/29.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./lib"));
const lib_1 = require("./lib");
/**
 * 預設的 排版處理核心 如需要自訂預設值 可以 使用 `TextLayout.create(options)`
 *
 * @type {TextLayout}
 */
exports.textLayout = lib_1.TextLayout.create();
exports.default = exports.textLayout;
//# sourceMappingURL=index.js.map