"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUniqueDecorator = exports.NovelDiffFromLogParser = void 0;
const tslib_1 = require("tslib");
const array_hyper_unique_1 = require("array-hyper-unique");
class NovelDiffFromLogParser {
    constructor(data) {
        this.data = data;
    }
    filterPathMains(filter) {
        return this
            .pathMains()
            .filter((pathMain) => filter(pathMain, this.data.list[pathMain]))
            .reduce((a, b) => {
            a[b] = this.data.list[b];
            return a;
        }, {});
    }
    /**
     * 回傳所有 pathMain 列表
     */
    pathMains() {
        return Object.keys(this.data.list);
    }
    /**
     * 回傳所有 novelID 列表
     */
    novelIDs() {
        return NovelDiffFromLogParser.novelIDs(this.data.list);
    }
    /**
     * 回傳所有檔案列表
     */
    files(filter) {
        return NovelDiffFromLogParser.files(this.data.list, filter);
    }
    static novelIDs(list) {
        return Object.values(list)
            .reduce((a, b) => {
            a.push(...Object.keys(b));
            return a;
        }, []);
    }
    static filterFiles(list, filter) {
        return list.filter(filter);
    }
    static files(list, filter) {
        let ls = Object.values(list)
            .reduce((ls, listTop) => {
            Object.values(listTop)
                .forEach(ls2 => {
                ls2.forEach(v => ls.push(v));
            });
            return ls;
        }, []);
        if (filter) {
            return NovelDiffFromLogParser.filterFiles(ls, filter);
        }
        return ls;
    }
}
(0, tslib_1.__decorate)([
    ArrayUniqueDecorator,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", []),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], NovelDiffFromLogParser.prototype, "pathMains", null);
(0, tslib_1.__decorate)([
    ArrayUniqueDecorator,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", []),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], NovelDiffFromLogParser.prototype, "novelIDs", null);
(0, tslib_1.__decorate)([
    ArrayUniqueDecorator,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Function]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], NovelDiffFromLogParser.prototype, "files", null);
(0, tslib_1.__decorate)([
    ArrayUniqueDecorator,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], NovelDiffFromLogParser, "novelIDs", null);
(0, tslib_1.__decorate)([
    ArrayUniqueDecorator,
    (0, tslib_1.__metadata)("design:type", Function),
    (0, tslib_1.__metadata)("design:paramtypes", [Object, Function]),
    (0, tslib_1.__metadata)("design:returntype", void 0)
], NovelDiffFromLogParser, "files", null);
exports.NovelDiffFromLogParser = NovelDiffFromLogParser;
function ArrayUniqueDecorator(target, propertyKey, descriptor) {
    const old = descriptor.value;
    // @ts-ignore
    descriptor.value = function (...argv) {
        return (0, array_hyper_unique_1.array_unique)(old.apply(this, argv));
    };
}
exports.ArrayUniqueDecorator = ArrayUniqueDecorator;
exports.default = NovelDiffFromLogParser;
//# sourceMappingURL=class.js.map