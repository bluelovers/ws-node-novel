"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
const blank_line_1 = require("blank-line");
const crlf_normalize_1 = require("crlf-normalize");
const tieba_harmony_1 = require("tieba-harmony");
exports.SP_REGEXP = tieba_harmony_1.SP_REGEXP;
exports.SP_KEY = tieba_harmony_1.SP_KEY;
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
    textlayout(html, options = {}) {
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
