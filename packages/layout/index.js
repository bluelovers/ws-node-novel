"use strict";
/**
 * Created by user on 2019/5/29.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.novelText = exports.textLayout = void 0;
__exportStar(require("./lib"), exports);
const lib_1 = require("./lib");
/**
 * 預設的 排版處理核心 如需要自訂預設值 可以 使用 `TextLayout.create(options)`
 *
 * @type {TextLayout}
 */
exports.textLayout = lib_1.create();
exports.novelText = exports.textLayout;
exports.default = exports.textLayout;
//# sourceMappingURL=index.js.map