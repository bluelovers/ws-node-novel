"use strict";
/**
 * Created by user on 2018/2/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalize_val = exports.normalize_strip = void 0;
const tslib_1 = require("tslib");
const str_util_trim_1 = require("@lazy-cjk/str-util-trim");
const zh2num_1 = require("@lazy-cjk/zh2num");
const fullhalf_1 = require("@lazy-cjk/fullhalf");
const normalize_num_1 = require("normalize-num");
const novel_filename_1 = tslib_1.__importDefault(require("@lazy-cjk/novel-filename"));
const zh_slugify_1 = require("@lazy-cjk/zh-slugify");
function normalize_strip(str, isDir) {
    if (isDir) {
        if (/^p?\d{4,}[\s_](.+)(_\(\d+\))$/.exec(str)) {
            str = RegExp.$1;
        }
        else if (/^p?\d{4,}[\s_](.+)(_\(\d+\))?$/.exec(str)) {
            str = RegExp.$1;
        }
    }
    else {
        if (/^\d+_(.+)\.\d+$/.exec(str)) {
            str = RegExp.$1;
        }
        else if (/^c?\d{4,}_(.+)$/.exec(str)) {
            str = RegExp.$1;
        }
    }
    str = (0, str_util_trim_1.trim)(str, '　');
    return str;
}
exports.normalize_strip = normalize_strip;
function normalize_val(str, padNum = 5, options = {}) {
    padNum = padNum || options.padNum;
    //console.log(111, str);
    str = novel_filename_1.default.filename(str);
    if (/^(?:序|プロローグ|Prologue)/i.test(str)) {
        str = '0_' + str;
    }
    str = str.replace(/^(web)版(\d+)/i, '$1$2');
    //str = str.replace(/^[cp](\d{4,}_)/, '$1');
    str = (0, fullhalf_1.toHalfWidth)(str)
        .toLowerCase();
    str = (0, str_util_trim_1.trim)(str, '　');
    str = (0, zh2num_1.zh2num)(str).toString();
    str = (0, zh2num_1.zh2num)(str, {
        truncateOne: 2,
        flags: 'ug',
    }).toString();
    //console.log(str);
    str = (0, normalize_num_1.str2num)(str, {
        all: true,
        roman: options.checkRoman,
    });
    /*
    if (options.checkRoman)
    {
        let m = isRoman(str);

        if (m)
        {
            let n = deromanize(normalizeRoman(m[1]));
            str = n.toString() + str.slice(m[1].length);
            //console.log(m[1], n, str);
        }
    }

    str = circle2num(str);
    */
    str = str.replace(/\d+/g, function ($0) {
        return $0.padStart(padNum, '0');
    });
    str = str
        .replace(/^第+/, '')
        //.replace(/(\d)[章話]/g, '$1_')
        //.replace(/第(\d)/g, '_$1')
        //.replace(/\./g, '_')
        .replace(/[―—－──\-―—─＝=―——─ー─]/g, '_')
        .replace(/[\s　]/g, '_')
        .replace(/[\(\)〔［【《（「『』」》）】〕］〔［〕］]/g, '_')
        .replace(/[·‧・···•・·᛫•․‧∙⋅⸱⸳・ꞏ·‧・···•˙●‧﹒]/g, '_')
        .replace(/[：：︰﹕：︓∶:]/ug, '_')
        .replace(/[・:,]/g, '_')
        .replace(/_+$/g, '')
        .replace(/_+/g, '_');
    /*
    str = zh2jp(cn2tw(str) as string, {
        safe: false,
    });
    */
    /*
    str = zhTable.auto(cn2tw(str, {
        safe: false,
        // @ts-ignore
        greedyTable: true,
    }), {
        safe: false,
        // @ts-ignore
        greedyTable: true,
    })[0];
    */
    str = (0, zh_slugify_1.slugify)(str, true);
    return str;
}
exports.normalize_val = normalize_val;
exports.default = exports;
//# sourceMappingURL=index.js.map