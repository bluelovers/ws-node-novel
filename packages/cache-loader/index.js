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
            let _m = pathMain.match(/^(.+?)(_out)?$/);
            let is_out = !!_m[2];
            let pathMain_base = _m[1];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgscUNBTW9CO0FBVVgsdUJBWlIsbUJBQVksQ0FZUTtBQU5yQixrQ0FBa0M7QUFDbEMsMkRBQWtEO0FBQ2xELGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBbUQsQ0FBQztBQXNNakYsTUFBTSxjQUFjLEdBQThDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFL0UsV0FBVyxFQUFFLEVBQUU7SUFDZixZQUFZLEVBQUUsQ0FBQztDQUVmLENBQUMsQ0FBQztBQUVIOzs7OztHQUtHO0FBQ0gsTUFBYSxjQUFjO0lBZ0IxQjs7OztPQUlHO0lBQ0gsWUFBWSxPQUErQjtRQVYzQyxTQUFJLEdBQW9CLElBQUksQ0FBQztRQUc3QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBU3ZCLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxHQUFZLEtBQUssQ0FBQztRQUUxQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQ2hCO1lBQ0MsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUN6RjtnQkFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNqRDtZQUNDLE1BQU0sSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNqRDthQUNJ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O0FBQUUsZ0NBQVU7QUFBRSx3Q0FBYztBQUUzQyxrQkFBZSxjQUFjLENBQUMsTUFBTSxDQUFBO0FBQ3BDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS8xLzYvMDA2LlxuICovXG5cbmltcG9ydCB0b2RheU1vbWVudFRpbWVzdGFtcCwge1xuXHRiYXNlU29ydE9iamVjdCxcblx0Y2FjaGVTb3J0Q2FsbGJhY2ssXG5cdGZyZWV6ZVByb3BlcnR5LFxuXHRjcmVhdGVNb21lbnQsXG5cdG5hdHVyYWxDb21wYXJlLCB0cnlSZXF1aXJlRlMsXG59IGZyb20gJy4vbGliL3V0aWwnO1xuaW1wb3J0IHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuLy9pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBzb3J0T2JqZWN0ID0gcmVxdWlyZSgnc29ydC1vYmplY3Qta2V5czInKTtcblxuY29uc3Qgb3BlbmVkTWFwID0gbmV3IFdlYWtNYXA8UGFydGlhbDxJTm92ZWxTdGF0Q2FjaGVPcHRpb25zPiwgTm92ZWxTdGF0Q2FjaGU+KCk7XG5cbmV4cG9ydCB7IGNyZWF0ZU1vbWVudCB9XG5cbi8qKlxuICog5omA5pyJIHRpbWVzdGFtcCDngrogVW5peCB0aW1lc3RhbXAgaW4gbWlsbGlzZWNvbmRzIOeCuiB1dGMgKzhcbiAqIHBhdGhNYWluIOeCuiDkuLvos4flpL7lkI3nqLFcbiAqIG5vdmVsSUQg54K6IOWwj+iqquizh+aWmeWkvuWQjeeosVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZVxue1xuXG5cdG1ldGE/OiB7XG5cdFx0dG9kYXlUaW1lc3RhbXA/OiBudW1iZXIsXG5cdFx0dGltZXN0YW1wPzogbnVtYmVyLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiDlsI/oqqrnt6nlrZjni4DmhYtcblx0ICovXG5cdG5vdmVsczoge1xuXHRcdFtwYXRoTWFpbjogc3RyaW5nXToge1xuXHRcdFx0W25vdmVsSUQ6IHN0cmluZ106IElOb3ZlbFN0YXRDYWNoZU5vdmVsLFxuXHRcdH0sXG5cdH0sXG5cblx0LyoqXG5cdCAqIOatt+WPsue0gOmMhFxuXHQgKi9cblx0aGlzdG9yeToge1xuXHRcdFt0aW1lc3RhbXA6IHN0cmluZ106IElOb3ZlbFN0YXRDYWNoZUhpc3RvcnksXG5cdFx0W3RpbWVzdGFtcDogbnVtYmVyXTogSU5vdmVsU3RhdENhY2hlSGlzdG9yeSxcblx0fSxcblxuXHQvKipcblx0ICog6YCP6YGOIG5vZGUtbm92ZWwtY29uZiDop6PmnpDpgY7nmoQgTUVUQSDos4fmlpkgKFJFQURNRS5tZClcblx0ICovXG5cdG1kY29uZjoge1xuXHRcdFtwYXRoTWFpbjogc3RyaW5nXToge1xuXHRcdFx0W25vdmVsSUQ6IHN0cmluZ106IElNZGNvbmZNZXRhLFxuXHRcdH0sXG5cdH0sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU3RhdENhY2hlTm92ZWxcbntcblx0LyoqXG5cdCAqIHNlZ21lbnQg5pu05paw5pmC6ZaTXG5cdCAqL1xuXHRzZWdtZW50X2RhdGU/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiBlcHViIOabtOaWsOaZgumWk1xuXHQgKi9cblx0ZXB1Yl9kYXRlPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDliJ3lp4vljJbmmYLplpNcblx0ICovXG5cdGluaXRfZGF0ZT86IG51bWJlcixcblxuXHQvKipcblx0ICog57i956ugL+WNt+aVuOmHj1xuXHQgKi9cblx0dm9sdW1lPzogbnVtYmVyLFxuXHQvKipcblx0ICog57i96Kmx5pW4XG5cdCAqL1xuXHRjaGFwdGVyPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDkuIrmrKHnmoTnuL3nq6Av5Y235pW46YePXG5cdCAqL1xuXHR2b2x1bWVfb2xkPzogbnVtYmVyLFxuXHQvKipcblx0ICog5LiK5qyh55qE57i96Kmx5pW4XG5cdCAqL1xuXHRjaGFwdGVyX29sZD86IG51bWJlcixcblxuXHQvKipcblx0ICogc2VnbWVudCDororli5Xmlbjph49cblx0ICovXG5cdHNlZ21lbnQ/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDkuIrmrKHnmoQgc2VnbWVudCDororli5Xmlbjph49cblx0ICovXG5cdHNlZ21lbnRfb2xkPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDlsI/oqqrni4DmhYsgZmxhZyDmoLnmk5ogcmVhZG1lLm1kIOWFp+ioreWumlxuXHQgKi9cblx0bm92ZWxfc3RhdHVzPzogRW51bU5vdmVsU3RhdHVzLFxuXG5cdC8qKlxuXHQgKiDmnIDlvozororli5XmmYLplpNcblx0ICovXG5cdHVwZGF0ZV9kYXRlPzogbnVtYmVyO1xuXHQvKipcblx0ICog57SA6YyE6K6K5YuV5qyh5pW4XG5cdCAqL1xuXHR1cGRhdGVfY291bnQ/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIGVwdWIgZmlsZW5hbWVcblx0ICovXG5cdGVwdWJfYmFzZW5hbWU/OiBzdHJpbmcsXG5cdHR4dF9iYXNlbmFtZT86IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVIaXN0b3J5XG57XG5cdC8qKlxuXHQgKiDmnKzmrKHoqJjpjITlhafnmoQgZXB1YiDnuL3mlbhcblx0ICovXG5cdGVwdWJfY291bnQ/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDmnKzmrKHoqJjpjITlhafnmoQgZXB1YlxuXHQgKi9cblx0ZXB1Yj86IEFycmF5PFtzdHJpbmcsIHN0cmluZywgSU5vdmVsU3RhdENhY2hlTm92ZWw/XT4sXG5cdHNlZ21lbnRfY291bnQ/OiBudW1iZXIsXG5cdHNlZ21lbnQ/OiBBcnJheTxbc3RyaW5nLCBzdHJpbmcsIElOb3ZlbFN0YXRDYWNoZU5vdmVsP10+LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZU9wdGlvbnNcbntcblx0LyoqXG5cdCAqIOiugOWvq+e3qeWtmOeahOebruaomSBqc29uIOi3r+W+kVxuXHQgKi9cblx0ZmlsZTogc3RyaW5nLFxuXHQvKipcblx0ICog55W2IGZpbGUg5LiN5a2Y5Zyo5pmC5ZiX6Kmm6K6A5Y+W5q2k5qqU5qGIXG5cdCAqL1xuXHRmaWxlX2dpdD86IHN0cmluZyxcblxuXHQvKipcblx0ICog56aB5q2i5bCH6LOH5paZ5a+r5Zue5qqU5qGIXG5cdCAqL1xuXHRyZWFkb25seT86IGJvb2xlYW4sXG5cblx0aGlzdG9yeV9tYXg/OiBudW1iZXIsXG5cdGhpc3Rvcnlfa2VlcD86IG51bWJlcixcblxuXHQvKipcblx0ICogb3B0aW9ucy5yZWFkb25seSAmJiBvcHRpb25zLmRhdGEg5b+F6aCI5ZCM5pmC5ZWf55SoXG5cdCAqL1xuXHRkYXRhPzogSU5vdmVsU3RhdENhY2hlLFxufVxuXG4vKipcbiAqIOWPluW+l+Wwj+iqqueahOacgOe1gueLgOaFiyjpoJDoqK3mmYIpXG4gKiDkvovlpoIg55W2IOWQjOaZguWtmOWcqCB4eHgg6IiHIHh4eF9vdXQg5pmC77yM5Y+q5pyD5Zue5YKzIHh4eF9vdXRcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyTm92ZWxEYXRhXG57XG5cdC8qKlxuXHQgKiDlr6bpmpvkuIrnmoQgcGF0aE1haW5cblx0ICovXG5cdHBhdGhNYWluOiBzdHJpbmcsXG5cdC8qKlxuXHQgKiDmspLmnIkgb3V0IOWJjeeahCBwYXRoTWFpbiDot6/lvpFcblx0ICovXG5cdHBhdGhNYWluX2Jhc2U6IHN0cmluZyxcblx0bm92ZWxJRDogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiDop6PmnpAgUkVBRE1FLm1kIOW+jOeahOizh+aWmVxuXHQgKi9cblx0bWRjb25mOiBJTWRjb25mTWV0YSxcblx0LyoqXG5cdCAqIOWQiOS9tSBvdXQg5YmN6IiHIG91dCDlvoznmoTnt6nlrZjos4fmlplcblx0ICovXG5cdGNhY2hlOiBJTm92ZWxTdGF0Q2FjaGVOb3ZlbCxcblxuXHQvKipcblx0ICog5q2k5bCP6Kqq5pivIG91dCDlvozlsI/oqqpcblx0ICovXG5cdGlzX291dDogYm9vbGVhbixcblx0LyoqXG5cdCAqIOaYr+WQpuWtmOWcqOatpOWwj+iqqiBvdXQg5YmN55qE6LOH5paZXG5cdCAqIOWkp+mDqOWIhueLgOazgeS4i+atpOWAvOmDveaYr+eCuiB0cnVlIOS9huWwkemDqOWIhuaDheazgeS4i+acg+acieWFtuS7luWAvFxuXHQgKlxuXHQgKiDkvovlpoJcblx0ICogY20g5LiL55qE5aSn5aSa6YO95rKS5pyJ5a2Y5ZyoIG91dCDlvozos4fmlpkg5omA5Lul5pyD5Zue5YKzIHVuZGVmaW5lZFxuXHQgKiB6LmFiYW5kb24g5LiL5aSn5aSa6YO95Y+q5a2Y5ZyoIG91dCDlvozos4fmlpkg5omA5Lul5pyD5Zue5YKzIGZhbHNlXG5cdCAqL1xuXHRiYXNlX2V4aXN0czogYm9vbGVhbixcbn1cblxuLyoqXG4gKiDngrrkuobntbHkuIDoiIfmnproiInmlrnkvr8gcGF0aE1haW4g5pyD57Wx5LiA54K6IOWfuuekjuWQjSjkuZ/lsLHmmK/mspLmnIkgX291dClcbiAqIOWvpumam+S4iueahCBwYXRoTWFpbiDoq4vnlLEgSUZpbHRlck5vdmVsRGF0YSDlhaflj5blvpdcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyTm92ZWxcbntcblx0W3BhdGhNYWluOiBzdHJpbmddOiB7XG5cdFx0W25vdmVsSUQ6IHN0cmluZ106IElGaWx0ZXJOb3ZlbERhdGEsXG5cdH0sXG59XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zOiBSZWFkb25seTxQYXJ0aWFsPElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM+PiA9IE9iamVjdC5mcmVlemUoe1xuXG5cdGhpc3RvcnlfbWF4OiAxNCxcblx0aGlzdG9yeV9rZWVwOiA3LFxuXG59KTtcblxuLyoqXG4gKiDpgI/pgY7op6PmnpAgbm92ZWwtc3RhdC5qc29uIOS+huWPluW+l+Wwj+iqqueLgOaFi1xuICog5Lmf5Zug5q2k5aaC5p6cIG5vdmVsLXN0YXQuanNvbiDlhafmspLmnInntIDpjITmiJbogIXmspLmnInmm7TmlrDnmoTlsLHmnIPliKTmlrfkuI3nsr7mupZcbiAqXG4gKiBAZXhhbXBsZSBOb3ZlbFN0YXRDYWNoZS5jcmVhdGUoKVxuICovXG5leHBvcnQgY2xhc3MgTm92ZWxTdGF0Q2FjaGVcbntcblx0LyoqXG5cdCAqIOiugOWvq+e3qeWtmOeahOebruaomSBqc29uIOi3r+W+kVxuXHQgKi9cblx0ZmlsZTogc3RyaW5nO1xuXHQvKipcblx0ICog55W2IGZpbGUg5LiN5a2Y5Zyo5pmC5ZiX6Kmm6K6A5Y+W5q2k5qqU5qGIXG5cdCAqL1xuXHRmaWxlX2dpdDogc3RyaW5nO1xuXG5cdGRhdGE6IElOb3ZlbFN0YXRDYWNoZSA9IG51bGw7XG5cdG9wdGlvbnM6IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM7XG5cblx0aW5pdGVkOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIOS9v+eUqCBOb3ZlbFN0YXRDYWNoZS5jcmVhdGUoKSDku6Pmm79cblx0ICpcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnM6IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMpXG5cdHtcblx0XHRvcHRpb25zID0gTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdGxldCBfY2hrOiBib29sZWFuID0gZmFsc2U7XG5cblx0XHRpZiAob3B0aW9ucy5kYXRhKVxuXHRcdHtcblx0XHRcdGlmICghKG9wdGlvbnMuZGF0YSAmJiBvcHRpb25zLmRhdGEuaGlzdG9yeSAmJiBvcHRpb25zLmRhdGEubm92ZWxzICYmIG9wdGlvbnMuZGF0YS5tZGNvbmYpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBvcHRpb25zLmRhdGEgaXMgbm90IGFsbG93IGRhdGFgKTtcblx0XHRcdH1cblxuXHRcdFx0X2NoayA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCFvcHRpb25zLmZpbGUgJiYgKCFvcHRpb25zLnJlYWRvbmx5IHx8ICFfY2hrKSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihgb3B0aW9ucy5maWxlIGlzIHJlcXVpcmVkYCk7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKCFfY2hrKVxuXHRcdHtcblx0XHRcdGRlbGV0ZSBvcHRpb25zLmRhdGE7XG5cdFx0fVxuXG5cdFx0dGhpcy5faW5pdChvcHRpb25zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaW5pdChvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0aWYgKG9wdGlvbnMuZGF0YSlcblx0XHR7XG5cdFx0XHR0aGlzLmRhdGEgPSBvcHRpb25zLmRhdGE7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIG9wdGlvbnMuZGF0YTtcblxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0XHR0aGlzLmZpbGUgPSB0aGlzLm9wdGlvbnMuZmlsZTtcblx0XHR0aGlzLmZpbGVfZ2l0ID0gdGhpcy5vcHRpb25zLmZpbGVfZ2l0O1xuXG5cdFx0ZnJlZXplUHJvcGVydHkodGhpcywgJ29wdGlvbnMnLCB0cnVlKTtcblx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnZmlsZScpO1xuXHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdmaWxlX2dpdCcpO1xuXG5cdFx0dGhpcy5vcGVuKCk7XG5cdH1cblxuXHQvKipcblx0ICog5qqi5p+lIGZpbGUg5piv5ZCm5a2Y5ZyoXG5cdCAqL1xuXHRleGlzdHMoKVxuXHR7XG5cdFx0Y29uc3QgZnMgPSB0cnlSZXF1aXJlRlMoKTtcblxuXHRcdHJldHVybiB0aGlzLmZpbGUgJiYgZnMgJiYgZnMucGF0aEV4aXN0c1N5bmModGhpcy5maWxlKVxuXHR9XG5cblx0cHJvdGVjdGVkIG9wZW4oKVxuXHR7XG5cdFx0aWYgKCF0aGlzLmluaXRlZClcblx0XHR7XG5cdFx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cblx0XHRcdGNvbnN0IGZzID0gdHJ5UmVxdWlyZUZTKCk7XG5cblx0XHRcdGlmICh0aGlzLmRhdGEpXG5cdFx0XHR7XG5cdFx0XHRcdC8vXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChmcyAmJiB0aGlzLmV4aXN0cygpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmRhdGEgPSBmcy5yZWFkSlNPTlN5bmModGhpcy5maWxlKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGZzICYmIHRoaXMuZmlsZV9naXQgJiYgZnMucGF0aEV4aXN0c1N5bmModGhpcy5maWxlX2dpdCkpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuZGF0YSA9IGZzLnJlYWRKU09OU3luYyh0aGlzLmZpbGVfZ2l0KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0dGhpcy5kYXRhID0gdGhpcy5kYXRhIHx8IHt9O1xuXG5cdFx0XHR0aGlzLmRhdGEuaGlzdG9yeSA9IHRoaXMuZGF0YS5oaXN0b3J5IHx8IHt9O1xuXHRcdFx0dGhpcy5kYXRhLm5vdmVscyA9IHRoaXMuZGF0YS5ub3ZlbHMgfHwge307XG5cdFx0XHR0aGlzLmRhdGEubWRjb25mID0gdGhpcy5kYXRhLm1kY29uZiB8fCB7fTtcblx0XHRcdHRoaXMuZGF0YS5tZXRhID0gdGhpcy5kYXRhLm1ldGEgfHwge307XG5cblx0XHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdpbml0ZWQnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmiYDmnInlnKggZGF0YS5ub3ZlbHMgLyBkYXRhLm1kY29uZiDlhaflrZjlnKjnmoQgcGF0aE1haW5cblx0ICovXG5cdHBhdGhNYWluTGlzdCgpXG5cdHtcblx0XHRyZXR1cm4gYXJyYXlfdW5pcXVlKE9iamVjdC5rZXlzKHRoaXMuZGF0YS5ub3ZlbHMpXG5cdFx0XHQuY29uY2F0KE9iamVjdC5rZXlzKHRoaXMuZGF0YS5tZGNvbmYpKSlcblx0XHRcdC5zb3J0KClcblx0XHRcdDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmiYDmnInlsI/oqqrnmoTmnIDntYLni4DmhYso6aCQ6Kit5pmCKVxuXHQgKiDkvovlpoIg55W2IOWQjOaZguWtmOWcqCB4eHgg6IiHIHh4eF9vdXQg5pmC77yM5Y+q5pyD5Zue5YKzIHh4eF9vdXRcblx0ICovXG5cdGZpbHRlck5vdmVsKHR5cGU6IEVudW1GaWx0ZXJOb3ZlbFR5cGUgPSBFbnVtRmlsdGVyTm92ZWxUeXBlLkRFU1QpXG5cdHtcblx0XHRsZXQga3MgPSB0aGlzLnBhdGhNYWluTGlzdCgpO1xuXHRcdGxldCBzZWxmID0gdGhpcztcblxuXHRcdGlmICh0eXBlICYgRW51bUZpbHRlck5vdmVsVHlwZS5TT1VSQ0VfT05MWSlcblx0XHR7XG5cdFx0XHRrcyA9IGtzLmZpbHRlcihwYXRoTWFpbiA9PiAhL19vdXQkLy50ZXN0KHBhdGhNYWluKSlcblx0XHR9XG5cdFx0ZWxzZSBpZiAodHlwZSAmIEVudW1GaWx0ZXJOb3ZlbFR5cGUuT1VUUFVUX09OTFkpXG5cdFx0e1xuXHRcdFx0a3MgPSBrcy5maWx0ZXIocGF0aE1haW4gPT4gL19vdXQkLy50ZXN0KHBhdGhNYWluKSlcblx0XHR9XG5cblx0XHRyZXR1cm4ga3Ncblx0XHRcdC5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoYS5yZXBsYWNlKC9fb3V0JC8sICcnKSA9PT0gYi5yZXBsYWNlKC9fb3V0JC8sICcnKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmICgvX291dCQvLnRlc3QoYSkpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIG5hdHVyYWxDb21wYXJlKGEsIGIpO1xuXHRcdFx0fSlcblx0XHRcdC5yZWR1Y2UoKGxzLCBwYXRoTWFpbikgPT5cblx0XHRcdHtcblxuXHRcdFx0XHRsZXQgX20gPSBwYXRoTWFpbi5tYXRjaCgvXiguKz8pKF9vdXQpPyQvKTtcblxuXHRcdFx0XHRsZXQgaXNfb3V0ID0gISFfbVsyXTtcblx0XHRcdFx0bGV0IHBhdGhNYWluX2Jhc2UgPSBfbVsxXTtcblxuXHRcdFx0XHRsc1twYXRoTWFpbl9iYXNlXSA9IGxzW3BhdGhNYWluX2Jhc2VdIHx8IHt9O1xuXG5cdFx0XHRcdE9iamVjdC5lbnRyaWVzKHNlbGYuX21kY29uZl9nZXRfbWFpbihwYXRoTWFpbikpXG5cdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKFtub3ZlbElELCBtZGNvbmZdKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBjYWNoZSA9IHtcblx0XHRcdFx0XHRcdFx0Li4uc2VsZi5ub3ZlbChwYXRoTWFpbiwgbm92ZWxJRCksXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRsZXQgYmFzZV9leGlzdHM6IGJvb2xlYW47XG5cblx0XHRcdFx0XHRcdGlmIChpc19vdXQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCBfc3JjID0gc2VsZi5ub3ZlbEV4aXN0cyhwYXRoTWFpbl9iYXNlLCBub3ZlbElEKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoX3NyYylcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdChbXG5cdFx0XHRcdFx0XHRcdFx0XHQnc2VnbWVudCcsXG5cdFx0XHRcdFx0XHRcdFx0XHQnc2VnbWVudF9kYXRlJyxcblx0XHRcdFx0XHRcdFx0XHRcdCdzZWdtZW50X29sZCcsXG5cdFx0XHRcdFx0XHRcdFx0XSBhcyAoa2V5b2YgSU5vdmVsU3RhdENhY2hlTm92ZWwpW10pXG5cdFx0XHRcdFx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoa2V5KVxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoX3NyY1trZXldICE9IG51bGwpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjYWNoZVtrZXldID0gX3NyY1trZXldXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0YmFzZV9leGlzdHMgPSAhIV9zcmM7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxzW3BhdGhNYWluX2Jhc2VdW25vdmVsSURdID0ge1xuXHRcdFx0XHRcdFx0XHRwYXRoTWFpbixcblx0XHRcdFx0XHRcdFx0cGF0aE1haW5fYmFzZSxcblx0XHRcdFx0XHRcdFx0bm92ZWxJRCxcblxuXHRcdFx0XHRcdFx0XHRtZGNvbmYsXG5cdFx0XHRcdFx0XHRcdGNhY2hlLFxuXG5cdFx0XHRcdFx0XHRcdGlzX291dCxcblx0XHRcdFx0XHRcdFx0YmFzZV9leGlzdHMsXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4gbHM7XG5cdFx0XHR9LCB7fSBhcyBJRmlsdGVyTm92ZWwpXG5cdH1cblxuXHQvKipcblx0ICogKOiri+Wwj+W/g+S9v+eUqCkg56e76Zmk5oyH5a6aIHBhdGhNYWluICYgbm92ZWxJRFxuXHQgKi9cblx0cmVtb3ZlKHBhdGhNYWluOiBzdHJpbmcsIG5vdmVsSUQ6IHN0cmluZylcblx0e1xuXHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0aWYgKHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dKVxuXHRcdHtcblx0XHRcdGJvb2wgPSBib29sIHx8ICEhdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF07XG5cblx0XHRcdGRlbGV0ZSB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSlcblx0XHR7XG5cdFx0XHRib29sID0gYm9vbCB8fCAhIXRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dW25vdmVsSURdO1xuXG5cdFx0XHRkZWxldGUgdGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl1bbm92ZWxJRF1cblx0XHR9XG5cblx0XHRyZXR1cm4gYm9vbDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmjIflrpogcGF0aE1haW4g55qEIG5vdmVsIOeLgOaFi+mbhuWQiFxuXHQgKi9cblx0cGF0aE1haW4ocGF0aE1haW46IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXSA9IHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dIHx8IHt9O1xuXHR9XG5cblx0bm92ZWxFeGlzdHMocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nKTogSU5vdmVsU3RhdENhY2hlTm92ZWxcblx0e1xuXHRcdGlmICh0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVxuXHRcdFx0JiYgdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF1cblx0XHRcdCYmIE9iamVjdC5rZXlzKHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdKS5sZW5ndGhcblx0XHRcdCYmIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmjIflrpogcGF0aE1haW4gbm92ZWxJRCDnmoQgbm92ZWwg54uA5oWL57ep5a2YXG5cdCAqL1xuXHRub3ZlbChwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcpXG5cdHtcblx0XHR0aGlzLnBhdGhNYWluKHBhdGhNYWluKTtcblxuXHRcdHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdID0gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF0gfHwge307XG5cblx0XHRyZXR1cm4gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF07XG5cdH1cblxuXHRwcm90ZWN0ZWQgX21kY29uZl9nZXRfbWFpbihwYXRoTWFpbjogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dIHx8IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aMh+WumiBwYXRoTWFpbiBub3ZlbElEIOeahCBtZGNvbmYg6LOH5paZXG5cdCAqL1xuXHRtZGNvbmZfZ2V0KHBhdGhNYWluOiBzdHJpbmcsIG5vdmVsSUQ6IHN0cmluZyk6IElNZGNvbmZNZXRhXG5cdHtcblx0XHRsZXQgX2RhdGEgPSB0aGlzLl9tZGNvbmZfZ2V0X21haW4ocGF0aE1haW4pO1xuXG5cdFx0cmV0dXJuIF9kYXRhW25vdmVsSURdO1xuXHR9XG5cblx0LyoqXG5cdCAqIOioreWumuaMh+WumiBwYXRoTWFpbiBub3ZlbElEIOeahCBtZGNvbmYg6LOH5paZXG5cdCAqL1xuXHRtZGNvbmZfc2V0KHBhdGhNYWluOiBzdHJpbmcsIG5vdmVsSUQ6IHN0cmluZywgbWV0YTogSU1kY29uZk1ldGEpXG5cdHtcblx0XHR0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSA9IHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dIHx8IHt9O1xuXG5cdFx0dGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl1bbm92ZWxJRF0gPSBtZXRhO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdF9iZWZvcmVTYXZlKGJvb2w/OiBib29sZWFuIHwgbnVtYmVyKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0T2JqZWN0LmVudHJpZXModGhpcy5kYXRhLm5vdmVscylcblx0XHRcdC5mb3JFYWNoKChbcGF0aE1haW4sIGRhdGFdLCBpKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRPYmplY3QuZW50cmllcyh0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXSlcblx0XHRcdFx0XHQuZm9yRWFjaCgoW25vdmVsSUQsIGRhdGFdKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBfYSA9IFtcblx0XHRcdFx0XHRcdFx0XHRkYXRhLmluaXRfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRkYXRhLmVwdWJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRkYXRhLnNlZ21lbnRfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9kYXRlLFxuXHRcdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHRcdC5maWx0ZXIodiA9PiB2ICYmIHYgPiAwKVxuXHRcdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0XHRpZiAoIV9hLmxlbmd0aClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5pbml0X2RhdGUgPSB0aW1lc3RhbXBcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0ZGF0YS5pbml0X2RhdGUgPSBfYVxuXHRcdFx0XHRcdFx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIE1hdGgubWluKGEsIGIpO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0fHwgdGltZXN0YW1wXG5cdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdDtcblxuXHRcdGlmICh0aW1lc3RhbXAgaW4gdGhpcy5kYXRhLmhpc3RvcnkpXG5cdFx0e1xuXHRcdFx0bGV0IF9saXN0ID0gbmV3IFNldDxJTm92ZWxTdGF0Q2FjaGVOb3ZlbD4oKTtcblxuXHRcdFx0bGV0IHRvZGF5ID0gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblxuXHRcdFx0aWYgKHRvZGF5LmVwdWIpXG5cdFx0XHR7XG5cdFx0XHRcdGFycmF5X3VuaXF1ZSh0b2RheS5lcHViLCB7XG5cdFx0XHRcdFx0b3ZlcndyaXRlOiB0cnVlLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0b2RheS5lcHViLnNvcnQoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gY2FjaGVTb3J0Q2FsbGJhY2soYVswXSwgYlswXSlcblx0XHRcdFx0XHRcdHx8IGNhY2hlU29ydENhbGxiYWNrKGFbMV0sIGJbMV0pXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LmVwdWJfY291bnQgPSB0b2RheS5lcHViLmxlbmd0aCB8IDA7XG5cblx0XHRcdFx0aWYgKCF0b2RheS5lcHViX2NvdW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGVsZXRlIHRvZGF5LmVwdWI7XG5cdFx0XHRcdFx0ZGVsZXRlIHRvZGF5LmVwdWJfY291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG9kYXkuZXB1Yi5mb3JFYWNoKCh2LCBpKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBub3ZlbCA9IHRoaXMubm92ZWwodlswXSwgdlsxXSk7XG5cblx0XHRcdFx0XHRcdF9saXN0LmFkZChub3ZlbCk7XG5cblx0XHRcdFx0XHRcdHRvZGF5LmVwdWJbaV1bMl0gPSBub3ZlbDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0b2RheS5zZWdtZW50KVxuXHRcdFx0e1xuXHRcdFx0XHRhcnJheV91bmlxdWUodG9kYXkuc2VnbWVudCwge1xuXHRcdFx0XHRcdG92ZXJ3cml0ZTogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuc2VnbWVudC5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGNhY2hlU29ydENhbGxiYWNrKGFbMF0sIGJbMF0pXG5cdFx0XHRcdFx0XHR8fCBjYWNoZVNvcnRDYWxsYmFjayhhWzFdLCBiWzFdKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0b2RheS5zZWdtZW50X2NvdW50ID0gdG9kYXkuc2VnbWVudC5sZW5ndGggfCAwO1xuXG5cdFx0XHRcdGlmICghdG9kYXkuc2VnbWVudF9jb3VudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5zZWdtZW50O1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5zZWdtZW50X2NvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRvZGF5LnNlZ21lbnQuZm9yRWFjaCgodiwgaSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbm92ZWwgPSB0aGlzLm5vdmVsKHZbMF0sIHZbMV0pO1xuXG5cdFx0XHRcdFx0XHRfbGlzdC5hZGQobm92ZWwpO1xuXG5cdFx0XHRcdFx0XHR0b2RheS5zZWdtZW50W2ldWzJdID0gbm92ZWw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIU9iamVjdC5rZXlzKHRvZGF5KS5sZW5ndGgpXG5cdFx0XHR7XG5cdFx0XHRcdGRlbGV0ZSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoYm9vbCA+IDEgfHwgYm9vbCA9PSBFbnVtQmVmb3JlU2F2ZS5PUFRJTUlaRV9BTkRfVVBEQVRFKVxuXHRcdFx0e1xuXHRcdFx0XHRfbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IF9hID0gW1xuXHRcdFx0XHRcdFx0XHRkYXRhLmluaXRfZGF0ZSxcblx0XHRcdFx0XHRcdFx0ZGF0YS5lcHViX2RhdGUsXG5cdFx0XHRcdFx0XHRcdGRhdGEuc2VnbWVudF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9kYXRlLFxuXHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0LmZpbHRlcih2ID0+IHYgJiYgdiA+IDApXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0bGV0IG9sZCA9IGRhdGEudXBkYXRlX2RhdGU7XG5cblx0XHRcdFx0XHRpZiAoIV9hLmxlbmd0aCB8fCB0cnVlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUgPSB0aW1lc3RhbXBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUgPSBfYVxuXHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIE1hdGgubWF4KGEsIGIpO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHR8fCB0aW1lc3RhbXBcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAob2xkICE9PSBkYXRhLnVwZGF0ZV9kYXRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2NvdW50ID0gKGRhdGEudXBkYXRlX2NvdW50IHwgMCkgKyAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhpcy5kYXRhLm1ldGEudGltZXN0YW1wID0gY3JlYXRlTW9tZW50KCkudmFsdWVPZigpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmRhdGEubWV0YS50b2RheVRpbWVzdGFtcCA9IHRpbWVzdGFtcDtcblx0XHR9XG5cblx0XHRsZXQga3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cblx0XHRpZiAoa3MubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBoID0gdGhpcy5kYXRhLmhpc3Rvcnk7XG5cblx0XHRcdGtzLmZvckVhY2goZnVuY3Rpb24gKGspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghT2JqZWN0LmtleXMoaFtrXSkubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGVsZXRlIGhba107XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoa3MubGVuZ3RoID49IHRoaXMub3B0aW9ucy5oaXN0b3J5X21heClcblx0XHRcdHtcblx0XHRcdFx0a3Muc29ydCgpLnNsaWNlKDAsICgwIC0gdGhpcy5vcHRpb25zLmhpc3Rvcnlfa2VlcCkpLmZvckVhY2goayA9PiBkZWxldGUgdGhpcy5kYXRhLmhpc3Rvcnlba10pXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c29ydE9iamVjdCh0aGlzLmRhdGEsIHtcblx0XHRcdHVzZVNvdXJjZTogdHJ1ZSxcblx0XHRcdGtleXM6IFtcblx0XHRcdFx0J21ldGEnLFxuXHRcdFx0XHQnaGlzdG9yeScsXG5cdFx0XHRcdCdub3ZlbHMnLFxuXHRcdFx0XHQnbWRjb25mJyxcblx0XHRcdF0gYXMgKGtleW9mIElOb3ZlbFN0YXRDYWNoZSlbXSxcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWwh+izh+aWmeWEsuWtmOiHsyBmaWxlXG5cdCAqXG5cdCAqIEBwYXJhbSBib29sIC0g5riF55CG54mp5Lu25aSa6aSY6LOH5paZXG5cdCAqL1xuXHRwdWJsaWMgc2F2ZShib29sPzogYm9vbGVhbiB8IG51bWJlciB8IEVudW1CZWZvcmVTYXZlKVxuXHR7XG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZWFkb25seSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYG9wdGlvbnMucmVhZG9ubHkgaXMgc2V0LCBjYW4ndCBub3Qgc2F2ZSBmaWxlYClcblx0XHR9XG5cblx0XHRjb25zdCBmcyA9IHRyeVJlcXVpcmVGUygpO1xuXG5cdFx0ZnMgJiYgZnMub3V0cHV0SlNPTlN5bmModGhpcy5maWxlLCB0aGlzLnRvSlNPTihib29sIHx8IHRydWUpLCB7XG5cdFx0XHRzcGFjZXM6IDIsXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfku4rlpKnnmoQgdGltZXN0YW1wXG5cdCAqL1xuXHRnZXQgdGltZXN0YW1wKClcblx0e1xuXHRcdHJldHVybiB0b2RheU1vbWVudFRpbWVzdGFtcDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmjIflrpogdGltZXN0YW1wIOeahCBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeSh0aW1lc3RhbXA6IG51bWJlciB8IHN0cmluZylcblx0e1xuXHRcdGlmICh0aW1lc3RhbXAgaW4gdGhpcy5kYXRhLmhpc3RvcnkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5omA5pyJIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5cygpXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5kYXRhLmhpc3RvcnkpXG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5YmN5LiA5qyh55qEIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5UHJldigpXG5cdHtcblx0XHRsZXQgdGltZXN0YW1wID0gdGhpcy50aW1lc3RhbXA7XG5cblx0XHRsZXQga3M6IHN0cmluZ1tdO1xuXG5cdFx0aWYgKHRpbWVzdGFtcCBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRrcyA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YS5oaXN0b3J5KTtcblx0XHRcdGtzLnBvcCgpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0a3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cdFx0fVxuXG5cdFx0bGV0IGsgPSBrcy5wb3AoKTtcblxuXHRcdGlmIChrIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVtrXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfku4rlpKnnmoQgaGlzdG9yeSDos4fmlplcblx0ICovXG5cdGhpc3RvcnlUb2RheSgpXG5cdHtcblx0XHRsZXQgdGltZXN0YW1wID0gdGhpcy50aW1lc3RhbXA7XG5cblx0XHRsZXQgZGF0YSA9IHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF0gPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdIHx8IHt9O1xuXG5cdFx0ZGF0YS5lcHViX2NvdW50ID0gZGF0YS5lcHViX2NvdW50IHwgMDtcblx0XHRkYXRhLmVwdWIgPSBkYXRhLmVwdWIgfHwgW107XG5cblx0XHRkYXRhLnNlZ21lbnRfY291bnQgPSBkYXRhLnNlZ21lbnRfY291bnQgfCAwO1xuXHRcdGRhdGEuc2VnbWVudCA9IGRhdGEuc2VnbWVudCB8fCBbXTtcblxuXHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdO1xuXHR9XG5cblx0c3RhdGljIGZpeE9wdGlvbnMob3B0aW9ucz86IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMsIGV4dHJhT3B0aW9ucz86IFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4pXG5cdHtcblx0XHRvcHRpb25zID0ge1xuXHRcdFx0ZmlsZV9naXQ6IHVuZGVmaW5lZCxcblx0XHRcdGZpbGU6IHVuZGVmaW5lZCxcblx0XHRcdC4uLihkZWZhdWx0T3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKSxcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHQuLi5leHRyYU9wdGlvbnMsXG5cdFx0fTtcblxuXHRcdG9wdGlvbnMuaGlzdG9yeV9tYXggPSBvcHRpb25zLmhpc3RvcnlfbWF4ID4gMCA/IG9wdGlvbnMuaGlzdG9yeV9tYXggOiBkZWZhdWx0T3B0aW9ucy5oaXN0b3J5X21heDtcblxuXHRcdG9wdGlvbnMuaGlzdG9yeV9rZWVwID0gb3B0aW9ucy5oaXN0b3J5X2tlZXAgPiAwID8gb3B0aW9ucy5oaXN0b3J5X2tlZXAgOiBkZWZhdWx0T3B0aW9ucy5oaXN0b3J5X2tlZXA7XG5cblx0XHRvcHRpb25zID0gYmFzZVNvcnRPYmplY3Qob3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdC8qKlxuXHQgKiDlu7rnq4sgTm92ZWxTdGF0Q2FjaGUg54mp5Lu2XG5cdCAqL1xuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnM/OiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0b3B0aW9ucyA9IHRoaXMuZml4T3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdGlmIChvcGVuZWRNYXAuaGFzKG9wdGlvbnMpKVxuXHRcdHtcblx0XHRcdHJldHVybiBvcGVuZWRNYXAuZ2V0KG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGxldCBvYmogPSBuZXcgdGhpcyhvcHRpb25zKTtcblxuXHRcdG9wZW5lZE1hcC5zZXQob3B0aW9ucywgb2JqKTtcblxuXHRcdHJldHVybiBvYmo7XG5cdH1cblxuXHQvKipcblx0ICog5YWB6Kix55So5YW25LuW5pa55byP5Y+W5b6XIGRhdGEg5L6G5bu656uL54mp5Lu2XG5cdCAqL1xuXHRzdGF0aWMgY3JlYXRlRnJvbUpTT04oZGF0YTogSU5vdmVsU3RhdENhY2hlIHwgQnVmZmVyIHwgb2JqZWN0LCBvcHRpb25zPzogUGFydGlhbDxJTm92ZWxTdGF0Q2FjaGVPcHRpb25zPilcblx0e1xuXHRcdGlmIChCdWZmZXIuaXNCdWZmZXIoZGF0YSkpXG5cdFx0e1xuXHRcdFx0ZGF0YSA9IEpTT04ucGFyc2UoZGF0YS50b1N0cmluZygpKSBhcyBJTm92ZWxTdGF0Q2FjaGU7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucyA9IHRoaXMuZml4T3B0aW9ucyhvcHRpb25zIGFzIElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMsIHtcblx0XHRcdHJlYWRvbmx5OiAoIW9wdGlvbnMgfHwgb3B0aW9ucy5yZWFkb25seSA9PSBudWxsKSA/IHRydWUgOiBvcHRpb25zLnJlYWRvbmx5LFxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0ZGF0YSxcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzLmNyZWF0ZShvcHRpb25zIGFzIElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBib29sIC0g5riF55CG54mp5Lu25aSa6aSY6LOH5paZXG5cdCAqL1xuXHR0b0pTT04oYm9vbD86IGJvb2xlYW4gfCBudW1iZXIgfCBFbnVtQmVmb3JlU2F2ZSlcblx0e1xuXHRcdGlmIChib29sKVxuXHRcdHtcblx0XHRcdHRoaXMuX2JlZm9yZVNhdmUoYm9vbClcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZGF0YTtcblx0fVxuXG59XG5cbmV4cG9ydCBlbnVtIEVudW1CZWZvcmVTYXZlXG57XG5cdE5PTkUgPSAwLFxuXHRPUFRJTUlaRSA9IDEsXG5cdE9QVElNSVpFX0FORF9VUERBVEUgPSAyLFxufVxuXG5leHBvcnQgZW51bSBFbnVtRmlsdGVyTm92ZWxUeXBlXG57XG5cdC8qKlxuXHQgKiDlj5blvpfmiYDmnInlsI/oqqrnmoTmnIDntYLni4DmhYso6aCQ6KitKVxuXHQgKi9cblx0REVTVCA9IDB4MDAwMCxcblx0LyoqXG5cdCAqIOWPquWPluW+l+WOn+Wni+izh+aWmVxuXHQgKi9cblx0U09VUkNFX09OTFkgPSAweDAwMDEsXG5cdC8qKlxuXHQgKiDlj6rlj5blvpcgX291dCDlvozos4fmlplcblx0ICovXG5cdE9VVFBVVF9PTkxZID0gMHgwMDAyLFxufVxuXG5Ob3ZlbFN0YXRDYWNoZS5maXhPcHRpb25zID0gTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucy5iaW5kKE5vdmVsU3RhdENhY2hlKTtcbk5vdmVsU3RhdENhY2hlLmNyZWF0ZSA9IE5vdmVsU3RhdENhY2hlLmNyZWF0ZS5iaW5kKE5vdmVsU3RhdENhY2hlKTtcbk5vdmVsU3RhdENhY2hlLmNyZWF0ZUZyb21KU09OID0gTm92ZWxTdGF0Q2FjaGUuY3JlYXRlRnJvbUpTT04uYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5cbmNvbnN0IHsgY3JlYXRlLCBmaXhPcHRpb25zLCBjcmVhdGVGcm9tSlNPTiB9ID0gTm92ZWxTdGF0Q2FjaGU7XG5leHBvcnQgeyBjcmVhdGUsIGZpeE9wdGlvbnMsIGNyZWF0ZUZyb21KU09OIH1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTdGF0Q2FjaGUuY3JlYXRlXG5leHBvcnRzID0gT2JqZWN0LmZyZWV6ZShleHBvcnRzKTtcbiJdfQ==