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
    files() {
        return NovelDiffFromLogParser.files(this.data.list);
    }
    static novelIDs(list) {
        return Object.values(list)
            .reduce((a, b) => {
            a.push(...Object.keys(b));
            return a;
        }, []);
    }
    static files(list) {
        return Object.values(list)
            .reduce((ls, listTop) => {
            Object.values(listTop)
                .forEach(ls2 => {
                ls2.forEach(v => ls.push(v));
            });
            return ls;
        }, []);
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
    __metadata("design:paramtypes", []),
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
    __metadata("design:paramtypes", [Object]),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjbGFzcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUlBLDJEQUFrRDtBQUdsRCxNQUFhLHNCQUFzQjtJQUVsQyxZQUFtQixJQUF1QjtRQUF2QixTQUFJLEdBQUosSUFBSSxDQUFtQjtJQUcxQyxDQUFDO0lBRUQsZUFBZSxDQUFDLE1BQTJEO1FBRTFFLE9BQU8sSUFBSTthQUNULFNBQVMsRUFBRTthQUNYLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2FBQ2hFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekIsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDLEVBQUUsRUFBZSxDQUFDLENBQ25CO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBRUgsU0FBUztRQUVSLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUVILFFBQVE7UUFFUCxPQUFPLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3ZELENBQUM7SUFFRDs7T0FFRztJQUVILEtBQUs7UUFFSixPQUFPLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFHRCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQStCO1FBRTlDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7YUFDeEIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ2hCLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsT0FBTyxDQUFDLENBQUM7UUFDVixDQUFDLEVBQUUsRUFBYyxDQUFDLENBQUE7SUFDcEIsQ0FBQztJQUdELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBK0I7UUFFM0MsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQzthQUN4QixNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFFdkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7aUJBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDZCxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQzdCLENBQUMsQ0FBQyxDQUNGO1lBRUQsT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDLEVBQUUsRUFBb0IsQ0FBQyxDQUFDO0lBQzNCLENBQUM7Q0FDRDtBQWhEQTtJQURDLG9CQUFvQjs7Ozt1REFJcEI7QUFNRDtJQURDLG9CQUFvQjs7OztzREFJcEI7QUFNRDtJQURDLG9CQUFvQjs7OzttREFJcEI7QUFHRDtJQURDLG9CQUFvQjs7Ozs0Q0FRcEI7QUFHRDtJQURDLG9CQUFvQjs7Ozt5Q0FjcEI7QUF0RUYsd0RBdUVDO0FBRUQsU0FBZ0Isb0JBQW9CLENBQXFCLE1BQWMsRUFBRSxXQUE0QixFQUFFLFVBQXNDO0lBRTVJLE1BQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7SUFFN0IsYUFBYTtJQUNiLFVBQVUsQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLElBQUk7UUFFbkMsT0FBTyxpQ0FBWSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7SUFDM0MsQ0FBQyxDQUFBO0FBQ0YsQ0FBQztBQVRELG9EQVNDO0FBRUQsa0JBQWUsc0JBQXNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE5LzYvMTguXG4gKi9cbmltcG9ydCB7IElMaXN0RmlsZVJvdywgSUxpc3RNYWluLCBJTGlzdE1haW5Sb3csIElOb3ZlbERpZmZGcm9tTG9nIH0gZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IHsgSVRTVHlwZUJ1aWxkSW4gfSBmcm9tICd0cy10eXBlJ1xuXG5leHBvcnQgY2xhc3MgTm92ZWxEaWZmRnJvbUxvZ1BhcnNlclxue1xuXHRjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YTogSU5vdmVsRGlmZkZyb21Mb2cpXG5cdHtcblxuXHR9XG5cblx0ZmlsdGVyUGF0aE1haW5zKGZpbHRlcjogKHBhdGhNYWluOiBzdHJpbmcsIHZhbHVlczogSUxpc3RNYWluUm93KSA9PiBib29sZWFuKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXNcblx0XHRcdC5wYXRoTWFpbnMoKVxuXHRcdFx0LmZpbHRlcigocGF0aE1haW4pID0+IGZpbHRlcihwYXRoTWFpbiwgdGhpcy5kYXRhLmxpc3RbcGF0aE1haW5dKSlcblx0XHRcdC5yZWR1Y2UoKGEsIGIpID0+IHtcblx0XHRcdFx0YVtiXSA9IHRoaXMuZGF0YS5saXN0W2JdO1xuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIHt9IGFzIElMaXN0TWFpbilcblx0XHQ7XG5cdH1cblxuXHQvKipcblx0ICog5Zue5YKz5omA5pyJIHBhdGhNYWluIOWIl+ihqFxuXHQgKi9cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdHBhdGhNYWlucygpXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5kYXRhLmxpc3QpO1xuXHR9XG5cblx0LyoqXG5cdCAqIOWbnuWCs+aJgOaciSBub3ZlbElEIOWIl+ihqFxuXHQgKi9cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdG5vdmVsSURzKClcblx0e1xuXHRcdHJldHVybiBOb3ZlbERpZmZGcm9tTG9nUGFyc2VyLm5vdmVsSURzKHRoaXMuZGF0YS5saXN0KVxuXHR9XG5cblx0LyoqXG5cdCAqIOWbnuWCs+aJgOacieaqlOahiOWIl+ihqFxuXHQgKi9cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdGZpbGVzKClcblx0e1xuXHRcdHJldHVybiBOb3ZlbERpZmZGcm9tTG9nUGFyc2VyLmZpbGVzKHRoaXMuZGF0YS5saXN0KVxuXHR9XG5cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdHN0YXRpYyBub3ZlbElEcyhsaXN0OiBJTm92ZWxEaWZmRnJvbUxvZ1tcImxpc3RcIl0pXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LnZhbHVlcyhsaXN0KVxuXHRcdFx0LnJlZHVjZSgoYSwgYikgPT4ge1xuXHRcdFx0XHRhLnB1c2goLi4uT2JqZWN0LmtleXMoYikpO1xuXHRcdFx0XHRyZXR1cm4gYTtcblx0XHRcdH0sIFtdIGFzIHN0cmluZ1tdKVxuXHR9XG5cblx0QEFycmF5VW5pcXVlRGVjb3JhdG9yXG5cdHN0YXRpYyBmaWxlcyhsaXN0OiBJTm92ZWxEaWZmRnJvbUxvZ1tcImxpc3RcIl0pXG5cdHtcblx0XHRyZXR1cm4gT2JqZWN0LnZhbHVlcyhsaXN0KVxuXHRcdFx0LnJlZHVjZSgobHMsIGxpc3RUb3ApID0+IHtcblxuXHRcdFx0XHRPYmplY3QudmFsdWVzKGxpc3RUb3ApXG5cdFx0XHRcdFx0LmZvckVhY2gobHMyID0+IHtcblx0XHRcdFx0XHRcdGxzMi5mb3JFYWNoKHYgPT4gbHMucHVzaCh2KSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQ7XG5cblx0XHRcdFx0cmV0dXJuIGxzO1xuXHRcdFx0fSwgW10gYXMgSUxpc3RGaWxlUm93W10pO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBBcnJheVVuaXF1ZURlY29yYXRvcjxUIGV4dGVuZHMgRnVuY3Rpb24+KHRhcmdldDogb2JqZWN0LCBwcm9wZXJ0eUtleTogc3RyaW5nIHwgc3ltYm9sLCBkZXNjcmlwdG9yOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxUPilcbntcblx0Y29uc3Qgb2xkID0gZGVzY3JpcHRvci52YWx1ZTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGRlc2NyaXB0b3IudmFsdWUgPSBmdW5jdGlvbiAoLi4uYXJndilcblx0e1xuXHRcdHJldHVybiBhcnJheV91bmlxdWUob2xkLmFwcGx5KHRoaXMsIGFyZ3YpKVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5vdmVsRGlmZkZyb21Mb2dQYXJzZXJcbiJdfQ==