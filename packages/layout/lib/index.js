"use strict";
/**
 * Created by user on 2019/5/29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const blank_line_1 = require("blank-line");
const crlf_normalize_1 = require("crlf-normalize");
const env_bool_1 = require("env-bool");
const array_hyper_unique_1 = require("array-hyper-unique");
const util_1 = require("./util");
const StrUtil = require("str-util");
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
                ret = StrUtil.trim(ret, '\u3000' + options.trim);
            }
            else if (options.trim) {
                ret = StrUtil.trim(ret, '\u3000');
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
        ret = StrUtil.normalize(ret, options);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMkNBQXNDO0FBQ3RDLG1EQUEwQztBQUMxQyx1Q0FBa0M7QUFDbEMsMkRBQWtEO0FBY2xELGlDQUE2RjtBQUM3RixvQ0FBcUM7QUFFeEIsUUFBQSxNQUFNLEdBQUcsT0FBTyxDQUFDO0FBQ2pCLFFBQUEsU0FBUyxHQUFHLDBJQUEwSSxDQUFDO0FBRXBLOztHQUVHO0FBQ0gsTUFBYSxVQUFVO0lBMEJ0QixZQUFZLE9BQTZCLEVBQUUsR0FBRyxJQUFJO1FBeEJsQyxXQUFNLEdBQVcsY0FBTSxDQUFDO1FBQ3hCLGNBQVMsR0FBVyxpQkFBUyxDQUFDO1FBSXBDLFlBQU8sR0FBRztZQUNuQixPQUFPLEVBQUUsRUFJTjtZQUNILEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBZTtTQUM3QixDQUFDO1FBRVEsV0FBTSxHQUFHO1lBQ2xCLEVBQUUsRUFBRSx5RkFBeUY7WUFDN0YsRUFBRSxFQUFFLDBGQUEwRjtZQUU5RixLQUFLLEVBQUUseUJBQXlCO1lBRWhDLEtBQUssRUFBRSxFQUFxQjtTQUM1QixDQUFDO1FBQ1EsWUFBTyxHQUF3QixJQUFJLENBQUM7UUFJN0MsSUFBSSxHQUFHLEdBQWEsQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFeEYsSUFBSSxPQUFPLEVBQ1g7WUFDQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQ2pCO2dCQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7YUFDbEM7WUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQ2pCO2dCQUNDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxL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QTFoQkQsZ0NBMGhCQztBQUVZLFFBQUEsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBRXpELGtCQUFlLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvNS8yOS5cbiAqL1xuXG5pbXBvcnQgZ2V0TWluTWlkTWF4IGZyb20gJ2JsYW5rLWxpbmUnO1xuaW1wb3J0IGNybGYsIHsgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBlbnZWYWwgfSBmcm9tICdlbnYtYm9vbCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IHtcblx0RW51bUxGLFxuXHRJQ2FjaGVNYXAsXG5cdElDb25zdHJ1Y3Rvck9wdGlvbnMsXG5cdElSZWdFeHBDYWxsYmFjayxcblx0SVJlcGxhY2VPcHRpb25zLFxuXHRJVGV4dExheW91dE9wdGlvbnMsXG5cdElUb1N0ck9wdGlvbnMsIElUcmltT3B0aW9uc1VzZXIsXG5cdElXb3Jkc0FsbCxcblx0SVdvcmRzUGFyc2VkLFxuXHRJV29yZHNSdW50aW1lLFxuXHRJQ2FjaGVNYXBSb3csXG59IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHsgX2lzSXdvcmRzQXJyYXksIF9pc0l3b3Jkc0FycmF5MiwgX2lzSXdvcmRzVXNlclNwLCBfaGFuZGxlVGV4dExheW91dCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5cbmV4cG9ydCBjb25zdCBTUF9LRVkgPSBcIiNfQF8jXCI7XG5leHBvcnQgY29uc3QgU1BfUkVHRVhQID0gXCIoPzpAfO+8iMK3P++8iXwtfC98XFxcXChcXFxcKXwlfO+/pXxffFxcXFw/fO+8n3xcXFxcfHwjfFxcXFwkfFvvvIhcXFxcKF0oPzrlkozosJB85rKz6J+5KVtcXFxcKe+8iV1877yI5rKz77yJ77yI6J+577yJfFvvvIhcXFxcKF1b5rKz6J+5XXsxLDJ9W1xcXFwp77yJXXwgfFxcXFwufFvjg7vCt118XFxcXCp84pahfOWcjHxbPe+8nV18XFxcXFxcXFxcXFxcXFxcXHxcXFxcL1xcXFwvfO+9nClcIjtcblxuLyoqXG4gKiDmjpLniYjomZXnkIbmoLjlv4NcbiAqL1xuZXhwb3J0IGNsYXNzIFRleHRMYXlvdXRcbntcblx0cHVibGljIHJlYWRvbmx5IFNQX0tFWTogc3RyaW5nID0gU1BfS0VZO1xuXHRwdWJsaWMgcmVhZG9ubHkgU1BfUkVHRVhQOiBzdHJpbmcgPSBTUF9SRUdFWFA7XG5cblx0cHJvdGVjdGVkIF9SZWdFeHBDbGFzczogdHlwZW9mIFJlZ0V4cDtcblxuXHRwcm90ZWN0ZWQgX2NhY2hlXyA9IHtcblx0XHRyZXBsYWNlOiBbXSBhcyB7XG5cdFx0XHRvbGQ6IHN0cmluZ1tdLFxuXHRcdFx0bmV3OiBzdHJpbmdbXSxcblx0XHRcdGRhdGE/LFxuXHRcdH1bXSxcblx0XHR3b3JkczogbmV3IE1hcCgpIGFzIElDYWNoZU1hcCxcblx0fTtcblxuXHRwcm90ZWN0ZWQgX2RhdGFfID0ge1xuXHRcdG0wOiAvKFteYS16MC05XFwtXFwuXFxzXSk/KFthLXowLTlcXC1cXC5dKyg/OlthLXowLTlcXC1cXC5cXHNdK1thLXowLTlcXC1cXC5dKyk/KShbXmEtejAtOVxcLVxcLlxcc10pPy91aWcsXG5cdFx0cjE6IC9b44CM44CN4pGg4oaSXFwnXFxcIjpcXC1cXCvvvIjvvInila7vvIjila/vvL/ilbDvvInila1cXChcXClcXFtcXF3ilqDjgJDjgJHjgIrjgIt+772e4oCc4oCd4oCY4oCZOu+8mu+8mu+8jCrvvIpA44CCz4njg7vjgIHjgIJgXFx1MzAwMOKUgOS4gFxcZOOAjuOAj+KXhn7jgIHvvJ/vvIFcXD9cXCHDl1xcLlxcPFxcPj3igKbjg7tdL2ksXG5cblx0XHRydHJpbTogL1sgXFx0XFx1RkVGRlxceEEwXFx1MzAwMF0rJC8sXG5cblx0XHR3b3JkczogW10gYXMgSVdvcmRzUnVudGltZVtdLFxuXHR9O1xuXHRwcm90ZWN0ZWQgb3B0aW9uczogSUNvbnN0cnVjdG9yT3B0aW9ucyA9IG51bGw7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucz86IElDb25zdHJ1Y3Rvck9wdGlvbnMsIC4uLmFyZ3YpXG5cdHtcblx0XHRsZXQgYXJyOiBzdHJpbmdbXSA9IChvcHRpb25zICYmIG9wdGlvbnMud29yZHNfYmxvY2spID8gb3B0aW9ucy53b3Jkc19ibG9jay5zbGljZSgpIDogW107XG5cblx0XHRpZiAob3B0aW9ucylcblx0XHR7XG5cdFx0XHRpZiAob3B0aW9ucy5ydHJpbSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5fZGF0YV8ucnRyaW0gPSBvcHRpb25zLnJ0cmltO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy53b3Jkcylcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5fZGF0YV8ud29yZHMgPSBvcHRpb25zLndvcmRzO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy5tMClcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5fZGF0YV8ubTAgPSBvcHRpb25zLm0wO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy5yMSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5fZGF0YV8ucjEgPSBvcHRpb25zLnIxO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy5TUF9LRVkpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuU1BfS0VZID0gb3B0aW9ucy5TUF9LRVk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvcHRpb25zLlNQX1JFR0VYUClcblx0XHRcdHtcblx0XHRcdFx0bGV0IHY6IHN0cmluZyB8IFJlZ0V4cCA9IG9wdGlvbnMuU1BfUkVHRVhQO1xuXG5cdFx0XHRcdGlmICh2IGluc3RhbmNlb2YgUmVnRXhwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0diA9IHYuc291cmNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5TUF9SRUdFWFAgPSB2O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy5SZWdFeHBDbGFzcylcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5fUmVnRXhwQ2xhc3MgPSBvcHRpb25zLlJlZ0V4cENsYXNzO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgbnVsbDtcblxuXHRcdHRoaXMuX2luaXQoYXJyKTtcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbnM/OiBJQ29uc3RydWN0b3JPcHRpb25zLCAuLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKG9wdGlvbnMsIC4uLmFyZ3YpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9pbml0KGFycjogc3RyaW5nW10pXG5cdHtcblx0XHR0aGlzLl9kYXRhXy53b3JkcyA9IHRoaXMuX3dvcmRzMShhcnIsIHRoaXMuX2RhdGFfLndvcmRzIGFzIGFueSk7XG5cdFx0dGhpcy5fZGF0YV8ud29yZHMgPSB0aGlzLl93b3JkczIodGhpcy5fZGF0YV8ud29yZHMgYXMgYW55KTtcblx0fVxuXG5cdHB1YmxpYyBnZXQgUmVnRXhwKCk6IHR5cGVvZiBSZWdFeHBcblx0e1xuXHRcdHJldHVybiB0aGlzLl9SZWdFeHBDbGFzcyB8fCBSZWdFeHA7XG5cdH1cblxuXHQvKipcblx0ICog57Ch5piT5Z6L5qij5byP6JmV55CGIOmBqeeUqOaWvCDlsY/olL3lrZfmiJbogIXkurrlkI3miJbogIXlm6Dngrrnt6jnorzllY/poYzogIzorormiJAgPyDpgqPkupvkuYvpoZ7nmoTpu55cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF93b3JkczEoYXJyOiBzdHJpbmdbXSwgd29yZHM6IElXb3Jkc1BhcnNlZFtdID0gW10pOiBJV29yZHNSdW50aW1lW11cblx0e1xuXHRcdGNvbnN0IFNQX1JFR0VYUCA9IHRoaXMuU1BfUkVHRVhQO1xuXHRcdGNvbnN0IFJDID0gdGhpcy5SZWdFeHA7XG5cblx0XHRhcnJheV91bmlxdWUoYXJyKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYSA9IHZhbHVlLnNwbGl0KCdAJyk7XG5cblx0XHRcdFx0Lypcblx0XHRcdFx0X3NlbGYuX2RhdGFfLndvcmRzLnB1c2goe1xuXHRcdFx0XHRcdHM6IG5ldyBSZWdFeHAoYCgke2FbMF19KSR7cn0oJHthWzFdfSlgLCAnZycpLFxuXHRcdFx0XHRcdHI6ICckMSQyJyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCovXG5cblx0XHRcdFx0bGV0IHMgPSBhLmpvaW4oYCkke1NQX1JFR0VYUH0oYCk7XG5cblx0XHRcdFx0d29yZHMucHVzaCh7XG5cdFx0XHRcdFx0czogbmV3IFJDKGAoJHtzfSlgLCAnZycpLFxuXHRcdFx0XHRcdHI6IGEubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiAnJCcgKyAoaW5kZXggKyAxKTtcblx0XHRcdFx0XHR9KS5qb2luKCcnKSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiB3b3Jkcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlsIfmqKPlvI/ovYnmj5vmiJDlr6bpmpvkvb/nlKjnmoTmqKPlvI/nianku7Zcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF93b3JkczIod29yZHM6IElXb3Jkc0FsbFtdKTogSVdvcmRzUnVudGltZVtdXG5cdHtcblx0XHRjb25zdCBTUF9SRUdFWFAgPSB0aGlzLlNQX1JFR0VYUDtcblx0XHRjb25zdCBSQyA9IHRoaXMuUmVnRXhwO1xuXG5cdFx0cmV0dXJuIHdvcmRzLm1hcChmdW5jdGlvbiAodmFsdWU6IElXb3Jkc0FsbCwgaW5kZXgsIGFycmF5KVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGlmICh2YWx1ZS5ub19yZWdleClcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX2lzSXdvcmRzQXJyYXkodmFsdWUpKVxuXHRcdFx0e1xuXHRcdFx0XHR2YWx1ZSA9IHtcblx0XHRcdFx0XHRfc291cmNlOiB2YWx1ZSxcblxuXHRcdFx0XHRcdHM6IHZhbHVlWzBdLFxuXHRcdFx0XHRcdHI6IHZhbHVlWzFdLFxuXG5cdFx0XHRcdFx0ZmxhZ3M6IHZhbHVlWzJdLFxuXHRcdFx0XHR9IGFzIElXb3Jkc1BhcnNlZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKF9pc0l3b3Jkc0FycmF5Mih2YWx1ZSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB2YWx1ZVswXTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKF9pc0l3b3Jkc1VzZXJTcCh2YWx1ZSkpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghdmFsdWUuX3NvdXJjZSkgdmFsdWUuX3NvdXJjZSA9IHZhbHVlLnM7XG5cblx0XHRcdFx0bGV0IGEgPSB2YWx1ZS5zLnNwbGl0KFNQX0tFWSk7XG5cdFx0XHRcdGxldCBzID0gYS5qb2luKGApJHtTUF9SRUdFWFB9KGApO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0dmFsdWUucyA9IG5ldyBSQyhgKCR7c30pYCwgdmFsdWUuZmxhZ3MgPyB2YWx1ZS5mbGFncyA6ICdnJyk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh2YWx1ZS5zKTtcblxuXHRcdFx0XHRpZiAodmFsdWUuciA9PT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhbHVlLnIgPSBhLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJyQnICsgKGluZGV4ICsgMSk7XG5cdFx0XHRcdFx0fSkuam9pbignJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS5zID09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGlmICghdmFsdWUuX3NvdXJjZSkgdmFsdWUuX3NvdXJjZSA9IHZhbHVlLnM7XG5cblx0XHRcdFx0dmFsdWUucyA9IG5ldyBSQyh2YWx1ZS5zLCB2YWx1ZS5mbGFncyA/IHZhbHVlLmZsYWdzIDogJ2cnKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS5mbiA9PSAnZnVuY3Rpb24nKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUuZm47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB2YWx1ZSBhcyBhbnk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXBsYWNlKHRleHQsIG9wdGlvbnM6IElSZXBsYWNlT3B0aW9ucyA9IHt9KTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXRleHQgfHwgIS9bXlxcc10vLnRlc3QodGV4dCkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fVxuXG5cdFx0bGV0IF9zZWxmID0gdGhpcztcblxuXHRcdGxldCBfcmV0ID0gdGhpcy50b1N0cih0ZXh0KVxuXHRcdFx0LnJlcGxhY2UoX3NlbGYuX2RhdGFfLnJ0cmltLCAnJylcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9ucy5wYWRfZW5nKVxuXHRcdHtcblx0XHRcdF9yZXQgPSB0aGlzLnBhZGRpbmdFbmcoX3JldCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMud29yZHMpXG5cdFx0e1xuXHRcdFx0X3JldCA9IHRoaXMucmVwbGFjZV93b3JkcyhfcmV0LCBfc2VsZi5fZGF0YV8ud29yZHMsIF9zZWxmLl9jYWNoZV8ud29yZHMpLnZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBfcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIGZvciBydW4gcnVsZSBvbmUgYnkgb25lXG5cdCAqL1xuXHRyZXBsYWNlX3JvdyhfcmV0OiBzdHJpbmcsIHZhbHVlOiBJV29yZHNSdW50aW1lLCBjYWNoZU1hcD86IElDYWNoZU1hcClcblx0e1xuXHRcdGxldCBfbmV3OiBzdHJpbmc7XG5cblx0XHRpZiAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicpXG5cdFx0e1xuXHRcdFx0X25ldyA9IHZhbHVlKF9yZXQsIGNhY2hlTWFwKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCBfciA9IHZhbHVlLnM7XG5cblx0XHRcdF9uZXcgPSBfcmV0LnJlcGxhY2UoX3IsIHZhbHVlLnIgYXMgSVJlZ0V4cENhbGxiYWNrKTtcblx0XHR9XG5cblx0XHRpZiAoY2FjaGVNYXAgJiYgX25ldyAhPT0gX3JldClcblx0XHR7XG5cdFx0XHRsZXQgbXlNYXAgPSBbXSBhcyB7XG5cdFx0XHRcdG9sZDogc3RyaW5nLFxuXHRcdFx0XHRuZXc6IHN0cmluZyxcblx0XHRcdH1bXTtcblxuXHRcdFx0aWYgKGNhY2hlTWFwLmhhcyh2YWx1ZSkpXG5cdFx0XHR7XG5cdFx0XHRcdG15TWFwID0gY2FjaGVNYXAuZ2V0KHZhbHVlKTtcblx0XHRcdH1cblxuXHRcdFx0bXlNYXAucHVzaCh7XG5cdFx0XHRcdG9sZDogX3JldCxcblx0XHRcdFx0bmV3OiBfbmV3LFxuXHRcdFx0fSk7XG5cblx0XHRcdGNhY2hlTWFwLnNldCh2YWx1ZSwgbXlNYXApO1xuXHRcdH1cblxuXHRcdHJldHVybiBfbmV3O1xuXHR9XG5cblx0cmVwbGFjZV93b3JkcyhfcmV0OiBzdHJpbmcsIHdvcmRzOiBJV29yZHNSdW50aW1lW10sIGNhY2hlTWFwPzogSUNhY2hlTWFwIHwgdHJ1ZSlcblx0e1xuXHRcdGlmIChjYWNoZU1hcClcblx0XHR7XG5cdFx0XHRpZiAoY2FjaGVNYXAgPT09IHRydWUpXG5cdFx0XHR7XG5cdFx0XHRcdGNhY2hlTWFwID0gbmV3IE1hcCgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Y2FjaGVNYXAgPSBudWxsIGFzIElDYWNoZU1hcDtcblx0XHR9XG5cblx0XHRmb3IgKGxldCB2YWx1ZSBvZiB3b3Jkcylcblx0XHR7XG5cdFx0XHRfcmV0ID0gdGhpcy5yZXBsYWNlX3JvdyhfcmV0LCB2YWx1ZSwgY2FjaGVNYXApO1xuXG5cdFx0XHRpZiAoIS9bXFxTXS8udGVzdChfcmV0KSlcblx0XHRcdHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiBfcmV0IGFzIHN0cmluZyxcblx0XHRcdGNhY2hlOiBjYWNoZU1hcCxcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRwYWRkaW5nRW5nKHRleHQ6IHN0cmluZylcblx0e1xuXHRcdGxldCBfc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gdGhpcy50b1N0cih0ZXh0KVxuXHRcdFx0LnJlcGxhY2UoX3NlbGYuX2RhdGFfLm0wLCBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdHtcblx0XHRcdFx0aWYgKGFyZ3ZbMl0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgb2xkID0gYXJndlsyXTtcblxuXHRcdFx0XHRcdGlmIChhcmd2WzJdLmxlbmd0aCA+IDEgJiYgYXJndlsxXSAmJiAhX3NlbGYuX2RhdGFfLnIxLnRlc3QoYXJndlsxXSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YXJndlsyXSA9ICcgJyArIGFyZ3ZbMl07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGFyZ3ZbM10gJiYgIV9zZWxmLl9kYXRhXy5yMS50ZXN0KGFyZ3ZbM10pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGFyZ3ZbMl0gPSBhcmd2WzJdICsgJyAnO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvbGQgIT0gYXJndlsyXSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfc2VsZi5fY2FjaGVfLnJlcGxhY2UucHVzaCh7XG5cdFx0XHRcdFx0XHRcdG9sZCxcblx0XHRcdFx0XHRcdFx0bmV3OiBhcmd2WzJdLFxuXG5cdFx0XHRcdFx0XHRcdGRhdGE6IGFyZ3YsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5kZWJ1Zyhbb2xkLCBhcmd2WzJdXSwgYXJndik7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIChhcmd2WzFdIHx8ICcnKSArIGFyZ3ZbMl0ucmVwbGFjZSgvKCApezIsfS9nLCAnJDEnKSArIChhcmd2WzNdIHx8ICcnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhcmd2WzBdO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0Y2xlYXJMRih0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltKHRleHQpXG5cdFx0XHQucmVwbGFjZSgvXFxuezQsfS9nLCAnXFxuXFxuJylcblx0XHRcdC5yZXBsYWNlKC9cXG57Myx9L2csICdcXG5cXG4nKVxuXHRcdFx0O1xuXHR9XG5cblx0dHJpbSh0ZXh0OiBCdWZmZXIgfCBzdHJpbmcgfCBudW1iZXIsIG9wdGlvbnM/OiBJVHJpbU9wdGlvbnNVc2VyKTogc3RyaW5nXG5cdHtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ2Jvb2xlYW4nKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRcdHRyaW06IG9wdGlvbnMsXG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zID09ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRcdHRyaW06IG9wdGlvbnMsXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IHJldCA9IHRoaXMudG9TdHIodGV4dCwgb3B0aW9ucylcblx0XHRcdC5yZXBsYWNlKC9bIFxcdFxcdTMwMDBcXHhBMFxcdTMwMDBdK1xcbi9nLCAnXFxuJylcblx0XHRcdC5yZXBsYWNlKC9eXFxuK3xbXFxzXFx1MzAwMFxceEEwXFx1MzAwMF0rJC9nLCAnJylcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9ucylcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHJpbSA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0cmV0ID0gU3RyVXRpbC50cmltKHJldCwgJ1xcdTMwMDAnICsgb3B0aW9ucy50cmltKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG9wdGlvbnMudHJpbSlcblx0XHRcdHtcblx0XHRcdFx0cmV0ID0gU3RyVXRpbC50cmltKHJldCwgJ1xcdTMwMDAnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOi9ieaPm+eCuuaWh+Wtl+S4puS4lOaomea6luWMllxuXHQgKi9cblx0dG9TdHIoc3RyOiBCdWZmZXIgfCBzdHJpbmcgfCBudW1iZXIgfCB1bmtub3duLCBvcHRpb25zPzogc3RyaW5nIHwgSVRvU3RyT3B0aW9ucyk6IHN0cmluZ1xuXHR7XG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09ICdzdHJpbmcnKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRcdExGOiBvcHRpb25zLFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRMRjogXCJcXG5cIixcblx0XHRcdGFsbG93X25ic3A6IGZhbHNlLFxuXHRcdFx0YWxsb3dfYm9tOiBmYWxzZSxcblx0XHR9LCBvcHRpb25zKTtcblxuXHRcdGxldCByZXQgPSBjcmxmKHN0ci50b1N0cmluZygpLCBvcHRpb25zLkxGIHx8IExGKVxuXHRcdFx0Ly8ucmVwbGFjZSgvXFxyXFxufFxccig/IVxcbil8XFxuL2csIG9wdGlvbnMuTEYgfHwgXCJcXG5cIilcblx0XHRcdC8vIGh0dHA6Ly93d3cuY2hhcmJhc2UuY29tLzIwMmEtdW5pY29kZS1sZWZ0LXRvLXJpZ2h0LWVtYmVkZGluZ1xuXG5cdFx0XHQvKlxuXHRcdFx0LnJlcGxhY2UoL1tcXHUyMDAwLVxcdTIwMEZdL2csICcnKVxuXHRcdFx0LnJlcGxhY2UoL1tcXHUyMDI4LVxcdTIwMkZdL2csICcnKVxuXHRcdFx0LnJlcGxhY2UoL1tcXHUyMDVGLVxcdTIwNjBdL2csICcnKVxuXHRcdFx0Ki9cblx0XHQ7XG5cblx0XHRyZXQgPSBTdHJVdGlsLm5vcm1hbGl6ZShyZXQsIG9wdGlvbnMpO1xuXG5cdFx0Lypcblx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfYm9tKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5yZXBsYWNlKC9cXHVGRUZGL2csICcnKTtcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfbmJzcClcblx0XHR7XG5cdFx0XHRyZXQgPSByZXQucmVwbGFjZSgvWyDCoFxceEEwXS9nLCAnICcpO1xuXHRcdH1cblx0XHQqL1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZpeE9wdGlvbnMob3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zKVxuXHR7XG5cdFx0T2JqZWN0LmVudHJpZXMob3B0aW9ucylcblx0XHRcdC5mb3JFYWNoKChbaywgdl0pID0+IG9wdGlvbnNba10gPSBlbnZWYWwodikpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdHJlZHVjZUxpbmU8VD4oaHRtbDogVCwgb3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zID0ge30pXG5cdHtcblx0XHRvcHRpb25zID0gdGhpcy5maXhPcHRpb25zKG9wdGlvbnMpO1xuXG5cdFx0aWYgKG9wdGlvbnMuYWxsb3dfbGYyKVxuXHRcdHtcblx0XHRcdHJldHVybiBodG1sO1xuXHRcdH1cblxuXHRcdGxldCBvbGQgPSB0aGlzLnRyaW0oaHRtbCBhcyBhbnkgYXMgc3RyaW5nLCBvcHRpb25zKTtcblxuXHRcdG9sZCA9IC8vaHRtbFxuXHRcdFx0XHRcdC8vLnJlcGxhY2UoL1xcclxcbnxcXHIoPyFcXG4pL2csIFwiXFxuXCIpXG5cdFx0XHRvbGRcblx0XHRcdFx0LnJlcGxhY2UoL1sgXFx1MzAwMFxcdF0rXFxuL2csIFwiXFxuXCIpXG5cdFx0XHRcdC5yZXBsYWNlKC9bXFxzXFx1MzAwMF0rJC9nLCAnJylcblx0XHRcdFx0LnJlcGxhY2UoL15bXFxuIFxcdF0rL2csICcnKVxuXHRcdFx0XHQucmVwbGFjZSgvXFxuezQsfS9nLCBcIlxcblxcblxcblxcblwiKVxuXHRcdDtcblxuXHRcdGxldCBfaHRtbCA9IG9sZDtcblxuXHRcdGlmICghX2h0bWwubWF0Y2goL1teXFxuXVxcblteXFxuXS9nKSlcblx0XHR7XG5cdFx0XHRsZXQgW21pbiwgbWlkLCBtYXhdID0gZ2V0TWluTWlkTWF4KF9odG1sLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRpZiAobWluID4gMilcblx0XHRcdHtcblx0XHRcdFx0b3B0aW9ucy5hbGxvd19sZjIgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1heCA+PSAzKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobWluID4gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCByID0gbmV3IFJlZ0V4cChgXFxcXG57JHttaW4gLSAxfX0oXFxcXG4rKWAsICdnJyk7XG5cblx0XHRcdFx0XHRfaHRtbCA9IF9odG1sXG5cdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXFxuezJ9KFxcbiopL2csICckMScpXG5cdFx0XHRcdFx0XHQucmVwbGFjZShyLCAnJDEnKVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9odG1sID0gX2h0bWxcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblxcblwiKVxuXHRcdFx0XHQvLy5yZXBsYWNlKC9cXG57Mn0vZywgXCJcXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHQvL2NvbnNvbGUubG9nKG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfbGYyKVxuXHRcdFx0e1xuXHRcdFx0XHRfaHRtbCA9IF9odG1sXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcblxcbi9nLCBcIlxcblwiKVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfaHRtbCAhPSBvbGQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBfaHRtbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gaHRtbDtcblx0fVxuXG5cdC8qKlxuXHQgKiDpgJrnlKjlnovmrrXokL3oqr/mlbRcblx0ICpcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICovXG5cdHRleHRsYXlvdXQoaW5wdXQ6IGFueSwgb3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zID0ge30pOiBzdHJpbmdcblx0e1xuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRsZXQgaHRtbCA9IHRoaXMudHJpbShpbnB1dCwgb3B0aW9ucyk7XG5cblx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHQucmVwbGFjZSgvWyBcXHUzMDAwXFx0XStcXG4vZywgXCJcXG5cIilcblx0XHRcdFx0LnJlcGxhY2UoL1tcXHNcXHUzMDAwXSskL2csICcnKVxuXHRcdFx0XHQucmVwbGFjZSgvXltcXG4gXFx0XSsvZywgJycpXG5cdFx0XHRcdC5yZXBsYWNlKC9cXG57NCx9L2csIEVudW1MRi5MRjQpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIF9oYW5kbGVUZXh0TGF5b3V0KGh0bWwsIG9wdGlvbnMpXG5cdH1cblxufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlID0gVGV4dExheW91dC5jcmVhdGUuYmluZChUZXh0TGF5b3V0KTtcblxuZXhwb3J0IGRlZmF1bHQgVGV4dExheW91dDtcbiJdfQ==