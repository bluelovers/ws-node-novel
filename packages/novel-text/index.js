"use strict";
/**
 * Created by user on 2018/2/9/009.
 */
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBRUgsNEJBQXVCO0FBQ3ZCLG9DQUFxQztBQUs1QiwwQkFBTztBQUpoQixpQ0FBaUM7QUFDakMsaURBQXlDO0FBS2hDLHVCQUxGLHVCQUFZLENBS0U7QUFKckIsMkNBQXNDO0FBRzdCLHVCQUhGLG9CQUFZLENBR0U7QUFHUixRQUFBLFNBQVMsR0FBRyxjQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDMUMsa0JBQWUsaUJBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMi85LzAwOS5cbiAqL1xuXG5leHBvcnQgKiBmcm9tICcuL3RleHQnO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuaW1wb3J0IHsgZW5zcGFjZSB9IGZyb20gJy4vdGV4dCc7XG5pbXBvcnQgdGllYmFIYXJtb255IGZyb20gJ3RpZWJhLWhhcm1vbnknO1xuaW1wb3J0IGNoa0JsYW5rTGluZSBmcm9tICdibGFuay1saW5lJztcblxuZXhwb3J0IHsgU3RyVXRpbCB9XG5leHBvcnQgeyBjaGtCbGFua0xpbmUgfVxuZXhwb3J0IHsgdGllYmFIYXJtb255IH1cblxuZXhwb3J0IGNvbnN0IG5vdmVsVGV4dCA9IGVuc3BhY2UuY3JlYXRlKCk7XG5leHBvcnQgZGVmYXVsdCBub3ZlbFRleHQ7XG4iXX0=