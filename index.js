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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUlBLDRCQUF1QjtBQUN2QixvQ0FBb0M7QUFLM0IsMEJBQU87QUFKaEIsaUNBQWlDO0FBQ2pDLGlEQUF5QztBQUtoQyx1QkFMRix1QkFBWSxDQUtFO0FBSnJCLDJDQUFzQztBQUc3Qix1QkFIRixvQkFBWSxDQUdFO0FBR1IsUUFBQSxTQUFTLEdBQUcsY0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzFDLGtCQUFlLGlCQUFTLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvOS8wMDkuXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi90ZXh0JztcbmltcG9ydCAqIGFzIFN0clV0aWwgZnJvbSAnc3RyLXV0aWwnO1xuaW1wb3J0IHsgZW5zcGFjZSB9IGZyb20gJy4vdGV4dCc7XG5pbXBvcnQgdGllYmFIYXJtb255IGZyb20gJ3RpZWJhLWhhcm1vbnknO1xuaW1wb3J0IGNoa0JsYW5rTGluZSBmcm9tICdibGFuay1saW5lJztcblxuZXhwb3J0IHsgU3RyVXRpbCB9XG5leHBvcnQgeyBjaGtCbGFua0xpbmUgfVxuZXhwb3J0IHsgdGllYmFIYXJtb255IH1cblxuZXhwb3J0IGNvbnN0IG5vdmVsVGV4dCA9IGVuc3BhY2UuY3JlYXRlKCk7XG5leHBvcnQgZGVmYXVsdCBub3ZlbFRleHQ7XG4iXX0=