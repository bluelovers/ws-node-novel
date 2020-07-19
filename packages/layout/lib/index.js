"use strict";
/**
 * Created by user on 2019/5/29.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.TextLayout = exports.SP_REGEXP = exports.SP_KEY = void 0;
const blank_line_1 = __importDefault(require("blank-line"));
const crlf_normalize_1 = __importStar(require("crlf-normalize"));
const env_bool_1 = require("env-bool");
const array_hyper_unique_1 = require("array-hyper-unique");
const util_1 = require("./util");
const str_util_1 = __importDefault(require("str-util"));
exports.SP_KEY = "#_@_#";
exports.SP_REGEXP = "(?:@|（·?）|-|/|\\(\\)|%|￥|_|\\?|？|\\||#|\\$|[（\\(](?:和谐|河蟹)[\\)）]|（河）（蟹）|[（\\(][河蟹]{1,2}[\\)）]| |\\.|[・·]|\\*|□|圌|[=＝]|\\\\\\\\|\\/\\/|｜)";
/**
 * 排版處理核心
 */
class TextLayout {
    constructor(options, ...argv) {
        this.SP_KEY = exports.SP_KEY;
        this.SP_REGEXP = exports.SP_REGEXP;
        this._cache_ = {
            replace: [],
            words: new Map(),
        };
        this._data_ = {
            m0: /([^a-z0-9\-\.\s])?([a-z0-9\-\.]+(?:[a-z0-9\-\.\s]+[a-z0-9\-\.]+)?)([^a-z0-9\-\.\s])?/uig,
            r1: /[「」①→\'\":\-\+（）╮（╯＿╰）╭\(\)\[\]■【】《》~～“”‘’:：：，*＊@。ω・、。`\u3000─一\d『』◆~、？！\?\!×\.\<\>=…・]/i,
            rtrim: /[ \t\uFEFF\xA0\u3000]+$/,
            words: [],
        };
        this.options = null;
        let arr = (options && options.words_block) ? options.words_block.slice() : [];
        if (options) {
            if (options.rtrim) {
                this._data_.rtrim = options.rtrim;
            }
            if (options.words) {
                this._data_.words = options.words;
            }
            if (options.m0) {
                this._data_.m0 = options.m0;
            }
            if (options.r1) {
                this._data_.r1 = options.r1;
            }
            if (options.SP_KEY) {
                this.SP_KEY = options.SP_KEY;
            }
            if (options.SP_REGEXP) {
                let v = options.SP_REGEXP;
                if (v instanceof RegExp) {
                    v = v.source;
                }
                this.SP_REGEXP = v;
            }
            if (options.RegExpClass) {
                this._RegExpClass = options.RegExpClass;
            }
        }
        this.options = options || null;
        this._init(arr);
    }
    static create(options, ...argv) {
        return new this(options, ...argv);
    }
    _init(arr) {
        this._data_.words = this._words1(arr, this._data_.words);
        this._data_.words = this._words2(this._data_.words);
    }
    get RegExp() {
        return this._RegExpClass || RegExp;
    }
    /**
     * 簡易型樣式處理 適用於 屏蔽字或者人名或者因為編碼問題而變成 ? 那些之類的點
     *
     * @private
     */
    _words1(arr, words = []) {
        const SP_REGEXP = this.SP_REGEXP;
        const RC = this.RegExp;
        array_hyper_unique_1.array_unique(arr)
            .forEach(function (value) {
            let a = value.split('@');
            /*
            _self._data_.words.push({
                s: new RegExp(`(${a[0]})${r}(${a[1]})`, 'g'),
                r: '$1$2',
            });
            */
            let s = a.join(`)${SP_REGEXP}(`);
            words.push({
                s: new RC(`(${s})`, 'g'),
                r: a.map(function (value, index, array) {
                    return '$' + (index + 1);
                }).join(''),
            });
        });
        return words;
    }
    /**
     * 將樣式轉換成實際使用的樣式物件
     *
     * @private
     */
    _words2(words) {
        const SP_REGEXP = this.SP_REGEXP;
        const RC = this.RegExp;
        return words.map(function (value, index, array) {
            // @ts-ignore
            if (value.no_regex) {
                return value;
            }
            if (util_1._isIwordsArray(value)) {
                value = {
                    _source: value,
                    s: value[0],
                    r: value[1],
                    flags: value[2],
                };
            }
            if (util_1._isIwordsArray2(value)) {
                return value[0];
            }
            else if (util_1._isIwordsUserSp(value)) {
                if (!value._source)
                    value._source = value.s;
                let a = value.s.split(exports.SP_KEY);
                let s = a.join(`)${SP_REGEXP}(`);
                // @ts-ignore
                value.s = new RC(`(${s})`, value.flags ? value.flags : 'g');
                //console.log(value.s);
                if (value.r === null) {
                    value.r = a.map(function (value, index, array) {
                        return '$' + (index + 1);
                    }).join('');
                }
            }
            else if (typeof value.s == 'string') {
                // @ts-ignore
                if (!value._source)
                    value._source = value.s;
                value.s = new RC(value.s, value.flags ? value.flags : 'g');
            }
            else if (typeof value.fn == 'function') {
                return value.fn;
            }
            return value;
        });
    }
    replace(text, options = {}) {
        if (!text || !/[^\s]/.test(text)) {
            return text;
        }
        let _self = this;
        let _ret = this.toStr(text)
            .replace(_self._data_.rtrim, '');
        if (options.pad_eng) {
            _ret = this.paddingEng(_ret);
        }
        if (options.words) {
            _ret = this.replace_words(_ret, _self._data_.words, _self._cache_.words).value;
        }
        return _ret;
    }
    /**
     * for run rule one by one
     */
    replace_row(_ret, value, cacheMap) {
        let _new;
        if (typeof value == 'function') {
            _new = value(_ret, cacheMap);
        }
        else {
            let _r = value.s;
            _new = _ret.replace(_r, value.r);
        }
        if (cacheMap && _new !== _ret) {
            let myMap = [];
            if (cacheMap.has(value)) {
                myMap = cacheMap.get(value);
            }
            myMap.push({
                old: _ret,
                new: _new,
            });
            cacheMap.set(value, myMap);
        }
        return _new;
    }
    replace_words(_ret, words, cacheMap) {
        if (cacheMap) {
            if (cacheMap === true) {
                cacheMap = new Map();
            }
        }
        else {
            cacheMap = null;
        }
        for (let value of words) {
            _ret = this.replace_row(_ret, value, cacheMap);
            if (!/[\S]/.test(_ret)) {
                break;
            }
        }
        return {
            value: _ret,
            cache: cacheMap,
        };
    }
    /**
     * @deprecated
     */
    paddingEng(text) {
        let _self = this;
        return this.toStr(text)
            .replace(_self._data_.m0, function (...argv) {
            if (argv[2]) {
                let old = argv[2];
                if (argv[2].length > 1 && argv[1] && !_self._data_.r1.test(argv[1])) {
                    argv[2] = ' ' + argv[2];
                }
                if (argv[3] && !_self._data_.r1.test(argv[3])) {
                    argv[2] = argv[2] + ' ';
                }
                if (old != argv[2]) {
                    _self._cache_.replace.push({
                        old,
                        new: argv[2],
                        data: argv,
                    });
                }
                else {
                    //console.debug([old, argv[2]], argv);
                }
                return (argv[1] || '') + argv[2].replace(/( ){2,}/g, '$1') + (argv[3] || '');
            }
            return argv[0];
        });
    }
    /**
     * @deprecated
     */
    clearLF(text) {
        return this.trim(text)
            .replace(/\n{4,}/g, '\n\n')
            .replace(/\n{3,}/g, '\n\n');
    }
    trim(text, options) {
        if (typeof options == 'boolean') {
            options = {
                trim: options,
            };
        }
        else if (typeof options == 'string') {
            options = {
                trim: options,
            };
        }
        let ret = this.toStr(text, options)
            .replace(/[ \t\u3000\xA0\u3000]+\n/g, '\n')
            .replace(/^\n+|[\s\u3000\xA0\u3000]+$/g, '');
        if (options) {
            if (typeof options.trim == 'string') {
                ret = str_util_1.default.trim(ret, '\u3000' + options.trim);
            }
            else if (options.trim) {
                ret = str_util_1.default.trim(ret, '\u3000');
            }
        }
        return ret;
    }
    /**
     * 轉換為文字並且標準化
     */
    toStr(str, options) {
        if (typeof options == 'string') {
            options = {
                LF: options,
            };
        }
        options = Object.assign({
            LF: "\n",
            allow_nbsp: false,
            allow_bom: false,
        }, options);
        let ret = crlf_normalize_1.default(str.toString(), options.LF || crlf_normalize_1.LF);
        ret = str_util_1.default.normalize(ret, options);
        /*
        if (!options.allow_bom)
        {
            ret = ret.replace(/\uFEFF/g, '');
        }

        if (!options.allow_nbsp)
        {
            ret = ret.replace(/[  \xA0]/g, ' ');
        }
        */
        return ret;
    }
    fixOptions(options) {
        Object.entries(options)
            .forEach(([k, v]) => options[k] = env_bool_1.envVal(v));
        return options;
    }
    /**
     * @deprecated
     */
    reduceLine(html, options = {}) {
        options = this.fixOptions(options);
        if (options.allow_lf2) {
            return html;
        }
        let old = this.trim(html, options);
        old = //html
            //.replace(/\r\n|\r(?!\n)/g, "\n")
            old
                .replace(/[ \u3000\t]+\n/g, "\n")
                .replace(/[\s\u3000]+$/g, '')
                .replace(/^[\n \t]+/g, '')
                .replace(/\n{4,}/g, "\n\n\n\n");
        let _html = old;
        if (!_html.match(/[^\n]\n[^\n]/g)) {
            let [min, mid, max] = blank_line_1.default(_html.toString());
            if (min > 2) {
                options.allow_lf2 = false;
            }
            if (max >= 3) {
                if (min > 2) {
                    let r = new RegExp(`\\n{${min - 1}}(\\n+)`, 'g');
                    _html = _html
                        //.replace(/\n{2}(\n*)/g, '$1')
                        .replace(r, '$1');
                }
                _html = _html
                    .replace(/\n{3,}/g, "\n\n\n");
            }
            //console.log(options);
            if (!options.allow_lf2) {
                _html = _html
                    .replace(/\n\n/g, "\n");
            }
            if (_html != old) {
                return _html;
            }
        }
        return html;
    }
    /**
     * 通用型段落調整
     *
     * @returns {string}
     */
    textlayout(input, options = {}) {
        options = this.fixOptions(options);
        let html = this.trim(input, options);
        html = html
            .replace(/[ \u3000\t]+\n/g, "\n")
            .replace(/[\s\u3000]+$/g, '')
            .replace(/^[\n \t]+/g, '')
            .replace(/\n{4,}/g, "\n\n\n\n" /* LF4 */);
        return util_1._handleTextLayout(html, options);
    }
}
exports.TextLayout = TextLayout;
exports.create = TextLayout.create.bind(TextLayout);
exports.default = TextLayout;
//# sourceMappingURL=index.js.map