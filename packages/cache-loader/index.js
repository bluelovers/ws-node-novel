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
        if (!options.file) {
            throw new RangeError(`options.file is required`);
        }
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
            if (this.exists()) {
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
            }
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
    static fixOptions(options) {
        options = {
            file_git: undefined,
            file: undefined,
            ...defaultOptions,
            ...options,
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
const { create, fixOptions } = NovelStatCache;
exports.create = create;
exports.fixOptions = fixOptions;
exports.default = NovelStatCache.create;
exports = Object.freeze(exports);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgscUNBQW1IO0FBVTFHLHVCQVZ5RSxtQkFBWSxDQVV6RTtBQU5yQiwrQkFBZ0M7QUFDaEMsMkRBQWtEO0FBQ2xELGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBbUQsQ0FBQztBQXdJakYsTUFBTSxjQUFjLEdBQThDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFL0UsV0FBVyxFQUFFLEVBQUU7SUFDZixZQUFZLEVBQUUsQ0FBQztDQUVmLENBQUMsQ0FBQztBQUVIOztHQUVHO0FBQ0gsTUFBYSxjQUFjO0lBZ0IxQjs7OztPQUlHO0lBQ0gsWUFBWSxPQUErQjtRQVYzQyxTQUFJLEdBQW9CLElBQUksQ0FBQztRQUc3QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBU3ZCLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUNqQjtZQUNDLE1BQU0sSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNqRDtRQUVELElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBRXZCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUV0QyxxQkFBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMscUJBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0IscUJBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFakMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztP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Q0FBQztBQUNyQyx3QkFBTTtBQUFFLGdDQUFVO0FBRTNCLGtCQUFlLGNBQWMsQ0FBQyxNQUFNLENBQUE7QUFDcEMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzEvNi8wMDYuXG4gKi9cblxuaW1wb3J0IHRvZGF5TW9tZW50VGltZXN0YW1wLCB7IGJhc2VTb3J0T2JqZWN0LCBjYWNoZVNvcnRDYWxsYmFjaywgZnJlZXplUHJvcGVydHksIGNyZWF0ZU1vbWVudCB9IGZyb20gJy4vbGliL3V0aWwnO1xuaW1wb3J0IHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgc29ydE9iamVjdCA9IHJlcXVpcmUoJ3NvcnQtb2JqZWN0LWtleXMyJyk7XG5cbmNvbnN0IG9wZW5lZE1hcCA9IG5ldyBXZWFrTWFwPFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4sIE5vdmVsU3RhdENhY2hlPigpO1xuXG5leHBvcnQgeyBjcmVhdGVNb21lbnQgfVxuXG4vKipcbiAqIOaJgOaciSB0aW1lc3RhbXAg54K6IFVuaXggdGltZXN0YW1wIGluIG1pbGxpc2Vjb25kcyDngrogdXRjICs4XG4gKiBwYXRoTWFpbiDngrog5Li76LOH5aS+5ZCN56ixXG4gKiBub3ZlbElEIOeCuiDlsI/oqqros4fmlpnlpL7lkI3nqLFcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVcbntcblx0LyoqXG5cdCAqIOWwj+iqque3qeWtmOeLgOaFi1xuXHQgKi9cblx0bm92ZWxzOiB7XG5cdFx0W3BhdGhNYWluOiBzdHJpbmddOiB7XG5cdFx0XHRbbm92ZWxJRDogc3RyaW5nXTogSU5vdmVsU3RhdENhY2hlTm92ZWwsXG5cdFx0fSxcblx0fSxcblxuXHQvKipcblx0ICog5q235Y+y57SA6YyEXG5cdCAqL1xuXHRoaXN0b3J5OiB7XG5cdFx0W3RpbWVzdGFtcDogc3RyaW5nXTogSU5vdmVsU3RhdENhY2hlSGlzdG9yeSxcblx0XHRbdGltZXN0YW1wOiBudW1iZXJdOiBJTm92ZWxTdGF0Q2FjaGVIaXN0b3J5LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiDpgI/pgY4gbm9kZS1ub3ZlbC1jb25mIOino+aekOmBjueahCBNRVRBIOizh+aWmSAoUkVBRE1FLm1kKVxuXHQgKi9cblx0bWRjb25mOiB7XG5cdFx0W3BhdGhNYWluOiBzdHJpbmddOiB7XG5cdFx0XHRbbm92ZWxJRDogc3RyaW5nXTogSU1kY29uZk1ldGEsXG5cdFx0fSxcblx0fSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVOb3ZlbFxue1xuXHQvKipcblx0ICogc2VnbWVudCDmm7TmlrDmmYLplpNcblx0ICovXG5cdHNlZ21lbnRfZGF0ZT86IG51bWJlcixcblx0LyoqXG5cdCAqIGVwdWIg5pu05paw5pmC6ZaTXG5cdCAqL1xuXHRlcHViX2RhdGU/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIOWIneWni+WMluaZgumWk1xuXHQgKi9cblx0aW5pdF9kYXRlPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiDnuL3nq6Av5Y235pW46YePXG5cdCAqL1xuXHR2b2x1bWU/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDnuL3oqbHmlbhcblx0ICovXG5cdGNoYXB0ZXI/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIOS4iuasoeeahOe4veeroC/ljbfmlbjph49cblx0ICovXG5cdHZvbHVtZV9vbGQ/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiDkuIrmrKHnmoTnuL3oqbHmlbhcblx0ICovXG5cdGNoYXB0ZXJfb2xkPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiBzZWdtZW50IOiuiuWLleaVuOmHj1xuXHQgKi9cblx0c2VnbWVudD86IG51bWJlcixcblx0LyoqXG5cdCAqIOS4iuasoeeahCBzZWdtZW50IOiuiuWLleaVuOmHj1xuXHQgKi9cblx0c2VnbWVudF9vbGQ/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIOWwj+iqqueLgOaFiyBmbGFnIOagueaTmiByZWFkbWUubWQg5YWn6Kit5a6aXG5cdCAqL1xuXHRub3ZlbF9zdGF0dXM/OiBFbnVtTm92ZWxTdGF0dXMsXG5cblx0LyoqXG5cdCAqIOacgOW+jOiuiuWLleaZgumWk1xuXHQgKi9cblx0dXBkYXRlX2RhdGU/OiBudW1iZXI7XG5cdC8qKlxuXHQgKiDntIDpjITororli5XmrKHmlbhcblx0ICovXG5cdHVwZGF0ZV9jb3VudD86IG51bWJlcjtcblxuXHQvKipcblx0ICogZXB1YiBmaWxlbmFtZVxuXHQgKi9cblx0ZXB1Yl9iYXNlbmFtZT86IHN0cmluZyxcblx0dHh0X2Jhc2VuYW1lPzogc3RyaW5nLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZUhpc3Rvcnlcbntcblx0LyoqXG5cdCAqIOacrOasoeiomOmMhOWFp+eahCBlcHViIOe4veaVuFxuXHQgKi9cblx0ZXB1Yl9jb3VudD86IG51bWJlcixcblx0LyoqXG5cdCAqIOacrOasoeiomOmMhOWFp+eahCBlcHViXG5cdCAqL1xuXHRlcHViPzogQXJyYXk8W3N0cmluZywgc3RyaW5nLCBJTm92ZWxTdGF0Q2FjaGVOb3ZlbD9dPixcblx0c2VnbWVudF9jb3VudD86IG51bWJlcixcblx0c2VnbWVudD86IEFycmF5PFtzdHJpbmcsIHN0cmluZywgSU5vdmVsU3RhdENhY2hlTm92ZWw/XT4sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU3RhdENhY2hlT3B0aW9uc1xue1xuXHQvKipcblx0ICog6K6A5a+r57ep5a2Y55qE55uu5qiZIGpzb24g6Lev5b6RXG5cdCAqL1xuXHRmaWxlOiBzdHJpbmcsXG5cdC8qKlxuXHQgKiDnlbYgZmlsZSDkuI3lrZjlnKjmmYLlmJfoqaboroDlj5bmraTmqpTmoYhcblx0ICovXG5cdGZpbGVfZ2l0Pzogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiDnpoHmraLlsIfos4fmlpnlr6vlm57mqpTmoYhcblx0ICovXG5cdHJlYWRvbmx5PzogYm9vbGVhbixcblxuXHRoaXN0b3J5X21heD86IG51bWJlcixcblx0aGlzdG9yeV9rZWVwPzogbnVtYmVyLFxufVxuXG5jb25zdCBkZWZhdWx0T3B0aW9uczogUmVhZG9ubHk8UGFydGlhbDxJTm92ZWxTdGF0Q2FjaGVPcHRpb25zPj4gPSBPYmplY3QuZnJlZXplKHtcblxuXHRoaXN0b3J5X21heDogMTQsXG5cdGhpc3Rvcnlfa2VlcDogNyxcblxufSk7XG5cbi8qKlxuICogQGV4YW1wbGUgTm92ZWxTdGF0Q2FjaGUuY3JlYXRlKClcbiAqL1xuZXhwb3J0IGNsYXNzIE5vdmVsU3RhdENhY2hlXG57XG5cdC8qKlxuXHQgKiDoroDlr6vnt6nlrZjnmoTnm67mqJkganNvbiDot6/lvpFcblx0ICovXG5cdGZpbGU6IHN0cmluZztcblx0LyoqXG5cdCAqIOeVtiBmaWxlIOS4jeWtmOWcqOaZguWYl+ippuiugOWPluatpOaqlOahiFxuXHQgKi9cblx0ZmlsZV9naXQ6IHN0cmluZztcblxuXHRkYXRhOiBJTm92ZWxTdGF0Q2FjaGUgPSBudWxsO1xuXHRvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zO1xuXG5cdGluaXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiDkvb/nlKggTm92ZWxTdGF0Q2FjaGUuY3JlYXRlKCkg5Luj5pu/XG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0b3B0aW9ucyA9IE5vdmVsU3RhdENhY2hlLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRpZiAoIW9wdGlvbnMuZmlsZSlcblx0XHR7XG5cdFx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihgb3B0aW9ucy5maWxlIGlzIHJlcXVpcmVkYCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuXHRcdHRoaXMuZmlsZSA9IHRoaXMub3B0aW9ucy5maWxlO1xuXHRcdHRoaXMuZmlsZV9naXQgPSB0aGlzLm9wdGlvbnMuZmlsZV9naXQ7XG5cblx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnb3B0aW9ucycsIHRydWUpO1xuXHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdmaWxlJyk7XG5cdFx0ZnJlZXplUHJvcGVydHkodGhpcywgJ2ZpbGVfZ2l0Jyk7XG5cblx0XHR0aGlzLm9wZW4oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDmqqLmn6UgZmlsZSDmmK/lkKblrZjlnKhcblx0ICovXG5cdGV4aXN0cygpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5maWxlICYmIGZzLnBhdGhFeGlzdHNTeW5jKHRoaXMuZmlsZSlcblx0fVxuXG5cdHByb3RlY3RlZCBvcGVuKClcblx0e1xuXHRcdGlmICghdGhpcy5pbml0ZWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0XHRpZiAodGhpcy5leGlzdHMoKSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5kYXRhID0gZnMucmVhZEpTT05TeW5jKHRoaXMuZmlsZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLmZpbGVfZ2l0ICYmIGZzLnBhdGhFeGlzdHNTeW5jKHRoaXMuZmlsZV9naXQpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmRhdGEgPSBmcy5yZWFkSlNPTlN5bmModGhpcy5maWxlX2dpdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRoaXMuZGF0YSA9IHRoaXMuZGF0YSB8fCB7fTtcblxuXHRcdFx0dGhpcy5kYXRhLmhpc3RvcnkgPSB0aGlzLmRhdGEuaGlzdG9yeSB8fCB7fTtcblx0XHRcdHRoaXMuZGF0YS5ub3ZlbHMgPSB0aGlzLmRhdGEubm92ZWxzIHx8IHt9O1xuXHRcdFx0dGhpcy5kYXRhLm1kY29uZiA9IHRoaXMuZGF0YS5tZGNvbmYgfHwge307XG5cblx0XHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdpbml0ZWQnKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmiYDmnInlnKggZGF0YS5ub3ZlbHMgLyBkYXRhLm1kY29uZiDlhaflrZjlnKjnmoQgcGF0aE1haW5cblx0ICovXG5cdHBhdGhNYWluTGlzdCgpXG5cdHtcblx0XHRyZXR1cm4gYXJyYXlfdW5pcXVlKE9iamVjdC5rZXlzKHRoaXMuZGF0YS5ub3ZlbHMpXG5cdFx0XHQuY29uY2F0KE9iamVjdC5rZXlzKHRoaXMuZGF0YS5tZGNvbmYpKSlcblx0XHRcdC5zb3J0KClcblx0XHQ7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIOeahCBub3ZlbCDni4DmhYvpm4blkIhcblx0ICovXG5cdHBhdGhNYWluKHBhdGhNYWluOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0gPSB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXSB8fCB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmjIflrpogcGF0aE1haW4gbm92ZWxJRCDnmoQgbm92ZWwg54uA5oWL57ep5a2YXG5cdCAqL1xuXHRub3ZlbChwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcpXG5cdHtcblx0XHR0aGlzLnBhdGhNYWluKHBhdGhNYWluKTtcblxuXHRcdHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdID0gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF0gfHwge307XG5cblx0XHRyZXR1cm4gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF07XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIG5vdmVsSUQg55qEIG1kY29uZiDos4fmlplcblx0ICovXG5cdG1kY29uZl9nZXQocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gPSB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSB8fCB7fTtcblxuXHRcdHJldHVybiB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXVtub3ZlbElEXTtcblx0fVxuXG5cdC8qKlxuXHQgKiDoqK3lrprmjIflrpogcGF0aE1haW4gbm92ZWxJRCDnmoQgbWRjb25mIOizh+aWmVxuXHQgKi9cblx0bWRjb25mX3NldChwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcsIG1ldGE6IElNZGNvbmZNZXRhKVxuXHR7XG5cdFx0dGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gPSB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSB8fCB7fTtcblxuXHRcdHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dW25vdmVsSURdID0gbWV0YTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRfYmVmb3JlU2F2ZShib29sPzogYm9vbGVhbiB8IG51bWJlcilcblx0e1xuXHRcdGxldCB0aW1lc3RhbXAgPSB0aGlzLnRpbWVzdGFtcDtcblxuXHRcdE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5ub3ZlbHMpXG5cdFx0XHQuZm9yRWFjaCgoW3BhdGhNYWluLCBkYXRhXSwgaSkgPT5cblx0XHRcdHtcblx0XHRcdFx0T2JqZWN0LmVudHJpZXModGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0pXG5cdFx0XHRcdFx0LmZvckVhY2goKFtub3ZlbElELCBkYXRhXSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX2EgPSBbXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5pbml0X2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5lcHViX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5zZWdtZW50X2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKHYgPT4gdiAmJiB2ID4gMClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKCFfYS5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlID0gdGltZXN0YW1wXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlID0gX2Fcblx0XHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBNYXRoLm1pbihhLCBiKTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdHx8IHRpbWVzdGFtcFxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRpZiAodGltZXN0YW1wIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdGxldCBfbGlzdCA9IG5ldyBTZXQ8SU5vdmVsU3RhdENhY2hlTm92ZWw+KCk7XG5cblx0XHRcdGxldCB0b2RheSA9IHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF07XG5cblx0XHRcdGlmICh0b2RheS5lcHViKVxuXHRcdFx0e1xuXHRcdFx0XHRhcnJheV91bmlxdWUodG9kYXkuZXB1Yiwge1xuXHRcdFx0XHRcdG92ZXJ3cml0ZTogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuZXB1Yi5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGNhY2hlU29ydENhbGxiYWNrKGFbMF0sIGJbMF0pXG5cdFx0XHRcdFx0XHR8fCBjYWNoZVNvcnRDYWxsYmFjayhhWzFdLCBiWzFdKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0b2RheS5lcHViX2NvdW50ID0gdG9kYXkuZXB1Yi5sZW5ndGggfCAwO1xuXG5cdFx0XHRcdGlmICghdG9kYXkuZXB1Yl9jb3VudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5lcHViO1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5lcHViX2NvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRvZGF5LmVwdWIuZm9yRWFjaCgodiwgaSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbm92ZWwgPSB0aGlzLm5vdmVsKHZbMF0sIHZbMV0pO1xuXG5cdFx0XHRcdFx0XHRfbGlzdC5hZGQobm92ZWwpO1xuXG5cdFx0XHRcdFx0XHR0b2RheS5lcHViW2ldWzJdID0gbm92ZWw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodG9kYXkuc2VnbWVudClcblx0XHRcdHtcblx0XHRcdFx0YXJyYXlfdW5pcXVlKHRvZGF5LnNlZ21lbnQsIHtcblx0XHRcdFx0XHRvdmVyd3JpdGU6IHRydWUsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LnNlZ21lbnQuc29ydChmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBjYWNoZVNvcnRDYWxsYmFjayhhWzBdLCBiWzBdKVxuXHRcdFx0XHRcdFx0fHwgY2FjaGVTb3J0Q2FsbGJhY2soYVsxXSwgYlsxXSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuc2VnbWVudF9jb3VudCA9IHRvZGF5LnNlZ21lbnQubGVuZ3RoIHwgMDtcblxuXHRcdFx0XHRpZiAoIXRvZGF5LnNlZ21lbnRfY291bnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuc2VnbWVudDtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuc2VnbWVudF9jb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0b2RheS5zZWdtZW50LmZvckVhY2goKHYsIGkpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5vdmVsID0gdGhpcy5ub3ZlbCh2WzBdLCB2WzFdKTtcblxuXHRcdFx0XHRcdFx0X2xpc3QuYWRkKG5vdmVsKTtcblxuXHRcdFx0XHRcdFx0dG9kYXkuc2VnbWVudFtpXVsyXSA9IG5vdmVsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCFPYmplY3Qua2V5cyh0b2RheSkubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRkZWxldGUgdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGJvb2wgPiAxIHx8IGJvb2wgPT0gRW51bUJlZm9yZVNhdmUuT1BUSU1JWkVfQU5EX1VQREFURSlcblx0XHRcdHtcblx0XHRcdFx0X2xpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0bGV0IF9hID0gW1xuXHRcdFx0XHRcdFx0XHRkYXRhLmluaXRfZGF0ZSxcblx0XHRcdFx0XHRcdFx0ZGF0YS5lcHViX2RhdGUsXG5cdFx0XHRcdFx0XHRcdGRhdGEuc2VnbWVudF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9kYXRlLFxuXHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0LmZpbHRlcih2ID0+IHYgJiYgdiA+IDApXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0bGV0IG9sZCA9IGRhdGEudXBkYXRlX2RhdGU7XG5cblx0XHRcdFx0XHRpZiAoIV9hLmxlbmd0aCB8fCB0cnVlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUgPSB0aW1lc3RhbXBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUgPSBfYVxuXHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIE1hdGgubWF4KGEsIGIpO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHR8fCB0aW1lc3RhbXBcblx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAob2xkICE9PSBkYXRhLnVwZGF0ZV9kYXRlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2NvdW50ID0gKGRhdGEudXBkYXRlX2NvdW50IHwgMCkgKyAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQga3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cblx0XHRpZiAoa3MubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGxldCBoID0gdGhpcy5kYXRhLmhpc3Rvcnk7XG5cblx0XHRcdGtzLmZvckVhY2goZnVuY3Rpb24gKGspXG5cdFx0XHR7XG5cdFx0XHRcdGlmICghT2JqZWN0LmtleXMoaFtrXSkubGVuZ3RoKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGVsZXRlIGhba107XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoa3MubGVuZ3RoID49IHRoaXMub3B0aW9ucy5oaXN0b3J5X21heClcblx0XHRcdHtcblx0XHRcdFx0a3Muc29ydCgpLnNsaWNlKDAsICgwIC0gdGhpcy5vcHRpb25zLmhpc3Rvcnlfa2VlcCkpLmZvckVhY2goayA9PiBkZWxldGUgdGhpcy5kYXRhLmhpc3Rvcnlba10pXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c29ydE9iamVjdCh0aGlzLmRhdGEsIHtcblx0XHRcdHVzZVNvdXJjZTogdHJ1ZSxcblx0XHRcdGtleXM6IFtcblx0XHRcdFx0J2hpc3RvcnknLFxuXHRcdFx0XHQnbm92ZWxzJyxcblx0XHRcdFx0J21kY29uZicsXG5cdFx0XHRdLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5bCH6LOH5paZ5YSy5a2Y6IezIGZpbGVcblx0ICpcblx0ICogQHBhcmFtIGJvb2wgLSDmuIXnkIbnianku7blpJrppJjos4fmlplcblx0ICovXG5cdHB1YmxpYyBzYXZlKGJvb2w/OiBib29sZWFuIHwgbnVtYmVyIHwgRW51bUJlZm9yZVNhdmUpXG5cdHtcblx0XHRpZiAodGhpcy5vcHRpb25zLnJlYWRvbmx5KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgb3B0aW9ucy5yZWFkb25seSBpcyBzZXQsIGNhbid0IG5vdCBzYXZlIGZpbGVgKVxuXHRcdH1cblxuXHRcdGZzLm91dHB1dEpTT05TeW5jKHRoaXMuZmlsZSwgdGhpcy50b0pTT04oYm9vbCB8fCB0cnVlKSwge1xuXHRcdFx0c3BhY2VzOiAyLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIHRpbWVzdGFtcFxuXHQgKi9cblx0Z2V0IHRpbWVzdGFtcCgpXG5cdHtcblx0XHRyZXR1cm4gdG9kYXlNb21lbnRUaW1lc3RhbXA7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHRpbWVzdGFtcCDnmoQgaGlzdG9yeSDos4fmlplcblx0ICovXG5cdGhpc3RvcnkodGltZXN0YW1wOiBudW1iZXIgfCBzdHJpbmcpXG5cdHtcblx0XHRpZiAodGltZXN0YW1wIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aJgOaciSBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeXMoKVxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5oaXN0b3J5KVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+WJjeS4gOasoeeahCBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeVByZXYoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGtzOiBzdHJpbmdbXTtcblxuXHRcdGlmICh0aW1lc3RhbXAgaW4gdGhpcy5kYXRhLmhpc3RvcnkpXG5cdFx0e1xuXHRcdFx0a3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cdFx0XHRrcy5wb3AoKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGtzID0gT2JqZWN0LmtleXModGhpcy5kYXRhLmhpc3RvcnkpO1xuXHRcdH1cblxuXHRcdGxldCBrID0ga3MucG9wKCk7XG5cblx0XHRpZiAoayBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3Rvcnlba107XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5VG9kYXkoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGRhdGEgPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdID0gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXSB8fCB7fTtcblxuXHRcdGRhdGEuZXB1Yl9jb3VudCA9IGRhdGEuZXB1Yl9jb3VudCB8IDA7XG5cdFx0ZGF0YS5lcHViID0gZGF0YS5lcHViIHx8IFtdO1xuXG5cdFx0ZGF0YS5zZWdtZW50X2NvdW50ID0gZGF0YS5zZWdtZW50X2NvdW50IHwgMDtcblx0XHRkYXRhLnNlZ21lbnQgPSBkYXRhLnNlZ21lbnQgfHwgW107XG5cblx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblx0fVxuXG5cdHN0YXRpYyBmaXhPcHRpb25zKG9wdGlvbnM/OiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0b3B0aW9ucyA9IHtcblx0XHRcdGZpbGVfZ2l0OiB1bmRlZmluZWQsXG5cdFx0XHRmaWxlOiB1bmRlZmluZWQsXG5cdFx0XHQuLi4oZGVmYXVsdE9wdGlvbnMgYXMgSU5vdmVsU3RhdENhY2hlT3B0aW9ucyksXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdH07XG5cblx0XHRvcHRpb25zLmhpc3RvcnlfbWF4ID0gb3B0aW9ucy5oaXN0b3J5X21heCA+IDAgPyBvcHRpb25zLmhpc3RvcnlfbWF4IDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9tYXg7XG5cblx0XHRvcHRpb25zLmhpc3Rvcnlfa2VlcCA9IG9wdGlvbnMuaGlzdG9yeV9rZWVwID4gMCA/IG9wdGlvbnMuaGlzdG9yeV9rZWVwIDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9rZWVwO1xuXG5cdFx0b3B0aW9ucyA9IGJhc2VTb3J0T2JqZWN0KG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICog5bu656uLIE5vdmVsU3RhdENhY2hlIOeJqeS7tlxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zPzogSU5vdmVsU3RhdENhY2hlT3B0aW9ucylcblx0e1xuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRpZiAob3BlbmVkTWFwLmhhcyhvcHRpb25zKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gb3BlbmVkTWFwLmdldChvcHRpb25zKTtcblx0XHR9XG5cblx0XHRsZXQgb2JqID0gbmV3IHRoaXMob3B0aW9ucyk7XG5cblx0XHRvcGVuZWRNYXAuc2V0KG9wdGlvbnMsIG9iaik7XG5cblx0XHRyZXR1cm4gb2JqO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBib29sIC0g5riF55CG54mp5Lu25aSa6aSY6LOH5paZXG5cdCAqL1xuXHR0b0pTT04oYm9vbD86IGJvb2xlYW4gfCBudW1iZXIgfCBFbnVtQmVmb3JlU2F2ZSlcblx0e1xuXHRcdGlmIChib29sKVxuXHRcdHtcblx0XHRcdHRoaXMuX2JlZm9yZVNhdmUoYm9vbClcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZGF0YTtcblx0fVxuXG59XG5cbmV4cG9ydCBlbnVtIEVudW1CZWZvcmVTYXZlXG57XG5cdE5PTkUgPSAwLFxuXHRPUFRJTUlaRSA9IDEsXG5cdE9QVElNSVpFX0FORF9VUERBVEUgPSAyLFxufVxuXG5Ob3ZlbFN0YXRDYWNoZS5maXhPcHRpb25zID0gTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucy5iaW5kKE5vdmVsU3RhdENhY2hlKTtcbk5vdmVsU3RhdENhY2hlLmNyZWF0ZSA9IE5vdmVsU3RhdENhY2hlLmNyZWF0ZS5iaW5kKE5vdmVsU3RhdENhY2hlKTtcblxuY29uc3QgeyBjcmVhdGUsIGZpeE9wdGlvbnMgfSA9IE5vdmVsU3RhdENhY2hlO1xuZXhwb3J0IHsgY3JlYXRlLCBmaXhPcHRpb25zIH1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTdGF0Q2FjaGUuY3JlYXRlXG5leHBvcnRzID0gT2JqZWN0LmZyZWV6ZShleHBvcnRzKTtcbiJdfQ==