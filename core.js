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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSw2QkFBOEI7QUFDOUIsNkJBQTZCO0FBQzdCLG1EQUE2RDtBQU9wRCxlQVBBLHFCQUFJLENBT0E7QUFBRSxhQVBBLG1CQUFFLENBT0E7QUFBRSxlQVBBLHFCQUFJLENBT0E7QUFBRSxhQVBBLG1CQUFFLENBT0E7QUFOM0IsNENBQTZDO0FBS2IsOEJBQVM7QUFKekMsaUNBQWtDO0FBSVYsd0JBQU07QUFIOUIsaURBQWtEO0FBR3pDLHNDQUFhO0FBR1QsUUFBQSxlQUFlLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6QyxRQUFBLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFnQjNDLFFBQUEsbUJBQW1CLEdBQWtCO0lBQ2pELElBQUksRUFBRSxtQkFBRTtJQUNSLGVBQWUsRUFBRSxJQUFJO0lBRXJCLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDOUIsYUFBYTtJQUNiLEVBQUUsQ0FBQyxRQUFRLEVBQ1g7UUFDQyxNQUFNLEVBQUUsSUFBSTtLQUNaLENBQ0Q7Q0FDRCxDQUFDO0FBaUJGLFNBQWdCLEtBQUssQ0FBQyxHQUFvQixFQUFFLFVBQXlCLEVBQUU7SUFFdEU7UUFDQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWhHLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsRUFBRSxPQUFPLEVBQUU7WUFDekQsYUFBYTtTQUNiLENBQUMsQ0FBQztLQUNIO0lBRUQsSUFBSSxNQUFNLEdBQVcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLElBQUksR0FBVyxDQUFDO0lB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LHdCQUFnQixDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBUztRQUUzQixPQUFPLENBQUMsQ0FBQyxZQUFZLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFTRCxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUk7UUFFeEIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUMxQjtZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDMUI7UUFFRCxJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFDM0I7WUFDQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7Z0JBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEM7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUVEO0FBN0VELDhCQTZFQztBQVFELCtCQUErQjtBQUUvQixrQkFBZSxJQUFJLENBQUM7QUFFcEIsU0FBZ0IsaUJBQWlCLENBQUMsSUFBbUIsRUFBRSxPQUFzQjtJQUU1RSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXZGLGFBQWE7SUFDYixJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVsRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFSRCw4Q0FRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxyXG4gKi9cclxuaW1wb3J0IHsgVG9rZW4sIFRva2Vuc0xpc3QsIFRva2VucyB9IGZyb20gJ21hcmtlZCc7XHJcbmltcG9ydCBtZCA9IHJlcXVpcmUoJ21hcmtlZCcpO1xyXG5pbXBvcnQgKiBhcyB1dGlsIGZyb20gJ3V0aWwnO1xyXG5pbXBvcnQgeyBjcmxmLCBMRiwgQ1JMRiwgQ1IsIGNoa2NybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XHJcbmltcG9ydCBkZWVwbWVyZ2UgPSByZXF1aXJlKCdkZWVwbWVyZ2UtcGx1cycpO1xyXG5pbXBvcnQgbW9tZW50ID0gcmVxdWlyZSgnbW9tZW50Jyk7XHJcbmltcG9ydCBpc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnaXMtcGxhaW4tb2JqZWN0Jyk7XHJcbmltcG9ydCBNYXJrZG93bkl0ID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKTtcclxuXHJcbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QsIG1vbWVudCwgZGVlcG1lcmdlIH1cclxuZXhwb3J0IHsgY3JsZiwgTEYsIENSTEYsIENSIH1cclxuXHJcbmV4cG9ydCBjb25zdCBTWU1CT0xfUkFXX0RBVEEgPSBTeW1ib2wuZm9yKCdyYXdfZGF0YScpO1xyXG5leHBvcnQgY29uc3QgU1lNQk9MX1JBV19WQUxVRSA9IFN5bWJvbC5mb3IoJ3Jhd192YWx1ZScpO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1BhcnNlXHJcbntcclxuXHRjcmxmPzogc3RyaW5nLFxyXG5cdG9sZFBhcnNlQXBpPzogYm9vbGVhbixcclxuXHJcblx0YWxsb3dCbG9ja3F1b3RlPzogYm9vbGVhbixcclxuXHJcblx0ZGlzYWJsZUtleVRvTG93ZXJDYXNlPzogYm9vbGVhbixcclxuXHJcblx0bWFya2VkT3B0aW9ucz86IG1kLk1hcmtlZE9wdGlvbnMsXHJcblxyXG5cdGZpbHRlck9iamVjdEtleT8sXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBkZWZhdWx0T3B0aW9uc1BhcnNlOiBJT3B0aW9uc1BhcnNlID0ge1xyXG5cdGNybGY6IExGLFxyXG5cdGFsbG93QmxvY2txdW90ZTogdHJ1ZSxcclxuXHJcblx0bWFya2VkT3B0aW9uczogT2JqZWN0LmFzc2lnbih7fSxcclxuXHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdG1kLmRlZmF1bHRzLFxyXG5cdFx0e1xyXG5cdFx0XHRicmVha3M6IHRydWUsXHJcblx0XHR9LFxyXG5cdCksXHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElPYmplY3RQYXJzZVxyXG57XHJcblx0W2tleTogc3RyaW5nXTogYW55XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgb2YgbWFya2Rvd24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQnVmZmVyfSBzdHJcclxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcclxuICogQHJldHVybiB7T2JqZWN0fVxyXG4gKiBAYXBpIHB1YmxpY1xyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlKHN0cjogc3RyaW5nLCBvcHRpb25zPzogSU9wdGlvbnNQYXJzZSk6IElPYmplY3RQYXJzZVxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2Uoc3RyOiBCdWZmZXIsIG9wdGlvbnM/OiBJT3B0aW9uc1BhcnNlKTogSU9iamVjdFBhcnNlXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHI6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9uczogSU9wdGlvbnNQYXJzZSA9IHt9KTogSU9iamVjdFBhcnNlXHJcbntcclxuXHR7XHJcblx0XHRsZXQgbWFya2VkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zUGFyc2UubWFya2VkT3B0aW9ucywgb3B0aW9ucy5tYXJrZWRPcHRpb25zKTtcclxuXHJcblx0XHRvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnNQYXJzZSwgb3B0aW9ucywge1xyXG5cdFx0XHRtYXJrZWRPcHRpb25zLFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRsZXQgc291cmNlOiBzdHJpbmcgPSBzdHIudG9TdHJpbmcoKTtcclxuXHRsZXQgZW9sOiBzdHJpbmc7XHJcblxyXG5cdGlmICgxKVxyXG5cdHtcclxuXHRcdC8vIGRpc2FibGUgY3JsZiBvcHRpb25zXHJcblx0XHRlb2wgPSBMRjtcclxuXHRcdHNvdXJjZSA9IGNybGYoc291cmNlLCBlb2wpO1xyXG5cdH1cclxuXHRlbHNlIGlmIChvcHRpb25zLmNybGYpXHJcblx0e1xyXG5cdFx0ZW9sID0gb3B0aW9ucy5jcmxmO1xyXG5cdFx0c291cmNlID0gY3JsZihzb3VyY2UsIGVvbCk7XHJcblx0fVxyXG5cdGVsc2VcclxuXHR7XHJcblx0XHRsZXQgY2sgPSBjaGtjcmxmKHNvdXJjZSk7XHJcblx0XHRlb2wgPSBjay5sZiA/IExGIDogKGNrLmNybGYgPyBDUkxGIDogQ1IpO1xyXG5cdH1cclxuXHJcblx0bGV0IGxleGVyID0gbmV3IG1kLkxleGVyKG9wdGlvbnMubWFya2VkT3B0aW9ucyk7XHJcblxyXG5cdGxldCB0b2tzID0gbGV4ZXIubGV4KHNvdXJjZSk7XHJcblx0bGV0IGNvbmYgPSB7fTtcclxuXHRsZXQga2V5czogc3RyaW5nW10gPSBbXTtcclxuXHRsZXQgZGVwdGggPSAwO1xyXG5cdGxldCBpbmxpc3QgPSBmYWxzZTtcclxuXHJcblx0bGV0IHBhcmFncmFwaDogc3RyaW5nW10gPSBbXTtcclxuXHRsZXQgcGFyYWdyYXBoMjogc3RyaW5nW10gPSBbXTtcclxuXHRsZXQgbGFzdF90b2s6IG1kLlRva2VuO1xyXG5cdGxldCBibG9ja3F1b3RlX3N0YXJ0OiBib29sZWFuO1xyXG5cclxuXHRsZXQgaW5saW5lX2xleGVyID0gY3JlYXRlSW5saW5lTGV4ZXIodG9rcywgT2JqZWN0LmFzc2lnbih7fSwgb3B0aW9ucywge1xyXG5cclxuXHR9KSk7XHJcblxyXG5cdC8qXHJcblx0bGV0IF9pbmxpbmVfbWQgPSBuZXcgTWFya2Rvd25JdCh7XHJcblx0XHRsaW5raWZ5OiBmYWxzZSxcclxuXHR9KTtcclxuXHQqL1xyXG5cclxuXHQodG9rcyBhcyBUb2tlbltdKS5mb3JFYWNoKGZ1bmN0aW9uICh0b2ssIGluZGV4KVxyXG5cdHtcclxuXHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdGxldCB2YWwgPSB0b2sudGV4dDtcclxuXHRcdGxldCBfc2tpcDogYm9vbGVhbjtcclxuXHRcdGxldCB0eXBlID0gdG9rLnR5cGU7XHJcblxyXG5cdFx0aWYgKHR5cGUgPT0gJ3RleHQnICYmIHZhbC5tYXRjaCgvW2Etel0rXFw6XFwvXFwvL2kpKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgciA9IGlubGluZV9sZXhlci5vdXRwdXQodmFsKTtcclxuXHRcdFx0Ly9sZXQgciA9IF9pbmxpbmVfbWQucmVuZGVySW5saW5lKHZhbCk7XHJcblxyXG5cdFx0XHRpZiAodmFsICE9PSByICYmIC9eXFxzKjxhIGhyZWY9Ly50ZXN0KHIpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHRcdHR5cGUgPSAndGV4dDInO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0c3dpdGNoICh0b2sudHlwZSlcclxuXHRcdHtcclxuXHRcdFx0Y2FzZSAnaGVhZGluZyc6XHJcblx0XHRcdFx0d2hpbGUgKGRlcHRoLS0gPj0gdG9rLmRlcHRoKSBrZXlzLnBvcCgpO1xyXG5cdFx0XHRcdGtleXMucHVzaChub3JtYWxpemUodG9rLnRleHQsIG9wdGlvbnMpKTtcclxuXHRcdFx0XHRkZXB0aCA9IHRvay5kZXB0aDtcclxuXHJcblx0XHRcdFx0cGFyYWdyYXBoID0gW107XHJcblxyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOlxyXG5cdFx0XHRcdGlubGlzdCA9IHRydWU7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgJ2xpc3RfaXRlbV9lbmQnOlxyXG5cdFx0XHRcdGlubGlzdCA9IGZhbHNlO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0Y2FzZSAndGV4dDInOlxyXG5cdFx0XHRjYXNlICd0ZXh0JzpcclxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdG9rLnRleHQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvcHRpb25zLCB7XHJcblx0XHRcdFx0XHR0eXBlLFxyXG5cdFx0XHRcdH0pO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlICdibG9ja3F1b3RlX3N0YXJ0JzpcclxuXHRcdFx0XHRibG9ja3F1b3RlX3N0YXJ0ID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0aWYgKG9wdGlvbnMuYWxsb3dCbG9ja3F1b3RlKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHBhcmFncmFwaDIgPSBwYXJhZ3JhcGg7XHJcblx0XHRcdFx0XHRwYXJhZ3JhcGggPSBbXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdF9za2lwID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdC8vY29uc29sZS5sb2codG9rKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAnYmxvY2txdW90ZV9lbmQnOlxyXG5cclxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGxvd0Jsb2NrcXVvdGUgJiYgYmxvY2txdW90ZV9zdGFydCAmJiBwYXJhZ3JhcGgubGVuZ3RoKVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZhbCA9IHBhcmFncmFwaC5qb2luKGVvbCk7XHJcblx0XHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xyXG5cclxuXHRcdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwge1xyXG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdibG9ja3F1b3RlJyxcclxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBwYXJhZ3JhcGgsXHJcblxyXG5cdFx0XHRcdFx0XHRcdHBhcmFncmFwaDogcGFyYWdyYXBoMixcclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdFx0cHV0KGNvbmYsIGtleXMsIHZhbCwgdHJ1ZSwgdW5kZWZpbmVkLCBvcHRpb25zKTtcclxuXHJcblx0XHRcdFx0XHRwYXJhZ3JhcGggPSBbXTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdF9za2lwID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGJsb2NrcXVvdGVfc3RhcnQgPSBmYWxzZTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSAncGFyYWdyYXBoJzpcclxuXHRcdFx0XHRwYXJhZ3JhcGgucHVzaCh0b2sudGV4dCk7XHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0b2spO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRjYXNlICdjb2RlJzpcclxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xyXG5cclxuXHRcdFx0XHRpZiAoIW9wdGlvbnMub2xkUGFyc2VBcGkpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxyXG5cdFx0XHRcdFx0dmFsID0gbmV3IFJhd09iamVjdCh2YWwsIHRvayk7XHJcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRcdFx0XHR2YWwuZ2V0UmF3RGF0YSgpWydwYXJhZ3JhcGgnXSA9IHBhcmFncmFwaDtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgJ3RhYmxlJzpcclxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgbnVsbCwgbnVsbCwgeyBoZWFkZXJzOiB0b2suaGVhZGVyLCByb3dzOiB0b2suY2VsbHMgfSwgb3B0aW9ucyk7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgJ2h0bWwnOlxyXG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMrJC9nLCAnJyk7XHJcblxyXG5cdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXHJcblx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwgdG9rKTtcclxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0XHRcdHZhbC5nZXRSYXdEYXRhKClbJ3BhcmFncmFwaCddID0gcGFyYWdyYXBoO1xyXG5cdFx0XHRcdH1cclxuXHJcblx0XHRcdFx0cHV0KGNvbmYsIGtleXMsIHZhbCwgdHJ1ZSwgdW5kZWZpbmVkLCBvcHRpb25zKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0ZGVmYXVsdDpcclxuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHRvayk7XHJcblxyXG5cdFx0XHRcdF9za2lwID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKCFfc2tpcCAmJiAhWydwYXJhZ3JhcGgnXS5pbmNsdWRlcyh0b2sudHlwZSkpXHJcblx0XHR7XHJcblx0XHRcdHBhcmFncmFwaCA9IFtdO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxhc3RfdG9rID0gdG9rO1xyXG5cdH0pO1xyXG5cclxuXHR7XHJcblx0XHRsZXQgcGFyZW50O1xyXG5cdFx0bGV0IHBhcmVudDIgPSBjb25mO1xyXG5cdFx0bGV0IHBhcmVudDM7XHJcblxyXG5cdFx0Zm9yIChsZXQgaSBpbiBrZXlzKVxyXG5cdFx0e1xyXG5cdFx0XHRsZXQgayA9IGtleXNbaV07XHJcblxyXG5cdFx0XHRpZiAoL15cXGQrJC8udGVzdChrKSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0XHRsZXQga2sgPSBrZXlzW2ktMV07XHJcblxyXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0XHRsZXQgcGFyZW50ID0gZ2V0b2JqZWN0YnlpZChrZXlzLnNsaWNlKDAsIGktMSksIGNvbmYpO1xyXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcclxuXHRcdFx0XHRsZXQgb2JqID0gZ2V0b2JqZWN0YnlpZChrZXlzLnNsaWNlKDAsIGkpLCBjb25mKTtcclxuXHJcblx0XHRcdFx0bGV0IG9rID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0Zm9yIChsZXQgaiBpbiBvYmopXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0aWYgKCEvXlxcZCskLy50ZXN0KGopKVxyXG5cdFx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0XHRvayA9IGZhbHNlO1xyXG5cdFx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdGlmIChvaylcclxuXHRcdFx0XHR7XHJcblx0XHRcdFx0XHRwYXJlbnRba2tdID0gT2JqZWN0LnZhbHVlcyhvYmopO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdHJldHVybiBjb25mO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0b2JqZWN0YnlpZChhLCBjb25mKVxyXG57XHJcblx0bGV0IHJldCA9IGNvbmY7XHJcblx0Zm9yIChsZXQgaSBvZiBhKVxyXG5cdHtcclxuXHRcdHJldCA9IHJldFtpXTtcclxuXHR9XHJcblx0cmV0dXJuIHJldDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEFkZCBgc3RyYCB0byBgb2JqYCB3aXRoIHRoZSBnaXZlbiBga2V5c2BcclxuICogd2hpY2ggcmVwcmVzZW50cyB0aGUgdHJhdmVyc2FsIHBhdGguXHJcbiAqXHJcbiAqIEBhcGkgcHJpdmF0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHB1dChvYmosIGtleXM6IHN0cmluZ1tdLCBzdHI6IHN0cmluZywgY29kZT86IGJvb2xlYW4sIHRhYmxlPzogSVRhYmxlLCBvcHRpb25zOiBJT3B0aW9uc1BhcnNlID0ge30sIG90aGVyczoge1xyXG5cdHR5cGU/OiBzdHJpbmcsXHJcbn0gPSB7fSlcclxue1xyXG5cdGxldCB0YXJnZXQgPSBvYmo7XHJcblx0bGV0IGxhc3Q7XHJcblx0bGV0IGtleTtcclxuXHJcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKVxyXG5cdHtcclxuXHRcdGtleSA9IGtleXNbaV07XHJcblx0XHRsYXN0ID0gdGFyZ2V0O1xyXG5cdFx0dGFyZ2V0W2tleV0gPSB0YXJnZXRba2V5XSB8fCB7fTtcclxuXHRcdHRhcmdldCA9IHRhcmdldFtrZXldO1xyXG5cdH1cclxuXHJcblx0Ly8gY29kZVxyXG5cdGlmIChjb2RlKVxyXG5cdHtcclxuXHRcdGlmICghQXJyYXkuaXNBcnJheShsYXN0W2tleV0pKSBsYXN0W2tleV0gPSBbXTtcclxuXHRcdGxhc3Rba2V5XS5wdXNoKHN0cik7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHQvLyB0YWJsZVxyXG5cdGlmICh0YWJsZSlcclxuXHR7XHJcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobGFzdFtrZXldKSkgbGFzdFtrZXldID0gW107XHJcblx0XHRmb3IgKGxldCByaSA9IDA7IHJpIDwgdGFibGUucm93cy5sZW5ndGg7IHJpKyspXHJcblx0XHR7XHJcblx0XHRcdGxldCBhcnJJdGVtID0ge307XHJcblx0XHRcdGZvciAobGV0IGhpID0gMDsgaGkgPCB0YWJsZS5oZWFkZXJzLmxlbmd0aDsgaGkrKylcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGFyckl0ZW1bbm9ybWFsaXplKHRhYmxlLmhlYWRlcnNbaGldLCBvcHRpb25zKV0gPSB0YWJsZS5yb3dzW3JpXVtoaV07XHJcblx0XHRcdH1cclxuXHRcdFx0bGFzdFtrZXldLnB1c2goYXJySXRlbSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHRsZXQgaXNLZXk6IGJvb2xlYW47XHJcblx0bGV0IGk6IG51bWJlciA9IHN0ci5pbmRleE9mKCc6Jyk7XHJcblxyXG5cdGlmIChvcHRpb25zLmZpbHRlck9iamVjdEtleSlcclxuXHR7XHJcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5ID09ICdmdW5jdGlvbicpXHJcblx0XHR7XHJcblx0XHRcdGlzS2V5ID0gb3B0aW9ucy5maWx0ZXJPYmplY3RLZXkoc3RyLCBvYmosIG90aGVycyk7XHJcblx0XHR9XHJcblx0XHRlbHNlXHJcblx0XHR7XHJcblx0XHRcdGkgPSBzdHIuc2VhcmNoKG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5KTtcclxuXHRcdFx0aXNLZXkgPSBpICE9IC0xO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0Ly8gbGlzdFxyXG5cdGlmICgoaXNLZXkgPT09IGZhbHNlIHx8IC0xID09IGkgfHwgb3RoZXJzLnR5cGUgPT0gJ3RleHQyJykpXHJcblx0e1xyXG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGxhc3Rba2V5XSkpIGxhc3Rba2V5XSA9IFtdO1xyXG5cdFx0bGFzdFtrZXldLnB1c2goc3RyLnRyaW0oKSk7XHJcblx0XHRyZXR1cm47XHJcblx0fVxyXG5cclxuXHQvLyBtYXBcclxuXHRrZXkgPSBub3JtYWxpemUoc3RyLnNsaWNlKDAsIGkpLCBvcHRpb25zKTtcclxuXHRsZXQgdmFsID0gc3RyLnNsaWNlKGkgKyAxKS50cmltKCk7XHJcblx0dGFyZ2V0W2tleV0gPSB2YWw7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBOb3JtYWxpemUgYHN0cmAuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShzdHI6IHN0cmluZywgb3B0aW9uczogSU9wdGlvbnNQYXJzZSA9IHt9KTogc3RyaW5nXHJcbntcclxuXHRsZXQga2V5ID0gc3RyLnJlcGxhY2UoL1xccysvZywgJyAnKTtcclxuXHJcblx0aWYgKCFvcHRpb25zLmRpc2FibGVLZXlUb0xvd2VyQ2FzZSlcclxuXHR7XHJcblx0XHRrZXkgPSBrZXkudG9Mb3dlckNhc2UoKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBrZXkudHJpbSgpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5KGRhdGFJbnB1dCwgbGV2ZWw6IG51bWJlciA9IDEsIHNraXAgPSBbXSwgaz8pOiBzdHJpbmdcclxue1xyXG5cdGxldCByczE6IHN0cmluZ1tdID0gW107XHJcblx0bGV0IHJzMjogc3RyaW5nW10gPSBbXTtcclxuXHJcblx0bGV0IGlzUmF3T2JqZWN0ID0gUmF3T2JqZWN0LmlzUmF3T2JqZWN0KGRhdGFJbnB1dCk7XHJcblx0bGV0IGRhdGEgPSBkYXRhSW5wdXQ7XHJcblx0bGV0IGRlc2M7XHJcblxyXG5cdGlmIChpc1Jhd09iamVjdClcclxuXHR7XHJcblx0XHRsZXQgcmF3RGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdEYXRhKCk7XHJcblxyXG5cdFx0aWYgKHJhd0RhdGEucGFyYWdyYXBoKVxyXG5cdFx0e1xyXG5cdFx0XHRkZXNjID0gcmF3RGF0YS5wYXJhZ3JhcGguam9pbihMRi5yZXBlYXQoMikpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGRhdGEgPSBkYXRhSW5wdXQuZ2V0UmF3VmFsdWUoKTtcclxuXHR9XHJcblxyXG5cdC8vY29uc29sZS5sb2coayk7XHJcblxyXG5cdGlmIChBcnJheS5pc0FycmF5KGRhdGEpKVxyXG5cdHtcclxuXHRcdGlmIChrIHx8IGsgPT09IDApXHJcblx0XHR7XHJcblx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJycgKyBrICsgTEYpO1xyXG5cclxuXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGJvb2wgPSAoIVJhd09iamVjdC5pc1Jhd09iamVjdCh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKTtcclxuXHJcblx0XHRcdFx0cnMyLnB1c2goc3RyaW5naWZ5KHZhbHVlLCBsZXZlbCwgW10sIGJvb2wgPyBpbmRleCA6IG51bGwpKTtcclxuXHRcdFx0fSlcclxuXHRcdH1cclxuXHRcdGVsc2VcclxuXHRcdHtcclxuXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bGV0IGJvb2wgPSAoIVJhd09iamVjdC5pc1Jhd09iamVjdCh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKTtcclxuXHJcblx0XHRcdFx0cnMxLnB1c2goc3RyaW5naWZ5KHZhbHVlLCBsZXZlbCwgW10sIGJvb2wgPyBpbmRleCA6IG51bGwpLnJlcGxhY2UoL1xcbiskL2csICcnKSk7XHJcblx0XHRcdH0pO1xyXG5cclxuXHRcdFx0Ly9yczEucHVzaCgnJyk7XHJcblx0XHR9XHJcblx0fVxyXG5cdGVsc2UgaWYgKHR5cGVvZiBkYXRhID09ICdvYmplY3QnKVxyXG5cdHtcclxuXHRcdGlmIChrIHx8IGsgPT09IDApXHJcblx0XHR7XHJcblx0XHRcdHJzMS5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcclxuXHRcdH1cclxuXHJcblx0XHRmb3IgKGxldCBrIGluIGRhdGEpXHJcblx0XHR7XHJcblx0XHRcdGlmIChza2lwLmluY2x1ZGVzKGspKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0Y29udGludWU7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGxldCBpc1Jhd09iamVjdCA9IFJhd09iamVjdC5pc1Jhd09iamVjdChkYXRhW2tdKTtcclxuXHRcdFx0bGV0IHJvdyA9IGlzUmF3T2JqZWN0ID8gZGF0YVtrXS5nZXRSYXdWYWx1ZSgpIDogZGF0YVtrXTtcclxuXHJcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHJvdykpXHJcblx0XHRcdHtcclxuXHRcdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XHJcblx0XHRcdFx0cnMyLnB1c2goc3RyaW5naWZ5KHJvdywgbGV2ZWwgKyAxKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoaXNQbGFpbk9iamVjdChyb3cpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xyXG5cdFx0XHRcdHJzMi5wdXNoKHN0cmluZ2lmeShyb3csIGxldmVsICsgMSkpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2UgaWYgKG1vbWVudC5pc01vbWVudChyb3cpKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0cnMxLnB1c2goYC0gJHtrfTogJHtyb3cuZm9ybWF0KCl9YCk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZSBpZiAoaXNSYXdPYmplY3QgfHwgdHlwZW9mIHJvdyA9PSAnc3RyaW5nJyAmJiAvW1xcclxcbl18Xlxccy9nLnRlc3Qocm93KSlcclxuXHRcdFx0e1xyXG5cdFx0XHRcdGxldCBsYW5nOiBzdHJpbmc7XHJcblx0XHRcdFx0bGV0IHZhbCA9IHJvdztcclxuXHJcblx0XHRcdFx0dmFsID0gdmFsLnJlcGxhY2UoL15bXFxyXFxuXSt8XFxzKyQvZywgJycpO1xyXG5cclxuXHRcdFx0XHRpZiAoaXNSYXdPYmplY3QpXHJcblx0XHRcdFx0e1xyXG5cdFx0XHRcdFx0bGV0IHJhd0RhdGEgPSBkYXRhW2tdLmdldFJhd0RhdGEoKSB8fCB7fTtcclxuXHJcblx0XHRcdFx0XHRpZiAocmF3RGF0YS50eXBlICE9ICdodG1sJylcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0bGFuZyA9IHJhd0RhdGEubGFuZztcclxuXHJcblx0XHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdGVsc2VcclxuXHRcdFx0XHRcdHtcclxuXHRcdFx0XHRcdFx0dmFsID0gTEYgKyB2YWwgKyBMRjtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0ZWxzZVxyXG5cdFx0XHRcdHtcclxuXHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcclxuXHRcdFx0XHRyczIucHVzaCh2YWwpO1xyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2VcclxuXHRcdFx0e1xyXG5cdFx0XHRcdHJzMS5wdXNoKGAtICR7a306ICR7cm93fWApO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cdGVsc2UgaWYgKGlzUmF3T2JqZWN0IHx8IHR5cGVvZiBkYXRhID09ICdzdHJpbmcnICYmIC9bXFxyXFxuXXxeXFxzL2cudGVzdChkYXRhKSlcclxuXHR7XHJcblx0XHRpZiAoayB8fCBrID09PSAwKVxyXG5cdFx0e1xyXG5cdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKGRlc2MpXHJcblx0XHR7XHJcblx0XHRcdHJzMi5wdXNoKGRlc2MpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBsYW5nOiBzdHJpbmc7XHJcblxyXG5cdFx0bGV0IHZhbCA9IGRhdGE7XHJcblxyXG5cdFx0dmFsID0gdmFsLnJlcGxhY2UoL15bXFxyXFxuXSt8XFxzKyQvZywgJycpO1xyXG5cclxuXHRcdGlmIChpc1Jhd09iamVjdClcclxuXHRcdHtcclxuXHRcdFx0bGV0IHJhd0RhdGEgPSBkYXRhSW5wdXQuZ2V0UmF3RGF0YSgpIHx8IHt9O1xyXG5cdFx0XHRsYW5nID0gcmF3RGF0YS5sYW5nO1xyXG5cclxuXHRcdFx0aWYgKHJhd0RhdGEudHlwZSAhPSAnaHRtbCcpXHJcblx0XHRcdHtcclxuXHRcdFx0XHR2YWwgPSBtYWtlQ29kZUJsb2NrKHZhbCwgbGFuZyk7XHJcblx0XHRcdH1cclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0dmFsID0gTEYgKyB2YWwgKyBMRjtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0ZWxzZVxyXG5cdFx0e1xyXG5cdFx0XHR2YWwgPSBtYWtlQ29kZUJsb2NrKHZhbCwgbGFuZyk7XHJcblx0XHR9XHJcblxyXG5cdFx0cnMyLnB1c2godmFsKTtcclxuXHR9XHJcblx0ZWxzZVxyXG5cdHtcclxuXHRcdGlmIChkZXNjKVxyXG5cdFx0e1xyXG5cdFx0XHRyczEucHVzaChkZXNjKTtcclxuXHRcdH1cclxuXHJcblx0XHRyczEucHVzaChgLSAkeyBrIHx8IGsgPT09IDAgPyBrICsgJzogJyA6ICcnIH0ke2RhdGF9YCk7XHJcblx0fVxyXG5cclxuXHRsZXQgb3V0ID0gKHJzMS5jb25jYXQoWycnXS5jb25jYXQocnMyKSkuam9pbihMRikpLnJlcGxhY2UoL15cXG4rL2csICcnKTtcclxuXHJcblx0aWYgKGxldmVsID09IDEpXHJcblx0e1xyXG5cdFx0b3V0ID0gb3V0LnJlcGxhY2UoL15cXG4rfFxccyskL2csICcnKSArIExGO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIG91dDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDb2RlQmxvY2sodmFsdWUsIGxhbmc/OiBzdHJpbmcpXHJcbntcclxuXHRyZXR1cm4gYFxcblxcYFxcYFxcYCR7bGFuZyB8fCAnJ31cXG4ke3ZhbHVlfVxcblxcYFxcYFxcYFxcbmA7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBSYXdPYmplY3Rcclxue1xyXG5cdGNvbnN0cnVjdG9yKHNvdXJjZSwgcmF3PylcclxuXHR7XHJcblx0XHRpZiAocmF3KVxyXG5cdFx0e1xyXG5cdFx0XHR0aGlzW1NZTUJPTF9SQVdfREFUQV0gPSByYXc7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpc1tTWU1CT0xfUkFXX1ZBTFVFXSA9IHNvdXJjZTtcclxuXHR9XHJcblxyXG5cdGluc3BlY3QoKVxyXG5cdHtcclxuXHRcdGxldCBwYWQgPSB0aGlzW1NZTUJPTF9SQVdfREFUQV0gJiYgdGhpc1tTWU1CT0xfUkFXX0RBVEFdLnR5cGU7XHJcblxyXG5cdFx0cmV0dXJuICdSYXcnICsgdGhpcy5nZXRUeXBlb2YoKS5yZXBsYWNlKC9eW2Etel0vLCBmdW5jdGlvbiAocylcclxuXHRcdHtcclxuXHRcdFx0cmV0dXJuIHMudG9VcHBlckNhc2UoKTtcclxuXHRcdH0pICsgYCgke3V0aWwuaW5zcGVjdCh0aGlzLmdldFJhd1ZhbHVlKCkpfSR7cGFkID8gJywgJyArIHBhZCA6ICcnfSlgXHJcblx0fVxyXG5cclxuXHR0b0pTT04oKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcblx0fVxyXG5cclxuXHR0b1N0cmluZygpXHJcblx0e1xyXG5cdFx0cmV0dXJuIHRoaXNbU1lNQk9MX1JBV19WQUxVRV0udG9TdHJpbmcoKTtcclxuXHR9XHJcblxyXG5cdGdldFR5cGVvZigpXHJcblx0e1xyXG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkodGhpc1tTWU1CT0xfUkFXX1ZBTFVFXSkgPyAnYXJyYXknIDogdHlwZW9mIHRoaXNbU1lNQk9MX1JBV19WQUxVRV07XHJcblx0fVxyXG5cclxuXHRnZXRSYXdEYXRhKClcclxuXHR7XHJcblx0XHRyZXR1cm4gdGhpc1tTWU1CT0xfUkFXX0RBVEFdO1xyXG5cdH1cclxuXHJcblx0Z2V0UmF3VmFsdWUoKVxyXG5cdHtcclxuXHRcdHJldHVybiB0aGlzW1NZTUJPTF9SQVdfVkFMVUVdO1xyXG5cdH1cclxuXHJcblx0c3RhdGljIGlzUmF3T2JqZWN0KHY6IG9iamVjdClcclxuXHR7XHJcblx0XHRyZXR1cm4gKHYgaW5zdGFuY2VvZiBSYXdPYmplY3QpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0ICogd2lsbCByZW1vdmUgaGlkZGVuIGRhdGEgYW5kIGdldCBzb3VyY2UgZGF0YVxyXG5cdCAqXHJcblx0ICogQHBhcmFtIHtSYXdPYmplY3R9IGRhdGFcclxuXHQgKi9cclxuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhOiBSYXdPYmplY3QpXHJcblx0c3RhdGljIHJlbW92ZVJhd0RhdGEoZGF0YSlcclxuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhKVxyXG5cdHtcclxuXHRcdGlmICh0aGlzLmlzUmF3T2JqZWN0KGRhdGEpKVxyXG5cdFx0e1xyXG5cdFx0XHRkYXRhID0gZGF0YS5nZXRSYXdWYWx1ZSgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmICh0eXBlb2YgZGF0YSA9PSAnb2JqZWN0JylcclxuXHRcdHtcclxuXHRcdFx0Zm9yIChsZXQgaSBpbiBkYXRhKVxyXG5cdFx0XHR7XHJcblx0XHRcdFx0ZGF0YVtpXSA9IHRoaXMucmVtb3ZlUmF3RGF0YShkYXRhW2ldKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBkYXRhO1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVRhYmxlXHJcbntcclxuXHRoZWFkZXJzOiBzdHJpbmdbXSxcclxuXHRyb3dzLFxyXG59XHJcblxyXG5pbXBvcnQgKiBhcyBzZWxmIGZyb20gJy4vY29yZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBzZWxmO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUlubGluZUxleGVyKHRva3M6IG1kLlRva2Vuc0xpc3QsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UpXHJcbntcclxuXHRsZXQgb3B0cyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zUGFyc2UubWFya2VkT3B0aW9ucywgb3B0aW9ucy5tYXJrZWRPcHRpb25zKTtcclxuXHJcblx0Ly8gQHRzLWlnbm9yZVxyXG5cdGxldCBpbmxpbmUgPSBuZXcgbWQuSW5saW5lTGV4ZXIodG9rcy5saW5rcywgb3B0cyk7XHJcblxyXG5cdHJldHVybiBpbmxpbmU7XHJcbn1cclxuIl19