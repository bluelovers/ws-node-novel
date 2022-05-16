"use strict";
/**
 * Created by user on 2018/2/12/012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSortCallback = exports.naturalCompare = void 0;
const tslib_1 = require("tslib");
const string_natural_compare_1 = tslib_1.__importDefault(require("@bluelovers/string-natural-compare"));
exports.naturalCompare = string_natural_compare_1.default;
const core_1 = require("./lib/core");
tslib_1.__exportStar(require("./lib/core"), exports);
tslib_1.__exportStar(require("./lib/types"), exports);
tslib_1.__exportStar(require("./lib/util"), exports);
exports.defaultSortCallback = (0, core_1.createSortCallback)({
    dotNum: true,
});
exports.default = exports.defaultSortCallback;
//# sourceMappingURL=index.js.map