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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgscUNBTW9CO0FBVVgsdUJBWlIsbUJBQVksQ0FZUTtBQU5yQiwrQkFBZ0M7QUFDaEMsMkRBQWtEO0FBQ2xELGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBbUQsQ0FBQztBQXNNakYsTUFBTSxjQUFjLEdBQThDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFL0UsV0FBVyxFQUFFLEVBQUU7SUFDZixZQUFZLEVBQUUsQ0FBQztDQUVmLENBQUMsQ0FBQztBQUVIOzs7OztHQUtHO0FBQ0gsTUFBYSxjQUFjO0lBZ0IxQjs7OztPQUlHO0lBQ0gsWUFBWSxPQUErQjtRQVYzQyxTQUFJLEdBQW9CLElBQUksQ0FBQztRQUc3QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBU3ZCLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxHQUFZLEtBQUssQ0FBQztRQUUxQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQ2hCO1lBQ0MsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUN6RjtnQkFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNqRDtZQUNDLE1BQU0sSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNqRDthQUVE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QUF3QztRQUU5QyxJQUFJLElBQUksRUFDUjtZQUNDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDdEI7UUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQztDQUVEO0FBM29CRCx3Q0Eyb0JDO0FBRUQsSUFBWSxjQUtYO0FBTEQsV0FBWSxjQUFjO0lBRXpCLG1EQUFRLENBQUE7SUFDUiwyREFBWSxDQUFBO0lBQ1osaUZBQXVCLENBQUE7QUFDeEIsQ0FBQyxFQUxXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBS3pCO0FBRUQsSUFBWSxtQkFjWDtBQWRELFdBQVksbUJBQW1CO0lBRTlCOztPQUVHO0lBQ0gsNkRBQWEsQ0FBQTtJQUNiOztPQUVHO0lBQ0gsMkVBQW9CLENBQUE7SUFDcEI7O09BRUc7SUFDSCwyRUFBb0IsQ0FBQTtBQUNyQixDQUFDLEVBZFcsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFjOUI7QUFFRCxjQUFjLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNFLGNBQWMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDbkUsY0FBYyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUVuRixNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsR0FBRyxjQUFjLENBQUM7QUFDckQsd0JBQU07QUFBRSxnQ0FBVTtBQUFFLHdDQUFjO0FBRTNDLGtCQUFlLGNBQWMsQ0FBQyxNQUFNLENBQUE7QUFDcEMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzEvNi8wMDYuXG4gKi9cblxuaW1wb3J0IHRvZGF5TW9tZW50VGltZXN0YW1wLCB7XG5cdGJhc2VTb3J0T2JqZWN0LFxuXHRjYWNoZVNvcnRDYWxsYmFjayxcblx0ZnJlZXplUHJvcGVydHksXG5cdGNyZWF0ZU1vbWVudCxcblx0bmF0dXJhbENvbXBhcmUsXG59IGZyb20gJy4vbGliL3V0aWwnO1xuaW1wb3J0IHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgc29ydE9iamVjdCA9IHJlcXVpcmUoJ3NvcnQtb2JqZWN0LWtleXMyJyk7XG5cbmNvbnN0IG9wZW5lZE1hcCA9IG5ldyBXZWFrTWFwPFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4sIE5vdmVsU3RhdENhY2hlPigpO1xuXG5leHBvcnQgeyBjcmVhdGVNb21lbnQgfVxuXG4vKipcbiAqIOaJgOaciSB0aW1lc3RhbXAg54K6IFVuaXggdGltZXN0YW1wIGluIG1pbGxpc2Vjb25kcyDngrogdXRjICs4XG4gKiBwYXRoTWFpbiDngrog5Li76LOH5aS+5ZCN56ixXG4gKiBub3ZlbElEIOeCuiDlsI/oqqros4fmlpnlpL7lkI3nqLFcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVcbntcblxuXHRtZXRhPzoge1xuXHRcdHRvZGF5VGltZXN0YW1wPzogbnVtYmVyLFxuXHRcdHRpbWVzdGFtcD86IG51bWJlcixcblx0fSxcblxuXHQvKipcblx0ICog5bCP6Kqq57ep5a2Y54uA5oWLXG5cdCAqL1xuXHRub3ZlbHM6IHtcblx0XHRbcGF0aE1haW46IHN0cmluZ106IHtcblx0XHRcdFtub3ZlbElEOiBzdHJpbmddOiBJTm92ZWxTdGF0Q2FjaGVOb3ZlbCxcblx0XHR9LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiDmrbflj7LntIDpjIRcblx0ICovXG5cdGhpc3Rvcnk6IHtcblx0XHRbdGltZXN0YW1wOiBzdHJpbmddOiBJTm92ZWxTdGF0Q2FjaGVIaXN0b3J5LFxuXHRcdFt0aW1lc3RhbXA6IG51bWJlcl06IElOb3ZlbFN0YXRDYWNoZUhpc3RvcnksXG5cdH0sXG5cblx0LyoqXG5cdCAqIOmAj+mBjiBub2RlLW5vdmVsLWNvbmYg6Kej5p6Q6YGO55qEIE1FVEEg6LOH5paZIChSRUFETUUubWQpXG5cdCAqL1xuXHRtZGNvbmY6IHtcblx0XHRbcGF0aE1haW46IHN0cmluZ106IHtcblx0XHRcdFtub3ZlbElEOiBzdHJpbmddOiBJTWRjb25mTWV0YSxcblx0XHR9LFxuXHR9LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZU5vdmVsXG57XG5cdC8qKlxuXHQgKiBzZWdtZW50IOabtOaWsOaZgumWk1xuXHQgKi9cblx0c2VnbWVudF9kYXRlPzogbnVtYmVyLFxuXHQvKipcblx0ICogZXB1YiDmm7TmlrDmmYLplpNcblx0ICovXG5cdGVwdWJfZGF0ZT86IG51bWJlcixcblxuXHQvKipcblx0ICog5Yid5aeL5YyW5pmC6ZaTXG5cdCAqL1xuXHRpbml0X2RhdGU/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIOe4veeroC/ljbfmlbjph49cblx0ICovXG5cdHZvbHVtZT86IG51bWJlcixcblx0LyoqXG5cdCAqIOe4veipseaVuFxuXHQgKi9cblx0Y2hhcHRlcj86IG51bWJlcixcblxuXHQvKipcblx0ICog5LiK5qyh55qE57i956ugL+WNt+aVuOmHj1xuXHQgKi9cblx0dm9sdW1lX29sZD86IG51bWJlcixcblx0LyoqXG5cdCAqIOS4iuasoeeahOe4veipseaVuFxuXHQgKi9cblx0Y2hhcHRlcl9vbGQ/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIHNlZ21lbnQg6K6K5YuV5pW46YePXG5cdCAqL1xuXHRzZWdtZW50PzogbnVtYmVyLFxuXHQvKipcblx0ICog5LiK5qyh55qEIHNlZ21lbnQg6K6K5YuV5pW46YePXG5cdCAqL1xuXHRzZWdtZW50X29sZD86IG51bWJlcixcblxuXHQvKipcblx0ICog5bCP6Kqq54uA5oWLIGZsYWcg5qC55pOaIHJlYWRtZS5tZCDlhafoqK3lrppcblx0ICovXG5cdG5vdmVsX3N0YXR1cz86IEVudW1Ob3ZlbFN0YXR1cyxcblxuXHQvKipcblx0ICog5pyA5b6M6K6K5YuV5pmC6ZaTXG5cdCAqL1xuXHR1cGRhdGVfZGF0ZT86IG51bWJlcjtcblx0LyoqXG5cdCAqIOe0gOmMhOiuiuWLleasoeaVuFxuXHQgKi9cblx0dXBkYXRlX2NvdW50PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBlcHViIGZpbGVuYW1lXG5cdCAqL1xuXHRlcHViX2Jhc2VuYW1lPzogc3RyaW5nLFxuXHR0eHRfYmFzZW5hbWU/OiBzdHJpbmcsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU3RhdENhY2hlSGlzdG9yeVxue1xuXHQvKipcblx0ICog5pys5qyh6KiY6YyE5YWn55qEIGVwdWIg57i95pW4XG5cdCAqL1xuXHRlcHViX2NvdW50PzogbnVtYmVyLFxuXHQvKipcblx0ICog5pys5qyh6KiY6YyE5YWn55qEIGVwdWJcblx0ICovXG5cdGVwdWI/OiBBcnJheTxbc3RyaW5nLCBzdHJpbmcsIElOb3ZlbFN0YXRDYWNoZU5vdmVsP10+LFxuXHRzZWdtZW50X2NvdW50PzogbnVtYmVyLFxuXHRzZWdtZW50PzogQXJyYXk8W3N0cmluZywgc3RyaW5nLCBJTm92ZWxTdGF0Q2FjaGVOb3ZlbD9dPixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zXG57XG5cdC8qKlxuXHQgKiDoroDlr6vnt6nlrZjnmoTnm67mqJkganNvbiDot6/lvpFcblx0ICovXG5cdGZpbGU6IHN0cmluZyxcblx0LyoqXG5cdCAqIOeVtiBmaWxlIOS4jeWtmOWcqOaZguWYl+ippuiugOWPluatpOaqlOahiFxuXHQgKi9cblx0ZmlsZV9naXQ/OiBzdHJpbmcsXG5cblx0LyoqXG5cdCAqIOemgeatouWwh+izh+aWmeWvq+WbnuaqlOahiFxuXHQgKi9cblx0cmVhZG9ubHk/OiBib29sZWFuLFxuXG5cdGhpc3RvcnlfbWF4PzogbnVtYmVyLFxuXHRoaXN0b3J5X2tlZXA/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIG9wdGlvbnMucmVhZG9ubHkgJiYgb3B0aW9ucy5kYXRhIOW/hemgiOWQjOaZguWVn+eUqFxuXHQgKi9cblx0ZGF0YT86IElOb3ZlbFN0YXRDYWNoZSxcbn1cblxuLyoqXG4gKiDlj5blvpflsI/oqqrnmoTmnIDntYLni4DmhYso6aCQ6Kit5pmCKVxuICog5L6L5aaCIOeVtiDlkIzmmYLlrZjlnKggeHh4IOiIhyB4eHhfb3V0IOaZgu+8jOWPquacg+WbnuWCsyB4eHhfb3V0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlck5vdmVsRGF0YVxue1xuXHQvKipcblx0ICog5a+m6Zqb5LiK55qEIHBhdGhNYWluXG5cdCAqL1xuXHRwYXRoTWFpbjogc3RyaW5nLFxuXHQvKipcblx0ICog5rKS5pyJIG91dCDliY3nmoQgcGF0aE1haW4g6Lev5b6RXG5cdCAqL1xuXHRwYXRoTWFpbl9iYXNlOiBzdHJpbmcsXG5cdG5vdmVsSUQ6IHN0cmluZyxcblxuXHQvKipcblx0ICog6Kej5p6QIFJFQURNRS5tZCDlvoznmoTos4fmlplcblx0ICovXG5cdG1kY29uZjogSU1kY29uZk1ldGEsXG5cdC8qKlxuXHQgKiDlkIjkvbUgb3V0IOWJjeiIhyBvdXQg5b6M55qE57ep5a2Y6LOH5paZXG5cdCAqL1xuXHRjYWNoZTogSU5vdmVsU3RhdENhY2hlTm92ZWwsXG5cblx0LyoqXG5cdCAqIOatpOWwj+iqquaYryBvdXQg5b6M5bCP6KqqXG5cdCAqL1xuXHRpc19vdXQ6IGJvb2xlYW4sXG5cdC8qKlxuXHQgKiDmmK/lkKblrZjlnKjmraTlsI/oqqogb3V0IOWJjeeahOizh+aWmVxuXHQgKiDlpKfpg6jliIbni4Dms4HkuIvmraTlgLzpg73mmK/ngrogdHJ1ZSDkvYblsJHpg6jliIbmg4Xms4HkuIvmnIPmnInlhbbku5blgLxcblx0ICpcblx0ICog5L6L5aaCXG5cdCAqIGNtIOS4i+eahOWkp+WkmumDveaykuacieWtmOWcqCBvdXQg5b6M6LOH5paZIOaJgOS7peacg+WbnuWCsyB1bmRlZmluZWRcblx0ICogei5hYmFuZG9uIOS4i+Wkp+WkmumDveWPquWtmOWcqCBvdXQg5b6M6LOH5paZIOaJgOS7peacg+WbnuWCsyBmYWxzZVxuXHQgKi9cblx0YmFzZV9leGlzdHM6IGJvb2xlYW4sXG59XG5cbi8qKlxuICog54K65LqG57Wx5LiA6IiH5p6a6IiJ5pa55L6/IHBhdGhNYWluIOacg+e1seS4gOeCuiDln7rnpI7lkI0o5Lmf5bCx5piv5rKS5pyJIF9vdXQpXG4gKiDlr6bpmpvkuIrnmoQgcGF0aE1haW4g6KuL55SxIElGaWx0ZXJOb3ZlbERhdGEg5YWn5Y+W5b6XXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSUZpbHRlck5vdmVsXG57XG5cdFtwYXRoTWFpbjogc3RyaW5nXToge1xuXHRcdFtub3ZlbElEOiBzdHJpbmddOiBJRmlsdGVyTm92ZWxEYXRhLFxuXHR9LFxufVxuXG5jb25zdCBkZWZhdWx0T3B0aW9uczogUmVhZG9ubHk8UGFydGlhbDxJTm92ZWxTdGF0Q2FjaGVPcHRpb25zPj4gPSBPYmplY3QuZnJlZXplKHtcblxuXHRoaXN0b3J5X21heDogMTQsXG5cdGhpc3Rvcnlfa2VlcDogNyxcblxufSk7XG5cbi8qKlxuICog6YCP6YGO6Kej5p6QIG5vdmVsLXN0YXQuanNvbiDkvoblj5blvpflsI/oqqrni4DmhYtcbiAqIOS5n+WboOatpOWmguaenCBub3ZlbC1zdGF0Lmpzb24g5YWn5rKS5pyJ57SA6YyE5oiW6ICF5rKS5pyJ5pu05paw55qE5bCx5pyD5Yik5pa35LiN57K+5rqWXG4gKlxuICogQGV4YW1wbGUgTm92ZWxTdGF0Q2FjaGUuY3JlYXRlKClcbiAqL1xuZXhwb3J0IGNsYXNzIE5vdmVsU3RhdENhY2hlXG57XG5cdC8qKlxuXHQgKiDoroDlr6vnt6nlrZjnmoTnm67mqJkganNvbiDot6/lvpFcblx0ICovXG5cdGZpbGU6IHN0cmluZztcblx0LyoqXG5cdCAqIOeVtiBmaWxlIOS4jeWtmOWcqOaZguWYl+ippuiugOWPluatpOaqlOahiFxuXHQgKi9cblx0ZmlsZV9naXQ6IHN0cmluZztcblxuXHRkYXRhOiBJTm92ZWxTdGF0Q2FjaGUgPSBudWxsO1xuXHRvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zO1xuXG5cdGluaXRlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiDkvb/nlKggTm92ZWxTdGF0Q2FjaGUuY3JlYXRlKCkg5Luj5pu/XG5cdCAqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0b3B0aW9ucyA9IE5vdmVsU3RhdENhY2hlLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRsZXQgX2NoazogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdFx0aWYgKG9wdGlvbnMuZGF0YSlcblx0XHR7XG5cdFx0XHRpZiAoIShvcHRpb25zLmRhdGEgJiYgb3B0aW9ucy5kYXRhLmhpc3RvcnkgJiYgb3B0aW9ucy5kYXRhLm5vdmVscyAmJiBvcHRpb25zLmRhdGEubWRjb25mKSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgb3B0aW9ucy5kYXRhIGlzIG5vdCBhbGxvdyBkYXRhYCk7XG5cdFx0XHR9XG5cblx0XHRcdF9jaGsgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICghb3B0aW9ucy5maWxlICYmICghb3B0aW9ucy5yZWFkb25seSB8fCAhX2NoaykpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoYG9wdGlvbnMuZmlsZSBpcyByZXF1aXJlZGApO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0ZGVsZXRlIG9wdGlvbnMuZGF0YTtcblx0XHR9XG5cblx0XHR0aGlzLl9pbml0KG9wdGlvbnMpO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9pbml0KG9wdGlvbnM6IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMpXG5cdHtcblx0XHRpZiAob3B0aW9ucy5kYXRhKVxuXHRcdHtcblx0XHRcdHRoaXMuZGF0YSA9IG9wdGlvbnMuZGF0YTtcblx0XHR9XG5cblx0XHRkZWxldGUgb3B0aW9ucy5kYXRhO1xuXG5cdFx0dGhpcy5vcHRpb25zID0gb3B0aW9ucztcblxuXHRcdHRoaXMuZmlsZSA9IHRoaXMub3B0aW9ucy5maWxlO1xuXHRcdHRoaXMuZmlsZV9naXQgPSB0aGlzLm9wdGlvbnMuZmlsZV9naXQ7XG5cblx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnb3B0aW9ucycsIHRydWUpO1xuXHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdmaWxlJyk7XG5cdFx0ZnJlZXplUHJvcGVydHkodGhpcywgJ2ZpbGVfZ2l0Jyk7XG5cblx0XHR0aGlzLm9wZW4oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiDmqqLmn6UgZmlsZSDmmK/lkKblrZjlnKhcblx0ICovXG5cdGV4aXN0cygpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5maWxlICYmIGZzLnBhdGhFeGlzdHNTeW5jKHRoaXMuZmlsZSlcblx0fVxuXG5cdHByb3RlY3RlZCBvcGVuKClcblx0e1xuXHRcdGlmICghdGhpcy5pbml0ZWQpXG5cdFx0e1xuXHRcdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0XHRpZiAodGhpcy5kYXRhKVxuXHRcdFx0e1xuXHRcdFx0XHQvL1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5leGlzdHMoKSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5kYXRhID0gZnMucmVhZEpTT05TeW5jKHRoaXMuZmlsZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0aGlzLmZpbGVfZ2l0ICYmIGZzLnBhdGhFeGlzdHNTeW5jKHRoaXMuZmlsZV9naXQpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmRhdGEgPSBmcy5yZWFkSlNPTlN5bmModGhpcy5maWxlX2dpdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHRoaXMuZGF0YSA9IHRoaXMuZGF0YSB8fCB7fTtcblxuXHRcdFx0dGhpcy5kYXRhLmhpc3RvcnkgPSB0aGlzLmRhdGEuaGlzdG9yeSB8fCB7fTtcblx0XHRcdHRoaXMuZGF0YS5ub3ZlbHMgPSB0aGlzLmRhdGEubm92ZWxzIHx8IHt9O1xuXHRcdFx0dGhpcy5kYXRhLm1kY29uZiA9IHRoaXMuZGF0YS5tZGNvbmYgfHwge307XG5cdFx0XHR0aGlzLmRhdGEubWV0YSA9IHRoaXMuZGF0YS5tZXRhIHx8IHt9O1xuXG5cdFx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnaW5pdGVkJyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5omA5pyJ5ZyoIGRhdGEubm92ZWxzIC8gZGF0YS5tZGNvbmYg5YWn5a2Y5Zyo55qEIHBhdGhNYWluXG5cdCAqL1xuXHRwYXRoTWFpbkxpc3QoKVxuXHR7XG5cdFx0cmV0dXJuIGFycmF5X3VuaXF1ZShPYmplY3Qua2V5cyh0aGlzLmRhdGEubm92ZWxzKVxuXHRcdFx0LmNvbmNhdChPYmplY3Qua2V5cyh0aGlzLmRhdGEubWRjb25mKSkpXG5cdFx0XHQuc29ydCgpXG5cdFx0XHQ7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5omA5pyJ5bCP6Kqq55qE5pyA57WC54uA5oWLKOmgkOioreaZgilcblx0ICog5L6L5aaCIOeVtiDlkIzmmYLlrZjlnKggeHh4IOiIhyB4eHhfb3V0IOaZgu+8jOWPquacg+WbnuWCsyB4eHhfb3V0XG5cdCAqL1xuXHRmaWx0ZXJOb3ZlbCh0eXBlOiBFbnVtRmlsdGVyTm92ZWxUeXBlID0gRW51bUZpbHRlck5vdmVsVHlwZS5ERVNUKVxuXHR7XG5cdFx0bGV0IGtzID0gdGhpcy5wYXRoTWFpbkxpc3QoKTtcblx0XHRsZXQgc2VsZiA9IHRoaXM7XG5cblx0XHRpZiAodHlwZSAmIEVudW1GaWx0ZXJOb3ZlbFR5cGUuU09VUkNFX09OTFkpXG5cdFx0e1xuXHRcdFx0a3MgPSBrcy5maWx0ZXIocGF0aE1haW4gPT4gIS9fb3V0JC8udGVzdChwYXRoTWFpbikpXG5cdFx0fVxuXHRcdGVsc2UgaWYgKHR5cGUgJiBFbnVtRmlsdGVyTm92ZWxUeXBlLk9VVFBVVF9PTkxZKVxuXHRcdHtcblx0XHRcdGtzID0ga3MuZmlsdGVyKHBhdGhNYWluID0+IC9fb3V0JC8udGVzdChwYXRoTWFpbikpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGtzXG5cdFx0XHQuc29ydChmdW5jdGlvbiAoYSwgYilcblx0XHRcdHtcblx0XHRcdFx0aWYgKGEucmVwbGFjZSgvX291dCQvLCAnJykgPT09IGIucmVwbGFjZSgvX291dCQvLCAnJykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoL19vdXQkLy50ZXN0KGEpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBuYXR1cmFsQ29tcGFyZShhLCBiKTtcblx0XHRcdH0pXG5cdFx0XHQucmVkdWNlKChscywgcGF0aE1haW4pID0+XG5cdFx0XHR7XG5cblx0XHRcdFx0bGV0IF9tID0gcGF0aE1haW4ubWF0Y2goL14oLis/KShfb3V0KT8kLyk7XG5cblx0XHRcdFx0bGV0IGlzX291dCA9ICEhX21bMl07XG5cdFx0XHRcdGxldCBwYXRoTWFpbl9iYXNlID0gX21bMV07XG5cblx0XHRcdFx0bHNbcGF0aE1haW5fYmFzZV0gPSBsc1twYXRoTWFpbl9iYXNlXSB8fCB7fTtcblxuXHRcdFx0XHRPYmplY3QuZW50cmllcyhzZWxmLl9tZGNvbmZfZ2V0X21haW4ocGF0aE1haW4pKVxuXHRcdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChbbm92ZWxJRCwgbWRjb25mXSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgY2FjaGUgPSB7XG5cdFx0XHRcdFx0XHRcdC4uLnNlbGYubm92ZWwocGF0aE1haW4sIG5vdmVsSUQpLFxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0bGV0IGJhc2VfZXhpc3RzOiBib29sZWFuO1xuXG5cdFx0XHRcdFx0XHRpZiAoaXNfb3V0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgX3NyYyA9IHNlbGYubm92ZWxFeGlzdHMocGF0aE1haW5fYmFzZSwgbm92ZWxJRCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKF9zcmMpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQoW1xuXHRcdFx0XHRcdFx0XHRcdFx0J3NlZ21lbnQnLFxuXHRcdFx0XHRcdFx0XHRcdFx0J3NlZ21lbnRfZGF0ZScsXG5cdFx0XHRcdFx0XHRcdFx0XHQnc2VnbWVudF9vbGQnLFxuXHRcdFx0XHRcdFx0XHRcdF0gYXMgKGtleW9mIElOb3ZlbFN0YXRDYWNoZU5vdmVsKVtdKVxuXHRcdFx0XHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKGtleSlcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKF9zcmNba2V5XSAhPSBudWxsKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2FjaGVba2V5XSA9IF9zcmNba2V5XVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdDtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGJhc2VfZXhpc3RzID0gISFfc3JjO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsc1twYXRoTWFpbl9iYXNlXVtub3ZlbElEXSA9IHtcblx0XHRcdFx0XHRcdFx0cGF0aE1haW4sXG5cdFx0XHRcdFx0XHRcdHBhdGhNYWluX2Jhc2UsXG5cdFx0XHRcdFx0XHRcdG5vdmVsSUQsXG5cblx0XHRcdFx0XHRcdFx0bWRjb25mLFxuXHRcdFx0XHRcdFx0XHRjYWNoZSxcblxuXHRcdFx0XHRcdFx0XHRpc19vdXQsXG5cdFx0XHRcdFx0XHRcdGJhc2VfZXhpc3RzLFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIGxzO1xuXHRcdFx0fSwge30gYXMgSUZpbHRlck5vdmVsKVxuXHR9XG5cblx0LyoqXG5cdCAqICjoq4vlsI/lv4Pkvb/nlKgpIOenu+mZpOaMh+WumiBwYXRoTWFpbiAmIG5vdmVsSURcblx0ICovXG5cdHJlbW92ZShwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcpXG5cdHtcblx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdGlmICh0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXSlcblx0XHR7XG5cdFx0XHRib29sID0gYm9vbCB8fCAhIXRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdO1xuXG5cdFx0XHRkZWxldGUgdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0pXG5cdFx0e1xuXHRcdFx0Ym9vbCA9IGJvb2wgfHwgISF0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXVtub3ZlbElEXTtcblxuXHRcdFx0ZGVsZXRlIHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dW25vdmVsSURdXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGJvb2w7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIOeahCBub3ZlbCDni4DmhYvpm4blkIhcblx0ICovXG5cdHBhdGhNYWluKHBhdGhNYWluOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0gPSB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXSB8fCB7fTtcblx0fVxuXG5cdG5vdmVsRXhpc3RzKHBhdGhNYWluOiBzdHJpbmcsIG5vdmVsSUQ6IHN0cmluZyk6IElOb3ZlbFN0YXRDYWNoZU5vdmVsXG5cdHtcblx0XHRpZiAodGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1cblx0XHRcdCYmIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdXG5cdFx0XHQmJiBPYmplY3Qua2V5cyh0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSkubGVuZ3RoXG5cdFx0XHQmJiB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIG5vdmVsSUQg55qEIG5vdmVsIOeLgOaFi+e3qeWtmFxuXHQgKi9cblx0bm92ZWwocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nKVxuXHR7XG5cdFx0dGhpcy5wYXRoTWFpbihwYXRoTWFpbik7XG5cblx0XHR0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSA9IHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdIHx8IHt9O1xuXG5cdFx0cmV0dXJuIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdO1xuXHR9XG5cblx0cHJvdGVjdGVkIF9tZGNvbmZfZ2V0X21haW4ocGF0aE1haW46IHN0cmluZylcblx0e1xuXHRcdHJldHVybiB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSB8fCB7fTtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmjIflrpogcGF0aE1haW4gbm92ZWxJRCDnmoQgbWRjb25mIOizh+aWmVxuXHQgKi9cblx0bWRjb25mX2dldChwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcpOiBJTWRjb25mTWV0YVxuXHR7XG5cdFx0bGV0IF9kYXRhID0gdGhpcy5fbWRjb25mX2dldF9tYWluKHBhdGhNYWluKTtcblxuXHRcdHJldHVybiBfZGF0YVtub3ZlbElEXTtcblx0fVxuXG5cdC8qKlxuXHQgKiDoqK3lrprmjIflrpogcGF0aE1haW4gbm92ZWxJRCDnmoQgbWRjb25mIOizh+aWmVxuXHQgKi9cblx0bWRjb25mX3NldChwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcsIG1ldGE6IElNZGNvbmZNZXRhKVxuXHR7XG5cdFx0dGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gPSB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXSB8fCB7fTtcblxuXHRcdHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dW25vdmVsSURdID0gbWV0YTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBkZXByZWNhdGVkXG5cdCAqL1xuXHRfYmVmb3JlU2F2ZShib29sPzogYm9vbGVhbiB8IG51bWJlcilcblx0e1xuXHRcdGxldCB0aW1lc3RhbXAgPSB0aGlzLnRpbWVzdGFtcDtcblxuXHRcdE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5ub3ZlbHMpXG5cdFx0XHQuZm9yRWFjaCgoW3BhdGhNYWluLCBkYXRhXSwgaSkgPT5cblx0XHRcdHtcblx0XHRcdFx0T2JqZWN0LmVudHJpZXModGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0pXG5cdFx0XHRcdFx0LmZvckVhY2goKFtub3ZlbElELCBkYXRhXSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgX2EgPSBbXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5pbml0X2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5lcHViX2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS5zZWdtZW50X2RhdGUsXG5cdFx0XHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSxcblx0XHRcdFx0XHRcdFx0XVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKHYgPT4gdiAmJiB2ID4gMClcblx0XHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdFx0aWYgKCFfYS5sZW5ndGgpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlID0gdGltZXN0YW1wXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlID0gX2Fcblx0XHRcdFx0XHRcdFx0XHQucmVkdWNlKChhLCBiKSA9PlxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBNYXRoLm1pbihhLCBiKTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdHx8IHRpbWVzdGFtcFxuXHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHQ7XG5cblx0XHRpZiAodGltZXN0YW1wIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdGxldCBfbGlzdCA9IG5ldyBTZXQ8SU5vdmVsU3RhdENhY2hlTm92ZWw+KCk7XG5cblx0XHRcdGxldCB0b2RheSA9IHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF07XG5cblx0XHRcdGlmICh0b2RheS5lcHViKVxuXHRcdFx0e1xuXHRcdFx0XHRhcnJheV91bmlxdWUodG9kYXkuZXB1Yiwge1xuXHRcdFx0XHRcdG92ZXJ3cml0ZTogdHJ1ZSxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuZXB1Yi5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGNhY2hlU29ydENhbGxiYWNrKGFbMF0sIGJbMF0pXG5cdFx0XHRcdFx0XHR8fCBjYWNoZVNvcnRDYWxsYmFjayhhWzFdLCBiWzFdKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0b2RheS5lcHViX2NvdW50ID0gdG9kYXkuZXB1Yi5sZW5ndGggfCAwO1xuXG5cdFx0XHRcdGlmICghdG9kYXkuZXB1Yl9jb3VudClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5lcHViO1xuXHRcdFx0XHRcdGRlbGV0ZSB0b2RheS5lcHViX2NvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRvZGF5LmVwdWIuZm9yRWFjaCgodiwgaSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRsZXQgbm92ZWwgPSB0aGlzLm5vdmVsKHZbMF0sIHZbMV0pO1xuXG5cdFx0XHRcdFx0XHRfbGlzdC5hZGQobm92ZWwpO1xuXG5cdFx0XHRcdFx0XHR0b2RheS5lcHViW2ldWzJdID0gbm92ZWw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAodG9kYXkuc2VnbWVudClcblx0XHRcdHtcblx0XHRcdFx0YXJyYXlfdW5pcXVlKHRvZGF5LnNlZ21lbnQsIHtcblx0XHRcdFx0XHRvdmVyd3JpdGU6IHRydWUsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LnNlZ21lbnQuc29ydChmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBjYWNoZVNvcnRDYWxsYmFjayhhWzBdLCBiWzBdKVxuXHRcdFx0XHRcdFx0fHwgY2FjaGVTb3J0Q2FsbGJhY2soYVsxXSwgYlsxXSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuc2VnbWVudF9jb3VudCA9IHRvZGF5LnNlZ21lbnQubGVuZ3RoIHwgMDtcblxuXHRcdFx0XHRpZiAoIXRvZGF5LnNlZ21lbnRfY291bnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuc2VnbWVudDtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuc2VnbWVudF9jb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0b2RheS5zZWdtZW50LmZvckVhY2goKHYsIGkpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5vdmVsID0gdGhpcy5ub3ZlbCh2WzBdLCB2WzFdKTtcblxuXHRcdFx0XHRcdFx0X2xpc3QuYWRkKG5vdmVsKTtcblxuXHRcdFx0XHRcdFx0dG9kYXkuc2VnbWVudFtpXVsyXSA9IG5vdmVsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCFPYmplY3Qua2V5cyh0b2RheSkubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRkZWxldGUgdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKGJvb2wgPiAxIHx8IGJvb2wgPT0gRW51bUJlZm9yZVNhdmUuT1BUSU1JWkVfQU5EX1VQREFURSlcblx0XHRcdHtcblx0XHRcdFx0X2xpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBfYSA9IFtcblx0XHRcdFx0XHRcdFx0ZGF0YS5pbml0X2RhdGUsXG5cdFx0XHRcdFx0XHRcdGRhdGEuZXB1Yl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRkYXRhLnNlZ21lbnRfZGF0ZSxcblx0XHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSxcblx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdC5maWx0ZXIodiA9PiB2ICYmIHYgPiAwKVxuXHRcdFx0XHRcdDtcblxuXHRcdFx0XHRcdGxldCBvbGQgPSBkYXRhLnVwZGF0ZV9kYXRlO1xuXG5cdFx0XHRcdFx0aWYgKCFfYS5sZW5ndGggfHwgdHJ1ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9kYXRlID0gdGltZXN0YW1wXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9kYXRlID0gX2Fcblx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBNYXRoLm1heChhLCBiKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0fHwgdGltZXN0YW1wXG5cdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKG9sZCAhPT0gZGF0YS51cGRhdGVfZGF0ZSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRkYXRhLnVwZGF0ZV9jb3VudCA9IChkYXRhLnVwZGF0ZV9jb3VudCB8IDApICsgMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRoaXMuZGF0YS5tZXRhLnRpbWVzdGFtcCA9IGNyZWF0ZU1vbWVudCgpLnZhbHVlT2YoKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5kYXRhLm1ldGEudG9kYXlUaW1lc3RhbXAgPSB0aW1lc3RhbXA7XG5cdFx0fVxuXG5cdFx0bGV0IGtzID0gT2JqZWN0LmtleXModGhpcy5kYXRhLmhpc3RvcnkpO1xuXG5cdFx0aWYgKGtzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRsZXQgaCA9IHRoaXMuZGF0YS5oaXN0b3J5O1xuXG5cdFx0XHRrcy5mb3JFYWNoKGZ1bmN0aW9uIChrKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIU9iamVjdC5rZXlzKGhba10pLmxlbmd0aClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRlbGV0ZSBoW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGtzLmxlbmd0aCA+PSB0aGlzLm9wdGlvbnMuaGlzdG9yeV9tYXgpXG5cdFx0XHR7XG5cdFx0XHRcdGtzLnNvcnQoKS5zbGljZSgwLCAoMCAtIHRoaXMub3B0aW9ucy5oaXN0b3J5X2tlZXApKS5mb3JFYWNoKGsgPT4gZGVsZXRlIHRoaXMuZGF0YS5oaXN0b3J5W2tdKVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHNvcnRPYmplY3QodGhpcy5kYXRhLCB7XG5cdFx0XHR1c2VTb3VyY2U6IHRydWUsXG5cdFx0XHRrZXlzOiBbXG5cdFx0XHRcdCdtZXRhJyxcblx0XHRcdFx0J2hpc3RvcnknLFxuXHRcdFx0XHQnbm92ZWxzJyxcblx0XHRcdFx0J21kY29uZicsXG5cdFx0XHRdIGFzIChrZXlvZiBJTm92ZWxTdGF0Q2FjaGUpW10sXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlsIfos4fmlpnlhLLlrZjoh7MgZmlsZVxuXHQgKlxuXHQgKiBAcGFyYW0gYm9vbCAtIOa4heeQhueJqeS7tuWkmumkmOizh+aWmVxuXHQgKi9cblx0cHVibGljIHNhdmUoYm9vbD86IGJvb2xlYW4gfCBudW1iZXIgfCBFbnVtQmVmb3JlU2F2ZSlcblx0e1xuXHRcdGlmICh0aGlzLm9wdGlvbnMucmVhZG9ubHkpXG5cdFx0e1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBvcHRpb25zLnJlYWRvbmx5IGlzIHNldCwgY2FuJ3Qgbm90IHNhdmUgZmlsZWApXG5cdFx0fVxuXG5cdFx0ZnMub3V0cHV0SlNPTlN5bmModGhpcy5maWxlLCB0aGlzLnRvSlNPTihib29sIHx8IHRydWUpLCB7XG5cdFx0XHRzcGFjZXM6IDIsXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfku4rlpKnnmoQgdGltZXN0YW1wXG5cdCAqL1xuXHRnZXQgdGltZXN0YW1wKClcblx0e1xuXHRcdHJldHVybiB0b2RheU1vbWVudFRpbWVzdGFtcDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfmjIflrpogdGltZXN0YW1wIOeahCBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeSh0aW1lc3RhbXA6IG51bWJlciB8IHN0cmluZylcblx0e1xuXHRcdGlmICh0aW1lc3RhbXAgaW4gdGhpcy5kYXRhLmhpc3RvcnkpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5omA5pyJIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5cygpXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LmVudHJpZXModGhpcy5kYXRhLmhpc3RvcnkpXG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5YmN5LiA5qyh55qEIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5UHJldigpXG5cdHtcblx0XHRsZXQgdGltZXN0YW1wID0gdGhpcy50aW1lc3RhbXA7XG5cblx0XHRsZXQga3M6IHN0cmluZ1tdO1xuXG5cdFx0aWYgKHRpbWVzdGFtcCBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRrcyA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YS5oaXN0b3J5KTtcblx0XHRcdGtzLnBvcCgpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0a3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cdFx0fVxuXG5cdFx0bGV0IGsgPSBrcy5wb3AoKTtcblxuXHRcdGlmIChrIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVtrXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiDlj5blvpfku4rlpKnnmoQgaGlzdG9yeSDos4fmlplcblx0ICovXG5cdGhpc3RvcnlUb2RheSgpXG5cdHtcblx0XHRsZXQgdGltZXN0YW1wID0gdGhpcy50aW1lc3RhbXA7XG5cblx0XHRsZXQgZGF0YSA9IHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF0gPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdIHx8IHt9O1xuXG5cdFx0ZGF0YS5lcHViX2NvdW50ID0gZGF0YS5lcHViX2NvdW50IHwgMDtcblx0XHRkYXRhLmVwdWIgPSBkYXRhLmVwdWIgfHwgW107XG5cblx0XHRkYXRhLnNlZ21lbnRfY291bnQgPSBkYXRhLnNlZ21lbnRfY291bnQgfCAwO1xuXHRcdGRhdGEuc2VnbWVudCA9IGRhdGEuc2VnbWVudCB8fCBbXTtcblxuXHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdO1xuXHR9XG5cblx0c3RhdGljIGZpeE9wdGlvbnMob3B0aW9ucz86IElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMsIGV4dHJhT3B0aW9ucz86IFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4pXG5cdHtcblx0XHRvcHRpb25zID0ge1xuXHRcdFx0ZmlsZV9naXQ6IHVuZGVmaW5lZCxcblx0XHRcdGZpbGU6IHVuZGVmaW5lZCxcblx0XHRcdC4uLihkZWZhdWx0T3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKSxcblx0XHRcdC4uLm9wdGlvbnMsXG5cdFx0XHQuLi5leHRyYU9wdGlvbnMsXG5cdFx0fTtcblxuXHRcdG9wdGlvbnMuaGlzdG9yeV9tYXggPSBvcHRpb25zLmhpc3RvcnlfbWF4ID4gMCA/IG9wdGlvbnMuaGlzdG9yeV9tYXggOiBkZWZhdWx0T3B0aW9ucy5oaXN0b3J5X21heDtcblxuXHRcdG9wdGlvbnMuaGlzdG9yeV9rZWVwID0gb3B0aW9ucy5oaXN0b3J5X2tlZXAgPiAwID8gb3B0aW9ucy5oaXN0b3J5X2tlZXAgOiBkZWZhdWx0T3B0aW9ucy5oaXN0b3J5X2tlZXA7XG5cblx0XHRvcHRpb25zID0gYmFzZVNvcnRPYmplY3Qob3B0aW9ucyk7XG5cblx0XHRyZXR1cm4gb3B0aW9ucztcblx0fVxuXG5cdC8qKlxuXHQgKiDlu7rnq4sgTm92ZWxTdGF0Q2FjaGUg54mp5Lu2XG5cdCAqL1xuXHRzdGF0aWMgY3JlYXRlKG9wdGlvbnM/OiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0b3B0aW9ucyA9IHRoaXMuZml4T3B0aW9ucyhvcHRpb25zKTtcblxuXHRcdGlmIChvcGVuZWRNYXAuaGFzKG9wdGlvbnMpKVxuXHRcdHtcblx0XHRcdHJldHVybiBvcGVuZWRNYXAuZ2V0KG9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGxldCBvYmogPSBuZXcgdGhpcyhvcHRpb25zKTtcblxuXHRcdG9wZW5lZE1hcC5zZXQob3B0aW9ucywgb2JqKTtcblxuXHRcdHJldHVybiBvYmo7XG5cdH1cblxuXHQvKipcblx0ICog5YWB6Kix55So5YW25LuW5pa55byP5Y+W5b6XIGRhdGEg5L6G5bu656uL54mp5Lu2XG5cdCAqL1xuXHRzdGF0aWMgY3JlYXRlRnJvbUpTT04oZGF0YTogSU5vdmVsU3RhdENhY2hlIHwgQnVmZmVyLCBvcHRpb25zPzogUGFydGlhbDxJTm92ZWxTdGF0Q2FjaGVPcHRpb25zPilcblx0e1xuXHRcdGlmIChCdWZmZXIuaXNCdWZmZXIoZGF0YSkpXG5cdFx0e1xuXHRcdFx0ZGF0YSA9IEpTT04ucGFyc2UoZGF0YS50b1N0cmluZygpKSBhcyBJTm92ZWxTdGF0Q2FjaGU7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucyA9IHRoaXMuZml4T3B0aW9ucyhvcHRpb25zIGFzIElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMsIHtcblx0XHRcdHJlYWRvbmx5OiAoIW9wdGlvbnMgfHwgb3B0aW9ucy5yZWFkb25seSA9PSBudWxsKSA/IHRydWUgOiBvcHRpb25zLnJlYWRvbmx5LFxuXHRcdFx0ZGF0YSxcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzLmNyZWF0ZShvcHRpb25zIGFzIElOb3ZlbFN0YXRDYWNoZU9wdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBwYXJhbSBib29sIC0g5riF55CG54mp5Lu25aSa6aSY6LOH5paZXG5cdCAqL1xuXHR0b0pTT04oYm9vbD86IGJvb2xlYW4gfCBudW1iZXIgfCBFbnVtQmVmb3JlU2F2ZSlcblx0e1xuXHRcdGlmIChib29sKVxuXHRcdHtcblx0XHRcdHRoaXMuX2JlZm9yZVNhdmUoYm9vbClcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZGF0YTtcblx0fVxuXG59XG5cbmV4cG9ydCBlbnVtIEVudW1CZWZvcmVTYXZlXG57XG5cdE5PTkUgPSAwLFxuXHRPUFRJTUlaRSA9IDEsXG5cdE9QVElNSVpFX0FORF9VUERBVEUgPSAyLFxufVxuXG5leHBvcnQgZW51bSBFbnVtRmlsdGVyTm92ZWxUeXBlXG57XG5cdC8qKlxuXHQgKiDlj5blvpfmiYDmnInlsI/oqqrnmoTmnIDntYLni4DmhYso6aCQ6KitKVxuXHQgKi9cblx0REVTVCA9IDB4MDAwMCxcblx0LyoqXG5cdCAqIOWPquWPluW+l+WOn+Wni+izh+aWmVxuXHQgKi9cblx0U09VUkNFX09OTFkgPSAweDAwMDEsXG5cdC8qKlxuXHQgKiDlj6rlj5blvpcgX291dCDlvozos4fmlplcblx0ICovXG5cdE9VVFBVVF9PTkxZID0gMHgwMDAyLFxufVxuXG5Ob3ZlbFN0YXRDYWNoZS5maXhPcHRpb25zID0gTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucy5iaW5kKE5vdmVsU3RhdENhY2hlKTtcbk5vdmVsU3RhdENhY2hlLmNyZWF0ZSA9IE5vdmVsU3RhdENhY2hlLmNyZWF0ZS5iaW5kKE5vdmVsU3RhdENhY2hlKTtcbk5vdmVsU3RhdENhY2hlLmNyZWF0ZUZyb21KU09OID0gTm92ZWxTdGF0Q2FjaGUuY3JlYXRlRnJvbUpTT04uYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5cbmNvbnN0IHsgY3JlYXRlLCBmaXhPcHRpb25zLCBjcmVhdGVGcm9tSlNPTiB9ID0gTm92ZWxTdGF0Q2FjaGU7XG5leHBvcnQgeyBjcmVhdGUsIGZpeE9wdGlvbnMsIGNyZWF0ZUZyb21KU09OIH1cblxuZXhwb3J0IGRlZmF1bHQgTm92ZWxTdGF0Q2FjaGUuY3JlYXRlXG5leHBvcnRzID0gT2JqZWN0LmZyZWV6ZShleHBvcnRzKTtcbiJdfQ==