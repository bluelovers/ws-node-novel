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
exports.textLayout = lib_1.create();
/**
 * @deprecated
 */
exports.novelText = exports.textLayout;
exports.default = exports.textLayout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBRUgsMkJBQXNCO0FBQ3RCLCtCQUEyQztBQUczQzs7OztHQUlHO0FBQ1UsUUFBQSxVQUFVLEdBQUcsWUFBTSxFQUFFLENBQUM7QUFFbkM7O0dBRUc7QUFDVSxRQUFBLFNBQVMsR0FBRyxrQkFBVSxDQUFDO0FBRXBDLGtCQUFlLGtCQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMjkuXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9saWInO1xuaW1wb3J0IHsgVGV4dExheW91dCwgY3JlYXRlIH0gZnJvbSAnLi9saWInO1xuZXhwb3J0IHsgSVdvcmRzQWxsLCBJV29yZHNGdW5jdGlvbiwgSVdvcmRzQXJyYXksIElXb3Jkc0FycmF5MiwgSVdvcmRzVXNlciwgSVdvcmRzUnVudGltZSwgSUNvbnN0cnVjdG9yT3B0aW9ucywgSVRleHRMYXlvdXRPcHRpb25zIH0gZnJvbSAnLi9saWIvdHlwZXMnO1xuXG4vKipcbiAqIOmgkOioreeahCDmjpLniYjomZXnkIbmoLjlv4Mg5aaC6ZyA6KaB6Ieq6KiC6aCQ6Kit5YC8IOWPr+S7pSDkvb/nlKggYFRleHRMYXlvdXQuY3JlYXRlKG9wdGlvbnMpYFxuICpcbiAqIEB0eXBlIHtUZXh0TGF5b3V0fVxuICovXG5leHBvcnQgY29uc3QgdGV4dExheW91dCA9IGNyZWF0ZSgpO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBub3ZlbFRleHQgPSB0ZXh0TGF5b3V0O1xuXG5leHBvcnQgZGVmYXVsdCB0ZXh0TGF5b3V0O1xuIl19