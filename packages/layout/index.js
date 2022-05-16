"use strict";
/**
 * Created by user on 2019/5/29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.novelText = exports.textLayout = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./lib"), exports);
const lib_1 = require("./lib");
/**
 * 預設的 排版處理核心 如需要自訂預設值 可以 使用 `TextLayout.create(options)`
 *
 * @type {TextLayout}
 */
exports.textLayout = (0, lib_1.create)();
exports.novelText = exports.textLayout;
exports.default = exports.textLayout;
//# sourceMappingURL=index.js.map