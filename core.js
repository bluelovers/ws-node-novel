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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSw2QkFBOEI7QUFDOUIsNkJBQTZCO0FBQzdCLG1EQUE2RDtBQU9wRCxlQVBBLHFCQUFJLENBT0E7QUFBRSxhQVBBLG1CQUFFLENBT0E7QUFBRSxlQVBBLHFCQUFJLENBT0E7QUFBRSxhQVBBLG1CQUFFLENBT0E7QUFOM0IsNENBQTZDO0FBS2IsOEJBQVM7QUFKekMsaUNBQWtDO0FBSVYsd0JBQU07QUFIOUIsaURBQWtEO0FBR3pDLHNDQUFhO0FBR1QsUUFBQSxlQUFlLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUN6QyxRQUFBLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFnQjNDLFFBQUEsbUJBQW1CLEdBQWtCO0lBQ2pELElBQUksRUFBRSxtQkFBRTtJQUNSLGVBQWUsRUFBRSxJQUFJO0lBRXJCLGFBQWEsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDOUIsYUFBYTtJQUNiLEVBQUUsQ0FBQyxRQUFRLEVBQ1g7UUFDQyxNQUFNLEVBQUUsSUFBSTtLQUNaLENBQ0Q7Q0FDRCxDQUFDO0FBaUJGLFNBQWdCLEtBQUssQ0FBQyxHQUFvQixFQUFFLFVBQXlCLEVBQUU7SUFFdEU7UUFDQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRWhHLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsRUFBRSxPQUFPLEVBQUU7WUFDekQsYUFBYTtTQUNiLENBQUMsQ0FBQztLQUNIO0lBRUQsSUFBSSxNQUFNLEdBQVcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3BDLElBQUksR0FBVyxDQUFDO0lB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LHdCQUFnQixDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBUztRQUUzQixPQUFPLENBQUMsQ0FBQyxZQUFZLFNBQVMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFTRCxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUk7UUFFeEIsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUMxQjtZQUNDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDMUI7UUFFRCxJQUFJLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFDM0I7WUFDQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksRUFDbEI7Z0JBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDdEM7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztDQUVEO0FBN0VELDhCQTZFQztBQVFELCtCQUErQjtBQUUvQixrQkFBZSxJQUFJLENBQUM7QUFFcEIsU0FBZ0IsaUJBQWlCLENBQUMsSUFBbUIsRUFBRSxPQUFzQjtJQUU1RSxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSwyQkFBbUIsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXZGLGFBQWE7SUFDYixJQUFJLE1BQU0sR0FBRyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVsRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFSRCw4Q0FRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuaW1wb3J0IHsgVG9rZW4sIFRva2Vuc0xpc3QsIFRva2VucyB9IGZyb20gJ21hcmtlZCc7XG5pbXBvcnQgbWQgPSByZXF1aXJlKCdtYXJrZWQnKTtcbmltcG9ydCAqIGFzIHV0aWwgZnJvbSAndXRpbCc7XG5pbXBvcnQgeyBjcmxmLCBMRiwgQ1JMRiwgQ1IsIGNoa2NybGYgfSBmcm9tICdjcmxmLW5vcm1hbGl6ZSc7XG5pbXBvcnQgZGVlcG1lcmdlID0gcmVxdWlyZSgnZGVlcG1lcmdlLXBsdXMnKTtcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbmltcG9ydCBpc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnaXMtcGxhaW4tb2JqZWN0Jyk7XG5pbXBvcnQgTWFya2Rvd25JdCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0Jyk7XG5cbmV4cG9ydCB7IGlzUGxhaW5PYmplY3QsIG1vbWVudCwgZGVlcG1lcmdlIH1cbmV4cG9ydCB7IGNybGYsIExGLCBDUkxGLCBDUiB9XG5cbmV4cG9ydCBjb25zdCBTWU1CT0xfUkFXX0RBVEEgPSBTeW1ib2wuZm9yKCdyYXdfZGF0YScpO1xuZXhwb3J0IGNvbnN0IFNZTUJPTF9SQVdfVkFMVUUgPSBTeW1ib2wuZm9yKCdyYXdfdmFsdWUnKTtcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1BhcnNlXG57XG5cdGNybGY/OiBzdHJpbmcsXG5cdG9sZFBhcnNlQXBpPzogYm9vbGVhbixcblxuXHRhbGxvd0Jsb2NrcXVvdGU/OiBib29sZWFuLFxuXG5cdGRpc2FibGVLZXlUb0xvd2VyQ2FzZT86IGJvb2xlYW4sXG5cblx0bWFya2VkT3B0aW9ucz86IG1kLk1hcmtlZE9wdGlvbnMsXG5cblx0ZmlsdGVyT2JqZWN0S2V5Pyxcbn1cblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRPcHRpb25zUGFyc2U6IElPcHRpb25zUGFyc2UgPSB7XG5cdGNybGY6IExGLFxuXHRhbGxvd0Jsb2NrcXVvdGU6IHRydWUsXG5cblx0bWFya2VkT3B0aW9uczogT2JqZWN0LmFzc2lnbih7fSxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bWQuZGVmYXVsdHMsXG5cdFx0e1xuXHRcdFx0YnJlYWtzOiB0cnVlLFxuXHRcdH0sXG5cdCksXG59O1xuXG5leHBvcnQgaW50ZXJmYWNlIElPYmplY3RQYXJzZVxue1xuXHRba2V5OiBzdHJpbmddOiBhbnlcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgb2YgbWFya2Rvd24uXG4gKlxuICogQHBhcmFtIHtTdHJpbmcgfCBCdWZmZXJ9IHN0clxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHI6IHN0cmluZywgb3B0aW9ucz86IElPcHRpb25zUGFyc2UpOiBJT2JqZWN0UGFyc2VcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHI6IEJ1ZmZlciwgb3B0aW9ucz86IElPcHRpb25zUGFyc2UpOiBJT2JqZWN0UGFyc2VcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShzdHI6IHN0cmluZyB8IEJ1ZmZlciwgb3B0aW9uczogSU9wdGlvbnNQYXJzZSA9IHt9KTogSU9iamVjdFBhcnNlXG57XG5cdHtcblx0XHRsZXQgbWFya2VkT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zUGFyc2UubWFya2VkT3B0aW9ucywgb3B0aW9ucy5tYXJrZWRPcHRpb25zKTtcblxuXHRcdG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9uc1BhcnNlLCBvcHRpb25zLCB7XG5cdFx0XHRtYXJrZWRPcHRpb25zLFxuXHRcdH0pO1xuXHR9XG5cblx0bGV0IHNvdXJjZTogc3RyaW5nID0gc3RyLnRvU3RyaW5nKCk7XG5cdGxldCBlb2w6IHN0cmluZztcblxuXHRpZiAoMSlcblx0e1xuXHRcdC8vIGRpc2FibGUgY3JsZiBvcHRpb25zXG5cdFx0ZW9sID0gTEY7XG5cdFx0c291cmNlID0gY3JsZihzb3VyY2UsIGVvbCk7XG5cdH1cblx0ZWxzZSBpZiAob3B0aW9ucy5jcmxmKVxuXHR7XG5cdFx0ZW9sID0gb3B0aW9ucy5jcmxmO1xuXHRcdHNvdXJjZSA9IGNybGYoc291cmNlLCBlb2wpO1xuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGxldCBjayA9IGNoa2NybGYoc291cmNlKTtcblx0XHRlb2wgPSBjay5sZiA/IExGIDogKGNrLmNybGYgPyBDUkxGIDogQ1IpO1xuXHR9XG5cblx0bGV0IGxleGVyID0gbmV3IG1kLkxleGVyKG9wdGlvbnMubWFya2VkT3B0aW9ucyk7XG5cblx0bGV0IHRva3MgPSBsZXhlci5sZXgoc291cmNlKTtcblx0bGV0IGNvbmYgPSB7fTtcblx0bGV0IGtleXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBkZXB0aCA9IDA7XG5cdGxldCBpbmxpc3QgPSBmYWxzZTtcblxuXHRsZXQgcGFyYWdyYXBoOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgcGFyYWdyYXBoMjogc3RyaW5nW10gPSBbXTtcblx0bGV0IGxhc3RfdG9rOiBtZC5Ub2tlbjtcblx0bGV0IGJsb2NrcXVvdGVfc3RhcnQ6IGJvb2xlYW47XG5cblx0bGV0IGlubGluZV9sZXhlciA9IGNyZWF0ZUlubGluZUxleGVyKHRva3MsIE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsIHtcblxuXHR9KSk7XG5cblx0Lypcblx0bGV0IF9pbmxpbmVfbWQgPSBuZXcgTWFya2Rvd25JdCh7XG5cdFx0bGlua2lmeTogZmFsc2UsXG5cdH0pO1xuXHQqL1xuXG5cdCh0b2tzIGFzIFRva2VuW10pLmZvckVhY2goZnVuY3Rpb24gKHRvaywgaW5kZXgpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bGV0IHZhbCA9IHRvay50ZXh0O1xuXHRcdGxldCBfc2tpcDogYm9vbGVhbjtcblx0XHRsZXQgdHlwZSA9IHRvay50eXBlO1xuXG5cdFx0aWYgKHR5cGUgPT0gJ3RleHQnICYmIHZhbC5tYXRjaCgvW2Etel0rXFw6XFwvXFwvL2kpKVxuXHRcdHtcblx0XHRcdGxldCByID0gaW5saW5lX2xleGVyLm91dHB1dCh2YWwpO1xuXHRcdFx0Ly9sZXQgciA9IF9pbmxpbmVfbWQucmVuZGVySW5saW5lKHZhbCk7XG5cblx0XHRcdGlmICh2YWwgIT09IHIgJiYgL15cXHMqPGEgaHJlZj0vLnRlc3QocikpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0dHlwZSA9ICd0ZXh0Mic7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c3dpdGNoICh0b2sudHlwZSlcblx0XHR7XG5cdFx0XHRjYXNlICdoZWFkaW5nJzpcblx0XHRcdFx0d2hpbGUgKGRlcHRoLS0gPj0gdG9rLmRlcHRoKSBrZXlzLnBvcCgpO1xuXHRcdFx0XHRrZXlzLnB1c2gobm9ybWFsaXplKHRvay50ZXh0LCBvcHRpb25zKSk7XG5cdFx0XHRcdGRlcHRoID0gdG9rLmRlcHRoO1xuXG5cdFx0XHRcdHBhcmFncmFwaCA9IFtdO1xuXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbGlzdF9pdGVtX3N0YXJ0Jzpcblx0XHRcdFx0aW5saXN0ID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsaXN0X2l0ZW1fZW5kJzpcblx0XHRcdFx0aW5saXN0ID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRjYXNlICd0ZXh0Mic6XG5cdFx0XHRjYXNlICd0ZXh0Jzpcblx0XHRcdFx0cHV0KGNvbmYsIGtleXMsIHRvay50ZXh0LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgb3B0aW9ucywge1xuXHRcdFx0XHRcdHR5cGUsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2Jsb2NrcXVvdGVfc3RhcnQnOlxuXHRcdFx0XHRibG9ja3F1b3RlX3N0YXJ0ID0gdHJ1ZTtcblxuXHRcdFx0XHRpZiAob3B0aW9ucy5hbGxvd0Jsb2NrcXVvdGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwYXJhZ3JhcGgyID0gcGFyYWdyYXBoO1xuXHRcdFx0XHRcdHBhcmFncmFwaCA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdF9za2lwID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vY29uc29sZS5sb2codG9rKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdibG9ja3F1b3RlX2VuZCc6XG5cblx0XHRcdFx0aWYgKG9wdGlvbnMuYWxsb3dCbG9ja3F1b3RlICYmIGJsb2NrcXVvdGVfc3RhcnQgJiYgcGFyYWdyYXBoLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhbCA9IHBhcmFncmFwaC5qb2luKGVvbCk7XG5cdFx0XHRcdFx0dmFsID0gdmFsLnJlcGxhY2UoL1xccyskL2csICcnKTtcblxuXHRcdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnYmxvY2txdW90ZScsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IHBhcmFncmFwaCxcblxuXHRcdFx0XHRcdFx0XHRwYXJhZ3JhcGg6IHBhcmFncmFwaDIsXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRwdXQoY29uZiwga2V5cywgdmFsLCB0cnVlLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xuXG5cdFx0XHRcdFx0cGFyYWdyYXBoID0gW107XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0X3NraXAgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YmxvY2txdW90ZV9zdGFydCA9IGZhbHNlO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3BhcmFncmFwaCc6XG5cdFx0XHRcdHBhcmFncmFwaC5wdXNoKHRvay50ZXh0KTtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0b2spO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2NvZGUnOlxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xuXG5cdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwgdG9rKTtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0dmFsLmdldFJhd0RhdGEoKVsncGFyYWdyYXBoJ10gPSBwYXJhZ3JhcGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdmFsLCB0cnVlLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3RhYmxlJzpcblx0XHRcdFx0cHV0KGNvbmYsIGtleXMsIG51bGwsIG51bGwsIHsgaGVhZGVyczogdG9rLmhlYWRlciwgcm93czogdG9rLmNlbGxzIH0sIG9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ2h0bWwnOlxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXFxzKyQvZywgJycpO1xuXG5cdFx0XHRcdGlmICghb3B0aW9ucy5vbGRQYXJzZUFwaSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHR2YWwgPSBuZXcgUmF3T2JqZWN0KHZhbCwgdG9rKTtcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0dmFsLmdldFJhd0RhdGEoKVsncGFyYWdyYXBoJ10gPSBwYXJhZ3JhcGg7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwdXQoY29uZiwga2V5cywgdmFsLCB0cnVlLCB1bmRlZmluZWQsIG9wdGlvbnMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vY29uc29sZS5sb2codG9rKTtcblxuXHRcdFx0XHRfc2tpcCA9IHRydWU7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0aWYgKCFfc2tpcCAmJiAhWydwYXJhZ3JhcGgnXS5pbmNsdWRlcyh0b2sudHlwZSkpXG5cdFx0e1xuXHRcdFx0cGFyYWdyYXBoID0gW107XG5cdFx0fVxuXG5cdFx0bGFzdF90b2sgPSB0b2s7XG5cdH0pO1xuXG5cdHtcblx0XHRsZXQgcGFyZW50O1xuXHRcdGxldCBwYXJlbnQyID0gY29uZjtcblx0XHRsZXQgcGFyZW50MztcblxuXHRcdGZvciAobGV0IGkgaW4ga2V5cylcblx0XHR7XG5cdFx0XHRsZXQgayA9IGtleXNbaV07XG5cblx0XHRcdGlmICgvXlxcZCskLy50ZXN0KGspKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBrayA9IGtleXNbaS0xXTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGxldCBwYXJlbnQgPSBnZXRvYmplY3RieWlkKGtleXMuc2xpY2UoMCwgaS0xKSwgY29uZik7XG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0bGV0IG9iaiA9IGdldG9iamVjdGJ5aWQoa2V5cy5zbGljZSgwLCBpKSwgY29uZik7XG5cblx0XHRcdFx0bGV0IG9rID0gdHJ1ZTtcblxuXHRcdFx0XHRmb3IgKGxldCBqIGluIG9iailcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICghL15cXGQrJC8udGVzdChqKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRvayA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9rKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGFyZW50W2trXSA9IE9iamVjdC52YWx1ZXMob2JqKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGNvbmY7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRvYmplY3RieWlkKGEsIGNvbmYpXG57XG5cdGxldCByZXQgPSBjb25mO1xuXHRmb3IgKGxldCBpIG9mIGEpXG5cdHtcblx0XHRyZXQgPSByZXRbaV07XG5cdH1cblx0cmV0dXJuIHJldDtcbn1cblxuLyoqXG4gKiBBZGQgYHN0cmAgdG8gYG9iamAgd2l0aCB0aGUgZ2l2ZW4gYGtleXNgXG4gKiB3aGljaCByZXByZXNlbnRzIHRoZSB0cmF2ZXJzYWwgcGF0aC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHB1dChvYmosIGtleXM6IHN0cmluZ1tdLCBzdHI6IHN0cmluZywgY29kZT86IGJvb2xlYW4sIHRhYmxlPzogSVRhYmxlLCBvcHRpb25zOiBJT3B0aW9uc1BhcnNlID0ge30sIG90aGVyczoge1xuXHR0eXBlPzogc3RyaW5nLFxufSA9IHt9KVxue1xuXHRsZXQgdGFyZ2V0ID0gb2JqO1xuXHRsZXQgbGFzdDtcblx0bGV0IGtleTtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspXG5cdHtcblx0XHRrZXkgPSBrZXlzW2ldO1xuXHRcdGxhc3QgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0W2tleV0gPSB0YXJnZXRba2V5XSB8fCB7fTtcblx0XHR0YXJnZXQgPSB0YXJnZXRba2V5XTtcblx0fVxuXG5cdC8vIGNvZGVcblx0aWYgKGNvZGUpXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobGFzdFtrZXldKSkgbGFzdFtrZXldID0gW107XG5cdFx0bGFzdFtrZXldLnB1c2goc3RyKTtcblx0XHRyZXR1cm47XG5cdH1cblxuXHQvLyB0YWJsZVxuXHRpZiAodGFibGUpXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobGFzdFtrZXldKSkgbGFzdFtrZXldID0gW107XG5cdFx0Zm9yIChsZXQgcmkgPSAwOyByaSA8IHRhYmxlLnJvd3MubGVuZ3RoOyByaSsrKVxuXHRcdHtcblx0XHRcdGxldCBhcnJJdGVtID0ge307XG5cdFx0XHRmb3IgKGxldCBoaSA9IDA7IGhpIDwgdGFibGUuaGVhZGVycy5sZW5ndGg7IGhpKyspXG5cdFx0XHR7XG5cdFx0XHRcdGFyckl0ZW1bbm9ybWFsaXplKHRhYmxlLmhlYWRlcnNbaGldLCBvcHRpb25zKV0gPSB0YWJsZS5yb3dzW3JpXVtoaV07XG5cdFx0XHR9XG5cdFx0XHRsYXN0W2tleV0ucHVzaChhcnJJdGVtKTtcblx0XHR9XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0bGV0IGlzS2V5OiBib29sZWFuO1xuXHRsZXQgaTogbnVtYmVyID0gc3RyLmluZGV4T2YoJzonKTtcblxuXHRpZiAob3B0aW9ucy5maWx0ZXJPYmplY3RLZXkpXG5cdHtcblx0XHRpZiAodHlwZW9mIG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5ID09ICdmdW5jdGlvbicpXG5cdFx0e1xuXHRcdFx0aXNLZXkgPSBvcHRpb25zLmZpbHRlck9iamVjdEtleShzdHIsIG9iaiwgb3RoZXJzKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGkgPSBzdHIuc2VhcmNoKG9wdGlvbnMuZmlsdGVyT2JqZWN0S2V5KTtcblx0XHRcdGlzS2V5ID0gaSAhPSAtMTtcblx0XHR9XG5cdH1cblxuXHQvLyBsaXN0XG5cdGlmICgoaXNLZXkgPT09IGZhbHNlIHx8IC0xID09IGkgfHwgb3RoZXJzLnR5cGUgPT0gJ3RleHQyJykpXG5cdHtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkobGFzdFtrZXldKSkgbGFzdFtrZXldID0gW107XG5cdFx0bGFzdFtrZXldLnB1c2goc3RyLnRyaW0oKSk7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gbWFwXG5cdGtleSA9IG5vcm1hbGl6ZShzdHIuc2xpY2UoMCwgaSksIG9wdGlvbnMpO1xuXHRsZXQgdmFsID0gc3RyLnNsaWNlKGkgKyAxKS50cmltKCk7XG5cdHRhcmdldFtrZXldID0gdmFsO1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBgc3RyYC5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKHN0cjogc3RyaW5nLCBvcHRpb25zOiBJT3B0aW9uc1BhcnNlID0ge30pOiBzdHJpbmdcbntcblx0bGV0IGtleSA9IHN0ci5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG5cblx0aWYgKCFvcHRpb25zLmRpc2FibGVLZXlUb0xvd2VyQ2FzZSlcblx0e1xuXHRcdGtleSA9IGtleS50b0xvd2VyQ2FzZSgpO1xuXHR9XG5cblx0cmV0dXJuIGtleS50cmltKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnkoZGF0YUlucHV0LCBsZXZlbDogbnVtYmVyID0gMSwgc2tpcCA9IFtdLCBrPyk6IHN0cmluZ1xue1xuXHRsZXQgcnMxOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgcnMyOiBzdHJpbmdbXSA9IFtdO1xuXG5cdGxldCBpc1Jhd09iamVjdCA9IFJhd09iamVjdC5pc1Jhd09iamVjdChkYXRhSW5wdXQpO1xuXHRsZXQgZGF0YSA9IGRhdGFJbnB1dDtcblx0bGV0IGRlc2M7XG5cblx0aWYgKGlzUmF3T2JqZWN0KVxuXHR7XG5cdFx0bGV0IHJhd0RhdGEgPSBkYXRhSW5wdXQuZ2V0UmF3RGF0YSgpO1xuXG5cdFx0aWYgKHJhd0RhdGEucGFyYWdyYXBoKVxuXHRcdHtcblx0XHRcdGRlc2MgPSByYXdEYXRhLnBhcmFncmFwaC5qb2luKExGLnJlcGVhdCgyKSk7XG5cdFx0fVxuXG5cdFx0ZGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdWYWx1ZSgpO1xuXHR9XG5cblx0Ly9jb25zb2xlLmxvZyhrKTtcblxuXHRpZiAoQXJyYXkuaXNBcnJheShkYXRhKSlcblx0e1xuXHRcdGlmIChrIHx8IGsgPT09IDApXG5cdFx0e1xuXHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnJyArIGsgKyBMRik7XG5cblx0XHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2wgPSAoIVJhd09iamVjdC5pc1Jhd09iamVjdCh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKTtcblxuXHRcdFx0XHRyczIucHVzaChzdHJpbmdpZnkodmFsdWUsIGxldmVsLCBbXSwgYm9vbCA/IGluZGV4IDogbnVsbCkpO1xuXHRcdFx0fSlcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBhcnJheSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGJvb2wgPSAoIVJhd09iamVjdC5pc1Jhd09iamVjdCh2YWx1ZSkgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnKTtcblxuXHRcdFx0XHRyczEucHVzaChzdHJpbmdpZnkodmFsdWUsIGxldmVsLCBbXSwgYm9vbCA/IGluZGV4IDogbnVsbCkucmVwbGFjZSgvXFxuKyQvZywgJycpKTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvL3JzMS5wdXNoKCcnKTtcblx0XHR9XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIGRhdGEgPT0gJ29iamVjdCcpXG5cdHtcblx0XHRpZiAoayB8fCBrID09PSAwKVxuXHRcdHtcblx0XHRcdHJzMS5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHR9XG5cblx0XHRmb3IgKGxldCBrIGluIGRhdGEpXG5cdFx0e1xuXHRcdFx0aWYgKHNraXAuaW5jbHVkZXMoaykpXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgaXNSYXdPYmplY3QgPSBSYXdPYmplY3QuaXNSYXdPYmplY3QoZGF0YVtrXSk7XG5cdFx0XHRsZXQgcm93ID0gaXNSYXdPYmplY3QgPyBkYXRhW2tdLmdldFJhd1ZhbHVlKCkgOiBkYXRhW2tdO1xuXG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShyb3cpKVxuXHRcdFx0e1xuXHRcdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XG5cdFx0XHRcdHJzMi5wdXNoKHN0cmluZ2lmeShyb3csIGxldmVsICsgMSkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXNQbGFpbk9iamVjdChyb3cpKVxuXHRcdFx0e1xuXHRcdFx0XHRyczIucHVzaCgnIycucmVwZWF0KGxldmVsKSArICcgJyArIGsgKyBMRik7XG5cdFx0XHRcdHJzMi5wdXNoKHN0cmluZ2lmeShyb3csIGxldmVsICsgMSkpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAobW9tZW50LmlzTW9tZW50KHJvdykpXG5cdFx0XHR7XG5cdFx0XHRcdHJzMS5wdXNoKGAtICR7a306ICR7cm93LmZvcm1hdCgpfWApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoaXNSYXdPYmplY3QgfHwgdHlwZW9mIHJvdyA9PSAnc3RyaW5nJyAmJiAvW1xcclxcbl18Xlxccy9nLnRlc3Qocm93KSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IGxhbmc6IHN0cmluZztcblx0XHRcdFx0bGV0IHZhbCA9IHJvdztcblxuXHRcdFx0XHR2YWwgPSB2YWwucmVwbGFjZSgvXltcXHJcXG5dK3xcXHMrJC9nLCAnJyk7XG5cblx0XHRcdFx0aWYgKGlzUmF3T2JqZWN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHJhd0RhdGEgPSBkYXRhW2tdLmdldFJhd0RhdGEoKSB8fCB7fTtcblxuXHRcdFx0XHRcdGlmIChyYXdEYXRhLnR5cGUgIT0gJ2h0bWwnKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxhbmcgPSByYXdEYXRhLmxhbmc7XG5cblx0XHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHZhbCA9IExGICsgdmFsICsgTEY7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHZhbCA9IG1ha2VDb2RlQmxvY2sodmFsLCBsYW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJzMi5wdXNoKCcjJy5yZXBlYXQobGV2ZWwpICsgJyAnICsgayArIExGKTtcblx0XHRcdFx0cnMyLnB1c2godmFsKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cnMxLnB1c2goYC0gJHtrfTogJHtyb3d9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGVsc2UgaWYgKGlzUmF3T2JqZWN0IHx8IHR5cGVvZiBkYXRhID09ICdzdHJpbmcnICYmIC9bXFxyXFxuXXxeXFxzL2cudGVzdChkYXRhKSlcblx0e1xuXHRcdGlmIChrIHx8IGsgPT09IDApXG5cdFx0e1xuXHRcdFx0cnMyLnB1c2goJyMnLnJlcGVhdChsZXZlbCkgKyAnICcgKyBrICsgTEYpO1xuXHRcdH1cblxuXHRcdGlmIChkZXNjKVxuXHRcdHtcblx0XHRcdHJzMi5wdXNoKGRlc2MpO1xuXHRcdH1cblxuXHRcdGxldCBsYW5nOiBzdHJpbmc7XG5cblx0XHRsZXQgdmFsID0gZGF0YTtcblxuXHRcdHZhbCA9IHZhbC5yZXBsYWNlKC9eW1xcclxcbl0rfFxccyskL2csICcnKTtcblxuXHRcdGlmIChpc1Jhd09iamVjdClcblx0XHR7XG5cdFx0XHRsZXQgcmF3RGF0YSA9IGRhdGFJbnB1dC5nZXRSYXdEYXRhKCkgfHwge307XG5cdFx0XHRsYW5nID0gcmF3RGF0YS5sYW5nO1xuXG5cdFx0XHRpZiAocmF3RGF0YS50eXBlICE9ICdodG1sJylcblx0XHRcdHtcblx0XHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR2YWwgPSBMRiArIHZhbCArIExGO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dmFsID0gbWFrZUNvZGVCbG9jayh2YWwsIGxhbmcpO1xuXHRcdH1cblxuXHRcdHJzMi5wdXNoKHZhbCk7XG5cdH1cblx0ZWxzZVxuXHR7XG5cdFx0aWYgKGRlc2MpXG5cdFx0e1xuXHRcdFx0cnMxLnB1c2goZGVzYyk7XG5cdFx0fVxuXG5cdFx0cnMxLnB1c2goYC0gJHsgayB8fCBrID09PSAwID8gayArICc6ICcgOiAnJyB9JHtkYXRhfWApO1xuXHR9XG5cblx0bGV0IG91dCA9IChyczEuY29uY2F0KFsnJ10uY29uY2F0KHJzMikpLmpvaW4oTEYpKS5yZXBsYWNlKC9eXFxuKy9nLCAnJyk7XG5cblx0aWYgKGxldmVsID09IDEpXG5cdHtcblx0XHRvdXQgPSBvdXQucmVwbGFjZSgvXlxcbit8XFxzKyQvZywgJycpICsgTEY7XG5cdH1cblxuXHRyZXR1cm4gb3V0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFrZUNvZGVCbG9jayh2YWx1ZSwgbGFuZz86IHN0cmluZylcbntcblx0cmV0dXJuIGBcXG5cXGBcXGBcXGAke2xhbmcgfHwgJyd9XFxuJHt2YWx1ZX1cXG5cXGBcXGBcXGBcXG5gO1xufVxuXG5leHBvcnQgY2xhc3MgUmF3T2JqZWN0XG57XG5cdGNvbnN0cnVjdG9yKHNvdXJjZSwgcmF3Pylcblx0e1xuXHRcdGlmIChyYXcpXG5cdFx0e1xuXHRcdFx0dGhpc1tTWU1CT0xfUkFXX0RBVEFdID0gcmF3O1xuXHRcdH1cblxuXHRcdHRoaXNbU1lNQk9MX1JBV19WQUxVRV0gPSBzb3VyY2U7XG5cdH1cblxuXHRpbnNwZWN0KClcblx0e1xuXHRcdGxldCBwYWQgPSB0aGlzW1NZTUJPTF9SQVdfREFUQV0gJiYgdGhpc1tTWU1CT0xfUkFXX0RBVEFdLnR5cGU7XG5cblx0XHRyZXR1cm4gJ1JhdycgKyB0aGlzLmdldFR5cGVvZigpLnJlcGxhY2UoL15bYS16XS8sIGZ1bmN0aW9uIChzKVxuXHRcdHtcblx0XHRcdHJldHVybiBzLnRvVXBwZXJDYXNlKCk7XG5cdFx0fSkgKyBgKCR7dXRpbC5pbnNwZWN0KHRoaXMuZ2V0UmF3VmFsdWUoKSl9JHtwYWQgPyAnLCAnICsgcGFkIDogJyd9KWBcblx0fVxuXG5cdHRvSlNPTigpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy50b1N0cmluZygpO1xuXHR9XG5cblx0dG9TdHJpbmcoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU1lNQk9MX1JBV19WQUxVRV0udG9TdHJpbmcoKTtcblx0fVxuXG5cdGdldFR5cGVvZigpXG5cdHtcblx0XHRyZXR1cm4gQXJyYXkuaXNBcnJheSh0aGlzW1NZTUJPTF9SQVdfVkFMVUVdKSA/ICdhcnJheScgOiB0eXBlb2YgdGhpc1tTWU1CT0xfUkFXX1ZBTFVFXTtcblx0fVxuXG5cdGdldFJhd0RhdGEoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNbU1lNQk9MX1JBV19EQVRBXTtcblx0fVxuXG5cdGdldFJhd1ZhbHVlKClcblx0e1xuXHRcdHJldHVybiB0aGlzW1NZTUJPTF9SQVdfVkFMVUVdO1xuXHR9XG5cblx0c3RhdGljIGlzUmF3T2JqZWN0KHY6IG9iamVjdClcblx0e1xuXHRcdHJldHVybiAodiBpbnN0YW5jZW9mIFJhd09iamVjdCk7XG5cdH1cblxuXHQvKipcblx0ICogd2lsbCByZW1vdmUgaGlkZGVuIGRhdGEgYW5kIGdldCBzb3VyY2UgZGF0YVxuXHQgKlxuXHQgKiBAcGFyYW0ge1Jhd09iamVjdH0gZGF0YVxuXHQgKi9cblx0c3RhdGljIHJlbW92ZVJhd0RhdGEoZGF0YTogUmF3T2JqZWN0KVxuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhKVxuXHRzdGF0aWMgcmVtb3ZlUmF3RGF0YShkYXRhKVxuXHR7XG5cdFx0aWYgKHRoaXMuaXNSYXdPYmplY3QoZGF0YSkpXG5cdFx0e1xuXHRcdFx0ZGF0YSA9IGRhdGEuZ2V0UmF3VmFsdWUoKTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGRhdGEgPT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0Zm9yIChsZXQgaSBpbiBkYXRhKVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhW2ldID0gdGhpcy5yZW1vdmVSYXdEYXRhKGRhdGFbaV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBkYXRhO1xuXHR9XG5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJVGFibGVcbntcblx0aGVhZGVyczogc3RyaW5nW10sXG5cdHJvd3MsXG59XG5cbmltcG9ydCAqIGFzIHNlbGYgZnJvbSAnLi9jb3JlJztcblxuZXhwb3J0IGRlZmF1bHQgc2VsZjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUlubGluZUxleGVyKHRva3M6IG1kLlRva2Vuc0xpc3QsIG9wdGlvbnM6IElPcHRpb25zUGFyc2UpXG57XG5cdGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnNQYXJzZS5tYXJrZWRPcHRpb25zLCBvcHRpb25zLm1hcmtlZE9wdGlvbnMpO1xuXG5cdC8vIEB0cy1pZ25vcmVcblx0bGV0IGlubGluZSA9IG5ldyBtZC5JbmxpbmVMZXhlcih0b2tzLmxpbmtzLCBvcHRzKTtcblxuXHRyZXR1cm4gaW5saW5lO1xufVxuIl19