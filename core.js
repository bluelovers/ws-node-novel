"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = __importDefault(require("marked"));
const util_1 = __importDefault(require("util"));
const crlf_normalize_1 = require("crlf-normalize");
exports.crlf = crlf_normalize_1.crlf;
exports.LF = crlf_normalize_1.LF;
exports.CRLF = crlf_normalize_1.CRLF;
exports.CR = crlf_normalize_1.CR;
const deepmerge_plus_1 = __importDefault(require("deepmerge-plus"));
exports.deepmerge = deepmerge_plus_1.default;
const moment_1 = __importDefault(require("moment"));
exports.moment = moment_1.default;
const is_plain_object_1 = __importDefault(require("is-plain-object"));
exports.isPlainObject = is_plain_object_1.default;
exports.SYMBOL_RAW_DATA = Symbol.for('raw_data');
exports.SYMBOL_RAW_VALUE = Symbol.for('raw_value');
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
    else if (options.crlf) {
        eol = options.crlf;
        source = crlf_normalize_1.crlf(source, eol);
    }
    else {
        let ck = crlf_normalize_1.chkcrlf(source);
        eol = ck.lf ? crlf_normalize_1.LF : (ck.crlf ? crlf_normalize_1.CRLF : crlf_normalize_1.CR);
    }
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
    let inline_lexer = createInlineLexer(toks, Object.assign({}, options, {}));
    /*
    let _inline_md = new MarkdownIt({
        linkify: false,
    });
    */
    toks.forEach(function (tok, index) {
        // @ts-ignore
        let val = tok.text;
        let _skip;
        let type = tok.type;
        if (type == 'text' && val.match(/[a-z]+\:\/\//i)) {
            let r = inline_lexer.output(val);
            //let r = _inline_md.renderInline(val);
            if (val !== r && /^\s*<a href=/.test(r)) {
                // @ts-ignore
                type = 'text2';
            }
        }
        switch (tok.type) {
            case 'heading':
                while (depth-- >= tok.depth)
                    keys.pop();
                keys.push(normalize(tok.text, options));
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
                put(conf, keys, tok.text, undefined, undefined, options, {
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
                        // @ts-ignore
                        val = new RawObject(val, {
                            type: 'blockquote',
                            text: paragraph,
                            paragraph: paragraph2,
                        });
                    }
                    put(conf, keys, val, true, undefined, options);
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
                    // @ts-ignore
                    val = new RawObject(val, tok);
                    // @ts-ignore
                    val.getRawData()['paragraph'] = paragraph;
                }
                put(conf, keys, val, true, undefined, options);
                break;
            case 'table':
                put(conf, keys, null, null, { headers: tok.header, rows: tok.cells }, options);
                break;
            case 'html':
                val = val.replace(/\s+$/g, '');
                if (!options.oldParseApi) {
                    // @ts-ignore
                    val = new RawObject(val, tok);
                    // @ts-ignore
                    val.getRawData()['paragraph'] = paragraph;
                }
                put(conf, keys, val, true, undefined, options);
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
                let parent = getobjectbyid(keys.slice(0, i - 1), conf);
                // @ts-ignore
                let obj = getobjectbyid(keys.slice(0, i), conf);
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
function getobjectbyid(a, conf) {
    let ret = conf;
    for (let i of a) {
        ret = ret[i];
    }
    return ret;
}
exports.getobjectbyid = getobjectbyid;
/**
 * Add `str` to `obj` with the given `keys`
 * which represents the traversal path.
 *
 * @api private
 */
function put(obj, keys, str, code, table, options = {}, others = {}) {
    let target = obj;
    let last;
    let key;
    for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        last = target;
        target[key] = target[key] || {};
        target = target[key];
    }
    // code
    if (code) {
        if (!Array.isArray(last[key]))
            last[key] = [];
        last[key].push(str);
        return;
    }
    // table
    if (table) {
        if (!Array.isArray(last[key]))
            last[key] = [];
        for (let ri = 0; ri < table.rows.length; ri++) {
            let arrItem = {};
            for (let hi = 0; hi < table.headers.length; hi++) {
                arrItem[normalize(table.headers[hi], options)] = table.rows[ri][hi];
            }
            last[key].push(arrItem);
        }
        return;
    }
    let isKey;
    let i = str.indexOf(':');
    if (options.filterObjectKey) {
        if (typeof options.filterObjectKey == 'function') {
            isKey = options.filterObjectKey(str, obj, others);
        }
        else {
            i = str.search(options.filterObjectKey);
            isKey = i != -1;
        }
    }
    // list
    if ((isKey === false || -1 == i || others.type == 'text2')) {
        if (!Array.isArray(last[key]))
            last[key] = [];
        last[key].push(str.trim());
        return;
    }
    // map
    key = normalize(str.slice(0, i), options);
    let val = str.slice(i + 1).trim();
    target[key] = val;
}
exports.put = put;
/**
 * Normalize `str`.
 */
function normalize(str, options = {}) {
    let key = str.replace(/\s+/g, ' ');
    if (!options.disableKeyToLowerCase) {
        key = key.toLowerCase();
    }
    return key.trim();
}
exports.normalize = normalize;
function stringify(dataInput, level = 1, skip = [], k) {
    let rs1 = [];
    let rs2 = [];
    let isRawObject = RawObject.isRawObject(dataInput);
    let data = dataInput;
    let desc;
    if (isRawObject) {
        let rawData = dataInput.getRawData();
        if (rawData.paragraph) {
            desc = rawData.paragraph.join(crlf_normalize_1.LF.repeat(2));
        }
        data = dataInput.getRawValue();
    }
    //console.log(k);
    if (Array.isArray(data)) {
        if (k || k === 0) {
            rs2.push('#'.repeat(level) + '' + k + crlf_normalize_1.LF);
            data.forEach(function (value, index, array) {
                let bool = (!RawObject.isRawObject(value) && typeof value == 'object');
                rs2.push(stringify(value, level, [], bool ? index : null));
            });
        }
        else {
            data.forEach(function (value, index, array) {
                let bool = (!RawObject.isRawObject(value) && typeof value == 'object');
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
            let isRawObject = RawObject.isRawObject(data[k]);
            let row = isRawObject ? data[k].getRawValue() : data[k];
            if (Array.isArray(row)) {
                rs2.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
                rs2.push(stringify(row, level + 1));
            }
            else if (is_plain_object_1.default(row)) {
                rs2.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
                rs2.push(stringify(row, level + 1));
            }
            else if (moment_1.default.isMoment(row)) {
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
                        val = makeCodeBlock(val, lang);
                    }
                    else {
                        val = crlf_normalize_1.LF + val + crlf_normalize_1.LF;
                    }
                }
                else {
                    val = makeCodeBlock(val, lang);
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
        let lang;
        let val = data;
        val = val.replace(/^[\r\n]+|\s+$/g, '');
        if (isRawObject) {
            let rawData = dataInput.getRawData() || {};
            lang = rawData.lang;
            if (rawData.type != 'html') {
                val = makeCodeBlock(val, lang);
            }
            else {
                val = crlf_normalize_1.LF + val + crlf_normalize_1.LF;
            }
        }
        else {
            val = makeCodeBlock(val, lang);
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
function makeCodeBlock(value, lang) {
    return `\n\`\`\`${lang || ''}\n${value}\n\`\`\`\n`;
}
exports.makeCodeBlock = makeCodeBlock;
class RawObject {
    constructor(source, raw) {
        if (raw) {
            this[exports.SYMBOL_RAW_DATA] = raw;
        }
        this[exports.SYMBOL_RAW_VALUE] = source;
    }
    inspect() {
        let pad = this[exports.SYMBOL_RAW_DATA] && this[exports.SYMBOL_RAW_DATA].type;
        return 'Raw' + this.getTypeof().replace(/^[a-z]/, function (s) {
            return s.toUpperCase();
        }) + `(${util_1.default.inspect(this.getRawValue())}${pad ? ', ' + pad : ''})`;
    }
    toJSON() {
        return this.toString();
    }
    toString() {
        return this[exports.SYMBOL_RAW_VALUE].toString();
    }
    getTypeof() {
        return Array.isArray(this[exports.SYMBOL_RAW_VALUE]) ? 'array' : typeof this[exports.SYMBOL_RAW_VALUE];
    }
    getRawData() {
        return this[exports.SYMBOL_RAW_DATA];
    }
    getRawValue() {
        return this[exports.SYMBOL_RAW_VALUE];
    }
    static isRawObject(v) {
        return (v instanceof RawObject);
    }
    static removeRawData(data) {
        if (this.isRawObject(data)) {
            data = data.getRawValue();
        }
        if (typeof data == 'object') {
            for (let i in data) {
                data[i] = this.removeRawData(data[i]);
            }
        }
        return data;
    }
}
exports.RawObject = RawObject;
exports.default = exports;
function createInlineLexer(toks, options) {
    let opts = Object.assign({}, exports.defaultOptionsParse.markedOptions, options.markedOptions);
    // @ts-ignore
    let inline = new marked_1.default.InlineLexer(toks.links, opts);
    return inline;
}
exports.createInlineLexer = createInlineLexer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFJQSxvREFBd0I7QUFDeEIsZ0RBQXdCO0FBQ3hCLG1EQUE2RDtBQU1wRCxlQU5BLHFCQUFJLENBTUE7QUFBRSxhQU5BLG1CQUFFLENBTUE7QUFBRSxlQU5BLHFCQUFJLENBTUE7QUFBRSxhQU5BLG1CQUFFLENBTUE7QUFMM0Isb0VBQXVDO0FBSVAsb0JBSnpCLHdCQUFTLENBSXlCO0FBSHpDLG9EQUE0QjtBQUdKLGlCQUhqQixnQkFBTSxDQUdpQjtBQUY5QixzRUFBNEM7QUFFbkMsd0JBRkYseUJBQWEsQ0FFRTtBQUdULFFBQUEsZUFBZSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDekMsUUFBQSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBZ0IzQyxRQUFBLG1CQUFtQixHQUFrQjtJQUNqRCxJQUFJLEVBQUUsbUJBQUU7SUFDUixlQUFlLEVBQUUsSUFBSTtJQUVyQixhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQzlCLGdCQUFFLENBQUMsUUFBUSxFQUNYO1FBQ0MsTUFBTSxFQUFFLElBQUk7S0FDWixDQUNEO0NBQ0QsQ0FBQztBQWlCRixTQUFnQixLQUFLLENBQUMsR0FBb0IsRUFBRSxVQUF5QixFQUFFO0lBRXRFO1FBQ0MsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsMkJBQW1CLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVoRyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsMkJBQW1CLEVBQUUsT0FBTyxFQUFFO1lBQ3pELGFBQWE7U0FDYixDQUFDLENBQUM7S0FDSDtJQUVELElBQUksTUFBTSxHQUFXLEdBQUcsQ0FBQyxRQUFRLEVB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Q0FBQztJQUVELFdBQVc7UUFFVixPQUFPLElBQUksQ0FBQyx3QkFBZ0IsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQVM7UUFFM0IsT0FBTyxDQUFDLENBQUMsWUFBWSxTQUFTLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBU0QsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJO1FBRXhCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDMUI7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQzFCO1FBRUQsSUFBSSxPQUFPLElBQUksSUFBSSxRQUFRLEVBQzNCO1lBQ0MsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQ2xCO2dCQUNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RDO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FFRDtBQTdFRCw4QkE2RUM7QUFRRCxrQkFBZSxPQUFrQyxDQUFDO0FBRWxELFNBQWdCLGlCQUFpQixDQUFDLElBQW1CLEVBQUUsT0FBc0I7SUFFNUUsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsMkJBQW1CLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV2RixhQUFhO0lBQ2IsSUFBSSxNQUFNLEdBQUcsSUFBSSxnQkFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRWxELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQztBQVJELDhDQVFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5pbXBvcnQgeyBUb2tlbiwgVG9rZW5zTGlzdCwgVG9rZW5zIH0gZnJvbSAnbWFya2VkJztcbmltcG9ydCBtZCBmcm9tICdtYXJrZWQnO1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBjcmxmLCBMRiwgQ1JMRiwgQ1IsIGNoa2NybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgZGVlcG1lcmdlIGZyb20gJ2RlZXBtZXJnZS1wbHVzJztcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50JztcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCc7XG5cbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QsIG1vbWVudCwgZGVlcG1lcmdlIH1cbmV4cG9ydCB7IGNybGYsIExGLCBDUkxGLCBDUiB9XG5cbmV4cG9ydCBjb25zdCBTWU1CT0xfUkFXX0RBVEEgPSBTeW1ib2wuZm9yKCdyYXdfZGF0YScpO1xuZXhwb3J0IGNvbnN0IFNZTUJPTF9SQVdfVkFMVUUgPSBTeW1ib2wuZm9yKCdyYXdfdmFsdWUnKTtcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1BhcnNlXG57XG5cdGNybGY/OiBzdHJpbmcsXG5cdG9sZFBhcnNlQXBpPzogYm9vbGVhbixcblxuXHRhbGxvd0Jsb2NrcXVvdGU/OiBib29sZWFuLFxuXG5cdGRpc2FibGVLZXlUb0xvd2VyQ2FzZT86IGJvb2xlYW4sXG5cblx0bWFya2VkT3B0aW9ucz86IG1kLk1hcmtlZE9wdGlvbnMsXG5cblx0ZmlsdGVyT2JqZWN0S2V5Pyxcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRPcHRpb25zUGFyc2U6IElPcHRpb25zUGFyc2UgPSB7XG5cdGNybGY6IExGLFxuXHRhbGxvd0Jsb2NrcXVvdGU6IHRydWUsXG5cblx0bWFya2VkT3B0aW9uczogT2JqZWN0LmFzc2lnbih7fSxcblx0XHRtZC5kZWZhdWx0cyxcblx0XHR7XG5cdFx0XHRicmVha3M6IHRydWUsXG5cdFx0fSxcblx0KSxcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9iamVjdFBhcnNlXG57XG5cdFtrZXk6IHN0cmluZ106IGFueVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBvZiBtYXJrZG93bi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZyB8IEJ1ZmZlcn0gc3RyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHN0cjogc3RyaW5nLCBvcHRpb25zPzogSU9wdGlvbnNQYXJzZSk6IElPYmplY3RQYXJzZVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHN0cjogQnVmZmVyLCBvcHRpb25zPzogSU9wdGlvbnNQYXJzZSk6IElPYmplY3RQYXJzZVxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHN0cjogc3RyaW5nIHwgQnVmZmVyLCBvcHRpb25zOiBJT3B0aW9uc1BhcnNlID0ge30pOiBJT2JqZWN0UGFyc2Vcbntcblx0e1xuXHRcdGxldCBtYXJrZWRPcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnNQYXJzZS5tYXJrZWRPcHRpb25zLCBvcHRpb25zLm1hcmtlZE9wdGlvbnMpO1xuXG5cdFx0b3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zUGFyc2UsIG9wdGlvbnMsIHtcblx0XHRcdG1hcmtlZE9wdGlvbnMsXG5cdFx0fSk7XG5cdH1cblxuXHRsZXQgc291cmNlOiBzdHJpbmcgPSBzdHIudG9TdHJpbmcoKTtcblx0bGV0IGVvbDogc3RyaW5nO1xuXG5cdGlmICgxKVxuXHR7XG5cdFx0Ly8gZGlzYWJsZSBjcmxmIG9wdGlvbnNcblx0XHRlb2wgPSBMRjtcblx0XHRzb3VyY2UgPSBjcmxmKHNvdXJjZSwgZW9sKTtcblx0fVxuXHRlbHNlIGlmIChvcHRpb25zLmNybGYpXG5cdHtcblx0XHRlb2wgPSBvcHRpb25zLmNybGY7XG5cdFx0c291cmNlID0gY3JsZihzb3VyY2UsIGVvbCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0bGV0IGNrID0gY2hrY3JsZihzb3VyY2UpO1xuXHRcdGVvbCA9IGNrLmxmID8gTEYgOiAoY2suY3JsZiA/IENSTEYgOiBDUik7XG5cdH1cblxuXHRsZXQgbGV4ZXIgPSBuZXcgbWQuTGV4ZXIob3B0aW9ucy5tYXJrZWRPcHRpb25zKTtcblxuXHRsZXQgdG9rcyA9IGxleGVyLmxleChzb3VyY2UpO1xuXHRsZXQgY29uZiA9IHt9O1xuXHRsZXQga2V5czogc3RyaW5nW10gPSBbXTtcblx0bGV0IGRlcHRoID0gMDtcblx0bGV0IGlubGlzdCA9IGZhbHNlO1xuXG5cdGxldCBwYXJhZ3JhcGg6IHN0cmluZ1tdID0gW107XG5cdGxldCBwYXJhZ3JhcGgyOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgbGFzdF90b2s6IG1kLlRva2VuO1xuXHRsZXQgYmxvY2txdW90ZV9zdGFydDogYm9vbGVhbjtcblxuXHRsZXQgaW5saW5lX2xleGVyID0gY3JlYXRlSW5saW5lTGV4ZXIodG9rcywgT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xuXG5cdH0pKTtcblxuXHQvKlxuXHRsZXQgX2lubGluZV9tZCA9IG5ldyBNYXJrZG93bkl0KHtcblx0XHRsaW5raWZ5OiBmYWxzZSxcblx0fSk7XG5cdCovXG5cblx0KHRva3MgYXMgVG9rZW5bXSkuZm9yRWFjaChmdW5jdGlvbiAodG9rLCBpbmRleClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgdmFsID0gdG9rLnRleHQ7XG5cdFx0bGV0IF9za2lwOiBib29sZWFuO1xuXHRcdGxldCB0eXBlID0gdG9rLnR5cGU7XG5cblx0XHRpZiAodHlwZSA9PSAndGV4dCcgJiYgdmFsLm1hdGNoKC9bYS16XStcXDpcXC9cXC8vaSkpXG5cdFx0e1xuXHRcdFx0bGV0IHIgPSBpbmxpbmVfbGV4ZXIub3V0cHV0KHZhbCk7XG5cdFx0XHQvL2xldCByID0gX2lubGluZV9tZC5yZW5kZXJJbmxpbmUodmFsKTtcblxuXHRcdFx0aWYgKHZhbCAhPT0gciAmJiAvXlxccyo8YSBocmVmPS8udGVzdChyKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHR0eXBlID0gJ3RleHQyJztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRzd2l0Y2ggKHRvay50eXBlKVxuXHRcdHtcblx0XHRcdGNhc2UgJ2hlYWRpbmcnOlxuXHRcdFx0XHR3aGlsZSAoZGVwdGgtLSA+PSB0b2suZGVwdGgpIGtleXMucG9wKCk7XG5cdFx0XHRcdGtleXMucHVzaChub3JtYWxpemUodG9rLnRleHQsIG9wdGlvbnMpKTtcblx0XHRcdFx0ZGVwdGggPSB0b2suZGVwdGg7XG5cblx0XHRcdFx0cGFyYWdyYXBoID0gW107XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOlxuXHRcdFx0XHRpbmxpc3QgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2xpc3RfaXRlbV9lbmQnOlxuXHRcdFx0XHRpbmxpc3QgPSBmYWxzZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGNhc2UgJ3RleHQyJzpcblx0XHRcdGNhc2UgJ3RleHQnOlxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdG9rLnRleHQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvcHRpb25zLCB7XG5cdFx0XHRcdFx0dHlwZSxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnYmxvY2txdW90ZV9zdGFydCc6XG5cdFx0XHRcdGJsb2NrcXVvdGVfc3RhcnQgPSB0cnVlO1xuXG5cdFx0XHRcdGlmIChvcHRpb25zLmFsbG93QmxvY2txdW90ZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBhcmFncmFwaDIgPSBwYXJhZ3JhcGg7XG5cdFx0XHRcdFx0cGFyYWdyYXBoID0gW107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X3NraXAgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0b2spO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2Jsb2NrcXVvdGVfZW5kJzpcblxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGxvd0Jsb2NrcXVvdGUgJiYgYmxvY2txdW90ZV9zdGFydCAmJiBwYXJhZ3JhcGgubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFsID0gcGFyYWdyYXBoLmpvaW4oZW9sKTtcblx0XHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zLm9sZFBhcnNlQXBpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHZhbCA9IG5ldyBSYXdPYmplY3QodmFsLCB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdibG9ja3F1b3RlJyxcblx0XHRcdFx0XHRcdFx0dGV4dDogcGFyYWdyYXBoLFxuXG5cdFx0XHRcdFx0XHRcdHBhcmFncmFwaDogcGFyYWdyYXBoMixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cblx0XHRcdFx0XHRwYXJhZ3JhcGggPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfc2tpcCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRibG9ja3F1b3RlX3N0YXJ0ID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAncGFyYWdyYXBoJzpcblx0XHRcdFx0cGFyYWdyYXBoLnB1c2godG9rLnRleHQpO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHRvayk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnY29kZSc6XG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zLm9sZFBhcnNlQXBpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHZhbCA9IG5ldyBSYXdPYmplY3QodmFsLCB0b2spO1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwuZ2V0UmF3RGF0YSgpWydwYXJhZ3JhcGgnXSA9IHBhcmFncmFwaDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAndGFibGUnOlxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgbnVsbCwgbnVsbCwgeyBoZWFkZXJzOiB0b2suaGVhZGVyLCByb3dzOiB0b2suY2VsbHMgfSwgb3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnaHRtbCc6XG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zLm9sZFBhcnNlQXBpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHZhbCA9IG5ldyBSYXdPYmplY3QodmFsLCB0b2spO1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwuZ2V0UmF3RGF0YSgpWydwYXJhZ3JhcGgnXSA9IHBhcmFncmFwaDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0b2spO1xuXG5cdFx0XHRcdF9za2lwID0gdHJ1ZTtcblxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRpZiAoIV9za2lwICYmICFbJ3BhcmFncmFwaCddLmluY2x1ZGVzKHRvay50eXBlKSlcblx0XHR7XG5cdFx0XHRwYXJhZ3JhcGggPSBbXTtcblx0XHR9XG5cblx0XHRsYXN0X3RvayA9IHRvaztcblx0fSk7XG5cblx0e1xuXHRcdGxldCBwYXJlbnQ7XG5cdFx0bGV0IHBhcmVudDIgPSBjb25mO1xuXHRcdGxldCBwYXJlbnQzO1xuXG5cdFx0Zm9yIChsZXQgaSBpbiBrZXlzKVxuXHRcdHtcblx0XHRcdGxldCBrID0ga2V5c1tpXTtcblxuXHRcdFx0aWYgKC9eXFxkKyQvLnRlc3QoaykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IGtrID0ga2V5c1tpLTFdO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IHBhcmVudCA9IGdldG9iamVjdGJ5aWQoa2V5cy5zbGljZSgwLCBpLTEpLCBjb25mKTtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRsZXQgb2JqID0gZ2V0b2JqZWN0YnlpZChrZXlzLnNsaWNlKDAsIGkpLCBjb25mKTtcblxuXHRcdFx0XHRsZXQgb2sgPSB0cnVlO1xuXG5cdFx0XHRcdGZvciAobGV0IGogaW4gb2JqKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCEvXlxcZCskLy50ZXN0KGopKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG9rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob2spXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwYXJlbnRba2tdID0gT2JqZWN0LnZhbHVlcyhvYmopO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY29uZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldG9iamVjdGJ5aWQoYSwgY29uZilcbntcblx0bGV0IHJldCA9IGNvbmY7XG5cdGZvciAobGV0IGkgb2YgYSlcblx0e1xuXHRcdHJldCA9IHJldFtpXTtcblx0fVxuXHRyZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIEFkZCBgc3RyYCB0byBgb2JqYCB3aXRoIHRoZSBnaXZlbiBga2V5c2BcbiAqIHdoaWNoIHJlcHJlc2VudHMgdGhlIHRyYXZlcnNhbCBwYXRoLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHV0KG9iaiwga2V5czogc3RyaW5nW10sIHN0cjogc3RyaW5nLCBjb2RlPzogYm9vbGVhbiwgdGFibGU/OiBJVGFibGUsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UgPSB7fSwgb3RoZXJzOiB7XG5cdHR5cGU/OiBzdHJpbmcsXG59ID0ge30pXG57XG5cdGxldCB0YXJnZXQgPSBvYmo7XG5cdGxldCBsYXN0O1xuXHRsZXQga2V5O1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdGtleSA9IGtleXNbaV07XG5cdFx0bGFzdCA9IHRhcmdldDtcblx0XHR0YXJnZXRba2V5XSA9IHRhcmdldFtrZXldIHx8IHt9O1xuXHRcdHRhcmdldCA9IHRhcmdldFtrZXldO1xuXHR9XG5cblx0Ly8gY29kZVxuXHRpZiAoY29kZSlcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShsYXN0W2tleV0pKSBsYXN0W2tleV0gPSBbXTtcblx0XHRsYXN0W2tleV0ucHVzaChzdHIpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRhYmxlXG5cdGlmICh0YWJsZSlcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShsYXN0W2tleV0pKSBsYXN0W2tleV0gPSBbXTtcblx0XHRmb3IgKGxldCByaSA9IDA7IHJpIDwgdGFibGUucm93cy5sZW5ndGg7IHJpKyspXG5cdFx0e1xuXHRcdFx0bGV0IGFyckl0ZW0gPSB7fTtcblx0XHRcdGZvciAobGV0IGhpID0gMDsgaGkgPCB0YWJsZS5oZWFkZXJzLmxlbmd0aDsgaGkrKylcblx0XHRcdHtcblx0XHRcdFx0YXJySXRlbVtub3JtYWxpemUodGFibGUuaGVhZGVyc1toaV0sIG9wdGlvbnMpXSA9IHRhYmxlLnJvd3NbcmldW2hpXTtcblx0XHRcdH1cblx0XHRcdGxhc3Rba2V5XS5wdXNoKGFyckl0ZW0pO1xuXHRcdH1cblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgaXNLZXk6IGJvb2xlYW47XG5cdGxldCBpOiBudW1iZXIgPSBzdHIuaW5kZXhPZignOicpO1xuXG5cdGlmIChvcHRpb25zLmZpbHRlck9iamVjdEtleSlcblx0e1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5maWx0ZXJPYmplY3RLZXkgPT0gJ2Z1bmN0aW9uJylcblx0XHR7XG5cdFx0XHRpc0tleSA9IG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5KHN0ciwgb2JqLCBvdGhlcnMpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0aSA9IHN0ci5zZWFyY2gob3B0aW9ucy5maWx0ZXJPYmplY3RLZXkpO1xuXHRcdFx0aXNLZXkgPSBpICE9IC0xO1xuXHRcdH1cblx0fVxuXG5cdC8vIGxpc3Rcblx0aWYgKChpc0tleSA9PT0gZmFsc2UgfHwgLTEgPT0gaSB8fCBvdGhlcnMudHlwZSA9PSAndGV4dDInKSlcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShsYXN0W2tleV0pKSBsYXN0W2tleV0gPSBbXTtcblx0XHRsYXN0W2tleV0ucHVzaChzdHIudHJpbSgpKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBtYXBcblx0a2V5ID0gbm9ybWFsaXplKHN0ci5zbGljZSgwLCBpKSwgb3B0aW9ucyk7XG5cdGxldCB2YWwgPSBzdHIuc2xpY2UoaSArIDEpLnRyaW0oKTtcblx0dGFyZ2V0W2tleV0gPSB2YWw7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGBzdHJgLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUoc3RyOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UgPSB7fSk6IHN0cmluZ1xue1xuXHRsZXQga2V5ID0gc3RyLnJlcGxhY2UoL1xccysvZywgJyAnKTtcblxuXHRpZiAoIW9wdGlvbnMuZGlzYWJsZUtleVRvTG93ZXJDYXNlKVxuXHR7XG5cdFx0a2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG5cdH1cblxuXHRyZXR1cm4ga2V5LnRyaW0oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShkYXRhSW5wdXQsIGxldmVsOiBudW1iZXIgPSAxLCBza2lwID0gW10sIGs/KTogc3RyaW5nXG57XG5cdGxldCByczE6IHN0cmluZ1tdID0gW107XG5cdGxldCByczI6IHN0cmluZ1tdID0gW107XG5cblx0bGV0IGlzUmF3T2JqZWN0ID0gUmF3T2JqZWN0LmlzUmF3T2JqZWN0KGRhdGFJbnB1dCk7XG5cdGxldCBkYXRhID0gZGF0YUlucHV0O1xuXHRsZXQgZGVzYztcblxuXHRpZiAoaXNSYXdPYmplY3QpXG5cdHtcblx0XHRsZXQgcmF3RGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdEYXRhKCk7XG5cblx0XHRpZiAocmF3RGF0YS5wYXJhZ3JhcGgpXG5cdFx0e1xuXHRcdFx0ZGVzYyA9IHJhd0RhdGEucGFyYWdyYXBoLmpvaW4oTEYucmVwZWF0KDIpKTtcblx0XHR9XG5cblx0XHRkYXRhID0gZGF0YUlucHV0LmdldFJhd1ZhbHVlKCk7XG5cdH1cblxuXHQvL2NvbnNvbGUubG9nKGspO1xuXG5cdGlmIChBcnJheS5pc0FycmF5KGRhdGEpKVxuXHR7XG5cdFx0aWYgKGsgfHwgayA9PT0gMClcblx0XHR7XG5cdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcnICsgayArIExGKTtcblxuXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYm9vbCA9ICghUmF3T2JqZWN0LmlzUmF3T2JqZWN0KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpO1xuXG5cdFx0XHRcdHJzMi5wdXNoKHN0cmluZ2lmeSh2YWx1ZSwgbGV2ZWwsIFtdLCBib29sID8gaW5kZXggOiBudWxsKSk7XG5cdFx0XHR9KVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYm9vbCA9ICghUmF3T2JqZWN0LmlzUmF3T2JqZWN0KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpO1xuXG5cdFx0XHRcdHJzMS5wdXNoKHN0cmluZ2lmeSh2YWx1ZSwgbGV2ZWwsIFtdLCBib29sID8gaW5kZXggOiBudWxsKS5yZXBsYWNlKC9cXG4rJC9nLCAnJykpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vcnMxLnB1c2goJycpO1xuXHRcdH1cblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGF0YSA9PSAnb2JqZWN0Jylcblx0e1xuXHRcdGlmIChrIHx8IGsgPT09IDApXG5cdFx0e1xuXHRcdFx0cnMxLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdH1cblxuXHRcdGZvciAobGV0IGsgaW4gZGF0YSlcblx0XHR7XG5cdFx0XHRpZiAoc2tpcC5pbmNsdWRlcyhrKSlcblx0XHRcdHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpc1Jhd09iamVjdCA9IFJhd09iamVjdC5pc1Jhd09iamVjdChkYXRhW2tdKTtcblx0XHRcdGxldCByb3cgPSBpc1Jhd09iamVjdCA/IGRhdGFba10uZ2V0UmF3VmFsdWUoKSA6IGRhdGFba107XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHJvdykpXG5cdFx0XHR7XG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHRcdFx0cnMyLnB1c2goc3RyaW5naWZ5KHJvdywgbGV2ZWwgKyAxKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChpc1BsYWluT2JqZWN0KHJvdykpXG5cdFx0XHR7XG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHRcdFx0cnMyLnB1c2goc3RyaW5naWZ5KHJvdywgbGV2ZWwgKyAxKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChtb21lbnQuaXNNb21lbnQocm93KSlcblx0XHRcdHtcblx0XHRcdFx0cnMxLnB1c2goYC0gJHtrfTogJHtyb3cuZm9ybWF0KCl9YCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChpc1Jhd09iamVjdCB8fCB0eXBlb2Ygcm93ID09ICdzdHJpbmcnICYmIC9bXFxyXFxuXXxeXFxzL2cudGVzdChyb3cpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbGFuZzogc3RyaW5nO1xuXHRcdFx0XHRsZXQgdmFsID0gcm93O1xuXG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9eW1xcclxcbl0rfFxccyskL2csICcnKTtcblxuXHRcdFx0XHRpZiAoaXNSYXdPYmplY3QpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgcmF3RGF0YSA9IGRhdGFba10uZ2V0UmF3RGF0YSgpIHx8IHt9O1xuXG5cdFx0XHRcdFx0aWYgKHJhd0RhdGEudHlwZSAhPSAnaHRtbCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGFuZyA9IHJhd0RhdGEubGFuZztcblxuXHRcdFx0XHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFsID0gTEYgKyB2YWwgKyBMRjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdFx0XHRyczIucHVzaCh2YWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRyczEucHVzaChgLSAke2t9OiAke3Jvd31gKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSBpZiAoaXNSYXdPYmplY3QgfHwgdHlwZW9mIGRhdGEgPT0gJ3N0cmluZycgJiYgL1tcXHJcXG5dfF5cXHMvZy50ZXN0KGRhdGEpKVxuXHR7XG5cdFx0aWYgKGsgfHwgayA9PT0gMClcblx0XHR7XG5cdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XG5cdFx0fVxuXG5cdFx0aWYgKGRlc2MpXG5cdFx0e1xuXHRcdFx0cnMyLnB1c2goZGVzYyk7XG5cdFx0fVxuXG5cdFx0bGV0IGxhbmc6IHN0cmluZztcblxuXHRcdGxldCB2YWwgPSBkYXRhO1xuXG5cdFx0dmFsID0gdmFsLnJlcGxhY2UoL15bXFxyXFxuXSt8XFxzKyQvZywgJycpO1xuXG5cdFx0aWYgKGlzUmF3T2JqZWN0KVxuXHRcdHtcblx0XHRcdGxldCByYXdEYXRhID0gZGF0YUlucHV0LmdldFJhd0RhdGEoKSB8fCB7fTtcblx0XHRcdGxhbmcgPSByYXdEYXRhLmxhbmc7XG5cblx0XHRcdGlmIChyYXdEYXRhLnR5cGUgIT0gJ2h0bWwnKVxuXHRcdFx0e1xuXHRcdFx0XHR2YWwgPSBtYWtlQ29kZUJsb2NrKHZhbCwgbGFuZyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHZhbCA9IExGICsgdmFsICsgTEY7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR2YWwgPSBtYWtlQ29kZUJsb2NrKHZhbCwgbGFuZyk7XG5cdFx0fVxuXG5cdFx0cnMyLnB1c2godmFsKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRpZiAoZGVzYylcblx0XHR7XG5cdFx0XHRyczEucHVzaChkZXNjKTtcblx0XHR9XG5cblx0XHRyczEucHVzaChgLSAkeyBrIHx8IGsgPT09IDAgPyBrICsgJzogJyA6ICcnIH0ke2RhdGF9YCk7XG5cdH1cblxuXHRsZXQgb3V0ID0gKHJzMS5jb25jYXQoWycnXS5jb25jYXQocnMyKSkuam9pbihMRikpLnJlcGxhY2UoL15cXG4rL2csICcnKTtcblxuXHRpZiAobGV2ZWwgPT0gMSlcblx0e1xuXHRcdG91dCA9IG91dC5yZXBsYWNlKC9eXFxuK3xcXHMrJC9nLCAnJykgKyBMRjtcblx0fVxuXG5cdHJldHVybiBvdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ29kZUJsb2NrKHZhbHVlLCBsYW5nPzogc3RyaW5nKVxue1xuXHRyZXR1cm4gYFxcblxcYFxcYFxcYCR7bGFuZyB8fCAnJ31cXG4ke3ZhbHVlfVxcblxcYFxcYFxcYFxcbmA7XG59XG5cbmV4cG9ydCBjbGFzcyBSYXdPYmplY3Rcbntcblx0Y29uc3RydWN0b3Ioc291cmNlLCByYXc/KVxuXHR7XG5cdFx0aWYgKHJhdylcblx0XHR7XG5cdFx0XHR0aGlzW1NZTUJPTF9SQVdfREFUQV0gPSByYXc7XG5cdFx0fVxuXG5cdFx0dGhpc1tTWU1CT0xfUkFXX1ZBTFVFXSA9IHNvdXJjZTtcblx0fVxuXG5cdGluc3BlY3QoKVxuXHR7XG5cdFx0bGV0IHBhZCA9IHRoaXNbU1lNQk9MX1JBV19EQVRBXSAmJiB0aGlzW1NZTUJPTF9SQVdfREFUQV0udHlwZTtcblxuXHRcdHJldHVybiAnUmF3JyArIHRoaXMuZ2V0VHlwZW9mKCkucmVwbGFjZSgvXlthLXpdLywgZnVuY3Rpb24gKHMpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHMudG9VcHBlckNhc2UoKTtcblx0XHR9KSArIGAoJHt1dGlsLmluc3BlY3QodGhpcy5nZXRSYXdWYWx1ZSgpKX0ke3BhZCA/ICcsICcgKyBwYWQgOiAnJ30pYFxuXHR9XG5cblx0dG9KU09OKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG5cdH1cblxuXHR0b1N0cmluZygpXG5cdHtcblx0XHRyZXR1cm4gdGhpc1tTWU1CT0xfUkFXX1ZBTFVFXS50b1N0cmluZygpO1xuXHR9XG5cblx0Z2V0VHlwZW9mKClcblx0e1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KHRoaXNbU1lNQk9MX1JBV19WQUxVRV0pID8gJ2FycmF5JyA6IHR5cGVvZiB0aGlzW1NZTUJPTF9SQVdfVkFMVUVdO1xuXHR9XG5cblx0Z2V0UmF3RGF0YSgpXG5cdHtcblx0XHRyZXR1cm4gdGhpc1tTWU1CT0xfUkFXX0RBVEFdO1xuXHR9XG5cblx0Z2V0UmF3VmFsdWUoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU1lNQk9MX1JBV19WQUxVRV07XG5cdH1cblxuXHRzdGF0aWMgaXNSYXdPYmplY3Qodjogb2JqZWN0KVxuXHR7XG5cdFx0cmV0dXJuICh2IGluc3RhbmNlb2YgUmF3T2JqZWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiB3aWxsIHJlbW92ZSBoaWRkZW4gZGF0YSBhbmQgZ2V0IHNvdXJjZSBkYXRhXG5cdCAqXG5cdCAqIEBwYXJhbSB7UmF3T2JqZWN0fSBkYXRhXG5cdCAqL1xuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhOiBSYXdPYmplY3QpXG5cdHN0YXRpYyByZW1vdmVSYXdEYXRhKGRhdGEpXG5cdHN0YXRpYyByZW1vdmVSYXdEYXRhKGRhdGEpXG5cdHtcblx0XHRpZiAodGhpcy5pc1Jhd09iamVjdChkYXRhKSlcblx0XHR7XG5cdFx0XHRkYXRhID0gZGF0YS5nZXRSYXdWYWx1ZSgpO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgZGF0YSA9PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHRmb3IgKGxldCBpIGluIGRhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGFbaV0gPSB0aGlzLnJlbW92ZVJhd0RhdGEoZGF0YVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUYWJsZVxue1xuXHRoZWFkZXJzOiBzdHJpbmdbXSxcblx0cm93cyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL2NvcmUnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUlubGluZUxleGVyKHRva3M6IG1kLlRva2Vuc0xpc3QsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UpXG57XG5cdGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnNQYXJzZS5tYXJrZWRPcHRpb25zLCBvcHRpb25zLm1hcmtlZE9wdGlvbnMpO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IGlubGluZSA9IG5ldyBtZC5JbmxpbmVMZXhlcih0b2tzLmxpbmtzLCBvcHRzKTtcblxuXHRyZXR1cm4gaW5saW5lO1xufVxuIl19