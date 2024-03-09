"use strict";
/**
 * Created by user on 2019/6/18.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.novelDiffFromLog = novelDiffFromLog;
const git_diff_from_1 = require("git-diff-from");
const upath2_1 = require("upath2");
const baseHashDefault = 5;
const targetTreeDefault = 'origin/master';
/**
 * 比對目標路徑下的 git 歷史變化
 * 適用於任何符合 `主資料夾/副資料夾/子路徑` 這種結構的資料夾
 */
function novelDiffFromLog(options) {
    let { targetTree = targetTreeDefault, novelRoot = process.cwd(), baseHash = baseHashDefault } = options;
    novelRoot = (0, upath2_1.resolve)(novelRoot);
    let ls = (0, git_diff_from_1.gitDiffFrom)(baseHash, targetTree, {
        cwd: novelRoot,
    });
    let ret = {
        novelRoot,
        baseHash,
        targetTree,
        list: {},
        range: {
            from: ls.from,
            to: ls.to,
        },
        count: {
            main: 0,
            novel: 0,
            file: 0,
        },
    };
    if (ls.length) {
        ret.list = ls.reduce(function (a, value) {
            let s = value.path.split(/[\\\/]/);
            if (s.length > 2) {
                let pathMain = s[0];
                let novelID = s[1];
                let basename = s[s.length - 1];
                let subpath = s.slice(2).join('/');
                if (!a[pathMain]) {
                    ret.count.main++;
                }
                a[pathMain] = a[pathMain] || {};
                if (!a[pathMain][novelID]) {
                    ret.count.novel++;
                }
                if (a[pathMain][novelID] == null) {
                    a[pathMain][novelID] = a[pathMain][novelID] || [];
                    Object.defineProperties(a[pathMain][novelID], {
                        pathMain: {
                            enumerable: false,
                            configurable: false,
                            get() {
                                return pathMain;
                            },
                        },
                        novelID: {
                            enumerable: false,
                            configurable: false,
                            get() {
                                return novelID;
                            },
                        },
                    });
                }
                a[pathMain][novelID].push(Object.assign(value, {
                    pathMain,
                    novelID,
                    basename,
                    subpath,
                }));
                ret.count.file++;
            }
            return a;
        }, {});
    }
    return ret;
}
exports.default = novelDiffFromLog;
//# sourceMappingURL=index.js.map