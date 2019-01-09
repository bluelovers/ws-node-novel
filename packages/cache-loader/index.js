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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgscUNBTW9CO0FBVVgsdUJBWlIsbUJBQVksQ0FZUTtBQU5yQiwrQkFBZ0M7QUFDaEMsMkRBQWtEO0FBQ2xELGdEQUFpRDtBQUVqRCxNQUFNLFNBQVMsR0FBRyxJQUFJLE9BQU8sRUFBbUQsQ0FBQztBQXVLakYsTUFBTSxjQUFjLEdBQThDLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFFL0UsV0FBVyxFQUFFLEVBQUU7SUFDZixZQUFZLEVBQUUsQ0FBQztDQUVmLENBQUMsQ0FBQztBQUVIOztHQUVHO0FBQ0gsTUFBYSxjQUFjO0lBZ0IxQjs7OztPQUlHO0lBQ0gsWUFBWSxPQUErQjtRQVYzQyxTQUFJLEdBQW9CLElBQUksQ0FBQztRQUc3QixXQUFNLEdBQVksS0FBSyxDQUFDO1FBU3ZCLE9BQU8sR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTdDLElBQUksSUFBSSxHQUFZLEtBQUssQ0FBQztRQUUxQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQ2hCO1lBQ0MsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUN6RjtnQkFDQyxNQUFNLElBQUksU0FBUyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7YUFDdEQ7WUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDO1NBQ1o7UUFFRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUNqRDtZQUNDLE1BQU0sSUFBSSxVQUFVLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNqRDthQUVEO1lB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QztRQUU5QyxJQUFJLElBQUksRUFDUjtZQUNDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDdEI7UUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbEIsQ0FBQztDQUVEO0FBM29CRCx3Q0Eyb0JDO0FBRUQsSUFBWSxjQUtYO0FBTEQsV0FBWSxjQUFjO0lBRXpCLG1EQUFRLENBQUE7SUFDUiwyREFBWSxDQUFBO0lBQ1osaUZBQXVCLENBQUE7QUFDeEIsQ0FBQyxFQUxXLGNBQWMsR0FBZCxzQkFBYyxLQUFkLHNCQUFjLFFBS3pCO0FBRUQsSUFBWSxtQkFjWDtBQWRELFdBQVksbUJBQW1CO0lBRTlCOztPQUVHO0lBQ0gsNkRBQWEsQ0FBQTtJQUNiOztPQUVHO0lBQ0gsMkVBQW9CLENBQUE7SUFDcEI7O09BRUc7SUFDSCwyRUFBb0IsQ0FBQTtBQUNyQixDQUFDLEVBZFcsbUJBQW1CLEdBQW5CLDJCQUFtQixLQUFuQiwyQkFBbUIsUUFjOUI7QUFFRCxjQUFjLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzNFLGNBQWMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDbkUsY0FBYyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUVuRixNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsR0FBRyxjQUFjLENBQUM7QUFDckQsd0JBQU07QUFBRSxnQ0FBVTtBQUFFLHdDQUFjO0FBRTNDLGtCQUFlLGNBQWMsQ0FBQyxNQUFNLENBQUE7QUFDcEMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzEvNi8wMDYuXG4gKi9cblxuaW1wb3J0IHRvZGF5TW9tZW50VGltZXN0YW1wLCB7XG5cdGJhc2VTb3J0T2JqZWN0LFxuXHRjYWNoZVNvcnRDYWxsYmFjayxcblx0ZnJlZXplUHJvcGVydHksXG5cdGNyZWF0ZU1vbWVudCxcblx0bmF0dXJhbENvbXBhcmUsXG59IGZyb20gJy4vbGliL3V0aWwnO1xuaW1wb3J0IHsgSU1kY29uZk1ldGEgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IHsgRW51bU5vdmVsU3RhdHVzIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvL2xpYi9jb25zdCc7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3VwYXRoMicpO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMtZXh0cmEnKTtcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgc29ydE9iamVjdCA9IHJlcXVpcmUoJ3NvcnQtb2JqZWN0LWtleXMyJyk7XG5cbmNvbnN0IG9wZW5lZE1hcCA9IG5ldyBXZWFrTWFwPFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4sIE5vdmVsU3RhdENhY2hlPigpO1xuXG5leHBvcnQgeyBjcmVhdGVNb21lbnQgfVxuXG4vKipcbiAqIOaJgOaciSB0aW1lc3RhbXAg54K6IFVuaXggdGltZXN0YW1wIGluIG1pbGxpc2Vjb25kcyDngrogdXRjICs4XG4gKiBwYXRoTWFpbiDngrog5Li76LOH5aS+5ZCN56ixXG4gKiBub3ZlbElEIOeCuiDlsI/oqqros4fmlpnlpL7lkI3nqLFcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVcbntcblxuXHRtZXRhPzoge1xuXHRcdHRvZGF5VGltZXN0YW1wPzogbnVtYmVyLFxuXHRcdHRpbWVzdGFtcD86IG51bWJlcixcblx0fSxcblxuXHQvKipcblx0ICog5bCP6Kqq57ep5a2Y54uA5oWLXG5cdCAqL1xuXHRub3ZlbHM6IHtcblx0XHRbcGF0aE1haW46IHN0cmluZ106IHtcblx0XHRcdFtub3ZlbElEOiBzdHJpbmddOiBJTm92ZWxTdGF0Q2FjaGVOb3ZlbCxcblx0XHR9LFxuXHR9LFxuXG5cdC8qKlxuXHQgKiDmrbflj7LntIDpjIRcblx0ICovXG5cdGhpc3Rvcnk6IHtcblx0XHRbdGltZXN0YW1wOiBzdHJpbmddOiBJTm92ZWxTdGF0Q2FjaGVIaXN0b3J5LFxuXHRcdFt0aW1lc3RhbXA6IG51bWJlcl06IElOb3ZlbFN0YXRDYWNoZUhpc3RvcnksXG5cdH0sXG5cblx0LyoqXG5cdCAqIOmAj+mBjiBub2RlLW5vdmVsLWNvbmYg6Kej5p6Q6YGO55qEIE1FVEEg6LOH5paZIChSRUFETUUubWQpXG5cdCAqL1xuXHRtZGNvbmY6IHtcblx0XHRbcGF0aE1haW46IHN0cmluZ106IHtcblx0XHRcdFtub3ZlbElEOiBzdHJpbmddOiBJTWRjb25mTWV0YSxcblx0XHR9LFxuXHR9LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElOb3ZlbFN0YXRDYWNoZU5vdmVsXG57XG5cdC8qKlxuXHQgKiBzZWdtZW50IOabtOaWsOaZgumWk1xuXHQgKi9cblx0c2VnbWVudF9kYXRlPzogbnVtYmVyLFxuXHQvKipcblx0ICogZXB1YiDmm7TmlrDmmYLplpNcblx0ICovXG5cdGVwdWJfZGF0ZT86IG51bWJlcixcblxuXHQvKipcblx0ICog5Yid5aeL5YyW5pmC6ZaTXG5cdCAqL1xuXHRpbml0X2RhdGU/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIOe4veeroC/ljbfmlbjph49cblx0ICovXG5cdHZvbHVtZT86IG51bWJlcixcblx0LyoqXG5cdCAqIOe4veipseaVuFxuXHQgKi9cblx0Y2hhcHRlcj86IG51bWJlcixcblxuXHQvKipcblx0ICog5LiK5qyh55qE57i956ugL+WNt+aVuOmHj1xuXHQgKi9cblx0dm9sdW1lX29sZD86IG51bWJlcixcblx0LyoqXG5cdCAqIOS4iuasoeeahOe4veipseaVuFxuXHQgKi9cblx0Y2hhcHRlcl9vbGQ/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIHNlZ21lbnQg6K6K5YuV5pW46YePXG5cdCAqL1xuXHRzZWdtZW50PzogbnVtYmVyLFxuXHQvKipcblx0ICog5LiK5qyh55qEIHNlZ21lbnQg6K6K5YuV5pW46YePXG5cdCAqL1xuXHRzZWdtZW50X29sZD86IG51bWJlcixcblxuXHQvKipcblx0ICog5bCP6Kqq54uA5oWLIGZsYWcg5qC55pOaIHJlYWRtZS5tZCDlhafoqK3lrppcblx0ICovXG5cdG5vdmVsX3N0YXR1cz86IEVudW1Ob3ZlbFN0YXR1cyxcblxuXHQvKipcblx0ICog5pyA5b6M6K6K5YuV5pmC6ZaTXG5cdCAqL1xuXHR1cGRhdGVfZGF0ZT86IG51bWJlcjtcblx0LyoqXG5cdCAqIOe0gOmMhOiuiuWLleasoeaVuFxuXHQgKi9cblx0dXBkYXRlX2NvdW50PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBlcHViIGZpbGVuYW1lXG5cdCAqL1xuXHRlcHViX2Jhc2VuYW1lPzogc3RyaW5nLFxuXHR0eHRfYmFzZW5hbWU/OiBzdHJpbmcsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU5vdmVsU3RhdENhY2hlSGlzdG9yeVxue1xuXHQvKipcblx0ICog5pys5qyh6KiY6YyE5YWn55qEIGVwdWIg57i95pW4XG5cdCAqL1xuXHRlcHViX2NvdW50PzogbnVtYmVyLFxuXHQvKipcblx0ICog5pys5qyh6KiY6YyE5YWn55qEIGVwdWJcblx0ICovXG5cdGVwdWI/OiBBcnJheTxbc3RyaW5nLCBzdHJpbmcsIElOb3ZlbFN0YXRDYWNoZU5vdmVsP10+LFxuXHRzZWdtZW50X2NvdW50PzogbnVtYmVyLFxuXHRzZWdtZW50PzogQXJyYXk8W3N0cmluZywgc3RyaW5nLCBJTm92ZWxTdGF0Q2FjaGVOb3ZlbD9dPixcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zXG57XG5cdC8qKlxuXHQgKiDoroDlr6vnt6nlrZjnmoTnm67mqJkganNvbiDot6/lvpFcblx0ICovXG5cdGZpbGU6IHN0cmluZyxcblx0LyoqXG5cdCAqIOeVtiBmaWxlIOS4jeWtmOWcqOaZguWYl+ippuiugOWPluatpOaqlOahiFxuXHQgKi9cblx0ZmlsZV9naXQ/OiBzdHJpbmcsXG5cblx0LyoqXG5cdCAqIOemgeatouWwh+izh+aWmeWvq+WbnuaqlOahiFxuXHQgKi9cblx0cmVhZG9ubHk/OiBib29sZWFuLFxuXG5cdGhpc3RvcnlfbWF4PzogbnVtYmVyLFxuXHRoaXN0b3J5X2tlZXA/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIG9wdGlvbnMucmVhZG9ubHkgJiYgb3B0aW9ucy5kYXRhIOW/hemgiOWQjOaZguWVn+eUqFxuXHQgKi9cblx0ZGF0YT86IElOb3ZlbFN0YXRDYWNoZSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRmlsdGVyTm92ZWxEYXRhXG57XG5cdHBhdGhNYWluOiBzdHJpbmcsXG5cdHBhdGhNYWluX2Jhc2U6IHN0cmluZyxcblx0bm92ZWxJRDogc3RyaW5nLFxuXG5cdG1kY29uZjogSU1kY29uZk1ldGEsXG5cdGNhY2hlOiBJTm92ZWxTdGF0Q2FjaGVOb3ZlbCxcblxuXHRpc19vdXQ6IGJvb2xlYW4sXG5cdGJhc2VfZXhpc3RzOiBib29sZWFuLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElGaWx0ZXJOb3ZlbFxue1xuXHRbcGF0aE1haW46IHN0cmluZ106IHtcblx0XHRbbm92ZWxJRDogc3RyaW5nXTogSUZpbHRlck5vdmVsRGF0YSxcblx0fSxcbn1cblxuY29uc3QgZGVmYXVsdE9wdGlvbnM6IFJlYWRvbmx5PFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4+ID0gT2JqZWN0LmZyZWV6ZSh7XG5cblx0aGlzdG9yeV9tYXg6IDE0LFxuXHRoaXN0b3J5X2tlZXA6IDcsXG5cbn0pO1xuXG4vKipcbiAqIEBleGFtcGxlIE5vdmVsU3RhdENhY2hlLmNyZWF0ZSgpXG4gKi9cbmV4cG9ydCBjbGFzcyBOb3ZlbFN0YXRDYWNoZVxue1xuXHQvKipcblx0ICog6K6A5a+r57ep5a2Y55qE55uu5qiZIGpzb24g6Lev5b6RXG5cdCAqL1xuXHRmaWxlOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiDnlbYgZmlsZSDkuI3lrZjlnKjmmYLlmJfoqaboroDlj5bmraTmqpTmoYhcblx0ICovXG5cdGZpbGVfZ2l0OiBzdHJpbmc7XG5cblx0ZGF0YTogSU5vdmVsU3RhdENhY2hlID0gbnVsbDtcblx0b3B0aW9uczogSU5vdmVsU3RhdENhY2hlT3B0aW9ucztcblxuXHRpbml0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHQvKipcblx0ICog5L2/55SoIE5vdmVsU3RhdENhY2hlLmNyZWF0ZSgpIOS7o+abv1xuXHQgKlxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0Y29uc3RydWN0b3Iob3B0aW9uczogSU5vdmVsU3RhdENhY2hlT3B0aW9ucylcblx0e1xuXHRcdG9wdGlvbnMgPSBOb3ZlbFN0YXRDYWNoZS5maXhPcHRpb25zKG9wdGlvbnMpO1xuXG5cdFx0bGV0IF9jaGs6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRcdGlmIChvcHRpb25zLmRhdGEpXG5cdFx0e1xuXHRcdFx0aWYgKCEob3B0aW9ucy5kYXRhICYmIG9wdGlvbnMuZGF0YS5oaXN0b3J5ICYmIG9wdGlvbnMuZGF0YS5ub3ZlbHMgJiYgb3B0aW9ucy5kYXRhLm1kY29uZikpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYG9wdGlvbnMuZGF0YSBpcyBub3QgYWxsb3cgZGF0YWApO1xuXHRcdFx0fVxuXG5cdFx0XHRfY2hrID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoIW9wdGlvbnMuZmlsZSAmJiAoIW9wdGlvbnMucmVhZG9ubHkgfHwgIV9jaGspKVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGBvcHRpb25zLmZpbGUgaXMgcmVxdWlyZWRgKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGRlbGV0ZSBvcHRpb25zLmRhdGE7XG5cdFx0fVxuXG5cdFx0dGhpcy5faW5pdChvcHRpb25zKTtcblx0fVxuXG5cdHByb3RlY3RlZCBfaW5pdChvcHRpb25zOiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKVxuXHR7XG5cdFx0aWYgKG9wdGlvbnMuZGF0YSlcblx0XHR7XG5cdFx0XHR0aGlzLmRhdGEgPSBvcHRpb25zLmRhdGE7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIG9wdGlvbnMuZGF0YTtcblxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0XHR0aGlzLmZpbGUgPSB0aGlzLm9wdGlvbnMuZmlsZTtcblx0XHR0aGlzLmZpbGVfZ2l0ID0gdGhpcy5vcHRpb25zLmZpbGVfZ2l0O1xuXG5cdFx0ZnJlZXplUHJvcGVydHkodGhpcywgJ29wdGlvbnMnLCB0cnVlKTtcblx0XHRmcmVlemVQcm9wZXJ0eSh0aGlzLCAnZmlsZScpO1xuXHRcdGZyZWV6ZVByb3BlcnR5KHRoaXMsICdmaWxlX2dpdCcpO1xuXG5cdFx0dGhpcy5vcGVuKCk7XG5cdH1cblxuXHQvKipcblx0ICog5qqi5p+lIGZpbGUg5piv5ZCm5a2Y5ZyoXG5cdCAqL1xuXHRleGlzdHMoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZmlsZSAmJiBmcy5wYXRoRXhpc3RzU3luYyh0aGlzLmZpbGUpXG5cdH1cblxuXHRwcm90ZWN0ZWQgb3BlbigpXG5cdHtcblx0XHRpZiAoIXRoaXMuaW5pdGVkKVxuXHRcdHtcblx0XHRcdHRoaXMuaW5pdGVkID0gdHJ1ZTtcblxuXHRcdFx0aWYgKHRoaXMuZGF0YSlcblx0XHRcdHtcblx0XHRcdFx0Ly9cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHRoaXMuZXhpc3RzKCkpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuZGF0YSA9IGZzLnJlYWRKU09OU3luYyh0aGlzLmZpbGUpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodGhpcy5maWxlX2dpdCAmJiBmcy5wYXRoRXhpc3RzU3luYyh0aGlzLmZpbGVfZ2l0KSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5kYXRhID0gZnMucmVhZEpTT05TeW5jKHRoaXMuZmlsZV9naXQpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHR0aGlzLmRhdGEgPSB0aGlzLmRhdGEgfHwge307XG5cblx0XHRcdHRoaXMuZGF0YS5oaXN0b3J5ID0gdGhpcy5kYXRhLmhpc3RvcnkgfHwge307XG5cdFx0XHR0aGlzLmRhdGEubm92ZWxzID0gdGhpcy5kYXRhLm5vdmVscyB8fCB7fTtcblx0XHRcdHRoaXMuZGF0YS5tZGNvbmYgPSB0aGlzLmRhdGEubWRjb25mIHx8IHt9O1xuXHRcdFx0dGhpcy5kYXRhLm1ldGEgPSB0aGlzLmRhdGEubWV0YSB8fCB7fTtcblxuXHRcdFx0ZnJlZXplUHJvcGVydHkodGhpcywgJ2luaXRlZCcpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aJgOacieWcqCBkYXRhLm5vdmVscyAvIGRhdGEubWRjb25mIOWFp+WtmOWcqOeahCBwYXRoTWFpblxuXHQgKi9cblx0cGF0aE1haW5MaXN0KClcblx0e1xuXHRcdHJldHVybiBhcnJheV91bmlxdWUoT2JqZWN0LmtleXModGhpcy5kYXRhLm5vdmVscylcblx0XHRcdC5jb25jYXQoT2JqZWN0LmtleXModGhpcy5kYXRhLm1kY29uZikpKVxuXHRcdFx0LnNvcnQoKVxuXHRcdFx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aJgOacieWwj+iqqueahOacgOe1gueLgOaFiyjpoJDoqK3mmYIpXG5cdCAqIOS+i+WmgiDnlbYg5ZCM5pmC5a2Y5ZyoIHh4eCDoiIcgeHh4X291dCDmmYLvvIzlj6rmnIPlm57lgrMgeHh4X291dFxuXHQgKi9cblx0ZmlsdGVyTm92ZWwodHlwZTogRW51bUZpbHRlck5vdmVsVHlwZSA9IEVudW1GaWx0ZXJOb3ZlbFR5cGUuREVTVClcblx0e1xuXHRcdGxldCBrcyA9IHRoaXMucGF0aE1haW5MaXN0KCk7XG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXG5cdFx0aWYgKHR5cGUgJiBFbnVtRmlsdGVyTm92ZWxUeXBlLlNPVVJDRV9PTkxZKVxuXHRcdHtcblx0XHRcdGtzID0ga3MuZmlsdGVyKHBhdGhNYWluID0+ICEvX291dCQvLnRlc3QocGF0aE1haW4pKVxuXHRcdH1cblx0XHRlbHNlIGlmICh0eXBlICYgRW51bUZpbHRlck5vdmVsVHlwZS5PVVRQVVRfT05MWSlcblx0XHR7XG5cdFx0XHRrcyA9IGtzLmZpbHRlcihwYXRoTWFpbiA9PiAvX291dCQvLnRlc3QocGF0aE1haW4pKVxuXHRcdH1cblxuXHRcdHJldHVybiBrc1xuXHRcdFx0LnNvcnQoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChhLnJlcGxhY2UoL19vdXQkLywgJycpID09PSBiLnJlcGxhY2UoL19vdXQkLywgJycpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKC9fb3V0JC8udGVzdChhKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbmF0dXJhbENvbXBhcmUoYSwgYik7XG5cdFx0XHR9KVxuXHRcdFx0LnJlZHVjZSgobHMsIHBhdGhNYWluKSA9PlxuXHRcdFx0e1xuXG5cdFx0XHRcdGxldCBfbSA9IHBhdGhNYWluLm1hdGNoKC9eKC4rPykoX291dCk/JC8pO1xuXG5cdFx0XHRcdGxldCBpc19vdXQgPSAhIV9tWzJdO1xuXHRcdFx0XHRsZXQgcGF0aE1haW5fYmFzZSA9IF9tWzFdO1xuXG5cdFx0XHRcdGxzW3BhdGhNYWluX2Jhc2VdID0gbHNbcGF0aE1haW5fYmFzZV0gfHwge307XG5cblx0XHRcdFx0T2JqZWN0LmVudHJpZXMoc2VsZi5fbWRjb25mX2dldF9tYWluKHBhdGhNYWluKSlcblx0XHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAoW25vdmVsSUQsIG1kY29uZl0pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IGNhY2hlID0ge1xuXHRcdFx0XHRcdFx0XHQuLi5zZWxmLm5vdmVsKHBhdGhNYWluLCBub3ZlbElEKSxcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGxldCBiYXNlX2V4aXN0czogYm9vbGVhbjtcblxuXHRcdFx0XHRcdFx0aWYgKGlzX291dClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0bGV0IF9zcmMgPSBzZWxmLm5vdmVsRXhpc3RzKHBhdGhNYWluX2Jhc2UsIG5vdmVsSUQpO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChfc3JjKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0KFtcblx0XHRcdFx0XHRcdFx0XHRcdCdzZWdtZW50Jyxcblx0XHRcdFx0XHRcdFx0XHRcdCdzZWdtZW50X2RhdGUnLFxuXHRcdFx0XHRcdFx0XHRcdFx0J3NlZ21lbnRfb2xkJyxcblx0XHRcdFx0XHRcdFx0XHRdIGFzIChrZXlvZiBJTm92ZWxTdGF0Q2FjaGVOb3ZlbClbXSlcblx0XHRcdFx0XHRcdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpXG5cdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChfc3JjW2tleV0gIT0gbnVsbClcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNhY2hlW2tleV0gPSBfc3JjW2tleV1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHQ7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRiYXNlX2V4aXN0cyA9ICEhX3NyYztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bHNbcGF0aE1haW5fYmFzZV1bbm92ZWxJRF0gPSB7XG5cdFx0XHRcdFx0XHRcdHBhdGhNYWluLFxuXHRcdFx0XHRcdFx0XHRwYXRoTWFpbl9iYXNlLFxuXHRcdFx0XHRcdFx0XHRub3ZlbElELFxuXG5cdFx0XHRcdFx0XHRcdG1kY29uZixcblx0XHRcdFx0XHRcdFx0Y2FjaGUsXG5cblx0XHRcdFx0XHRcdFx0aXNfb3V0LFxuXHRcdFx0XHRcdFx0XHRiYXNlX2V4aXN0cyxcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0O1xuXG5cdFx0XHRcdHJldHVybiBscztcblx0XHRcdH0sIHt9IGFzIElGaWx0ZXJOb3ZlbClcblx0fVxuXG5cdC8qKlxuXHQgKiAo6KuL5bCP5b+D5L2/55SoKSDnp7vpmaTmjIflrpogcGF0aE1haW4gJiBub3ZlbElEXG5cdCAqL1xuXHRyZW1vdmUocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nKVxuXHR7XG5cdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRpZiAodGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0pXG5cdFx0e1xuXHRcdFx0Ym9vbCA9IGJvb2wgfHwgISF0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXTtcblxuXHRcdFx0ZGVsZXRlIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dKVxuXHRcdHtcblx0XHRcdGJvb2wgPSBib29sIHx8ICEhdGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl1bbm92ZWxJRF07XG5cblx0XHRcdGRlbGV0ZSB0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXVtub3ZlbElEXVxuXHRcdH1cblxuXHRcdHJldHVybiBib29sO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aMh+WumiBwYXRoTWFpbiDnmoQgbm92ZWwg54uA5oWL6ZuG5ZCIXG5cdCAqL1xuXHRwYXRoTWFpbihwYXRoTWFpbjogc3RyaW5nKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dID0gdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl0gfHwge307XG5cdH1cblxuXHRub3ZlbEV4aXN0cyhwYXRoTWFpbjogc3RyaW5nLCBub3ZlbElEOiBzdHJpbmcpOiBJTm92ZWxTdGF0Q2FjaGVOb3ZlbFxuXHR7XG5cdFx0aWYgKHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dXG5cdFx0XHQmJiB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXVxuXHRcdFx0JiYgT2JqZWN0LmtleXModGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF0pLmxlbmd0aFxuXHRcdFx0JiYgdGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF0pXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dW25vdmVsSURdXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aMh+WumiBwYXRoTWFpbiBub3ZlbElEIOeahCBub3ZlbCDni4DmhYvnt6nlrZhcblx0ICovXG5cdG5vdmVsKHBhdGhNYWluOiBzdHJpbmcsIG5vdmVsSUQ6IHN0cmluZylcblx0e1xuXHRcdHRoaXMucGF0aE1haW4ocGF0aE1haW4pO1xuXG5cdFx0dGhpcy5kYXRhLm5vdmVsc1twYXRoTWFpbl1bbm92ZWxJRF0gPSB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXSB8fCB7fTtcblxuXHRcdHJldHVybiB0aGlzLmRhdGEubm92ZWxzW3BhdGhNYWluXVtub3ZlbElEXTtcblx0fVxuXG5cdHByb3RlY3RlZCBfbWRjb25mX2dldF9tYWluKHBhdGhNYWluOiBzdHJpbmcpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gfHwge307XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHBhdGhNYWluIG5vdmVsSUQg55qEIG1kY29uZiDos4fmlplcblx0ICovXG5cdG1kY29uZl9nZXQocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nKTogSU1kY29uZk1ldGFcblx0e1xuXHRcdGxldCBfZGF0YSA9IHRoaXMuX21kY29uZl9nZXRfbWFpbihwYXRoTWFpbik7XG5cblx0XHRyZXR1cm4gX2RhdGFbbm92ZWxJRF07XG5cdH1cblxuXHQvKipcblx0ICog6Kit5a6a5oyH5a6aIHBhdGhNYWluIG5vdmVsSUQg55qEIG1kY29uZiDos4fmlplcblx0ICovXG5cdG1kY29uZl9zZXQocGF0aE1haW46IHN0cmluZywgbm92ZWxJRDogc3RyaW5nLCBtZXRhOiBJTWRjb25mTWV0YSlcblx0e1xuXHRcdHRoaXMuZGF0YS5tZGNvbmZbcGF0aE1haW5dID0gdGhpcy5kYXRhLm1kY29uZltwYXRoTWFpbl0gfHwge307XG5cblx0XHR0aGlzLmRhdGEubWRjb25mW3BhdGhNYWluXVtub3ZlbElEXSA9IG1ldGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBAZGVwcmVjYXRlZFxuXHQgKi9cblx0X2JlZm9yZVNhdmUoYm9vbD86IGJvb2xlYW4gfCBudW1iZXIpXG5cdHtcblx0XHRsZXQgdGltZXN0YW1wID0gdGhpcy50aW1lc3RhbXA7XG5cblx0XHRPYmplY3QuZW50cmllcyh0aGlzLmRhdGEubm92ZWxzKVxuXHRcdFx0LmZvckVhY2goKFtwYXRoTWFpbiwgZGF0YV0sIGkpID0+XG5cdFx0XHR7XG5cdFx0XHRcdE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5ub3ZlbHNbcGF0aE1haW5dKVxuXHRcdFx0XHRcdC5mb3JFYWNoKChbbm92ZWxJRCwgZGF0YV0pID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IF9hID0gW1xuXHRcdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGEuZXB1Yl9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGEuc2VnbWVudF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUsXG5cdFx0XHRcdFx0XHRcdF1cblx0XHRcdFx0XHRcdFx0LmZpbHRlcih2ID0+IHYgJiYgdiA+IDApXG5cdFx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRcdGlmICghX2EubGVuZ3RoKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLmluaXRfZGF0ZSA9IHRpbWVzdGFtcFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRkYXRhLmluaXRfZGF0ZSA9IF9hXG5cdFx0XHRcdFx0XHRcdFx0LnJlZHVjZSgoYSwgYikgPT5cblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gTWF0aC5taW4oYSwgYik7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHR8fCB0aW1lc3RhbXBcblx0XHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0aWYgKHRpbWVzdGFtcCBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRsZXQgX2xpc3QgPSBuZXcgU2V0PElOb3ZlbFN0YXRDYWNoZU5vdmVsPigpO1xuXG5cdFx0XHRsZXQgdG9kYXkgPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdO1xuXG5cdFx0XHRpZiAodG9kYXkuZXB1Yilcblx0XHRcdHtcblx0XHRcdFx0YXJyYXlfdW5pcXVlKHRvZGF5LmVwdWIsIHtcblx0XHRcdFx0XHRvdmVyd3JpdGU6IHRydWUsXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LmVwdWIuc29ydChmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBjYWNoZVNvcnRDYWxsYmFjayhhWzBdLCBiWzBdKVxuXHRcdFx0XHRcdFx0fHwgY2FjaGVTb3J0Q2FsbGJhY2soYVsxXSwgYlsxXSlcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dG9kYXkuZXB1Yl9jb3VudCA9IHRvZGF5LmVwdWIubGVuZ3RoIHwgMDtcblxuXHRcdFx0XHRpZiAoIXRvZGF5LmVwdWJfY291bnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuZXB1Yjtcblx0XHRcdFx0XHRkZWxldGUgdG9kYXkuZXB1Yl9jb3VudDtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0b2RheS5lcHViLmZvckVhY2goKHYsIGkpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0bGV0IG5vdmVsID0gdGhpcy5ub3ZlbCh2WzBdLCB2WzFdKTtcblxuXHRcdFx0XHRcdFx0X2xpc3QuYWRkKG5vdmVsKTtcblxuXHRcdFx0XHRcdFx0dG9kYXkuZXB1YltpXVsyXSA9IG5vdmVsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKHRvZGF5LnNlZ21lbnQpXG5cdFx0XHR7XG5cdFx0XHRcdGFycmF5X3VuaXF1ZSh0b2RheS5zZWdtZW50LCB7XG5cdFx0XHRcdFx0b3ZlcndyaXRlOiB0cnVlLFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0b2RheS5zZWdtZW50LnNvcnQoZnVuY3Rpb24gKGEsIGIpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gY2FjaGVTb3J0Q2FsbGJhY2soYVswXSwgYlswXSlcblx0XHRcdFx0XHRcdHx8IGNhY2hlU29ydENhbGxiYWNrKGFbMV0sIGJbMV0pXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHRvZGF5LnNlZ21lbnRfY291bnQgPSB0b2RheS5zZWdtZW50Lmxlbmd0aCB8IDA7XG5cblx0XHRcdFx0aWYgKCF0b2RheS5zZWdtZW50X2NvdW50KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0ZGVsZXRlIHRvZGF5LnNlZ21lbnQ7XG5cdFx0XHRcdFx0ZGVsZXRlIHRvZGF5LnNlZ21lbnRfY291bnQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG9kYXkuc2VnbWVudC5mb3JFYWNoKCh2LCBpKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGxldCBub3ZlbCA9IHRoaXMubm92ZWwodlswXSwgdlsxXSk7XG5cblx0XHRcdFx0XHRcdF9saXN0LmFkZChub3ZlbCk7XG5cblx0XHRcdFx0XHRcdHRvZGF5LnNlZ21lbnRbaV1bMl0gPSBub3ZlbDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICghT2JqZWN0LmtleXModG9kYXkpLmxlbmd0aClcblx0XHRcdHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuZGF0YS5oaXN0b3J5W3RpbWVzdGFtcF07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChib29sID4gMSB8fCBib29sID09IEVudW1CZWZvcmVTYXZlLk9QVElNSVpFX0FORF9VUERBVEUpXG5cdFx0XHR7XG5cdFx0XHRcdF9saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgX2EgPSBbXG5cdFx0XHRcdFx0XHRcdGRhdGEuaW5pdF9kYXRlLFxuXHRcdFx0XHRcdFx0XHRkYXRhLmVwdWJfZGF0ZSxcblx0XHRcdFx0XHRcdFx0ZGF0YS5zZWdtZW50X2RhdGUsXG5cdFx0XHRcdFx0XHRcdGRhdGEudXBkYXRlX2RhdGUsXG5cdFx0XHRcdFx0XHRdXG5cdFx0XHRcdFx0XHQuZmlsdGVyKHYgPT4gdiAmJiB2ID4gMClcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRsZXQgb2xkID0gZGF0YS51cGRhdGVfZGF0ZTtcblxuXHRcdFx0XHRcdGlmICghX2EubGVuZ3RoIHx8IHRydWUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSA9IHRpbWVzdGFtcFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfZGF0ZSA9IF9hXG5cdFx0XHRcdFx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+XG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gTWF0aC5tYXgoYSwgYik7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdHx8IHRpbWVzdGFtcFxuXHRcdFx0XHRcdFx0O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvbGQgIT09IGRhdGEudXBkYXRlX2RhdGUpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0ZGF0YS51cGRhdGVfY291bnQgPSAoZGF0YS51cGRhdGVfY291bnQgfCAwKSArIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0aGlzLmRhdGEubWV0YS50aW1lc3RhbXAgPSBjcmVhdGVNb21lbnQoKS52YWx1ZU9mKCk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZGF0YS5tZXRhLnRvZGF5VGltZXN0YW1wID0gdGltZXN0YW1wO1xuXHRcdH1cblxuXHRcdGxldCBrcyA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YS5oaXN0b3J5KTtcblxuXHRcdGlmIChrcy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IGggPSB0aGlzLmRhdGEuaGlzdG9yeTtcblxuXHRcdFx0a3MuZm9yRWFjaChmdW5jdGlvbiAoaylcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFPYmplY3Qua2V5cyhoW2tdKS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRkZWxldGUgaFtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChrcy5sZW5ndGggPj0gdGhpcy5vcHRpb25zLmhpc3RvcnlfbWF4KVxuXHRcdFx0e1xuXHRcdFx0XHRrcy5zb3J0KCkuc2xpY2UoMCwgKDAgLSB0aGlzLm9wdGlvbnMuaGlzdG9yeV9rZWVwKSkuZm9yRWFjaChrID0+IGRlbGV0ZSB0aGlzLmRhdGEuaGlzdG9yeVtrXSlcblx0XHRcdH1cblx0XHR9XG5cblx0XHRzb3J0T2JqZWN0KHRoaXMuZGF0YSwge1xuXHRcdFx0dXNlU291cmNlOiB0cnVlLFxuXHRcdFx0a2V5czogW1xuXHRcdFx0XHQnbWV0YScsXG5cdFx0XHRcdCdoaXN0b3J5Jyxcblx0XHRcdFx0J25vdmVscycsXG5cdFx0XHRcdCdtZGNvbmYnLFxuXHRcdFx0XSBhcyAoa2V5b2YgSU5vdmVsU3RhdENhY2hlKVtdLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5bCH6LOH5paZ5YSy5a2Y6IezIGZpbGVcblx0ICpcblx0ICogQHBhcmFtIGJvb2wgLSDmuIXnkIbnianku7blpJrppJjos4fmlplcblx0ICovXG5cdHB1YmxpYyBzYXZlKGJvb2w/OiBib29sZWFuIHwgbnVtYmVyIHwgRW51bUJlZm9yZVNhdmUpXG5cdHtcblx0XHRpZiAodGhpcy5vcHRpb25zLnJlYWRvbmx5KVxuXHRcdHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgb3B0aW9ucy5yZWFkb25seSBpcyBzZXQsIGNhbid0IG5vdCBzYXZlIGZpbGVgKVxuXHRcdH1cblxuXHRcdGZzLm91dHB1dEpTT05TeW5jKHRoaXMuZmlsZSwgdGhpcy50b0pTT04oYm9vbCB8fCB0cnVlKSwge1xuXHRcdFx0c3BhY2VzOiAyLFxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIHRpbWVzdGFtcFxuXHQgKi9cblx0Z2V0IHRpbWVzdGFtcCgpXG5cdHtcblx0XHRyZXR1cm4gdG9kYXlNb21lbnRUaW1lc3RhbXA7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5oyH5a6aIHRpbWVzdGFtcCDnmoQgaGlzdG9yeSDos4fmlplcblx0ICovXG5cdGhpc3RvcnkodGltZXN0YW1wOiBudW1iZXIgfCBzdHJpbmcpXG5cdHtcblx0XHRpZiAodGltZXN0YW1wIGluIHRoaXMuZGF0YS5oaXN0b3J5KVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+aJgOaciSBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeXMoKVxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMuZGF0YS5oaXN0b3J5KVxuXHR9XG5cblx0LyoqXG5cdCAqIOWPluW+l+WJjeS4gOasoeeahCBoaXN0b3J5IOizh+aWmVxuXHQgKi9cblx0aGlzdG9yeVByZXYoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGtzOiBzdHJpbmdbXTtcblxuXHRcdGlmICh0aW1lc3RhbXAgaW4gdGhpcy5kYXRhLmhpc3RvcnkpXG5cdFx0e1xuXHRcdFx0a3MgPSBPYmplY3Qua2V5cyh0aGlzLmRhdGEuaGlzdG9yeSk7XG5cdFx0XHRrcy5wb3AoKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGtzID0gT2JqZWN0LmtleXModGhpcy5kYXRhLmhpc3RvcnkpO1xuXHRcdH1cblxuXHRcdGxldCBrID0ga3MucG9wKCk7XG5cblx0XHRpZiAoayBpbiB0aGlzLmRhdGEuaGlzdG9yeSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3Rvcnlba107XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXHQvKipcblx0ICog5Y+W5b6X5LuK5aSp55qEIGhpc3Rvcnkg6LOH5paZXG5cdCAqL1xuXHRoaXN0b3J5VG9kYXkoKVxuXHR7XG5cdFx0bGV0IHRpbWVzdGFtcCA9IHRoaXMudGltZXN0YW1wO1xuXG5cdFx0bGV0IGRhdGEgPSB0aGlzLmRhdGEuaGlzdG9yeVt0aW1lc3RhbXBdID0gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXSB8fCB7fTtcblxuXHRcdGRhdGEuZXB1Yl9jb3VudCA9IGRhdGEuZXB1Yl9jb3VudCB8IDA7XG5cdFx0ZGF0YS5lcHViID0gZGF0YS5lcHViIHx8IFtdO1xuXG5cdFx0ZGF0YS5zZWdtZW50X2NvdW50ID0gZGF0YS5zZWdtZW50X2NvdW50IHwgMDtcblx0XHRkYXRhLnNlZ21lbnQgPSBkYXRhLnNlZ21lbnQgfHwgW107XG5cblx0XHRyZXR1cm4gdGhpcy5kYXRhLmhpc3RvcnlbdGltZXN0YW1wXTtcblx0fVxuXG5cdHN0YXRpYyBmaXhPcHRpb25zKG9wdGlvbnM/OiBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zLCBleHRyYU9wdGlvbnM/OiBQYXJ0aWFsPElOb3ZlbFN0YXRDYWNoZU9wdGlvbnM+KVxuXHR7XG5cdFx0b3B0aW9ucyA9IHtcblx0XHRcdGZpbGVfZ2l0OiB1bmRlZmluZWQsXG5cdFx0XHRmaWxlOiB1bmRlZmluZWQsXG5cdFx0XHQuLi4oZGVmYXVsdE9wdGlvbnMgYXMgSU5vdmVsU3RhdENhY2hlT3B0aW9ucyksXG5cdFx0XHQuLi5vcHRpb25zLFxuXHRcdFx0Li4uZXh0cmFPcHRpb25zLFxuXHRcdH07XG5cblx0XHRvcHRpb25zLmhpc3RvcnlfbWF4ID0gb3B0aW9ucy5oaXN0b3J5X21heCA+IDAgPyBvcHRpb25zLmhpc3RvcnlfbWF4IDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9tYXg7XG5cblx0XHRvcHRpb25zLmhpc3Rvcnlfa2VlcCA9IG9wdGlvbnMuaGlzdG9yeV9rZWVwID4gMCA/IG9wdGlvbnMuaGlzdG9yeV9rZWVwIDogZGVmYXVsdE9wdGlvbnMuaGlzdG9yeV9rZWVwO1xuXG5cdFx0b3B0aW9ucyA9IGJhc2VTb3J0T2JqZWN0KG9wdGlvbnMpO1xuXG5cdFx0cmV0dXJuIG9wdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICog5bu656uLIE5vdmVsU3RhdENhY2hlIOeJqeS7tlxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZShvcHRpb25zPzogSU5vdmVsU3RhdENhY2hlT3B0aW9ucylcblx0e1xuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyk7XG5cblx0XHRpZiAob3BlbmVkTWFwLmhhcyhvcHRpb25zKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gb3BlbmVkTWFwLmdldChvcHRpb25zKTtcblx0XHR9XG5cblx0XHRsZXQgb2JqID0gbmV3IHRoaXMob3B0aW9ucyk7XG5cblx0XHRvcGVuZWRNYXAuc2V0KG9wdGlvbnMsIG9iaik7XG5cblx0XHRyZXR1cm4gb2JqO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWFgeioseeUqOWFtuS7luaWueW8j+WPluW+lyBkYXRhIOS+huW7uueri+eJqeS7tlxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZUZyb21KU09OKGRhdGE6IElOb3ZlbFN0YXRDYWNoZSB8IEJ1ZmZlciwgb3B0aW9ucz86IFBhcnRpYWw8SU5vdmVsU3RhdENhY2hlT3B0aW9ucz4pXG5cdHtcblx0XHRpZiAoQnVmZmVyLmlzQnVmZmVyKGRhdGEpKVxuXHRcdHtcblx0XHRcdGRhdGEgPSBKU09OLnBhcnNlKGRhdGEudG9TdHJpbmcoKSkgYXMgSU5vdmVsU3RhdENhY2hlO1xuXHRcdH1cblxuXHRcdG9wdGlvbnMgPSB0aGlzLmZpeE9wdGlvbnMob3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zLCB7XG5cdFx0XHRyZWFkb25seTogKCFvcHRpb25zIHx8IG9wdGlvbnMucmVhZG9ubHkgPT0gbnVsbCkgPyB0cnVlIDogb3B0aW9ucy5yZWFkb25seSxcblx0XHRcdGRhdGEsXG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gdGhpcy5jcmVhdGUob3B0aW9ucyBhcyBJTm92ZWxTdGF0Q2FjaGVPcHRpb25zKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcGFyYW0gYm9vbCAtIOa4heeQhueJqeS7tuWkmumkmOizh+aWmVxuXHQgKi9cblx0dG9KU09OKGJvb2w/OiBib29sZWFuIHwgbnVtYmVyIHwgRW51bUJlZm9yZVNhdmUpXG5cdHtcblx0XHRpZiAoYm9vbClcblx0XHR7XG5cdFx0XHR0aGlzLl9iZWZvcmVTYXZlKGJvb2wpXG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmRhdGE7XG5cdH1cblxufVxuXG5leHBvcnQgZW51bSBFbnVtQmVmb3JlU2F2ZVxue1xuXHROT05FID0gMCxcblx0T1BUSU1JWkUgPSAxLFxuXHRPUFRJTUlaRV9BTkRfVVBEQVRFID0gMixcbn1cblxuZXhwb3J0IGVudW0gRW51bUZpbHRlck5vdmVsVHlwZVxue1xuXHQvKipcblx0ICog5Y+W5b6X5omA5pyJ5bCP6Kqq55qE5pyA57WC54uA5oWLKOmgkOiorSlcblx0ICovXG5cdERFU1QgPSAweDAwMDAsXG5cdC8qKlxuXHQgKiDlj6rlj5blvpfljp/lp4vos4fmlplcblx0ICovXG5cdFNPVVJDRV9PTkxZID0gMHgwMDAxLFxuXHQvKipcblx0ICog5Y+q5Y+W5b6XIF9vdXQg5b6M6LOH5paZXG5cdCAqL1xuXHRPVVRQVVRfT05MWSA9IDB4MDAwMixcbn1cblxuTm92ZWxTdGF0Q2FjaGUuZml4T3B0aW9ucyA9IE5vdmVsU3RhdENhY2hlLmZpeE9wdGlvbnMuYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5Ob3ZlbFN0YXRDYWNoZS5jcmVhdGUgPSBOb3ZlbFN0YXRDYWNoZS5jcmVhdGUuYmluZChOb3ZlbFN0YXRDYWNoZSk7XG5Ob3ZlbFN0YXRDYWNoZS5jcmVhdGVGcm9tSlNPTiA9IE5vdmVsU3RhdENhY2hlLmNyZWF0ZUZyb21KU09OLmJpbmQoTm92ZWxTdGF0Q2FjaGUpO1xuXG5jb25zdCB7IGNyZWF0ZSwgZml4T3B0aW9ucywgY3JlYXRlRnJvbUpTT04gfSA9IE5vdmVsU3RhdENhY2hlO1xuZXhwb3J0IHsgY3JlYXRlLCBmaXhPcHRpb25zLCBjcmVhdGVGcm9tSlNPTiB9XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsU3RhdENhY2hlLmNyZWF0ZVxuZXhwb3J0cyA9IE9iamVjdC5mcmVlemUoZXhwb3J0cyk7XG4iXX0=