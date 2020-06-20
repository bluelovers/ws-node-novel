"use strict";
/**
 * Created by user on 2018/11/14/014.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tocSortCallback = exports.md_link_escape = exports.md_anchor_gitee = exports.md_href = exports.globFirst = exports.getNovelTitles = exports.loadReadmeMetaSync = exports.loadReadmeMeta = void 0;
const sort_1 = require("@node-novel/sort");
const array_hyper_unique_1 = require("array-hyper-unique");
const fast_glob_1 = __importDefault(require("@bluelovers/fast-glob"));
const fs_iconv_1 = __importDefault(require("fs-iconv"));
const node_novel_info_1 = require("node-novel-info");
const bluebird_1 = __importDefault(require("bluebird"));
const str_util_1 = __importDefault(require("str-util"));
async function loadReadmeMeta(file) {
    return fs_iconv_1.default.readFile(file)
        .then(function (data) {
        return node_novel_info_1.mdconf_parse(data, {
            // 當沒有包含必要的內容時不產生錯誤
            throw: false,
            // 允許不標準的 info 內容
            lowCheckLevel: true,
        });
    })
        .catch(function () {
        return null;
    });
}
exports.loadReadmeMeta = loadReadmeMeta;
function loadReadmeMetaSync(file) {
    try {
        let data = fs_iconv_1.default.readFileSync(file);
        // @ts-ignore
        return node_novel_info_1.mdconf_parse(data, {
            // 當沒有包含必要的內容時不產生錯誤
            throw: false,
            // 允許不標準的 info 內容
            lowCheckLevel: true,
        });
    }
    catch (e) {
    }
    return null;
}
exports.loadReadmeMetaSync = loadReadmeMetaSync;
function getNovelTitles(meta) {
    if (meta && meta.novel) {
        let arr = [
            'title',
            'title_source',
            'title_jp',
            'title_ja',
            'title_zh',
            'title_tw',
            'title_cn',
        ].concat(Object.keys(meta.novel))
            .reduce(function (a, key) {
            if (key.indexOf('title') === 0) {
                a.push(meta.novel[key]);
            }
            return a;
        }, []);
        if (meta.novel.series) {
            arr.push(meta.novel.series.name);
            arr.push(meta.novel.series.name_short);
        }
        arr = array_hyper_unique_1.array_unique(arr.filter(v => v && ![
            'undefined',
            '長編 【連載】',
            '連載中',
        ].includes(v)));
        return arr;
    }
    return [];
}
exports.getNovelTitles = getNovelTitles;
function globFirst(...argv) {
    return new bluebird_1.default(function (resolve, reject) {
        let fgs = fast_glob_1.default.stream(...argv);
        fgs.on('data', (entry) => {
            resolve(entry);
            // @ts-ignore
            fgs.destroy();
        });
        fgs.once('error', reject);
        fgs.once('end', () => resolve(undefined));
    });
}
exports.globFirst = globFirst;
function md_href(href) {
    return href.split('/').map(encodeURIComponent).join('/');
}
exports.md_href = md_href;
function md_anchor_gitee(title) {
    let anchor = title
        .replace(/[a-z]+/ig, function (s) {
        return s.toLowerCase();
    })
        .replace(/[\.．\/／　＠@（）\(\)～~]/g, '')
        .replace(/[ ]/g, '-');
    return md_href(anchor);
}
exports.md_anchor_gitee = md_anchor_gitee;
function md_link_escape(text) {
    return text.replace(/[\[\]]/g, function (s) {
        return '\\' + s;
    });
}
exports.md_link_escape = md_link_escape;
exports.tocSortCallback = sort_1.createSortCallback({
    dotNum: true,
    transpileBase(input, isSub) {
        let s = str_util_1.default.toHalfWidth(input);
        return s;
    },
    toLowerCase: sort_1.EnumToLowerCase.toLocaleLowerCase,
});
//# sourceMappingURL=util.js.map