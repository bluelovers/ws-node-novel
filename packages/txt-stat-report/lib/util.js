"use strict";
/**
 * Created by user on 2019/2/23.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const array_hyper_unique_1 = require("array-hyper-unique");
exports.regexpPunctuation = regexMerge([
    /\p{Punctuation}+/gu,
    /[\u2000-\u206F\u2E00-\u2E7F\uff00-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65\uffe0-\uffef\u2500-\u257f\u2200-\u22ff\u25A0-\u25FF\u2600-\u26F0\u2190-\u21FF\u02b9-\u02df\u02E4-\u02f0\u2580-\u259F]+/ug,
    /[\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F]/gu,
    /[\u00A1-\u00BF\u00D7\u00F7]/gu,
    /[\u2100-\u214F]/gu,
]);
function removePunctuation(input) {
    return input
        .replace(exports.regexpPunctuation, '');
}
exports.removePunctuation = removePunctuation;
function removeSpace(input) {
    return input
        .replace(/\s+/g, function (s) {
        return s.replace(/[^\r\n]+/g, '');
    })
        .replace(/[\xA0 　]+/gu, '');
}
exports.removeSpace = removeSpace;
function removeLine(input) {
    return input
        .replace(/[\r\n]+/gu, '');
}
exports.removeLine = removeLine;
/**
 * 合併多個 regexp 為一個
 */
function regexMerge(list) {
    let source = [];
    let flags = [];
    list.forEach(function (a) {
        source.push(a.source);
        a.flags && flags.push(...a.flags.split(''));
    });
    array_hyper_unique_1.array_unique_overwrite(source);
    array_hyper_unique_1.array_unique_overwrite(flags);
    return new RegExp(source.join('|'), flags.join(''));
}
exports.regexMerge = regexMerge;
function removeBom(input) {
    return input
        .replace(/\uFEFF/gu, '');
}
exports.removeBom = removeBom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJEQUEwRTtBQUU3RCxRQUFBLGlCQUFpQixHQUFHLFVBQVUsQ0FBQztJQUMzQyxvQkFBb0I7SUFDcEIsME1BQTBNO0lBQzFNLDBEQUEwRDtJQUMxRCwrQkFBK0I7SUFDL0IsbUJBQW1CO0NBQ25CLENBQUMsQ0FBQztBQUVILFNBQWdCLGlCQUFpQixDQUFDLEtBQWE7SUFFOUMsT0FBTyxLQUFLO1NBQ1YsT0FBTyxDQUFDLHlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUs5QjtBQUNILENBQUM7QUFURCw4Q0FTQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxLQUFhO0lBRXhDLE9BQU8sS0FBSztTQUNWLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDO1FBRTNCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFDbEMsQ0FBQyxDQUFDO1NBQ0QsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FDMUI7QUFDSCxDQUFDO0FBVEQsa0NBU0M7QUFFRCxTQUFnQixVQUFVLENBQUMsS0FBYTtJQUV2QyxPQUFPLEtBQUs7U0FDVixPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUN4QjtBQUNILENBQUM7QUFMRCxnQ0FLQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFtQixJQUFTO0lBRXJELElBQUksTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUMxQixJQUFJLEtBQUssR0FBYSxFQUFFLENBQUM7SUFFekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFFdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdEIsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3QyxDQUFDLENBQUMsQ0FBQztJQUVILDJDQUFzQixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLDJDQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRTlCLE9BQU8sSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDckQsQ0FBQztBQWhCRCxnQ0FnQkM7QUFFRCxTQUFnQixTQUFTLENBQUMsS0FBYTtJQUV0QyxPQUFPLEtBQUs7U0FDVixPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUN2QjtBQUNILENBQUM7QUFMRCw4QkFLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMi8yMy5cbiAqL1xuXG5pbXBvcnQgeyBhcnJheV91bmlxdWUsIGFycmF5X3VuaXF1ZV9vdmVyd3JpdGUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuXG5leHBvcnQgY29uc3QgcmVnZXhwUHVuY3R1YXRpb24gPSByZWdleE1lcmdlKFtcblx0L1xccHtQdW5jdHVhdGlvbn0rL2d1LFxuXHQvW1xcdTIwMDAtXFx1MjA2RlxcdTJFMDAtXFx1MkU3RlxcdWZmMDAtXFx1ZmYwZlxcdWZmMWEtXFx1ZmYyMFxcdWZmM2ItXFx1ZmY0MFxcdWZmNWItXFx1ZmY2NVxcdWZmZTAtXFx1ZmZlZlxcdTI1MDAtXFx1MjU3ZlxcdTIyMDAtXFx1MjJmZlxcdTI1QTAtXFx1MjVGRlxcdTI2MDAtXFx1MjZGMFxcdTIxOTAtXFx1MjFGRlxcdTAyYjktXFx1MDJkZlxcdTAyRTQtXFx1MDJmMFxcdTI1ODAtXFx1MjU5Rl0rL3VnLFxuXHQvW1xcdTAwMjEtXFx1MDAyRlxcdTAwM0EtXFx1MDA0MFxcdTAwNUItXFx1MDA2MFxcdTAwN0ItXFx1MDA3Rl0vZ3UsXG5cdC9bXFx1MDBBMS1cXHUwMEJGXFx1MDBEN1xcdTAwRjddL2d1LFxuXHQvW1xcdTIxMDAtXFx1MjE0Rl0vZ3UsXG5dKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVB1bmN0dWF0aW9uKGlucHV0OiBzdHJpbmcpXG57XG5cdHJldHVybiBpbnB1dFxuXHRcdC5yZXBsYWNlKHJlZ2V4cFB1bmN0dWF0aW9uLCAnJylcblx0XHQvLy5yZXBsYWNlKC9cXHB7UHVuY3R1YXRpb259Ky9ndSwgJycpXG5cdFx0Ly8ucmVwbGFjZSgvW1xcdTIwMDAtXFx1MjA2RlxcdTJFMDAtXFx1MkU3RlxcdWZmMDAtXFx1ZmYwZlxcdWZmMWEtXFx1ZmYyMFxcdWZmM2ItXFx1ZmY0MFxcdWZmNWItXFx1ZmY2NVxcdWZmZTAtXFx1ZmZlZlxcdTI1MDAtXFx1MjU3ZlxcdTIyMDAtXFx1MjJmZlxcdTI1QTAtXFx1MjVGRlxcdTI2MDAtXFx1MjZGMFxcdTIxOTAtXFx1MjFGRlxcdTAyYjktXFx1MDJkZlxcdTAyRTQtXFx1MDJmMFxcdTI1ODAtXFx1MjU5Rl0vdWcsICcnKVxuXHRcdC8vLnJlcGxhY2UoL1vii69dKy9ndSwgJycpXG5cdFx0Ly8ucmVwbGFjZSgvWychXCIjJCUmKCkqKyxcXC0uXFwvXFxcXDo7PD0+P0BcXFtcXF1eX2B7fH1+wrDihJbDt8OX4oiSwqZdL3VnLCAnJylcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVTcGFjZShpbnB1dDogc3RyaW5nKVxue1xuXHRyZXR1cm4gaW5wdXRcblx0XHQucmVwbGFjZSgvXFxzKy9nLCBmdW5jdGlvbiAocylcblx0XHR7XG5cdFx0XHRyZXR1cm4gcy5yZXBsYWNlKC9bXlxcclxcbl0rL2csICcnKVxuXHRcdH0pXG5cdFx0LnJlcGxhY2UoL1tcXHhBMCDjgIBdKy9ndSwgJycpXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlTGluZShpbnB1dDogc3RyaW5nKVxue1xuXHRyZXR1cm4gaW5wdXRcblx0XHQucmVwbGFjZSgvW1xcclxcbl0rL2d1LCAnJylcblx0XHQ7XG59XG5cbi8qKlxuICog5ZCI5L215aSa5YCLIHJlZ2V4cCDngrrkuIDlgItcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZ2V4TWVyZ2U8VCBleHRlbmRzIFJlZ0V4cD4obGlzdDogVFtdKVxue1xuXHRsZXQgc291cmNlOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgZmxhZ3M6IHN0cmluZ1tdID0gW107XG5cblx0bGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChhKVxuXHR7XG5cdFx0c291cmNlLnB1c2goYS5zb3VyY2UpO1xuXG5cdFx0YS5mbGFncyAmJiBmbGFncy5wdXNoKC4uLmEuZmxhZ3Muc3BsaXQoJycpKTtcblx0fSk7XG5cblx0YXJyYXlfdW5pcXVlX292ZXJ3cml0ZShzb3VyY2UpO1xuXHRhcnJheV91bmlxdWVfb3ZlcndyaXRlKGZsYWdzKTtcblxuXHRyZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2Uuam9pbignfCcpLCBmbGFncy5qb2luKCcnKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVCb20oaW5wdXQ6IHN0cmluZylcbntcblx0cmV0dXJuIGlucHV0XG5cdFx0LnJlcGxhY2UoL1xcdUZFRkYvZ3UsICcnKVxuXHRcdDtcbn1cbiJdfQ==