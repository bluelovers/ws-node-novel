"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayUniqueDecorator = exports.NovelDiffFromLogParser = void 0;
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
__decorate([
    ArrayUniqueDecorator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NovelDiffFromLogParser.prototype, "pathMains", null);
__decorate([
    ArrayUniqueDecorator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NovelDiffFromLogParser.prototype, "novelIDs", null);
__decorate([
    ArrayUniqueDecorator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], NovelDiffFromLogParser.prototype, "files", null);
__decorate([
    ArrayUniqueDecorator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NovelDiffFromLogParser, "novelIDs", null);
__decorate([
    ArrayUniqueDecorator,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Function]),
    __metadata("design:returntype", void 0)
], NovelDiffFromLogParser, "files", null);
exports.NovelDiffFromLogParser = NovelDiffFromLogParser;
function ArrayUniqueDecorator(target, propertyKey, descriptor) {
    const old = descriptor.value;
    // @ts-ignore
    descriptor.value = function (...argv) {
        return array_hyper_unique_1.array_unique(old.apply(this, argv));
    };
}
exports.ArrayUniqueDecorator = ArrayUniqueDecorator;
exports.default = NovelDiffFromLogParser;
//# sourceMappingURL=class.js.map