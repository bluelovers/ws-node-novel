"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const novel_text_1 = __importDefault(require("novel-text"));
const console_1 = require("./console");
const index_1 = require("./index");
const bluebird_1 = __importDefault(require("bluebird"));
const iconv_jschardet_1 = require("iconv-jschardet");
const str_util_1 = require("str-util");
const crlf_normalize_1 = require("crlf-normalize");
const jp_1 = require("cjk-conv/lib/jp");
function logWarn(...argv) {
    return console_1.console.warn(...argv);
}
exports.logWarn = logWarn;
function chkEncoding(data, file, options) {
    let chk = iconv_jschardet_1.detect(data);
    if (data.length === 0) {
        logWarn(file, '此檔案沒有內容');
    }
    else if (chk.encoding !== 'UTF-8') {
        logWarn(file, '此檔案可能不是 UTF8 請檢查編碼或利用 MadEdit 等工具轉換', chk);
    }
    return chk;
}
exports.chkEncoding = chkEncoding;
function padIndex(n, maxLength = 5, fillString = '0') {
    let s = padIndexStart(n, maxLength - 1, fillString);
    return padIndexEnd(s, maxLength, fillString);
}
exports.padIndex = padIndex;
function padIndexStart(n, maxLength = 4, fillString = '0') {
    if (!['number', 'string'].includes(typeof n)) {
        throw TypeError(`n must is string | number`);
    }
    return String(n).padStart(maxLength, String(fillString));
}
exports.padIndexStart = padIndexStart;
function padIndexEnd(n, maxLength = 5, fillString = '0') {
    if (!['number', 'string'].includes(typeof n)) {
        throw TypeError(`n must is string | number`);
    }
    return String(n).padEnd(maxLength, String(fillString));
}
exports.padIndexEnd = padIndexEnd;
function _wrapMethod(fn) {
    return bluebird_1.default.method(fn);
}
exports._wrapMethod = _wrapMethod;
function _handleReadFile(data, file, options) {
    let chk = chkEncoding(data, file, options);
    let txt;
    if (options && options.autoFsIconv && chk.encoding !== 'UTF-8') {
        logWarn('嘗試自動將內容轉換為 UTF-8', chk);
        let buf = iconv_jschardet_1.encode(data);
        let bool = buf.equals((Buffer.isBuffer(data) ? data : Buffer.from(data)));
        if (bool) {
            let chk2 = iconv_jschardet_1.detect(buf);
            logWarn(`內容變更`, chk, '=>', chk2);
            data = buf;
        }
        else {
            logWarn(`內容無變化`);
        }
    }
    txt = String(data);
    return crlf_normalize_1.crlf(novel_text_1.default.trim(txt), crlf_normalize_1.LF);
}
exports._handleReadFile = _handleReadFile;
function _outputFile(data, options) {
    if (data.data) {
        options = Object.assign({}, data.options, options);
        data = data.data;
    }
    options = index_1.makeOptions(options.file, options);
    return { data, options };
}
exports._outputFile = _outputFile;
function fix_name(name) {
    name = novel_text_1.default.trim(name, {
        trim: true,
    }).trim();
    if (!/^\d+/.test(name)) {
        name = str_util_1.zh2num(name).toString();
    }
    name = name
        //.replace(/^(\d+)[\-話话\s]*/, '$1　')
        .replace(/[“”]/g, '');
    name = jp_1.zh2jp(name);
    //console.log([name]);
    return name;
}
exports.fix_name = fix_name;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw0REFBbUM7QUFDbkMsdUNBQW9DO0FBQ3BDLG1DQUFzQztBQUV0Qyx3REFBZ0M7QUFDaEMscURBQWlEO0FBQ2pELHVDQUFrQztBQUNsQyxtREFBMEM7QUFDMUMsd0NBQXdDO0FBRXhDLFNBQWdCLE9BQU8sQ0FBQyxHQUFHLElBQUk7SUFFOUIsT0FBTyxpQkFBTyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0FBQzdCLENBQUM7QUFIRCwwQkFHQztBQUVELFNBQWdCLFdBQVcsQ0FBcUIsSUFBYyxFQUFFLElBQWEsRUFBRSxPQUFXO0lBRXpGLElBQUksR0FBRyxHQUFHLHdCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFdkIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDckI7UUFDQyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQ3pCO1NBQ0ksSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFDakM7UUFDQyxPQUFPLENBQUMsSUFBSSxFQUFFLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQzFEO0lBRUQsT0FBTyxHQUFHLENBQUE7QUFDWCxDQUFDO0FBZEQsa0NBY0M7QUFFRCxTQUFnQixRQUFRLENBQUMsQ0FBa0IsRUFBRSxZQUFvQixDQUFDLEVBQUUsYUFBOEIsR0FBRztJQUVwRyxJQUFJLENBQUMsR0FBRyxhQUFhLENBQUMsQ0FBQyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFFcEQsT0FBTyxXQUFXLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBTEQsNEJBS0M7QUFFRCxTQUFnQixhQUFhLENBQUMsQ0FBa0IsRUFBRSxZQUFvQixDQUFDLEVBQUUsYUFBOEIsR0FBRztJ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SSxFQUFFLElBQUk7S0FDVixDQUFDLENBQUMsSUFBSSxFQUFFLENBRVI7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDdEI7UUFDQyxJQUFJLEdBQUcsaUJBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUMvQjtJQUVELElBQUksR0FBRyxJQUFJO1FBQ1gsb0NBQW9DO1NBQ2xDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQ3JCO0lBRUQsSUFBSSxHQUFHLFVBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVuQixzQkFBc0I7SUFFdEIsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBdkJELDRCQXVCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBub3ZlbFRleHQgZnJvbSAnbm92ZWwtdGV4dCc7XG5pbXBvcnQgeyBjb25zb2xlIH0gZnJvbSAnLi9jb25zb2xlJztcbmltcG9ydCB7IG1ha2VPcHRpb25zIH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgeyBJQ29udGV4dCwgSURhdGFWb2x1bWUsIElPcHRpb25zLCBJT3B0aW9uc1dpdGhEYXRhLCBJUGF0aExpa2UsIFJlc29sdmFibGUgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHsgZW5jb2RlLCBkZXRlY3QgfSBmcm9tICdpY29udi1qc2NoYXJkZXQnO1xuaW1wb3J0IHsgemgybnVtIH0gZnJvbSAnc3RyLXV0aWwnO1xuaW1wb3J0IHsgY3JsZiwgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyB6aDJqcCB9IGZyb20gJ2Nqay1jb252L2xpYi9qcCc7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dXYXJuKC4uLmFyZ3YpXG57XG5cdHJldHVybiBjb25zb2xlLndhcm4oLi4uYXJndilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoa0VuY29kaW5nPE8gZXh0ZW5kcyBJT3B0aW9ucz4oZGF0YTogSUNvbnRleHQsIGZpbGU/OiBzdHJpbmcsIG9wdGlvbnM/OiBPKVxue1xuXHRsZXQgY2hrID0gZGV0ZWN0KGRhdGEpO1xuXG5cdGlmIChkYXRhLmxlbmd0aCA9PT0gMClcblx0e1xuXHRcdGxvZ1dhcm4oZmlsZSwgJ+atpOaqlOahiOaykuacieWFp+WuuScpO1xuXHR9XG5cdGVsc2UgaWYgKGNoay5lbmNvZGluZyAhPT0gJ1VURi04Jylcblx0e1xuXHRcdGxvZ1dhcm4oZmlsZSwgJ+atpOaqlOahiOWPr+iDveS4jeaYryBVVEY4IOiri+aqouafpee3qOeivOaIluWIqeeUqCBNYWRFZGl0IOetieW3peWFt+i9ieaPmycsIGNoayk7XG5cdH1cblxuXHRyZXR1cm4gY2hrXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWRJbmRleChuOiBudW1iZXIgfCBzdHJpbmcsIG1heExlbmd0aDogbnVtYmVyID0gNSwgZmlsbFN0cmluZzogc3RyaW5nIHwgbnVtYmVyID0gJzAnKVxue1xuXHRsZXQgcyA9IHBhZEluZGV4U3RhcnQobiwgbWF4TGVuZ3RoIC0gMSwgZmlsbFN0cmluZyk7XG5cblx0cmV0dXJuIHBhZEluZGV4RW5kKHMsIG1heExlbmd0aCwgZmlsbFN0cmluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWRJbmRleFN0YXJ0KG46IG51bWJlciB8IHN0cmluZywgbWF4TGVuZ3RoOiBudW1iZXIgPSA0LCBmaWxsU3RyaW5nOiBzdHJpbmcgfCBudW1iZXIgPSAnMCcpXG57XG5cdGlmICghWydudW1iZXInLCAnc3RyaW5nJ10uaW5jbHVkZXModHlwZW9mIG4pKVxuXHR7XG5cdFx0dGhyb3cgVHlwZUVycm9yKGBuIG11c3QgaXMgc3RyaW5nIHwgbnVtYmVyYClcblx0fVxuXG5cdHJldHVybiBTdHJpbmcobikucGFkU3RhcnQobWF4TGVuZ3RoLCBTdHJpbmcoZmlsbFN0cmluZykpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYWRJbmRleEVuZChuOiBudW1iZXIgfCBzdHJpbmcsIG1heExlbmd0aDogbnVtYmVyID0gNSwgZmlsbFN0cmluZzogc3RyaW5nIHwgbnVtYmVyID0gJzAnKVxue1xuXHRpZiAoIVsnbnVtYmVyJywgJ3N0cmluZyddLmluY2x1ZGVzKHR5cGVvZiBuKSlcblx0e1xuXHRcdHRocm93IFR5cGVFcnJvcihgbiBtdXN0IGlzIHN0cmluZyB8IG51bWJlcmApXG5cdH1cblxuXHRyZXR1cm4gU3RyaW5nKG4pLnBhZEVuZChtYXhMZW5ndGgsIFN0cmluZyhmaWxsU3RyaW5nKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF93cmFwTWV0aG9kPFIsIEYgZXh0ZW5kcyAoLi4uYXJnczogdW5rbm93bltdKSA9PiBSZXNvbHZhYmxlPFI+PihmbjogRik6ICguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KSA9PiBCbHVlYmlyZDxSPlxue1xuXHRyZXR1cm4gQmx1ZWJpcmQubWV0aG9kKGZuKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2hhbmRsZVJlYWRGaWxlPE8gZXh0ZW5kcyBJT3B0aW9ucz4oZGF0YTogSUNvbnRleHQsIGZpbGU6IElQYXRoTGlrZSwgb3B0aW9ucz86IE8pXG57XG5cdGxldCBjaGsgPSBjaGtFbmNvZGluZyhkYXRhLCBmaWxlLCBvcHRpb25zKTtcblxuXHRsZXQgdHh0OiBzdHJpbmc7XG5cblx0aWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5hdXRvRnNJY29udiAmJiBjaGsuZW5jb2RpbmcgIT09ICdVVEYtOCcpXG5cdHtcblx0XHRsb2dXYXJuKCflmJfoqaboh6rli5XlsIflhaflrrnovYnmj5vngrogVVRGLTgnLCBjaGspO1xuXG5cdFx0bGV0IGJ1ZiA9IGVuY29kZShkYXRhKTtcblxuXHRcdGxldCBib29sID0gYnVmLmVxdWFscygoQnVmZmVyLmlzQnVmZmVyKGRhdGEpID8gZGF0YSA6IEJ1ZmZlci5mcm9tKGRhdGEpKSk7XG5cblx0XHRpZiAoYm9vbClcblx0XHR7XG5cdFx0XHRsZXQgY2hrMiA9IGRldGVjdChidWYpO1xuXG5cdFx0XHRsb2dXYXJuKGDlhaflrrnorormm7RgLCBjaGssICc9PicsIGNoazIpO1xuXG5cdFx0XHRkYXRhID0gYnVmO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0bG9nV2Fybihg5YWn5a6554Sh6K6K5YyWYCk7XG5cdFx0fVxuXHR9XG5cblx0dHh0ID0gU3RyaW5nKGRhdGEpO1xuXG5cdHJldHVybiBjcmxmKG5vdmVsVGV4dC50cmltKHR4dCksIExGKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX291dHB1dEZpbGU8TyBleHRlbmRzIFBhcnRpYWw8SU9wdGlvbnNXaXRoRGF0YT4+KGRhdGE6IElEYXRhVm9sdW1lIHwgSU9wdGlvbnNXaXRoRGF0YSwgb3B0aW9ucz86IE8pOiB7XG5cdGRhdGE6IElEYXRhVm9sdW1lLFxuXHRvcHRpb25zOiBPLFxufVxue1xuXHRpZiAoZGF0YS5kYXRhKVxuXHR7XG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEub3B0aW9ucywgb3B0aW9ucyk7XG5cdFx0ZGF0YSA9IChkYXRhIGFzIElPcHRpb25zV2l0aERhdGEpLmRhdGE7XG5cdH1cblxuXHRvcHRpb25zID0gbWFrZU9wdGlvbnMob3B0aW9ucy5maWxlLCBvcHRpb25zKTtcblxuXHRyZXR1cm4geyBkYXRhLCBvcHRpb25zIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpeF9uYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZ1xue1xuXHRuYW1lID0gbm92ZWxUZXh0LnRyaW0obmFtZSwge1xuXHRcdHRyaW06IHRydWUsXG5cdH0pLnRyaW0oKVxuXHQvLy5yZXBsYWNlKCfnq6AnLCAn6KmxJylcblx0O1xuXG5cdGlmICghL15cXGQrLy50ZXN0KG5hbWUpKVxuXHR7XG5cdFx0bmFtZSA9IHpoMm51bShuYW1lKS50b1N0cmluZygpO1xuXHR9XG5cblx0bmFtZSA9IG5hbWVcblx0Ly8ucmVwbGFjZSgvXihcXGQrKVtcXC3oqbHor51cXHNdKi8sICckMeOAgCcpXG5cdFx0LnJlcGxhY2UoL1vigJzigJ1dL2csICcnKVxuXHQ7XG5cblx0bmFtZSA9IHpoMmpwKG5hbWUpO1xuXG5cdC8vY29uc29sZS5sb2coW25hbWVdKTtcblxuXHRyZXR1cm4gbmFtZTtcbn1cbiJdfQ==