"use strict";
/**
 * Created by user on 2019/2/23.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uni_string_1 = __importDefault(require("uni-string"));
const crlf_normalize_1 = require("crlf-normalize");
const execall2_1 = require("execall2");
const util_1 = require("./lib/util");
function txtReport(input) {
    let buf_length = Buffer.from(input).length;
    input = crlf_normalize_1.crlf(util_1.removeBom(input), crlf_normalize_1.LF);
    let js_length = input.length;
    let uni_length = uni_string_1.default.size(input);
    let line_length = execall2_1.execall(/\n/g, input).length;
    let no_blank_line_length;
    {
        let s = util_1.removeSpace(input)
            .replace(/\n{2,}/g, '\n')
            .replace(/^\n+|\n+$/g, '');
        no_blank_line_length = execall2_1.execall(/\n/g, s).length;
        if (util_1.removeLine(s).length) {
            no_blank_line_length += 1;
        }
    }
    let hanzi_length = execall2_1.execall(/[\u3400-\u4DBF\u4E00-\u9FFF\u{20000}-\u{2FA1F}]/ug, input).length;
    let ja_length = execall2_1.execall(/[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]/ug, input).length;
    let punctuation_length;
    {
        let s = util_1.removePunctuation(input);
        punctuation_length = js_length - s.length;
    }
    let space_length;
    {
        let s = util_1.removeSpace(input);
        space_length = js_length - s.length;
    }
    return {
        /**
         * buffer
         */
        buf_length,
        /**
         * js string (轉換分行為 LF 之後的長度)
         */
        js_length,
        /**
         * uni-string 一般狀況下會等於 js string
         * 但如果有特殊字元或者 emoji 之類 就會產生差異
         */
        uni_length,
        /**
         * line 斷行
         */
        line_length,
        /**
         * line 斷行 (不包含空白行)
         */
        no_blank_line_length,
        /**
         * 漢字 (包含中文以外的漢字)
         */
        hanzi_length,
        /**
         * hiragana (平假名) + katakana (片假名)
         */
        ja_length,
        /**
         * punctuation 標點符號 與 其他符號
         */
        punctuation_length,
        /**
         * 非斷行以外的空白
         */
        space_length,
    };
}
exports.txtReport = txtReport;
/**
 * 將多個報告總和起來
 */
function txtReportSum(arr) {
    return arr.reduce(function (a, b) {
        Object.entries(b)
            .forEach(function ([k, v]) {
            a[k] = (a[k] || 0) + v;
        });
        return a;
    }, {});
}
exports.txtReportSum = txtReportSum;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBRUgsNERBQWlDO0FBRWpDLG1EQUEwQztBQUMxQyx1Q0FBbUM7QUFDbkMscUNBQW1GO0FBSW5GLFNBQWdCLFNBQVMsQ0FBQyxLQUFhO0lBRXRDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBRTNDLEtBQUssR0FBRyxxQkFBSSxDQUFDLGdCQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsbUJBQUUsQ0FBQyxDQUFDO0lBRW5DLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDN0IsSUFBSSxVQUFVLEdBQUcsb0JBQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFckMsSUFBSSxXQUFXLEdBQUcsa0JBQU8sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBRS9DLElBQUksb0JBQTRCLENBQUM7SUFFakM7UUFDQyxJQUFJLENBQUMsR0FBRyxrQkFBVyxDQUFDLEtBQUssQ0FBQzthQUN4QixPQUFPLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQzthQUN4QixPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUMxQjtRQUVELG9CQUFvQixHQUFHLGtCQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUVoRCxJQUFJLGlCQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUN4QjtZQUNDLG9CQUFvQixJQUFJLENBQUMsQ0FBQztTQUMxQjtLQUNEO0lBRUQsSUFBSSxZQUFZLEdBQUcsa0JBQU8sQ0FBQyxtREFBbUQsRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDOUYsSUFBSSxTQUFTLEdBQUcsa0JBQU8sQ0FBQyw2Q0FBNkMsRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFFckYsSUFBSSxrQkFBMEIsQ0FBQztJQUUvQjtRQUNDLElBQUksQ0FBQyxHQUFHLHdCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWpDLGtCQUFrQixHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0tBQzFDO0lBRUQsSUFBSSxZQUFvQixDQUFDO0lBRXpCO1FBQ0MsSUFBSSxDQUFDLEdBQUcsa0JBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUzQixZQUFZLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDcEM7SUFFRCxPQUFPO1FBQ047O1dBRUc7UUFDSCxVQUFVO1FBRVY7O1dBRUc7UUFDSCxTQUFTO1FBQ1Q7OztXQUdHO1FBQ0gsVUFBVTtRQUNWOztXQUVHO1FBQ0gsV0FBVztRQUVYOztXQUVHO1FBQ0gsb0JBQW9CO1FBRXBCOztXQUVHO1FBQ0gsWUFBWTtRQUNaOztXQUVHO1FBQ0gsU0FBUztRQUVUOztXQUVHO1FBQ0gsa0JBQWtCO1FBRWxCOztXQUVHO1FBQ0gsWUFBWTtLQUNaLENBQUE7QUFDRixDQUFDO0FBMUZELDhCQTBGQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsWUFBWSxDQUF1QixHQUFRO0lBRTFELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBRS9CLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ2YsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRXhCLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQ0Y7UUFFRCxPQUFPLENBQUMsQ0FBQTtJQUNULENBQUMsRUFBRSxFQUFjLENBQUMsQ0FBQTtBQUNuQixDQUFDO0FBYkQsb0NBYUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzIvMjMuXG4gKi9cblxuaW1wb3J0IFVTdHJpbmcgZnJvbSAndW5pLXN0cmluZyc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IHsgY3JsZiwgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBleGVjYWxsIH0gZnJvbSAnZXhlY2FsbDInO1xuaW1wb3J0IHsgcmVtb3ZlQm9tLCByZW1vdmVMaW5lLCByZW1vdmVQdW5jdHVhdGlvbiwgcmVtb3ZlU3BhY2UgfSBmcm9tICcuL2xpYi91dGlsJztcblxuZXhwb3J0IHR5cGUgSVR4dFJlcG9ydCA9IFJldHVyblR5cGU8dHlwZW9mIHR4dFJlcG9ydD47XG5cbmV4cG9ydCBmdW5jdGlvbiB0eHRSZXBvcnQoaW5wdXQ6IHN0cmluZylcbntcblx0bGV0IGJ1Zl9sZW5ndGggPSBCdWZmZXIuZnJvbShpbnB1dCkubGVuZ3RoO1xuXG5cdGlucHV0ID0gY3JsZihyZW1vdmVCb20oaW5wdXQpLCBMRik7XG5cblx0bGV0IGpzX2xlbmd0aCA9IGlucHV0Lmxlbmd0aDtcblx0bGV0IHVuaV9sZW5ndGggPSBVU3RyaW5nLnNpemUoaW5wdXQpO1xuXG5cdGxldCBsaW5lX2xlbmd0aCA9IGV4ZWNhbGwoL1xcbi9nLCBpbnB1dCkubGVuZ3RoO1xuXG5cdGxldCBub19ibGFua19saW5lX2xlbmd0aDogbnVtYmVyO1xuXG5cdHtcblx0XHRsZXQgcyA9IHJlbW92ZVNwYWNlKGlucHV0KVxuXHRcdFx0LnJlcGxhY2UoL1xcbnsyLH0vZywgJ1xcbicpXG5cdFx0XHQucmVwbGFjZSgvXlxcbit8XFxuKyQvZywgJycpXG5cdFx0O1xuXG5cdFx0bm9fYmxhbmtfbGluZV9sZW5ndGggPSBleGVjYWxsKC9cXG4vZywgcykubGVuZ3RoO1xuXG5cdFx0aWYgKHJlbW92ZUxpbmUocykubGVuZ3RoKVxuXHRcdHtcblx0XHRcdG5vX2JsYW5rX2xpbmVfbGVuZ3RoICs9IDE7XG5cdFx0fVxuXHR9XG5cblx0bGV0IGhhbnppX2xlbmd0aCA9IGV4ZWNhbGwoL1tcXHUzNDAwLVxcdTREQkZcXHU0RTAwLVxcdTlGRkZcXHV7MjAwMDB9LVxcdXsyRkExRn1dL3VnLCBpbnB1dCkubGVuZ3RoO1xuXHRsZXQgamFfbGVuZ3RoID0gZXhlY2FsbCgvW1xcdTMwNDAtXFx1MzA5RlxcdTMwQTAtXFx1MzBGRlxcdTMxRjAtXFx1MzFGRl0vdWcsIGlucHV0KS5sZW5ndGg7XG5cblx0bGV0IHB1bmN0dWF0aW9uX2xlbmd0aDogbnVtYmVyO1xuXG5cdHtcblx0XHRsZXQgcyA9IHJlbW92ZVB1bmN0dWF0aW9uKGlucHV0KTtcblxuXHRcdHB1bmN0dWF0aW9uX2xlbmd0aCA9IGpzX2xlbmd0aCAtIHMubGVuZ3RoO1xuXHR9XG5cblx0bGV0IHNwYWNlX2xlbmd0aDogbnVtYmVyO1xuXG5cdHtcblx0XHRsZXQgcyA9IHJlbW92ZVNwYWNlKGlucHV0KTtcblxuXHRcdHNwYWNlX2xlbmd0aCA9IGpzX2xlbmd0aCAtIHMubGVuZ3RoO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHQvKipcblx0XHQgKiBidWZmZXJcblx0XHQgKi9cblx0XHRidWZfbGVuZ3RoLFxuXG5cdFx0LyoqXG5cdFx0ICoganMgc3RyaW5nICjovYnmj5vliIbooYzngrogTEYg5LmL5b6M55qE6ZW35bqmKVxuXHRcdCAqL1xuXHRcdGpzX2xlbmd0aCxcblx0XHQvKipcblx0XHQgKiB1bmktc3RyaW5nIOS4gOiIrOeLgOazgeS4i+acg+etieaWvCBqcyBzdHJpbmdcblx0XHQgKiDkvYblpoLmnpzmnInnibnmrorlrZflhYPmiJbogIUgZW1vamkg5LmL6aGeIOWwseacg+eUoueUn+W3rueVsFxuXHRcdCAqL1xuXHRcdHVuaV9sZW5ndGgsXG5cdFx0LyoqXG5cdFx0ICogbGluZSDmlrfooYxcblx0XHQgKi9cblx0XHRsaW5lX2xlbmd0aCxcblxuXHRcdC8qKlxuXHRcdCAqIGxpbmUg5pa36KGMICjkuI3ljIXlkKvnqbrnmb3ooYwpXG5cdFx0ICovXG5cdFx0bm9fYmxhbmtfbGluZV9sZW5ndGgsXG5cblx0XHQvKipcblx0XHQgKiDmvKLlrZcgKOWMheWQq+S4reaWh+S7peWklueahOa8ouWtlylcblx0XHQgKi9cblx0XHRoYW56aV9sZW5ndGgsXG5cdFx0LyoqXG5cdFx0ICogaGlyYWdhbmEgKOW5s+WBh+WQjSkgKyBrYXRha2FuYSAo54mH5YGH5ZCNKVxuXHRcdCAqL1xuXHRcdGphX2xlbmd0aCxcblxuXHRcdC8qKlxuXHRcdCAqIHB1bmN0dWF0aW9uIOaomem7nuespuiZnyDoiIcg5YW25LuW56ym6JmfXG5cdFx0ICovXG5cdFx0cHVuY3R1YXRpb25fbGVuZ3RoLFxuXG5cdFx0LyoqXG5cdFx0ICog6Z2e5pa36KGM5Lul5aSW55qE56m655m9XG5cdFx0ICovXG5cdFx0c3BhY2VfbGVuZ3RoLFxuXHR9XG59XG5cbi8qKlxuICog5bCH5aSa5YCL5aCx5ZGK57i95ZKM6LW35L6GXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0eHRSZXBvcnRTdW08VCBleHRlbmRzIElUeHRSZXBvcnQ+KGFycjogVFtdKVxue1xuXHRyZXR1cm4gYXJyLnJlZHVjZShmdW5jdGlvbiAoYSwgYilcblx0e1xuXHRcdE9iamVjdC5lbnRyaWVzKGIpXG5cdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW2ssIHZdKVxuXHRcdFx0e1xuXHRcdFx0XHRhW2tdID0gKGFba10gfHwgMCkgKyB2O1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gYVxuXHR9LCB7fSBhcyBhbnkgYXMgVClcbn1cblxuIl19