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
    if (pathMain != null) {
        let _m = pathMain.match(/^(.+?)(_out)?$/);
        is_out = !!_m[2];
        pathMain_base = _m[1];
    }
    return {
        is_out,
        pathMain_base,
    };
}
exports.parsePathMainBase = parsePathMainBase;
exports = Object.freeze(exports);
//# sourceMappingURL=util.js.map