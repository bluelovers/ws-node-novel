"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 */
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
};
function parse(str, options = {}) {
    options = deepmerge.all([{}, exports.defaultOptionsParse, options || {}]);
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
    let toks = md.lexer(source);
    let conf = {};
    let keys = [];
    let depth = 0;
    let inlist = false;
    let paragraph = [];
    let paragraph2 = [];
    let last_tok;
    let blockquote_start;
    toks.forEach(function (tok) {
        // @ts-ignore
        let val = tok.text;
        let _skip;
        switch (tok.type) {
            case 'heading':
                while (depth-- >= tok.depth)
                    keys.pop();
                keys.push(normalize(tok.text));
                depth = tok.depth;
                paragraph = [];
                break;
            case 'list_item_start':
                inlist = true;
                break;
            case 'list_item_end':
                inlist = false;
                break;
            case 'text':
                put(conf, keys, tok.text);
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
                        val = new RawObject(val, {
                            type: 'blockquote',
                            text: paragraph,
                            paragraph: paragraph2,
                        });
                    }
                    put(conf, keys, val, true);
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
                    val = new RawObject(val, tok);
                    val.getRawData()['paragraph'] = paragraph;
                }
                put(conf, keys, val, true);
                break;
            case 'table':
                put(conf, keys, null, null, { headers: tok.header, rows: tok.cells });
                break;
            case 'html':
                val = val.replace(/\s+$/g, '');
                if (!options.oldParseApi) {
                    val = new RawObject(val, tok);
                    val.getRawData()['paragraph'] = paragraph;
                }
                put(conf, keys, val, true);
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
/**
 * Add `str` to `obj` with the given `keys`
 * which represents the traversal path.
 *
 * @param {Object} obj
 * @param {Array} keys
 * @param {String} str
 * @param {Object} table
 * @api private
 */
function put(obj, keys, str, code, table) {
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
                arrItem[normalize(table.headers[hi])] = table.rows[ri][hi];
            }
            last[key].push(arrItem);
        }
        return;
    }
    let i = str.indexOf(':');
    // list
    if (-1 == i) {
        if (!Array.isArray(last[key]))
            last[key] = [];
        last[key].push(str.trim());
        return;
    }
    // map
    key = normalize(str.slice(0, i));
    let val = str.slice(i + 1).trim();
    target[key] = val;
}
/**
 * Normalize `str`.
 */
function normalize(str) {
    return str.replace(/\s+/g, ' ').toLowerCase().trim();
}
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
                rs1.push(stringify(value, level, [], bool ? index : null));
            });
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
                    let rawData = data[k].getRawData();
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
            let rawData = dataInput.getRawData();
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
const self = require("./index");
exports.default = self;
