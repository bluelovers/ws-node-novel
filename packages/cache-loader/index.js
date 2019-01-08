"use strict";
/**
 * Created by user on 2019/1/6/006.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./lib/util");
exports.createMoment = util_1.createMoment;
const fs = require("fs-extra");
const array_hyper_unique_1 = require("array-hyper-unique");
const sortObject = require("sort-object-keys2");
const openedMap = new WeakMap();
const defaultOptions = Object.freeze({
    history_max: 14,
    history_keep: 7,
});
/**
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
        else {
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
        return this.file && fs.pathExistsSync(this.file);
    }
    open() {
        if (!this.inited) {
            this.inited = true;
            if (this.data) {
                //
            }
            else if (this.exists()) {
                this.data = fs.readJSONSync(this.file);
            }
            else if (this.file_git && fs.pathExistsSync(this.file_git)) {
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
     * 取得指定 pathMain 的 novel 狀態集合
     */
    pathMain(pathMain) {
        return this.data.novels[pathMain] = this.data.novels[pathMain] || {};
    }
    /**
     * 取得指定 pathMain novelID 的 novel 狀態緩存
     */
    novel(pathMain, novelID) {
        this.pathMain(pathMain);
        this.data.novels[pathMain][novelID] = this.data.novels[pathMain][novelID] || {};
        return this.data.novels[pathMain][novelID];
    }
    /**
     * 取得指定 pathMain novelID 的 mdconf 資料
     */
    mdconf_get(pathMain, novelID) {
        this.data.mdconf[pathMain] = this.data.mdconf[pathMain] || {};
        return this.data.mdconf[pathMain][novelID];
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
        fs.outputJSONSync(this.file, this.toJSON(bool || true), {
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
NovelStatCache.fixOptions = NovelStatCache.fixOptions.bind(NovelStatCache);
NovelStatCache.create = NovelStatCache.create.bind(NovelStatCache);
NovelStatCache.createFromJSON = NovelStatCache.createFromJSON.bind(NovelStatCache);
const { create, fixOptions, createFromJSON } = NovelStatCache;
exports.create = create;
exports.fixOptions = fixOptions;
exports.createFromJSON = createFromJSON;
exports.default = NovelStatCache.create;
exports = Object.freeze(exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgscUNBQW1IO0FBVTFHLHVCQVZ5RSxtQkFBWSxDQVV6RTtBQU5yQiwrQkFBZ0M7QUFDaEMsMkRBQWtEO0FBQ2xELGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBbUQsQ0FBQztBQW1KakYsTUFBTSxjQUFjLEdBQThDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFL0UsV0FBVyxFQUFFLEVBQUU7SUFDZixZQUFZLEVBQUUsQ0FBQztDQUVmLENBQUMsQ0FBQztBQUVIOztHQUVHO0FBQ0gsTUFBYSxjQUFjO0lBZ0IxQjs7OztPQUlHO0lBQ0gsWUFBWSxPQUErQjtRQVYzQyxTQUFJLEdBQW9CLElBQUksQ0FBQztRQUc3QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBU3ZCLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxHQUFZLEtBQUssQ0FBQztRQUUxQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQ2hCO1lBQ0MsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUN6RjtnQkFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNqRDtZQUNDLE1BQU0sSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNqRDthQUVE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TyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ2xCLENBQUM7Q0FFRDtBQW5nQkQsd0NBbWdCQztBQUVELElBQVksY0FLWDtBQUxELFdBQVksY0FBYztJQUV6QixtREFBUSxDQUFBO0lBQ1IsMkRBQVksQ0FBQTtJQUNaLGlGQUF1QixDQUFBO0FBQ3hCLENBQUMsRUFMVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQUt6QjtBQUVELGNBQWMsQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDM0UsY0FBYyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNuRSxjQUFjLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBRW5GLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxHQUFHLGNBQWMsQ0FBQztBQUNyRCx3QkFBTTtBQUFFLGdDQUFVO0FBQUUsd0NBQWM7QUFFM0Msa0JBQWUsY0FBYyxDQUFDLE1BQU0sQ0FBQTtBQUNwQyxPQUFPLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMS82LzAwNi5cbiAqL1xuXG5pbXBvcnQgdG9kYXlNb21lbnRUaW1lc3RhbXAsIHsgYmFzZVNvcnRPYmplY3QsIGNhY2hlU29ydENhbGxiYWNrLCBmcmVlemVQcm9wZXJ0eSwgY3JlYXRlTW9tZW50IH0gZnJvbSAnLi9saWIvdXRpbCc7XG5pbXBvcnQgeyBJTWRjb25mTWV0YSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgeyBFbnVtTm92ZWxTdGF0dXMgfSBmcm9tICdub2RlLW5vdmVsLWluZm8vbGliL2NvbnN0JztcbmltcG9ydCBwYXRoID0gcmVxdWlyZSgndXBhdGgyJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCBzb3J0T2JqZWN0ID0gcmVxdWlyZSgnc29ydC1vYmplY3Qta2V5czInKTtcblxuY29uc3Qgb3BlbmVkTWFwID0gbmV3IFdlYWtNYXA8UGFydGlhbDxJTm92ZWxTdGF0Q2FjaGVPcHRpb25zPiwgTm92ZWxTdGF0Q2FjaGU+KCk7XG5cbmV4cG9ydCB7IGNyZWF0ZU1vbWVudCB9XG5cbi8qKlxuICog5omA5pyJIHRpbWVzdGFtcCDngrogVW5peCB0aW1lc3RhbXAgaW4gbWlsbGlzZWNvbmRzIOeCuiB1dGMgKzhcbiAqIHBhdGhNYWluIOeCuiDkuLvos4flpL7lkI3nqLFcbiAqIG5vdmVsSUQg54K6IOWwj+iqquizh+aWmeWkvuWQjeeosVxuICovXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZVxue1xuXG5cdG1ldGE/OiB7XG5cdFx0dG9kYXlUaW1lc3RhbXA/OiBudW1iZXIsXG5cdFx0dGltZXN0YW1wPzogbnVtYmVyLFxuXHR9LFxuXG5cdC8qKlxuXHQgKiDlsI/oqqrnt6nlrZjni4DmhYtcblx0ICovXG5cdG5vdmVsczoge1xuXHRcdFtwYXRoTWFpbjogc3RyaW5nXToge1xuXHRcdFx0W25vdmVsSUQ6IHN0cmluZ106IElOb3ZlbFN0YXRDYWNoZU5vdmVsLFxuXHRcdH0sXG5cdH0sXG5cblx0LyoqXG5cdCAqIOatt+WPsue0gOmMhFxuXHQgKi9cblx0aGlzdG9yeToge1xuXHRcdFt0aW1lc3RhbXA6IHN0cmluZ106IElOb3ZlbFN0YXRDYWNoZUhpc3RvcnksXG5cdFx0W3RpbWVzdGFtcDogbnVtYmVyXTogSU5vdmVsU3RhdENhY2hlSGlzdG9yeSxcblx0fSxcblxuXHQvKipcblx0ICog6YCP6YGOIG5vZGUtbm92ZWwtY29uZiDop6PmnpDpgY7nmoQgTUVUQSDos4fmlpkgKFJFQURNRS5tZClcblx0ICovXG5cdG1kY29uZjoge1xuXHRcdFtwYXRoTWFpbjogc3RyaW5nXToge1xuXHRcdFx0W25vdmVsSUQ6IHN0cmluZ106IElNZGNvbmZNZXRhLFxuXHRcdH0sXG5cdH0sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU3RhdENhY2hlTm92ZWxcbntcblx0LyoqXG5cdCAqIHNlZ21lbnQg5pu05paw5pmC6ZaTXG5cdCAqL1xuXHRzZWdtZW50X2RhdGU/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiBlcHViIOabtOaWsOaZgumWk1xuXHQgKi9cblx0ZXB1Yl9kYXRlPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDliJ3lp4vljJbmmYLplpNcblx0ICovXG5cdGluaXRfZGF0ZT86IG51bWJlcixcblxuXHQvKipcblx0ICog57i956ugL+WNt+aVuOmHj1xuXHQgKi9cblx0dm9sdW1lPzogbnVtYmVyLFxuXHQvKipcblx0ICog57i96Kmx5pW4XG5cdCAqL1xuXHRjaGFwdGVyPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDkuIrmrKHnmoTnuL3nq6Av5Y235pW46YePXG5cdCAqL1xuXHR2b2x1bWVfb2xkPzogbnVtYmVyLFxuXHQvKipcblx0ICog5LiK5qyh55qE57i96Kmx5pW4XG5cdCAqL1xuXHRjaGFwdGVyX29sZD86IG51bWJlcixcblxuXHQvKipcblx0ICogc2VnbWVudCDororli5Xmlbjph49cblx0ICovXG5cdHNlZ21lbnQ/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDkuIrmrKHnmoQgc2VnbWVudCDororli5Xmlbjph49cblx0ICovXG5cdHNlZ21lbnRfb2xkPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDlsI/oqqrni4DmhYsgZmxhZyDmoLnmk5ogcmVhZG1lLm1kIOWFp+ioreWumlxuXHQgKi9cblx0bm92ZWxfc3RhdHVzPzogRW51bU5vdmVsU3RhdHVzLFxuXG5cdC8qKlxuXHQgKiDmnIDlvozororli5XmmYLplpNcblx0ICovXG5cdHVwZGF0ZV9kYXRlPzogbnVtYmVyO1xuXHQvKipcblx0ICog57SA6YyE6K6K5YuV5qyh5pW4XG5cdCAqL1xuXHR1cGRhdGVfY291bnQ/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIGVwdWIgZmlsZW5hbWVcblx0ICovXG5cdGVwdWJfYmFzZW5hbWU/OiBzdHJpbmcsXG5cdHR4dF9iYXNlbmFtZT86IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVIaXN0b3J5XG57XG5cdC8qKlxuXHQgKiDmnKzmrKHoqJjpjITlhafnmoQgZXB1YiDnuL3mlbhcblx0ICovXG5cdGVwdWJfY291bnQ/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDmnKzmrKHoqJjpjITlhafnmoQgZXB1YlxuXHQgKi9cblx0ZXB1Yj86IEFycmF5PFtzdHJpbmcsIHN0cmluZywgSU5vdmVsU3RhdENhY2hlTm92ZWw/XT4sXG5cdHNlZ21lbnRfY291bnQ/OiBudW1iZXIsXG5cdHNlZ21lbnQ/OiBBcnJheTxbc3RyaW5nLCBzdHJpbmcsIElOb3ZlbFN0YXRDYWNoZU5vdmVsP10+LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZU9wdGlvbnNcbntcblx0LyoqXG5cdCAqIOiugOWvq+e3qeWtmOeahOebruaomSBqc29uIOi3r+W+kVxuXHQgKi9cblx0ZmlsZTogc3RyaW5nLFxuXHQvKipcblx0ICog55W2IGZpbGUg5LiN5a2Y5Zyo5pmC5ZiX6Kmm6K6A5Y+W5q2k5qqU5qGIXG5cdCAqL1xuXHRmaWxlX2dpdD86IHN0cmluZyxcblxuXHQvKipcblx0ICog56aB5q2i5bCH6LOH5paZ5a+r5Zue5qqU5qGIXG5cdCAqL1xuXHRyZWFkb25seT86IGJvb2xlYW4sXG5cblx0aGlzdG9yeV9tYXg/OiBudW1iZXIsXG5cdGhpc3Rvcnlfa2VlcD86IG51bWJlcixcblxuXHQvKipcblx0ICogb3B0aW9ucy5yZWFkb25seSAmJiBvcHRpb25zLmRhdGEg5b+F6aCI5ZCM5pmC5ZWf55SoXG5cdCAqL1xuXHRkYXRhPzogSU5vdmVsU3RhdENhY2hlLFxufVxuXG5jb25zdCBkZWZhdWx0T3B0aW9uczogUmVhZG9ubHk8UGFydGlhbDxJTm92ZWxTdGF0Q2FjaGVPcHRpb25zPj4gPSBPYmplY3QuZnJlZXplKHtcblxuXHRoaXN0b3J5X21heDogMTQsXG5cdGhpc3Rvcnlfa2VlcDogNyxcblxufSk7XG5cbi8qKlxuICogQGV4YW1wbGUgTm92ZWxTdGF0Q2FjaGUuY3JlYXRlKClcbiAqL1xuZXhwb3J0IGNsYXNzIE5vdmVsU3RhdENhY2hlXG57XG5cdC8qKlxuXHQgKiDoroDlr6vnt6nlrZjnmoTnm67mqJkganNvbiDot6/lvpFcblx0ICovXG5cdGZpbGU6IHN0cmluZztcblx0LyoqXG5cdCAqIOeVtiBmaWxlIOS4jeWtmOWcqOaZguWYl+ippuiugOWPluatpOaqlOahiFxuXHQgKi9cblx0ZmlsZV9naXQ6IHN0cmluZztcblxuXHRkYXRhOiBJTm92ZWxTdGF0Q2FjaGUgPSBudWxsO1xuXHRvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zO1xuXG5cdGluaXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiDkvb/nlKggTm92ZWxTdGF0Q2FjaGUuY3JlYXRlKCkg5Luj5pu/XG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0b3B0aW9ucyA9IE5vdmVsU3RhdENhY2hlLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRsZXQgX2NoazogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdFx0aWYgKG9wdGlvbnMuZGF0YSlcblx0XHR7XG5cdFx0XHRpZiAoIShvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmhpc3RvcnkgJiYgb3B0aW9ucy5kYXRhLm5vdmVscyAmJiBvcHRpb25zLmRhdGEubWRjb25mKSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgb3B0aW9ucy5kYXRhIGlzIG5vdCBhbGxvdyBkYXRhYCk7XG5cdFx0XHR9XG5cblx0XHRcdF9jaGsgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICghb3B0aW9ucy5maWxlICYmICghb3B0aW9ucy5yZWFkb25seSB8fCAhX2NoaykpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoYG9wdGlvbnMuZmlsZSBpcyByZXF1aXJlZGApO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0ZGVsZXRlIG9wdGlvbnMuZGF0YTtcblx0XHR9XG5cblx0XHR0aGlzLl9pbml0KG9wdGlvbnMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9pbml0KG9wdGlvbnM6IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMpXG5cdHtcblx0XHRpZiAob3B0aW9ucy5kYXRhKVxuXHRcdHtcblx0XHRcdHRoaXMuZGF0YSA9IG9wdGlvbnMuZGF0YTtcblx0XHR9XG5cblx0XHRkZWxldGUgb3B0aW9ucy5kYXRhO1xuXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuXHRcdHRoaXMuZmlsZSA9IHRoaXMub3B0aW9ucy5maWxlO1xuXHRcdHRoaXMuZmlsZV9naXQgPSB0aGlzLm9wdGlvbnMuZmlsZV9naXQ7XG5cblx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnb3B0aW9ucycsIHRydWUpO1xuXHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdmaWxlJyk7XG5cdFx0ZnJlZXplUHJvcGVydHkodGhpcywgJ2ZpbGVfZ2l0Jyk7XG5cblx0XHR0aGlzLm9wZW4oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDmqqLmn6UgZmlsZSDmmK/lkKblrZjlnKhcblx0ICovXG5cdGV4aXN0cygpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5maWxlICYmIGZzLnBhdGhFeGlzdHNTeW5jKHRoaXMuZmlsZSlcblx0fVxuXG5cdHByb3RlY3RlZCBvcGVuKClcblx0e1xuXHRcdGlmICghdGhpcy5pbml0ZWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0XHRpZiAodGhpcy5kYXRhKVxuXHRcdFx0e1xuXHRcdFx0XHQvL1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5leGlzdHMoKSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5kYXRhID0gZnMucmVhZEpTT05TeW5jKHRoaXMuZmlsZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLmZpbGVfZ2l0ICYmIGZzLnBhdGhFeGlzdHNTeW5jKHRoaXMuZmlsZV9naXQpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmRhdGEgPSBmcy5yZWFkSlNPTlN5bmModGhpcy5maWxlX2dpdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRoaXMuZGF0YSA9IHRoaXMuZGF0YSB8fCB7fTtcblxuXHRcdFx0dGhpcy5kYXRhLmhpc3RvcnkgPSB0aGlzLmRhdGEuaGlzdG9yeSB8fCB7fTtcblx0XHRcdHRoaXMuZGF0YS5ub3ZlbHMgPSB0aGlzLmRhdGEubm92ZWxzIHx8IHt9O1xuXHRcdFx0dGhpcy5kYXRhLm1kY29uZiA9IHRoaXMuZGF0YS5tZGNvbmYgfHwge307XG5cdFx0XHR0aGlzLmRhdGEubWV0YSA9IHRoaXMuZGF0YS5tZXRhIHx8IHt9O1xuXG5cdFx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnaW5pdGVkJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5omA5pyJ5ZyoIGRhdGEubm92ZWxzIC8gZGF0YS5tZGNvbmYg5YWn5a2Y5Zyo55qEIHBhdGhNYWluXG5cdCAqL1xuXHRwYXRoTWFpbkxpc3QoKVxuXHR7XG5cdFx0cmV0dXJuIGFycmF5X3VuaXF1ZShPYmplY3Qua2V5cyh0aGlzLmRhdGEubm92ZWxzKVxuXHRcdFx0LmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLmRhdGEubWRjb25mKSkpXG5cdFx0XHQuc29ydCgpXG5cdFx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aMh+WumiBwYXRoTWFpbiDnmoQgbm92ZWwg54uA5oWL6ZuG5ZCIXG5cdCAqL1xuXHRwYXRoTWFpbihwYXRoTWFpbjogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dID0gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0gfHwge307XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIG5vdmVsSUQg55qEIG5vdmVsIOeLgOaFi+e3qeWtmFxuXHQgKi9cblx0bm92ZWwocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5wYXRoTWFpbihwYXRoTWFpbik7XG5cblx0XHR0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSA9IHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdIHx8IHt9O1xuXG5cdFx0cmV0dXJuIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aMh+WumiBwYXRoTWFpbiBub3ZlbElEIOeahCBtZGNvbmYg6LOH5paZXG5cdCAqL1xuXHRtZGNvbmZfZ2V0KHBhdGhNYWluOiBzdHJpbmcsIG5vdmVsSUQ6IHN0cmluZylcblx0e1xuXHRcdHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dID0gdGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gfHwge307XG5cblx0XHRyZXR1cm4gdGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl1bbm92ZWxJRF07XG5cdH1cblxuXHQvKipcblx0ICog6Kit5a6a5oyH5a6aIHBhdGhNYWluIG5vdmVsSUQg55qEIG1kY29uZiDos4fmlplcblx0ICovXG5cdG1kY29uZl9zZXQocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nLCBtZXRhOiBJTWRjb25mTWV0YSlcblx0e1xuXHRcdHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dID0gdGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gfHwge307XG5cblx0XHR0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXVtub3ZlbElEXSA9IG1ldGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0X2JlZm9yZVNhdmUoYm9vbD86IGJvb2xlYW4gfCBudW1iZXIpXG5cdHtcblx0XHRsZXQgdGltZXN0YW1wID0gdGhpcy50aW1lc3RhbXA7XG5cblx0XHRPYmplY3QuZW50cmllcyh0aGlzLmRhdGEubm92ZWxzKVxuXHRcdFx0LmZvckVhY2goKFtwYXRoTWFpbiwgZGF0YV0sIGkpID0+XG5cdFx0XHR7XG5cdFx0XHRcdE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dKVxuXHRcdFx0XHRcdC5mb3JFYWNoKChbbm92ZWxJRCwgZGF0YV0pID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9hID0gW1xuXHRcdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGEuZXB1Yl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGEuc2VnbWVudF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUsXG5cdFx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdFx0LmZpbHRlcih2ID0+IHYgJiYgdiA+IDApXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGlmICghX2EubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLmluaXRfZGF0ZSA9IHRpbWVzdGFtcFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLmluaXRfZGF0ZSA9IF9hXG5cdFx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gTWF0aC5taW4oYSwgYik7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR8fCB0aW1lc3RhbXBcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0aWYgKHRpbWVzdGFtcCBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRsZXQgX2xpc3QgPSBuZXcgU2V0PElOb3ZlbFN0YXRDYWNoZU5vdmVsPigpO1xuXG5cdFx0XHRsZXQgdG9kYXkgPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdO1xuXG5cdFx0XHRpZiAodG9kYXkuZXB1Yilcblx0XHRcdHtcblx0XHRcdFx0YXJyYXlfdW5pcXVlKHRvZGF5LmVwdWIsIHtcblx0XHRcdFx0XHRvdmVyd3JpdGU6IHRydWUsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LmVwdWIuc29ydChmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBjYWNoZVNvcnRDYWxsYmFjayhhWzBdLCBiWzBdKVxuXHRcdFx0XHRcdFx0fHwgY2FjaGVTb3J0Q2FsbGJhY2soYVsxXSwgYlsxXSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuZXB1Yl9jb3VudCA9IHRvZGF5LmVwdWIubGVuZ3RoIHwgMDtcblxuXHRcdFx0XHRpZiAoIXRvZGF5LmVwdWJfY291bnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuZXB1Yjtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuZXB1Yl9jb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0b2RheS5lcHViLmZvckVhY2goKHYsIGkpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5vdmVsID0gdGhpcy5ub3ZlbCh2WzBdLCB2WzFdKTtcblxuXHRcdFx0XHRcdFx0X2xpc3QuYWRkKG5vdmVsKTtcblxuXHRcdFx0XHRcdFx0dG9kYXkuZXB1YltpXVsyXSA9IG5vdmVsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRvZGF5LnNlZ21lbnQpXG5cdFx0XHR7XG5cdFx0XHRcdGFycmF5X3VuaXF1ZSh0b2RheS5zZWdtZW50LCB7XG5cdFx0XHRcdFx0b3ZlcndyaXRlOiB0cnVlLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0b2RheS5zZWdtZW50LnNvcnQoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gY2FjaGVTb3J0Q2FsbGJhY2soYVswXSwgYlswXSlcblx0XHRcdFx0XHRcdHx8IGNhY2hlU29ydENhbGxiYWNrKGFbMV0sIGJbMV0pXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LnNlZ21lbnRfY291bnQgPSB0b2RheS5zZWdtZW50Lmxlbmd0aCB8IDA7XG5cblx0XHRcdFx0aWYgKCF0b2RheS5zZWdtZW50X2NvdW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGVsZXRlIHRvZGF5LnNlZ21lbnQ7XG5cdFx0XHRcdFx0ZGVsZXRlIHRvZGF5LnNlZ21lbnRfY291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG9kYXkuc2VnbWVudC5mb3JFYWNoKCh2LCBpKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBub3ZlbCA9IHRoaXMubm92ZWwodlswXSwgdlsxXSk7XG5cblx0XHRcdFx0XHRcdF9saXN0LmFkZChub3ZlbCk7XG5cblx0XHRcdFx0XHRcdHRvZGF5LnNlZ21lbnRbaV1bMl0gPSBub3ZlbDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICghT2JqZWN0LmtleXModG9kYXkpLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChib29sID4gMSB8fCBib29sID09IEVudW1CZWZvcmVTYXZlLk9QVElNSVpFX0FORF9VUERBVEUpXG5cdFx0XHR7XG5cdFx0XHRcdF9saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2EgPSBbXG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRkYXRhLmVwdWJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0ZGF0YS5zZWdtZW50X2RhdGUsXG5cdFx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUsXG5cdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHQuZmlsdGVyKHYgPT4gdiAmJiB2ID4gMClcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRsZXQgb2xkID0gZGF0YS51cGRhdGVfZGF0ZTtcblxuXHRcdFx0XHRcdGlmICghX2EubGVuZ3RoIHx8IHRydWUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSA9IHRpbWVzdGFtcFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSA9IF9hXG5cdFx0XHRcdFx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gTWF0aC5tYXgoYSwgYik7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdHx8IHRpbWVzdGFtcFxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvbGQgIT09IGRhdGEudXBkYXRlX2RhdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfY291bnQgPSAoZGF0YS51cGRhdGVfY291bnQgfCAwKSArIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGlzLmRhdGEubWV0YS50aW1lc3RhbXAgPSBjcmVhdGVNb21lbnQoKS52YWx1ZU9mKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZGF0YS5tZXRhLnRvZGF5VGltZXN0YW1wID0gdGltZXN0YW1wO1xuXHRcdH1cblxuXHRcdGxldCBrcyA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YS5oaXN0b3J5KTtcblxuXHRcdGlmIChrcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IGggPSB0aGlzLmRhdGEuaGlzdG9yeTtcblxuXHRcdFx0a3MuZm9yRWFjaChmdW5jdGlvbiAoaylcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFPYmplY3Qua2V5cyhoW2tdKS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgaFtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChrcy5sZW5ndGggPj0gdGhpcy5vcHRpb25zLmhpc3RvcnlfbWF4KVxuXHRcdFx0e1xuXHRcdFx0XHRrcy5zb3J0KCkuc2xpY2UoMCwgKDAgLSB0aGlzLm9wdGlvbnMuaGlzdG9yeV9rZWVwKSkuZm9yRWFjaChrID0+IGRlbGV0ZSB0aGlzLmRhdGEuaGlzdG9yeVtrXSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRzb3J0T2JqZWN0KHRoaXMuZGF0YSwge1xuXHRcdFx0dXNlU291cmNlOiB0cnVlLFxuXHRcdFx0a2V5czogW1xuXHRcdFx0XHQnbWV0YScsXG5cdFx0XHRcdCdoaXN0b3J5Jyxcblx0XHRcdFx0J25vdmVscycsXG5cdFx0XHRcdCdtZGNvbmYnLFxuXHRcdFx0XSBhcyAoa2V5b2YgSU5vdmVsU3RhdENhY2hlKVtdLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5bCH6LOH5paZ5YSy5a2Y6IezIGZpbGVcblx0ICpcblx0ICogQHBhcmFtIGJvb2wgLSDmuIXnkIbnianku7blpJrppJjos4fmlplcblx0ICovXG5cdHB1YmxpYyBzYXZlKGJvb2w/OiBib29sZWFuIHwgbnVtYmVyIHwgRW51bUJlZm9yZVNhdmUpXG5cdHtcblx0XHRpZiAodGhpcy5vcHRpb25zLnJlYWRvbmx5KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgb3B0aW9ucy5yZWFkb25seSBpcyBzZXQsIGNhbid0IG5vdCBzYXZlIGZpbGVgKVxuXHRcdH1cblxuXHRcdGZzLm91dHB1dEpTT05TeW5jKHRoaXMuZmlsZSwgdGhpcy50b0pTT04oYm9vbCB8fCB0cnVlKSwge1xuXHRcdFx0c3BhY2VzOiAyLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIHRpbWVzdGFtcFxuXHQgKi9cblx0Z2V0IHRpbWVzdGFtcCgpXG5cdHtcblx0XHRyZXR1cm4gdG9kYXlNb21lbnRUaW1lc3RhbXA7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHRpbWVzdGFtcCDnmoQgaGlzdG9yeSDos4fmlplcblx0ICovXG5cdGhpc3RvcnkodGltZXN0YW1wOiBudW1iZXIgfCBzdHJpbmcpXG5cdHtcblx0XHRpZiAodGltZXN0YW1wIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aJgOaciSBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeXMoKVxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5oaXN0b3J5KVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+WJjeS4gOasoeeahCBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeVByZXYoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGtzOiBzdHJpbmdbXTtcblxuXHRcdGlmICh0aW1lc3RhbXAgaW4gdGhpcy5kYXRhLmhpc3RvcnkpXG5cdFx0e1xuXHRcdFx0a3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cdFx0XHRrcy5wb3AoKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGtzID0gT2JqZWN0LmtleXModGhpcy5kYXRhLmhpc3RvcnkpO1xuXHRcdH1cblxuXHRcdGxldCBrID0ga3MucG9wKCk7XG5cblx0XHRpZiAoayBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3Rvcnlba107XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5VG9kYXkoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGRhdGEgPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdID0gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXSB8fCB7fTtcblxuXHRcdGRhdGEuZXB1Yl9jb3VudCA9IGRhdGEuZXB1Yl9jb3VudCB8IDA7XG5cdFx0ZGF0YS5lcHViID0gZGF0YS5lcHViIHx8IFtdO1xuXG5cdFx0ZGF0YS5zZWdtZW50X2NvdW50ID0gZGF0YS5zZWdtZW50X2NvdW50IHwgMDtcblx0XHRkYXRhLnNlZ21lbnQgPSBkYXRhLnNlZ21lbnQgfHwgW107XG5cblx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblx0fVxuXG5cdHN0YXRpYyBmaXhPcHRpb25zKG9wdGlvbnM/OiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zLCBleHRyYU9wdGlvbnM/OiBQYXJ0aWFsPElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM+KVxuXHR7XG5cdFx0b3B0aW9ucyA9IHtcblx0XHRcdGZpbGVfZ2l0OiB1bmRlZmluZWQsXG5cdFx0XHRmaWxlOiB1bmRlZmluZWQsXG5cdFx0XHQuLi4oZGVmYXVsdE9wdGlvbnMgYXMgSU5vdmVsU3RhdENhY2hlT3B0aW9ucyksXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0Li4uZXh0cmFPcHRpb25zLFxuXHRcdH07XG5cblx0XHRvcHRpb25zLmhpc3RvcnlfbWF4ID0gb3B0aW9ucy5oaXN0b3J5X21heCA+IDAgPyBvcHRpb25zLmhpc3RvcnlfbWF4IDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9tYXg7XG5cblx0XHRvcHRpb25zLmhpc3Rvcnlfa2VlcCA9IG9wdGlvbnMuaGlzdG9yeV9rZWVwID4gMCA/IG9wdGlvbnMuaGlzdG9yeV9rZWVwIDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9rZWVwO1xuXG5cdFx0b3B0aW9ucyA9IGJhc2VTb3J0T2JqZWN0KG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICog5bu656uLIE5vdmVsU3RhdENhY2hlIOeJqeS7tlxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zPzogSU5vdmVsU3RhdENhY2hlT3B0aW9ucylcblx0e1xuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRpZiAob3BlbmVkTWFwLmhhcyhvcHRpb25zKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gb3BlbmVkTWFwLmdldChvcHRpb25zKTtcblx0XHR9XG5cblx0XHRsZXQgb2JqID0gbmV3IHRoaXMob3B0aW9ucyk7XG5cblx0XHRvcGVuZWRNYXAuc2V0KG9wdGlvbnMsIG9iaik7XG5cblx0XHRyZXR1cm4gb2JqO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWFgeioseeUqOWFtuS7luaWueW8j+WPluW+lyBkYXRhIOS+huW7uueri+eJqeS7tlxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZUZyb21KU09OKGRhdGE6IElOb3ZlbFN0YXRDYWNoZSB8IEJ1ZmZlciwgb3B0aW9ucz86IFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4pXG5cdHtcblx0XHRpZiAoQnVmZmVyLmlzQnVmZmVyKGRhdGEpKVxuXHRcdHtcblx0XHRcdGRhdGEgPSBKU09OLnBhcnNlKGRhdGEudG9TdHJpbmcoKSkgYXMgSU5vdmVsU3RhdENhY2hlO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zLCB7XG5cdFx0XHRyZWFkb25seTogKCFvcHRpb25zIHx8IG9wdGlvbnMucmVhZG9ubHkgPT0gbnVsbCkgPyB0cnVlIDogb3B0aW9ucy5yZWFkb25seSxcblx0XHRcdGRhdGEsXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcy5jcmVhdGUob3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYm9vbCAtIOa4heeQhueJqeS7tuWkmumkmOizh+aWmVxuXHQgKi9cblx0dG9KU09OKGJvb2w/OiBib29sZWFuIHwgbnVtYmVyIHwgRW51bUJlZm9yZVNhdmUpXG5cdHtcblx0XHRpZiAoYm9vbClcblx0XHR7XG5cdFx0XHR0aGlzLl9iZWZvcmVTYXZlKGJvb2wpXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmRhdGE7XG5cdH1cblxufVxuXG5leHBvcnQgZW51bSBFbnVtQmVmb3JlU2F2ZVxue1xuXHROT05FID0gMCxcblx0T1BUSU1JWkUgPSAxLFxuXHRPUFRJTUlaRV9BTkRfVVBEQVRFID0gMixcbn1cblxuTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucyA9IE5vdmVsU3RhdENhY2hlLmZpeE9wdGlvbnMuYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5Ob3ZlbFN0YXRDYWNoZS5jcmVhdGUgPSBOb3ZlbFN0YXRDYWNoZS5jcmVhdGUuYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5Ob3ZlbFN0YXRDYWNoZS5jcmVhdGVGcm9tSlNPTiA9IE5vdmVsU3RhdENhY2hlLmNyZWF0ZUZyb21KU09OLmJpbmQoTm92ZWxTdGF0Q2FjaGUpO1xuXG5jb25zdCB7IGNyZWF0ZSwgZml4T3B0aW9ucywgY3JlYXRlRnJvbUpTT04gfSA9IE5vdmVsU3RhdENhY2hlO1xuZXhwb3J0IHsgY3JlYXRlLCBmaXhPcHRpb25zLCBjcmVhdGVGcm9tSlNPTiB9XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU3RhdENhY2hlLmNyZWF0ZVxuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUoZXhwb3J0cyk7XG4iXX0=