"use strict";
/**
 * Created by user on 2019/5/29.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7OztBQUVILDREQUFzQztBQUN0QyxpRUFBMEM7QUFDMUMsdUNBQWtDO0FBQ2xDLDJEQUFrRDtBQWNsRCxpQ0FBNkY7QUFDN0Ysd0RBQStCO0FBRWxCLFFBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQztBQUNqQixRQUFBLFNBQVMsR0FBRywwSUFBMEksQ0FBQztBQUVwSzs7R0FFRztBQUNILE1BQWEsVUFBVTtJQTBCdEIsWUFBWSxPQUE2QixFQUFFLEdBQUcsSUFBSTtRQXhCbEMsV0FBTSxHQUFXLGNBQU0sQ0FBQztRQUN4QixjQUFTLEdBQVcsaUJBQVMsQ0FBQztRQUlwQyxZQUFPLEdBQUc7WUFDbkIsT0FBTyxFQUFFLEVBSU47WUFDSCxLQUFLLEVBQUUsSUFBSSxHQUFHLEVBQWU7U0FDN0IsQ0FBQztRQUVRLFdBQU0sR0FBRztZQUNsQixFQUFFLEVBQUUseUZBQXlGO1lBQzdGLEVBQUUsRUFBRSwwRkFBMEY7WUFFOUYsS0FBSyxFQUFFLHlCQUF5QjtZQUVoQyxLQUFLLEVBQUUsRUFBcUI7U0FDNUIsQ0FBQztRQUNRLFlBQU8sR0FBd0IsSUFBSSxDQUFDO1FBSTdDLElBQUksR0FBRyxHQUFhLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRXhGLElBQUksT0FBTyxFQUNYO1lBQ0MsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUNqQjtnQkFDQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUNqQjtnQkFDQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO2FBQ2xDO1lBRUQsSUFBSSxPQUFPLENBQUMsRUFBRSxFQUNkO2dCQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7YUFDNUI7WUFFRCxJQUFJLE9BQU8sQ0FBQyxFQUFFLEVBQ2Q7Z0JBQ0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQzthQUM1QjtZQUVELElBQUksT0FBTyxDQUFDLE1BQU0sRUFDbEI7Z0JBQ0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO2FBQzdCO1lBRUQsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUNyQjtnQkFDQyxJQUFJLENBQUMsR0FBb0IsT0FBTyxDQUFDLFNBQVMsQ0FBQztnQkFFM0MsSUFBSSxDQUFDLFlBQVksTUFBTSxFQUN2QjtvQkFDQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztpQkFDYjtnQkFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQzthQUNuQjtZQUVELElBQUksT0FBTyxDQUFDLFdBQVcsRUFDdkI7Z0JBQ0MsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3hDO1NBQ0Q7UUFFRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxJQUFJLENBQUM7UUFFL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUE2QixFQUFFLEdBQUcsSUFBSTtRQUUxRCxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFUyxLQUFLLENBQUMsR0FBYTtRQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQVksQ0FBQyxDQUFDO1FBQ2hFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFZLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRUQsSUFBVyxNQUFNO1FBRWhCLE9BQU8sSUFBSSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUM7SUFDcEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsR0FBYSxFQUFFLFFBQXdCLEVBQUU7UUFFaEQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRXZCLGlDQUFZLENBQUMsR0FBRyxDQUFDO2FBQ2YsT0FBTyxDQUFDLFVBQVUsS0FBSztZQUV2QixJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRXpCOzs7OztjQUtFO1lBRUYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFFakMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDVixDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7Z0JBQ3hCLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO29CQUVyQyxPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQzthQUNYLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUNGO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE9BQU8sQ0FBQyxLQUFrQjtRQUV6QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFdkIsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBZ0IsRUFBRSxLQUFLLEVBQUUsS0FBSztZQUV4RCxhQUFhO1lBQ2IsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUNsQjtnQkFDQyxPQUFPLEtBQUssQ0FBQzthQUNiO1lBRUQsSUFBSSxxQkFBYyxDQUFDLEtBQUssQ0FBQyxFQUN6QjtnQkFDQyxLQUFLLEdBQUc7b0JBQ1AsT0FBTyxFQUFFLEtBQUs7b0JBRWQsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBRVgsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7aUJBQ0MsQ0FBQzthQUNsQjtZQUVELElBQUksc0JBQWUsQ0FBQyxLQUFLLENBQUMsRUFDMUI7Z0JBQ0MsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDaEI7aUJBQ0ksSUFBSSxzQkFBZSxDQUFDLEtBQUssQ0FBQyxFQUMvQjtnQkFDQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87b0JBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFNLENBQUMsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7Z0JBRWpDLGFBQWE7Z0JBQ2IsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUU1RCx1QkFBdUI7Z0JBRXZCLElBQUksS0FBSyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQ3BCO29CQUNDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSzt3QkFFNUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDWjthQUNEO2lCQUNJLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFDbkM7Z0JBQ0MsYUFBYTtnQkFDYixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87b0JBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDM0Q7aUJBQ0ksSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFLElBQUksVUFBVSxFQUN0QztnQkFDQyxPQUFPLEtBQUssQ0FBQyxFQUFFLENBQUM7YUFDaEI7WUFFRCxPQUFPLEtBQVksQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFLFVBQTJCLEVBQUU7UUFFMUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ2hDO1lBQ0MsT0FBTyxJQUFJLENBQUM7U0FDWjtRQUVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztRQUVqQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzthQUN6QixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQ2hDO1FBRUQsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUNuQjtZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdCO1FBRUQsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUNqQjtZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztTQUMvRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVyxDQUFDLElBQVksRUFBRSxLQUFvQixFQUFFLFFBQW9CO1FBRW5FLElBQUksSUFBWSxDQUFDO1FBRWpCLElBQUksT0FBTyxLQUFLLElBQUksVUFBVSxFQUM5QjtZQUNDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1NBQzdCO2FBRUQ7WUFDQyxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRWpCLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBb0IsQ0FBQyxDQUFDO1NBQ3BEO1FBRUQsSUFBSSxRQUFRLElBQUksSUFBSSxLQUFLLElBQUksRUFDN0I7WUFDQyxJQUFJLEtBQUssR0FBRyxFQUdULENBQUM7WUFFSixJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQ3ZCO2dCQUNDLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzVCO1lBRUQsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDVixHQUFHLEVBQUUsSUFBSTtnQkFDVCxHQUFHLEVBQUUsSUFBSTthQUNULENBQUMsQ0FBQztZQUVILFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzNCO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQsYUFBYSxDQUFDLElBQVksRUFBRSxLQUFzQixFQUFFLFFBQTJCO1FBRTlFLElBQUksUUFBUSxFQUNaO1lBQ0MsSUFBSSxRQUFRLEtBQUssSUFBSSxFQUNyQjtnQkFDQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzthQUNyQjtTQUNEO2FBRUQ7WUFDQyxRQUFRLEdBQUcsSUFBaUIsQ0FBQztTQUM3QjtRQUVELEtBQUssSUFBSSxLQUFLLElBQUksS0FBSyxFQUN2QjtZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ3RCO2dCQUNDLE1BQU07YUFDTjtTQUNEO1FBRUQsT0FBTztZQUNOLEtBQUssRUFBRSxJQUFjO1lBQ3JCLEtBQUssRUFBRSxRQUFRO1NBQ2YsQ0FBQztJQUNILENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVUsQ0FBQyxJQUFZO1FBRXRCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztRQUVqQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxVQUFVLEdBQUcsSUFBSTtZQUUxQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDWDtnQkFDQyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRWxCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNuRTtvQkFDQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEI7Z0JBRUQsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQzdDO29CQUNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO2lCQUN4QjtnQkFFRCxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ2xCO29CQUNDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDMUIsR0FBRzt3QkFDSCxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQzt3QkFFWixJQUFJLEVBQUUsSUFBSTtxQkFDVixDQUFDLENBQUM7aUJBQ0g7cUJBRUQ7b0JBQ0Msc0NBQXNDO2lCQUN0QztnQkFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzdFO1lBRUQsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxPQUFPLENBQUMsSUFBWTtRQUVuQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3BCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDO2FBQzFCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQzFCO0lBQ0gsQ0FBQztJQUVELElBQUksQ0FBQyxJQUE4QixFQUFFLE9BQTBCO1FBRTlELElBQUksT0FBTyxPQUFPLElBQUksU0FBUyxFQUMvQjtZQUNDLE9BQU8sR0FBRztnQkFDVCxJQUFJLEVBQUUsT0FBTzthQUNiLENBQUE7U0FDRDthQUNJLElBQUksT0FBTyxPQUFPLElBQUksUUFBUSxFQUNuQztZQUNDLE9BQU8sR0FBRztnQkFDVCxJQUFJLEVBQUUsT0FBTzthQUNiLENBQUE7U0FDRDtRQUVELElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQzthQUNqQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsSUFBSSxDQUFDO2FBQzFDLE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxFQUFFLENBQUMsQ0FDNUM7UUFFRCxJQUFJLE9BQU8sRUFDWDtZQUNDLElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSxJQUFJLFFBQVEsRUFDbkM7Z0JBQ0MsR0FBRyxHQUFHLGtCQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2pEO2lCQUNJLElBQUksT0FBTyxDQUFDLElBQUksRUFDckI7Z0JBQ0MsR0FBRyxHQUFHLGtCQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUNsQztTQUNEO1FBRUQsT0FBTyxHQUFHLENBQUM7SUFDWixDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFLLENBQUMsR0FBdUMsRUFBRSxPQUFnQztRQUU5RSxJQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFDOUI7WUFDQyxPQUFPLEdBQUc7Z0JBQ1QsRUFBRSxFQUFFLE9BQU87YUFDWCxDQUFDO1NBQ0Y7UUFFRCxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUN2QixFQUFFLEVBQUUsSUFBSTtZQUNSLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFNBQVMsRUFBRSxLQUFLO1NBQ2hCLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFWixJQUFJLEdBQUcsR0FBRyx3QkFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxJQUFJLG1CQUFFLENBQUMsQ0FTL0M7UUFFRCxHQUFHLEdBQUcsa0JBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXRDOzs7Ozs7Ozs7O1VBVUU7UUFFRixPQUFPLEdBQUcsQ0FBQztJQUNaLENBQUM7SUFFRCxVQUFVLENBQUMsT0FBMkI7UUFFckMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7YUFDckIsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQzVDO1FBRUQsT0FBTyxPQUFPLENBQUM7SUFDaEIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsVUFBVSxDQUFJLElBQU8sRUFBRSxVQUE4QixFQUFFO1FBRXRELE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5DLElBQUksT0FBTyxDQUFDLFNBQVMsRUFDckI7WUFDQyxPQUFPLElBQUksQ0FBQztTQUNaO1FBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFxQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRXBELEdBQUcsR0FBRyxNQUFNO1lBQ1Qsa0NBQWtDO1lBQ3BDLEdBQUc7aUJBQ0QsT0FBTyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQztpQkFDaEMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7aUJBQzVCLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO2lCQUN6QixPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUNoQztRQUVELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQztRQUVoQixJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsRUFDakM7WUFDQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxvQkFBWSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBRXJELElBQUksR0FBRyxHQUFHLENBQUMsRUFDWDtnQkFDQyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQzthQUMxQjtZQUVELElBQUksR0FBRyxJQUFJLENBQUMsRUFDWjtnQkFDQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQ1g7b0JBQ0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBRWpELEtBQUssR0FBRyxLQUFLO3dCQUNiLCtCQUErQjt5QkFDN0IsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FDakI7aUJBQ0Q7Z0JBRUQsS0FBSyxHQUFHLEtBQUs7cUJBQ1gsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FFN0I7YUFDRDtZQUVELHVCQUF1QjtZQUV2QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFDdEI7Z0JBQ0MsS0FBSyxHQUFHLEtBQUs7cUJBQ1gsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FDdkI7YUFDRDtZQUVELElBQUksS0FBSyxJQUFJLEdBQUcsRUFDaEI7Z0JBQ0MsT0FBTyxLQUFLLENBQUM7YUFDYjtTQUNEO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILFVBQVUsQ0FBQyxLQUFVLEVBQUUsVUFBOEIsRUFBRTtRQUV0RCxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUVuQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVyQyxJQUFJLEdBQUcsSUFBSTthQUNSLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUM7YUFDaEMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7YUFDNUIsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7YUFDekIsT0FBTyxDQUFDLFNBQVMsdUJBQWEsQ0FDaEM7UUFFRCxPQUFPLHdCQUFpQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0NBRUQ7QUExaEJELGdDQTBoQkM7QUFFWSxRQUFBLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUV6RCxrQkFBZSxVQUFVLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzUvMjkuXG4gKi9cblxuaW1wb3J0IGdldE1pbk1pZE1heCBmcm9tICdibGFuay1saW5lJztcbmltcG9ydCBjcmxmLCB7IExGIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuaW1wb3J0IHsgZW52VmFsIH0gZnJvbSAnZW52LWJvb2wnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCB7XG5cdEVudW1MRixcblx0SUNhY2hlTWFwLFxuXHRJQ29uc3RydWN0b3JPcHRpb25zLFxuXHRJUmVnRXhwQ2FsbGJhY2ssXG5cdElSZXBsYWNlT3B0aW9ucyxcblx0SVRleHRMYXlvdXRPcHRpb25zLFxuXHRJVG9TdHJPcHRpb25zLCBJVHJpbU9wdGlvbnNVc2VyLFxuXHRJV29yZHNBbGwsXG5cdElXb3Jkc1BhcnNlZCxcblx0SVdvcmRzUnVudGltZSxcblx0SUNhY2hlTWFwUm93LFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IF9pc0l3b3Jkc0FycmF5LCBfaXNJd29yZHNBcnJheTIsIF9pc0l3b3Jkc1VzZXJTcCwgX2hhbmRsZVRleHRMYXlvdXQgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IFN0clV0aWwgZnJvbSAnc3RyLXV0aWwnO1xuXG5leHBvcnQgY29uc3QgU1BfS0VZID0gXCIjX0BfI1wiO1xuZXhwb3J0IGNvbnN0IFNQX1JFR0VYUCA9IFwiKD86QHzvvIjCtz/vvIl8LXwvfFxcXFwoXFxcXCl8JXzvv6V8X3xcXFxcP3zvvJ98XFxcXHx8I3xcXFxcJHxb77yIXFxcXChdKD865ZKM6LCQfOays+ifuSlbXFxcXCnvvIldfO+8iOays++8ie+8iOifue+8iXxb77yIXFxcXChdW+ays+ifuV17MSwyfVtcXFxcKe+8iV18IHxcXFxcLnxb44O7wrddfFxcXFwqfOKWoXzlnIx8Wz3vvJ1dfFxcXFxcXFxcXFxcXFxcXFx8XFxcXC9cXFxcL3zvvZwpXCI7XG5cbi8qKlxuICog5o6S54mI6JmV55CG5qC45b+DXG4gKi9cbmV4cG9ydCBjbGFzcyBUZXh0TGF5b3V0XG57XG5cdHB1YmxpYyByZWFkb25seSBTUF9LRVk6IHN0cmluZyA9IFNQX0tFWTtcblx0cHVibGljIHJlYWRvbmx5IFNQX1JFR0VYUDogc3RyaW5nID0gU1BfUkVHRVhQO1xuXG5cdHByb3RlY3RlZCBfUmVnRXhwQ2xhc3M6IHR5cGVvZiBSZWdFeHA7XG5cblx0cHJvdGVjdGVkIF9jYWNoZV8gPSB7XG5cdFx0cmVwbGFjZTogW10gYXMge1xuXHRcdFx0b2xkOiBzdHJpbmdbXSxcblx0XHRcdG5ldzogc3RyaW5nW10sXG5cdFx0XHRkYXRhPyxcblx0XHR9W10sXG5cdFx0d29yZHM6IG5ldyBNYXAoKSBhcyBJQ2FjaGVNYXAsXG5cdH07XG5cblx0cHJvdGVjdGVkIF9kYXRhXyA9IHtcblx0XHRtMDogLyhbXmEtejAtOVxcLVxcLlxcc10pPyhbYS16MC05XFwtXFwuXSsoPzpbYS16MC05XFwtXFwuXFxzXStbYS16MC05XFwtXFwuXSspPykoW15hLXowLTlcXC1cXC5cXHNdKT8vdWlnLFxuXHRcdHIxOiAvW+OAjOOAjeKRoOKGklxcJ1xcXCI6XFwtXFwr77yI77yJ4pWu77yI4pWv77y/4pWw77yJ4pWtXFwoXFwpXFxbXFxd4pag44CQ44CR44CK44CLfu+9nuKAnOKAneKAmOKAmTrvvJrvvJrvvIwq77yKQOOAgs+J44O744CB44CCYFxcdTMwMDDilIDkuIBcXGTjgI7jgI/il4Z+44CB77yf77yBXFw/XFwhw5dcXC5cXDxcXD494oCm44O7XS9pLFxuXG5cdFx0cnRyaW06IC9bIFxcdFxcdUZFRkZcXHhBMFxcdTMwMDBdKyQvLFxuXG5cdFx0d29yZHM6IFtdIGFzIElXb3Jkc1J1bnRpbWVbXSxcblx0fTtcblx0cHJvdGVjdGVkIG9wdGlvbnM6IElDb25zdHJ1Y3Rvck9wdGlvbnMgPSBudWxsO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBJQ29uc3RydWN0b3JPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0bGV0IGFycjogc3RyaW5nW10gPSAob3B0aW9ucyAmJiBvcHRpb25zLndvcmRzX2Jsb2NrKSA/IG9wdGlvbnMud29yZHNfYmxvY2suc2xpY2UoKSA6IFtdO1xuXG5cdFx0aWYgKG9wdGlvbnMpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnMucnRyaW0pXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuX2RhdGFfLnJ0cmltID0gb3B0aW9ucy5ydHJpbTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMud29yZHMpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuX2RhdGFfLndvcmRzID0gb3B0aW9ucy53b3Jkcztcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMubTApXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuX2RhdGFfLm0wID0gb3B0aW9ucy5tMDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMucjEpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuX2RhdGFfLnIxID0gb3B0aW9ucy5yMTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMuU1BfS0VZKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLlNQX0tFWSA9IG9wdGlvbnMuU1BfS0VZO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy5TUF9SRUdFWFApXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB2OiBzdHJpbmcgfCBSZWdFeHAgPSBvcHRpb25zLlNQX1JFR0VYUDtcblxuXHRcdFx0XHRpZiAodiBpbnN0YW5jZW9mIFJlZ0V4cClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHYgPSB2LnNvdXJjZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuU1BfUkVHRVhQID0gdjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMuUmVnRXhwQ2xhc3MpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuX1JlZ0V4cENsYXNzID0gb3B0aW9ucy5SZWdFeHBDbGFzcztcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IG51bGw7XG5cblx0XHR0aGlzLl9pbml0KGFycik7XG5cdH1cblxuXHRwdWJsaWMgc3RhdGljIGNyZWF0ZShvcHRpb25zPzogSUNvbnN0cnVjdG9yT3B0aW9ucywgLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyhvcHRpb25zLCAuLi5hcmd2KTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaW5pdChhcnI6IHN0cmluZ1tdKVxuXHR7XG5cdFx0dGhpcy5fZGF0YV8ud29yZHMgPSB0aGlzLl93b3JkczEoYXJyLCB0aGlzLl9kYXRhXy53b3JkcyBhcyBhbnkpO1xuXHRcdHRoaXMuX2RhdGFfLndvcmRzID0gdGhpcy5fd29yZHMyKHRoaXMuX2RhdGFfLndvcmRzIGFzIGFueSk7XG5cdH1cblxuXHRwdWJsaWMgZ2V0IFJlZ0V4cCgpOiB0eXBlb2YgUmVnRXhwXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fUmVnRXhwQ2xhc3MgfHwgUmVnRXhwO1xuXHR9XG5cblx0LyoqXG5cdCAqIOewoeaYk+Wei+aoo+W8j+iZleeQhiDpgannlKjmlrwg5bGP6JS95a2X5oiW6ICF5Lq65ZCN5oiW6ICF5Zug54K657eo56K85ZWP6aGM6ICM6K6K5oiQID8g6YKj5Lqb5LmL6aGe55qE6bueXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfd29yZHMxKGFycjogc3RyaW5nW10sIHdvcmRzOiBJV29yZHNQYXJzZWRbXSA9IFtdKTogSVdvcmRzUnVudGltZVtdXG5cdHtcblx0XHRjb25zdCBTUF9SRUdFWFAgPSB0aGlzLlNQX1JFR0VYUDtcblx0XHRjb25zdCBSQyA9IHRoaXMuUmVnRXhwO1xuXG5cdFx0YXJyYXlfdW5pcXVlKGFycilcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGEgPSB2YWx1ZS5zcGxpdCgnQCcpO1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdF9zZWxmLl9kYXRhXy53b3Jkcy5wdXNoKHtcblx0XHRcdFx0XHRzOiBuZXcgUmVnRXhwKGAoJHthWzBdfSkke3J9KCR7YVsxXX0pYCwgJ2cnKSxcblx0XHRcdFx0XHRyOiAnJDEkMicsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQqL1xuXG5cdFx0XHRcdGxldCBzID0gYS5qb2luKGApJHtTUF9SRUdFWFB9KGApO1xuXG5cdFx0XHRcdHdvcmRzLnB1c2goe1xuXHRcdFx0XHRcdHM6IG5ldyBSQyhgKCR7c30pYCwgJ2cnKSxcblx0XHRcdFx0XHRyOiBhLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJyQnICsgKGluZGV4ICsgMSk7XG5cdFx0XHRcdFx0fSkuam9pbignJyksXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gd29yZHM7XG5cdH1cblxuXHQvKipcblx0ICog5bCH5qij5byP6L2J5o+b5oiQ5a+m6Zqb5L2/55So55qE5qij5byP54mp5Lu2XG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfd29yZHMyKHdvcmRzOiBJV29yZHNBbGxbXSk6IElXb3Jkc1J1bnRpbWVbXVxuXHR7XG5cdFx0Y29uc3QgU1BfUkVHRVhQID0gdGhpcy5TUF9SRUdFWFA7XG5cdFx0Y29uc3QgUkMgPSB0aGlzLlJlZ0V4cDtcblxuXHRcdHJldHVybiB3b3Jkcy5tYXAoZnVuY3Rpb24gKHZhbHVlOiBJV29yZHNBbGwsIGluZGV4LCBhcnJheSlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRpZiAodmFsdWUubm9fcmVnZXgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKF9pc0l3b3Jkc0FycmF5KHZhbHVlKSlcblx0XHRcdHtcblx0XHRcdFx0dmFsdWUgPSB7XG5cdFx0XHRcdFx0X3NvdXJjZTogdmFsdWUsXG5cblx0XHRcdFx0XHRzOiB2YWx1ZVswXSxcblx0XHRcdFx0XHRyOiB2YWx1ZVsxXSxcblxuXHRcdFx0XHRcdGZsYWdzOiB2YWx1ZVsyXSxcblx0XHRcdFx0fSBhcyBJV29yZHNQYXJzZWQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfaXNJd29yZHNBcnJheTIodmFsdWUpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdmFsdWVbMF07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChfaXNJd29yZHNVc2VyU3AodmFsdWUpKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIXZhbHVlLl9zb3VyY2UpIHZhbHVlLl9zb3VyY2UgPSB2YWx1ZS5zO1xuXG5cdFx0XHRcdGxldCBhID0gdmFsdWUucy5zcGxpdChTUF9LRVkpO1xuXHRcdFx0XHRsZXQgcyA9IGEuam9pbihgKSR7U1BfUkVHRVhQfShgKTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdHZhbHVlLnMgPSBuZXcgUkMoYCgke3N9KWAsIHZhbHVlLmZsYWdzID8gdmFsdWUuZmxhZ3MgOiAnZycpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2codmFsdWUucyk7XG5cblx0XHRcdFx0aWYgKHZhbHVlLnIgPT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YWx1ZS5yID0gYS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuICckJyArIChpbmRleCArIDEpO1xuXHRcdFx0XHRcdH0pLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUucyA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpZiAoIXZhbHVlLl9zb3VyY2UpIHZhbHVlLl9zb3VyY2UgPSB2YWx1ZS5zO1xuXG5cdFx0XHRcdHZhbHVlLnMgPSBuZXcgUkModmFsdWUucywgdmFsdWUuZmxhZ3MgPyB2YWx1ZS5mbGFncyA6ICdnJyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUuZm4gPT0gJ2Z1bmN0aW9uJylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlLmZuO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmFsdWUgYXMgYW55O1xuXHRcdH0pO1xuXHR9XG5cblx0cmVwbGFjZSh0ZXh0LCBvcHRpb25zOiBJUmVwbGFjZU9wdGlvbnMgPSB7fSk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKCF0ZXh0IHx8ICEvW15cXHNdLy50ZXN0KHRleHQpKVxuXHRcdHtcblx0XHRcdHJldHVybiB0ZXh0O1xuXHRcdH1cblxuXHRcdGxldCBfc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgX3JldCA9IHRoaXMudG9TdHIodGV4dClcblx0XHRcdC5yZXBsYWNlKF9zZWxmLl9kYXRhXy5ydHJpbSwgJycpXG5cdFx0O1xuXG5cdFx0aWYgKG9wdGlvbnMucGFkX2VuZylcblx0XHR7XG5cdFx0XHRfcmV0ID0gdGhpcy5wYWRkaW5nRW5nKF9yZXQpO1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLndvcmRzKVxuXHRcdHtcblx0XHRcdF9yZXQgPSB0aGlzLnJlcGxhY2Vfd29yZHMoX3JldCwgX3NlbGYuX2RhdGFfLndvcmRzLCBfc2VsZi5fY2FjaGVfLndvcmRzKS52YWx1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gX3JldDtcblx0fVxuXG5cdC8qKlxuXHQgKiBmb3IgcnVuIHJ1bGUgb25lIGJ5IG9uZVxuXHQgKi9cblx0cmVwbGFjZV9yb3coX3JldDogc3RyaW5nLCB2YWx1ZTogSVdvcmRzUnVudGltZSwgY2FjaGVNYXA/OiBJQ2FjaGVNYXApXG5cdHtcblx0XHRsZXQgX25ldzogc3RyaW5nO1xuXG5cdFx0aWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKVxuXHRcdHtcblx0XHRcdF9uZXcgPSB2YWx1ZShfcmV0LCBjYWNoZU1hcCk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgX3IgPSB2YWx1ZS5zO1xuXG5cdFx0XHRfbmV3ID0gX3JldC5yZXBsYWNlKF9yLCB2YWx1ZS5yIGFzIElSZWdFeHBDYWxsYmFjayk7XG5cdFx0fVxuXG5cdFx0aWYgKGNhY2hlTWFwICYmIF9uZXcgIT09IF9yZXQpXG5cdFx0e1xuXHRcdFx0bGV0IG15TWFwID0gW10gYXMge1xuXHRcdFx0XHRvbGQ6IHN0cmluZyxcblx0XHRcdFx0bmV3OiBzdHJpbmcsXG5cdFx0XHR9W107XG5cblx0XHRcdGlmIChjYWNoZU1hcC5oYXModmFsdWUpKVxuXHRcdFx0e1xuXHRcdFx0XHRteU1hcCA9IGNhY2hlTWFwLmdldCh2YWx1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdG15TWFwLnB1c2goe1xuXHRcdFx0XHRvbGQ6IF9yZXQsXG5cdFx0XHRcdG5ldzogX25ldyxcblx0XHRcdH0pO1xuXG5cdFx0XHRjYWNoZU1hcC5zZXQodmFsdWUsIG15TWFwKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gX25ldztcblx0fVxuXG5cdHJlcGxhY2Vfd29yZHMoX3JldDogc3RyaW5nLCB3b3JkczogSVdvcmRzUnVudGltZVtdLCBjYWNoZU1hcD86IElDYWNoZU1hcCB8IHRydWUpXG5cdHtcblx0XHRpZiAoY2FjaGVNYXApXG5cdFx0e1xuXHRcdFx0aWYgKGNhY2hlTWFwID09PSB0cnVlKVxuXHRcdFx0e1xuXHRcdFx0XHRjYWNoZU1hcCA9IG5ldyBNYXAoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGNhY2hlTWFwID0gbnVsbCBhcyBJQ2FjaGVNYXA7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgdmFsdWUgb2Ygd29yZHMpXG5cdFx0e1xuXHRcdFx0X3JldCA9IHRoaXMucmVwbGFjZV9yb3coX3JldCwgdmFsdWUsIGNhY2hlTWFwKTtcblxuXHRcdFx0aWYgKCEvW1xcU10vLnRlc3QoX3JldCkpXG5cdFx0XHR7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogX3JldCBhcyBzdHJpbmcsXG5cdFx0XHRjYWNoZTogY2FjaGVNYXAsXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0cGFkZGluZ0VuZyh0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgX3NlbGYgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIHRoaXMudG9TdHIodGV4dClcblx0XHRcdC5yZXBsYWNlKF9zZWxmLl9kYXRhXy5tMCwgZnVuY3Rpb24gKC4uLmFyZ3YpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhcmd2WzJdKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IG9sZCA9IGFyZ3ZbMl07XG5cblx0XHRcdFx0XHRpZiAoYXJndlsyXS5sZW5ndGggPiAxICYmIGFyZ3ZbMV0gJiYgIV9zZWxmLl9kYXRhXy5yMS50ZXN0KGFyZ3ZbMV0pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGFyZ3ZbMl0gPSAnICcgKyBhcmd2WzJdO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhcmd2WzNdICYmICFfc2VsZi5fZGF0YV8ucjEudGVzdChhcmd2WzNdKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhcmd2WzJdID0gYXJndlsyXSArICcgJztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAob2xkICE9IGFyZ3ZbMl0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0X3NlbGYuX2NhY2hlXy5yZXBsYWNlLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRvbGQsXG5cdFx0XHRcdFx0XHRcdG5ldzogYXJndlsyXSxcblxuXHRcdFx0XHRcdFx0XHRkYXRhOiBhcmd2LFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUuZGVidWcoW29sZCwgYXJndlsyXV0sIGFyZ3YpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiAoYXJndlsxXSB8fCAnJykgKyBhcmd2WzJdLnJlcGxhY2UoLyggKXsyLH0vZywgJyQxJykgKyAoYXJndlszXSB8fCAnJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYXJndlswXTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHQvKipcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdGNsZWFyTEYodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMudHJpbSh0ZXh0KVxuXHRcdFx0LnJlcGxhY2UoL1xcbns0LH0vZywgJ1xcblxcbicpXG5cdFx0XHQucmVwbGFjZSgvXFxuezMsfS9nLCAnXFxuXFxuJylcblx0XHRcdDtcblx0fVxuXG5cdHRyaW0odGV4dDogQnVmZmVyIHwgc3RyaW5nIHwgbnVtYmVyLCBvcHRpb25zPzogSVRyaW1PcHRpb25zVXNlcik6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09ICdib29sZWFuJylcblx0XHR7XG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHR0cmltOiBvcHRpb25zLFxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHR0cmltOiBvcHRpb25zLFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGxldCByZXQgPSB0aGlzLnRvU3RyKHRleHQsIG9wdGlvbnMpXG5cdFx0XHQucmVwbGFjZSgvWyBcXHRcXHUzMDAwXFx4QTBcXHUzMDAwXStcXG4vZywgJ1xcbicpXG5cdFx0XHQucmVwbGFjZSgvXlxcbit8W1xcc1xcdTMwMDBcXHhBMFxcdTMwMDBdKyQvZywgJycpXG5cdFx0O1xuXG5cdFx0aWYgKG9wdGlvbnMpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZiBvcHRpb25zLnRyaW0gPT0gJ3N0cmluZycpXG5cdFx0XHR7XG5cdFx0XHRcdHJldCA9IFN0clV0aWwudHJpbShyZXQsICdcXHUzMDAwJyArIG9wdGlvbnMudHJpbSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChvcHRpb25zLnRyaW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldCA9IFN0clV0aWwudHJpbShyZXQsICdcXHUzMDAwJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8qKlxuXHQgKiDovYnmj5vngrrmloflrZfkuKbkuJTmqJnmupbljJZcblx0ICovXG5cdHRvU3RyKHN0cjogQnVmZmVyIHwgc3RyaW5nIHwgbnVtYmVyIHwgdW5rbm93biwgb3B0aW9ucz86IHN0cmluZyB8IElUb1N0ck9wdGlvbnMpOiBzdHJpbmdcblx0e1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHRMRjogb3B0aW9ucyxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdFx0TEY6IFwiXFxuXCIsXG5cdFx0XHRhbGxvd19uYnNwOiBmYWxzZSxcblx0XHRcdGFsbG93X2JvbTogZmFsc2UsXG5cdFx0fSwgb3B0aW9ucyk7XG5cblx0XHRsZXQgcmV0ID0gY3JsZihzdHIudG9TdHJpbmcoKSwgb3B0aW9ucy5MRiB8fCBMRilcblx0XHRcdC8vLnJlcGxhY2UoL1xcclxcbnxcXHIoPyFcXG4pfFxcbi9nLCBvcHRpb25zLkxGIHx8IFwiXFxuXCIpXG5cdFx0XHQvLyBodHRwOi8vd3d3LmNoYXJiYXNlLmNvbS8yMDJhLXVuaWNvZGUtbGVmdC10by1yaWdodC1lbWJlZGRpbmdcblxuXHRcdFx0Lypcblx0XHRcdC5yZXBsYWNlKC9bXFx1MjAwMC1cXHUyMDBGXS9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9bXFx1MjAyOC1cXHUyMDJGXS9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9bXFx1MjA1Ri1cXHUyMDYwXS9nLCAnJylcblx0XHRcdCovXG5cdFx0O1xuXG5cdFx0cmV0ID0gU3RyVXRpbC5ub3JtYWxpemUocmV0LCBvcHRpb25zKTtcblxuXHRcdC8qXG5cdFx0aWYgKCFvcHRpb25zLmFsbG93X2JvbSlcblx0XHR7XG5cdFx0XHRyZXQgPSByZXQucmVwbGFjZSgvXFx1RkVGRi9nLCAnJyk7XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHRpb25zLmFsbG93X25ic3ApXG5cdFx0e1xuXHRcdFx0cmV0ID0gcmV0LnJlcGxhY2UoL1sgwqBcXHhBMF0vZywgJyAnKTtcblx0XHR9XG5cdFx0Ki9cblxuXHRcdHJldHVybiByZXQ7XG5cdH1cblxuXHRmaXhPcHRpb25zKG9wdGlvbnM6IElUZXh0TGF5b3V0T3B0aW9ucylcblx0e1xuXHRcdE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpXG5cdFx0XHQuZm9yRWFjaCgoW2ssIHZdKSA9PiBvcHRpb25zW2tdID0gZW52VmFsKHYpKVxuXHRcdDtcblxuXHRcdHJldHVybiBvcHRpb25zO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRyZWR1Y2VMaW5lPFQ+KGh0bWw6IFQsIG9wdGlvbnM6IElUZXh0TGF5b3V0T3B0aW9ucyA9IHt9KVxuXHR7XG5cdFx0b3B0aW9ucyA9IHRoaXMuZml4T3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdGlmIChvcHRpb25zLmFsbG93X2xmMilcblx0XHR7XG5cdFx0XHRyZXR1cm4gaHRtbDtcblx0XHR9XG5cblx0XHRsZXQgb2xkID0gdGhpcy50cmltKGh0bWwgYXMgYW55IGFzIHN0cmluZywgb3B0aW9ucyk7XG5cblx0XHRvbGQgPSAvL2h0bWxcblx0XHRcdFx0XHQvLy5yZXBsYWNlKC9cXHJcXG58XFxyKD8hXFxuKS9nLCBcIlxcblwiKVxuXHRcdFx0b2xkXG5cdFx0XHRcdC5yZXBsYWNlKC9bIFxcdTMwMDBcXHRdK1xcbi9nLCBcIlxcblwiKVxuXHRcdFx0XHQucmVwbGFjZSgvW1xcc1xcdTMwMDBdKyQvZywgJycpXG5cdFx0XHRcdC5yZXBsYWNlKC9eW1xcbiBcXHRdKy9nLCAnJylcblx0XHRcdFx0LnJlcGxhY2UoL1xcbns0LH0vZywgXCJcXG5cXG5cXG5cXG5cIilcblx0XHQ7XG5cblx0XHRsZXQgX2h0bWwgPSBvbGQ7XG5cblx0XHRpZiAoIV9odG1sLm1hdGNoKC9bXlxcbl1cXG5bXlxcbl0vZykpXG5cdFx0e1xuXHRcdFx0bGV0IFttaW4sIG1pZCwgbWF4XSA9IGdldE1pbk1pZE1heChfaHRtbC50b1N0cmluZygpKTtcblxuXHRcdFx0aWYgKG1pbiA+IDIpXG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnMuYWxsb3dfbGYyID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtYXggPj0gMylcblx0XHRcdHtcblx0XHRcdFx0aWYgKG1pbiA+IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgciA9IG5ldyBSZWdFeHAoYFxcXFxueyR7bWluIC0gMX19KFxcXFxuKylgLCAnZycpO1xuXG5cdFx0XHRcdFx0X2h0bWwgPSBfaHRtbFxuXHRcdFx0XHRcdC8vLnJlcGxhY2UoL1xcbnsyfShcXG4qKS9nLCAnJDEnKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UociwgJyQxJylcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfaHRtbCA9IF9odG1sXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cXG5cIilcblx0XHRcdFx0Ly8ucmVwbGFjZSgvXFxuezJ9L2csIFwiXFxuXCIpXG5cdFx0XHRcdDtcblx0XHRcdH1cblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhvcHRpb25zKTtcblxuXHRcdFx0aWYgKCFvcHRpb25zLmFsbG93X2xmMilcblx0XHRcdHtcblx0XHRcdFx0X2h0bWwgPSBfaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXG5cXG4vZywgXCJcXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX2h0bWwgIT0gb2xkKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gX2h0bWw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGh0bWw7XG5cdH1cblxuXHQvKipcblx0ICog6YCa55So5Z6L5q616JC96Kq/5pW0XG5cdCAqXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHR0ZXh0bGF5b3V0KGlucHV0OiBhbnksIG9wdGlvbnM6IElUZXh0TGF5b3V0T3B0aW9ucyA9IHt9KTogc3RyaW5nXG5cdHtcblx0XHRvcHRpb25zID0gdGhpcy5maXhPcHRpb25zKG9wdGlvbnMpO1xuXG5cdFx0bGV0IGh0bWwgPSB0aGlzLnRyaW0oaW5wdXQsIG9wdGlvbnMpO1xuXG5cdFx0aHRtbCA9IGh0bWxcblx0XHRcdFx0LnJlcGxhY2UoL1sgXFx1MzAwMFxcdF0rXFxuL2csIFwiXFxuXCIpXG5cdFx0XHRcdC5yZXBsYWNlKC9bXFxzXFx1MzAwMF0rJC9nLCAnJylcblx0XHRcdFx0LnJlcGxhY2UoL15bXFxuIFxcdF0rL2csICcnKVxuXHRcdFx0XHQucmVwbGFjZSgvXFxuezQsfS9nLCBFbnVtTEYuTEY0KVxuXHRcdDtcblxuXHRcdHJldHVybiBfaGFuZGxlVGV4dExheW91dChodG1sLCBvcHRpb25zKVxuXHR9XG5cbn1cblxuZXhwb3J0IGNvbnN0IGNyZWF0ZSA9IFRleHRMYXlvdXQuY3JlYXRlLmJpbmQoVGV4dExheW91dCk7XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRMYXlvdXQ7XG4iXX0=