"use strict";
/**
 * Created by user on 2018/11/11/011.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs_iconv_1 = require("fs-iconv");
const regexp_cjk_1 = require("regexp-cjk");
const upath2_1 = require("upath2");
const split_1 = require("./split");
const util_1 = require("./util");
const fs = require("fs-extra");
exports.defaultOptions = Object.freeze({
    file: null,
    dirname: null,
    outDir: null,
    indexPadLength: 5,
    useRegExpCJK: true,
});
function makeOptions(inputFile, options) {
    let cache = Object.assign({
        ...exports.defaultOptions,
        file: inputFile,
    }, options, {
        file: options.file || inputFile,
    });
    cache.dirname = upath2_1.default.dirname(cache.file);
    if (cache.useRegExpCJK) {
        if (typeof cache.useRegExpCJK !== 'function') {
            cache.useRegExpCJK = regexp_cjk_1.zhRegExp;
        }
    }
    return cache;
}
exports.makeOptions = makeOptions;
function _handleOptions(options) {
    let opts = Object.assign({
        ...exports.defaultOptions,
    }, {
        ...options,
    }, {
        volume: options.volume ? {
            ...options.volume,
        } : undefined,
        chapter: options.chapter ? {
            ...options.chapter,
        } : undefined,
    });
    _re(opts.volume);
    _re(opts.chapter);
    function _re(data) {
        if (data) {
            if (data.r) {
                const FLAGS = data.flags || 'gim';
                if (Array.isArray(data.r)) {
                    data.r = data.r.join('');
                }
                if (opts.useRegExpCJK || !(data.r instanceof RegExp)) {
                    let RE;
                    if (typeof opts.useRegExpCJK === 'function') {
                        // @ts-ignore
                        RE = opts.useRegExpCJK;
                    }
                    else if (opts.useRegExpCJK === true) {
                        // @ts-ignore
                        RE = regexp_cjk_1.zhRegExp;
                    }
                    else {
                        // @ts-ignore
                        RE = RegExp;
                    }
                    // @ts-ignore
                    data.r = new RE(data.r, data.r.flags || FLAGS);
                }
            }
            if (data.ignoreRe) {
                const FLAGS = data.ignoreFlags || 'i';
                if (Array.isArray(data.ignoreRe)) {
                    data.ignoreRe = data.ignoreRe.join('');
                }
                if (opts.useRegExpCJK || !(data.ignoreRe instanceof RegExp)) {
                    let RE;
                    if (typeof opts.useRegExpCJK === 'function') {
                        // @ts-ignore
                        RE = opts.useRegExpCJK;
                    }
                    else if (opts.useRegExpCJK === true) {
                        // @ts-ignore
                        RE = regexp_cjk_1.zhRegExp;
                    }
                    else {
                        // @ts-ignore
                        RE = RegExp;
                    }
                    // @ts-ignore
                    data.ignoreRe = new RE(data.ignoreRe, data.ignoreRe.flags || FLAGS);
                }
            }
            return true;
        }
    }
    // @ts-ignore
    return opts;
}
exports._handleOptions = _handleOptions;
async function autoFile(inputFile, options) {
    let opts = _handleOptions(options);
    let ret = await readFile(inputFile, opts);
    let ls = await outputFile(ret);
    return Object.assign(ret, {
        ls,
    });
}
exports.autoFile = autoFile;
async function readFile(inputFile, options) {
    let cache = makeOptions(inputFile, options);
    let txt = await fs_iconv_1.default.readFile(cache.file)
        .then(function (data) {
        return util_1._handleReadFile(data, cache.file);
    })
        .then(async (txt) => {
        if (options.readFileAfter) {
            let ret = await options.readFileAfter(txt);
            if (typeof ret === 'string') {
                return ret;
            }
        }
        return txt;
    });
    let data = await split_1.splitVolumeSync(txt, cache);
    return {
        options: cache,
        data,
    };
}
exports.readFile = readFile;
function readFileSync(inputFile, options) {
    let cache = makeOptions(inputFile, options);
    let txt;
    {
        let data = fs_iconv_1.default.readFileSync(cache.file);
        txt = util_1._handleReadFile(data, cache.file);
        if (options.readFileAfter) {
            let ret = options.readFileAfter(txt);
            if (typeof ret === 'string') {
                txt = ret;
            }
        }
    }
    let data = split_1.splitVolumeSync(txt, cache);
    return {
        options: cache,
        data,
    };
}
exports.readFileSync = readFileSync;
async function outputFile(data, options) {
    ({ data, options } = util_1._outputFile(data, options));
    let path_main = options.outDir || upath2_1.default.join(options.dirname, 'out');
    let ls = [];
    for (let vn in data) {
        for (let cn in data[vn]) {
            let file = upath2_1.default.join(fs_iconv_1.trimFilename(vn), fs_iconv_1.trimFilename(cn) + '.txt');
            let full_file = upath2_1.default.join(path_main, file);
            let txt = data[vn][cn];
            if (options.saveFileBefore) {
                let cache = {
                    file,
                    full_file,
                    data,
                    options,
                    cn,
                    vn,
                };
                let ret = options.saveFileBefore(data[vn][cn], cn, data[vn], cache);
                if (ret == null) {
                    continue;
                }
                ({ file } = cache);
                txt = ret;
            }
            await fs.outputFile(upath2_1.default.join(path_main, file), data[vn][cn]);
            ls.push(file);
        }
    }
    return ls;
}
exports.outputFile = outputFile;
function outputFileSync(data, options) {
    ({ data, options } = util_1._outputFile(data, options));
    let path_main = options.outDir || upath2_1.default.join(options.dirname, 'out');
    let ls = [];
    for (let vn in data) {
        for (let cn in data[vn]) {
            let file = upath2_1.default.join(fs_iconv_1.trimFilename(vn), fs_iconv_1.trimFilename(cn) + '.txt');
            fs.outputFileSync(upath2_1.default.join(path_main, file), data[vn][cn]);
            ls.push(file);
        }
    }
    return ls;
}
exports.outputFileSync = outputFileSync;
[
    'outputFile',
    'autoFile',
    'readFile',
]
    .forEach(function (key) {
    exports[key] = util_1._wrapMethod(exports[key]);
});
exports.default = autoFile;
//# sourceMappingURL=index.js.map