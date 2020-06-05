"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
const marked_1 = __importDefault(require("marked"));
const crlf_normalize_1 = require("crlf-normalize");
const moment_1 = require("moment");
const is_plain_object_1 = __importDefault(require("is-plain-object"));
const RawObject_1 = require("./lib/RawObject");
const core_1 = require("./lib/core");
exports.defaultOptionsParse = {
    crlf: crlf_normalize_1.LF,
    allowBlockquote: true,
    markedOptions: Object.assign({}, marked_1.default.defaults, {
        breaks: true,
    }),
};
function parse(str, options = {}) {
    {
        let markedOptions = Object.assign({}, exports.defaultOptionsParse.markedOptions, options.markedOptions);
        options = Object.assign({}, exports.defaultOptionsParse, options, {
            markedOptions,
        });
    }
    let source = str.toString();
    let eol;
    if (1) {
        // disable crlf options
        eol = crlf_normalize_1.LF;
        source = crlf_normalize_1.crlf(source, eol);
    }
    /*
    else if (options.crlf)
    {
        eol = options.crlf;
        source = crlf(source, eol);
    }
    else
    {
        let ck = chkcrlf(source);
        eol = ck.lf ? LF : (ck.crlf ? CRLF : CR);
    }
     */
    let lexer = new marked_1.default.Lexer(options.markedOptions);
    let toks = lexer.lex(source);
    let conf = {};
    let keys = [];
    let depth = 0;
    let inlist = false;
    let paragraph = [];
    let paragraph2 = [];
    let last_tok;
    let blockquote_start;
    let inline_lexer = core_1.createInlineLexer(toks, Object.assign({}, options, {}));
    /*
    let _inline_md = new MarkdownIt({
        linkify: false,
    });
    */
    toks.forEach(function (tok, index) {
        let val = tok.text;
        let _skip;
        let type = tok.type;
        if (type == 'text' && val.match(/[a-z]+\:\/\//i)) {
            let r = inline_lexer.output(val);
            //let r = _inline_md.renderInline(val);
            if (val !== r && /^\s*<a href=/.test(r)) {
                type = 'text2';
            }
        }
        switch (tok.type) {
            case 'heading':
                while (depth-- >= tok.depth)
                    keys.pop();
                keys.push(core_1.normalize(tok.text, options));
                depth = tok.depth;
                paragraph = [];
                break;
            case 'list_item_start':
                inlist = true;
                break;
            case 'list_item_end':
                inlist = false;
                break;
            // @ts-ignore
            case 'text2':
            case 'text':
                core_1.put(conf, keys, tok.text, undefined, undefined, options, {
                    type,
                });
                break;
            case 'blockquote_start':
                blockquote_start = true;
                if (options.allowBlockquote) {
                    paragraph2 = paragraph;
                    paragraph = [];
                }
                else {
                    _skip = true;
                }
                //console.log(tok);
                break;
            case 'blockquote_end':
                if (options.allowBlockquote && blockquote_start && paragraph.length) {
                    val = paragraph.join(eol);
                    val = val.replace(/\s+$/g, '');
                    if (!options.oldParseApi) {
                        val = new RawObject_1.RawObject(val, {
                            type: 'blockquote',
                            text: paragraph,
                            paragraph: paragraph2,
                        });
                    }
                    core_1.put(conf, keys, val, true, undefined, options);
                    paragraph = [];
                }
                else {
                    _skip = true;
                }
                blockquote_start = false;
                break;
            case 'paragraph':
                paragraph.push(tok.text);
                //console.log(tok);
                break;
            case 'code':
                val = val.replace(/\s+$/g, '');
                if (!options.oldParseApi) {
                    val = new RawObject_1.RawObject(val, tok);
                    val.getRawData().paragraph = paragraph;
                }
                core_1.put(conf, keys, val, true, undefined, options);
                break;
            case 'table':
                core_1.put(conf, keys, null, null, { headers: tok.header, rows: tok.cells }, options);
                break;
            case 'html':
                val = val.replace(/\s+$/g, '');
                if (!options.oldParseApi) {
                    val = new RawObject_1.RawObject(val, tok);
                    val.getRawData().paragraph = paragraph;
                }
                core_1.put(conf, keys, val, true, undefined, options);
                break;
            default:
                //console.log(tok);
                _skip = true;
                break;
        }
        if (!_skip && !['paragraph'].includes(tok.type)) {
            paragraph = [];
        }
        last_tok = tok;
    });
    {
        let parent;
        let parent2 = conf;
        let parent3;
        for (let i in keys) {
            let k = keys[i];
            if (/^\d+$/.test(k)) {
                // @ts-ignore
                let kk = keys[i - 1];
                // @ts-ignore
                let parent = core_1.getobjectbyid(keys.slice(0, i - 1), conf);
                // @ts-ignore
                let obj = core_1.getobjectbyid(keys.slice(0, i), conf);
                let ok = true;
                for (let j in obj) {
                    if (!/^\d+$/.test(j)) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    parent[kk] = Object.values(obj);
                }
            }
        }
    }
    return conf;
}
exports.parse = parse;
function stringify(dataInput, level = 1, skip = [], k) {
    let rs1 = [];
    let rs2 = [];
    let isRawObject;
    let data = dataInput;
    let desc;
    if (isRawObject = RawObject_1.RawObject.isRawObject(dataInput)) {
        let rawData = dataInput.getRawData();
        if (rawData.paragraph) {
            desc = rawData.paragraph.join(crlf_normalize_1.LF.repeat(2));
        }
        data = dataInput.getRawValue();
        isRawObject = true;
    }
    //console.log(k);
    if (Array.isArray(data)) {
        if (k || k === 0) {
            rs2.push('#'.repeat(level) + '' + k + crlf_normalize_1.LF);
            data.forEach(function (value, index, array) {
                let bool = (!RawObject_1.RawObject.isRawObject(value) && typeof value == 'object');
                rs2.push(stringify(value, level, [], bool ? index : null));
            });
        }
        else {
            data.forEach(function (value, index, array) {
                let bool = (!RawObject_1.RawObject.isRawObject(value) && typeof value == 'object');
                rs1.push(stringify(value, level, [], bool ? index : null).replace(/\n+$/g, ''));
            });
            //rs1.push('');
        }
    }
    else if (typeof data == 'object') {
        if (k || k === 0) {
            rs1.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
        }
        for (let k in data) {
            if (skip.includes(k)) {
                continue;
            }
            let isRawObject = RawObject_1.RawObject.isRawObject(data[k]);
            let row = isRawObject ? data[k].getRawValue() : data[k];
            if (Array.isArray(row)) {
                rs2.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
                rs2.push(stringify(row, level + 1));
            }
            else if (is_plain_object_1.default(row)) {
                rs2.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
                rs2.push(stringify(row, level + 1));
            }
            else if (moment_1.isMoment(row)) {
                rs1.push(`- ${k}: ${row.format()}`);
            }
            else if (isRawObject || typeof row == 'string' && /[\r\n]|^\s/g.test(row)) {
                let lang;
                let val = row;
                val = val.replace(/^[\r\n]+|\s+$/g, '');
                if (isRawObject) {
                    let rawData = data[k].getRawData() || {};
                    if (rawData.type != 'html') {
                        lang = rawData.lang;
                        val = core_1.makeCodeBlock(val, lang);
                    }
                    else {
                        val = crlf_normalize_1.LF + val + crlf_normalize_1.LF;
                    }
                }
                else {
                    val = core_1.makeCodeBlock(val, lang);
                }
                rs2.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
                rs2.push(val);
            }
            else {
                rs1.push(`- ${k}: ${row}`);
            }
        }
    }
    else if (isRawObject || typeof data == 'string' && /[\r\n]|^\s/g.test(data)) {
        if (k || k === 0) {
            rs2.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
        }
        if (desc) {
            rs2.push(desc);
        }
        let val = data;
        val = val.replace(/^[\r\n]+|\s+$/g, '');
        if (isRawObject) {
            let rawData = dataInput.getRawData() || {};
            if (rawData.type != 'html') {
                val = core_1.makeCodeBlock(val, rawData.lang);
            }
            else {
                val = crlf_normalize_1.LF + val + crlf_normalize_1.LF;
            }
        }
        else {
            val = core_1.makeCodeBlock(val);
        }
        rs2.push(val);
    }
    else {
        if (desc) {
            rs1.push(desc);
        }
        rs1.push(`- ${k || k === 0 ? k + ': ' : ''}${data}`);
    }
    let out = (rs1.concat([''].concat(rs2)).join(crlf_normalize_1.LF)).replace(/^\n+/g, '');
    if (level == 1) {
        out = out.replace(/^\n+|\s+$/g, '') + crlf_normalize_1.LF;
    }
    return out;
}
exports.stringify = stringify;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7R0FFRztBQUNILG9EQUEyQztBQUMzQyxtREFBNkQ7QUFDN0QsbUNBQWtDO0FBQ2xDLHNFQUE0QztBQUM1QywrQ0FBa0g7QUFDbEgscUNBQTZGO0FBb0JoRixRQUFBLG1CQUFtQixHQUFrQjtJQUNqRCxJQUFJLEVBQUUsbUJBQUU7SUFDUixlQUFlLEVBQUUsSUFBSTtJQUVyQixhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQzlCLGdCQUFFLENBQUMsUUFBUSxFQUNYO1FBQ0MsTUFBTSxFQUFFLElBQUk7S0FDWixDQUNEO0NBQ0QsQ0FBQztBQWlCRixTQUFnQixLQUFLLENBQUMsR0FBb0IsRUFBRSxVQUF5QixFQUFFO0lBRXRFO1FBQ0MsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsMkJBQW1CLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVoRyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsMkJBQW1CLEVBQUUsT0FBTyxFQUFFO1lBQ3pELGFBQWE7U0FDYixDQUFDLENBQUM7S0FDSDtJQUVELElBQUksTUFBTSxHQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNwQyxJQUFJLEdBQXdDLENBQUM7SUFFN0MsSUFBSSxDQUFDLEVBQ0w7UUFDQyx1QkFBdUI7UUFDdkIsR0FBRyxHQUFHLG1CQUFFLENBQUM7UUFDVCxNQUFNLEdBQUcscUJBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDM0I7SUFDRDs7Ozs7Ozs7Ozs7T0FXRztJQUVILElBQUksS0FBSyxHQUFHLElBQUksZ0JBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRWhELElBQUksSUFBSSxHQUFH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QUFDLENBQUMsRUFBRyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUM7S0FDdkQ7SUFFRCxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV2RSxJQUFJLEtBQUssSUFBSSxDQUFDLEVBQ2Q7UUFDQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLEdBQUcsbUJBQUUsQ0FBQztLQUN6QztJQUVELE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQTNLRCw4QkEyS0M7QUFFRCxrQkFBZSxPQUFrQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5pbXBvcnQgbWQsIHsgVG9rZW4sIFRva2VucyB9IGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgeyBjcmxmLCBMRiwgQ1JMRiwgQ1IsIGNoa2NybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgeyBpc01vbWVudCB9IGZyb20gJ21vbWVudCc7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdpcy1wbGFpbi1vYmplY3QnO1xuaW1wb3J0IHsgUmF3T2JqZWN0LCBJUmF3T2JqZWN0VG9rZW5QbHVzLCBJVG9rZW5UZXh0MiwgSVJhd09iamVjdFBsdXMsIElSYXdPYmplY3REYXRhUGx1cyB9IGZyb20gJy4vbGliL1Jhd09iamVjdCc7XG5pbXBvcnQgeyBjcmVhdGVJbmxpbmVMZXhlciwgbWFrZUNvZGVCbG9jaywgbm9ybWFsaXplLCBwdXQsIGdldG9iamVjdGJ5aWQgfSBmcm9tICcuL2xpYi9jb3JlJztcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1BhcnNlXG57XG5cdC8qKlxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0Y3JsZj86IHR5cGVvZiBMRiB8IHR5cGVvZiBDUkxGIHwgdHlwZW9mIENSLFxuXG5cdG9sZFBhcnNlQXBpPzogYm9vbGVhbixcblxuXHRhbGxvd0Jsb2NrcXVvdGU/OiBib29sZWFuLFxuXG5cdGRpc2FibGVLZXlUb0xvd2VyQ2FzZT86IGJvb2xlYW4sXG5cblx0bWFya2VkT3B0aW9ucz86IG1kLk1hcmtlZE9wdGlvbnMsXG5cblx0ZmlsdGVyT2JqZWN0S2V5Pyxcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRPcHRpb25zUGFyc2U6IElPcHRpb25zUGFyc2UgPSB7XG5cdGNybGY6IExGLFxuXHRhbGxvd0Jsb2NrcXVvdGU6IHRydWUsXG5cblx0bWFya2VkT3B0aW9uczogT2JqZWN0LmFzc2lnbih7fSxcblx0XHRtZC5kZWZhdWx0cyxcblx0XHR7XG5cdFx0XHRicmVha3M6IHRydWUsXG5cdFx0fSxcblx0KSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9iamVjdFBhcnNlXG57XG5cdFtrZXk6IHN0cmluZ106IGFueVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBvZiBtYXJrZG93bi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZyB8IEJ1ZmZlcn0gc3RyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHN0cjogc3RyaW5nLCBvcHRpb25zPzogSU9wdGlvbnNQYXJzZSk6IElPYmplY3RQYXJzZVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHN0cjogQnVmZmVyLCBvcHRpb25zPzogSU9wdGlvbnNQYXJzZSk6IElPYmplY3RQYXJzZVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHN0cjogc3RyaW5nIHwgQnVmZmVyLCBvcHRpb25zOiBJT3B0aW9uc1BhcnNlID0ge30pOiBJT2JqZWN0UGFyc2Vcbntcblx0e1xuXHRcdGxldCBtYXJrZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnNQYXJzZS5tYXJrZWRPcHRpb25zLCBvcHRpb25zLm1hcmtlZE9wdGlvbnMpO1xuXG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zUGFyc2UsIG9wdGlvbnMsIHtcblx0XHRcdG1hcmtlZE9wdGlvbnMsXG5cdFx0fSk7XG5cdH1cblxuXHRsZXQgc291cmNlOiBzdHJpbmcgPSBzdHIudG9TdHJpbmcoKTtcblx0bGV0IGVvbDogdHlwZW9mIExGIHwgdHlwZW9mIENSTEYgfCB0eXBlb2YgQ1I7XG5cblx0aWYgKDEpXG5cdHtcblx0XHQvLyBkaXNhYmxlIGNybGYgb3B0aW9uc1xuXHRcdGVvbCA9IExGO1xuXHRcdHNvdXJjZSA9IGNybGYoc291cmNlLCBlb2wpO1xuXHR9XG5cdC8qXG5cdGVsc2UgaWYgKG9wdGlvbnMuY3JsZilcblx0e1xuXHRcdGVvbCA9IG9wdGlvbnMuY3JsZjtcblx0XHRzb3VyY2UgPSBjcmxmKHNvdXJjZSwgZW9sKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRsZXQgY2sgPSBjaGtjcmxmKHNvdXJjZSk7XG5cdFx0ZW9sID0gY2subGYgPyBMRiA6IChjay5jcmxmID8gQ1JMRiA6IENSKTtcblx0fVxuXHQgKi9cblxuXHRsZXQgbGV4ZXIgPSBuZXcgbWQuTGV4ZXIob3B0aW9ucy5tYXJrZWRPcHRpb25zKTtcblxuXHRsZXQgdG9rcyA9IGxleGVyLmxleChzb3VyY2UpO1xuXHRsZXQgY29uZiA9IHt9O1xuXHRsZXQga2V5czogc3RyaW5nW10gPSBbXTtcblx0bGV0IGRlcHRoID0gMDtcblx0bGV0IGlubGlzdCA9IGZhbHNlO1xuXG5cdGxldCBwYXJhZ3JhcGg6IHN0cmluZ1tdID0gW107XG5cdGxldCBwYXJhZ3JhcGgyOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgbGFzdF90b2s6IG1kLlRva2VuO1xuXHRsZXQgYmxvY2txdW90ZV9zdGFydDogYm9vbGVhbjtcblxuXHRsZXQgaW5saW5lX2xleGVyID0gY3JlYXRlSW5saW5lTGV4ZXIodG9rcywgT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xuXG5cdH0pKTtcblxuXHQvKlxuXHRsZXQgX2lubGluZV9tZCA9IG5ldyBNYXJrZG93bkl0KHtcblx0XHRsaW5raWZ5OiBmYWxzZSxcblx0fSk7XG5cdCovXG5cblx0KHRva3MgYXMgVG9rZW5bXSkuZm9yRWFjaChmdW5jdGlvbiAodG9rLCBpbmRleClcblx0e1xuXHRcdGxldCB2YWw6IHN0cmluZyA9ICh0b2sgYXMgVG9rZW5zLkNvZGUpLnRleHQgO1xuXHRcdGxldCBfc2tpcDogYm9vbGVhbjtcblx0XHRsZXQgdHlwZTogKFRva2VuIHwgSVRva2VuVGV4dDIpW1widHlwZVwiXSA9IHRvay50eXBlO1xuXG5cdFx0aWYgKHR5cGUgPT0gJ3RleHQnICYmIHZhbC5tYXRjaCgvW2Etel0rXFw6XFwvXFwvL2kpKVxuXHRcdHtcblx0XHRcdGxldCByID0gaW5saW5lX2xleGVyLm91dHB1dCh2YWwpO1xuXHRcdFx0Ly9sZXQgciA9IF9pbmxpbmVfbWQucmVuZGVySW5saW5lKHZhbCk7XG5cblx0XHRcdGlmICh2YWwgIT09IHIgJiYgL15cXHMqPGEgaHJlZj0vLnRlc3QocikpXG5cdFx0XHR7XG5cdFx0XHRcdHR5cGUgPSAndGV4dDInO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHN3aXRjaCAodG9rLnR5cGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAnaGVhZGluZyc6XG5cdFx0XHRcdHdoaWxlIChkZXB0aC0tID49IHRvay5kZXB0aCkga2V5cy5wb3AoKTtcblx0XHRcdFx0a2V5cy5wdXNoKG5vcm1hbGl6ZSh0b2sudGV4dCwgb3B0aW9ucykpO1xuXHRcdFx0XHRkZXB0aCA9IHRvay5kZXB0aDtcblxuXHRcdFx0XHRwYXJhZ3JhcGggPSBbXTtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2xpc3RfaXRlbV9zdGFydCc6XG5cdFx0XHRcdGlubGlzdCA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbGlzdF9pdGVtX2VuZCc6XG5cdFx0XHRcdGlubGlzdCA9IGZhbHNlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0Y2FzZSAndGV4dDInOlxuXHRcdFx0Y2FzZSAndGV4dCc6XG5cdFx0XHRcdHB1dChjb25mLCBrZXlzLCB0b2sudGV4dCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9wdGlvbnMsIHtcblx0XHRcdFx0XHR0eXBlLFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdibG9ja3F1b3RlX3N0YXJ0Jzpcblx0XHRcdFx0YmxvY2txdW90ZV9zdGFydCA9IHRydWU7XG5cblx0XHRcdFx0aWYgKG9wdGlvbnMuYWxsb3dCbG9ja3F1b3RlKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGFyYWdyYXBoMiA9IHBhcmFncmFwaDtcblx0XHRcdFx0XHRwYXJhZ3JhcGggPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfc2tpcCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHRvayk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnYmxvY2txdW90ZV9lbmQnOlxuXG5cdFx0XHRcdGlmIChvcHRpb25zLmFsbG93QmxvY2txdW90ZSAmJiBibG9ja3F1b3RlX3N0YXJ0ICYmIHBhcmFncmFwaC5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YWwgPSBwYXJhZ3JhcGguam9pbihlb2wpO1xuXHRcdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0XHRpZiAoIW9wdGlvbnMub2xkUGFyc2VBcGkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFsID0gbmV3IFJhd09iamVjdCh2YWwsIHtcblx0XHRcdFx0XHRcdFx0dHlwZTogJ2Jsb2NrcXVvdGUnLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBwYXJhZ3JhcGgsXG5cblx0XHRcdFx0XHRcdFx0cGFyYWdyYXBoOiBwYXJhZ3JhcGgyLFxuXHRcdFx0XHRcdFx0fSkgYXMgYW55O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cblx0XHRcdFx0XHRwYXJhZ3JhcGggPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfc2tpcCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRibG9ja3F1b3RlX3N0YXJ0ID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAncGFyYWdyYXBoJzpcblx0XHRcdFx0cGFyYWdyYXBoLnB1c2godG9rLnRleHQpO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHRvayk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnY29kZSc6XG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zLm9sZFBhcnNlQXBpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFsID0gbmV3IFJhd09iamVjdCh2YWwsIHRvaykgYXMgYW55O1xuXHRcdFx0XHRcdCh2YWwgYXMgYW55IGFzIElSYXdPYmplY3RQbHVzKS5nZXRSYXdEYXRhKCkucGFyYWdyYXBoID0gcGFyYWdyYXBoO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cHV0KGNvbmYsIGtleXMsIHZhbCwgdHJ1ZSwgdW5kZWZpbmVkLCBvcHRpb25zKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd0YWJsZSc6XG5cdFx0XHRcdHB1dChjb25mLCBrZXlzLCBudWxsLCBudWxsLCB7IGhlYWRlcnM6IHRvay5oZWFkZXIsIHJvd3M6IHRvay5jZWxscyB9LCBvcHRpb25zKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdodG1sJzpcblx0XHRcdFx0dmFsID0gdmFsLnJlcGxhY2UoL1xccyskL2csICcnKTtcblxuXHRcdFx0XHRpZiAoIW9wdGlvbnMub2xkUGFyc2VBcGkpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwgdG9rKSBhcyBhbnk7XG5cdFx0XHRcdFx0KHZhbCBhcyBhbnkgYXMgSVJhd09iamVjdFBsdXMpLmdldFJhd0RhdGEoKS5wYXJhZ3JhcGggPSBwYXJhZ3JhcGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdmFsLCB0cnVlLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vY29uc29sZS5sb2codG9rKTtcblxuXHRcdFx0XHRfc2tpcCA9IHRydWU7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0aWYgKCFfc2tpcCAmJiAhWydwYXJhZ3JhcGgnXS5pbmNsdWRlcyh0b2sudHlwZSkpXG5cdFx0e1xuXHRcdFx0cGFyYWdyYXBoID0gW107XG5cdFx0fVxuXG5cdFx0bGFzdF90b2sgPSB0b2s7XG5cdH0pO1xuXG5cdHtcblx0XHRsZXQgcGFyZW50O1xuXHRcdGxldCBwYXJlbnQyID0gY29uZjtcblx0XHRsZXQgcGFyZW50MztcblxuXHRcdGZvciAobGV0IGkgaW4ga2V5cylcblx0XHR7XG5cdFx0XHRsZXQgayA9IGtleXNbaV07XG5cblx0XHRcdGlmICgvXlxcZCskLy50ZXN0KGspKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBrayA9IGtleXNbaS0xXTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBwYXJlbnQgPSBnZXRvYmplY3RieWlkKGtleXMuc2xpY2UoMCwgaS0xKSwgY29uZik7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IG9iaiA9IGdldG9iamVjdGJ5aWQoa2V5cy5zbGljZSgwLCBpKSwgY29uZik7XG5cblx0XHRcdFx0bGV0IG9rID0gdHJ1ZTtcblxuXHRcdFx0XHRmb3IgKGxldCBqIGluIG9iaiBhcyBvYmplY3QpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoIS9eXFxkKyQvLnRlc3QoaikpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0b2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChvaylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBhcmVudFtra10gPSBPYmplY3QudmFsdWVzKG9iaik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH1cblx0fVxuXG5cdHJldHVybiBjb25mO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGRhdGFJbnB1dDogdW5rbm93biB8IElSYXdPYmplY3RQbHVzLCBsZXZlbDogbnVtYmVyID0gMSwgc2tpcCA9IFtdLCBrPyk6IHN0cmluZ1xue1xuXHRsZXQgcnMxOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgcnMyOiBzdHJpbmdbXSA9IFtdO1xuXG5cdGxldCBpc1Jhd09iamVjdDogdHJ1ZSB8IGZhbHNlO1xuXHRsZXQgZGF0YSA9IGRhdGFJbnB1dDtcblx0bGV0IGRlc2M7XG5cblx0aWYgKGlzUmF3T2JqZWN0ID0gUmF3T2JqZWN0LmlzUmF3T2JqZWN0KGRhdGFJbnB1dCkpXG5cdHtcblx0XHRsZXQgcmF3RGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdEYXRhKCk7XG5cblx0XHRpZiAocmF3RGF0YS5wYXJhZ3JhcGgpXG5cdFx0e1xuXHRcdFx0ZGVzYyA9IHJhd0RhdGEucGFyYWdyYXBoLmpvaW4oTEYucmVwZWF0KDIpKTtcblx0XHR9XG5cblx0XHRkYXRhID0gZGF0YUlucHV0LmdldFJhd1ZhbHVlKCk7XG5cblx0XHRpc1Jhd09iamVjdCA9IHRydWUgYXMgdHJ1ZTtcblx0fVxuXG5cdC8vY29uc29sZS5sb2coayk7XG5cblx0aWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpXG5cdHtcblx0XHRpZiAoayB8fCBrID09PSAwKVxuXHRcdHtcblx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJycgKyBrICsgTEYpO1xuXG5cdFx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sID0gKCFSYXdPYmplY3QuaXNSYXdPYmplY3QodmFsdWUpICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jyk7XG5cblx0XHRcdFx0cnMyLnB1c2goc3RyaW5naWZ5KHZhbHVlLCBsZXZlbCwgW10sIGJvb2wgPyBpbmRleCA6IG51bGwpKTtcblx0XHRcdH0pXG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgYXJyYXkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBib29sID0gKCFSYXdPYmplY3QuaXNSYXdPYmplY3QodmFsdWUpICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jyk7XG5cblx0XHRcdFx0cnMxLnB1c2goc3RyaW5naWZ5KHZhbHVlLCBsZXZlbCwgW10sIGJvb2wgPyBpbmRleCA6IG51bGwpLnJlcGxhY2UoL1xcbiskL2csICcnKSk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9yczEucHVzaCgnJyk7XG5cdFx0fVxuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBkYXRhID09ICdvYmplY3QnKVxuXHR7XG5cdFx0aWYgKGsgfHwgayA9PT0gMClcblx0XHR7XG5cdFx0XHRyczEucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XG5cdFx0fVxuXG5cdFx0Zm9yIChsZXQgayBpbiBkYXRhKVxuXHRcdHtcblx0XHRcdGlmIChza2lwLmluY2x1ZGVzKGspKVxuXHRcdFx0e1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0bGV0IGlzUmF3T2JqZWN0ID0gUmF3T2JqZWN0LmlzUmF3T2JqZWN0KGRhdGFba10pO1xuXHRcdFx0bGV0IHJvdyA9IGlzUmF3T2JqZWN0ID8gZGF0YVtrXS5nZXRSYXdWYWx1ZSgpIDogZGF0YVtrXTtcblxuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocm93KSlcblx0XHRcdHtcblx0XHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdFx0XHRyczIucHVzaChzdHJpbmdpZnkocm93LCBsZXZlbCArIDEpKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGlzUGxhaW5PYmplY3Qocm93KSlcblx0XHRcdHtcblx0XHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdFx0XHRyczIucHVzaChzdHJpbmdpZnkocm93LCBsZXZlbCArIDEpKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGlzTW9tZW50KHJvdykpXG5cdFx0XHR7XG5cdFx0XHRcdHJzMS5wdXNoKGAtICR7a306ICR7cm93LmZvcm1hdCgpfWApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXNSYXdPYmplY3QgfHwgdHlwZW9mIHJvdyA9PSAnc3RyaW5nJyAmJiAvW1xcclxcbl18Xlxccy9nLnRlc3Qocm93KSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGxhbmc6IHN0cmluZztcblx0XHRcdFx0bGV0IHZhbCA9IHJvdztcblxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXltcXHJcXG5dK3xcXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKGlzUmF3T2JqZWN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHJhd0RhdGEgPSBkYXRhW2tdLmdldFJhd0RhdGEoKSB8fCB7fTtcblxuXHRcdFx0XHRcdGlmIChyYXdEYXRhLnR5cGUgIT0gJ2h0bWwnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxhbmcgPSByYXdEYXRhLmxhbmc7XG5cblx0XHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhbCA9IExGICsgdmFsICsgTEY7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHRcdFx0cnMyLnB1c2godmFsKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cnMxLnB1c2goYC0gJHtrfTogJHtyb3d9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGVsc2UgaWYgKGlzUmF3T2JqZWN0IHx8IHR5cGVvZiBkYXRhID09ICdzdHJpbmcnICYmIC9bXFxyXFxuXXxeXFxzL2cudGVzdChkYXRhKSlcblx0e1xuXHRcdGlmIChrIHx8IGsgPT09IDApXG5cdFx0e1xuXHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdH1cblxuXHRcdGlmIChkZXNjKVxuXHRcdHtcblx0XHRcdHJzMi5wdXNoKGRlc2MpO1xuXHRcdH1cblxuXHRcdGxldCB2YWwgPSBkYXRhIGFzIHN0cmluZztcblxuXHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9eW1xcclxcbl0rfFxccyskL2csICcnKTtcblxuXHRcdGlmIChpc1Jhd09iamVjdClcblx0XHR7XG5cdFx0XHRsZXQgcmF3RGF0YSA9IChkYXRhSW5wdXQgYXMgSVJhd09iamVjdFBsdXMpLmdldFJhd0RhdGEoKSB8fCB7fSBhcyBJUmF3T2JqZWN0RGF0YVBsdXM7XG5cblx0XHRcdGlmIChyYXdEYXRhLnR5cGUgIT0gJ2h0bWwnKVxuXHRcdFx0e1xuXHRcdFx0XHR2YWwgPSBtYWtlQ29kZUJsb2NrKHZhbCwgcmF3RGF0YS5sYW5nKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dmFsID0gTEYgKyB2YWwgKyBMRjtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsKTtcblx0XHR9XG5cblx0XHRyczIucHVzaCh2YWwpO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGlmIChkZXNjKVxuXHRcdHtcblx0XHRcdHJzMS5wdXNoKGRlc2MpO1xuXHRcdH1cblxuXHRcdHJzMS5wdXNoKGAtICR7IGsgfHwgayA9PT0gMCA/IGsgKyAnOiAnIDogJycgfSR7ZGF0YX1gKTtcblx0fVxuXG5cdGxldCBvdXQgPSAocnMxLmNvbmNhdChbJyddLmNvbmNhdChyczIpKS5qb2luKExGKSkucmVwbGFjZSgvXlxcbisvZywgJycpO1xuXG5cdGlmIChsZXZlbCA9PSAxKVxuXHR7XG5cdFx0b3V0ID0gb3V0LnJlcGxhY2UoL15cXG4rfFxccyskL2csICcnKSArIExGO1xuXHR9XG5cblx0cmV0dXJuIG91dDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL2NvcmUnKTtcblxuIl19