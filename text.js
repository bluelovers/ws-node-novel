"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
const blank_line_1 = require("blank-line");
const crlf_normalize_1 = require("crlf-normalize");
const tieba_harmony_1 = require("tieba-harmony");
exports.SP_REGEXP = tieba_harmony_1.SP_REGEXP;
exports.SP_KEY = tieba_harmony_1.SP_KEY;
const env_bool_1 = require("env-bool");
class enspace {
    constructor(options) {
        this._cache_ = {
            replace: [],
            words: new Map(),
        };
        this._data_ = {
            m0: /([^a-z0-9\-\.\s])?([a-z0-9\-\.]+(?:[a-z0-9\-\.\s]+[a-z0-9\-\.]+)?)([^a-z0-9\-\.\s])?/uig,
            r1: /[「」①→\'\":\-\+（）╮（╯＿╰）╭\(\)\[\]■【】《》~～“”‘’:：：，*＊@。ω・、。`　─一\d『』◆~、？！\?\!×\.\<\>=…・]/i,
            rtrim: /[ \t\uFEFF\xA0　]+$/,
            words: [
                {
                    s: /\.{3}/g,
                    r: '…',
                },
                {
                    s: /…\.{1,2}/g,
                    r: '……',
                },
                {
                    s: /(话|日|章)[\_\t\uFEFF\xA0]+/ig,
                    r: '$1 ',
                },
                {
                    s: '！　',
                    r: '！',
                    no_regex: false,
                },
                {
                    s: /^([^「『“”』」]+)?(“)([^「『“”』」]+)[』」]([^”]+)?$/m,
                    r: '$1$2$3”$4',
                },
                {
                    s: /，——/g,
                    r: '——',
                },
                {
                    s: /(?:話|话)/ug,
                    r: '話',
                },
                [/　[ \t]+（/g, '　（'],
            ],
        };
        this.options = {};
        this._words_r1 = tieba_harmony_1.SP_REGEXP;
        let _self = this;
        let r = this._words_r1;
        let arr = []
            .concat(options && options.words_block ? options.words_block : null);
        this._data_.words = this._words1(arr, this._data_.words);
        this._data_.words = this._words2(this._data_.words);
    }
    static create(...argv) {
        return new this(...argv);
    }
    _words1(arr, words = []) {
        let r = this._words_r1;
        arr
            .filter(function (el, index, arr) {
            return el && (index == arr.indexOf(el));
        })
            .forEach(function (value) {
            let a = value.split('@');
            let s = a.join(`)${r}(`);
            words.push({
                s: new RegExp(`(${s})`, 'g'),
                r: a.map(function (value, index, array) {
                    return '$' + (index + 1);
                }).join(''),
            });
        });
        return words;
    }
    _words2(words) {
        let r = this._words_r1;
        return words.map(function (value, index, array) {
            if (value.no_regex) {
                return value;
            }
            if (Array.isArray(value) && (value.length == 2 || value.length >= 3)) {
                value = {
                    _source: value,
                    s: value[0],
                    r: value[1],
                    flags: value[2],
                };
            }
            if (typeof value.s == 'string' && value.s.match(new RegExp(`${tieba_harmony_1.SP_KEY}(.+)$`))) {
                if (!value._source)
                    value._source = value.s;
                let a = value.s.split(tieba_harmony_1.SP_KEY);
                let s = a.join(`)${r}(`);
                value.s = new RegExp(`(${s})`, value.flags ? value.flags : 'g');
                if (value.r === null) {
                    value.r = a.map(function (value, index, array) {
                        return '$' + (index + 1);
                    }).join('');
                }
            }
            else if (typeof value.s == 'string') {
                if (!value._source)
                    value._source = value.s;
                value.s = new RegExp(value.s, value.flags ? value.flags : 'g');
            }
            else if (Array.isArray(value) && value.length == 1 && typeof value[0] == 'function') {
                value = value[0];
            }
            else if (typeof value.fn == 'function') {
                value = value.fn;
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
    replace_words(_ret, words, _cache_words) {
        if (!_cache_words) {
            _cache_words = new Map();
        }
        for (let i in words) {
            let _new;
            if (typeof words[i] == 'function') {
                _new = words[i](_ret, _cache_words);
            }
            else {
                let _r = words[i].s;
                _new = _ret.replace(_r, words[i].r);
            }
            if (_new != _ret) {
                let myMap = [];
                if (_cache_words.has(words[i])) {
                    myMap = _cache_words.get(words[i]);
                }
                myMap.push({
                    old: _ret,
                    new: _new,
                });
                _cache_words.set(words[i], myMap);
                _ret = _new;
            }
            if (!/[^\s]/.test(_ret)) {
                break;
            }
        }
        return {
            value: _ret,
            cache: _cache_words,
        };
    }
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
                        old: old,
                        new: argv[2],
                        data: argv,
                    });
                }
                else {
                }
                return (argv[1] || '') + argv[2].replace(/( ){2,}/g, '$1') + (argv[3] || '');
            }
            return argv[0];
        });
    }
    clearLF(text) {
        return this.trim(text)
            .replace(/\n{4,}/g, '\n\n')
            .replace(/\n{3,}/g, '\n\n');
    }
    trim(text, options) {
        let ret = this.toStr(text, options)
            .replace(/[ \t　\xA0\u3000]+\n/g, '\n')
            .replace(/^\n+|[\s　\xA0\u3000]+$/g, '');
        if (typeof options == 'boolean') {
            options = {
                trim: !!options,
            };
        }
        else if (typeof options == 'string') {
            options = {
                trim: options,
            };
        }
        if (options) {
            if (typeof options.trim == 'string') {
                ret = StrUtil.trim(ret, '　' + options.trim);
            }
            else if (options.trim) {
                ret = StrUtil.trim(ret, '　');
            }
        }
        return ret;
    }
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
        let ret = crlf_normalize_1.default(str.toString(), options.LF || "\n");
        ret = StrUtil.normalize(ret, options);
        return ret;
    }
    fixOptions(options) {
        Object.entries(options)
            .forEach(([k, v]) => options[k] = env_bool_1.envVal(v));
        return options;
    }
    textlayout(html, options = {}) {
        options = this.fixOptions(options);
        html = this.trim(html, options);
        html =
            html
                .replace(/[ 　\t]+\n/g, "\n")
                .replace(/[\s　]+$/g, '')
                .replace(/^[\n \t]+/g, '')
                .replace(/\n{4,}/g, "\n\n\n\n");
        if (!html.match(/[^\n]\n[^\n]/g)) {
            let [min, mid, max] = blank_line_1.default(html.toString());
            if (min > 2) {
                options.allow_lf2 = false;
            }
            if (max >= 3) {
                if (min > 2) {
                    let r = new RegExp(`\\n{${min - 1}}(\\n*)`, 'g');
                    html = html
                        .replace(r, '$1');
                }
                html = html
                    .replace(/\n{3,}/g, "\n\n\n");
            }
            if (!options.allow_lf2) {
                html = html
                    .replace(/\n\n/g, "\n");
            }
        }
        html = html
            .toString()
            .replace(/([^\n「」【】《》“”『』（）\[\]"](?:[！？?!。]*)?)\n((?:[—]+)?[「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:　*)[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/([^\n「」【】《》“”『』（）\[\]"≪≫](?:[！？?!。]*)?)\n((?:[—]+)?[≪≫「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:　*)[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/(）(?:[！？?!。]*)?)\n([「」【】《》『』“”])/ug, "$1\n\n$2")
            .replace(/([「」【】《》“”『』（）―](?:[！？?!。]*)?)\n((?:[「」“”【】《》（）『』])(?:[^\n]+)([^「」【】《》“”『』（）―](?:[！？?!。]*)?)\n)/ug, "$1\n$2\n")
            .replace(/(\n(?:[^　\n][^\n]+))\n([　])/g, '$1\n\n$2')
            .replace(/([^\n])(\n+)(fin|\<完\>)(\n|$)/ig, "$1$2\n$3$4");
        html = html
            .replace(/^\n+|[\s　]+$/g, '')
            .replace(/(\n){4,}/g, "\n\n\n\n");
        if (options.allow_lf3) {
            html = html
                .replace(/(\n){3,}/g, "\n\n\n");
        }
        else {
            html = html
                .replace(/(\n){3}/g, "\n\n");
        }
        return html;
    }
}
exports.enspace = enspace;
const NovelText = require("./text");
exports.default = NovelText;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQ0FBb0M7QUFDcEMsMkNBQXNDO0FBQ3RDLG1EQUEwQztBQUMxQyxpREFBZ0U7QUFHdkQsb0JBSGMseUJBQVMsQ0FHZDtBQUFFLGlCQUhjLHNCQUFNLENBR2Q7QUFGMUIsdUNBQTJDO0FBc0MzQyxNQUFhLE9BQU87SUF1R25CLFlBQVksT0FBUTtRQXJHYixZQUFPLEdBQUc7WUFDaEIsT0FBTyxFQUFFLEVBQUU7WUFDWCxLQUFLLEVBQUUsSUFBSSxHQUFHLEVBQUU7U0FDaEIsQ0FBQztRQUNLLFdBQU0sR0FBRztZQUNmLEVBQUUsRUFBRSx5RkFBeUY7WUFDN0YsRUFBRSxFQUFFLHFGQUFxRjtZQUV6RixLQUFLLEVBQUUsb0JBQW9CO1lBRTNCLEtBQUssRUFBRTtnQkFPTjtvQkFDQyxDQUFDLEVBQUUsUUFBUTtvQkFDWCxDQUFDLEVBQUUsR0FBRztpQkFDTjtnQkFDRDtvQkFDQyxDQUFDLEVBQUUsV0FBVztvQkFDZCxDQUFDLEVBQUUsSUFBSTtpQkFDUDtnQkFnQkQ7b0JBQ0MsQ0FBQyxFQUFFLDRCQUE0QjtvQkFDL0IsQ0FBQyxFQUFFLEtBQUs7aUJBQ1I7Z0JBQ0Q7b0JBQ0MsQ0FBQyxFQUFFLElBQUk7b0JBQ1AsQ0FBQyxFQUFFLEdBQUc7b0JBRU4sUUFBUSxFQUFFLEtBQUs7aUJBQ2Y7Z0JBeUJEO29CQUNDLENBQUMsRUFBRSw2Q0FBNkM7b0JBQ2hELENBQUMsRUFBRSxXQUFXO2lCQUNkO2dCQUNEO29CQUNDLENBQUMsRUFBRSxNQUFNO29CQUNULENBQUMsRUFBRSxJQUFJO2lCQUNQO2dCQUNEO29CQUNDLENBQUMsRUFBRSxXQUFXO29CQUNkLENBQUMsRUFBRSxHQUFHO2lCQUNOO2dCQUNELENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQzthQVFEO1NBRW5CLENBQUM7UUFDSyxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWIsY0FB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O2FBU3pELE9BQU8sQ0FBQyxtR0FBbUcsRUFBRSxVQUFVLENBQUM7YUFNeEgsT0FBTyxDQUFDLDhCQUE4QixFQUFFLFVBQVUsQ0FBQzthQVNuRCxPQUFPLENBQUMsaUNBQWlDLEVBQUUsWUFBWSxDQUFDLENBQ3pEO1FBRUQsSUFBSSxHQUFHLElBQUk7YUFDVCxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQzthQUs1QixPQUFPLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUVqQztRQUVBLElBQUksT0FBTyxDQUFDLFNBQVMsRUFDckI7WUFDQyxJQUFJLEdBQUcsSUFBSTtpQkFDVCxPQUFPLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUMvQjtTQUNEO2FBRUQ7WUFDQyxJQUFJLEdBQUcsSUFBSTtpQkFDVCxPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUM1QjtTQUNEO1FBRUYsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBRUQ7QUFqakJELDBCQWlqQkM7QUFFRCxvQ0FBb0M7QUFFcEMsa0JBQWUsU0FBUyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxNy8xMi81LzAwNS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBTdHJVdGlsIGZyb20gJ3N0ci11dGlsJztcbmltcG9ydCBjaGtCbGFua0xpbmUgZnJvbSAnYmxhbmstbGluZSc7XG5pbXBvcnQgY3JsZiwgeyBMRiB9IGZyb20gJ2NybGYtbm9ybWFsaXplJztcbmltcG9ydCB0aWViYUhhcm1vbnksIHsgU1BfUkVHRVhQLCBTUF9LRVkgfSBmcm9tICd0aWViYS1oYXJtb255JztcbmltcG9ydCB7IGVudlZhbCwgZW52Qm9vbCB9IGZyb20gJ2Vudi1ib29sJztcblxuZXhwb3J0IHsgU1BfUkVHRVhQLCBTUF9LRVkgfTtcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1xue1xuXHR3b3Jkcz86IGJvb2xlYW5cblx0cGFkX2VuZz86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJV29yZHNPdXRwdXRcbntcblx0X3NvdXJjZT86IGFueSxcblxuXHRzPzogUmVnRXhwLFxuXHRyPzogc3RyaW5nIHwgSVJlZ0V4cENhbGxiYWNrLFxuXG5cdGZsYWdzPzogc3RyaW5nLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElSZWdFeHBDYWxsYmFja1xue1xuXHQoJDA6IHN0cmluZywgJDE/OiBzdHJpbmcsICQyPzogc3RyaW5nLCAkMz86IHN0cmluZywgLi4uYXJndik6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVG9TdHJPcHRpb25zXG57XG5cdExGPzogc3RyaW5nLFxuXHRhbGxvd19uYnNwPzogYm9vbGVhbixcblx0YWxsb3dfYm9tPzogYm9vbGVhbixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVGV4dExheW91dE9wdGlvbnMgZXh0ZW5kcyBJVG9TdHJPcHRpb25zXG57XG5cdGFsbG93X2xmMj86IGJvb2xlYW4sXG5cdGFsbG93X2xmMz86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCBjbGFzcyBlbnNwYWNlXG57XG5cdHB1YmxpYyBfY2FjaGVfID0ge1xuXHRcdHJlcGxhY2U6IFtdLFxuXHRcdHdvcmRzOiBuZXcgTWFwKCksXG5cdH07XG5cdHB1YmxpYyBfZGF0YV8gPSB7XG5cdFx0bTA6IC8oW15hLXowLTlcXC1cXC5cXHNdKT8oW2EtejAtOVxcLVxcLl0rKD86W2EtejAtOVxcLVxcLlxcc10rW2EtejAtOVxcLVxcLl0rKT8pKFteYS16MC05XFwtXFwuXFxzXSk/L3VpZyxcblx0XHRyMTogL1vjgIzjgI3ikaDihpJcXCdcXFwiOlxcLVxcK++8iO+8ieKVru+8iOKVr++8v+KVsO+8ieKVrVxcKFxcKVxcW1xcXeKWoOOAkOOAkeOAiuOAi37vvZ7igJzigJ3igJjigJk677ya77ya77yMKu+8ikDjgILPieODu+OAgeOAgmDjgIDilIDkuIBcXGTjgI7jgI/il4Z+44CB77yf77yBXFw/XFwhw5dcXC5cXDxcXD494oCm44O7XS9pLFxuXG5cdFx0cnRyaW06IC9bIFxcdFxcdUZFRkZcXHhBMOOAgF0rJC8sXG5cblx0XHR3b3JkczogW1xuXHRcdFx0Lypcblx0XHRcdHtcblx0XHRcdFx0czogJ++8iMK377yJJyxcblx0XHRcdFx0cjogJycsXG5cdFx0XHR9LFxuXHRcdFx0Ki9cblx0XHRcdHtcblx0XHRcdFx0czogL1xcLnszfS9nLFxuXHRcdFx0XHRyOiAn4oCmJyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC/igKZcXC57MSwyfS9nLFxuXHRcdFx0XHRyOiAn4oCm4oCmJyxcblx0XHRcdH0sXG5cblx0XHRcdC8qXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC8o56ysKSg/OltcXF9cXHRcXHVGRUZGXFx4QTDjgIBdKykoXFxkKykoPzpbXFxfXFx0XFx1RkVGRlxceEEw44CAXSspKOivnXzpoIF85aScfOeroCkvZyxcblx0XHRcdFx0cjogJyQxICQyICQzJyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC8o56ysKSg/OltcXF9cXHRcXHVGRUZGXFx4QTDjgIBdKyk/KFxcZCspKD86W1xcX1xcdFxcdUZFRkZcXHhBMOOAgF0rKSjor5186aCBfOWknHznq6ApL2csXG5cdFx0XHRcdHI6ICckMSAkMiAkMycsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKOesrCkoPzpbXFxfXFx0XFx1RkVGRlxceEEw44CAXSspKFxcZCspKD86W1xcX1xcdFxcdUZFRkZcXHhBMOOAgF0rKT8o6K+dfOmggXzlpJx856ugKS9nLFxuXHRcdFx0XHRyOiAnJDEgJDIgJDMnLFxuXHRcdFx0fSxcblx0XHRcdCovXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC8o6K+dfOaXpXznq6ApW1xcX1xcdFxcdUZFRkZcXHhBMF0rL2lnLFxuXHRcdFx0XHRyOiAnJDEgJyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHM6ICfvvIHjgIAnLFxuXHRcdFx0XHRyOiAn77yBJyxcblxuXHRcdFx0XHRub19yZWdleDogZmFsc2UsXG5cdFx0XHR9LFxuXHRcdFx0Lypcblx0XHRcdHtcblx0XHRcdFx0cjogLyhb44CM44CN44CQ44CR44CK44CL44CO44CP77yI77yJXSkvaWcsXG5cdFx0XHRcdHM6ICckMScsXG5cdFx0XHR9LFxuXHRcdFx0Ki9cblx0XHRcdC8qXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC8oXFw/XFw/KVsgXFx044CAXSsoXFw/XFw/KS9pZyxcblx0XHRcdFx0cjogJyQxJDInLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0czogL+OAjChbXuOAjOOAjuOAj+OAjV0rKT/jgI4oW15cXG7jgI9dKynjgI0oW17jgIzjgI7jgI/jgI1dKyk/44CPLyxcblx0XHRcdFx0cjogJ+OAjCQx44COJDLjgI8kM+OAjScsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAv44COKFte44CM44CO44CP44CNXSspP+OAjChbXlxcbuOAjV0rKeOAjyhbXuOAjOOAjuOAj+OAjV0rKT/jgI0vLFxuXHRcdFx0XHRyOiAn44COJDHjgIwkMuOAjSQz44CPJyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC/mg4VcXHMqc2VcXHMq5bCP6K+0L2lnLFxuXHRcdFx0XHRyOiAn5oOF6Imy5bCP6K+0Jyxcblx0XHRcdH0sXG5cdFx0XHQqL1xuXHRcdFx0e1xuXHRcdFx0XHRzOiAvXihbXuOAjOOAjuKAnOKAneOAj+OAjV0rKT8o4oCcKShbXuOAjOOAjuKAnOKAneOAj+OAjV0rKVvjgI/jgI1dKFte4oCdXSspPyQvbSxcblx0XHRcdFx0cjogJyQxJDIkM+KAnSQ0Jyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC/vvIzigJTigJQvZyxcblx0XHRcdFx0cjogJ+KAlOKAlCcsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKD866KmxfOivnSkvdWcsXG5cdFx0XHRcdHI6ICfoqbEnLFxuXHRcdFx0fSxcblx0XHRcdFsv44CAWyBcXHRdK++8iC9nLCAn44CA77yIJ10sXG5cblx0XHRcdC8vWyfoo73mraInLCAn5Yi25q2iJ10sXG5cblx0XHRcdC8vWyfpoJDpmLLmgKfpm57ptKgnLCAn6aCQ6Ziy5oCn576I5oq8J10sXG5cblx0XHRcdC8vWyfmn6XmsLRb6Yy26KGoXScsICfmn6XmsLTpjLYnXSxcblxuXHRcdF0gYXMgSVdvcmRzT3V0cHV0W10sXG5cblx0fTtcblx0cHVibGljIG9wdGlvbnMgPSB7fTtcblxuXHRwdWJsaWMgX3dvcmRzX3IxID0gU1BfUkVHRVhQO1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM/KVxuXHR7XG5cdFx0bGV0IF9zZWxmID0gdGhpcztcblxuXHRcdGxldCByID0gdGhpcy5fd29yZHNfcjE7XG5cblx0XHRsZXQgYXJyID0gW11cblx0XHRcdC5jb25jYXQob3B0aW9ucyAmJiBvcHRpb25zLndvcmRzX2Jsb2NrID8gb3B0aW9ucy53b3Jkc19ibG9jayA6IG51bGwpXG5cdFx0O1xuXG5cdFx0dGhpcy5fZGF0YV8ud29yZHMgPSB0aGlzLl93b3JkczEoYXJyLCB0aGlzLl9kYXRhXy53b3Jkcyk7XG5cdFx0dGhpcy5fZGF0YV8ud29yZHMgPSB0aGlzLl93b3JkczIodGhpcy5fZGF0YV8ud29yZHMpO1xuXHR9XG5cblx0c3RhdGljIGNyZWF0ZSguLi5hcmd2KVxuXHR7XG5cdFx0cmV0dXJuIG5ldyB0aGlzKC4uLmFyZ3YpO1xuXHR9XG5cblx0X3dvcmRzMShhcnI6IHN0cmluZ1tdLCB3b3JkcyA9IFtdKTogSVdvcmRzT3V0cHV0W11cblx0e1xuXHRcdGxldCByID0gdGhpcy5fd29yZHNfcjE7XG5cblx0XHRhcnJcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKGVsLCBpbmRleCwgYXJyKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZWwgJiYgKGluZGV4ID09IGFyci5pbmRleE9mKGVsKSk7XG5cdFx0XHR9KVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYSA9IHZhbHVlLnNwbGl0KCdAJyk7XG5cblx0XHRcdFx0Lypcblx0XHRcdFx0X3NlbGYuX2RhdGFfLndvcmRzLnB1c2goe1xuXHRcdFx0XHRcdHM6IG5ldyBSZWdFeHAoYCgke2FbMF19KSR7cn0oJHthWzFdfSlgLCAnZycpLFxuXHRcdFx0XHRcdHI6ICckMSQyJyxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCovXG5cblx0XHRcdFx0bGV0IHMgPSBhLmpvaW4oYCkke3J9KGApO1xuXG5cdFx0XHRcdHdvcmRzLnB1c2goe1xuXHRcdFx0XHRcdHM6IG5ldyBSZWdFeHAoYCgke3N9KWAsICdnJyksXG5cdFx0XHRcdFx0cjogYS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuICckJyArIChpbmRleCArIDEpO1xuXHRcdFx0XHRcdH0pLmpvaW4oJycpLFxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0cmV0dXJuIHdvcmRzO1xuXHR9XG5cblx0X3dvcmRzMih3b3Jkcyk6IElXb3Jkc091dHB1dFtdXG5cdHtcblx0XHRsZXQgciA9IHRoaXMuX3dvcmRzX3IxO1xuXG5cdFx0cmV0dXJuIHdvcmRzLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRpZiAodmFsdWUubm9fcmVnZXgpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmICh2YWx1ZS5sZW5ndGggPT0gMiB8fCB2YWx1ZS5sZW5ndGggPj0gMykpXG5cdFx0XHR7XG5cdFx0XHRcdHZhbHVlID0ge1xuXHRcdFx0XHRcdF9zb3VyY2U6IHZhbHVlLFxuXG5cdFx0XHRcdFx0czogdmFsdWVbMF0sXG5cdFx0XHRcdFx0cjogdmFsdWVbMV0sXG5cblx0XHRcdFx0XHRmbGFnczogdmFsdWVbMl0sXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgdmFsdWUucyA9PSAnc3RyaW5nJyAmJiAodmFsdWUucyBhcyBzdHJpbmcpLm1hdGNoKG5ldyBSZWdFeHAoYCR7U1BfS0VZfSguKykkYCkpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGlmICghdmFsdWUuX3NvdXJjZSkgdmFsdWUuX3NvdXJjZSA9IHZhbHVlLnM7XG5cblx0XHRcdFx0bGV0IGEgPSB2YWx1ZS5zLnNwbGl0KFNQX0tFWSk7XG5cdFx0XHRcdGxldCBzID0gYS5qb2luKGApJHtyfShgKTtcblxuXHRcdFx0XHR2YWx1ZS5zID0gbmV3IFJlZ0V4cChgKCR7c30pYCwgdmFsdWUuZmxhZ3MgPyB2YWx1ZS5mbGFncyA6ICdnJyk7XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh2YWx1ZS5zKTtcblxuXHRcdFx0XHRpZiAodmFsdWUuciA9PT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhbHVlLnIgPSBhLm1hcChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJyQnICsgKGluZGV4ICsgMSk7XG5cdFx0XHRcdFx0fSkuam9pbignJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS5zID09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGlmICghdmFsdWUuX3NvdXJjZSkgdmFsdWUuX3NvdXJjZSA9IHZhbHVlLnM7XG5cblx0XHRcdFx0dmFsdWUucyA9IG5ldyBSZWdFeHAodmFsdWUucywgdmFsdWUuZmxhZ3MgPyB2YWx1ZS5mbGFncyA6ICdnJyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5sZW5ndGggPT0gMSAmJiB0eXBlb2YgdmFsdWVbMF0gPT0gJ2Z1bmN0aW9uJylcblx0XHRcdHtcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZVswXTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiB2YWx1ZS5mbiA9PSAnZnVuY3Rpb24nKVxuXHRcdFx0e1xuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlLmZuO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXBsYWNlKHRleHQsIG9wdGlvbnM6IElPcHRpb25zID0ge30pOiBzdHJpbmdcblx0e1xuXHRcdGlmICghdGV4dCB8fCAhL1teXFxzXS8udGVzdCh0ZXh0KSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGV4dDtcblx0XHR9XG5cblx0XHRsZXQgX3NlbGYgPSB0aGlzO1xuXG5cdFx0bGV0IF9yZXQgPSB0aGlzLnRvU3RyKHRleHQpXG5cdFx0XHQucmVwbGFjZShfc2VsZi5fZGF0YV8ucnRyaW0sICcnKVxuXHRcdDtcblxuXHRcdGlmIChvcHRpb25zLnBhZF9lbmcpXG5cdFx0e1xuXHRcdFx0X3JldCA9IHRoaXMucGFkZGluZ0VuZyhfcmV0KTtcblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucy53b3Jkcylcblx0XHR7XG5cdFx0XHRfcmV0ID0gdGhpcy5yZXBsYWNlX3dvcmRzKF9yZXQsIF9zZWxmLl9kYXRhXy53b3JkcywgX3NlbGYuX2NhY2hlXy53b3JkcykudmFsdWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIF9yZXQ7XG5cdH1cblxuXHRyZXBsYWNlX3dvcmRzKF9yZXQsIHdvcmRzOiBJV29yZHNPdXRwdXRbXSwgX2NhY2hlX3dvcmRzPylcblx0e1xuXHRcdGlmICghX2NhY2hlX3dvcmRzKVxuXHRcdHtcblx0XHRcdF9jYWNoZV93b3JkcyA9IG5ldyBNYXAoKTtcblx0XHR9XG5cblx0XHRmb3IgKGxldCBpIGluIHdvcmRzKVxuXHRcdHtcblx0XHRcdGxldCBfbmV3O1xuXG5cdFx0XHRpZiAodHlwZW9mIHdvcmRzW2ldID09ICdmdW5jdGlvbicpXG5cdFx0XHR7XG5cdFx0XHRcdF9uZXcgPSAod29yZHNbaV0gYXMgRnVuY3Rpb24pKF9yZXQsIF9jYWNoZV93b3Jkcyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBfciA9IHdvcmRzW2ldLnM7XG5cblx0XHRcdFx0X25ldyA9IF9yZXQucmVwbGFjZShfciwgd29yZHNbaV0ucik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfbmV3ICE9IF9yZXQpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBteU1hcCA9IFtdO1xuXG5cdFx0XHRcdGlmIChfY2FjaGVfd29yZHMuaGFzKHdvcmRzW2ldKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG15TWFwID0gX2NhY2hlX3dvcmRzLmdldCh3b3Jkc1tpXSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRteU1hcC5wdXNoKHtcblx0XHRcdFx0XHRvbGQ6IF9yZXQsXG5cdFx0XHRcdFx0bmV3OiBfbmV3LFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRfY2FjaGVfd29yZHMuc2V0KHdvcmRzW2ldLCBteU1hcCk7XG5cblx0XHRcdFx0X3JldCA9IF9uZXc7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghL1teXFxzXS8udGVzdChfcmV0KSlcblx0XHRcdHtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHZhbHVlOiBfcmV0IGFzIHN0cmluZyxcblx0XHRcdGNhY2hlOiBfY2FjaGVfd29yZHMsXG5cdFx0fTtcblx0fVxuXG5cdHBhZGRpbmdFbmcodGV4dDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IF9zZWxmID0gdGhpcztcblxuXHRcdHJldHVybiB0aGlzLnRvU3RyKHRleHQpXG5cdFx0XHQucmVwbGFjZShfc2VsZi5fZGF0YV8ubTAsIGZ1bmN0aW9uICguLi5hcmd2KVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYXJndlsyXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBvbGQgPSBhcmd2WzJdO1xuXG5cdFx0XHRcdFx0aWYgKGFyZ3ZbMl0ubGVuZ3RoID4gMSAmJiBhcmd2WzFdICYmICFfc2VsZi5fZGF0YV8ucjEudGVzdChhcmd2WzFdKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRhcmd2WzJdID0gJyAnICsgYXJndlsyXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoYXJndlszXSAmJiAhX3NlbGYuX2RhdGFfLnIxLnRlc3QoYXJndlszXSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YXJndlsyXSA9IGFyZ3ZbMl0gKyAnICc7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKG9sZCAhPSBhcmd2WzJdKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdF9zZWxmLl9jYWNoZV8ucmVwbGFjZS5wdXNoKHtcblx0XHRcdFx0XHRcdFx0b2xkOiBvbGQsXG5cdFx0XHRcdFx0XHRcdG5ldzogYXJndlsyXSxcblxuXHRcdFx0XHRcdFx0XHRkYXRhOiBhcmd2LFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUuZGVidWcoW29sZCwgYXJndlsyXV0sIGFyZ3YpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiAoYXJndlsxXSB8fCAnJykgKyBhcmd2WzJdLnJlcGxhY2UoLyggKXsyLH0vZywgJyQxJykgKyAoYXJndlszXSB8fCAnJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYXJndlswXTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRjbGVhckxGKHRleHQ6IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLnRyaW0odGV4dClcblx0XHRcdC5yZXBsYWNlKC9cXG57NCx9L2csICdcXG5cXG4nKVxuXHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vZywgJ1xcblxcbicpXG5cdFx0XHQ7XG5cdH1cblxuXHR0cmltKHRleHQ6IEJ1ZmZlciwgb3B0aW9ucz8pOiBzdHJpbmdcblx0dHJpbSh0ZXh0OiBzdHJpbmcsIG9wdGlvbnM/KTogc3RyaW5nXG5cdHRyaW0odGV4dDogbnVtYmVyLCBvcHRpb25zPyk6IHN0cmluZ1xuXHR0cmltKHRleHQsIG9wdGlvbnM/KTogc3RyaW5nXG5cdHtcblx0XHRsZXQgcmV0ID0gdGhpcy50b1N0cih0ZXh0LCBvcHRpb25zKVxuXHRcdFx0LnJlcGxhY2UoL1sgXFx044CAXFx4QTBcXHUzMDAwXStcXG4vZywgJ1xcbicpXG5cdFx0XHQucmVwbGFjZSgvXlxcbit8W1xcc+OAgFxceEEwXFx1MzAwMF0rJC9nLCAnJylcblx0XHRcdDtcblxuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnYm9vbGVhbicpXG5cdFx0e1xuXHRcdFx0b3B0aW9ucyA9IHtcblx0XHRcdFx0dHJpbTogISFvcHRpb25zLFxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHR0cmltOiBvcHRpb25zLFxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zKVxuXHRcdHtcblx0XHRcdGlmICh0eXBlb2Ygb3B0aW9ucy50cmltID09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQgPSBTdHJVdGlsLnRyaW0ocmV0LCAn44CAJyArIG9wdGlvbnMudHJpbSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChvcHRpb25zLnRyaW0pXG5cdFx0XHR7XG5cdFx0XHRcdHJldCA9IFN0clV0aWwudHJpbShyZXQsICfjgIAnKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0dG9TdHIoc3RyOiBCdWZmZXIgfCBzdHJpbmcgfCBudW1iZXIgfCBhbnksIG9wdGlvbnM/OiBJVG9TdHJPcHRpb25zKTogc3RyaW5nXG5cdHRvU3RyKHN0cjogQnVmZmVyIHwgc3RyaW5nIHwgbnVtYmVyIHwgYW55LCBvcHRpb25zPzogc3RyaW5nKTogc3RyaW5nXG5cdHRvU3RyKHN0ciwgb3B0aW9ucz86IHN0cmluZyB8IElUb1N0ck9wdGlvbnMpOiBzdHJpbmdcblx0e1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnc3RyaW5nJylcblx0XHR7XG5cdFx0XHRvcHRpb25zID0ge1xuXHRcdFx0XHRMRjogb3B0aW9ucyxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuXHRcdFx0TEY6IFwiXFxuXCIsXG5cdFx0XHRhbGxvd19uYnNwOiBmYWxzZSxcblx0XHRcdGFsbG93X2JvbTogZmFsc2UsXG5cdFx0fSwgb3B0aW9ucyk7XG5cblx0XHRsZXQgcmV0ID0gY3JsZihzdHIudG9TdHJpbmcoKSwgb3B0aW9ucy5MRiB8fCBcIlxcblwiKVxuXHRcdFx0Ly8ucmVwbGFjZSgvXFxyXFxufFxccig/IVxcbil8XFxuL2csIG9wdGlvbnMuTEYgfHwgXCJcXG5cIilcblx0XHRcdC8vIGh0dHA6Ly93d3cuY2hhcmJhc2UuY29tLzIwMmEtdW5pY29kZS1sZWZ0LXRvLXJpZ2h0LWVtYmVkZGluZ1xuXG5cdFx0XHQvKlxuXHRcdFx0LnJlcGxhY2UoL1tcXHUyMDAwLVxcdTIwMEZdL2csICcnKVxuXHRcdFx0LnJlcGxhY2UoL1tcXHUyMDI4LVxcdTIwMkZdL2csICcnKVxuXHRcdFx0LnJlcGxhY2UoL1tcXHUyMDVGLVxcdTIwNjBdL2csICcnKVxuXHRcdFx0Ki9cblx0XHQ7XG5cblx0XHRyZXQgPSBTdHJVdGlsLm5vcm1hbGl6ZShyZXQsIG9wdGlvbnMpO1xuXG5cdFx0Lypcblx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfYm9tKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5yZXBsYWNlKC9cXHVGRUZGL2csICcnKTtcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfbmJzcClcblx0XHR7XG5cdFx0XHRyZXQgPSByZXQucmVwbGFjZSgvWyDCoFxceEEwXS9nLCAnICcpO1xuXHRcdH1cblx0XHQqL1xuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdGZpeE9wdGlvbnMob3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zKVxuXHR7XG5cdFx0T2JqZWN0LmVudHJpZXMob3B0aW9ucylcblx0XHRcdC5mb3JFYWNoKChbaywgdl0pID0+IG9wdGlvbnNba10gPSBlbnZWYWwodikpXG5cdFx0O1xuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICog6YCa55So5Z6L5q616JC96Kq/5pW0XG5cdCAqXG5cdCAqIEByZXR1cm5zIHtzdHJpbmd9XG5cdCAqL1xuXHR0ZXh0bGF5b3V0KGh0bWwsIG9wdGlvbnM6IElUZXh0TGF5b3V0T3B0aW9ucyA9IHt9KTogc3RyaW5nXG5cdHtcblx0XHRvcHRpb25zID0gdGhpcy5maXhPcHRpb25zKG9wdGlvbnMpO1xuXG5cdFx0aHRtbCA9IHRoaXMudHJpbShodG1sLCBvcHRpb25zKTtcblxuXHRcdGh0bWwgPSAvL2h0bWxcblx0XHRcdC8vLnJlcGxhY2UoL1xcclxcbnxcXHIoPyFcXG4pL2csIFwiXFxuXCIpXG5cdFx0XHRodG1sXG5cdFx0XHQucmVwbGFjZSgvWyDjgIBcXHRdK1xcbi9nLCBcIlxcblwiKVxuXHRcdFx0LnJlcGxhY2UoL1tcXHPjgIBdKyQvZywgJycpXG5cdFx0XHQucmVwbGFjZSgvXltcXG4gXFx0XSsvZywgJycpXG5cdFx0XHQucmVwbGFjZSgvXFxuezQsfS9nLCBcIlxcblxcblxcblxcblwiKVxuXHRcdDtcblxuXHRcdGlmICghaHRtbC5tYXRjaCgvW15cXG5dXFxuW15cXG5dL2cpKVxuXHRcdHtcblx0XHRcdGxldCBbbWluLCBtaWQsIG1heF0gPSBjaGtCbGFua0xpbmUoaHRtbC50b1N0cmluZygpKTtcblxuXHRcdFx0aWYgKG1pbiA+IDIpXG5cdFx0XHR7XG5cdFx0XHRcdG9wdGlvbnMuYWxsb3dfbGYyID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtYXggPj0gMylcblx0XHRcdHtcblx0XHRcdFx0aWYgKG1pbiA+IDIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgciA9IG5ldyBSZWdFeHAoYFxcXFxueyR7bWluIC0gMX19KFxcXFxuKilgLCAnZycpO1xuXG5cdFx0XHRcdFx0aHRtbCA9IGh0bWxcblx0XHRcdFx0XHRcdC8vLnJlcGxhY2UoL1xcbnsyfShcXG4qKS9nLCAnJDEnKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UociwgJyQxJylcblx0XHRcdFx0XHQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXG57Myx9L2csIFwiXFxuXFxuXFxuXCIpXG5cdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXFxuezJ9L2csIFwiXFxuXCIpXG5cdFx0XHRcdDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFvcHRpb25zLmFsbG93X2xmMilcblx0XHRcdHtcblx0XHRcdFx0aHRtbCA9IGh0bWxcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxuXFxuL2csIFwiXFxuXCIpXG5cdFx0XHRcdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRodG1sID0gaHRtbFxuXHRcdFx0Ly8gZm9yIHRzXG5cdFx0XHQudG9TdHJpbmcoKVxuXHRcdFx0LnJlcGxhY2UoLyhbXlxcbuOAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8iVxcW1xcXVwiXSg/OlvvvIHvvJ8/IeOAgl0qKT8pXFxuKCg/OlvigJRdKyk/W+OAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pL3VnLCBcIiQxXFxuXFxuJDJcIilcblxuXHRcdFx0LnJlcGxhY2UoLyhb44CM44CN44CQ44CR44CK44CL4oCc4oCd44CO44CP77yI77yJ4oCVXFxbXFxdXCJdKD86W++8ge+8nz8h44CCXSopPylcXG4oKD8644CAKilbXlxcbuOAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pL3VnLCBcIiQxXFxuXFxuJDJcIilcblx0XHRcdC5yZXBsYWNlKC8oW15cXG7jgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvIlcXFtcXF1cIuKJquKJq10oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzpb4oCUXSspP1viiariiavjgIzjgI3igJzigJ3jgJDjgJHjgIrjgIvvvIjvvInjgI7jgI9dKS91ZywgXCIkMVxcblxcbiQyXCIpXG5cblx0XHRcdC5yZXBsYWNlKC8oW+OAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8ieKAlVxcW1xcXVwiXSg/OlvvvIHvvJ8/IeOAgl0qKT8pXFxuKCg/OuOAgCopW15cXG7jgIzjgI3igJzigJ3jgJDjgJHjgIrjgIvvvIjvvInjgI7jgI9dKS91ZywgXCIkMVxcblxcbiQyXCIpXG5cblx0XHRcdC5yZXBsYWNlKC8o77yJKD86W++8ge+8nz8h44CCXSopPylcXG4oW+OAjOOAjeOAkOOAkeOAiuOAi+OAjuOAj+KAnOKAnV0pL3VnLCBcIiQxXFxuXFxuJDJcIilcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBodHRwczovL3RpZWJhLmJhaWR1LmNvbS9wLzU0MDA1MDM4NjRcblx0XHRcdCAqXG5cdFx0XHQgKiDjgIznrKzkuInor5XngrzkuZ/vvIzlpJrkuo/kuoblpq7pnLLogIzpgJrov4fkuoblkJfigKbigKbjgI1cblx0XHRcdCDjgI7lv4PnpZ7lrojmiqTnmoTnmb3nvr3mr5vjgI/vvIzov5nkuKrku47lpq7pnLLpgqPph4zmlLbliLDnmoTmiqTouqvnrKbvvIznoa7lrp7lnLDlrojmiqTkuobmiJHnmoTlv4PjgIJcblxuXHRcdFx0ICovXG5cdFx0XHQucmVwbGFjZSgvKFvjgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvInigJVdKD86W++8ge+8nz8h44CCXSopPylcXG4oKD86W+OAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pKD86W15cXG5dKykoW17jgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvInigJVdKD86W++8ge+8nz8h44CCXSopPylcXG4pL3VnLCBcIiQxXFxuJDJcXG5cIilcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiDkvY/miYvvvIzkvY/miYvvvIzmiJHlsLHmmK/miJHjgILkuI3mmK/lhbbku5bnmoTku7vkvZXkurrjgIJcblx0XHRcdCDjgIDooajnpLrlh7ropoHlv4XmrbvlnLDov5vooYzmirXmipfnmoTmhI/lv5fvvIzkvYbmmK/kvrXlhaXohJHlhoXnmoTov5nkuKrjgI7ku4DkuYjkuJzopb/jgI/vvIzlubbkuI3og73ooqvpmLvmraLjgILkuI3og73ooqvvvIzpmLvmraLigKbigKZcblx0XHRcdCAqL1xuXHRcdFx0LnJlcGxhY2UoLyhcXG4oPzpbXuOAgFxcbl1bXlxcbl0rKSlcXG4oW+OAgF0pL2csICckMVxcblxcbiQyJylcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiDov5nmoLfkuIDnm7TlnKjov5npq5jlhbTnnYBcblxuXHRcdFx0IOOAglxuXHRcdFx0ICovXG5cdFx0XHQvLy5yZXBsYWNlKC8oW15cXG5dKShcXG4rKSgoPzpb5ZCn5ZGiXSopP1vjgILvvIHvvJ/vvIzjgIFdKVxcbi91ZywgXCIkMSQzJDJcIilcblxuXHRcdFx0LnJlcGxhY2UoLyhbXlxcbl0pKFxcbispKGZpbnxcXDzlroxcXD4pKFxcbnwkKS9pZywgXCIkMSQyXFxuJDMkNFwiKVxuXHRcdDtcblxuXHRcdGh0bWwgPSBodG1sXG5cdFx0XHQucmVwbGFjZSgvXlxcbit8W1xcc+OAgF0rJC9nLCAnJylcblx0XHRcdC8qXG5cdFx0XHQucmVwbGFjZSgvKFxcbil7NCx9L2csIFwiXFxuXFxuXFxuXFxuXCIpXG5cdFx0XHQucmVwbGFjZSgvKFxcbil7M30vZywgXCJcXG5cXG5cIilcblx0XHRcdCovXG5cdFx0XHQucmVwbGFjZSgvKFxcbil7NCx9L2csIFwiXFxuXFxuXFxuXFxuXCIpXG5cblx0XHQ7XG5cblx0XHRcdGlmIChvcHRpb25zLmFsbG93X2xmMylcblx0XHRcdHtcblx0XHRcdFx0aHRtbCA9IGh0bWxcblx0XHRcdFx0XHQucmVwbGFjZSgvKFxcbil7Myx9L2csIFwiXFxuXFxuXFxuXCIpXG5cdFx0XHRcdDtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0aHRtbCA9IGh0bWxcblx0XHRcdFx0XHQucmVwbGFjZSgvKFxcbil7M30vZywgXCJcXG5cXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0cmV0dXJuIGh0bWw7XG5cdH1cblxufVxuXG5pbXBvcnQgKiBhcyBOb3ZlbFRleHQgZnJvbSAnLi90ZXh0JztcblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxUZXh0O1xuIl19