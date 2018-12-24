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
        let ret = crlf_normalize_1.default(str.toString(), options.LF || crlf_normalize_1.LF);
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
                    let r = new RegExp(`\\n{${min - 1}}(\\n+)`, 'g');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxvQ0FBb0M7QUFDcEMsMkNBQXNDO0FBQ3RDLG1EQUEwQztBQUMxQyxpREFBZ0U7QUFHdkQsb0JBSGMseUJBQVMsQ0FHZDtBQUFFLGlCQUhjLHNCQUFNLENBR2Q7QUFGMUIsdUNBQTJDO0FBc0MzQyxNQUFhLE9BQU87SUF1R25CLFlBQVksT0FBUTtRQXJHYixZQUFPLEdBQUc7WUFDaEIsT0FBTyxFQUFFLEVBQUU7WUFDWCxLQUFLLEVBQUUsSUFBSSxHQUFHLEVBQUU7U0FDaEIsQ0FBQztRQUNLLFdBQU0sR0FBRztZQUNmLEVBQUUsRUFBRSx5RkFBeUY7WUFDN0YsRUFBRSxFQUFFLHFGQUFxRjtZQUV6RixLQUFLLEVBQUUsb0JBQW9CO1lBRTNCLEtBQUssRUFBRTtnQkFPTjtvQkFDQyxDQUFDLEVBQUUsUUFBUTtvQkFDWCxDQUFDLEVBQUUsR0FBRztpQkFDTjtnQkFDRDtvQkFDQyxDQUFDLEVBQUUsV0FBVztvQkFDZCxDQUFDLEVBQUUsSUFBSTtpQkFDUDtnQkFnQkQ7b0JBQ0MsQ0FBQyxFQUFFLDRCQUE0QjtvQkFDL0IsQ0FBQyxFQUFFLEtBQUs7aUJBQ1I7Z0JBQ0Q7b0JBQ0MsQ0FBQyxFQUFFLElBQUk7b0JBQ1AsQ0FBQyxFQUFFLEdBQUc7b0JBRU4sUUFBUSxFQUFFLEtBQUs7aUJBQ2Y7Z0JBeUJEO29CQUNDLENBQUMsRUFBRSw2Q0FBNkM7b0JBQ2hELENBQUMsRUFBRSxXQUFXO2lCQUNkO2dCQUNEO29CQUNDLENBQUMsRUFBRSxNQUFNO29CQUNULENBQUMsRUFBRSxJQUFJO2lCQUNQO2dCQUNEO29CQUNDLENBQUMsRUFBRSxXQUFXO29CQUNkLENBQUMsRUFBRSxHQUFHO2lCQUNOO2dCQUNELENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQzthQVFEO1NBRW5CLENBQUM7UUFDSyxZQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWIsY0FBUyxHQUFHLHlCQUFTLENBQUM7UUFJNUIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFdkIsSUFBSSxHQUFHLEdBQUcsRUFBRTthQUNWLE1BQU0sQ0FBQyxPQUFPLElBQUksT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQ3BFO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJO1FBRXBCLE9BQU8sSUFBSSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQWEsRUFBRSxLQUFLLEdBQUcsRUFBRTtRQUVoQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBRXZCLEdBQUc7YUFDRCxNQUFNLENBQUMsVUFBVSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUc7WUFFL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUMsQ0FBQzthQUNELE9BQU8sQ0FBQyxVQUFVLEtBQUs7WUFFdkIsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQVN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUV6QixLQUFLLENBQUMsSUFBSSxDQUFDO2dCQUNWLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztnQkFDNUIsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUs7b0JBRXJDLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2FBQ1gsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLENBQ0Y7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBSztRQUVaLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7UUFFdkIsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLO1lBRzdDLElBQUksS0FBSyxDQUFDLFFBQVEsRUFDbEI7Z0JBQ0MsT0FBTyxLQUFLLENBQUM7YUFDYjtZQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLEVBQ3BFO2dCQUNDLEtBQUssR0FBRztvQkFDUCxPQUFPLEVBQUUsS0FBSztvQkFFZCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDWCxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFFWCxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDZixDQUFDO2FBQ0Y7WUFFRCxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsSUFBSSxRQUFRLElBQUssS0FBSyxDQUFDLENBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxNQUFNLENBQUMsR0FBRyxzQkFBTSxPQUFPLENBQUMsQ0FBQyxFQUN6RjtnQkFFQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU87b0JBQUUsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUU1QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxzQkFBTSxDQUFDLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUV6QixLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBSWhFLElBQUksS0FBSyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQ3BCO29CQUNDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSzt3QkFFNUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzFCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDWjthQUNEO2lCQUNJLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxJQUFJLFFBQVEsRUFDbkM7Z0JBRUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPO29CQUFFLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFFNUMsS0FBSyxDQUFDLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQy9EO2lCQUNJLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLEVBQ25GO2dCQUNDLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7aUJBQ0ksSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFLElBQUksVUFBVSxFQUN0QztnQkFDQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQzthQUNqQjtZQUVELE9BQU8sS0FBSyxDQUFDO1FBQ2QsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsT0FBTyxDQUFDLElBQUksRUFBRSxVQUFvQixFQUFFO1FBRW5DLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNoQztZQUNDLE9BQU8sSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFakIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDekIsT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUNoQztRQUVELElBQUksT0FBTyxDQUFDLE9BQU8sRUFDbkI7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtRQUVELElBQUksT0FBTyxDQUFDLEtBQUssRUFDakI7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7U0FDL0U7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBSSxFQUFFLEtBQXFCLEVBQUUsWUFBYTtRQUV2RCxJQUFJLENBQUMsWUFBWSxFQUNqQjtZQUNDLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ3pCO1FBRUQsS0FBSyxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQ25CO1lBQ0MsSUFBSSxJQUFJLENBQUM7WUFFVCxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFVBQVUsRUFDakM7Z0JBQ0MsSUFBSSxHQUFJLEtBQUssQ0FBQyxDQUFDLENBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7YUFDbEQ7aUJBRUQ7Z0JBQ0MsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcEIsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQztZQUVELElBQUksSUFBSSxJQUFJLElBQUksRUFDaEI7Z0JBQ0MsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUVmLElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDOUI7b0JBQ0MsS0FBSyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ25DO2dCQUVELEtBQUssQ0FBQyxJQUFJLENBQUM7b0JBQ1YsR0FBRyxFQUFFLElBQUk7b0JBQ1QsR0FBRyxFQUFFLElBQUk7aUJBQ1QsQ0FBQyxDQUFDO2dCQUVILFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUVsQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ1o7WUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDdkI7Z0JBQ0MsTUFBTTthQUNOO1NBQ0Q7UUFFRCxPQUFPO1lBQ04sS0FBSyxFQUFFLElBQWM7WUFDckIsS0FBSyxFQUFFLFlBQVk7U0FDbkIsQ0FBQztJQUNILENBQUM7SUFFRCxVQUFVLENBQUMsSUFBWTtRQUV0QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFakIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNyQixPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsVUFBVSxHQUFHLElBQUk7WUFFMUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQ1g7Z0JBQ0MsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUVsQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDbkU7b0JBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3hCO2dCQUVELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM3QztvQkFDQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztpQkFDeEI7Z0JBRUQsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUNsQjtvQkFDQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBQzFCLEdBQUcsRUFBRSxHQUFHO3dCQUNSLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUVaLElBQUksRUFBRSxJQUFJO3FCQUNWLENBQUMsQ0FBQztpQkFDSDtxQkFFRDtpQkFFQztnQkFFRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO2FBQzdFO1lBRUQsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0lBRUQsT0FBTyxDQUFDLElBQVk7UUFFbkIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUNwQixPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQzthQUMxQixPQUFPLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUMxQjtJQUNILENBQUM7SUFLRCxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQVE7UUFFbEIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO2FBQ2pDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUM7YUFDckMsT0FBTyxDQUFDLHlCQUF5QixFQUFFLEVBQUUsQ0FBQyxDQUN0QztRQUVGLElBQUksT0FBTyxPQUFPLElBQUksU0FBUyxFQUMvQjtZQUNDLE9BQU8sR0FBRztnQkFDVCxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU87YUFDZixDQUFBO1NBQ0Q7YUFDSSxJQUFJLE9BQU8sT0FBTyxJQUFJLFFBQVEsRUFDbkM7WUFDQyxPQUFPLEdBQUc7Z0JBQ1QsSUFBSSxFQUFFLE9BQU87YUFDYixDQUFBO1NBQ0Q7UUFFRCxJQUFJLE9BQU8sRUFDWDtZQUNDLElBQUksT0FBTyxPQUFPLENBQUMsSUFBSSxJQUFJLFFBQVEsRUFDbkM7Z0JBQ0MsR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDNUM7aUJBQ0ksSUFBSSxPQUFPLENBQUMsSUFBSSxFQUNyQjtnQkFDQyxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDN0I7U0FDRDtRQUVELE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUlELEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBZ0M7UUFFMUMsSUFBSSxPQUFPLE9BQU8sSUFBSSxRQUFRLEVBQzlCO1lBQ0MsT0FBTyxHQUFHO2dCQUNULEVBQUUsRUFBRSxPQUFPO2FBQ1gsQ0FBQztTQUNGO1FBRUQsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDdkIsRUFBRSxFQUFFLElBQUk7WUFDUixVQUFVLEVBQUUsS0FBSztZQUNqQixTQUFTLEVBQUUsS0FBSztTQUNoQixFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRVosSUFBSSxHQUFHLEdBQUcsd0JBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsSUFBSSxtQkFBRSxDQUFDLENBUy9DO1FBRUQsR0FBRyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBY3RDLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztJQUVELFVBQVUsQ0FBQyxPQUEyQjtRQUVyQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQzthQUNyQixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLGlCQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDNUM7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNoQixDQUFDO0lBT0QsVUFBVSxDQUFDLElBQUksRUFBRSxVQUE4QixFQUFFO1FBRWhELE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRW5DLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVoQyxJQUFJO1lBRUgsSUFBSTtpQkFDSCxPQUFPLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQztpQkFDM0IsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7aUJBQ3ZCLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO2lCQUN6QixPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUMvQjtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUNoQztZQUNDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLG9CQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFFcEQsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUNYO2dCQUNDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO2FBQzFCO1lBRUQsSUFBSSxHQUFHLElBQUksQ0FBQyxFQUNaO2dCQUNDLElBQUksR0FBRyxHQUFHLENBQUMsRUFDWDtvQkFDQyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFFakQsSUFBSSxHQUFHLElBQUk7eUJBRVQsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FDakI7aUJBQ0Q7Z0JBRUQsSUFBSSxHQUFHLElBQUk7cUJBQ1QsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FFN0I7YUFDRDtZQUlELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUN0QjtnQkFDQyxJQUFJLEdBQUcsSUFBSTtxQkFDVCxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUN2QjthQUNEO1NBQ0Q7UUFFRCxJQUFJLEdBQUcsSUFBSTthQUVULFFBQVEsRUFBRTthQUNWLE9BQU8sQ0FBQyxvRUFBb0UsRUFBRSxVQUFVLENBQUM7YUFFekYsT0FBTyxDQUFDLGtFQUFrRSxFQUFFLFVBQVUsQ0FBQzthQUN2RixPQUFPLENBQUMsd0VBQXdFLEVBQUUsVUFBVSxDQUFDO2FBRTdGLE9BQU8sQ0FBQyxrRUFBa0UsRUFBRSxVQUFVLENBQUM7YUFFdkYsT0FBTyxDQUFDLG9DQUFvQyxFQUFFLFVBQVUsQ0FBQzthQVN6RCxPQUFPLENBQUMsbUdBQW1HLEVBQUUsVUFBVSxDQUFDO2FBTXhILE9BQU8sQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLENBQUM7YUFTbkQsT0FBTyxDQUFDLGlDQUFpQyxFQUFFLFlBQVksQ0FBQyxDQUN6RDtRQUVELElBQUksR0FBRyxJQUFJO2FBQ1QsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7YUFLNUIsT0FBTyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FFakM7UUFFQSxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQ3JCO1lBQ0MsSUFBSSxHQUFHLElBQUk7aUJBQ1QsT0FBTyxDQUFDLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FDL0I7U0FDRDthQUVEO1lBQ0MsSUFBSSxHQUFHLElBQUk7aUJBQ1QsT0FBTyxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FDNUI7U0FDRDtRQUVGLE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUVEO0FBbmpCRCwwQkFtakJDO0FBRUQsb0NBQW9DO0FBRXBDLGtCQUFlLFNBQVMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTcvMTIvNS8wMDUuXG4gKi9cblxuaW1wb3J0ICogYXMgU3RyVXRpbCBmcm9tICdzdHItdXRpbCc7XG5pbXBvcnQgZ2V0TWluTWlkTWF4IGZyb20gJ2JsYW5rLWxpbmUnO1xuaW1wb3J0IGNybGYsIHsgTEYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgdGllYmFIYXJtb255LCB7IFNQX1JFR0VYUCwgU1BfS0VZIH0gZnJvbSAndGllYmEtaGFybW9ueSc7XG5pbXBvcnQgeyBlbnZWYWwsIGVudkJvb2wgfSBmcm9tICdlbnYtYm9vbCc7XG5cbmV4cG9ydCB7IFNQX1JFR0VYUCwgU1BfS0VZIH07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNcbntcblx0d29yZHM/OiBib29sZWFuXG5cdHBhZF9lbmc/OiBib29sZWFuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVdvcmRzT3V0cHV0XG57XG5cdF9zb3VyY2U/OiBhbnksXG5cblx0cz86IFJlZ0V4cCxcblx0cj86IHN0cmluZyB8IElSZWdFeHBDYWxsYmFjayxcblxuXHRmbGFncz86IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVnRXhwQ2FsbGJhY2tcbntcblx0KCQwOiBzdHJpbmcsICQxPzogc3RyaW5nLCAkMj86IHN0cmluZywgJDM/OiBzdHJpbmcsIC4uLmFyZ3YpOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRvU3RyT3B0aW9uc1xue1xuXHRMRj86IHN0cmluZyxcblx0YWxsb3dfbmJzcD86IGJvb2xlYW4sXG5cdGFsbG93X2JvbT86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVRleHRMYXlvdXRPcHRpb25zIGV4dGVuZHMgSVRvU3RyT3B0aW9uc1xue1xuXHRhbGxvd19sZjI/OiBib29sZWFuLFxuXHRhbGxvd19sZjM/OiBib29sZWFuLFxufVxuXG5leHBvcnQgY2xhc3MgZW5zcGFjZVxue1xuXHRwdWJsaWMgX2NhY2hlXyA9IHtcblx0XHRyZXBsYWNlOiBbXSxcblx0XHR3b3JkczogbmV3IE1hcCgpLFxuXHR9O1xuXHRwdWJsaWMgX2RhdGFfID0ge1xuXHRcdG0wOiAvKFteYS16MC05XFwtXFwuXFxzXSk/KFthLXowLTlcXC1cXC5dKyg/OlthLXowLTlcXC1cXC5cXHNdK1thLXowLTlcXC1cXC5dKyk/KShbXmEtejAtOVxcLVxcLlxcc10pPy91aWcsXG5cdFx0cjE6IC9b44CM44CN4pGg4oaSXFwnXFxcIjpcXC1cXCvvvIjvvInila7vvIjila/vvL/ilbDvvInila1cXChcXClcXFtcXF3ilqDjgJDjgJHjgIrjgIt+772e4oCc4oCd4oCY4oCZOu+8mu+8mu+8jCrvvIpA44CCz4njg7vjgIHjgIJg44CA4pSA5LiAXFxk44CO44CP4peGfuOAge+8n++8gVxcP1xcIcOXXFwuXFw8XFw+PeKApuODu10vaSxcblxuXHRcdHJ0cmltOiAvWyBcXHRcXHVGRUZGXFx4QTDjgIBdKyQvLFxuXG5cdFx0d29yZHM6IFtcblx0XHRcdC8qXG5cdFx0XHR7XG5cdFx0XHRcdHM6ICfvvIjCt++8iScsXG5cdFx0XHRcdHI6ICcnLFxuXHRcdFx0fSxcblx0XHRcdCovXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC9cXC57M30vZyxcblx0XHRcdFx0cjogJ+KApicsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAv4oCmXFwuezEsMn0vZyxcblx0XHRcdFx0cjogJ+KApuKApicsXG5cdFx0XHR9LFxuXG5cdFx0XHQvKlxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKOesrCkoPzpbXFxfXFx0XFx1RkVGRlxceEEw44CAXSspKFxcZCspKD86W1xcX1xcdFxcdUZFRkZcXHhBMOOAgF0rKSjor5186aCBfOWknHznq6ApL2csXG5cdFx0XHRcdHI6ICckMSAkMiAkMycsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKOesrCkoPzpbXFxfXFx0XFx1RkVGRlxceEEw44CAXSspPyhcXGQrKSg/OltcXF9cXHRcXHVGRUZGXFx4QTDjgIBdKyko6K+dfOmggXzlpJx856ugKS9nLFxuXHRcdFx0XHRyOiAnJDEgJDIgJDMnLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0czogLyjnrKwpKD86W1xcX1xcdFxcdUZFRkZcXHhBMOOAgF0rKShcXGQrKSg/OltcXF9cXHRcXHVGRUZGXFx4QTDjgIBdKyk/KOivnXzpoIF85aScfOeroCkvZyxcblx0XHRcdFx0cjogJyQxICQyICQzJyxcblx0XHRcdH0sXG5cdFx0XHQqL1xuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKOivnXzml6V856ugKVtcXF9cXHRcXHVGRUZGXFx4QTBdKy9pZyxcblx0XHRcdFx0cjogJyQxICcsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAn77yB44CAJyxcblx0XHRcdFx0cjogJ++8gScsXG5cblx0XHRcdFx0bm9fcmVnZXg6IGZhbHNlLFxuXHRcdFx0fSxcblx0XHRcdC8qXG5cdFx0XHR7XG5cdFx0XHRcdHI6IC8oW+OAjOOAjeOAkOOAkeOAiuOAi+OAjuOAj++8iO+8iV0pL2lnLFxuXHRcdFx0XHRzOiAnJDEnLFxuXHRcdFx0fSxcblx0XHRcdCovXG5cdFx0XHQvKlxuXHRcdFx0e1xuXHRcdFx0XHRzOiAvKFxcP1xcPylbIFxcdOOAgF0rKFxcP1xcPykvaWcsXG5cdFx0XHRcdHI6ICckMSQyJyxcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdHM6IC/jgIwoW17jgIzjgI7jgI/jgI1dKyk/44COKFteXFxu44CPXSsp44CNKFte44CM44CO44CP44CNXSspP+OAjy8sXG5cdFx0XHRcdHI6ICfjgIwkMeOAjiQy44CPJDPjgI0nLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0czogL+OAjihbXuOAjOOAjuOAj+OAjV0rKT/jgIwoW15cXG7jgI1dKynjgI8oW17jgIzjgI7jgI/jgI1dKyk/44CNLyxcblx0XHRcdFx0cjogJ+OAjiQx44CMJDLjgI0kM+OAjycsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAv5oOFXFxzKnNlXFxzKuWwj+ivtC9pZyxcblx0XHRcdFx0cjogJ+aDheiJsuWwj+ivtCcsXG5cdFx0XHR9LFxuXHRcdFx0Ki9cblx0XHRcdHtcblx0XHRcdFx0czogL14oW17jgIzjgI7igJzigJ3jgI/jgI1dKyk/KOKAnCkoW17jgIzjgI7igJzigJ3jgI/jgI1dKylb44CP44CNXShbXuKAnV0rKT8kL20sXG5cdFx0XHRcdHI6ICckMSQyJDPigJ0kNCcsXG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRzOiAv77yM4oCU4oCUL2csXG5cdFx0XHRcdHI6ICfigJTigJQnLFxuXHRcdFx0fSxcblx0XHRcdHtcblx0XHRcdFx0czogLyg/OuipsXzor50pL3VnLFxuXHRcdFx0XHRyOiAn6KmxJyxcblx0XHRcdH0sXG5cdFx0XHRbL+OAgFsgXFx0XSvvvIgvZywgJ+OAgO+8iCddLFxuXG5cdFx0XHQvL1sn6KO95q2iJywgJ+WItuatoiddLFxuXG5cdFx0XHQvL1sn6aCQ6Ziy5oCn6Zue6bSoJywgJ+mgkOmYsuaAp+e+iOaKvCddLFxuXG5cdFx0XHQvL1sn5p+l5rC0W+mMtuihqF0nLCAn5p+l5rC06Yy2J10sXG5cblx0XHRdIGFzIElXb3Jkc091dHB1dFtdLFxuXG5cdH07XG5cdHB1YmxpYyBvcHRpb25zID0ge307XG5cblx0cHVibGljIF93b3Jkc19yMSA9IFNQX1JFR0VYUDtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zPylcblx0e1xuXHRcdGxldCBfc2VsZiA9IHRoaXM7XG5cblx0XHRsZXQgciA9IHRoaXMuX3dvcmRzX3IxO1xuXG5cdFx0bGV0IGFyciA9IFtdXG5cdFx0XHQuY29uY2F0KG9wdGlvbnMgJiYgb3B0aW9ucy53b3Jkc19ibG9jayA/IG9wdGlvbnMud29yZHNfYmxvY2sgOiBudWxsKVxuXHRcdDtcblxuXHRcdHRoaXMuX2RhdGFfLndvcmRzID0gdGhpcy5fd29yZHMxKGFyciwgdGhpcy5fZGF0YV8ud29yZHMpO1xuXHRcdHRoaXMuX2RhdGFfLndvcmRzID0gdGhpcy5fd29yZHMyKHRoaXMuX2RhdGFfLndvcmRzKTtcblx0fVxuXG5cdHN0YXRpYyBjcmVhdGUoLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBuZXcgdGhpcyguLi5hcmd2KTtcblx0fVxuXG5cdF93b3JkczEoYXJyOiBzdHJpbmdbXSwgd29yZHMgPSBbXSk6IElXb3Jkc091dHB1dFtdXG5cdHtcblx0XHRsZXQgciA9IHRoaXMuX3dvcmRzX3IxO1xuXG5cdFx0YXJyXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChlbCwgaW5kZXgsIGFycilcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGVsICYmIChpbmRleCA9PSBhcnIuaW5kZXhPZihlbCkpO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGEgPSB2YWx1ZS5zcGxpdCgnQCcpO1xuXG5cdFx0XHRcdC8qXG5cdFx0XHRcdF9zZWxmLl9kYXRhXy53b3Jkcy5wdXNoKHtcblx0XHRcdFx0XHRzOiBuZXcgUmVnRXhwKGAoJHthWzBdfSkke3J9KCR7YVsxXX0pYCwgJ2cnKSxcblx0XHRcdFx0XHRyOiAnJDEkMicsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHQqL1xuXG5cdFx0XHRcdGxldCBzID0gYS5qb2luKGApJHtyfShgKTtcblxuXHRcdFx0XHR3b3Jkcy5wdXNoKHtcblx0XHRcdFx0XHRzOiBuZXcgUmVnRXhwKGAoJHtzfSlgLCAnZycpLFxuXHRcdFx0XHRcdHI6IGEubWFwKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiAnJCcgKyAoaW5kZXggKyAxKTtcblx0XHRcdFx0XHR9KS5qb2luKCcnKSxcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdHJldHVybiB3b3Jkcztcblx0fVxuXG5cdF93b3JkczIod29yZHMpOiBJV29yZHNPdXRwdXRbXVxuXHR7XG5cdFx0bGV0IHIgPSB0aGlzLl93b3Jkc19yMTtcblxuXHRcdHJldHVybiB3b3Jkcy5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0e1xuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0aWYgKHZhbHVlLm5vX3JlZ2V4KVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSAmJiAodmFsdWUubGVuZ3RoID09IDIgfHwgdmFsdWUubGVuZ3RoID49IDMpKVxuXHRcdFx0e1xuXHRcdFx0XHR2YWx1ZSA9IHtcblx0XHRcdFx0XHRfc291cmNlOiB2YWx1ZSxcblxuXHRcdFx0XHRcdHM6IHZhbHVlWzBdLFxuXHRcdFx0XHRcdHI6IHZhbHVlWzFdLFxuXG5cdFx0XHRcdFx0ZmxhZ3M6IHZhbHVlWzJdLFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodHlwZW9mIHZhbHVlLnMgPT0gJ3N0cmluZycgJiYgKHZhbHVlLnMgYXMgc3RyaW5nKS5tYXRjaChuZXcgUmVnRXhwKGAke1NQX0tFWX0oLispJGApKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpZiAoIXZhbHVlLl9zb3VyY2UpIHZhbHVlLl9zb3VyY2UgPSB2YWx1ZS5zO1xuXG5cdFx0XHRcdGxldCBhID0gdmFsdWUucy5zcGxpdChTUF9LRVkpO1xuXHRcdFx0XHRsZXQgcyA9IGEuam9pbihgKSR7cn0oYCk7XG5cblx0XHRcdFx0dmFsdWUucyA9IG5ldyBSZWdFeHAoYCgke3N9KWAsIHZhbHVlLmZsYWdzID8gdmFsdWUuZmxhZ3MgOiAnZycpO1xuXG5cdFx0XHRcdC8vY29uc29sZS5sb2codmFsdWUucyk7XG5cblx0XHRcdFx0aWYgKHZhbHVlLnIgPT09IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YWx1ZS5yID0gYS5tYXAoZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuICckJyArIChpbmRleCArIDEpO1xuXHRcdFx0XHRcdH0pLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUucyA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpZiAoIXZhbHVlLl9zb3VyY2UpIHZhbHVlLl9zb3VyY2UgPSB2YWx1ZS5zO1xuXG5cdFx0XHRcdHZhbHVlLnMgPSBuZXcgUmVnRXhwKHZhbHVlLnMsIHZhbHVlLmZsYWdzID8gdmFsdWUuZmxhZ3MgOiAnZycpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09IDEgJiYgdHlwZW9mIHZhbHVlWzBdID09ICdmdW5jdGlvbicpXG5cdFx0XHR7XG5cdFx0XHRcdHZhbHVlID0gdmFsdWVbMF07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgdmFsdWUuZm4gPT0gJ2Z1bmN0aW9uJylcblx0XHRcdHtcblx0XHRcdFx0dmFsdWUgPSB2YWx1ZS5mbjtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVwbGFjZSh0ZXh0LCBvcHRpb25zOiBJT3B0aW9ucyA9IHt9KTogc3RyaW5nXG5cdHtcblx0XHRpZiAoIXRleHQgfHwgIS9bXlxcc10vLnRlc3QodGV4dCkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRleHQ7XG5cdFx0fVxuXG5cdFx0bGV0IF9zZWxmID0gdGhpcztcblxuXHRcdGxldCBfcmV0ID0gdGhpcy50b1N0cih0ZXh0KVxuXHRcdFx0LnJlcGxhY2UoX3NlbGYuX2RhdGFfLnJ0cmltLCAnJylcblx0XHQ7XG5cblx0XHRpZiAob3B0aW9ucy5wYWRfZW5nKVxuXHRcdHtcblx0XHRcdF9yZXQgPSB0aGlzLnBhZGRpbmdFbmcoX3JldCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9wdGlvbnMud29yZHMpXG5cdFx0e1xuXHRcdFx0X3JldCA9IHRoaXMucmVwbGFjZV93b3JkcyhfcmV0LCBfc2VsZi5fZGF0YV8ud29yZHMsIF9zZWxmLl9jYWNoZV8ud29yZHMpLnZhbHVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBfcmV0O1xuXHR9XG5cblx0cmVwbGFjZV93b3JkcyhfcmV0LCB3b3JkczogSVdvcmRzT3V0cHV0W10sIF9jYWNoZV93b3Jkcz8pXG5cdHtcblx0XHRpZiAoIV9jYWNoZV93b3Jkcylcblx0XHR7XG5cdFx0XHRfY2FjaGVfd29yZHMgPSBuZXcgTWFwKCk7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgaSBpbiB3b3Jkcylcblx0XHR7XG5cdFx0XHRsZXQgX25ldztcblxuXHRcdFx0aWYgKHR5cGVvZiB3b3Jkc1tpXSA9PSAnZnVuY3Rpb24nKVxuXHRcdFx0e1xuXHRcdFx0XHRfbmV3ID0gKHdvcmRzW2ldIGFzIEZ1bmN0aW9uKShfcmV0LCBfY2FjaGVfd29yZHMpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgX3IgPSB3b3Jkc1tpXS5zO1xuXG5cdFx0XHRcdF9uZXcgPSBfcmV0LnJlcGxhY2UoX3IsIHdvcmRzW2ldLnIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoX25ldyAhPSBfcmV0KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbXlNYXAgPSBbXTtcblxuXHRcdFx0XHRpZiAoX2NhY2hlX3dvcmRzLmhhcyh3b3Jkc1tpXSkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRteU1hcCA9IF9jYWNoZV93b3Jkcy5nZXQod29yZHNbaV0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bXlNYXAucHVzaCh7XG5cdFx0XHRcdFx0b2xkOiBfcmV0LFxuXHRcdFx0XHRcdG5ldzogX25ldyxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0X2NhY2hlX3dvcmRzLnNldCh3b3Jkc1tpXSwgbXlNYXApO1xuXG5cdFx0XHRcdF9yZXQgPSBfbmV3O1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIS9bXlxcc10vLnRlc3QoX3JldCkpXG5cdFx0XHR7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR2YWx1ZTogX3JldCBhcyBzdHJpbmcsXG5cdFx0XHRjYWNoZTogX2NhY2hlX3dvcmRzLFxuXHRcdH07XG5cdH1cblxuXHRwYWRkaW5nRW5nKHRleHQ6IHN0cmluZylcblx0e1xuXHRcdGxldCBfc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gdGhpcy50b1N0cih0ZXh0KVxuXHRcdFx0LnJlcGxhY2UoX3NlbGYuX2RhdGFfLm0wLCBmdW5jdGlvbiAoLi4uYXJndilcblx0XHRcdHtcblx0XHRcdFx0aWYgKGFyZ3ZbMl0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgb2xkID0gYXJndlsyXTtcblxuXHRcdFx0XHRcdGlmIChhcmd2WzJdLmxlbmd0aCA+IDEgJiYgYXJndlsxXSAmJiAhX3NlbGYuX2RhdGFfLnIxLnRlc3QoYXJndlsxXSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0YXJndlsyXSA9ICcgJyArIGFyZ3ZbMl07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGFyZ3ZbM10gJiYgIV9zZWxmLl9kYXRhXy5yMS50ZXN0KGFyZ3ZbM10pKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGFyZ3ZbMl0gPSBhcmd2WzJdICsgJyAnO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvbGQgIT0gYXJndlsyXSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRfc2VsZi5fY2FjaGVfLnJlcGxhY2UucHVzaCh7XG5cdFx0XHRcdFx0XHRcdG9sZDogb2xkLFxuXHRcdFx0XHRcdFx0XHRuZXc6IGFyZ3ZbMl0sXG5cblx0XHRcdFx0XHRcdFx0ZGF0YTogYXJndixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmRlYnVnKFtvbGQsIGFyZ3ZbMl1dLCBhcmd2KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gKGFyZ3ZbMV0gfHwgJycpICsgYXJndlsyXS5yZXBsYWNlKC8oICl7Mix9L2csICckMScpICsgKGFyZ3ZbM10gfHwgJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGFyZ3ZbMF07XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0Y2xlYXJMRih0ZXh0OiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50cmltKHRleHQpXG5cdFx0XHQucmVwbGFjZSgvXFxuezQsfS9nLCAnXFxuXFxuJylcblx0XHRcdC5yZXBsYWNlKC9cXG57Myx9L2csICdcXG5cXG4nKVxuXHRcdFx0O1xuXHR9XG5cblx0dHJpbSh0ZXh0OiBCdWZmZXIsIG9wdGlvbnM/KTogc3RyaW5nXG5cdHRyaW0odGV4dDogc3RyaW5nLCBvcHRpb25zPyk6IHN0cmluZ1xuXHR0cmltKHRleHQ6IG51bWJlciwgb3B0aW9ucz8pOiBzdHJpbmdcblx0dHJpbSh0ZXh0LCBvcHRpb25zPyk6IHN0cmluZ1xuXHR7XG5cdFx0bGV0IHJldCA9IHRoaXMudG9TdHIodGV4dCwgb3B0aW9ucylcblx0XHRcdC5yZXBsYWNlKC9bIFxcdOOAgFxceEEwXFx1MzAwMF0rXFxuL2csICdcXG4nKVxuXHRcdFx0LnJlcGxhY2UoL15cXG4rfFtcXHPjgIBcXHhBMFxcdTMwMDBdKyQvZywgJycpXG5cdFx0XHQ7XG5cblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ2Jvb2xlYW4nKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMgPSB7XG5cdFx0XHRcdHRyaW06ICEhb3B0aW9ucyxcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0b3B0aW9ucyA9IHtcblx0XHRcdFx0dHJpbTogb3B0aW9ucyxcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAob3B0aW9ucylcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mIG9wdGlvbnMudHJpbSA9PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0cmV0ID0gU3RyVXRpbC50cmltKHJldCwgJ+OAgCcgKyBvcHRpb25zLnRyaW0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAob3B0aW9ucy50cmltKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXQgPSBTdHJVdGlsLnRyaW0ocmV0LCAn44CAJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdHRvU3RyKHN0cjogQnVmZmVyIHwgc3RyaW5nIHwgbnVtYmVyIHwgYW55LCBvcHRpb25zPzogSVRvU3RyT3B0aW9ucyk6IHN0cmluZ1xuXHR0b1N0cihzdHI6IEJ1ZmZlciB8IHN0cmluZyB8IG51bWJlciB8IGFueSwgb3B0aW9ucz86IHN0cmluZyk6IHN0cmluZ1xuXHR0b1N0cihzdHIsIG9wdGlvbnM/OiBzdHJpbmcgfCBJVG9TdHJPcHRpb25zKTogc3RyaW5nXG5cdHtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0b3B0aW9ucyA9IHtcblx0XHRcdFx0TEY6IG9wdGlvbnMsXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcblx0XHRcdExGOiBcIlxcblwiLFxuXHRcdFx0YWxsb3dfbmJzcDogZmFsc2UsXG5cdFx0XHRhbGxvd19ib206IGZhbHNlLFxuXHRcdH0sIG9wdGlvbnMpO1xuXG5cdFx0bGV0IHJldCA9IGNybGYoc3RyLnRvU3RyaW5nKCksIG9wdGlvbnMuTEYgfHwgTEYpXG5cdFx0XHQvLy5yZXBsYWNlKC9cXHJcXG58XFxyKD8hXFxuKXxcXG4vZywgb3B0aW9ucy5MRiB8fCBcIlxcblwiKVxuXHRcdFx0Ly8gaHR0cDovL3d3dy5jaGFyYmFzZS5jb20vMjAyYS11bmljb2RlLWxlZnQtdG8tcmlnaHQtZW1iZWRkaW5nXG5cblx0XHRcdC8qXG5cdFx0XHQucmVwbGFjZSgvW1xcdTIwMDAtXFx1MjAwRl0vZywgJycpXG5cdFx0XHQucmVwbGFjZSgvW1xcdTIwMjgtXFx1MjAyRl0vZywgJycpXG5cdFx0XHQucmVwbGFjZSgvW1xcdTIwNUYtXFx1MjA2MF0vZywgJycpXG5cdFx0XHQqL1xuXHRcdDtcblxuXHRcdHJldCA9IFN0clV0aWwubm9ybWFsaXplKHJldCwgb3B0aW9ucyk7XG5cblx0XHQvKlxuXHRcdGlmICghb3B0aW9ucy5hbGxvd19ib20pXG5cdFx0e1xuXHRcdFx0cmV0ID0gcmV0LnJlcGxhY2UoL1xcdUZFRkYvZywgJycpO1xuXHRcdH1cblxuXHRcdGlmICghb3B0aW9ucy5hbGxvd19uYnNwKVxuXHRcdHtcblx0XHRcdHJldCA9IHJldC5yZXBsYWNlKC9bIMKgXFx4QTBdL2csICcgJyk7XG5cdFx0fVxuXHRcdCovXG5cblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0Zml4T3B0aW9ucyhvcHRpb25zOiBJVGV4dExheW91dE9wdGlvbnMpXG5cdHtcblx0XHRPYmplY3QuZW50cmllcyhvcHRpb25zKVxuXHRcdFx0LmZvckVhY2goKFtrLCB2XSkgPT4gb3B0aW9uc1trXSA9IGVudlZhbCh2KSlcblx0XHQ7XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdC8qKlxuXHQgKiDpgJrnlKjlnovmrrXokL3oqr/mlbRcblx0ICpcblx0ICogQHJldHVybnMge3N0cmluZ31cblx0ICovXG5cdHRleHRsYXlvdXQoaHRtbCwgb3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zID0ge30pOiBzdHJpbmdcblx0e1xuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRodG1sID0gdGhpcy50cmltKGh0bWwsIG9wdGlvbnMpO1xuXG5cdFx0aHRtbCA9IC8vaHRtbFxuXHRcdFx0Ly8ucmVwbGFjZSgvXFxyXFxufFxccig/IVxcbikvZywgXCJcXG5cIilcblx0XHRcdGh0bWxcblx0XHRcdC5yZXBsYWNlKC9bIOOAgFxcdF0rXFxuL2csIFwiXFxuXCIpXG5cdFx0XHQucmVwbGFjZSgvW1xcc+OAgF0rJC9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9eW1xcbiBcXHRdKy9nLCAnJylcblx0XHRcdC5yZXBsYWNlKC9cXG57NCx9L2csIFwiXFxuXFxuXFxuXFxuXCIpXG5cdFx0O1xuXG5cdFx0aWYgKCFodG1sLm1hdGNoKC9bXlxcbl1cXG5bXlxcbl0vZykpXG5cdFx0e1xuXHRcdFx0bGV0IFttaW4sIG1pZCwgbWF4XSA9IGdldE1pbk1pZE1heChodG1sLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRpZiAobWluID4gMilcblx0XHRcdHtcblx0XHRcdFx0b3B0aW9ucy5hbGxvd19sZjIgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1heCA+PSAzKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAobWluID4gMilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCByID0gbmV3IFJlZ0V4cChgXFxcXG57JHttaW4gLSAxfX0oXFxcXG4rKWAsICdnJyk7XG5cblx0XHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdFx0Ly8ucmVwbGFjZSgvXFxuezJ9KFxcbiopL2csICckMScpXG5cdFx0XHRcdFx0XHQucmVwbGFjZShyLCAnJDEnKVxuXHRcdFx0XHRcdDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGh0bWwgPSBodG1sXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cXG5cIilcblx0XHRcdFx0XHQvLy5yZXBsYWNlKC9cXG57Mn0vZywgXCJcXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHQvL2NvbnNvbGUubG9nKG9wdGlvbnMpO1xuXG5cdFx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfbGYyKVxuXHRcdFx0e1xuXHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC9cXG5cXG4vZywgXCJcXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGh0bWwgPSBodG1sXG5cdFx0XHQvLyBmb3IgdHNcblx0XHRcdC50b1N0cmluZygpXG5cdFx0XHQucmVwbGFjZSgvKFteXFxu44CM44CN44CQ44CR44CK44CL4oCc4oCd44CO44CP77yI77yJXFxbXFxdXCJdKD86W++8ge+8nz8h44CCXSopPylcXG4oKD86W+KAlF0rKT9b44CM44CN4oCc4oCd44CQ44CR44CK44CL77yI77yJ44CO44CPXSkvdWcsIFwiJDFcXG5cXG4kMlwiKVxuXG5cdFx0XHQucmVwbGFjZSgvKFvjgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvInigJVcXFtcXF1cIl0oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzrjgIAqKVteXFxu44CM44CN4oCc4oCd44CQ44CR44CK44CL77yI77yJ44CO44CPXSkvdWcsIFwiJDFcXG5cXG4kMlwiKVxuXHRcdFx0LnJlcGxhY2UoLyhbXlxcbuOAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8iVxcW1xcXVwi4omq4omrXSg/OlvvvIHvvJ8/IeOAgl0qKT8pXFxuKCg/OlvigJRdKyk/W+KJquKJq+OAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pL3VnLCBcIiQxXFxuXFxuJDJcIilcblxuXHRcdFx0LnJlcGxhY2UoLyhb44CM44CN44CQ44CR44CK44CL4oCc4oCd44CO44CP77yI77yJ4oCVXFxbXFxdXCJdKD86W++8ge+8nz8h44CCXSopPylcXG4oKD8644CAKilbXlxcbuOAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pL3VnLCBcIiQxXFxuXFxuJDJcIilcblxuXHRcdFx0LnJlcGxhY2UoLyjvvIkoPzpb77yB77yfPyHjgIJdKik/KVxcbihb44CM44CN44CQ44CR44CK44CL44CO44CP4oCc4oCdXSkvdWcsIFwiJDFcXG5cXG4kMlwiKVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIGh0dHBzOi8vdGllYmEuYmFpZHUuY29tL3AvNTQwMDUwMzg2NFxuXHRcdFx0ICpcblx0XHRcdCAqIOOAjOesrOS4ieivleeCvOS5n++8jOWkmuS6j+S6huWmrumcsuiAjOmAmui/h+S6huWQl+KApuKApuOAjVxuXHRcdFx0IOOAjuW/g+elnuWuiOaKpOeahOeZvee+veavm+OAj++8jOi/meS4quS7juWmrumcsumCo+mHjOaUtuWIsOeahOaKpOi6q+espu+8jOehruWunuWcsOWuiOaKpOS6huaIkeeahOW/g+OAglxuXG5cdFx0XHQgKi9cblx0XHRcdC5yZXBsYWNlKC8oW+OAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8ieKAlV0oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzpb44CM44CN4oCc4oCd44CQ44CR44CK44CL77yI77yJ44CO44CPXSkoPzpbXlxcbl0rKShbXuOAjOOAjeOAkOOAkeOAiuOAi+KAnOKAneOAjuOAj++8iO+8ieKAlV0oPzpb77yB77yfPyHjgIJdKik/KVxcbikvdWcsIFwiJDFcXG4kMlxcblwiKVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIOS9j+aJi++8jOS9j+aJi++8jOaIkeWwseaYr+aIkeOAguS4jeaYr+WFtuS7lueahOS7u+S9leS6uuOAglxuXHRcdFx0IOOAgOihqOekuuWHuuimgeW/heatu+WcsOi/m+ihjOaKteaKl+eahOaEj+W/l++8jOS9huaYr+S+teWFpeiEkeWGheeahOi/meS4quOAjuS7gOS5iOS4nOilv+OAj++8jOW5tuS4jeiDveiiq+mYu+atouOAguS4jeiDveiiq++8jOmYu+atouKApuKAplxuXHRcdFx0ICovXG5cdFx0XHQucmVwbGFjZSgvKFxcbig/Olte44CAXFxuXVteXFxuXSspKVxcbihb44CAXSkvZywgJyQxXFxuXFxuJDInKVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIOi/meagt+S4gOebtOWcqOi/memrmOWFtOedgFxuXG5cdFx0XHQg44CCXG5cdFx0XHQgKi9cblx0XHRcdC8vLnJlcGxhY2UoLyhbXlxcbl0pKFxcbispKCg/OlvlkKflkaJdKik/W+OAgu+8ge+8n++8jOOAgV0pXFxuL3VnLCBcIiQxJDMkMlwiKVxuXG5cdFx0XHQucmVwbGFjZSgvKFteXFxuXSkoXFxuKykoZmlufFxcPOWujFxcPikoXFxufCQpL2lnLCBcIiQxJDJcXG4kMyQ0XCIpXG5cdFx0O1xuXG5cdFx0aHRtbCA9IGh0bWxcblx0XHRcdC5yZXBsYWNlKC9eXFxuK3xbXFxz44CAXSskL2csICcnKVxuXHRcdFx0Lypcblx0XHRcdC5yZXBsYWNlKC8oXFxuKXs0LH0vZywgXCJcXG5cXG5cXG5cXG5cIilcblx0XHRcdC5yZXBsYWNlKC8oXFxuKXszfS9nLCBcIlxcblxcblwiKVxuXHRcdFx0Ki9cblx0XHRcdC5yZXBsYWNlKC8oXFxuKXs0LH0vZywgXCJcXG5cXG5cXG5cXG5cIilcblxuXHRcdDtcblxuXHRcdFx0aWYgKG9wdGlvbnMuYWxsb3dfbGYzKVxuXHRcdFx0e1xuXHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC8oXFxuKXszLH0vZywgXCJcXG5cXG5cXG5cIilcblx0XHRcdFx0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRodG1sID0gaHRtbFxuXHRcdFx0XHRcdC5yZXBsYWNlKC8oXFxuKXszfS9nLCBcIlxcblxcblwiKVxuXHRcdFx0XHQ7XG5cdFx0XHR9XG5cblx0XHRyZXR1cm4gaHRtbDtcblx0fVxuXG59XG5cbmltcG9ydCAqIGFzIE5vdmVsVGV4dCBmcm9tICcuL3RleHQnO1xuXG5leHBvcnQgZGVmYXVsdCBOb3ZlbFRleHQ7XG4iXX0=