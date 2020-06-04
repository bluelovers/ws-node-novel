"use strict";
/**
 * Created by user on 2019/1/6/006.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePathMainBase = exports.tryRequireFS = exports.baseSortObject = exports.freezeProperty = exports.cacheSortCallback = exports.refreshTodayMoment = exports.getTodayMomentTimestamp = exports.todayMomentOffset = exports.todayMomentTimestamp = exports.createMoment = exports.naturalCompare = void 0;
const moment_1 = __importDefault(require("moment"));
const sort_1 = require("@node-novel/sort");
Object.defineProperty(exports, "naturalCompare", { enumerable: true, get: function () { return sort_1.naturalCompare; } });
const str_util_1 = __importDefault(require("str-util"));
const sort_object_keys2_1 = __importDefault(require("sort-object-keys2"));
let defaultOffset = 8;
function createMoment(...argv) {
    return moment_1.default(...argv).utcOffset(defaultOffset);
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
        let s = str_util_1.default.toHalfWidth(input);
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
    return sort_object_keys2_1.default(data, {
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
//# sourceMappingURL=util.js.map