"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const md = require("marked");
const util = require("util");
const crlf_normalize_1 = require("crlf-normalize");
exports.crlf = crlf_normalize_1.crlf;
exports.LF = crlf_normalize_1.LF;
exports.CRLF = crlf_normalize_1.CRLF;
exports.CR = crlf_normalize_1.CR;
const deepmerge = require("deepmerge-plus");
exports.deepmerge = deepmerge;
const moment = require("moment");
exports.moment = moment;
const isPlainObject = require("is-plain-object");
exports.isPlainObject = isPlainObject;
exports.SYMBOL_RAW_DATA = Symbol.for('raw_data');
exports.SYMBOL_RAW_VALUE = Symbol.for('raw_value');
exports.defaultOptionsParse = {
    crlf: crlf_normalize_1.LF,
    allowBlockquote: true,
    markedOptions: Object.assign({}, 
    // @ts-ignore
    md.defaults, {
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
    let lexer = new md.Lexer(options.markedOptions);
    let toks = lexer.lex(source);
    let conf = {};
    let keys = [];
    let depth = 0;
    let inlist = false;
    let paragraph = [];
    let paragraph2 = [];
    let last_tok;
    let blockquote_start;
    let inline_lexer = createInlineLexer(toks, options);
    toks.forEach(function (tok, index) {
        // @ts-ignore
        let val = tok.text;
        let _skip;
        let type = tok.type;
        if (type == 'text' && val.match(/[a-z]+\:\/\//i)) {
            let r = inline_lexer.output(val);
            if (val !== r && /<a href=/.test(r)) {
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
            else if (isPlainObject(row)) {
                rs2.push('#'.repeat(level) + ' ' + k + crlf_normalize_1.LF);
                rs2.push(stringify(row, level + 1));
            }
            else if (moment.isMoment(row)) {
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
        }) + `(${util.inspect(this.getRawValue())}${pad ? ', ' + pad : ''})`;
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
const self = require("./core");
exports.default = self;
function createInlineLexer(toks, options) {
    let opts = Object.assign({}, exports.defaultOptionsParse.markedOptions, options.markedOptions);
    // @ts-ignore
    let inline = new md.InlineLexer(toks.links, opts);
    return inline;
}
exports.createInlineLexer = createInlineLexer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSw2QkFBOEI7QUFDOUIsNkJBQTZCO0FBQzdCLG1EQUE2RDtBQU1wRCxlQU5BLHFCQUFJLENBTUE7QUFBRSxhQU5BLG1CQUFFLENBTUE7QUFBRSxlQU5BLHFCQUFJLENBTUE7QUFBRSxhQU5BLG1CQUFFLENBTUE7QUFMM0IsNENBQTZDO0FBSWIsOEJBQVM7QUFIekMsaUNBQWtDO0FBR1Ysd0JBQU07QUFGOUIsaURBQWtEO0FBRXpDLHNDQUFhO0FBR1QsUUFBQSxlQUFlLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6QyxRQUFBLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFnQjNDLFFBQUEsbUJBQW1CLEdBQWtCO0lBQ2pELElBQUksRUFBRSxtQkFBRTtJQUNSLGVBQWUsRUFBRSxJQUFJO0lBRXJCLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDOUIsYUFBYTtJQUNiLEVBQUUsQ0FBQyxRQUFRLEVBQ1g7UUFDQyxNQUFNLEVBQUUsSUFBSTtLQUNaLENBQ0Q7Q0FDRCxDQUFDO0FBaUJGLFNBQWdCLEtBQUssQ0FBQyxHQUFvQixFQUFFLFVBQXlCLEVBQUU7SUFFdEU7UUFDQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWhHLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsRUFBRSxPQUFPLEVBQUU7WUFDekQsYUFBYTtTQUNiLENBQUMsQ0FBQztLQUNIO0lBRUQsSUFBSSxNQUFNLEdBQVcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLElBQUksR0FBVyxDQUFDO0lB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QUFDLENBQUMsWUFBWSxTQUFTLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBU0QsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJO1FBRXhCLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFDMUI7WUFDQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQzFCO1FBRUQsSUFBSSxPQUFPLElBQUksSUFBSSxRQUFRLEVBQzNCO1lBQ0MsS0FBSyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQ2xCO2dCQUNDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RDO1NBQ0Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNiLENBQUM7Q0FFRDtBQTdFRCw4QkE2RUM7QUFRRCwrQkFBK0I7QUFFL0Isa0JBQWUsSUFBSSxDQUFDO0FBRXBCLFNBQWdCLGlCQUFpQixDQUFDLElBQW1CLEVBQUUsT0FBc0I7SUFFNUUsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsMkJBQW1CLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUV2RixhQUFhO0lBQ2IsSUFBSSxNQUFNLEdBQUcsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFbEQsT0FBTyxNQUFNLENBQUM7QUFDZixDQUFDO0FBUkQsOENBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi9cbmltcG9ydCB7IFRva2VuLCBUb2tlbnNMaXN0LCBUb2tlbnMgfSBmcm9tICdtYXJrZWQnO1xuaW1wb3J0IG1kID0gcmVxdWlyZSgnbWFya2VkJyk7XG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xuaW1wb3J0IHsgY3JsZiwgTEYsIENSTEYsIENSLCBjaGtjcmxmIH0gZnJvbSAnY3JsZi1ub3JtYWxpemUnO1xuaW1wb3J0IGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZS1wbHVzJyk7XG5pbXBvcnQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XG5pbXBvcnQgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2lzLXBsYWluLW9iamVjdCcpO1xuXG5leHBvcnQgeyBpc1BsYWluT2JqZWN0LCBtb21lbnQsIGRlZXBtZXJnZSB9XG5leHBvcnQgeyBjcmxmLCBMRiwgQ1JMRiwgQ1IgfVxuXG5leHBvcnQgY29uc3QgU1lNQk9MX1JBV19EQVRBID0gU3ltYm9sLmZvcigncmF3X2RhdGEnKTtcbmV4cG9ydCBjb25zdCBTWU1CT0xfUkFXX1ZBTFVFID0gU3ltYm9sLmZvcigncmF3X3ZhbHVlJyk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNQYXJzZVxue1xuXHRjcmxmPzogc3RyaW5nLFxuXHRvbGRQYXJzZUFwaT86IGJvb2xlYW4sXG5cblx0YWxsb3dCbG9ja3F1b3RlPzogYm9vbGVhbixcblxuXHRkaXNhYmxlS2V5VG9Mb3dlckNhc2U/OiBib29sZWFuLFxuXG5cdG1hcmtlZE9wdGlvbnM/OiBtZC5NYXJrZWRPcHRpb25zLFxuXG5cdGZpbHRlck9iamVjdEtleT8sXG59XG5cbmV4cG9ydCBjb25zdCBkZWZhdWx0T3B0aW9uc1BhcnNlOiBJT3B0aW9uc1BhcnNlID0ge1xuXHRjcmxmOiBMRixcblx0YWxsb3dCbG9ja3F1b3RlOiB0cnVlLFxuXG5cdG1hcmtlZE9wdGlvbnM6IE9iamVjdC5hc3NpZ24oe30sXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdG1kLmRlZmF1bHRzLFxuXHRcdHtcblx0XHRcdGJyZWFrczogdHJ1ZSxcblx0XHR9LFxuXHQpLFxufTtcblxuZXhwb3J0IGludGVyZmFjZSBJT2JqZWN0UGFyc2Vcbntcblx0W2tleTogc3RyaW5nXTogYW55XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIG9mIG1hcmtkb3duLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQnVmZmVyfSBzdHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc3RyOiBzdHJpbmcsIG9wdGlvbnM/OiBJT3B0aW9uc1BhcnNlKTogSU9iamVjdFBhcnNlXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc3RyOiBCdWZmZXIsIG9wdGlvbnM/OiBJT3B0aW9uc1BhcnNlKTogSU9iamVjdFBhcnNlXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc3RyOiBzdHJpbmcgfCBCdWZmZXIsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UgPSB7fSk6IElPYmplY3RQYXJzZVxue1xuXHR7XG5cdFx0bGV0IG1hcmtlZE9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9uc1BhcnNlLm1hcmtlZE9wdGlvbnMsIG9wdGlvbnMubWFya2VkT3B0aW9ucyk7XG5cblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnNQYXJzZSwgb3B0aW9ucywge1xuXHRcdFx0bWFya2VkT3B0aW9ucyxcblx0XHR9KTtcblx0fVxuXG5cdGxldCBzb3VyY2U6IHN0cmluZyA9IHN0ci50b1N0cmluZygpO1xuXHRsZXQgZW9sOiBzdHJpbmc7XG5cblx0aWYgKDEpXG5cdHtcblx0XHQvLyBkaXNhYmxlIGNybGYgb3B0aW9uc1xuXHRcdGVvbCA9IExGO1xuXHRcdHNvdXJjZSA9IGNybGYoc291cmNlLCBlb2wpO1xuXHR9XG5cdGVsc2UgaWYgKG9wdGlvbnMuY3JsZilcblx0e1xuXHRcdGVvbCA9IG9wdGlvbnMuY3JsZjtcblx0XHRzb3VyY2UgPSBjcmxmKHNvdXJjZSwgZW9sKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRsZXQgY2sgPSBjaGtjcmxmKHNvdXJjZSk7XG5cdFx0ZW9sID0gY2subGYgPyBMRiA6IChjay5jcmxmID8gQ1JMRiA6IENSKTtcblx0fVxuXG5cdGxldCBsZXhlciA9IG5ldyBtZC5MZXhlcihvcHRpb25zLm1hcmtlZE9wdGlvbnMpO1xuXG5cdGxldCB0b2tzID0gbGV4ZXIubGV4KHNvdXJjZSk7XG5cdGxldCBjb25mID0ge307XG5cdGxldCBrZXlzOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgZGVwdGggPSAwO1xuXHRsZXQgaW5saXN0ID0gZmFsc2U7XG5cblx0bGV0IHBhcmFncmFwaDogc3RyaW5nW10gPSBbXTtcblx0bGV0IHBhcmFncmFwaDI6IHN0cmluZ1tdID0gW107XG5cdGxldCBsYXN0X3RvazogbWQuVG9rZW47XG5cdGxldCBibG9ja3F1b3RlX3N0YXJ0OiBib29sZWFuO1xuXG5cdGxldCBpbmxpbmVfbGV4ZXIgPSBjcmVhdGVJbmxpbmVMZXhlcih0b2tzLCBvcHRpb25zKTtcblxuXHQodG9rcyBhcyBUb2tlbltdKS5mb3JFYWNoKGZ1bmN0aW9uICh0b2ssIGluZGV4KVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCB2YWwgPSB0b2sudGV4dDtcblx0XHRsZXQgX3NraXA6IGJvb2xlYW47XG5cdFx0bGV0IHR5cGUgPSB0b2sudHlwZTtcblxuXHRcdGlmICh0eXBlID09ICd0ZXh0JyAmJiB2YWwubWF0Y2goL1thLXpdK1xcOlxcL1xcLy9pKSlcblx0XHR7XG5cdFx0XHRsZXQgciA9IGlubGluZV9sZXhlci5vdXRwdXQodmFsKTtcblxuXHRcdFx0aWYgKHZhbCAhPT0gciAmJiAvPGEgaHJlZj0vLnRlc3QocikpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Mic7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c3dpdGNoICh0b2sudHlwZSlcblx0XHR7XG5cdFx0XHRjYXNlICdoZWFkaW5nJzpcblx0XHRcdFx0d2hpbGUgKGRlcHRoLS0gPj0gdG9rLmRlcHRoKSBrZXlzLnBvcCgpO1xuXHRcdFx0XHRrZXlzLnB1c2gobm9ybWFsaXplKHRvay50ZXh0LCBvcHRpb25zKSk7XG5cdFx0XHRcdGRlcHRoID0gdG9rLmRlcHRoO1xuXG5cdFx0XHRcdHBhcmFncmFwaCA9IFtdO1xuXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbGlzdF9pdGVtX3N0YXJ0Jzpcblx0XHRcdFx0aW5saXN0ID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsaXN0X2l0ZW1fZW5kJzpcblx0XHRcdFx0aW5saXN0ID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRjYXNlICd0ZXh0Mic6XG5cdFx0XHRjYXNlICd0ZXh0Jzpcblx0XHRcdFx0cHV0KGNvbmYsIGtleXMsIHRvay50ZXh0LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgb3B0aW9ucywge1xuXHRcdFx0XHRcdHR5cGUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOlxuXHRcdFx0XHRibG9ja3F1b3RlX3N0YXJ0ID0gdHJ1ZTtcblxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGxvd0Jsb2NrcXVvdGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwYXJhZ3JhcGgyID0gcGFyYWdyYXBoO1xuXHRcdFx0XHRcdHBhcmFncmFwaCA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9za2lwID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vY29uc29sZS5sb2codG9rKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdibG9ja3F1b3RlX2VuZCc6XG5cblx0XHRcdFx0aWYgKG9wdGlvbnMuYWxsb3dCbG9ja3F1b3RlICYmIGJsb2NrcXVvdGVfc3RhcnQgJiYgcGFyYWdyYXBoLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhbCA9IHBhcmFncmFwaC5qb2luKGVvbCk7XG5cdFx0XHRcdFx0dmFsID0gdmFsLnJlcGxhY2UoL1xccyskL2csICcnKTtcblxuXHRcdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnYmxvY2txdW90ZScsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IHBhcmFncmFwaCxcblxuXHRcdFx0XHRcdFx0XHRwYXJhZ3JhcGg6IHBhcmFncmFwaDIsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRwdXQoY29uZiwga2V5cywgdmFsLCB0cnVlLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xuXG5cdFx0XHRcdFx0cGFyYWdyYXBoID0gW107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X3NraXAgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmxvY2txdW90ZV9zdGFydCA9IGZhbHNlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3BhcmFncmFwaCc6XG5cdFx0XHRcdHBhcmFncmFwaC5wdXNoKHRvay50ZXh0KTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0b2spO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2NvZGUnOlxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xuXG5cdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwgdG9rKTtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0dmFsLmdldFJhd0RhdGEoKVsncGFyYWdyYXBoJ10gPSBwYXJhZ3JhcGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdmFsLCB0cnVlLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3RhYmxlJzpcblx0XHRcdFx0cHV0KGNvbmYsIGtleXMsIG51bGwsIG51bGwsIHsgaGVhZGVyczogdG9rLmhlYWRlciwgcm93czogdG9rLmNlbGxzIH0sIG9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2h0bWwnOlxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xuXG5cdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwgdG9rKTtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0dmFsLmdldFJhd0RhdGEoKVsncGFyYWdyYXBoJ10gPSBwYXJhZ3JhcGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdmFsLCB0cnVlLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vY29uc29sZS5sb2codG9rKTtcblxuXHRcdFx0XHRfc2tpcCA9IHRydWU7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0aWYgKCFfc2tpcCAmJiAhWydwYXJhZ3JhcGgnXS5pbmNsdWRlcyh0b2sudHlwZSkpXG5cdFx0e1xuXHRcdFx0cGFyYWdyYXBoID0gW107XG5cdFx0fVxuXG5cdFx0bGFzdF90b2sgPSB0b2s7XG5cdH0pO1xuXG5cdHtcblx0XHRsZXQgcGFyZW50O1xuXHRcdGxldCBwYXJlbnQyID0gY29uZjtcblx0XHRsZXQgcGFyZW50MztcblxuXHRcdGZvciAobGV0IGkgaW4ga2V5cylcblx0XHR7XG5cdFx0XHRsZXQgayA9IGtleXNbaV07XG5cblx0XHRcdGlmICgvXlxcZCskLy50ZXN0KGspKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBrayA9IGtleXNbaS0xXTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBwYXJlbnQgPSBnZXRvYmplY3RieWlkKGtleXMuc2xpY2UoMCwgaS0xKSwgY29uZik7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IG9iaiA9IGdldG9iamVjdGJ5aWQoa2V5cy5zbGljZSgwLCBpKSwgY29uZik7XG5cblx0XHRcdFx0bGV0IG9rID0gdHJ1ZTtcblxuXHRcdFx0XHRmb3IgKGxldCBqIGluIG9iailcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghL15cXGQrJC8udGVzdChqKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRvayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9rKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGFyZW50W2trXSA9IE9iamVjdC52YWx1ZXMob2JqKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGNvbmY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRvYmplY3RieWlkKGEsIGNvbmYpXG57XG5cdGxldCByZXQgPSBjb25mO1xuXHRmb3IgKGxldCBpIG9mIGEpXG5cdHtcblx0XHRyZXQgPSByZXRbaV07XG5cdH1cblx0cmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBBZGQgYHN0cmAgdG8gYG9iamAgd2l0aCB0aGUgZ2l2ZW4gYGtleXNgXG4gKiB3aGljaCByZXByZXNlbnRzIHRoZSB0cmF2ZXJzYWwgcGF0aC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1dChvYmosIGtleXM6IHN0cmluZ1tdLCBzdHI6IHN0cmluZywgY29kZT86IGJvb2xlYW4sIHRhYmxlPzogSVRhYmxlLCBvcHRpb25zOiBJT3B0aW9uc1BhcnNlID0ge30sIG90aGVyczoge1xuXHR0eXBlPzogc3RyaW5nLFxufSA9IHt9KVxue1xuXHRsZXQgdGFyZ2V0ID0gb2JqO1xuXHRsZXQgbGFzdDtcblx0bGV0IGtleTtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRrZXkgPSBrZXlzW2ldO1xuXHRcdGxhc3QgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0W2tleV0gPSB0YXJnZXRba2V5XSB8fCB7fTtcblx0XHR0YXJnZXQgPSB0YXJnZXRba2V5XTtcblx0fVxuXG5cdC8vIGNvZGVcblx0aWYgKGNvZGUpXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobGFzdFtrZXldKSkgbGFzdFtrZXldID0gW107XG5cdFx0bGFzdFtrZXldLnB1c2goc3RyKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyB0YWJsZVxuXHRpZiAodGFibGUpXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobGFzdFtrZXldKSkgbGFzdFtrZXldID0gW107XG5cdFx0Zm9yIChsZXQgcmkgPSAwOyByaSA8IHRhYmxlLnJvd3MubGVuZ3RoOyByaSsrKVxuXHRcdHtcblx0XHRcdGxldCBhcnJJdGVtID0ge307XG5cdFx0XHRmb3IgKGxldCBoaSA9IDA7IGhpIDwgdGFibGUuaGVhZGVycy5sZW5ndGg7IGhpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGFyckl0ZW1bbm9ybWFsaXplKHRhYmxlLmhlYWRlcnNbaGldLCBvcHRpb25zKV0gPSB0YWJsZS5yb3dzW3JpXVtoaV07XG5cdFx0XHR9XG5cdFx0XHRsYXN0W2tleV0ucHVzaChhcnJJdGVtKTtcblx0XHR9XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IGlzS2V5OiBib29sZWFuO1xuXHRsZXQgaTogbnVtYmVyID0gc3RyLmluZGV4T2YoJzonKTtcblxuXHRpZiAob3B0aW9ucy5maWx0ZXJPYmplY3RLZXkpXG5cdHtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5ID09ICdmdW5jdGlvbicpXG5cdFx0e1xuXHRcdFx0aXNLZXkgPSBvcHRpb25zLmZpbHRlck9iamVjdEtleShzdHIsIG9iaiwgb3RoZXJzKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGkgPSBzdHIuc2VhcmNoKG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5KTtcblx0XHRcdGlzS2V5ID0gaSAhPSAtMTtcblx0XHR9XG5cdH1cblxuXHQvLyBsaXN0XG5cdGlmICgoaXNLZXkgPT09IGZhbHNlIHx8IC0xID09IGkgfHwgb3RoZXJzLnR5cGUgPT0gJ3RleHQyJykpXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobGFzdFtrZXldKSkgbGFzdFtrZXldID0gW107XG5cdFx0bGFzdFtrZXldLnB1c2goc3RyLnRyaW0oKSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gbWFwXG5cdGtleSA9IG5vcm1hbGl6ZShzdHIuc2xpY2UoMCwgaSksIG9wdGlvbnMpO1xuXHRsZXQgdmFsID0gc3RyLnNsaWNlKGkgKyAxKS50cmltKCk7XG5cdHRhcmdldFtrZXldID0gdmFsO1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBgc3RyYC5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHN0cjogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9uc1BhcnNlID0ge30pOiBzdHJpbmdcbntcblx0bGV0IGtleSA9IHN0ci5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG5cblx0aWYgKCFvcHRpb25zLmRpc2FibGVLZXlUb0xvd2VyQ2FzZSlcblx0e1xuXHRcdGtleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuXHR9XG5cblx0cmV0dXJuIGtleS50cmltKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkoZGF0YUlucHV0LCBsZXZlbDogbnVtYmVyID0gMSwgc2tpcCA9IFtdLCBrPyk6IHN0cmluZ1xue1xuXHRsZXQgcnMxOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgcnMyOiBzdHJpbmdbXSA9IFtdO1xuXG5cdGxldCBpc1Jhd09iamVjdCA9IFJhd09iamVjdC5pc1Jhd09iamVjdChkYXRhSW5wdXQpO1xuXHRsZXQgZGF0YSA9IGRhdGFJbnB1dDtcblx0bGV0IGRlc2M7XG5cblx0aWYgKGlzUmF3T2JqZWN0KVxuXHR7XG5cdFx0bGV0IHJhd0RhdGEgPSBkYXRhSW5wdXQuZ2V0UmF3RGF0YSgpO1xuXG5cdFx0aWYgKHJhd0RhdGEucGFyYWdyYXBoKVxuXHRcdHtcblx0XHRcdGRlc2MgPSByYXdEYXRhLnBhcmFncmFwaC5qb2luKExGLnJlcGVhdCgyKSk7XG5cdFx0fVxuXG5cdFx0ZGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdWYWx1ZSgpO1xuXHR9XG5cblx0Ly9jb25zb2xlLmxvZyhrKTtcblxuXHRpZiAoQXJyYXkuaXNBcnJheShkYXRhKSlcblx0e1xuXHRcdGlmIChrIHx8IGsgPT09IDApXG5cdFx0e1xuXHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnJyArIGsgKyBMRik7XG5cblx0XHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2wgPSAoIVJhd09iamVjdC5pc1Jhd09iamVjdCh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKTtcblxuXHRcdFx0XHRyczIucHVzaChzdHJpbmdpZnkodmFsdWUsIGxldmVsLCBbXSwgYm9vbCA/IGluZGV4IDogbnVsbCkpO1xuXHRcdFx0fSlcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2wgPSAoIVJhd09iamVjdC5pc1Jhd09iamVjdCh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKTtcblxuXHRcdFx0XHRyczEucHVzaChzdHJpbmdpZnkodmFsdWUsIGxldmVsLCBbXSwgYm9vbCA/IGluZGV4IDogbnVsbCkucmVwbGFjZSgvXFxuKyQvZywgJycpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL3JzMS5wdXNoKCcnKTtcblx0XHR9XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRhdGEgPT0gJ29iamVjdCcpXG5cdHtcblx0XHRpZiAoayB8fCBrID09PSAwKVxuXHRcdHtcblx0XHRcdHJzMS5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHR9XG5cblx0XHRmb3IgKGxldCBrIGluIGRhdGEpXG5cdFx0e1xuXHRcdFx0aWYgKHNraXAuaW5jbHVkZXMoaykpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaXNSYXdPYmplY3QgPSBSYXdPYmplY3QuaXNSYXdPYmplY3QoZGF0YVtrXSk7XG5cdFx0XHRsZXQgcm93ID0gaXNSYXdPYmplY3QgPyBkYXRhW2tdLmdldFJhd1ZhbHVlKCkgOiBkYXRhW2tdO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShyb3cpKVxuXHRcdFx0e1xuXHRcdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XG5cdFx0XHRcdHJzMi5wdXNoKHN0cmluZ2lmeShyb3csIGxldmVsICsgMSkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXNQbGFpbk9iamVjdChyb3cpKVxuXHRcdFx0e1xuXHRcdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XG5cdFx0XHRcdHJzMi5wdXNoKHN0cmluZ2lmeShyb3csIGxldmVsICsgMSkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAobW9tZW50LmlzTW9tZW50KHJvdykpXG5cdFx0XHR7XG5cdFx0XHRcdHJzMS5wdXNoKGAtICR7a306ICR7cm93LmZvcm1hdCgpfWApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXNSYXdPYmplY3QgfHwgdHlwZW9mIHJvdyA9PSAnc3RyaW5nJyAmJiAvW1xcclxcbl18Xlxccy9nLnRlc3Qocm93KSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGxhbmc6IHN0cmluZztcblx0XHRcdFx0bGV0IHZhbCA9IHJvdztcblxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXltcXHJcXG5dK3xcXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKGlzUmF3T2JqZWN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHJhd0RhdGEgPSBkYXRhW2tdLmdldFJhd0RhdGEoKSB8fCB7fTtcblxuXHRcdFx0XHRcdGlmIChyYXdEYXRhLnR5cGUgIT0gJ2h0bWwnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxhbmcgPSByYXdEYXRhLmxhbmc7XG5cblx0XHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhbCA9IExGICsgdmFsICsgTEY7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHRcdFx0cnMyLnB1c2godmFsKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cnMxLnB1c2goYC0gJHtrfTogJHtyb3d9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGVsc2UgaWYgKGlzUmF3T2JqZWN0IHx8IHR5cGVvZiBkYXRhID09ICdzdHJpbmcnICYmIC9bXFxyXFxuXXxeXFxzL2cudGVzdChkYXRhKSlcblx0e1xuXHRcdGlmIChrIHx8IGsgPT09IDApXG5cdFx0e1xuXHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdH1cblxuXHRcdGlmIChkZXNjKVxuXHRcdHtcblx0XHRcdHJzMi5wdXNoKGRlc2MpO1xuXHRcdH1cblxuXHRcdGxldCBsYW5nOiBzdHJpbmc7XG5cblx0XHRsZXQgdmFsID0gZGF0YTtcblxuXHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9eW1xcclxcbl0rfFxccyskL2csICcnKTtcblxuXHRcdGlmIChpc1Jhd09iamVjdClcblx0XHR7XG5cdFx0XHRsZXQgcmF3RGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdEYXRhKCkgfHwge307XG5cdFx0XHRsYW5nID0gcmF3RGF0YS5sYW5nO1xuXG5cdFx0XHRpZiAocmF3RGF0YS50eXBlICE9ICdodG1sJylcblx0XHRcdHtcblx0XHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR2YWwgPSBMRiArIHZhbCArIExGO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdH1cblxuXHRcdHJzMi5wdXNoKHZhbCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0aWYgKGRlc2MpXG5cdFx0e1xuXHRcdFx0cnMxLnB1c2goZGVzYyk7XG5cdFx0fVxuXG5cdFx0cnMxLnB1c2goYC0gJHsgayB8fCBrID09PSAwID8gayArICc6ICcgOiAnJyB9JHtkYXRhfWApO1xuXHR9XG5cblx0bGV0IG91dCA9IChyczEuY29uY2F0KFsnJ10uY29uY2F0KHJzMikpLmpvaW4oTEYpKS5yZXBsYWNlKC9eXFxuKy9nLCAnJyk7XG5cblx0aWYgKGxldmVsID09IDEpXG5cdHtcblx0XHRvdXQgPSBvdXQucmVwbGFjZSgvXlxcbit8XFxzKyQvZywgJycpICsgTEY7XG5cdH1cblxuXHRyZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNvZGVCbG9jayh2YWx1ZSwgbGFuZz86IHN0cmluZylcbntcblx0cmV0dXJuIGBcXG5cXGBcXGBcXGAke2xhbmcgfHwgJyd9XFxuJHt2YWx1ZX1cXG5cXGBcXGBcXGBcXG5gO1xufVxuXG5leHBvcnQgY2xhc3MgUmF3T2JqZWN0XG57XG5cdGNvbnN0cnVjdG9yKHNvdXJjZSwgcmF3Pylcblx0e1xuXHRcdGlmIChyYXcpXG5cdFx0e1xuXHRcdFx0dGhpc1tTWU1CT0xfUkFXX0RBVEFdID0gcmF3O1xuXHRcdH1cblxuXHRcdHRoaXNbU1lNQk9MX1JBV19WQUxVRV0gPSBzb3VyY2U7XG5cdH1cblxuXHRpbnNwZWN0KClcblx0e1xuXHRcdGxldCBwYWQgPSB0aGlzW1NZTUJPTF9SQVdfREFUQV0gJiYgdGhpc1tTWU1CT0xfUkFXX0RBVEFdLnR5cGU7XG5cblx0XHRyZXR1cm4gJ1JhdycgKyB0aGlzLmdldFR5cGVvZigpLnJlcGxhY2UoL15bYS16XS8sIGZ1bmN0aW9uIChzKVxuXHRcdHtcblx0XHRcdHJldHVybiBzLnRvVXBwZXJDYXNlKCk7XG5cdFx0fSkgKyBgKCR7dXRpbC5pbnNwZWN0KHRoaXMuZ2V0UmF3VmFsdWUoKSl9JHtwYWQgPyAnLCAnICsgcGFkIDogJyd9KWBcblx0fVxuXG5cdHRvSlNPTigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50b1N0cmluZygpO1xuXHR9XG5cblx0dG9TdHJpbmcoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU1lNQk9MX1JBV19WQUxVRV0udG9TdHJpbmcoKTtcblx0fVxuXG5cdGdldFR5cGVvZigpXG5cdHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzW1NZTUJPTF9SQVdfVkFMVUVdKSA/ICdhcnJheScgOiB0eXBlb2YgdGhpc1tTWU1CT0xfUkFXX1ZBTFVFXTtcblx0fVxuXG5cdGdldFJhd0RhdGEoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU1lNQk9MX1JBV19EQVRBXTtcblx0fVxuXG5cdGdldFJhd1ZhbHVlKClcblx0e1xuXHRcdHJldHVybiB0aGlzW1NZTUJPTF9SQVdfVkFMVUVdO1xuXHR9XG5cblx0c3RhdGljIGlzUmF3T2JqZWN0KHY6IG9iamVjdClcblx0e1xuXHRcdHJldHVybiAodiBpbnN0YW5jZW9mIFJhd09iamVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogd2lsbCByZW1vdmUgaGlkZGVuIGRhdGEgYW5kIGdldCBzb3VyY2UgZGF0YVxuXHQgKlxuXHQgKiBAcGFyYW0ge1Jhd09iamVjdH0gZGF0YVxuXHQgKi9cblx0c3RhdGljIHJlbW92ZVJhd0RhdGEoZGF0YTogUmF3T2JqZWN0KVxuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhKVxuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhKVxuXHR7XG5cdFx0aWYgKHRoaXMuaXNSYXdPYmplY3QoZGF0YSkpXG5cdFx0e1xuXHRcdFx0ZGF0YSA9IGRhdGEuZ2V0UmF3VmFsdWUoKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGRhdGEgPT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgaSBpbiBkYXRhKVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhW2ldID0gdGhpcy5yZW1vdmVSYXdEYXRhKGRhdGFbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVGFibGVcbntcblx0aGVhZGVyczogc3RyaW5nW10sXG5cdHJvd3MsXG59XG5cbmltcG9ydCAqIGFzIHNlbGYgZnJvbSAnLi9jb3JlJztcblxuZXhwb3J0IGRlZmF1bHQgc2VsZjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUlubGluZUxleGVyKHRva3M6IG1kLlRva2Vuc0xpc3QsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UpXG57XG5cdGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnNQYXJzZS5tYXJrZWRPcHRpb25zLCBvcHRpb25zLm1hcmtlZE9wdGlvbnMpO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IGlubGluZSA9IG5ldyBtZC5JbmxpbmVMZXhlcih0b2tzLmxpbmtzLCBvcHRzKTtcblxuXHRyZXR1cm4gaW5saW5lO1xufVxuIl19