"use strict";
/**
 * Created by user on 2020/1/4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fullhalf_1 = require("str-util/lib/fullhalf");
const tags_1 = require("./tags");
function _fixRubyInnerContext(innerContext) {
    let fn = _replaceHtmlTag(($0, $1, $2, $3) => {
        return `<${$1}${$2}>${$3}</${$1}>`;
    });
    return innerContext
        .replace(tags_1.reHtmlRubyRt, fn)
        .replace(tags_1.reHtmlRubyRp, fn);
}
exports._fixRubyInnerContext = _fixRubyInnerContext;
function _replaceHtmlTag(replacer) {
    return ($0, $1, $2, ...argv) => {
        $1 = fullhalf_1.toHalfWidth($1);
        $2 = fullhalf_1.toHalfWidth($2);
        return replacer($0, $1, $2, ...argv);
    };
}
exports._replaceHtmlTag = _replaceHtmlTag;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILG9EQUFvRDtBQUNwRCxpQ0FBb0Q7QUFFcEQsU0FBZ0Isb0JBQW9CLENBQUMsWUFBb0I7SUFFeEQsSUFBSSxFQUFFLEdBQUcsZUFBZSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFFM0MsT0FBTyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFBO0lBQ25DLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxZQUFZO1NBQ2pCLE9BQU8sQ0FBQyxtQkFBWSxFQUFFLEVBQUUsQ0FBQztTQUN6QixPQUFPLENBQUMsbUJBQVksRUFBRSxFQUFFLENBQUMsQ0FDekI7QUFDSCxDQUFDO0FBWEQsb0RBV0M7QUFFRCxTQUFnQixlQUFlLENBQUMsUUFBNEQ7SUFFM0YsT0FBTyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEdBQUcsSUFBYyxFQUFFLEVBQUU7UUFHaEUsRUFBRSxHQUFHLHNCQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckIsRUFBRSxHQUFHLHNCQUFXLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFckIsT0FBTyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQTtJQUNyQyxDQUFDLENBQUE7QUFDRixDQUFDO0FBVkQsMENBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDIwLzEvNC5cbiAqL1xuXG5pbXBvcnQgeyB0b0hhbGZXaWR0aCB9IGZyb20gJ3N0ci11dGlsL2xpYi9mdWxsaGFsZic7XG5pbXBvcnQgeyByZUh0bWxSdWJ5UnQsIHJlSHRtbFJ1YnlScCB9IGZyb20gJy4vdGFncyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBfZml4UnVieUlubmVyQ29udGV4dChpbm5lckNvbnRleHQ6IHN0cmluZylcbntcblx0bGV0IGZuID0gX3JlcGxhY2VIdG1sVGFnKCgkMCwgJDEsICQyLCAkMykgPT5cblx0e1xuXHRcdHJldHVybiBgPCR7JDF9JHskMn0+JHskM308LyR7JDF9PmBcblx0fSk7XG5cblx0cmV0dXJuIGlubmVyQ29udGV4dFxuXHRcdC5yZXBsYWNlKHJlSHRtbFJ1YnlSdCwgZm4pXG5cdFx0LnJlcGxhY2UocmVIdG1sUnVieVJwLCBmbilcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfcmVwbGFjZUh0bWxUYWcocmVwbGFjZXI6ICgoc3Vic3RyaW5nOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSA9PiBzdHJpbmcpKVxue1xuXHRyZXR1cm4gKCQwOiBzdHJpbmcsICQxOiBzdHJpbmcsICQyOiBzdHJpbmcsIC4uLmFyZ3Y6IHN0cmluZ1tdKSA9PlxuXHR7XG5cblx0XHQkMSA9IHRvSGFsZldpZHRoKCQxKTtcblx0XHQkMiA9IHRvSGFsZldpZHRoKCQyKTtcblxuXHRcdHJldHVybiByZXBsYWNlcigkMCwgJDEsICQyLCAuLi5hcmd2KVxuXHR9XG59XG4iXX0=