"use strict";
/**
 * Created by user on 2019/1/6/006.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const sort_1 = require("@node-novel/sort");
exports.naturalCompare = sort_1.naturalCompare;
const StrUtil = require("str-util");
const sortObject = require("sort-object-keys2");
let defaultOffset = 8;
function createMoment(...argv) {
    return moment(...argv).utcOffset(defaultOffset);
}
exports.createMoment = createMoment;
const todayMoment = createMoment().startOf('day');
exports.todayMomentTimestamp = todayMoment.valueOf();
exports.todayMomentOffset = todayMoment.utcOffset();
exports.default = exports.todayMomentTimestamp;
function getTodayMomentTimestamp() {
    return todayMoment.valueOf();
}
exports.getTodayMomentTimestamp = getTodayMomentTimestamp;
function refreshTodayMoment() {
    let k = createMoment()
        //.add(7, 'days')
        .startOf('day');
    if (k.valueOf() != todayMoment.valueOf()) {
        todayMoment.set(k.toObject());
        return true;
    }
}
exports.refreshTodayMoment = refreshTodayMoment;
Object.defineProperties(exports, {
    todayMomentTimestamp: {
        get: getTodayMomentTimestamp,
    },
    todayMomentOffset: {
        get() {
            return todayMoment.utcOffset();
        },
    },
});
exports.cacheSortCallback = sort_1.createSortCallback({
    dotNum: true,
    transpileBase(input, isSub) {
        let s = StrUtil.toHalfWidth(input);
        return s;
    },
    toLowerCase: sort_1.EnumToLowerCase.toLocaleLowerCase,
});
function freezeProperty(who, prop, freeze) {
    if (freeze) {
        try {
            // @ts-ignore
            who[prop] = Object.freeze(who[prop]);
        }
        catch (e) {
        }
    }
    Object.defineProperty(who, prop, {
        configurable: false,
        writable: false,
    });
    return who;
}
exports.freezeProperty = freezeProperty;
function baseSortObject(data) {
    return sortObject(data, {
        useSource: true,
        keys: Object.keys(data).sort(),
    });
}
exports.baseSortObject = baseSortObject;
function tryRequireFS() {
    let fs;
    try {
        fs = require('fs-extra');
        return fs;
    }
    catch (e) {
    }
}
exports.tryRequireFS = tryRequireFS;
exports = Object.freeze(exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILGlDQUFrQztBQUNsQywyQ0FBbUg7QUFNMUcseUJBTmlFLHFCQUFjLENBTWpFO0FBTHZCLG9DQUFxQztBQUNyQyxnREFBaUQ7QUFFakQsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBSXRCLFNBQWdCLFlBQVksQ0FBQyxHQUFHLElBQUk7SUFFbkMsT0FBTyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUhELG9DQUdDO0FBRUQsTUFBTSxXQUFXLEdBQUcsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXZDLFFBQUEsb0JBQW9CLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdDLFFBQUEsaUJBQWlCLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBRXZELGtCQUFlLDRCQUFvQixDQUFBO0FBRW5DLFNBQWdCLHVCQUF1QjtJQUV0QyxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBSEQsMERBR0M7QUFFRCxTQUFnQixrQkFBa0I7SUFFakMsSUFBSSxDQUFDLEdBQUcsWUFBWSxFQUFFO1FBQ3JCLGlCQUFpQjtTQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQ2Y7SUFFRCxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQ3hDO1FBQ0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUU5QixPQUFPLElBQUksQ0FBQztLQUNaO0FBQ0YsQ0FBQztBQWJELGdEQWFDO0FBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtJQUNoQyxvQkFBb0IsRUFBRTtRQUNyQixHQUFHLEVBQUUsdUJBQXVCO0tBQzVCO0lBQ0QsaUJBQWlCLEVBQUU7UUFDbEIsR0FBRztZQUVGLE9BQU8sV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLENBQUM7S0FDRDtDQUNELENBQUMsQ0FBQztBQUVVLFFBQUEsaUJBQWlCLEdBQUcseUJBQWtCLENBQUM7SUFDbkQsTUFBTSxFQUFFLElBQUk7SUFDWixhQUFhLENBQUMsS0FBYSxFQUFFLEtBQVc7UUFFdkMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxPQUFPLENBQUMsQ0FBQTtJQUNULENBQUM7SUFDRCxXQUFXLEVBQUUsc0JBQWUsQ0FBQyxpQkFBaUI7Q0FDOUMsQ0FBQyxDQUFDO0FBRUgsU0FBZ0IsY0FBYyxDQUFJLEdBQU0sRUFBRSxJQUFhLEVBQUUsTUFBZ0I7SUFFeEUsSUFBSSxNQUFNLEVBQ1Y7UUFDQyxJQUNBO1lBQ0MsYUFBYTtZQUNiLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsT0FBTyxDQUFDLEVBQ1I7U0FFQztLQUNEO0lBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ2hDLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxLQUFLO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBckJELHdDQXFCQztBQUVELFNBQWdCLGNBQWMsQ0FBSSxJQUFPO0lBRXhDLE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTtRQUN2QixTQUFTLEVBQUUsSUFBSTtRQUNmLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtLQUM5QixDQUFDLENBQUM7QUFDSixDQUFDO0FBTkQsd0NBTUM7QUFFRCxTQUFnQixZQUFZO0lBRTNCLElBQUksRUFBNkIsQ0FBQztJQUVsQyxJQUNBO1FBQ0MsRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6QixPQUFPLEVBQUUsQ0FBQztLQUNWO0lBQ0QsT0FBTyxDQUFDLEVBQ1I7S0FFQztBQUNGLENBQUM7QUFiRCxvQ0FhQztBQUVELE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS8xLzYvMDA2LlxuICovXG5cbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbmltcG9ydCB7IF90cmltLCBjcmVhdGVTb3J0Q2FsbGJhY2ssIGRlZmF1bHRTb3J0Q2FsbGJhY2ssIEVudW1Ub0xvd2VyQ2FzZSwgbmF0dXJhbENvbXBhcmUgfSBmcm9tICdAbm9kZS1ub3ZlbC9zb3J0JztcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCBzb3J0T2JqZWN0ID0gcmVxdWlyZSgnc29ydC1vYmplY3Qta2V5czInKTtcblxubGV0IGRlZmF1bHRPZmZzZXQgPSA4O1xuXG5leHBvcnQgeyBuYXR1cmFsQ29tcGFyZSB9XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb21lbnQoLi4uYXJndilcbntcblx0cmV0dXJuIG1vbWVudCguLi5hcmd2KS51dGNPZmZzZXQoZGVmYXVsdE9mZnNldCk7XG59XG5cbmNvbnN0IHRvZGF5TW9tZW50ID0gY3JlYXRlTW9tZW50KCkuc3RhcnRPZignZGF5Jyk7XG5cbmV4cG9ydCBsZXQgdG9kYXlNb21lbnRUaW1lc3RhbXAgPSB0b2RheU1vbWVudC52YWx1ZU9mKCk7XG5leHBvcnQgbGV0IHRvZGF5TW9tZW50T2Zmc2V0ID0gdG9kYXlNb21lbnQudXRjT2Zmc2V0KCk7XG5cbmV4cG9ydCBkZWZhdWx0IHRvZGF5TW9tZW50VGltZXN0YW1wXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUb2RheU1vbWVudFRpbWVzdGFtcCgpXG57XG5cdHJldHVybiB0b2RheU1vbWVudC52YWx1ZU9mKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZyZXNoVG9kYXlNb21lbnQoKVxue1xuXHRsZXQgayA9IGNyZWF0ZU1vbWVudCgpXG5cdFx0Ly8uYWRkKDcsICdkYXlzJylcblx0XHQuc3RhcnRPZignZGF5Jylcblx0O1xuXG5cdGlmIChrLnZhbHVlT2YoKSAhPSB0b2RheU1vbWVudC52YWx1ZU9mKCkpXG5cdHtcblx0XHR0b2RheU1vbWVudC5zZXQoay50b09iamVjdCgpKTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGV4cG9ydHMsIHtcblx0dG9kYXlNb21lbnRUaW1lc3RhbXA6IHtcblx0XHRnZXQ6IGdldFRvZGF5TW9tZW50VGltZXN0YW1wLFxuXHR9LFxuXHR0b2RheU1vbWVudE9mZnNldDoge1xuXHRcdGdldCgpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRvZGF5TW9tZW50LnV0Y09mZnNldCgpO1xuXHRcdH0sXG5cdH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IGNhY2hlU29ydENhbGxiYWNrID0gY3JlYXRlU29ydENhbGxiYWNrKHtcblx0ZG90TnVtOiB0cnVlLFxuXHR0cmFuc3BpbGVCYXNlKGlucHV0OiBzdHJpbmcsIGlzU3ViPzogYW55KVxuXHR7XG5cdFx0bGV0IHMgPSBTdHJVdGlsLnRvSGFsZldpZHRoKGlucHV0KTtcblx0XHRyZXR1cm4gc1xuXHR9LFxuXHR0b0xvd2VyQ2FzZTogRW51bVRvTG93ZXJDYXNlLnRvTG9jYWxlTG93ZXJDYXNlLFxufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBmcmVlemVQcm9wZXJ0eTxUPih3aG86IFQsIHByb3A6IGtleW9mIFQsIGZyZWV6ZT86IGJvb2xlYW4pXG57XG5cdGlmIChmcmVlemUpXG5cdHtcblx0XHR0cnlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR3aG9bcHJvcF0gPSBPYmplY3QuZnJlZXplKHdob1twcm9wXSk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKVxuXHRcdHtcblxuXHRcdH1cblx0fVxuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3aG8sIHByb3AsIHtcblx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuXHRcdHdyaXRhYmxlOiBmYWxzZSxcblx0fSk7XG5cblx0cmV0dXJuIHdobztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2VTb3J0T2JqZWN0PFQ+KGRhdGE6IFQpOiBUXG57XG5cdHJldHVybiBzb3J0T2JqZWN0KGRhdGEsIHtcblx0XHR1c2VTb3VyY2U6IHRydWUsXG5cdFx0a2V5czogT2JqZWN0LmtleXMoZGF0YSkuc29ydCgpLFxuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyeVJlcXVpcmVGUygpOiB0eXBlb2YgaW1wb3J0KCdmcy1leHRyYScpXG57XG5cdGxldCBmczogdHlwZW9mIGltcG9ydCgnZnMtZXh0cmEnKTtcblxuXHR0cnlcblx0e1xuXHRcdGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcblx0XHRyZXR1cm4gZnM7XG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblxuXHR9XG59XG5cbmV4cG9ydHMgPSBPYmplY3QuZnJlZXplKGV4cG9ydHMpO1xuIl19