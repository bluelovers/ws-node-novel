"use strict";
/**
 * Created by user on 2019/1/6/006.
 */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importStar(require("./lib/util"));
exports.createMoment = util_1.createMoment;
const array_hyper_unique_1 = require("array-hyper-unique");
const sort_object_keys2_1 = __importDefault(require("sort-object-keys2"));
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
                                // @ts-ignore
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
        sort_object_keys2_1.default(this.data, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7Ozs7Ozs7OztBQUVILG1EQU1vQjtBQVNYLHVCQVhSLG1CQUFZLENBV1E7QUFMckIsMkRBQWtEO0FBQ2xELDBFQUEyQztBQUUzQyxNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBbUQsQ0FBQztBQThOakYsTUFBTSxjQUFjLEdBQThDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFL0UsV0FBVyxFQUFFLEVBQUU7SUFDZixZQUFZLEVBQUUsQ0FBQztDQUVmLENBQUMsQ0FBQztBQUVIOzs7OztHQUtHO0FBQ0gsTUFBYSxjQUFjO0lBZ0IxQjs7OztPQUlHO0lBQ0gsWUFBWSxPQUErQjtRQVYzQyxTQUFJLEdBQW9CLElBQUksQ0FBQztRQUc3QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBU3ZCLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxHQUFZLEtBQUssQ0FBQztRQUUxQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQ2hCO1lBQ0MsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUN6RjtnQkFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNqRDtZQUNDLE1BQU0sSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNqRDthQUNJLElB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QU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMS82LzAwNi5cbiAqL1xuXG5pbXBvcnQgdG9kYXlNb21lbnRUaW1lc3RhbXAsIHtcblx0YmFzZVNvcnRPYmplY3QsXG5cdGNhY2hlU29ydENhbGxiYWNrLFxuXHRmcmVlemVQcm9wZXJ0eSxcblx0Y3JlYXRlTW9tZW50LFxuXHRuYXR1cmFsQ29tcGFyZSwgdHJ5UmVxdWlyZUZTLCBwYXJzZVBhdGhNYWluQmFzZSxcbn0gZnJvbSAnLi9saWIvdXRpbCc7XG5pbXBvcnQgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IHNvcnRPYmplY3QgZnJvbSAnc29ydC1vYmplY3Qta2V5czInO1xuXG5jb25zdCBvcGVuZWRNYXAgPSBuZXcgV2Vha01hcDxQYXJ0aWFsPElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM+LCBOb3ZlbFN0YXRDYWNoZT4oKTtcblxuZXhwb3J0IHsgY3JlYXRlTW9tZW50IH1cblxuLyoqXG4gKiDmiYDmnIkgdGltZXN0YW1wIOeCuiBVbml4IHRpbWVzdGFtcCBpbiBtaWxsaXNlY29uZHMg54K6IHV0YyArOFxuICogcGF0aE1haW4g54K6IOS4u+izh+WkvuWQjeeosVxuICogbm92ZWxJRCDngrog5bCP6Kqq6LOH5paZ5aS+5ZCN56ixXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU3RhdENhY2hlXG57XG5cblx0LyoqXG5cdCAqIOatpCBqc29uIGFwaSDnmoTnm7jpl5zos4fmlplcblx0ICovXG5cdG1ldGE/OiB7XG5cdFx0LyoqXG5cdFx0ICog5q2kIGpzb24g6LOH5paZ5pu05paw55qE55W25pel6LW35aeLKOW3suWQq+aZguWNgClcblx0XHQgKi9cblx0XHR0b2RheVRpbWVzdGFtcD86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiDmraQganNvbiDos4fmlpnmm7TmlrDnmoTlr6bpmpvmmYLplpNcblx0XHQgKiDlj6rmnInnlbbkvb/nlKjku6XkuIvlj4PmlbjmmYLmiY3mnIPmm7TmlrBcblx0XHQgKlxuXHRcdCAqIG5vdmVsU3RhdENhY2hlLnNhdmUoRW51bUJlZm9yZVNhdmUuT1BUSU1JWkVfQU5EX1VQREFURSlcblx0XHQgKiBub3ZlbFN0YXRDYWNoZS5zYXZlKDIpXG5cdFx0ICovXG5cdFx0dGltZXN0YW1wPzogbnVtYmVyLFxuXG5cdFx0LyoqXG5cdFx0ICog5omT5YyF5YmN55qE57ay5Z2AXG5cdFx0ICogaHR0cHM6Ly9naXRlZS5jb20vYmx1ZWxvdmVycy9ub3ZlbC90cmVlL21hc3RlclxuXHRcdCAqL1xuXHRcdHNvdXJjZVVybD86IHN0cmluZyxcblx0XHQvKipcblx0XHQgKiDmiZPljIXlvoznmoTntrLlnYBcblx0XHQgKiBodHRwczovL2dpdGxhYi5jb20vZGVtb25vdmVsL2VwdWItdHh0L2Jsb2IvbWFzdGVyXG5cdFx0ICovXG5cdFx0b3V0cHV0VXJsPzogc3RyaW5nLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiDlsI/oqqrnt6nlrZjni4DmhYtcblx0ICovXG5cdG5vdmVsczoge1xuXHRcdFtwYXRoTWFpbjogc3RyaW5nXToge1xuXHRcdFx0W25vdmVsSUQ6IHN0cmluZ106IElOb3ZlbFN0YXRDYWNoZU5vdmVsLFxuXHRcdH0sXG5cdH0sXG5cblx0LyoqXG5cdCAqIOatt+WPsue0gOmMhFxuXHQgKi9cblx0aGlzdG9yeToge1xuXHRcdFt0aW1lc3RhbXA6IHN0cmluZ106IElOb3ZlbFN0YXRDYWNoZUhpc3RvcnksXG5cdFx0W3RpbWVzdGFtcDogbnVtYmVyXTogSU5vdmVsU3RhdENhY2hlSGlzdG9yeSxcblx0fSxcblxuXHQvKipcblx0ICog6YCP6YGOIG5vZGUtbm92ZWwtY29uZiDop6PmnpDpgY7nmoQgTUVUQSDos4fmlpkgKFJFQURNRS5tZClcblx0ICovXG5cdG1kY29uZjoge1xuXHRcdFtwYXRoTWFpbjogc3RyaW5nXToge1xuXHRcdFx0W25vdmVsSUQ6IHN0cmluZ106IElNZGNvbmZNZXRhLFxuXHRcdH0sXG5cdH0sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU3RhdENhY2hlTm92ZWxcbntcblx0LyoqXG5cdCAqIHNlZ21lbnQg5pu05paw5pmC6ZaTXG5cdCAqL1xuXHRzZWdtZW50X2RhdGU/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiBlcHViIOabtOaWsOaZgumWk1xuXHQgKi9cblx0ZXB1Yl9kYXRlPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDliJ3lp4vljJbmmYLplpNcblx0ICovXG5cdGluaXRfZGF0ZT86IG51bWJlcixcblxuXHQvKipcblx0ICog57i956ugL+WNt+aVuOmHj1xuXHQgKi9cblx0dm9sdW1lPzogbnVtYmVyLFxuXHQvKipcblx0ICog57i96Kmx5pW4XG5cdCAqL1xuXHRjaGFwdGVyPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDkuIrmrKHnmoTnuL3nq6Av5Y235pW46YePXG5cdCAqL1xuXHR2b2x1bWVfb2xkPzogbnVtYmVyLFxuXHQvKipcblx0ICog5LiK5qyh55qE57i96Kmx5pW4XG5cdCAqL1xuXHRjaGFwdGVyX29sZD86IG51bWJlcixcblxuXHQvKipcblx0ICogc2VnbWVudCDororli5Xmlbjph49cblx0ICovXG5cdHNlZ21lbnQ/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDkuIrmrKHnmoQgc2VnbWVudCDororli5Xmlbjph49cblx0ICovXG5cdHNlZ21lbnRfb2xkPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDlsI/oqqrni4DmhYsgZmxhZyDmoLnmk5ogcmVhZG1lLm1kIOWFp+ioreWumlxuXHQgKi9cblx0bm92ZWxfc3RhdHVzPzogRW51bU5vdmVsU3RhdHVzLFxuXG5cdC8qKlxuXHQgKiDmnIDlvozororli5XmmYLplpNcblx0ICovXG5cdHVwZGF0ZV9kYXRlPzogbnVtYmVyO1xuXHQvKipcblx0ICog57SA6YyE6K6K5YuV5qyh5pW4XG5cdCAqL1xuXHR1cGRhdGVfY291bnQ/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIGVwdWIgZmlsZW5hbWVcblx0ICovXG5cdGVwdWJfYmFzZW5hbWU/OiBzdHJpbmcsXG5cdHR4dF9iYXNlbmFtZT86IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVIaXN0b3J5XG57XG5cdC8qKlxuXHQgKiDmnKzmrKHoqJjpjITlhafnmoQgZXB1YiDnuL3mlbhcblx0ICovXG5cdGVwdWJfY291bnQ/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDmnKzmrKHoqJjpjITlhafnmoQgZXB1YlxuXHQgKi9cblx0ZXB1Yj86IEFycmF5PFtzdHJpbmcsIHN0cmluZywgSU5vdmVsU3RhdENhY2hlTm92ZWw/XT4sXG5cdHNlZ21lbnRfY291bnQ/OiBudW1iZXIsXG5cdHNlZ21lbnQ/OiBBcnJheTxbc3RyaW5nLCBzdHJpbmcsIElOb3ZlbFN0YXRDYWNoZU5vdmVsP10+LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZU9wdGlvbnNcbntcblx0LyoqXG5cdCAqIOiugOWvq+e3qeWtmOeahOebruaomSBqc29uIOi3r+W+kVxuXHQgKi9cblx0ZmlsZTogc3RyaW5nLFxuXHQvKipcblx0ICog55W2IGZpbGUg5LiN5a2Y5Zyo5pmC5ZiX6Kmm6K6A5Y+W5q2k5qqU5qGIXG5cdCAqL1xuXHRmaWxlX2dpdD86IHN0cmluZyxcblxuXHQvKipcblx0ICog56aB5q2i5bCH6LOH5paZ5a+r5Zue5qqU5qGIXG5cdCAqL1xuXHRyZWFkb25seT86IGJvb2xlYW4sXG5cblx0aGlzdG9yeV9tYXg/OiBudW1iZXIsXG5cdGhpc3Rvcnlfa2VlcD86IG51bWJlcixcblxuXHQvKipcblx0ICogb3B0aW9ucy5yZWFkb25seSAmJiBvcHRpb25zLmRhdGEg5b+F6aCI5ZCM5pmC5ZWf55SoXG5cdCAqL1xuXHRkYXRhPzogSU5vdmVsU3RhdENhY2hlLFxufVxuXG4vKipcbiAqIOWPluW+l+Wwj+iqqueahOacgOe1gueLgOaFiyjpoJDoqK3mmYIpXG4gKiDkvovlpoIg55W2IOWQjOaZguWtmOWcqCB4eHgg6IiHIHh4eF9vdXQg5pmC77yM5Y+q5pyD5Zue5YKzIHh4eF9vdXRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyTm92ZWxEYXRhXG57XG5cdC8qKlxuXHQgKiDlr6bpmpvkuIrnmoQgcGF0aE1haW5cblx0ICovXG5cdHBhdGhNYWluOiBzdHJpbmcsXG5cdC8qKlxuXHQgKiDmspLmnIkgb3V0IOWJjeeahCBwYXRoTWFpbiDot6/lvpFcblx0ICovXG5cdHBhdGhNYWluX2Jhc2U6IHN0cmluZyxcblx0bm92ZWxJRDogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiDop6PmnpAgUkVBRE1FLm1kIOW+jOeahOizh+aWmVxuXHQgKi9cblx0bWRjb25mOiBJTWRjb25mTWV0YSxcblx0LyoqXG5cdCAqIOWQiOS9tSBvdXQg5YmN6IiHIG91dCDlvoznmoTnt6nlrZjos4fmlplcblx0ICovXG5cdGNhY2hlOiBJTm92ZWxTdGF0Q2FjaGVOb3ZlbCxcblxuXHQvKipcblx0ICog5q2k5bCP6Kqq5pivIG91dCDlvozlsI/oqqpcblx0ICovXG5cdGlzX291dDogYm9vbGVhbixcblx0LyoqXG5cdCAqIOaYr+WQpuWtmOWcqOatpOWwj+iqqiBvdXQg5YmN55qE6LOH5paZXG5cdCAqIOWkp+mDqOWIhueLgOazgeS4i+atpOWAvOmDveaYr+eCuiB0cnVlIOS9huWwkemDqOWIhuaDheazgeS4i+acg+acieWFtuS7luWAvFxuXHQgKlxuXHQgKiDkvovlpoJcblx0ICogY20g5LiL55qE5aSn5aSa6YO95rKS5pyJ5a2Y5ZyoIG91dCDlvozos4fmlpkg5omA5Lul5pyD5Zue5YKzIHVuZGVmaW5lZFxuXHQgKiB6LmFiYW5kb24g5LiL5aSn5aSa6YO95Y+q5a2Y5ZyoIG91dCDlvozos4fmlpkg5omA5Lul5pyD5Zue5YKzIGZhbHNlXG5cdCAqL1xuXHRiYXNlX2V4aXN0czogYm9vbGVhbixcbn1cblxuLyoqXG4gKiDngrrkuobntbHkuIDoiIfmnproiInmlrnkvr8gcGF0aE1haW4g5pyD57Wx5LiA54K6IOWfuuekjuWQjSjkuZ/lsLHmmK/mspLmnIkgX291dClcbiAqIOWvpumam+S4iueahCBwYXRoTWFpbiDoq4vnlLEgSUZpbHRlck5vdmVsRGF0YSDlhaflj5blvpdcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyTm92ZWxcbntcblx0W3BhdGhNYWluOiBzdHJpbmddOiB7XG5cdFx0W25vdmVsSUQ6IHN0cmluZ106IElGaWx0ZXJOb3ZlbERhdGEsXG5cdH0sXG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBSZWFkb25seTxQYXJ0aWFsPElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM+PiA9IE9iamVjdC5mcmVlemUoe1xuXG5cdGhpc3RvcnlfbWF4OiAxNCxcblx0aGlzdG9yeV9rZWVwOiA3LFxuXG59KTtcblxuLyoqXG4gKiDpgI/pgY7op6PmnpAgbm92ZWwtc3RhdC5qc29uIOS+huWPluW+l+Wwj+iqqueLgOaFi1xuICog5Lmf5Zug5q2k5aaC5p6cIG5vdmVsLXN0YXQuanNvbiDlhafmspLmnInntIDpjITmiJbogIXmspLmnInmm7TmlrDnmoTlsLHmnIPliKTmlrfkuI3nsr7mupZcbiAqXG4gKiBAZXhhbXBsZSBOb3ZlbFN0YXRDYWNoZS5jcmVhdGUoKVxuICovXG5leHBvcnQgY2xhc3MgTm92ZWxTdGF0Q2FjaGVcbntcblx0LyoqXG5cdCAqIOiugOWvq+e3qeWtmOeahOebruaomSBqc29uIOi3r+W+kVxuXHQgKi9cblx0ZmlsZTogc3RyaW5nO1xuXHQvKipcblx0ICog55W2IGZpbGUg5LiN5a2Y5Zyo5pmC5ZiX6Kmm6K6A5Y+W5q2k5qqU5qGIXG5cdCAqL1xuXHRmaWxlX2dpdDogc3RyaW5nO1xuXG5cdGRhdGE6IElOb3ZlbFN0YXRDYWNoZSA9IG51bGw7XG5cdG9wdGlvbnM6IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM7XG5cblx0aW5pdGVkOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIOS9v+eUqCBOb3ZlbFN0YXRDYWNoZS5jcmVhdGUoKSDku6Pmm79cblx0ICpcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMpXG5cdHtcblx0XHRvcHRpb25zID0gTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdGxldCBfY2hrOiBib29sZWFuID0gZmFsc2U7XG5cblx0XHRpZiAob3B0aW9ucy5kYXRhKVxuXHRcdHtcblx0XHRcdGlmICghKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEuaGlzdG9yeSAmJiBvcHRpb25zLmRhdGEubm92ZWxzICYmIG9wdGlvbnMuZGF0YS5tZGNvbmYpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBvcHRpb25zLmRhdGEgaXMgbm90IGFsbG93IGRhdGFgKTtcblx0XHRcdH1cblxuXHRcdFx0X2NoayA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHRpb25zLmZpbGUgJiYgKCFvcHRpb25zLnJlYWRvbmx5IHx8ICFfY2hrKSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihgb3B0aW9ucy5maWxlIGlzIHJlcXVpcmVkYCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFfY2hrKVxuXHRcdHtcblx0XHRcdGRlbGV0ZSBvcHRpb25zLmRhdGE7XG5cdFx0fVxuXG5cdFx0dGhpcy5faW5pdChvcHRpb25zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaW5pdChvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0aWYgKG9wdGlvbnMuZGF0YSlcblx0XHR7XG5cdFx0XHR0aGlzLmRhdGEgPSBvcHRpb25zLmRhdGE7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIG9wdGlvbnMuZGF0YTtcblxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0XHR0aGlzLmZpbGUgPSB0aGlzLm9wdGlvbnMuZmlsZTtcblx0XHR0aGlzLmZpbGVfZ2l0ID0gdGhpcy5vcHRpb25zLmZpbGVfZ2l0O1xuXG5cdFx0ZnJlZXplUHJvcGVydHkodGhpcywgJ29wdGlvbnMnLCB0cnVlKTtcblx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnZmlsZScpO1xuXHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdmaWxlX2dpdCcpO1xuXG5cdFx0dGhpcy5vcGVuKCk7XG5cdH1cblxuXHQvKipcblx0ICog5qqi5p+lIGZpbGUg5piv5ZCm5a2Y5ZyoXG5cdCAqL1xuXHRleGlzdHMoKVxuXHR7XG5cdFx0Y29uc3QgZnMgPSB0cnlSZXF1aXJlRlMoKTtcblxuXHRcdHJldHVybiB0aGlzLmZpbGUgJiYgZnMgJiYgZnMucGF0aEV4aXN0c1N5bmModGhpcy5maWxlKVxuXHR9XG5cblx0cHJvdGVjdGVkIG9wZW4oKVxuXHR7XG5cdFx0aWYgKCF0aGlzLmluaXRlZClcblx0XHR7XG5cdFx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRcdGNvbnN0IGZzID0gdHJ5UmVxdWlyZUZTKCk7XG5cblx0XHRcdGlmICh0aGlzLmRhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdC8vXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChmcyAmJiB0aGlzLmV4aXN0cygpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmRhdGEgPSBmcy5yZWFkSlNPTlN5bmModGhpcy5maWxlKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGZzICYmIHRoaXMuZmlsZV9naXQgJiYgZnMucGF0aEV4aXN0c1N5bmModGhpcy5maWxlX2dpdCkpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuZGF0YSA9IGZzLnJlYWRKU09OU3luYyh0aGlzLmZpbGVfZ2l0KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dGhpcy5kYXRhID0gdGhpcy5kYXRhIHx8IHt9O1xuXG5cdFx0XHR0aGlzLmRhdGEuaGlzdG9yeSA9IHRoaXMuZGF0YS5oaXN0b3J5IHx8IHt9O1xuXHRcdFx0dGhpcy5kYXRhLm5vdmVscyA9IHRoaXMuZGF0YS5ub3ZlbHMgfHwge307XG5cdFx0XHR0aGlzLmRhdGEubWRjb25mID0gdGhpcy5kYXRhLm1kY29uZiB8fCB7fTtcblx0XHRcdHRoaXMuZGF0YS5tZXRhID0gdGhpcy5kYXRhLm1ldGEgfHwge307XG5cblx0XHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdpbml0ZWQnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmiYDmnInlnKggZGF0YS5ub3ZlbHMgLyBkYXRhLm1kY29uZiDlhaflrZjlnKjnmoQgcGF0aE1haW5cblx0ICovXG5cdHBhdGhNYWluTGlzdCgpXG5cdHtcblx0XHRyZXR1cm4gYXJyYXlfdW5pcXVlKE9iamVjdC5rZXlzKHRoaXMuZGF0YS5ub3ZlbHMpXG5cdFx0XHQuY29uY2F0KE9iamVjdC5rZXlzKHRoaXMuZGF0YS5tZGNvbmYpKSlcblx0XHRcdC5zb3J0KClcblx0XHRcdDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmiYDmnInlsI/oqqrnmoTmnIDntYLni4DmhYso6aCQ6Kit5pmCKVxuXHQgKiDkvovlpoIg55W2IOWQjOaZguWtmOWcqCB4eHgg6IiHIHh4eF9vdXQg5pmC77yM5Y+q5pyD5Zue5YKzIHh4eF9vdXRcblx0ICovXG5cdGZpbHRlck5vdmVsKHR5cGU6IEVudW1GaWx0ZXJOb3ZlbFR5cGUgPSBFbnVtRmlsdGVyTm92ZWxUeXBlLkRFU1QpXG5cdHtcblx0XHRsZXQga3MgPSB0aGlzLnBhdGhNYWluTGlzdCgpO1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdGlmICh0eXBlICYgRW51bUZpbHRlck5vdmVsVHlwZS5TT1VSQ0VfT05MWSlcblx0XHR7XG5cdFx0XHRrcyA9IGtzLmZpbHRlcihwYXRoTWFpbiA9PiAhL19vdXQkLy50ZXN0KHBhdGhNYWluKSlcblx0XHR9XG5cdFx0ZWxzZSBpZiAodHlwZSAmIEVudW1GaWx0ZXJOb3ZlbFR5cGUuT1VUUFVUX09OTFkpXG5cdFx0e1xuXHRcdFx0a3MgPSBrcy5maWx0ZXIocGF0aE1haW4gPT4gL19vdXQkLy50ZXN0KHBhdGhNYWluKSlcblx0XHR9XG5cblx0XHRyZXR1cm4ga3Ncblx0XHRcdC5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYS5yZXBsYWNlKC9fb3V0JC8sICcnKSA9PT0gYi5yZXBsYWNlKC9fb3V0JC8sICcnKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICgvX291dCQvLnRlc3QoYSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG5hdHVyYWxDb21wYXJlKGEsIGIpO1xuXHRcdFx0fSlcblx0XHRcdC5yZWR1Y2UoKGxzLCBwYXRoTWFpbikgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHsgaXNfb3V0LCBwYXRoTWFpbl9iYXNlIH09IHBhcnNlUGF0aE1haW5CYXNlKHBhdGhNYWluKTtcblxuXHRcdFx0XHRsc1twYXRoTWFpbl9iYXNlXSA9IGxzW3BhdGhNYWluX2Jhc2VdIHx8IHt9O1xuXG5cdFx0XHRcdE9iamVjdC5lbnRyaWVzKHNlbGYuX21kY29uZl9nZXRfbWFpbihwYXRoTWFpbikpXG5cdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtub3ZlbElELCBtZGNvbmZdKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBjYWNoZSA9IHtcblx0XHRcdFx0XHRcdFx0Li4uc2VsZi5ub3ZlbChwYXRoTWFpbiwgbm92ZWxJRCksXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRsZXQgYmFzZV9leGlzdHM6IGJvb2xlYW47XG5cblx0XHRcdFx0XHRcdGlmIChpc19vdXQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBfc3JjID0gc2VsZi5ub3ZlbEV4aXN0cyhwYXRoTWFpbl9iYXNlLCBub3ZlbElEKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoX3NyYylcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdChbXG5cdFx0XHRcdFx0XHRcdFx0XHQnc2VnbWVudCcsXG5cdFx0XHRcdFx0XHRcdFx0XHQnc2VnbWVudF9kYXRlJyxcblx0XHRcdFx0XHRcdFx0XHRcdCdzZWdtZW50X29sZCcsXG5cdFx0XHRcdFx0XHRcdFx0XSBhcyAoa2V5b2YgSU5vdmVsU3RhdENhY2hlTm92ZWwpW10pXG5cdFx0XHRcdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoX3NyY1trZXldICE9IG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FjaGVba2V5XSA9IF9zcmNba2V5XVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGJhc2VfZXhpc3RzID0gISFfc3JjO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsc1twYXRoTWFpbl9iYXNlXVtub3ZlbElEXSA9IHtcblx0XHRcdFx0XHRcdFx0cGF0aE1haW4sXG5cdFx0XHRcdFx0XHRcdHBhdGhNYWluX2Jhc2UsXG5cdFx0XHRcdFx0XHRcdG5vdmVsSUQsXG5cblx0XHRcdFx0XHRcdFx0bWRjb25mLFxuXHRcdFx0XHRcdFx0XHRjYWNoZSxcblxuXHRcdFx0XHRcdFx0XHRpc19vdXQsXG5cdFx0XHRcdFx0XHRcdGJhc2VfZXhpc3RzLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIGxzO1xuXHRcdFx0fSwge30gYXMgSUZpbHRlck5vdmVsKVxuXHR9XG5cblx0LyoqXG5cdCAqICjoq4vlsI/lv4Pkvb/nlKgpIOenu+mZpOaMh+WumiBwYXRoTWFpbiAmIG5vdmVsSURcblx0ICovXG5cdHJlbW92ZShwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdGlmICh0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXSlcblx0XHR7XG5cdFx0XHRib29sID0gYm9vbCB8fCAhIXRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdO1xuXG5cdFx0XHRkZWxldGUgdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0pXG5cdFx0e1xuXHRcdFx0Ym9vbCA9IGJvb2wgfHwgISF0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXVtub3ZlbElEXTtcblxuXHRcdFx0ZGVsZXRlIHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dW25vdmVsSURdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJvb2w7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIOeahCBub3ZlbCDni4DmhYvpm4blkIhcblx0ICovXG5cdHBhdGhNYWluKHBhdGhNYWluOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0gPSB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXSB8fCB7fTtcblx0fVxuXG5cdG5vdmVsRXhpc3RzKHBhdGhNYWluOiBzdHJpbmcsIG5vdmVsSUQ6IHN0cmluZyk6IElOb3ZlbFN0YXRDYWNoZU5vdmVsXG5cdHtcblx0XHRpZiAodGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1cblx0XHRcdCYmIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdXG5cdFx0XHQmJiBPYmplY3Qua2V5cyh0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSkubGVuZ3RoXG5cdFx0XHQmJiB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIG5vdmVsSUQg55qEIG5vdmVsIOeLgOaFi+e3qeWtmFxuXHQgKi9cblx0bm92ZWwocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5wYXRoTWFpbihwYXRoTWFpbik7XG5cblx0XHR0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSA9IHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdIHx8IHt9O1xuXG5cdFx0cmV0dXJuIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9tZGNvbmZfZ2V0X21haW4ocGF0aE1haW46IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSB8fCB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmjIflrpogcGF0aE1haW4gbm92ZWxJRCDnmoQgbWRjb25mIOizh+aWmVxuXHQgKi9cblx0bWRjb25mX2dldChwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcpOiBJTWRjb25mTWV0YVxuXHR7XG5cdFx0bGV0IF9kYXRhID0gdGhpcy5fbWRjb25mX2dldF9tYWluKHBhdGhNYWluKTtcblxuXHRcdHJldHVybiBfZGF0YVtub3ZlbElEXTtcblx0fVxuXG5cdC8qKlxuXHQgKiDoqK3lrprmjIflrpogcGF0aE1haW4gbm92ZWxJRCDnmoQgbWRjb25mIOizh+aWmVxuXHQgKi9cblx0bWRjb25mX3NldChwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcsIG1ldGE6IElNZGNvbmZNZXRhKVxuXHR7XG5cdFx0dGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gPSB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSB8fCB7fTtcblxuXHRcdHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dW25vdmVsSURdID0gbWV0YTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRfYmVmb3JlU2F2ZShib29sPzogYm9vbGVhbiB8IG51bWJlcilcblx0e1xuXHRcdGxldCB0aW1lc3RhbXAgPSB0aGlzLnRpbWVzdGFtcDtcblxuXHRcdE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5ub3ZlbHMpXG5cdFx0XHQuZm9yRWFjaCgoW3BhdGhNYWluLCBkYXRhXSwgaSkgPT5cblx0XHRcdHtcblx0XHRcdFx0T2JqZWN0LmVudHJpZXModGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0pXG5cdFx0XHRcdFx0LmZvckVhY2goKFtub3ZlbElELCBkYXRhXSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX2EgPSBbXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5pbml0X2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5lcHViX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5zZWdtZW50X2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKHYgPT4gdiAmJiB2ID4gMClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKCFfYS5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlID0gdGltZXN0YW1wXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlID0gX2Fcblx0XHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBNYXRoLm1pbihhLCBiKTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdHx8IHRpbWVzdGFtcFxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRpZiAodGltZXN0YW1wIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdGxldCBfbGlzdCA9IG5ldyBTZXQ8SU5vdmVsU3RhdENhY2hlTm92ZWw+KCk7XG5cblx0XHRcdGxldCB0b2RheSA9IHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF07XG5cblx0XHRcdGlmICh0b2RheS5lcHViKVxuXHRcdFx0e1xuXHRcdFx0XHRhcnJheV91bmlxdWUodG9kYXkuZXB1Yiwge1xuXHRcdFx0XHRcdG92ZXJ3cml0ZTogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuZXB1Yi5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGNhY2hlU29ydENhbGxiYWNrKGFbMF0sIGJbMF0pXG5cdFx0XHRcdFx0XHR8fCBjYWNoZVNvcnRDYWxsYmFjayhhWzFdLCBiWzFdKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0b2RheS5lcHViX2NvdW50ID0gdG9kYXkuZXB1Yi5sZW5ndGggfCAwO1xuXG5cdFx0XHRcdGlmICghdG9kYXkuZXB1Yl9jb3VudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5lcHViO1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5lcHViX2NvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRvZGF5LmVwdWIuZm9yRWFjaCgodiwgaSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbm92ZWwgPSB0aGlzLm5vdmVsKHZbMF0sIHZbMV0pO1xuXG5cdFx0XHRcdFx0XHRfbGlzdC5hZGQobm92ZWwpO1xuXG5cdFx0XHRcdFx0XHR0b2RheS5lcHViW2ldWzJdID0gbm92ZWw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodG9kYXkuc2VnbWVudClcblx0XHRcdHtcblx0XHRcdFx0YXJyYXlfdW5pcXVlKHRvZGF5LnNlZ21lbnQsIHtcblx0XHRcdFx0XHRvdmVyd3JpdGU6IHRydWUsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LnNlZ21lbnQuc29ydChmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBjYWNoZVNvcnRDYWxsYmFjayhhWzBdLCBiWzBdKVxuXHRcdFx0XHRcdFx0fHwgY2FjaGVTb3J0Q2FsbGJhY2soYVsxXSwgYlsxXSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuc2VnbWVudF9jb3VudCA9IHRvZGF5LnNlZ21lbnQubGVuZ3RoIHwgMDtcblxuXHRcdFx0XHRpZiAoIXRvZGF5LnNlZ21lbnRfY291bnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuc2VnbWVudDtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuc2VnbWVudF9jb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0b2RheS5zZWdtZW50LmZvckVhY2goKHYsIGkpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5vdmVsID0gdGhpcy5ub3ZlbCh2WzBdLCB2WzFdKTtcblxuXHRcdFx0XHRcdFx0X2xpc3QuYWRkKG5vdmVsKTtcblxuXHRcdFx0XHRcdFx0dG9kYXkuc2VnbWVudFtpXVsyXSA9IG5vdmVsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCFPYmplY3Qua2V5cyh0b2RheSkubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRkZWxldGUgdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGJvb2wgPiAxIHx8IGJvb2wgPT0gRW51bUJlZm9yZVNhdmUuT1BUSU1JWkVfQU5EX1VQREFURSlcblx0XHRcdHtcblx0XHRcdFx0X2xpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfYSA9IFtcblx0XHRcdFx0XHRcdFx0ZGF0YS5pbml0X2RhdGUsXG5cdFx0XHRcdFx0XHRcdGRhdGEuZXB1Yl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRkYXRhLnNlZ21lbnRfZGF0ZSxcblx0XHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSxcblx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdC5maWx0ZXIodiA9PiB2ICYmIHYgPiAwKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGxldCBvbGQgPSBkYXRhLnVwZGF0ZV9kYXRlO1xuXG5cdFx0XHRcdFx0aWYgKCFfYS5sZW5ndGggfHwgdHJ1ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9kYXRlID0gdGltZXN0YW1wXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9kYXRlID0gX2Fcblx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBNYXRoLm1heChhLCBiKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0fHwgdGltZXN0YW1wXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKG9sZCAhPT0gZGF0YS51cGRhdGVfZGF0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9jb3VudCA9IChkYXRhLnVwZGF0ZV9jb3VudCB8IDApICsgMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoaXMuZGF0YS5tZXRhLnRpbWVzdGFtcCA9IGNyZWF0ZU1vbWVudCgpLnZhbHVlT2YoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kYXRhLm1ldGEudG9kYXlUaW1lc3RhbXAgPSB0aW1lc3RhbXA7XG5cdFx0fVxuXG5cdFx0bGV0IGtzID0gT2JqZWN0LmtleXModGhpcy5kYXRhLmhpc3RvcnkpO1xuXG5cdFx0aWYgKGtzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgaCA9IHRoaXMuZGF0YS5oaXN0b3J5O1xuXG5cdFx0XHRrcy5mb3JFYWNoKGZ1bmN0aW9uIChrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIU9iamVjdC5rZXlzKGhba10pLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSBoW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGtzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMuaGlzdG9yeV9tYXgpXG5cdFx0XHR7XG5cdFx0XHRcdGtzLnNvcnQoKS5zbGljZSgwLCAoMCAtIHRoaXMub3B0aW9ucy5oaXN0b3J5X2tlZXApKS5mb3JFYWNoKGsgPT4gZGVsZXRlIHRoaXMuZGF0YS5oaXN0b3J5W2tdKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHNvcnRPYmplY3QodGhpcy5kYXRhLCB7XG5cdFx0XHR1c2VTb3VyY2U6IHRydWUsXG5cdFx0XHRrZXlzOiBbXG5cdFx0XHRcdCdtZXRhJyxcblx0XHRcdFx0J2hpc3RvcnknLFxuXHRcdFx0XHQnbm92ZWxzJyxcblx0XHRcdFx0J21kY29uZicsXG5cdFx0XHRdIGFzIChrZXlvZiBJTm92ZWxTdGF0Q2FjaGUpW10sXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlsIfos4fmlpnlhLLlrZjoh7MgZmlsZVxuXHQgKlxuXHQgKiBAcGFyYW0gYm9vbCAtIOa4heeQhueJqeS7tuWkmumkmOizh+aWmVxuXHQgKi9cblx0cHVibGljIHNhdmUoYm9vbD86IGJvb2xlYW4gfCBudW1iZXIgfCBFbnVtQmVmb3JlU2F2ZSlcblx0e1xuXHRcdGlmICh0aGlzLm9wdGlvbnMucmVhZG9ubHkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBvcHRpb25zLnJlYWRvbmx5IGlzIHNldCwgY2FuJ3Qgbm90IHNhdmUgZmlsZWApXG5cdFx0fVxuXG5cdFx0Y29uc3QgZnMgPSB0cnlSZXF1aXJlRlMoKTtcblxuXHRcdGZzICYmIGZzLm91dHB1dEpTT05TeW5jKHRoaXMuZmlsZSwgdGhpcy50b0pTT04oYm9vbCB8fCB0cnVlKSwge1xuXHRcdFx0c3BhY2VzOiAyLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIHRpbWVzdGFtcFxuXHQgKi9cblx0Z2V0IHRpbWVzdGFtcCgpXG5cdHtcblx0XHRyZXR1cm4gdG9kYXlNb21lbnRUaW1lc3RhbXA7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHRpbWVzdGFtcCDnmoQgaGlzdG9yeSDos4fmlplcblx0ICovXG5cdGhpc3RvcnkodGltZXN0YW1wOiBudW1iZXIgfCBzdHJpbmcpXG5cdHtcblx0XHRpZiAodGltZXN0YW1wIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aJgOaciSBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeXMoKVxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5oaXN0b3J5KVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+WJjeS4gOasoeeahCBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeVByZXYoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGtzOiBzdHJpbmdbXTtcblxuXHRcdGlmICh0aW1lc3RhbXAgaW4gdGhpcy5kYXRhLmhpc3RvcnkpXG5cdFx0e1xuXHRcdFx0a3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cdFx0XHRrcy5wb3AoKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGtzID0gT2JqZWN0LmtleXModGhpcy5kYXRhLmhpc3RvcnkpO1xuXHRcdH1cblxuXHRcdGxldCBrID0ga3MucG9wKCk7XG5cblx0XHRpZiAoayBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3Rvcnlba107XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5VG9kYXkoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGRhdGEgPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdID0gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXSB8fCB7fTtcblxuXHRcdGRhdGEuZXB1Yl9jb3VudCA9IGRhdGEuZXB1Yl9jb3VudCB8IDA7XG5cdFx0ZGF0YS5lcHViID0gZGF0YS5lcHViIHx8IFtdO1xuXG5cdFx0ZGF0YS5zZWdtZW50X2NvdW50ID0gZGF0YS5zZWdtZW50X2NvdW50IHwgMDtcblx0XHRkYXRhLnNlZ21lbnQgPSBkYXRhLnNlZ21lbnQgfHwgW107XG5cblx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblx0fVxuXG5cdHN0YXRpYyBmaXhPcHRpb25zKG9wdGlvbnM/OiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zLCBleHRyYU9wdGlvbnM/OiBQYXJ0aWFsPElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM+KVxuXHR7XG5cdFx0b3B0aW9ucyA9IHtcblx0XHRcdGZpbGVfZ2l0OiB1bmRlZmluZWQsXG5cdFx0XHRmaWxlOiB1bmRlZmluZWQsXG5cdFx0XHQuLi4oZGVmYXVsdE9wdGlvbnMgYXMgSU5vdmVsU3RhdENhY2hlT3B0aW9ucyksXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0Li4uZXh0cmFPcHRpb25zLFxuXHRcdH07XG5cblx0XHRvcHRpb25zLmhpc3RvcnlfbWF4ID0gb3B0aW9ucy5oaXN0b3J5X21heCA+IDAgPyBvcHRpb25zLmhpc3RvcnlfbWF4IDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9tYXg7XG5cblx0XHRvcHRpb25zLmhpc3Rvcnlfa2VlcCA9IG9wdGlvbnMuaGlzdG9yeV9rZWVwID4gMCA/IG9wdGlvbnMuaGlzdG9yeV9rZWVwIDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9rZWVwO1xuXG5cdFx0b3B0aW9ucyA9IGJhc2VTb3J0T2JqZWN0KG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICog5bu656uLIE5vdmVsU3RhdENhY2hlIOeJqeS7tlxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zPzogSU5vdmVsU3RhdENhY2hlT3B0aW9ucylcblx0e1xuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRpZiAob3BlbmVkTWFwLmhhcyhvcHRpb25zKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gb3BlbmVkTWFwLmdldChvcHRpb25zKTtcblx0XHR9XG5cblx0XHRsZXQgb2JqID0gbmV3IHRoaXMob3B0aW9ucyk7XG5cblx0XHRvcGVuZWRNYXAuc2V0KG9wdGlvbnMsIG9iaik7XG5cblx0XHRyZXR1cm4gb2JqO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWFgeioseeUqOWFtuS7luaWueW8j+WPluW+lyBkYXRhIOS+huW7uueri+eJqeS7tlxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZUZyb21KU09OKGRhdGE6IElOb3ZlbFN0YXRDYWNoZSB8IEJ1ZmZlciB8IG9iamVjdCwgb3B0aW9ucz86IFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4pXG5cdHtcblx0XHRpZiAoQnVmZmVyLmlzQnVmZmVyKGRhdGEpKVxuXHRcdHtcblx0XHRcdGRhdGEgPSBKU09OLnBhcnNlKGRhdGEudG9TdHJpbmcoKSkgYXMgSU5vdmVsU3RhdENhY2hlO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zLCB7XG5cdFx0XHRyZWFkb25seTogKCFvcHRpb25zIHx8IG9wdGlvbnMucmVhZG9ubHkgPT0gbnVsbCkgPyB0cnVlIDogb3B0aW9ucy5yZWFkb25seSxcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGRhdGEsXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcy5jcmVhdGUob3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYm9vbCAtIOa4heeQhueJqeS7tuWkmumkmOizh+aWmVxuXHQgKi9cblx0dG9KU09OKGJvb2w/OiBib29sZWFuIHwgbnVtYmVyIHwgRW51bUJlZm9yZVNhdmUpXG5cdHtcblx0XHRpZiAoYm9vbClcblx0XHR7XG5cdFx0XHR0aGlzLl9iZWZvcmVTYXZlKGJvb2wpXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmRhdGE7XG5cdH1cblxufVxuXG5leHBvcnQgZW51bSBFbnVtQmVmb3JlU2F2ZVxue1xuXHROT05FID0gMCxcblx0T1BUSU1JWkUgPSAxLFxuXHRPUFRJTUlaRV9BTkRfVVBEQVRFID0gMixcbn1cblxuZXhwb3J0IGVudW0gRW51bUZpbHRlck5vdmVsVHlwZVxue1xuXHQvKipcblx0ICog5Y+W5b6X5omA5pyJ5bCP6Kqq55qE5pyA57WC54uA5oWLKOmgkOiorSlcblx0ICovXG5cdERFU1QgPSAweDAwMDAsXG5cdC8qKlxuXHQgKiDlj6rlj5blvpfljp/lp4vos4fmlplcblx0ICovXG5cdFNPVVJDRV9PTkxZID0gMHgwMDAxLFxuXHQvKipcblx0ICog5Y+q5Y+W5b6XIF9vdXQg5b6M6LOH5paZXG5cdCAqL1xuXHRPVVRQVVRfT05MWSA9IDB4MDAwMixcbn1cblxuTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucyA9IE5vdmVsU3RhdENhY2hlLmZpeE9wdGlvbnMuYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5Ob3ZlbFN0YXRDYWNoZS5jcmVhdGUgPSBOb3ZlbFN0YXRDYWNoZS5jcmVhdGUuYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5Ob3ZlbFN0YXRDYWNoZS5jcmVhdGVGcm9tSlNPTiA9IE5vdmVsU3RhdENhY2hlLmNyZWF0ZUZyb21KU09OLmJpbmQoTm92ZWxTdGF0Q2FjaGUpO1xuXG5jb25zdCB7IGNyZWF0ZSwgZml4T3B0aW9ucywgY3JlYXRlRnJvbUpTT04gfSA9IE5vdmVsU3RhdENhY2hlO1xuZXhwb3J0IHsgY3JlYXRlLCBmaXhPcHRpb25zLCBjcmVhdGVGcm9tSlNPTiB9XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU3RhdENhY2hlLmNyZWF0ZVxuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUoZXhwb3J0cyk7XG4iXX0=