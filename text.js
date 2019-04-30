"use strict";
/**
 * Created by user on 2017/12/5/005.
 */
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
                /*
                {
                    s: '（·）',
                    r: '',
                },
                */
                {
                    s: /\.{3}/g,
                    r: '…',
                },
                {
                    s: /…\.{1,2}/g,
                    r: '……',
                },
                /*
                {
                    s: /(第)(?:[\_\t\uFEFF\xA0　]+)(\d+)(?:[\_\t\uFEFF\xA0　]+)(话|頁|夜|章)/g,
                    r: '$1 $2 $3',
                },
                {
                    s: /(第)(?:[\_\t\uFEFF\xA0　]+)?(\d+)(?:[\_\t\uFEFF\xA0　]+)(话|頁|夜|章)/g,
                    r: '$1 $2 $3',
                },
                {
                    s: /(第)(?:[\_\t\uFEFF\xA0　]+)(\d+)(?:[\_\t\uFEFF\xA0　]+)?(话|頁|夜|章)/g,
                    r: '$1 $2 $3',
                },
                */
                {
                    s: /(话|日|章)[\_\t\uFEFF\xA0]+/ig,
                    r: '$1 ',
                },
                {
                    s: '！　',
                    r: '！',
                    no_regex: false,
                },
                /*
                {
                    r: /([「」【】《》『』（）])/ig,
                    s: '$1',
                },
                */
                /*
                {
                    s: /(\?\?)[ \t　]+(\?\?)/ig,
                    r: '$1$2',
                },
                {
                    s: /「([^「『』」]+)?『([^\n』]+)」([^「『』」]+)?』/,
                    r: '「$1『$2』$3」',
                },
                {
                    s: /『([^「『』」]+)?「([^\n」]+)』([^「『』」]+)?」/,
                    r: '『$1「$2」$3』',
                },
                {
                    s: /情\s*se\s*小说/ig,
                    r: '情色小说',
                },
                */
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
            /*
            _self._data_.words.push({
                s: new RegExp(`(${a[0]})${r}(${a[1]})`, 'g'),
                r: '$1$2',
            });
            */
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
            // @ts-ignore
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
                // @ts-ignore
                if (!value._source)
                    value._source = value.s;
                let a = value.s.split(tieba_harmony_1.SP_KEY);
                let s = a.join(`)${r}(`);
                value.s = new RegExp(`(${s})`, value.flags ? value.flags : 'g');
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
                    //console.debug([old, argv[2]], argv);
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
    reduceLine(html, options = {}) {
        options = this.fixOptions(options);
        if (options.allow_lf2) {
            return html;
        }
        let old = this.trim(html, options);
        old = //html
            //.replace(/\r\n|\r(?!\n)/g, "\n")
            old
                .replace(/[ 　\t]+\n/g, "\n")
                .replace(/[\s　]+$/g, '')
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
    textlayout(html, options = {}) {
        options = this.fixOptions(options);
        html = this.trim(html, options);
        html = //html
            //.replace(/\r\n|\r(?!\n)/g, "\n")
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
                    let r = new RegExp(`\\n{${min - 1}}(\\n+)`, 'g');
                    html = html
                        //.replace(/\n{2}(\n*)/g, '$1')
                        .replace(r, '$1');
                }
                html = html
                    .replace(/\n{3,}/g, "\n\n\n");
            }
            //console.log(options);
            if (!options.allow_lf2) {
                html = html
                    .replace(/\n\n/g, "\n");
            }
        }
        html = html
            // for ts
            .toString()
            .replace(/([^\n「」【】《》“”『』（）\[\]"](?:[！？?!。]*)?)\n((?:[—]+)?[「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:　*)[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/([^\n「」【】《》“”『』（）\[\]"≪≫](?:[！？?!。]*)?)\n((?:[—]+)?[≪≫「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:　*)[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")
            .replace(/(）(?:[！？?!。]*)?)\n([「」【】《》『』“”])/ug, "$1\n\n$2")
            /**
             * https://tieba.baidu.com/p/5400503864
             *
             * 「第三试炼也，多亏了妮露而通过了吗……」
             『心神守护的白羽毛』，这个从妮露那里收到的护身符，确实地守护了我的心。

             */
            .replace(/([「」【】《》“”『』（）―](?:[！？?!。]*)?)\n((?:[「」“”【】《》（）『』])(?:[^\n]+)([^\n「」【】《》“”『』（）―](?:[！？?!。]*)?)\n)/ug, "$1\n$2\n")
            /**
             * 住手，住手，我就是我。不是其他的任何人。
              表示出要必死地进行抵抗的意志，但是侵入脑内的这个『什么东西』，并不能被阻止。不能被，阻止……
             */
            .replace(/(\n(?:[^　\n][^\n]+))\n([　])/g, '$1\n\n$2')
            /**
             * 这样一直在这高兴着

             。
             */
            //.replace(/([^\n])(\n+)((?:[吧呢]*)?[。！？，、])\n/ug, "$1$3$2")
            .replace(/([^\n])(\n+)(fin|\<完\>)(\n|$)/ig, "$1$2\n$3$4");
        html = html
            .replace(/^\n+|[\s　]+$/g, '')
            /*
            .replace(/(\n){4,}/g, "\n\n\n\n")
            .replace(/(\n){3}/g, "\n\n")
            */
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
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILG9DQUFxQztBQUNyQywyQ0FBc0M7QUFDdEMsbURBQTBDO0FBQzFDLGlEQUFnRTtBQUd2RCxvQkFIYyx5QkFBUyxDQUdkO0FBQUUsaUJBSGMsc0JBQU0sQ0FHZDtBQUYxQix1Q0FBMkM7QUFzQzNDLE1BQWEsT0FBTztJQXVHbkIsWUFBWSxPQUFRO1FBckdiLFlBQU8sR0FBRztZQUNoQixPQUFPLEVBQUUsRUFBRTtZQUNYLEtBQUssRUFBRSxJQUFJLEdBQUcsRUFBRTtTQUNoQixDQUFDO1FBQ0ssV0FBTSxHQUFHO1lBQ2YsRUFBRSxFQUFFLHlGQUF5RjtZQUM3RixFQUFFLEVBQUUscUZBQXFGO1lBRXpGLEtBQUssRUFBRSxvQkFBb0I7WUFFM0IsS0FBSyxFQUFFO2dCQUNOOzs7OztrQkFLRTtnQkFDRjtvQkFDQyxDQUFDLEVBQUUsUUFBUTtvQkFDWCxDQUFDLEVBQUUsR0FBRztpQkFDTjtnQkFDRDtvQkFDQyxDQUFDLEVBQUUsV0FBVztvQkFDZCxDQUFDLEVBQUUsSUFBSTtpQkFDUDtnQkFFRDs7Ozs7Ozs7Ozs7OztrQkFhRTtnQkFDRjtvQkFDQyxDQUFDLEVBQUUsNEJBQTRCO29CQUMvQixDQUFDLEVBQUUsS0FBSztpQkFDUjtnQkFDRDtvQkFDQyxDQUFDLEVBQUUsSUFBSTtvQkFDUCxDQUFDLEVBQUUsR0FBRztvQkFFTixRQUFRLEVBQUUsS0FBSztpQkFDZjtnQkFDRDs7Ozs7a0JBS0U7Z0JBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQWlCRTtnQkFDRjtvQkFDQyxDQUFDLEVBQUUsNkNBQTZDO29CQUNoRCxDQUFDLEVBQUUsV0FBVztpQkFDZDtnQkFDRDtvQkFDQyxDQUFDLEVBQUUsTUFBTTtvQkFDVCxDQUFDLEVBQUUsSUFBSTtpQkFDUDtnQkFDRDtvQkFDQyxDQUFDLEVBQUUsV0FBVztvQkFDZCxDQUFDLEVB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RUQ7WUFDQyxJQUFJLEdBQUcsSUFBSTtpQkFDVCxPQUFPLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUM1QjtTQUNEO1FBRUYsT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDO0NBRUQ7QUF0bkJELDBCQXNuQkM7QUFFRCxrQkFBZSxPQUFrQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxNy8xMi81LzAwNS5cbiAqL1xuXG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5pbXBvcnQgZ2V0TWluTWlkTWF4IGZyb20gJ2JsYW5rLWxpbmUnO1xuaW1wb3J0IGNybGYsIHsgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgdGllYmFIYXJtb255LCB7IFNQX1JFR0VYUCwgU1BfS0VZIH0gZnJvbSAndGllYmEtaGFybW9ueSc7XG5pbXBvcnQgeyBlbnZWYWwsIGVudkJvb2wgfSBmcm9tICdlbnYtYm9vbCc7XG5cbmV4cG9ydCB7IFNQX1JFR0VYUCwgU1BfS0VZIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNcbntcblx0d29yZHM/OiBib29sZWFuXG5cdHBhZF9lbmc/OiBib29sZWFuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdvcmRzT3V0cHV0XG57XG5cdF9zb3VyY2U/OiBhbnksXG5cblx0cz86IFJlZ0V4cCxcblx0cj86IHN0cmluZyB8IElSZWdFeHBDYWxsYmFjayxcblxuXHRmbGFncz86IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVnRXhwQ2FsbGJhY2tcbntcblx0KCQwOiBzdHJpbmcsICQxPzogc3RyaW5nLCAkMj86IHN0cmluZywgJDM/OiBzdHJpbmcsIC4uLmFyZ3YpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRvU3RyT3B0aW9uc1xue1xuXHRMRj86IHN0cmluZyxcblx0YWxsb3dfbmJzcD86IGJvb2xlYW4sXG5cdGFsbG93X2JvbT86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRleHRMYXlvdXRPcHRpb25zIGV4dGVuZHMgSVRvU3RyT3B0aW9uc1xue1xuXHRhbGxvd19sZjI/OiBib29sZWFuLFxuXHRhbGxvd19sZjM/OiBib29sZWFuLFxufVxuXG5leHBvcnQgY2xhc3MgZW5zcGFjZVxue1xuXHRwdWJsaWMgX2NhY2hlXyA9IHtcblx0XHRyZXBsYWNlOiBbXSxcblx0XHR3b3JkczogbmV3IE1hcCgpLFxuXHR9O1xuXHRwdWJsaWMgX2RhdGFfID0ge1xuXHRcdG0wOiAvKFteYS16MC05XFwtXFwuXFxzXSk/KFthLXowLTlcXC1cXC5dKyg/OlthLXowLTlcXC1cXC5cXHNdK1thLXowLTlcXC1cXC5dKyk/KShbXmEtejAtOVxcLVxcLlxcc10pPy91aWcsXG5cdFx0cjE6IC9b44CM44CN4pGg4oaSXFwnXFxcIjpcXC1cXCvvvIjvvInila7vvIjila/vvL/ilbDvvInila1cXChcXClcXFtcXF3ilqDjgJDjgJHjgIrjgIt+772e4oCc4oCd4oCY4oCZOu+8mu+8mu+8jCrvvIpA44CCz4njg7vjgIHjgIJg44CA4pSA5LiAXFxk44CO44CP4peGfuOAge+8n++8gVxcP1xcIcOXXFwuXFw8XFw+PeKApuODu10vaSxcblxuXHRcdHJ0cmltOiAvWyBcXHRcXHVGRUZGXFx4QTDjgIBdKyQvLFxuXG5cdFx0d29yZHM6IFtcblx0XHRcdC8qXG5cdFx0XHR7XG5cdFx0XHRcdHM6ICfvvIjCt++8iScsXG5cdFx0XHRcdHI6ICcnLFxuXHRcdFx0fSxcblx0XHRcdCovXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC9cXC57M30vZyxcblx0XHRcdFx0cjogJ+KApicsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAv4oCmXFwuezEsMn0vZyxcblx0XHRcdFx0cjogJ+KApuKApicsXG5cdFx0XHR9LFxuXG5cdFx0XHQvKlxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKOesrCkoPzpbXFxfXFx0XFx1RkVGRlxceEEw44CAXSspKFxcZCspKD86W1xcX1xcdFxcdUZFRkZcXHhBMOOAgF0rKSjor5186aCBfOWknHznq6ApL2csXG5cdFx0XHRcdHI6ICckMSAkMiAkMycsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKOesrCkoPzpbXFxfXFx0XFx1RkVGRlxceEEw44CAXSspPyhcXGQrKSg/OltcXF9cXHRcXHVGRUZGXFx4QTDjgIBdKyko6K+dfOmggXzlpJx856ugKS9nLFxuXHRcdFx0XHRyOiAnJDEgJDIgJDMnLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0czogLyjnrKwpKD86W1xcX1xcdFxcdUZFRkZcXHhBMOOAgF0rKShcXGQrKSg/OltcXF9cXHRcXHVGRUZGXFx4QTDjgIBdKyk/KOivnXzpoIF85aScfOeroCkvZyxcblx0XHRcdFx0cjogJyQxICQyICQzJyxcblx0XHRcdH0sXG5cdFx0XHQqL1xuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKOivnXzml6V856ugKVtcXF9cXHRcXHVGRUZGXFx4QTBdKy9pZyxcblx0XHRcdFx0cjogJyQxICcsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAn77yB44CAJyxcblx0XHRcdFx0cjogJ++8gScsXG5cblx0XHRcdFx0bm9fcmVnZXg6IGZhbHNlLFxuXHRcdFx0fSxcblx0XHRcdC8qXG5cdFx0XHR7XG5cdFx0XHRcdHI6IC8oW+OAjOOAjeOAkOOAkeOAiuOAi+OAjuOAj++8iO+8iV0pL2lnLFxuXHRcdFx0XHRzOiAnJDEnLFxuXHRcdFx0fSxcblx0XHRcdCovXG5cdFx0XHQvKlxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKFxcP1xcPylbIFxcdOOAgF0rKFxcP1xcPykvaWcsXG5cdFx0XHRcdHI6ICckMSQyJyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC/jgIwoW17jgIzjgI7jgI/jgI1dKyk/44COKFteXFxu44CPXSsp44CNKFte44CM44CO44CP44CNXSspP+OAjy8sXG5cdFx0XHRcdHI6ICfjgIwkMeOAjiQy44CPJDPjgI0nLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0czogL+OAjihbXuOAjOOAjuOAj+OAjV0rKT/jgIwoW15cXG7jgI1dKynjgI8oW17jgIzjgI7jgI/jgI1dKyk/44CNLyxcblx0XHRcdFx0cjogJ+OAjiQx44CMJDLjgI0kM+OAjycsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAv5oOFXFxzKnNlXFxzKuWwj+ivtC9pZyxcblx0XHRcdFx0cjogJ+aDheiJsuWwj+ivtCcsXG5cdFx0XHR9LFxuXHRcdFx0Ki9cblx0XHRcdHtcblx0XHRcdFx0czogL14oW17jgIzjgI7igJzigJ3jgI/jgI1dKyk/KOKAnCkoW17jgIzjgI7igJzigJ3jgI/jgI1dKylb44CP44CNXShbXuKAnV0rKT8kL20sXG5cdFx0XHRcdHI6ICckMSQyJDPigJ0kNCcsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAv77yM4oCU4oCUL2csXG5cdFx0XHRcdHI6ICfigJTigJQnLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0czogLyg/OuipsXzor50pL3VnLFxuXHRcdFx0XHRyOiAn6KmxJyxcblx0XHRcdH0sXG5cdFx0XHRbL+OAgFsgXFx0XSvvvIgvZywgJ+OAgO+8iCddLFxuXG5cdFx0XHQvL1sn6KO95q2iJywgJ+WItuatoiddLFxuXG5cdFx0XHQvL1sn6aCQ6Ziy5oCn6Zue6bSoJywgJ+mgkOmYsuaAp+e+iOaKvCddLFxuXG5cdFx0XHQvL1sn5p+l5rC0W+mMtuihqF0nLCAn5p+l5rC06Yy2J10sXG5cblx0XHRdIGFzIElXb3Jkc091dHB1dFtdLFxuXG5cdH07XG5cdHB1YmxpYyBvcHRpb25zID0ge307XG5cblx0cHVibGljIF93b3Jkc19yMSA9IFNQX1JFR0VYUDtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zPylcblx0e1xuXHRcdGxldCBfc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgciA9IHRoaXMuX3dvcmRzX3IxO1xuXG5cdFx0bGV0IGFyciA9IFtdXG5cdFx0XHQuY29uY2F0KG9wdGlvbnMgJiYgb3B0aW9ucy53b3Jkc19ibG9jayA/IG9wdGlvbnMud29yZHNfYmxvY2sgOiBudWxsKVxuXHRcdDtcblxuXHRcdHRoaXMuX2RhdGFfLndvcmRzID0gdGhpcy5fd29yZHMxKGFyciwgdGhpcy5fZGF0YV8ud29yZHMpO1xuXHRcdHRoaXMuX2RhdGFfLndvcmRzID0gdGhpcy5fd29yZHMyKHRoaXMuX2RhdGFfLndvcmRzKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGUoLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyguLi5hcmd2KTtcblx0fVxuXG5cdF93b3JkczEoYXJyOiBzdHJpbmdbXSwgd29yZHMgPSBbXSk6IElXb3Jkc091dHB1dFtdXG5cdHtcblx0XHRsZXQgciA9IHRoaXMuX3dvcmRzX3IxO1xuXG5cdFx0YXJyXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChlbCwgaW5kZXgsIGFycilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGVsICYmIChpbmRleCA9PSBhcnIuaW5kZXhPZihlbCkpO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGEgPSB2YWx1ZS5zcGxpdCgnQCcpO1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdF9zZWxmLl9kYXRhXy53b3Jkcy5wdXNoKHtcblx0XHRcdFx0XHRzOiBuZXcgUmVnRXhwKGAoJHthWzBdfSkke3J9KCR7YVsxXX0pYCwgJ2cnKSxcblx0XHRcdFx0XHRyOiAnJDEkMicsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQqL1xuXG5cdFx0XHRcdGxldCBzID0gYS5qb2luKGApJHtyfShgKTtcblxuXHRcdFx0XHR3b3Jkcy5wdXNoKHtcblx0XHRcdFx0XHRzOiBuZXcgUmVnRXhwKGAoJHtzfSlgLCAnZycpLFxuXHRcdFx0XHRcdHI6IGEubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiAnJCcgKyAoaW5kZXggKyAxKTtcblx0XHRcdFx0XHR9KS5qb2luKCcnKSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiB3b3Jkcztcblx0fVxuXG5cdF93b3JkczIod29yZHMpOiBJV29yZHNPdXRwdXRbXVxuXHR7XG5cdFx0bGV0IHIgPSB0aGlzLl93b3Jkc19yMTtcblxuXHRcdHJldHVybiB3b3Jkcy5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0aWYgKHZhbHVlLm5vX3JlZ2V4KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiAodmFsdWUubGVuZ3RoID09IDIgfHwgdmFsdWUubGVuZ3RoID49IDMpKVxuXHRcdFx0e1xuXHRcdFx0XHR2YWx1ZSA9IHtcblx0XHRcdFx0XHRfc291cmNlOiB2YWx1ZSxcblxuXHRcdFx0XHRcdHM6IHZhbHVlWzBdLFxuXHRcdFx0XHRcdHI6IHZhbHVlWzFdLFxuXG5cdFx0XHRcdFx0ZmxhZ3M6IHZhbHVlWzJdLFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlLnMgPT0gJ3N0cmluZycgJiYgKHZhbHVlLnMgYXMgc3RyaW5nKS5tYXRjaChuZXcgUmVnRXhwKGAke1NQX0tFWX0oLispJGApKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpZiAoIXZhbHVlLl9zb3VyY2UpIHZhbHVlLl9zb3VyY2UgPSB2YWx1ZS5zO1xuXG5cdFx0XHRcdGxldCBhID0gdmFsdWUucy5zcGxpdChTUF9LRVkpO1xuXHRcdFx0XHRsZXQgcyA9IGEuam9pbihgKSR7cn0oYCk7XG5cblx0XHRcdFx0dmFsdWUucyA9IG5ldyBSZWdFeHAoYCgke3N9KWAsIHZhbHVlLmZsYWdzID8gdmFsdWUuZmxhZ3MgOiAnZycpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2codmFsdWUucyk7XG5cblx0XHRcdFx0aWYgKHZhbHVlLnIgPT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YWx1ZS5yID0gYS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuICckJyArIChpbmRleCArIDEpO1xuXHRcdFx0XHRcdH0pLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUucyA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpZiAoIXZhbHVlLl9zb3VyY2UpIHZhbHVlLl9zb3VyY2UgPSB2YWx1ZS5zO1xuXG5cdFx0XHRcdHZhbHVlLnMgPSBuZXcgUmVnRXhwKHZhbHVlLnMsIHZhbHVlLmZsYWdzID8gdmFsdWUuZmxhZ3MgOiAnZycpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09IDEgJiYgdHlwZW9mIHZhbHVlWzBdID09ICdmdW5jdGlvbicpXG5cdFx0XHR7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUuZm4gPT0gJ2Z1bmN0aW9uJylcblx0XHRcdHtcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZS5mbjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVwbGFjZSh0ZXh0LCBvcHRpb25zOiBJT3B0aW9ucyA9IHt9KTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXRleHQgfHwgIS9bXlxcc10vLnRlc3QodGV4dCkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fVxuXG5cdFx0bGV0IF9zZWxmID0gdGhpcztcblxuXHRcdGxldCBfcmV0ID0gdGhpcy50b1N0cih0ZXh0KVxuXHRcdFx0LnJlcGxhY2UoX3NlbGYuX2RhdGFfLnJ0cmltLCAnJylcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9ucy5wYWRfZW5nKVxuXHRcdHtcblx0XHRcdF9yZXQgPSB0aGlzLnBhZGRpbmdFbmcoX3JldCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMud29yZHMpXG5cdFx0e1xuXHRcdFx0X3JldCA9IHRoaXMucmVwbGFjZV93b3JkcyhfcmV0LCBfc2VsZi5fZGF0YV8ud29yZHMsIF9zZWxmLl9jYWNoZV8ud29yZHMpLnZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBfcmV0O1xuXHR9XG5cblx0cmVwbGFjZV93b3JkcyhfcmV0LCB3b3JkczogSVdvcmRzT3V0cHV0W10sIF9jYWNoZV93b3Jkcz8pXG5cdHtcblx0XHRpZiAoIV9jYWNoZV93b3Jkcylcblx0XHR7XG5cdFx0XHRfY2FjaGVfd29yZHMgPSBuZXcgTWFwKCk7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSBpbiB3b3Jkcylcblx0XHR7XG5cdFx0XHRsZXQgX25ldztcblxuXHRcdFx0aWYgKHR5cGVvZiB3b3Jkc1tpXSA9PSAnZnVuY3Rpb24nKVxuXHRcdFx0e1xuXHRcdFx0XHRfbmV3ID0gKHdvcmRzW2ldIGFzIEZ1bmN0aW9uKShfcmV0LCBfY2FjaGVfd29yZHMpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgX3IgPSB3b3Jkc1tpXS5zO1xuXG5cdFx0XHRcdF9uZXcgPSBfcmV0LnJlcGxhY2UoX3IsIHdvcmRzW2ldLnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX25ldyAhPSBfcmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbXlNYXAgPSBbXTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX3dvcmRzLmhhcyh3b3Jkc1tpXSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRteU1hcCA9IF9jYWNoZV93b3Jkcy5nZXQod29yZHNbaV0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bXlNYXAucHVzaCh7XG5cdFx0XHRcdFx0b2xkOiBfcmV0LFxuXHRcdFx0XHRcdG5ldzogX25ldyxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0X2NhY2hlX3dvcmRzLnNldCh3b3Jkc1tpXSwgbXlNYXApO1xuXG5cdFx0XHRcdF9yZXQgPSBfbmV3O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIS9bXlxcc10vLnRlc3QoX3JldCkpXG5cdFx0XHR7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogX3JldCBhcyBzdHJpbmcsXG5cdFx0XHRjYWNoZTogX2NhY2hlX3dvcmRzLFxuXHRcdH07XG5cdH1cblxuXHRwYWRkaW5nRW5nKHRleHQ6IHN0cmluZylcblx0e1xuXHRcdGxldCBfc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gdGhpcy50b1N0cih0ZXh0KVxuXHRcdFx0LnJlcGxhY2UoX3NlbGYuX2RhdGFfLm0wLCBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdHtcblx0XHRcdFx0aWYgKGFyZ3ZbMl0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgb2xkID0gYXJndlsyXTtcblxuXHRcdFx0XHRcdGlmIChhcmd2WzJdLmxlbmd0aCA+IDEgJiYgYXJndlsxXSAmJiAhX3NlbGYuX2RhdGFfLnIxLnRlc3QoYXJndlsxXSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YXJndlsyXSA9ICcgJyArIGFyZ3ZbMl07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGFyZ3ZbM10gJiYgIV9zZWxmLl9kYXRhXy5yMS50ZXN0KGFyZ3ZbM10pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGFyZ3ZbMl0gPSBhcmd2WzJdICsgJyAnO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvbGQgIT0gYXJndlsyXSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfc2VsZi5fY2FjaGVfLnJlcGxhY2UucHVzaCh7XG5cdFx0XHRcdFx0XHRcdG9sZDogb2xkLFxuXHRcdFx0XHRcdFx0XHRuZXc6IGFyZ3ZbMl0sXG5cblx0XHRcdFx0XHRcdFx0ZGF0YTogYXJndixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmRlYnVnKFtvbGQsIGFyZ3ZbMl1dLCBhcmd2KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gKGFyZ3ZbMV0gfHwgJycpICsgYXJndlsyXS5yZXBsYWNlKC8oICl7Mix9L2csICckMScpICsgKGFyZ3ZbM10gfHwgJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGFyZ3ZbMF07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0Y2xlYXJMRih0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltKHRleHQpXG5cdFx0XHQucmVwbGFjZSgvXFxuezQsfS9nLCAnXFxuXFxuJylcblx0XHRcdC5yZXBsYWNlKC9cXG57Myx9L2csICdcXG5cXG4nKVxuXHRcdFx0O1xuXHR9XG5cblx0dHJpbSh0ZXh0OiBCdWZmZXIsIG9wdGlvbnM/KTogc3RyaW5nXG5cdHRyaW0odGV4dDogc3RyaW5nLCBvcHRpb25zPyk6IHN0cmluZ1xuXHR0cmltKHRleHQ6IG51bWJlciwgb3B0aW9ucz8pOiBzdHJpbmdcblx0dHJpbSh0ZXh0LCBvcHRpb25zPyk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IHJldCA9IHRoaXMudG9TdHIodGV4dCwgb3B0aW9ucylcblx0XHRcdC5yZXBsYWNlKC9bIFxcdOOAgFxceEEwXFx1MzAwMF0rXFxuL2csICdcXG4nKVxuXHRcdFx0LnJlcGxhY2UoL15cXG4rfFtcXHPjgIBcXHhBMFxcdTMwMDBdKyQvZywgJycpXG5cdFx0XHQ7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ2Jvb2xlYW4nKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRcdHRyaW06ICEhb3B0aW9ucyxcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0b3B0aW9ucyA9IHtcblx0XHRcdFx0dHJpbTogb3B0aW9ucyxcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucylcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHJpbSA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0cmV0ID0gU3RyVXRpbC50cmltKHJldCwgJ+OAgCcgKyBvcHRpb25zLnRyaW0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAob3B0aW9ucy50cmltKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQgPSBTdHJVdGlsLnRyaW0ocmV0LCAn44CAJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHRvU3RyKHN0cjogQnVmZmVyIHwgc3RyaW5nIHwgbnVtYmVyIHwgYW55LCBvcHRpb25zPzogSVRvU3RyT3B0aW9ucyk6IHN0cmluZ1xuXHR0b1N0cihzdHI6IEJ1ZmZlciB8IHN0cmluZyB8IG51bWJlciB8IGFueSwgb3B0aW9ucz86IHN0cmluZyk6IHN0cmluZ1xuXHR0b1N0cihzdHIsIG9wdGlvbnM/OiBzdHJpbmcgfCBJVG9TdHJPcHRpb25zKTogc3RyaW5nXG5cdHtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0b3B0aW9ucyA9IHtcblx0XHRcdFx0TEY6IG9wdGlvbnMsXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdExGOiBcIlxcblwiLFxuXHRcdFx0YWxsb3dfbmJzcDogZmFsc2UsXG5cdFx0XHRhbGxvd19ib206IGZhbHNlLFxuXHRcdH0sIG9wdGlvbnMpO1xuXG5cdFx0bGV0IHJldCA9IGNybGYoc3RyLnRvU3RyaW5nKCksIG9wdGlvbnMuTEYgfHwgTEYpXG5cdFx0XHQvLy5yZXBsYWNlKC9cXHJcXG58XFxyKD8hXFxuKXxcXG4vZywgb3B0aW9ucy5MRiB8fCBcIlxcblwiKVxuXHRcdFx0Ly8gaHR0cDovL3d3dy5jaGFyYmFzZS5jb20vMjAyYS11bmljb2RlLWxlZnQtdG8tcmlnaHQtZW1iZWRkaW5nXG5cblx0XHRcdC8qXG5cdFx0XHQucmVwbGFjZSgvW1xcdTIwMDAtXFx1MjAwRl0vZywgJycpXG5cdFx0XHQucmVwbGFjZSgvW1xcdTIwMjgtXFx1MjAyRl0vZywgJycpXG5cdFx0XHQucmVwbGFjZSgvW1xcdTIwNUYtXFx1MjA2MF0vZywgJycpXG5cdFx0XHQqL1xuXHRcdDtcblxuXHRcdHJldCA9IFN0clV0aWwubm9ybWFsaXplKHJldCwgb3B0aW9ucyk7XG5cblx0XHQvKlxuXHRcdGlmICghb3B0aW9ucy5hbGxvd19ib20pXG5cdFx0e1xuXHRcdFx0cmV0ID0gcmV0LnJlcGxhY2UoL1xcdUZFRkYvZywgJycpO1xuXHRcdH1cblxuXHRcdGlmICghb3B0aW9ucy5hbGxvd19uYnNwKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5yZXBsYWNlKC9bIMKgXFx4QTBdL2csICcgJyk7XG5cdFx0fVxuXHRcdCovXG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0Zml4T3B0aW9ucyhvcHRpb25zOiBJVGV4dExheW91dE9wdGlvbnMpXG5cdHtcblx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zKVxuXHRcdFx0LmZvckVhY2goKFtrLCB2XSkgPT4gb3B0aW9uc1trXSA9IGVudlZhbCh2KSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdHJlZHVjZUxpbmU8VD4oaHRtbDogVCwgb3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zID0ge30pXG5cdHtcblx0XHRvcHRpb25zID0gdGhpcy5maXhPcHRpb25zKG9wdGlvbnMpO1xuXG5cdFx0aWYgKG9wdGlvbnMuYWxsb3dfbGYyKVxuXHRcdHtcblx0XHRcdHJldHVybiBodG1sO1xuXHRcdH1cblxuXHRcdGxldCBvbGQgPSB0aGlzLnRyaW0oaHRtbCBhcyBhbnkgYXMgc3RyaW5nLCBvcHRpb25zKTtcblxuXHRcdG9sZCA9IC8vaHRtbFxuXHRcdFx0Ly8ucmVwbGFjZSgvXFxyXFxufFxccig/IVxcbikvZywgXCJcXG5cIilcblx0XHRcdG9sZFxuXHRcdFx0XHQucmVwbGFjZSgvWyDjgIBcXHRdK1xcbi9nLCBcIlxcblwiKVxuXHRcdFx0XHQucmVwbGFjZSgvW1xcc+OAgF0rJC9nLCAnJylcblx0XHRcdFx0LnJlcGxhY2UoL15bXFxuIFxcdF0rL2csICcnKVxuXHRcdFx0XHQucmVwbGFjZSgvXFxuezQsfS9nLCBcIlxcblxcblxcblxcblwiKVxuXHRcdDtcblxuXHRcdGxldCBfaHRtbCA9IG9sZDtcblxuXHRcdGlmICghX2h0bWwubWF0Y2goL1teXFxuXVxcblteXFxuXS9nKSlcblx0XHR7XG5cdFx0XHRsZXQgW21pbiwgbWlkLCBtYXhdID0gZ2V0TWluTWlkTWF4KF9odG1sLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRpZiAobWluID4gMilcblx0XHRcdHtcblx0XHRcdFx0b3B0aW9ucy5hbGxvd19sZjIgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1heCA+PSAzKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobWluID4gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCByID0gbmV3IFJlZ0V4cChgXFxcXG57JHttaW4gLSAxfX0oXFxcXG4rKWAsICdnJyk7XG5cblx0XHRcdFx0XHRfaHRtbCA9IF9odG1sXG5cdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXFxuezJ9KFxcbiopL2csICckMScpXG5cdFx0XHRcdFx0XHQucmVwbGFjZShyLCAnJDEnKVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9odG1sID0gX2h0bWxcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxuezMsfS9nLCBcIlxcblxcblxcblwiKVxuXHRcdFx0XHQvLy5yZXBsYWNlKC9cXG57Mn0vZywgXCJcXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHQvL2NvbnNvbGUubG9nKG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfbGYyKVxuXHRcdFx0e1xuXHRcdFx0XHRfaHRtbCA9IF9odG1sXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcblxcbi9nLCBcIlxcblwiKVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChfaHRtbCAhPSBvbGQpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBfaHRtbDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gaHRtbDtcblx0fVxuXG5cdC8qKlxuXHQgKiDpgJrnlKjlnovmrrXokL3oqr/mlbRcblx0ICpcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICovXG5cdHRleHRsYXlvdXQoaHRtbCwgb3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zID0ge30pOiBzdHJpbmdcblx0e1xuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRodG1sID0gdGhpcy50cmltKGh0bWwsIG9wdGlvbnMpO1xuXG5cdFx0aHRtbCA9IC8vaHRtbFxuXHRcdFx0Ly8ucmVwbGFjZSgvXFxyXFxufFxccig/IVxcbikvZywgXCJcXG5cIilcblx0XHRcdGh0bWxcblx0XHRcdC5yZXBsYWNlKC9bIOOAgFxcdF0rXFxuL2csIFwiXFxuXCIpXG5cdFx0XHQucmVwbGFjZSgvW1xcc+OAgF0rJC9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eW1xcbiBcXHRdKy9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXG57NCx9L2csIFwiXFxuXFxuXFxuXFxuXCIpXG5cdFx0O1xuXG5cdFx0aWYgKCFodG1sLm1hdGNoKC9bXlxcbl1cXG5bXlxcbl0vZykpXG5cdFx0e1xuXHRcdFx0bGV0IFttaW4sIG1pZCwgbWF4XSA9IGdldE1pbk1pZE1heChodG1sLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRpZiAobWluID4gMilcblx0XHRcdHtcblx0XHRcdFx0b3B0aW9ucy5hbGxvd19sZjIgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1heCA+PSAzKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobWluID4gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCByID0gbmV3IFJlZ0V4cChgXFxcXG57JHttaW4gLSAxfX0oXFxcXG4rKWAsICdnJyk7XG5cblx0XHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXFxuezJ9KFxcbiopL2csICckMScpXG5cdFx0XHRcdFx0XHQucmVwbGFjZShyLCAnJDEnKVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGh0bWwgPSBodG1sXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cXG5cIilcblx0XHRcdFx0XHQvLy5yZXBsYWNlKC9cXG57Mn0vZywgXCJcXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHQvL2NvbnNvbGUubG9nKG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfbGYyKVxuXHRcdFx0e1xuXHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXG5cXG4vZywgXCJcXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGh0bWwgPSBodG1sXG5cdFx0XHQvLyBmb3IgdHNcblx0XHRcdC50b1N0cmluZygpXG5cdFx0XHQucmVwbGFjZSgvKFteXFxu44CM44CN44CQ44CR44CK44CL4oCc4oCd44CO44CP77yI77yJXFxbXFxdXCJdKD86W++8ge+8nz8h44CCXSopPylcXG4oKD86W+KAlF0rKT9b44CM44CN4oCc4oCd44CQ44CR44CK44CL77yI77yJ44CO44CPXSkvdWcsIFwiJDFcXG5cXG4kMlwiKVxuXG5cdFx0XHQucmVwbGFjZSgvKFvjgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvInigJVcXFtcXF1cIl0oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzrjgIAqKVteXFxu44CM44CN4oCc4oCd44CQ44CR44CK44CL77yI77yJ44CO44CPXSkvdWcsIFwiJDFcXG5cXG4kMlwiKVxuXHRcdFx0LnJlcGxhY2UoLyhbXlxcbuOAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8iVxcW1xcXVwi4omq4omrXSg/OlvvvIHvvJ8/IeOAgl0qKT8pXFxuKCg/OlvigJRdKyk/W+KJquKJq+OAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pL3VnLCBcIiQxXFxuXFxuJDJcIilcblxuXHRcdFx0LnJlcGxhY2UoLyhb44CM44CN44CQ44CR44CK44CL4oCc4oCd44CO44CP77yI77yJ4oCVXFxbXFxdXCJdKD86W++8ge+8nz8h44CCXSopPylcXG4oKD8644CAKilbXlxcbuOAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pL3VnLCBcIiQxXFxuXFxuJDJcIilcblxuXHRcdFx0LnJlcGxhY2UoLyjvvIkoPzpb77yB77yfPyHjgIJdKik/KVxcbihb44CM44CN44CQ44CR44CK44CL44CO44CP4oCc4oCdXSkvdWcsIFwiJDFcXG5cXG4kMlwiKVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIGh0dHBzOi8vdGllYmEuYmFpZHUuY29tL3AvNTQwMDUwMzg2NFxuXHRcdFx0ICpcblx0XHRcdCAqIOOAjOesrOS4ieivleeCvOS5n++8jOWkmuS6j+S6huWmrumcsuiAjOmAmui/h+S6huWQl+KApuKApuOAjVxuXHRcdFx0IOOAjuW/g+elnuWuiOaKpOeahOeZvee+veavm+OAj++8jOi/meS4quS7juWmrumcsumCo+mHjOaUtuWIsOeahOaKpOi6q+espu+8jOehruWunuWcsOWuiOaKpOS6huaIkeeahOW/g+OAglxuXG5cdFx0XHQgKi9cblx0XHRcdC5yZXBsYWNlKC8oW+OAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8ieKAlV0oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzpb44CM44CN4oCc4oCd44CQ44CR44CK44CL77yI77yJ44CO44CPXSkoPzpbXlxcbl0rKShbXlxcbuOAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8ieKAlV0oPzpb77yB77yfPyHjgIJdKik/KVxcbikvdWcsIFwiJDFcXG4kMlxcblwiKVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIOS9j+aJi++8jOS9j+aJi++8jOaIkeWwseaYr+aIkeOAguS4jeaYr+WFtuS7lueahOS7u+S9leS6uuOAglxuXHRcdFx0IOOAgOihqOekuuWHuuimgeW/heatu+WcsOi/m+ihjOaKteaKl+eahOaEj+W/l++8jOS9huaYr+S+teWFpeiEkeWGheeahOi/meS4quOAjuS7gOS5iOS4nOilv+OAj++8jOW5tuS4jeiDveiiq+mYu+atouOAguS4jeiDveiiq++8jOmYu+atouKApuKAplxuXHRcdFx0ICovXG5cdFx0XHQucmVwbGFjZSgvKFxcbig/Olte44CAXFxuXVteXFxuXSspKVxcbihb44CAXSkvZywgJyQxXFxuXFxuJDInKVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIOi/meagt+S4gOebtOWcqOi/memrmOWFtOedgFxuXG5cdFx0XHQg44CCXG5cdFx0XHQgKi9cblx0XHRcdC8vLnJlcGxhY2UoLyhbXlxcbl0pKFxcbispKCg/OlvlkKflkaJdKik/W+OAgu+8ge+8n++8jOOAgV0pXFxuL3VnLCBcIiQxJDMkMlwiKVxuXG5cdFx0XHQucmVwbGFjZSgvKFteXFxuXSkoXFxuKykoZmlufFxcPOWujFxcPikoXFxufCQpL2lnLCBcIiQxJDJcXG4kMyQ0XCIpXG5cdFx0O1xuXG5cdFx0aHRtbCA9IGh0bWxcblx0XHRcdC5yZXBsYWNlKC9eXFxuK3xbXFxz44CAXSskL2csICcnKVxuXHRcdFx0Lypcblx0XHRcdC5yZXBsYWNlKC8oXFxuKXs0LH0vZywgXCJcXG5cXG5cXG5cXG5cIilcblx0XHRcdC5yZXBsYWNlKC8oXFxuKXszfS9nLCBcIlxcblxcblwiKVxuXHRcdFx0Ki9cblx0XHRcdC5yZXBsYWNlKC8oXFxuKXs0LH0vZywgXCJcXG5cXG5cXG5cXG5cIilcblxuXHRcdDtcblxuXHRcdFx0aWYgKG9wdGlvbnMuYWxsb3dfbGYzKVxuXHRcdFx0e1xuXHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC8oXFxuKXszLH0vZywgXCJcXG5cXG5cXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC8oXFxuKXszfS9nLCBcIlxcblxcblwiKVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cblx0XHRyZXR1cm4gaHRtbDtcblx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGV4cG9ydHMgYXMgdHlwZW9mIGltcG9ydCgnLi90ZXh0Jyk7XG4iXX0=