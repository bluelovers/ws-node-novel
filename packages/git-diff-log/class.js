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
const array_hyper_unique_1 = require("array-hyper-unique");
let NovelDiffFromLogParser = /** @class */ (() => {
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
    return NovelDiffFromLogParser;
})();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjbGFzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUlBLDJEQUFrRDtBQUdsRDtJQUFBLE1BQWEsc0JBQXNCO1FBRWxDLFlBQW1CLElBQXVCO1lBQXZCLFNBQUksR0FBSixJQUFJLENBQW1CO1FBRzFDLENBQUM7UUFFRCxlQUFlLENBQUMsTUFBMkQ7WUFFMUUsT0FBTyxJQUFJO2lCQUNULFNBQVMsRUFBRTtpQkFDWCxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDaEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxFQUFFLEVBQWUsQ0FBQyxDQUNuQjtRQUNGLENBQUM7UUFFRDs7V0FFRztRQUVILFNBQVM7WUFFUixPQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBRUQ7O1dBRUc7UUFFSCxRQUFRO1lBRVAsT0FBTyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN2RCxDQUFDO1FBRUQ7O1dBRUc7UUFFSCxLQUFLLENBQUMsTUFBeUM7WUFFOUMsT0FBTyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDNUQsQ0FBQztRQUdELE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBK0I7WUFFOUMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztpQkFDeEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNoQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixPQUFPLENBQUMsQ0FBQztZQUNWLENBQUMsRUFBRSxFQUFjLENBQUMsQ0FBQTtRQUNwQixDQUFDO1FBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFvQixFQUFFLE1BQXdDO1lBRWhGLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUMzQixDQUFDO1FBR0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUErQixFQUFFLE1BQXlDO1lBRXRGLElBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO2lCQUMxQixNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBRXZCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO3FCQUNwQixPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDN0IsQ0FBQyxDQUFDLENBQ0Y7Z0JBRUQsT0FBTyxFQUFFLENBQUM7WUFDWCxDQUFDLEVBQUUsRUFBb0IsQ0FBQyxDQUFDO1lBRTFCLElBQUksTUFBTSxFQUNWO2dCQUNDLE9BQU8sc0JBQXNCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQTthQUNyRDtZQUVELE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztLQUNEO0lBNURBO1FBREMsb0JBQW9COzs7OzJEQUlwQjtJQU1EO1FBREMsb0JBQW9COzs7OzBEQUlwQjtJQU1EO1FBREMsb0JBQW9COzs7O3VEQUlwQjtJQUdEO1FBREMsb0JBQW9COzs7O2dEQVFwQjtJQVFEO1FBREMsb0JBQW9COzs7OzZDQXFCcEI7SUFDRiw2QkFBQztLQUFBO0FBbkZZLHdEQUFzQjtBQXFGbkMsU0FBZ0Isb0JBQW9CLENBQXFCLE1BQWMsRUFBRSxXQUE0QixFQUFFLFVBQXNDO0lBRTVJLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7SUFFN0IsYUFBYTtJQUNiLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLElBQUk7UUFFbkMsT0FBTyxpQ0FBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDM0MsQ0FBQyxDQUFBO0FBQ0YsQ0FBQztBQVRELG9EQVNDO0FBRUQsa0JBQWUsc0JBQXNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzYvMTguXG4gKi9cbmltcG9ydCB7IElMaXN0RmlsZVJvdywgSUxpc3RNYWluLCBJTGlzdE1haW5Sb3csIElOb3ZlbERpZmZGcm9tTG9nIH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IHsgSVRTVHlwZUJ1aWxkSW4gfSBmcm9tICd0cy10eXBlJ1xuXG5leHBvcnQgY2xhc3MgTm92ZWxEaWZmRnJvbUxvZ1BhcnNlclxue1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YTogSU5vdmVsRGlmZkZyb21Mb2cpXG5cdHtcblxuXHR9XG5cblx0ZmlsdGVyUGF0aE1haW5zKGZpbHRlcjogKHBhdGhNYWluOiBzdHJpbmcsIHZhbHVlczogSUxpc3RNYWluUm93KSA9PiBib29sZWFuKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNcblx0XHRcdC5wYXRoTWFpbnMoKVxuXHRcdFx0LmZpbHRlcigocGF0aE1haW4pID0+IGZpbHRlcihwYXRoTWFpbiwgdGhpcy5kYXRhLmxpc3RbcGF0aE1haW5dKSlcblx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+IHtcblx0XHRcdFx0YVtiXSA9IHRoaXMuZGF0YS5saXN0W2JdO1xuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIHt9IGFzIElMaXN0TWFpbilcblx0XHQ7XG5cdH1cblxuXHQvKipcblx0ICog5Zue5YKz5omA5pyJIHBhdGhNYWluIOWIl+ihqFxuXHQgKi9cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdHBhdGhNYWlucygpXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5kYXRhLmxpc3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWbnuWCs+aJgOaciSBub3ZlbElEIOWIl+ihqFxuXHQgKi9cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdG5vdmVsSURzKClcblx0e1xuXHRcdHJldHVybiBOb3ZlbERpZmZGcm9tTG9nUGFyc2VyLm5vdmVsSURzKHRoaXMuZGF0YS5saXN0KVxuXHR9XG5cblx0LyoqXG5cdCAqIOWbnuWCs+aJgOacieaqlOahiOWIl+ihqFxuXHQgKi9cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdGZpbGVzKGZpbHRlcj86ICh2YWx1ZTogSUxpc3RGaWxlUm93KSA9PiBib29sZWFuKVxuXHR7XG5cdFx0cmV0dXJuIE5vdmVsRGlmZkZyb21Mb2dQYXJzZXIuZmlsZXModGhpcy5kYXRhLmxpc3QsIGZpbHRlcilcblx0fVxuXG5cdEBBcnJheVVuaXF1ZURlY29yYXRvclxuXHRzdGF0aWMgbm92ZWxJRHMobGlzdDogSU5vdmVsRGlmZkZyb21Mb2dbXCJsaXN0XCJdKVxuXHR7XG5cdFx0cmV0dXJuIE9iamVjdC52YWx1ZXMobGlzdClcblx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+IHtcblx0XHRcdFx0YS5wdXNoKC4uLk9iamVjdC5rZXlzKGIpKTtcblx0XHRcdFx0cmV0dXJuIGE7XG5cdFx0XHR9LCBbXSBhcyBzdHJpbmdbXSlcblx0fVxuXG5cdHN0YXRpYyBmaWx0ZXJGaWxlcyhsaXN0OiBJTGlzdEZpbGVSb3dbXSwgZmlsdGVyOiAodmFsdWU6IElMaXN0RmlsZVJvdykgPT4gYm9vbGVhbilcblx0e1xuXHRcdHJldHVybiBsaXN0LmZpbHRlcihmaWx0ZXIpXG5cdH1cblxuXHRAQXJyYXlVbmlxdWVEZWNvcmF0b3Jcblx0c3RhdGljIGZpbGVzKGxpc3Q6IElOb3ZlbERpZmZGcm9tTG9nW1wibGlzdFwiXSwgZmlsdGVyPzogKHZhbHVlOiBJTGlzdEZpbGVSb3cpID0+IGJvb2xlYW4pXG5cdHtcblx0XHRsZXQgbHMgPSBPYmplY3QudmFsdWVzKGxpc3QpXG5cdFx0XHQucmVkdWNlKChscywgbGlzdFRvcCkgPT4ge1xuXG5cdFx0XHRcdE9iamVjdC52YWx1ZXMobGlzdFRvcClcblx0XHRcdFx0XHQuZm9yRWFjaChsczIgPT4ge1xuXHRcdFx0XHRcdFx0bHMyLmZvckVhY2godiA9PiBscy5wdXNoKHYpKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdDtcblxuXHRcdFx0XHRyZXR1cm4gbHM7XG5cdFx0XHR9LCBbXSBhcyBJTGlzdEZpbGVSb3dbXSk7XG5cblx0XHRpZiAoZmlsdGVyKVxuXHRcdHtcblx0XHRcdHJldHVybiBOb3ZlbERpZmZGcm9tTG9nUGFyc2VyLmZpbHRlckZpbGVzKGxzLCBmaWx0ZXIpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGxzO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnJheVVuaXF1ZURlY29yYXRvcjxUIGV4dGVuZHMgRnVuY3Rpb24+KHRhcmdldDogb2JqZWN0LCBwcm9wZXJ0eUtleTogc3RyaW5nIHwgc3ltYm9sLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxUPilcbntcblx0Y29uc3Qgb2xkID0gZGVzY3JpcHRvci52YWx1ZTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBhcnJheV91bmlxdWUob2xkLmFwcGx5KHRoaXMsIGFyZ3YpKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsRGlmZkZyb21Mb2dQYXJzZXJcbiJdfQ==