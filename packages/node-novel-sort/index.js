"use strict";
/**
 * Created by user on 2018/2/12/012.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const naturalCompare = require("string-natural-compare");
exports.naturalCompare = naturalCompare;
var EnumToLowerCase;
(function (EnumToLowerCase) {
    EnumToLowerCase[EnumToLowerCase["toLowerCase"] = 1] = "toLowerCase";
    EnumToLowerCase[EnumToLowerCase["toLocaleLowerCase"] = 2] = "toLocaleLowerCase";
})(EnumToLowerCase = exports.EnumToLowerCase || (exports.EnumToLowerCase = {}));
/**
 * create a compare callback by (transpileBase value) -> trigger(transpile value) -> failbackSort
 * @param options
 */
function createSortCallback(options = {}) {
    const r = options.dotNum ? /^(\d+(?:\.\d+)?)/ : /^(\d+)/;
    const failbackSort = options.failbackSort || naturalCompare;
    const trigger = options.trigger || _match;
    let transpile = options.transpile || _trim;
    let transpileBase = options.transpileBase;
    if (options.toLowerCase) {
        let fnLowerCase;
        if (typeof options.toLowerCase === 'function') {
            fnLowerCase = options.toLowerCase;
        }
        else {
            let fn = 'toLowerCase';
            if (typeof options.toLowerCase === 'number') {
                if (options.toLowerCase !== EnumToLowerCase.toLowerCase) {
                    fn = 'toLocaleLowerCase';
                }
            }
            fnLowerCase = (input, ...argv) => input[fn](...argv);
        }
        if (fnLowerCase) {
            if (transpileBase) {
                transpileBase = ((old) => {
                    return function (input, ...argv) {
                        return fnLowerCase(old(input, ...argv), ...argv);
                    };
                })(transpileBase);
            }
            else {
                transpileBase = fnLowerCase;
            }
        }
    }
    let fnSortCallback = function fnSortCallback(a, b, isSub) {
        if (a === b) {
            return 0;
        }
        let ret = trigger(transpile(a, isSub), transpile(b, isSub), {
            r,
            mainFn: fnSortCallback,
            isSub,
        });
        return (typeof ret == 'number') ? ret : failbackSort(a, b);
    };
    if (transpileBase) {
        fnSortCallback = (function (oldFn) {
            return function (a, b, isSub) {
                if (a === b) {
                    return 0;
                }
                if (isSub) {
                    return oldFn(a, b, isSub);
                }
                return oldFn(transpileBase(a), transpileBase(b), isSub);
            };
        })(fnSortCallback);
    }
    else {
        transpileBase = (input) => input;
    }
    fnSortCallback.failbackSort = failbackSort;
    fnSortCallback.trigger = trigger;
    fnSortCallback.transpile = transpile;
    fnSortCallback.transpileBase = transpileBase;
    fnSortCallback.fnSortCallback = fnSortCallback;
    return fnSortCallback;
}
exports.createSortCallback = createSortCallback;
exports.defaultSortCallback = createSortCallback({
    dotNum: true,
});
exports.default = exports.defaultSortCallback;
function _match(a, b, { r, mainFn, }) {
    let ta;
    let tb;
    if ((ta = r.exec(a)) && (tb = r.exec(b))) {
        let r = parseFloat(ta[0]) - parseFloat(tb[0]);
        if (r !== 0) {
            return r;
        }
        let a1 = ta.input.slice(ta[0].length);
        let b1 = tb.input.slice(tb[0].length);
        if (a1 != b1) {
            let i = 0;
            while (typeof a1[i] != 'undefined' && a1[i] === b1[i] && (!/^\d$/.test(b1[i]))) {
                i++;
            }
            a1 = a1.slice(i);
            b1 = b1.slice(i);
        }
        return mainFn(a1, b1, true);
    }
}
exports._match = _match;
function _trim(input) {
    return input
        .replace(/^[_\s]+(\d+)/, '$1')
        .replace(/^\D(\d+)/, '$1')
        .trim();
}
exports._trim = _trim;
// @ts-ignore
exports = Object.freeze(exports);
//# sourceMappingURL=index.js.map