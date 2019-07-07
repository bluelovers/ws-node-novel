"use strict";
/**
 * Created by user on 2019/2/23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const UString = require("uni-string");
const crlf_normalize_1 = require("crlf-normalize");
const execall2_1 = require("execall2");
const util_1 = require("./lib/util");
function txtReport(input) {
    let buf_length = Buffer.from(input).length;
    input = crlf_normalize_1.crlf(util_1.removeBom(input), crlf_normalize_1.LF);
    let js_length = input.length;
    let uni_length = UString.size(input);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsc0NBQXVDO0FBRXZDLG1EQUEwQztBQUMxQyx1Q0FBbUM7QUFDbkMscUNBQW1GO0FBSW5GLFNBQWdCLFNBQVMsQ0FBQyxLQUFhO0lBRXRDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBRTNDLEtBQUssR0FBRyxxQkFBSSxDQUFDLGdCQUFTLENBQUMsS0FBSyxDQUFDLEVBQUUsbUJBQUUsQ0FBQyxDQUFDO0lBRW5DLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDN0IsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUVyQyxJQUFJLFdBQVcsR0FBRyxrQkFBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFFL0MsSUFBSSxvQkFBNEIsQ0FBQztJQUVqQztRQUNDLElBQUksQ0FBQyxHQUFHLGtCQUFXLENBQUMsS0FBSyxDQUFDO2FBQ3hCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDO2FBQ3hCLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQzFCO1FBRUQsb0JBQW9CLEdBQUcsa0JBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRWhELElBQUksaUJBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQ3hCO1lBQ0Msb0JBQW9CLElBQUksQ0FBQyxDQUFDO1NBQzFCO0tBQ0Q7SUFFRCxJQUFJLFlBQVksR0FBRyxrQkFBTyxDQUFDLG1EQUFtRCxFQUFFLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUM5RixJQUFJLFNBQVMsR0FBRyxrQkFBTyxDQUFDLDZDQUE2QyxFQUFFLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUVyRixJQUFJLGtCQUEwQixDQUFDO0lBRS9CO1FBQ0MsSUFBSSxDQUFDLEdBQUcsd0JBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFakMsa0JBQWtCLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDMUM7SUFFRCxJQUFJLFlBQW9CLENBQUM7SUFFekI7UUFDQyxJQUFJLENBQUMsR0FBRyxrQkFBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTNCLFlBQVksR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztLQUNwQztJQUVELE9BQU87UUFDTjs7V0FFRztRQUNILFVBQVU7UUFFVjs7V0FFRztRQUNILFNBQVM7UUFDVDs7O1dBR0c7UUFDSCxVQUFVO1FBQ1Y7O1dBRUc7UUFDSCxXQUFXO1FBRVg7O1dBRUc7UUFDSCxvQkFBb0I7UUFFcEI7O1dBRUc7UUFDSCxZQUFZO1FBQ1o7O1dBRUc7UUFDSCxTQUFTO1FBRVQ7O1dBRUc7UUFDSCxrQkFBa0I7UUFFbEI7O1dBRUc7UUFDSCxZQUFZO0tBQ1osQ0FBQTtBQUNGLENBQUM7QUExRkQsOEJBMEZDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixZQUFZLENBQXVCLEdBQVE7SUFFMUQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFFL0IsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7YUFDZixPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFeEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixDQUFDLENBQUMsQ0FDRjtRQUVELE9BQU8sQ0FBQyxDQUFBO0lBQ1QsQ0FBQyxFQUFFLEVBQWMsQ0FBQyxDQUFBO0FBQ25CLENBQUM7QUFiRCxvQ0FhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMi8yMy5cbiAqL1xuXG5pbXBvcnQgVVN0cmluZyA9IHJlcXVpcmUoJ3VuaS1zdHJpbmcnKTtcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgeyBjcmxmLCBMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCB7IGV4ZWNhbGwgfSBmcm9tICdleGVjYWxsMic7XG5pbXBvcnQgeyByZW1vdmVCb20sIHJlbW92ZUxpbmUsIHJlbW92ZVB1bmN0dWF0aW9uLCByZW1vdmVTcGFjZSB9IGZyb20gJy4vbGliL3V0aWwnO1xuXG5leHBvcnQgdHlwZSBJVHh0UmVwb3J0ID0gUmV0dXJuVHlwZTx0eXBlb2YgdHh0UmVwb3J0PjtcblxuZXhwb3J0IGZ1bmN0aW9uIHR4dFJlcG9ydChpbnB1dDogc3RyaW5nKVxue1xuXHRsZXQgYnVmX2xlbmd0aCA9IEJ1ZmZlci5mcm9tKGlucHV0KS5sZW5ndGg7XG5cblx0aW5wdXQgPSBjcmxmKHJlbW92ZUJvbShpbnB1dCksIExGKTtcblxuXHRsZXQganNfbGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXHRsZXQgdW5pX2xlbmd0aCA9IFVTdHJpbmcuc2l6ZShpbnB1dCk7XG5cblx0bGV0IGxpbmVfbGVuZ3RoID0gZXhlY2FsbCgvXFxuL2csIGlucHV0KS5sZW5ndGg7XG5cblx0bGV0IG5vX2JsYW5rX2xpbmVfbGVuZ3RoOiBudW1iZXI7XG5cblx0e1xuXHRcdGxldCBzID0gcmVtb3ZlU3BhY2UoaW5wdXQpXG5cdFx0XHQucmVwbGFjZSgvXFxuezIsfS9nLCAnXFxuJylcblx0XHRcdC5yZXBsYWNlKC9eXFxuK3xcXG4rJC9nLCAnJylcblx0XHQ7XG5cblx0XHRub19ibGFua19saW5lX2xlbmd0aCA9IGV4ZWNhbGwoL1xcbi9nLCBzKS5sZW5ndGg7XG5cblx0XHRpZiAocmVtb3ZlTGluZShzKS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bm9fYmxhbmtfbGluZV9sZW5ndGggKz0gMTtcblx0XHR9XG5cdH1cblxuXHRsZXQgaGFuemlfbGVuZ3RoID0gZXhlY2FsbCgvW1xcdTM0MDAtXFx1NERCRlxcdTRFMDAtXFx1OUZGRlxcdXsyMDAwMH0tXFx1ezJGQTFGfV0vdWcsIGlucHV0KS5sZW5ndGg7XG5cdGxldCBqYV9sZW5ndGggPSBleGVjYWxsKC9bXFx1MzA0MC1cXHUzMDlGXFx1MzBBMC1cXHUzMEZGXFx1MzFGMC1cXHUzMUZGXS91ZywgaW5wdXQpLmxlbmd0aDtcblxuXHRsZXQgcHVuY3R1YXRpb25fbGVuZ3RoOiBudW1iZXI7XG5cblx0e1xuXHRcdGxldCBzID0gcmVtb3ZlUHVuY3R1YXRpb24oaW5wdXQpO1xuXG5cdFx0cHVuY3R1YXRpb25fbGVuZ3RoID0ganNfbGVuZ3RoIC0gcy5sZW5ndGg7XG5cdH1cblxuXHRsZXQgc3BhY2VfbGVuZ3RoOiBudW1iZXI7XG5cblx0e1xuXHRcdGxldCBzID0gcmVtb3ZlU3BhY2UoaW5wdXQpO1xuXG5cdFx0c3BhY2VfbGVuZ3RoID0ganNfbGVuZ3RoIC0gcy5sZW5ndGg7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdC8qKlxuXHRcdCAqIGJ1ZmZlclxuXHRcdCAqL1xuXHRcdGJ1Zl9sZW5ndGgsXG5cblx0XHQvKipcblx0XHQgKiBqcyBzdHJpbmcgKOi9ieaPm+WIhuihjOeCuiBMRiDkuYvlvoznmoTplbfluqYpXG5cdFx0ICovXG5cdFx0anNfbGVuZ3RoLFxuXHRcdC8qKlxuXHRcdCAqIHVuaS1zdHJpbmcg5LiA6Iis54uA5rOB5LiL5pyD562J5pa8IGpzIHN0cmluZ1xuXHRcdCAqIOS9huWmguaenOacieeJueauiuWtl+WFg+aIluiAhSBlbW9qaSDkuYvpoZ4g5bCx5pyD55Si55Sf5beu55WwXG5cdFx0ICovXG5cdFx0dW5pX2xlbmd0aCxcblx0XHQvKipcblx0XHQgKiBsaW5lIOaWt+ihjFxuXHRcdCAqL1xuXHRcdGxpbmVfbGVuZ3RoLFxuXG5cdFx0LyoqXG5cdFx0ICogbGluZSDmlrfooYwgKOS4jeWMheWQq+epuueZveihjClcblx0XHQgKi9cblx0XHRub19ibGFua19saW5lX2xlbmd0aCxcblxuXHRcdC8qKlxuXHRcdCAqIOa8ouWtlyAo5YyF5ZCr5Lit5paH5Lul5aSW55qE5ryi5a2XKVxuXHRcdCAqL1xuXHRcdGhhbnppX2xlbmd0aCxcblx0XHQvKipcblx0XHQgKiBoaXJhZ2FuYSAo5bmz5YGH5ZCNKSArIGthdGFrYW5hICjniYflgYflkI0pXG5cdFx0ICovXG5cdFx0amFfbGVuZ3RoLFxuXG5cdFx0LyoqXG5cdFx0ICogcHVuY3R1YXRpb24g5qiZ6bue56ym6JmfIOiIhyDlhbbku5bnrKbomZ9cblx0XHQgKi9cblx0XHRwdW5jdHVhdGlvbl9sZW5ndGgsXG5cblx0XHQvKipcblx0XHQgKiDpnZ7mlrfooYzku6XlpJbnmoTnqbrnmb1cblx0XHQgKi9cblx0XHRzcGFjZV9sZW5ndGgsXG5cdH1cbn1cblxuLyoqXG4gKiDlsIflpJrlgIvloLHlkYrnuL3lkozotbfkvoZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHR4dFJlcG9ydFN1bTxUIGV4dGVuZHMgSVR4dFJlcG9ydD4oYXJyOiBUW10pXG57XG5cdHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uIChhLCBiKVxuXHR7XG5cdFx0T2JqZWN0LmVudHJpZXMoYilcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChbaywgdl0pXG5cdFx0XHR7XG5cdFx0XHRcdGFba10gPSAoYVtrXSB8fCAwKSArIHY7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiBhXG5cdH0sIHt9IGFzIGFueSBhcyBUKVxufVxuXG4iXX0=