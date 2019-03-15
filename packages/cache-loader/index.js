"use strict";
/**
 * Created by user on 2019/1/6/006.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./lib/util");
exports.createMoment = util_1.createMoment;
//import fs = require('fs-extra');
const array_hyper_unique_1 = require("array-hyper-unique");
const sortObject = require("sort-object-keys2");
const openedMap = new WeakMap();
const defaultOptions = Object.freeze({
    history_max: 14,
    history_keep: 7,
});
/**
 * 透過解析 novel-stat.json 來取得小說狀態
 * 也因此如果 novel-stat.json 內沒有紀錄或者沒有更新的就會判斷不精準
 *
 * @example NovelStatCache.create()
 */
class NovelStatCache {
    /**
     * 使用 NovelStatCache.create() 代替
     *
     * @deprecated
     */
    constructor(options) {
        this.data = null;
        this.inited = false;
        options = NovelStatCache.fixOptions(options);
        let _chk = false;
        if (options.data) {
            if (!(options.data && options.data.history && options.data.novels && options.data.mdconf)) {
                throw new TypeError(`options.data is not allow data`);
            }
            _chk = true;
        }
        if (!options.file && (!options.readonly || !_chk)) {
            throw new RangeError(`options.file is required`);
        }
        else if (!_chk) {
            delete options.data;
        }
        this._init(options);
    }
    _init(options) {
        if (options.data) {
            this.data = options.data;
        }
        delete options.data;
        this.options = options;
        this.file = this.options.file;
        this.file_git = this.options.file_git;
        util_1.freezeProperty(this, 'options', true);
        util_1.freezeProperty(this, 'file');
        util_1.freezeProperty(this, 'file_git');
        this.open();
    }
    /**
     * 檢查 file 是否存在
     */
    exists() {
        const fs = util_1.tryRequireFS();
        return this.file && fs && fs.pathExistsSync(this.file);
    }
    open() {
        if (!this.inited) {
            this.inited = true;
            const fs = util_1.tryRequireFS();
            if (this.data) {
                //
            }
            else if (fs && this.exists()) {
                this.data = fs.readJSONSync(this.file);
            }
            else if (fs && this.file_git && fs.pathExistsSync(this.file_git)) {
                this.data = fs.readJSONSync(this.file_git);
            }
            // @ts-ignore
            this.data = this.data || {};
            this.data.history = this.data.history || {};
            this.data.novels = this.data.novels || {};
            this.data.mdconf = this.data.mdconf || {};
            this.data.meta = this.data.meta || {};
            util_1.freezeProperty(this, 'inited');
        }
        return this;
    }
    /**
     * 取得所有在 data.novels / data.mdconf 內存在的 pathMain
     */
    pathMainList() {
        return array_hyper_unique_1.array_unique(Object.keys(this.data.novels)
            .concat(Object.keys(this.data.mdconf)))
            .sort();
    }
    /**
     * 取得所有小說的最終狀態(預設時)
     * 例如 當 同時存在 xxx 與 xxx_out 時，只會回傳 xxx_out
     */
    filterNovel(type = EnumFilterNovelType.DEST) {
        let ks = this.pathMainList();
        let self = this;
        if (type & EnumFilterNovelType.SOURCE_ONLY) {
            ks = ks.filter(pathMain => !/_out$/.test(pathMain));
        }
        else if (type & EnumFilterNovelType.OUTPUT_ONLY) {
            ks = ks.filter(pathMain => /_out$/.test(pathMain));
        }
        return ks
            .sort(function (a, b) {
            if (a.replace(/_out$/, '') === b.replace(/_out$/, '')) {
                if (/_out$/.test(a)) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            return util_1.naturalCompare(a, b);
        })
            .reduce((ls, pathMain) => {
            let { is_out, pathMain_base } = util_1.parsePathMainBase(pathMain);
            ls[pathMain_base] = ls[pathMain_base] || {};
            Object.entries(self._mdconf_get_main(pathMain))
                .forEach(function ([novelID, mdconf]) {
                let cache = {
                    ...self.novel(pathMain, novelID),
                };
                let base_exists;
                if (is_out) {
                    let _src = self.novelExists(pathMain_base, novelID);
                    if (_src) {
                        [
                            'segment',
                            'segment_date',
                            'segment_old',
                        ]
                            .forEach(function (key) {
                            if (_src[key] != null) {
                                cache[key] = _src[key];
                            }
                        });
                    }
                    base_exists = !!_src;
                }
                ls[pathMain_base][novelID] = {
                    pathMain,
                    pathMain_base,
                    novelID,
                    mdconf,
                    cache,
                    is_out,
                    base_exists,
                };
            });
            return ls;
        }, {});
    }
    /**
     * (請小心使用) 移除指定 pathMain & novelID
     */
    remove(pathMain, novelID) {
        let bool;
        if (this.data.novels[pathMain]) {
            bool = bool || !!this.data.novels[pathMain][novelID];
            delete this.data.novels[pathMain][novelID];
        }
        if (this.data.mdconf[pathMain]) {
            bool = bool || !!this.data.mdconf[pathMain][novelID];
            delete this.data.mdconf[pathMain][novelID];
        }
        return bool;
    }
    /**
     * 取得指定 pathMain 的 novel 狀態集合
     */
    pathMain(pathMain) {
        return this.data.novels[pathMain] = this.data.novels[pathMain] || {};
    }
    novelExists(pathMain, novelID) {
        if (this.data.novels[pathMain]
            && this.data.novels[pathMain][novelID]
            && Object.keys(this.data.novels[pathMain][novelID]).length
            && this.data.novels[pathMain][novelID]) {
            return this.data.novels[pathMain][novelID];
        }
    }
    /**
     * 取得指定 pathMain novelID 的 novel 狀態緩存
     */
    novel(pathMain, novelID) {
        this.pathMain(pathMain);
        this.data.novels[pathMain][novelID] = this.data.novels[pathMain][novelID] || {};
        return this.data.novels[pathMain][novelID];
    }
    _mdconf_get_main(pathMain) {
        return this.data.mdconf[pathMain] || {};
    }
    /**
     * 取得指定 pathMain novelID 的 mdconf 資料
     */
    mdconf_get(pathMain, novelID) {
        let _data = this._mdconf_get_main(pathMain);
        return _data[novelID];
    }
    /**
     * 設定指定 pathMain novelID 的 mdconf 資料
     */
    mdconf_set(pathMain, novelID, meta) {
        this.data.mdconf[pathMain] = this.data.mdconf[pathMain] || {};
        this.data.mdconf[pathMain][novelID] = meta;
        return this;
    }
    /**
     * @deprecated
     */
    _beforeSave(bool) {
        let timestamp = this.timestamp;
        Object.entries(this.data.novels)
            .forEach(([pathMain, data], i) => {
            Object.entries(this.data.novels[pathMain])
                .forEach(([novelID, data]) => {
                let _a = [
                    data.init_date,
                    data.epub_date,
                    data.segment_date,
                    data.update_date,
                ]
                    .filter(v => v && v > 0);
                if (!_a.length) {
                    data.init_date = timestamp;
                }
                else {
                    data.init_date = _a
                        .reduce((a, b) => {
                        return Math.min(a, b);
                    })
                        || timestamp;
                }
            });
        });
        if (timestamp in this.data.history) {
            let _list = new Set();
            let today = this.data.history[timestamp];
            if (today.epub) {
                array_hyper_unique_1.array_unique(today.epub, {
                    overwrite: true,
                });
                today.epub.sort(function (a, b) {
                    return util_1.cacheSortCallback(a[0], b[0])
                        || util_1.cacheSortCallback(a[1], b[1]);
                });
                today.epub_count = today.epub.length | 0;
                if (!today.epub_count) {
                    delete today.epub;
                    delete today.epub_count;
                }
                else {
                    today.epub.forEach((v, i) => {
                        let novel = this.novel(v[0], v[1]);
                        _list.add(novel);
                        today.epub[i][2] = novel;
                    });
                }
            }
            if (today.segment) {
                array_hyper_unique_1.array_unique(today.segment, {
                    overwrite: true,
                });
                today.segment.sort(function (a, b) {
                    return util_1.cacheSortCallback(a[0], b[0])
                        || util_1.cacheSortCallback(a[1], b[1]);
                });
                today.segment_count = today.segment.length | 0;
                if (!today.segment_count) {
                    delete today.segment;
                    delete today.segment_count;
                }
                else {
                    today.segment.forEach((v, i) => {
                        let novel = this.novel(v[0], v[1]);
                        _list.add(novel);
                        today.segment[i][2] = novel;
                    });
                }
            }
            if (!Object.keys(today).length) {
                delete this.data.history[timestamp];
            }
            else if (bool > 1 || bool == EnumBeforeSave.OPTIMIZE_AND_UPDATE) {
                _list.forEach(function (data) {
                    let _a = [
                        data.init_date,
                        data.epub_date,
                        data.segment_date,
                        data.update_date,
                    ]
                        .filter(v => v && v > 0);
                    let old = data.update_date;
                    if (!_a.length || true) {
                        data.update_date = timestamp;
                    }
                    else {
                        data.update_date = _a
                            .reduce((a, b) => {
                            return Math.max(a, b);
                        })
                            || timestamp;
                    }
                    if (old !== data.update_date) {
                        data.update_count = (data.update_count | 0) + 1;
                    }
                });
                this.data.meta.timestamp = util_1.createMoment().valueOf();
            }
            this.data.meta.todayTimestamp = timestamp;
        }
        let ks = Object.keys(this.data.history);
        if (ks.length) {
            let h = this.data.history;
            ks.forEach(function (k) {
                if (!Object.keys(h[k]).length) {
                    delete h[k];
                }
            });
            if (ks.length >= this.options.history_max) {
                ks.sort().slice(0, (0 - this.options.history_keep)).forEach(k => delete this.data.history[k]);
            }
        }
        sortObject(this.data, {
            useSource: true,
            keys: [
                'meta',
                'history',
                'novels',
                'mdconf',
            ],
        });
        return this;
    }
    /**
     * 將資料儲存至 file
     *
     * @param bool - 清理物件多餘資料
     */
    save(bool) {
        if (this.options.readonly) {
            throw new Error(`options.readonly is set, can't not save file`);
        }
        const fs = util_1.tryRequireFS();
        fs && fs.outputJSONSync(this.file, this.toJSON(bool || true), {
            spaces: 2,
        });
        return this;
    }
    /**
     * 取得今天的 timestamp
     */
    get timestamp() {
        return util_1.default;
    }
    /**
     * 取得指定 timestamp 的 history 資料
     */
    history(timestamp) {
        if (timestamp in this.data.history) {
            return this.data.history[timestamp];
        }
    }
    /**
     * 取得所有 history 資料
     */
    historys() {
        return Object.entries(this.data.history);
    }
    /**
     * 取得前一次的 history 資料
     */
    historyPrev() {
        let timestamp = this.timestamp;
        let ks;
        if (timestamp in this.data.history) {
            ks = Object.keys(this.data.history);
            ks.pop();
        }
        else {
            ks = Object.keys(this.data.history);
        }
        let k = ks.pop();
        if (k in this.data.history) {
            return this.data.history[k];
        }
        return null;
    }
    /**
     * 取得今天的 history 資料
     */
    historyToday() {
        let timestamp = this.timestamp;
        let data = this.data.history[timestamp] = this.data.history[timestamp] || {};
        data.epub_count = data.epub_count | 0;
        data.epub = data.epub || [];
        data.segment_count = data.segment_count | 0;
        data.segment = data.segment || [];
        return this.data.history[timestamp];
    }
    static fixOptions(options, extraOptions) {
        options = {
            file_git: undefined,
            file: undefined,
            ...defaultOptions,
            ...options,
            ...extraOptions,
        };
        options.history_max = options.history_max > 0 ? options.history_max : defaultOptions.history_max;
        options.history_keep = options.history_keep > 0 ? options.history_keep : defaultOptions.history_keep;
        options = util_1.baseSortObject(options);
        return options;
    }
    /**
     * 建立 NovelStatCache 物件
     */
    static create(options) {
        options = this.fixOptions(options);
        if (openedMap.has(options)) {
            return openedMap.get(options);
        }
        let obj = new this(options);
        openedMap.set(options, obj);
        return obj;
    }
    /**
     * 允許用其他方式取得 data 來建立物件
     */
    static createFromJSON(data, options) {
        if (Buffer.isBuffer(data)) {
            data = JSON.parse(data.toString());
        }
        options = this.fixOptions(options, {
            readonly: (!options || options.readonly == null) ? true : options.readonly,
            // @ts-ignore
            data,
        });
        return this.create(options);
    }
    /**
     * @param bool - 清理物件多餘資料
     */
    toJSON(bool) {
        if (bool) {
            this._beforeSave(bool);
        }
        return this.data;
    }
}
exports.NovelStatCache = NovelStatCache;
var EnumBeforeSave;
(function (EnumBeforeSave) {
    EnumBeforeSave[EnumBeforeSave["NONE"] = 0] = "NONE";
    EnumBeforeSave[EnumBeforeSave["OPTIMIZE"] = 1] = "OPTIMIZE";
    EnumBeforeSave[EnumBeforeSave["OPTIMIZE_AND_UPDATE"] = 2] = "OPTIMIZE_AND_UPDATE";
})(EnumBeforeSave = exports.EnumBeforeSave || (exports.EnumBeforeSave = {}));
var EnumFilterNovelType;
(function (EnumFilterNovelType) {
    /**
     * 取得所有小說的最終狀態(預設)
     */
    EnumFilterNovelType[EnumFilterNovelType["DEST"] = 0] = "DEST";
    /**
     * 只取得原始資料
     */
    EnumFilterNovelType[EnumFilterNovelType["SOURCE_ONLY"] = 1] = "SOURCE_ONLY";
    /**
     * 只取得 _out 後資料
     */
    EnumFilterNovelType[EnumFilterNovelType["OUTPUT_ONLY"] = 2] = "OUTPUT_ONLY";
})(EnumFilterNovelType = exports.EnumFilterNovelType || (exports.EnumFilterNovelType = {}));
NovelStatCache.fixOptions = NovelStatCache.fixOptions.bind(NovelStatCache);
NovelStatCache.create = NovelStatCache.create.bind(NovelStatCache);
NovelStatCache.createFromJSON = NovelStatCache.createFromJSON.bind(NovelStatCache);
const { create, fixOptions, createFromJSON } = NovelStatCache;
exports.create = create;
exports.fixOptions = fixOptions;
exports.createFromJSON = createFromJSON;
exports.default = NovelStatCache.create;
exports = Object.freeze(exports);
//# sourceMappingURL=index.js.map