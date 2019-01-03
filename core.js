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
    toks.forEach(function (tok, index) {
        // @ts-ignore
        let val = tok.text;
        let _skip;
        let type = tok.type;
        if (type == 'text' && val.match(/^[a-z]+\:\/\//i)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSw2QkFBOEI7QUFDOUIsNkJBQTZCO0FBQzdCLG1EQUE2RDtBQU1wRCxlQU5BLHFCQUFJLENBTUE7QUFBRSxhQU5BLG1CQUFFLENBTUE7QUFBRSxlQU5BLHFCQUFJLENBTUE7QUFBRSxhQU5BLG1CQUFFLENBTUE7QUFMM0IsNENBQTZDO0FBSWIsOEJBQVM7QUFIekMsaUNBQWtDO0FBR1Ysd0JBQU07QUFGOUIsaURBQWtEO0FBRXpDLHNDQUFhO0FBR1QsUUFBQSxlQUFlLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6QyxRQUFBLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFnQjNDLFFBQUEsbUJBQW1CLEdBQWtCO0lBQ2pELElBQUksRUFBRSxtQkFBRTtJQUNSLGVBQWUsRUFBRSxJQUFJO0lBRXJCLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDOUIsYUFBYTtJQUNiLEVBQUUsQ0FBQyxRQUFRLEVBQ1g7UUFDQyxNQUFNLEVBQUUsSUFBSTtLQUNaLENBQ0Q7Q0FDRCxDQUFDO0FBaUJGLFNBQWdCLEtBQUssQ0FBQyxHQUFvQixFQUFFLFVBQXlCLEVBQUU7SUFFdEU7UUFDQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWhHLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsRUFBRSxPQUFPLEVBQUU7WUFDekQsYUFBYTtTQUNiLENBQUMsQ0FBQztLQUNIO0lBRUQsSUFBSSxNQUFNLEdBQVcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLElBQUksR0FBVyxDQUFDO0lB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Q0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBUztRQUUzQixPQUFPLENBQUMsQ0FBQyxZQUFZLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFTRCxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUk7UUFFeEIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUMxQjtZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDMUI7UUFFRCxJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFDM0I7WUFDQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7Z0JBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEM7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUVEO0FBN0VELDhCQTZFQztBQVFELCtCQUErQjtBQUUvQixrQkFBZSxJQUFJLENBQUM7QUFFcEIsU0FBZ0IsaUJBQWlCLENBQUMsSUFBbUIsRUFBRSxPQUFzQjtJQUU1RSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXZGLGFBQWE7SUFDYixJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVsRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFSRCw4Q0FRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuaW1wb3J0IHsgVG9rZW4sIFRva2Vuc0xpc3QsIFRva2VucyB9IGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgbWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBjcmxmLCBMRiwgQ1JMRiwgQ1IsIGNoa2NybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgZGVlcG1lcmdlID0gcmVxdWlyZSgnZGVlcG1lcmdlLXBsdXMnKTtcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbmltcG9ydCBpc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnaXMtcGxhaW4tb2JqZWN0Jyk7XG5cbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QsIG1vbWVudCwgZGVlcG1lcmdlIH1cbmV4cG9ydCB7IGNybGYsIExGLCBDUkxGLCBDUiB9XG5cbmV4cG9ydCBjb25zdCBTWU1CT0xfUkFXX0RBVEEgPSBTeW1ib2wuZm9yKCdyYXdfZGF0YScpO1xuZXhwb3J0IGNvbnN0IFNZTUJPTF9SQVdfVkFMVUUgPSBTeW1ib2wuZm9yKCdyYXdfdmFsdWUnKTtcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1BhcnNlXG57XG5cdGNybGY/OiBzdHJpbmcsXG5cdG9sZFBhcnNlQXBpPzogYm9vbGVhbixcblxuXHRhbGxvd0Jsb2NrcXVvdGU/OiBib29sZWFuLFxuXG5cdGRpc2FibGVLZXlUb0xvd2VyQ2FzZT86IGJvb2xlYW4sXG5cblx0bWFya2VkT3B0aW9ucz86IG1kLk1hcmtlZE9wdGlvbnMsXG5cblx0ZmlsdGVyT2JqZWN0S2V5Pyxcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRPcHRpb25zUGFyc2U6IElPcHRpb25zUGFyc2UgPSB7XG5cdGNybGY6IExGLFxuXHRhbGxvd0Jsb2NrcXVvdGU6IHRydWUsXG5cblx0bWFya2VkT3B0aW9uczogT2JqZWN0LmFzc2lnbih7fSxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bWQuZGVmYXVsdHMsXG5cdFx0e1xuXHRcdFx0YnJlYWtzOiB0cnVlLFxuXHRcdH0sXG5cdCksXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIElPYmplY3RQYXJzZVxue1xuXHRba2V5OiBzdHJpbmddOiBhbnlcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgb2YgbWFya2Rvd24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmcgfCBCdWZmZXJ9IHN0clxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHI6IHN0cmluZywgb3B0aW9ucz86IElPcHRpb25zUGFyc2UpOiBJT2JqZWN0UGFyc2VcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHI6IEJ1ZmZlciwgb3B0aW9ucz86IElPcHRpb25zUGFyc2UpOiBJT2JqZWN0UGFyc2VcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHI6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9uczogSU9wdGlvbnNQYXJzZSA9IHt9KTogSU9iamVjdFBhcnNlXG57XG5cdHtcblx0XHRsZXQgbWFya2VkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zUGFyc2UubWFya2VkT3B0aW9ucywgb3B0aW9ucy5tYXJrZWRPcHRpb25zKTtcblxuXHRcdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9uc1BhcnNlLCBvcHRpb25zLCB7XG5cdFx0XHRtYXJrZWRPcHRpb25zLFxuXHRcdH0pO1xuXHR9XG5cblx0bGV0IHNvdXJjZTogc3RyaW5nID0gc3RyLnRvU3RyaW5nKCk7XG5cdGxldCBlb2w6IHN0cmluZztcblxuXHRpZiAoMSlcblx0e1xuXHRcdC8vIGRpc2FibGUgY3JsZiBvcHRpb25zXG5cdFx0ZW9sID0gTEY7XG5cdFx0c291cmNlID0gY3JsZihzb3VyY2UsIGVvbCk7XG5cdH1cblx0ZWxzZSBpZiAob3B0aW9ucy5jcmxmKVxuXHR7XG5cdFx0ZW9sID0gb3B0aW9ucy5jcmxmO1xuXHRcdHNvdXJjZSA9IGNybGYoc291cmNlLCBlb2wpO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGxldCBjayA9IGNoa2NybGYoc291cmNlKTtcblx0XHRlb2wgPSBjay5sZiA/IExGIDogKGNrLmNybGYgPyBDUkxGIDogQ1IpO1xuXHR9XG5cblx0bGV0IGxleGVyID0gbmV3IG1kLkxleGVyKG9wdGlvbnMubWFya2VkT3B0aW9ucyk7XG5cblx0bGV0IHRva3MgPSBsZXhlci5sZXgoc291cmNlKTtcblx0bGV0IGNvbmYgPSB7fTtcblx0bGV0IGtleXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBkZXB0aCA9IDA7XG5cdGxldCBpbmxpc3QgPSBmYWxzZTtcblxuXHRsZXQgcGFyYWdyYXBoOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgcGFyYWdyYXBoMjogc3RyaW5nW10gPSBbXTtcblx0bGV0IGxhc3RfdG9rOiBtZC5Ub2tlbjtcblx0bGV0IGJsb2NrcXVvdGVfc3RhcnQ6IGJvb2xlYW47XG5cblx0bGV0IGlubGluZV9sZXhlciA9IGNyZWF0ZUlubGluZUxleGVyKHRva3MsIE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHtcblxuXHR9KSk7XG5cblx0KHRva3MgYXMgVG9rZW5bXSkuZm9yRWFjaChmdW5jdGlvbiAodG9rLCBpbmRleClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsZXQgdmFsID0gdG9rLnRleHQ7XG5cdFx0bGV0IF9za2lwOiBib29sZWFuO1xuXHRcdGxldCB0eXBlID0gdG9rLnR5cGU7XG5cblx0XHRpZiAodHlwZSA9PSAndGV4dCcgJiYgdmFsLm1hdGNoKC9eW2Etel0rXFw6XFwvXFwvL2kpKVxuXHRcdHtcblx0XHRcdGxldCByID0gaW5saW5lX2xleGVyLm91dHB1dCh2YWwpO1xuXG5cdFx0XHRpZiAodmFsICE9PSByICYmIC88YSBocmVmPS8udGVzdChyKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHR0eXBlID0gJ3RleHQyJztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRzd2l0Y2ggKHRvay50eXBlKVxuXHRcdHtcblx0XHRcdGNhc2UgJ2hlYWRpbmcnOlxuXHRcdFx0XHR3aGlsZSAoZGVwdGgtLSA+PSB0b2suZGVwdGgpIGtleXMucG9wKCk7XG5cdFx0XHRcdGtleXMucHVzaChub3JtYWxpemUodG9rLnRleHQsIG9wdGlvbnMpKTtcblx0XHRcdFx0ZGVwdGggPSB0b2suZGVwdGg7XG5cblx0XHRcdFx0cGFyYWdyYXBoID0gW107XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsaXN0X2l0ZW1fc3RhcnQnOlxuXHRcdFx0XHRpbmxpc3QgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2xpc3RfaXRlbV9lbmQnOlxuXHRcdFx0XHRpbmxpc3QgPSBmYWxzZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGNhc2UgJ3RleHQyJzpcblx0XHRcdGNhc2UgJ3RleHQnOlxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdG9rLnRleHQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvcHRpb25zLCB7XG5cdFx0XHRcdFx0dHlwZSxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnYmxvY2txdW90ZV9zdGFydCc6XG5cdFx0XHRcdGJsb2NrcXVvdGVfc3RhcnQgPSB0cnVlO1xuXG5cdFx0XHRcdGlmIChvcHRpb25zLmFsbG93QmxvY2txdW90ZSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBhcmFncmFwaDIgPSBwYXJhZ3JhcGg7XG5cdFx0XHRcdFx0cGFyYWdyYXBoID0gW107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X3NraXAgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0b2spO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2Jsb2NrcXVvdGVfZW5kJzpcblxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGxvd0Jsb2NrcXVvdGUgJiYgYmxvY2txdW90ZV9zdGFydCAmJiBwYXJhZ3JhcGgubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFsID0gcGFyYWdyYXBoLmpvaW4oZW9sKTtcblx0XHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xuXG5cdFx0XHRcdFx0aWYgKCFvcHRpb25zLm9sZFBhcnNlQXBpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHZhbCA9IG5ldyBSYXdPYmplY3QodmFsLCB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdibG9ja3F1b3RlJyxcblx0XHRcdFx0XHRcdFx0dGV4dDogcGFyYWdyYXBoLFxuXG5cdFx0XHRcdFx0XHRcdHBhcmFncmFwaDogcGFyYWdyYXBoMixcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cblx0XHRcdFx0XHRwYXJhZ3JhcGggPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfc2tpcCA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRibG9ja3F1b3RlX3N0YXJ0ID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAncGFyYWdyYXBoJzpcblx0XHRcdFx0cGFyYWdyYXBoLnB1c2godG9rLnRleHQpO1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHRvayk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnY29kZSc6XG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zLm9sZFBhcnNlQXBpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHZhbCA9IG5ldyBSYXdPYmplY3QodmFsLCB0b2spO1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwuZ2V0UmF3RGF0YSgpWydwYXJhZ3JhcGgnXSA9IHBhcmFncmFwaDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAndGFibGUnOlxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgbnVsbCwgbnVsbCwgeyBoZWFkZXJzOiB0b2suaGVhZGVyLCByb3dzOiB0b2suY2VsbHMgfSwgb3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnaHRtbCc6XG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9cXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKCFvcHRpb25zLm9sZFBhcnNlQXBpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdHZhbCA9IG5ldyBSYXdPYmplY3QodmFsLCB0b2spO1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwuZ2V0UmF3RGF0YSgpWydwYXJhZ3JhcGgnXSA9IHBhcmFncmFwaDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHB1dChjb25mLCBrZXlzLCB2YWwsIHRydWUsIHVuZGVmaW5lZCwgb3B0aW9ucyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0b2spO1xuXG5cdFx0XHRcdF9za2lwID0gdHJ1ZTtcblxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRpZiAoIV9za2lwICYmICFbJ3BhcmFncmFwaCddLmluY2x1ZGVzKHRvay50eXBlKSlcblx0XHR7XG5cdFx0XHRwYXJhZ3JhcGggPSBbXTtcblx0XHR9XG5cblx0XHRsYXN0X3RvayA9IHRvaztcblx0fSk7XG5cblx0e1xuXHRcdGxldCBwYXJlbnQ7XG5cdFx0bGV0IHBhcmVudDIgPSBjb25mO1xuXHRcdGxldCBwYXJlbnQzO1xuXG5cdFx0Zm9yIChsZXQgaSBpbiBrZXlzKVxuXHRcdHtcblx0XHRcdGxldCBrID0ga2V5c1tpXTtcblxuXHRcdFx0aWYgKC9eXFxkKyQvLnRlc3QoaykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IGtrID0ga2V5c1tpLTFdO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IHBhcmVudCA9IGdldG9iamVjdGJ5aWQoa2V5cy5zbGljZSgwLCBpLTEpLCBjb25mKTtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRsZXQgb2JqID0gZ2V0b2JqZWN0YnlpZChrZXlzLnNsaWNlKDAsIGkpLCBjb25mKTtcblxuXHRcdFx0XHRsZXQgb2sgPSB0cnVlO1xuXG5cdFx0XHRcdGZvciAobGV0IGogaW4gb2JqKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKCEvXlxcZCskLy50ZXN0KGopKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdG9rID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob2spXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwYXJlbnRba2tdID0gT2JqZWN0LnZhbHVlcyhvYmopO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gY29uZjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldG9iamVjdGJ5aWQoYSwgY29uZilcbntcblx0bGV0IHJldCA9IGNvbmY7XG5cdGZvciAobGV0IGkgb2YgYSlcblx0e1xuXHRcdHJldCA9IHJldFtpXTtcblx0fVxuXHRyZXR1cm4gcmV0O1xufVxuXG4vKipcbiAqIEFkZCBgc3RyYCB0byBgb2JqYCB3aXRoIHRoZSBnaXZlbiBga2V5c2BcbiAqIHdoaWNoIHJlcHJlc2VudHMgdGhlIHRyYXZlcnNhbCBwYXRoLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHV0KG9iaiwga2V5czogc3RyaW5nW10sIHN0cjogc3RyaW5nLCBjb2RlPzogYm9vbGVhbiwgdGFibGU/OiBJVGFibGUsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UgPSB7fSwgb3RoZXJzOiB7XG5cdHR5cGU/OiBzdHJpbmcsXG59ID0ge30pXG57XG5cdGxldCB0YXJnZXQgPSBvYmo7XG5cdGxldCBsYXN0O1xuXHRsZXQga2V5O1xuXG5cdGZvciAobGV0IGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKylcblx0e1xuXHRcdGtleSA9IGtleXNbaV07XG5cdFx0bGFzdCA9IHRhcmdldDtcblx0XHR0YXJnZXRba2V5XSA9IHRhcmdldFtrZXldIHx8IHt9O1xuXHRcdHRhcmdldCA9IHRhcmdldFtrZXldO1xuXHR9XG5cblx0Ly8gY29kZVxuXHRpZiAoY29kZSlcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShsYXN0W2tleV0pKSBsYXN0W2tleV0gPSBbXTtcblx0XHRsYXN0W2tleV0ucHVzaChzdHIpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIHRhYmxlXG5cdGlmICh0YWJsZSlcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShsYXN0W2tleV0pKSBsYXN0W2tleV0gPSBbXTtcblx0XHRmb3IgKGxldCByaSA9IDA7IHJpIDwgdGFibGUucm93cy5sZW5ndGg7IHJpKyspXG5cdFx0e1xuXHRcdFx0bGV0IGFyckl0ZW0gPSB7fTtcblx0XHRcdGZvciAobGV0IGhpID0gMDsgaGkgPCB0YWJsZS5oZWFkZXJzLmxlbmd0aDsgaGkrKylcblx0XHRcdHtcblx0XHRcdFx0YXJySXRlbVtub3JtYWxpemUodGFibGUuaGVhZGVyc1toaV0sIG9wdGlvbnMpXSA9IHRhYmxlLnJvd3NbcmldW2hpXTtcblx0XHRcdH1cblx0XHRcdGxhc3Rba2V5XS5wdXNoKGFyckl0ZW0pO1xuXHRcdH1cblx0XHRyZXR1cm47XG5cdH1cblxuXHRsZXQgaXNLZXk6IGJvb2xlYW47XG5cdGxldCBpOiBudW1iZXIgPSBzdHIuaW5kZXhPZignOicpO1xuXG5cdGlmIChvcHRpb25zLmZpbHRlck9iamVjdEtleSlcblx0e1xuXHRcdGlmICh0eXBlb2Ygb3B0aW9ucy5maWx0ZXJPYmplY3RLZXkgPT0gJ2Z1bmN0aW9uJylcblx0XHR7XG5cdFx0XHRpc0tleSA9IG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5KHN0ciwgb2JqLCBvdGhlcnMpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0aSA9IHN0ci5zZWFyY2gob3B0aW9ucy5maWx0ZXJPYmplY3RLZXkpO1xuXHRcdFx0aXNLZXkgPSBpICE9IC0xO1xuXHRcdH1cblx0fVxuXG5cdC8vIGxpc3Rcblx0aWYgKChpc0tleSA9PT0gZmFsc2UgfHwgLTEgPT0gaSB8fCBvdGhlcnMudHlwZSA9PSAndGV4dDInKSlcblx0e1xuXHRcdGlmICghQXJyYXkuaXNBcnJheShsYXN0W2tleV0pKSBsYXN0W2tleV0gPSBbXTtcblx0XHRsYXN0W2tleV0ucHVzaChzdHIudHJpbSgpKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyBtYXBcblx0a2V5ID0gbm9ybWFsaXplKHN0ci5zbGljZSgwLCBpKSwgb3B0aW9ucyk7XG5cdGxldCB2YWwgPSBzdHIuc2xpY2UoaSArIDEpLnRyaW0oKTtcblx0dGFyZ2V0W2tleV0gPSB2YWw7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGBzdHJgLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUoc3RyOiBzdHJpbmcsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UgPSB7fSk6IHN0cmluZ1xue1xuXHRsZXQga2V5ID0gc3RyLnJlcGxhY2UoL1xccysvZywgJyAnKTtcblxuXHRpZiAoIW9wdGlvbnMuZGlzYWJsZUtleVRvTG93ZXJDYXNlKVxuXHR7XG5cdFx0a2V5ID0ga2V5LnRvTG93ZXJDYXNlKCk7XG5cdH1cblxuXHRyZXR1cm4ga2V5LnRyaW0oKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeShkYXRhSW5wdXQsIGxldmVsOiBudW1iZXIgPSAxLCBza2lwID0gW10sIGs/KTogc3RyaW5nXG57XG5cdGxldCByczE6IHN0cmluZ1tdID0gW107XG5cdGxldCByczI6IHN0cmluZ1tdID0gW107XG5cblx0bGV0IGlzUmF3T2JqZWN0ID0gUmF3T2JqZWN0LmlzUmF3T2JqZWN0KGRhdGFJbnB1dCk7XG5cdGxldCBkYXRhID0gZGF0YUlucHV0O1xuXHRsZXQgZGVzYztcblxuXHRpZiAoaXNSYXdPYmplY3QpXG5cdHtcblx0XHRsZXQgcmF3RGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdEYXRhKCk7XG5cblx0XHRpZiAocmF3RGF0YS5wYXJhZ3JhcGgpXG5cdFx0e1xuXHRcdFx0ZGVzYyA9IHJhd0RhdGEucGFyYWdyYXBoLmpvaW4oTEYucmVwZWF0KDIpKTtcblx0XHR9XG5cblx0XHRkYXRhID0gZGF0YUlucHV0LmdldFJhd1ZhbHVlKCk7XG5cdH1cblxuXHQvL2NvbnNvbGUubG9nKGspO1xuXG5cdGlmIChBcnJheS5pc0FycmF5KGRhdGEpKVxuXHR7XG5cdFx0aWYgKGsgfHwgayA9PT0gMClcblx0XHR7XG5cdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcnICsgayArIExGKTtcblxuXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYm9vbCA9ICghUmF3T2JqZWN0LmlzUmF3T2JqZWN0KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpO1xuXG5cdFx0XHRcdHJzMi5wdXNoKHN0cmluZ2lmeSh2YWx1ZSwgbGV2ZWwsIFtdLCBib29sID8gaW5kZXggOiBudWxsKSk7XG5cdFx0XHR9KVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGFycmF5KVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgYm9vbCA9ICghUmF3T2JqZWN0LmlzUmF3T2JqZWN0KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcpO1xuXG5cdFx0XHRcdHJzMS5wdXNoKHN0cmluZ2lmeSh2YWx1ZSwgbGV2ZWwsIFtdLCBib29sID8gaW5kZXggOiBudWxsKS5yZXBsYWNlKC9cXG4rJC9nLCAnJykpO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vcnMxLnB1c2goJycpO1xuXHRcdH1cblx0fVxuXHRlbHNlIGlmICh0eXBlb2YgZGF0YSA9PSAnb2JqZWN0Jylcblx0e1xuXHRcdGlmIChrIHx8IGsgPT09IDApXG5cdFx0e1xuXHRcdFx0cnMxLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdH1cblxuXHRcdGZvciAobGV0IGsgaW4gZGF0YSlcblx0XHR7XG5cdFx0XHRpZiAoc2tpcC5pbmNsdWRlcyhrKSlcblx0XHRcdHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGxldCBpc1Jhd09iamVjdCA9IFJhd09iamVjdC5pc1Jhd09iamVjdChkYXRhW2tdKTtcblx0XHRcdGxldCByb3cgPSBpc1Jhd09iamVjdCA/IGRhdGFba10uZ2V0UmF3VmFsdWUoKSA6IGRhdGFba107XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KHJvdykpXG5cdFx0XHR7XG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHRcdFx0cnMyLnB1c2goc3RyaW5naWZ5KHJvdywgbGV2ZWwgKyAxKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChpc1BsYWluT2JqZWN0KHJvdykpXG5cdFx0XHR7XG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHRcdFx0cnMyLnB1c2goc3RyaW5naWZ5KHJvdywgbGV2ZWwgKyAxKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChtb21lbnQuaXNNb21lbnQocm93KSlcblx0XHRcdHtcblx0XHRcdFx0cnMxLnB1c2goYC0gJHtrfTogJHtyb3cuZm9ybWF0KCl9YCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChpc1Jhd09iamVjdCB8fCB0eXBlb2Ygcm93ID09ICdzdHJpbmcnICYmIC9bXFxyXFxuXXxeXFxzL2cudGVzdChyb3cpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgbGFuZzogc3RyaW5nO1xuXHRcdFx0XHRsZXQgdmFsID0gcm93O1xuXG5cdFx0XHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9eW1xcclxcbl0rfFxccyskL2csICcnKTtcblxuXHRcdFx0XHRpZiAoaXNSYXdPYmplY3QpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgcmF3RGF0YSA9IGRhdGFba10uZ2V0UmF3RGF0YSgpIHx8IHt9O1xuXG5cdFx0XHRcdFx0aWYgKHJhd0RhdGEudHlwZSAhPSAnaHRtbCcpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGFuZyA9IHJhd0RhdGEubGFuZztcblxuXHRcdFx0XHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dmFsID0gTEYgKyB2YWwgKyBMRjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdFx0XHRyczIucHVzaCh2YWwpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRyczEucHVzaChgLSAke2t9OiAke3Jvd31gKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0ZWxzZSBpZiAoaXNSYXdPYmplY3QgfHwgdHlwZW9mIGRhdGEgPT0gJ3N0cmluZycgJiYgL1tcXHJcXG5dfF5cXHMvZy50ZXN0KGRhdGEpKVxuXHR7XG5cdFx0aWYgKGsgfHwgayA9PT0gMClcblx0XHR7XG5cdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XG5cdFx0fVxuXG5cdFx0aWYgKGRlc2MpXG5cdFx0e1xuXHRcdFx0cnMyLnB1c2goZGVzYyk7XG5cdFx0fVxuXG5cdFx0bGV0IGxhbmc6IHN0cmluZztcblxuXHRcdGxldCB2YWwgPSBkYXRhO1xuXG5cdFx0dmFsID0gdmFsLnJlcGxhY2UoL15bXFxyXFxuXSt8XFxzKyQvZywgJycpO1xuXG5cdFx0aWYgKGlzUmF3T2JqZWN0KVxuXHRcdHtcblx0XHRcdGxldCByYXdEYXRhID0gZGF0YUlucHV0LmdldFJhd0RhdGEoKSB8fCB7fTtcblx0XHRcdGxhbmcgPSByYXdEYXRhLmxhbmc7XG5cblx0XHRcdGlmIChyYXdEYXRhLnR5cGUgIT0gJ2h0bWwnKVxuXHRcdFx0e1xuXHRcdFx0XHR2YWwgPSBtYWtlQ29kZUJsb2NrKHZhbCwgbGFuZyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdHZhbCA9IExGICsgdmFsICsgTEY7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR2YWwgPSBtYWtlQ29kZUJsb2NrKHZhbCwgbGFuZyk7XG5cdFx0fVxuXG5cdFx0cnMyLnB1c2godmFsKTtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRpZiAoZGVzYylcblx0XHR7XG5cdFx0XHRyczEucHVzaChkZXNjKTtcblx0XHR9XG5cblx0XHRyczEucHVzaChgLSAkeyBrIHx8IGsgPT09IDAgPyBrICsgJzogJyA6ICcnIH0ke2RhdGF9YCk7XG5cdH1cblxuXHRsZXQgb3V0ID0gKHJzMS5jb25jYXQoWycnXS5jb25jYXQocnMyKSkuam9pbihMRikpLnJlcGxhY2UoL15cXG4rL2csICcnKTtcblxuXHRpZiAobGV2ZWwgPT0gMSlcblx0e1xuXHRcdG91dCA9IG91dC5yZXBsYWNlKC9eXFxuK3xcXHMrJC9nLCAnJykgKyBMRjtcblx0fVxuXG5cdHJldHVybiBvdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ29kZUJsb2NrKHZhbHVlLCBsYW5nPzogc3RyaW5nKVxue1xuXHRyZXR1cm4gYFxcblxcYFxcYFxcYCR7bGFuZyB8fCAnJ31cXG4ke3ZhbHVlfVxcblxcYFxcYFxcYFxcbmA7XG59XG5cbmV4cG9ydCBjbGFzcyBSYXdPYmplY3Rcbntcblx0Y29uc3RydWN0b3Ioc291cmNlLCByYXc/KVxuXHR7XG5cdFx0aWYgKHJhdylcblx0XHR7XG5cdFx0XHR0aGlzW1NZTUJPTF9SQVdfREFUQV0gPSByYXc7XG5cdFx0fVxuXG5cdFx0dGhpc1tTWU1CT0xfUkFXX1ZBTFVFXSA9IHNvdXJjZTtcblx0fVxuXG5cdGluc3BlY3QoKVxuXHR7XG5cdFx0bGV0IHBhZCA9IHRoaXNbU1lNQk9MX1JBV19EQVRBXSAmJiB0aGlzW1NZTUJPTF9SQVdfREFUQV0udHlwZTtcblxuXHRcdHJldHVybiAnUmF3JyArIHRoaXMuZ2V0VHlwZW9mKCkucmVwbGFjZSgvXlthLXpdLywgZnVuY3Rpb24gKHMpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHMudG9VcHBlckNhc2UoKTtcblx0XHR9KSArIGAoJHt1dGlsLmluc3BlY3QodGhpcy5nZXRSYXdWYWx1ZSgpKX0ke3BhZCA/ICcsICcgKyBwYWQgOiAnJ30pYFxuXHR9XG5cblx0dG9KU09OKClcblx0e1xuXHRcdHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG5cdH1cblxuXHR0b1N0cmluZygpXG5cdHtcblx0XHRyZXR1cm4gdGhpc1tTWU1CT0xfUkFXX1ZBTFVFXS50b1N0cmluZygpO1xuXHR9XG5cblx0Z2V0VHlwZW9mKClcblx0e1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KHRoaXNbU1lNQk9MX1JBV19WQUxVRV0pID8gJ2FycmF5JyA6IHR5cGVvZiB0aGlzW1NZTUJPTF9SQVdfVkFMVUVdO1xuXHR9XG5cblx0Z2V0UmF3RGF0YSgpXG5cdHtcblx0XHRyZXR1cm4gdGhpc1tTWU1CT0xfUkFXX0RBVEFdO1xuXHR9XG5cblx0Z2V0UmF3VmFsdWUoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU1lNQk9MX1JBV19WQUxVRV07XG5cdH1cblxuXHRzdGF0aWMgaXNSYXdPYmplY3Qodjogb2JqZWN0KVxuXHR7XG5cdFx0cmV0dXJuICh2IGluc3RhbmNlb2YgUmF3T2JqZWN0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiB3aWxsIHJlbW92ZSBoaWRkZW4gZGF0YSBhbmQgZ2V0IHNvdXJjZSBkYXRhXG5cdCAqXG5cdCAqIEBwYXJhbSB7UmF3T2JqZWN0fSBkYXRhXG5cdCAqL1xuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhOiBSYXdPYmplY3QpXG5cdHN0YXRpYyByZW1vdmVSYXdEYXRhKGRhdGEpXG5cdHN0YXRpYyByZW1vdmVSYXdEYXRhKGRhdGEpXG5cdHtcblx0XHRpZiAodGhpcy5pc1Jhd09iamVjdChkYXRhKSlcblx0XHR7XG5cdFx0XHRkYXRhID0gZGF0YS5nZXRSYXdWYWx1ZSgpO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgZGF0YSA9PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHRmb3IgKGxldCBpIGluIGRhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdGRhdGFbaV0gPSB0aGlzLnJlbW92ZVJhd0RhdGEoZGF0YVtpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRhdGE7XG5cdH1cblxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElUYWJsZVxue1xuXHRoZWFkZXJzOiBzdHJpbmdbXSxcblx0cm93cyxcbn1cblxuaW1wb3J0ICogYXMgc2VsZiBmcm9tICcuL2NvcmUnO1xuXG5leHBvcnQgZGVmYXVsdCBzZWxmO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5saW5lTGV4ZXIodG9rczogbWQuVG9rZW5zTGlzdCwgb3B0aW9uczogSU9wdGlvbnNQYXJzZSlcbntcblx0bGV0IG9wdHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9uc1BhcnNlLm1hcmtlZE9wdGlvbnMsIG9wdGlvbnMubWFya2VkT3B0aW9ucyk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRsZXQgaW5saW5lID0gbmV3IG1kLklubGluZUxleGVyKHRva3MubGlua3MsIG9wdHMpO1xuXG5cdHJldHVybiBpbmxpbmU7XG59XG4iXX0=