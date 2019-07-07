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
function parsePathMainBase(pathMain) {
    let is_out = null;
    let pathMain_base = undefined;
    let pathMain_out = undefined;
    if (pathMain != null) {
        let _m = pathMain.match(/^(.+?)(_out)?$/);
        is_out = !!_m[2];
        pathMain_base = _m[1];
        pathMain_out = pathMain_base + '_out';
    }
    return {
        is_out,
        pathMain_base,
        pathMain_out,
    };
}
exports.parsePathMainBase = parsePathMainBase;
exports = Object.freeze(exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILGlDQUFrQztBQUNsQywyQ0FBbUg7QUFNMUcseUJBTmlFLHFCQUFjLENBTWpFO0FBTHZCLG9DQUFxQztBQUNyQyxnREFBaUQ7QUFFakQsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBSXRCLFNBQWdCLFlBQVksQ0FBQyxHQUFHLElBQUk7SUFFbkMsT0FBTyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQUhELG9DQUdDO0FBRUQsTUFBTSxXQUFXLEdBQUcsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRXZDLFFBQUEsb0JBQW9CLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdDLFFBQUEsaUJBQWlCLEdBQUcsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBRXZELGtCQUFlLDRCQUFvQixDQUFBO0FBRW5DLFNBQWdCLHVCQUF1QjtJQUV0QyxPQUFPLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBSEQsMERBR0M7QUFFRCxTQUFnQixrQkFBa0I7SUFFakMsSUFBSSxDQUFDLEdBQUcsWUFBWSxFQUFFO1FBQ3JCLGlCQUFpQjtTQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLENBQ2Y7SUFFRCxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxXQUFXLENBQUMsT0FBTyxFQUFFLEVBQ3hDO1FBQ0MsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUU5QixPQUFPLElBQUksQ0FBQztLQUNaO0FBQ0YsQ0FBQztBQWJELGdEQWFDO0FBRUQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRTtJQUNoQyxvQkFBb0IsRUFBRTtRQUNyQixHQUFHLEVBQUUsdUJBQXVCO0tBQzVCO0lBQ0QsaUJBQWlCLEVBQUU7UUFDbEIsR0FBRztZQUVGLE9BQU8sV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQ2hDLENBQUM7S0FDRDtDQUNELENBQUMsQ0FBQztBQUVVLFFBQUEsaUJBQWlCLEdBQUcseUJBQWtCLENBQUM7SUFDbkQsTUFBTSxFQUFFLElBQUk7SUFDWixhQUFhLENBQUMsS0FBYSxFQUFFLEtBQVc7UUFFdkMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxPQUFPLENBQUMsQ0FBQTtJQUNULENBQUM7SUFDRCxXQUFXLEVBQUUsc0JBQWUsQ0FBQyxpQkFBaUI7Q0FDOUMsQ0FBQyxDQUFDO0FBRUgsU0FBZ0IsY0FBYyxDQUFJLEdBQU0sRUFBRSxJQUFhLEVBQUUsTUFBZ0I7SUFFeEUsSUFBSSxNQUFNLEVBQ1Y7UUFDQyxJQUNBO1lBQ0MsYUFBYTtZQUNiLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ3JDO1FBQ0QsT0FBTyxDQUFDLEVBQ1I7U0FFQztLQUNEO0lBRUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFO1FBQ2hDLFlBQVksRUFBRSxLQUFLO1FBQ25CLFFBQVEsRUFBRSxLQUFLO0tBQ2YsQ0FBQyxDQUFDO0lBRUgsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBckJELHdDQXFCQztBQUVELFNBQWdCLGNBQWMsQ0FBSSxJQUFPO0lBRXhDLE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTtRQUN2QixTQUFTLEVBQUUsSUFBSTtRQUNmLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRTtLQUM5QixDQUFDLENBQUM7QUFDSixDQUFDO0FBTkQsd0NBTUM7QUFFRCxTQUFnQixZQUFZO0lBRTNCLElBQUksRUFBNkIsQ0FBQztJQUVsQyxJQUNBO1FBQ0MsRUFBRSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN6QixPQUFPLEVBQUUsQ0FBQztLQUNWO0lBQ0QsT0FBTyxDQUFDLEVBQ1I7S0FFQztBQUNGLENBQUM7QUFiRCxvQ0FhQztBQUVELFNBQWdCLGlCQUFpQixDQUFDLFFBQWdCO0lBRWpELElBQUksTUFBTSxHQUFZLElBQUksQ0FBQztJQUMzQixJQUFJLGFBQWEsR0FBVyxTQUFTLENBQUM7SUFDdEMsSUFBSSxZQUFZLEdBQVcsU0FBUyxDQUFDO0lBRXJDLElBQUksUUFBUSxJQUFJLElBQUksRUFDcEI7UUFDQyxJQUFJLEVBQUUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFMUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakIsYUFBYSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixZQUFZLEdBQUcsYUFBYSxHQUFHLE1BQU0sQ0FBQztLQUN0QztJQUVELE9BQU87UUFDTixNQUFNO1FBQ04sYUFBYTtRQUNiLFlBQVk7S0FDWixDQUFBO0FBQ0YsQ0FBQztBQXBCRCw4Q0FvQkM7QUFFRCxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMS82LzAwNi5cbiAqL1xuXG5pbXBvcnQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5pbXBvcnQgeyBfdHJpbSwgY3JlYXRlU29ydENhbGxiYWNrLCBkZWZhdWx0U29ydENhbGxiYWNrLCBFbnVtVG9Mb3dlckNhc2UsIG5hdHVyYWxDb21wYXJlIH0gZnJvbSAnQG5vZGUtbm92ZWwvc29ydCc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5pbXBvcnQgc29ydE9iamVjdCA9IHJlcXVpcmUoJ3NvcnQtb2JqZWN0LWtleXMyJyk7XG5cbmxldCBkZWZhdWx0T2Zmc2V0ID0gODtcblxuZXhwb3J0IHsgbmF0dXJhbENvbXBhcmUgfVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9tZW50KC4uLmFyZ3YpXG57XG5cdHJldHVybiBtb21lbnQoLi4uYXJndikudXRjT2Zmc2V0KGRlZmF1bHRPZmZzZXQpO1xufVxuXG5jb25zdCB0b2RheU1vbWVudCA9IGNyZWF0ZU1vbWVudCgpLnN0YXJ0T2YoJ2RheScpO1xuXG5leHBvcnQgbGV0IHRvZGF5TW9tZW50VGltZXN0YW1wID0gdG9kYXlNb21lbnQudmFsdWVPZigpO1xuZXhwb3J0IGxldCB0b2RheU1vbWVudE9mZnNldCA9IHRvZGF5TW9tZW50LnV0Y09mZnNldCgpO1xuXG5leHBvcnQgZGVmYXVsdCB0b2RheU1vbWVudFRpbWVzdGFtcFxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VG9kYXlNb21lbnRUaW1lc3RhbXAoKVxue1xuXHRyZXR1cm4gdG9kYXlNb21lbnQudmFsdWVPZigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaFRvZGF5TW9tZW50KClcbntcblx0bGV0IGsgPSBjcmVhdGVNb21lbnQoKVxuXHRcdC8vLmFkZCg3LCAnZGF5cycpXG5cdFx0LnN0YXJ0T2YoJ2RheScpXG5cdDtcblxuXHRpZiAoay52YWx1ZU9mKCkgIT0gdG9kYXlNb21lbnQudmFsdWVPZigpKVxuXHR7XG5cdFx0dG9kYXlNb21lbnQuc2V0KGsudG9PYmplY3QoKSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhleHBvcnRzLCB7XG5cdHRvZGF5TW9tZW50VGltZXN0YW1wOiB7XG5cdFx0Z2V0OiBnZXRUb2RheU1vbWVudFRpbWVzdGFtcCxcblx0fSxcblx0dG9kYXlNb21lbnRPZmZzZXQ6IHtcblx0XHRnZXQoKVxuXHRcdHtcblx0XHRcdHJldHVybiB0b2RheU1vbWVudC51dGNPZmZzZXQoKTtcblx0XHR9LFxuXHR9LFxufSk7XG5cbmV4cG9ydCBjb25zdCBjYWNoZVNvcnRDYWxsYmFjayA9IGNyZWF0ZVNvcnRDYWxsYmFjayh7XG5cdGRvdE51bTogdHJ1ZSxcblx0dHJhbnNwaWxlQmFzZShpbnB1dDogc3RyaW5nLCBpc1N1Yj86IGFueSlcblx0e1xuXHRcdGxldCBzID0gU3RyVXRpbC50b0hhbGZXaWR0aChpbnB1dCk7XG5cdFx0cmV0dXJuIHNcblx0fSxcblx0dG9Mb3dlckNhc2U6IEVudW1Ub0xvd2VyQ2FzZS50b0xvY2FsZUxvd2VyQ2FzZSxcbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gZnJlZXplUHJvcGVydHk8VD4od2hvOiBULCBwcm9wOiBrZXlvZiBULCBmcmVlemU/OiBib29sZWFuKVxue1xuXHRpZiAoZnJlZXplKVxuXHR7XG5cdFx0dHJ5XG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0d2hvW3Byb3BdID0gT2JqZWN0LmZyZWV6ZSh3aG9bcHJvcF0pO1xuXHRcdH1cblx0XHRjYXRjaCAoZSlcblx0XHR7XG5cblx0XHR9XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkod2hvLCBwcm9wLCB7XG5cdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcblx0XHR3cml0YWJsZTogZmFsc2UsXG5cdH0pO1xuXG5cdHJldHVybiB3aG87XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBiYXNlU29ydE9iamVjdDxUPihkYXRhOiBUKTogVFxue1xuXHRyZXR1cm4gc29ydE9iamVjdChkYXRhLCB7XG5cdFx0dXNlU291cmNlOiB0cnVlLFxuXHRcdGtleXM6IE9iamVjdC5rZXlzKGRhdGEpLnNvcnQoKSxcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnlSZXF1aXJlRlMoKTogdHlwZW9mIGltcG9ydCgnZnMtZXh0cmEnKVxue1xuXHRsZXQgZnM6IHR5cGVvZiBpbXBvcnQoJ2ZzLWV4dHJhJyk7XG5cblx0dHJ5XG5cdHtcblx0XHRmcyA9IHJlcXVpcmUoJ2ZzLWV4dHJhJyk7XG5cdFx0cmV0dXJuIGZzO1xuXHR9XG5cdGNhdGNoIChlKVxuXHR7XG5cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQYXRoTWFpbkJhc2UocGF0aE1haW46IHN0cmluZylcbntcblx0bGV0IGlzX291dDogYm9vbGVhbiA9IG51bGw7XG5cdGxldCBwYXRoTWFpbl9iYXNlOiBzdHJpbmcgPSB1bmRlZmluZWQ7XG5cdGxldCBwYXRoTWFpbl9vdXQ6IHN0cmluZyA9IHVuZGVmaW5lZDtcblxuXHRpZiAocGF0aE1haW4gIT0gbnVsbClcblx0e1xuXHRcdGxldCBfbSA9IHBhdGhNYWluLm1hdGNoKC9eKC4rPykoX291dCk/JC8pO1xuXG5cdFx0aXNfb3V0ID0gISFfbVsyXTtcblx0XHRwYXRoTWFpbl9iYXNlID0gX21bMV07XG5cdFx0cGF0aE1haW5fb3V0ID0gcGF0aE1haW5fYmFzZSArICdfb3V0Jztcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0aXNfb3V0LFxuXHRcdHBhdGhNYWluX2Jhc2UsXG5cdFx0cGF0aE1haW5fb3V0LFxuXHR9XG59XG5cbmV4cG9ydHMgPSBPYmplY3QuZnJlZXplKGV4cG9ydHMpO1xuIl19