"use strict";
/**
 * Created by user on 2018/2/14/014.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const str_util_1 = __importDefault(require("str-util"));
const normalize_num_1 = __importDefault(require("normalize-num"));
const filename_1 = __importDefault(require("cjk-conv/lib/novel/filename"));
const list_1 = require("cjk-conv/lib/zh/table/list");
function normalize_strip(str, isDir) {
    if (isDir) {
        if (/^p?\d{4,}[\s_](.+)(_\(\d+\))$/.exec(str)) {
            str = RegExp.$1;
        }
        else if (/^p?\d{4,}[\s_](.+)(_\(\d+\))?$/.exec(str)) {
            str = RegExp.$1;
        }
    }
    else {
        if (/^\d+_(.+)\.\d+$/.exec(str)) {
            str = RegExp.$1;
        }
        else if (/^c?\d{4,}_(.+)$/.exec(str)) {
            str = RegExp.$1;
        }
    }
    str = str_util_1.default.trim(str, '　');
    return str;
}
exports.normalize_strip = normalize_strip;
function normalize_val(str, padNum = 5, options = {}) {
    padNum = padNum || options.padNum;
    //console.log(111, str);
    str = filename_1.default.filename(str);
    if (/^(?:序|プロローグ|Prologue)/i.test(str)) {
        str = '0_' + str;
    }
    str = str.replace(/^(web)版(\d+)/i, '$1$2');
    //str = str.replace(/^[cp](\d{4,}_)/, '$1');
    str = str_util_1.default.toHalfWidth(str)
        .toLowerCase();
    str = str_util_1.default.trim(str, '　');
    str = str_util_1.default.zh2num(str).toString();
    str = str_util_1.default.zh2num(str, {
        truncateOne: 2,
        flags: 'ug',
    }).toString();
    //console.log(str);
    str = normalize_num_1.default(str, {
        all: true,
        roman: options.checkRoman,
    });
    /*
    if (options.checkRoman)
    {
        let m = isRoman(str);

        if (m)
        {
            let n = deromanize(normalizeRoman(m[1]));
            str = n.toString() + str.slice(m[1].length);
            //console.log(m[1], n, str);
        }
    }

    str = circle2num(str);
    */
    str = str.replace(/\d+/g, function ($0) {
        return $0.padStart(padNum, '0');
    });
    str = str
        .replace(/^第+/, '')
        //.replace(/(\d)[章話]/g, '$1_')
        //.replace(/第(\d)/g, '_$1')
        //.replace(/\./g, '_')
        .replace(/[―—－──\-―—─＝=―——─ー─]/g, '_')
        .replace(/[\s　]/g, '_')
        .replace(/[\(\)〔［【《（「『』」》）】〕］〔［〕］]/g, '_')
        .replace(/[·‧・···•・·᛫•․‧∙⋅⸱⸳・ꞏ·‧・···•˙●‧﹒]/g, '_')
        .replace(/[：：︰﹕：︓∶:]/ug, '_')
        .replace(/[・:,]/g, '_')
        .replace(/_+$/g, '')
        .replace(/_+/g, '_');
    /*
    str = zh2jp(cn2tw(str) as string, {
        safe: false,
    });
    */
    /*
    str = zhTable.auto(cn2tw(str, {
        safe: false,
        // @ts-ignore
        greedyTable: true,
    }), {
        safe: false,
        // @ts-ignore
        greedyTable: true,
    })[0];
    */
    str = list_1.slugify(str, true);
    return str;
}
exports.normalize_val = normalize_val;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7Ozs7O0FBRUgsd0RBQStCO0FBQy9CLGtFQUFvQztBQUtwQywyRUFBd0Q7QUFDeEQscURBQXFEO0FBUXJELFNBQWdCLGVBQWUsQ0FBQyxHQUFXLEVBQUUsS0FBZTtJQUUzRCxJQUFJLEtBQUssRUFDVDtRQUNDLElBQUksK0JBQStCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUM3QztZQUNDLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1NBQ2hCO2FBQ0ksSUFBSSxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25EO1lBQ0MsR0FBRyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7U0FDaEI7S0FDRDtTQUVEO1FBQ0MsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQy9CO1lBQ0MsR0FBRyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7U0FDaEI7YUFDSSxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDcEM7WUFDQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztTQUNoQjtLQUNEO0lBRUQsR0FBRyxHQUFHLGtCQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUU3QixPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUE1QkQsMENBNEJDO0FBRUQsU0FBZ0IsYUFBYSxDQUFDLEdBQVcsRUFBRSxTQUFpQixDQUFDLEVBQUUsVUFBb0IsRUFBRTtJQUVwRixNQUFNLEdBQUcsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUM7SUFFbEMsd0JBQXdCO0lBRXhCLEdBQUcsR0FBRyxrQkFBYSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUVsQyxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDdEM7UUFDQyxHQUFHLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQztLQUNqQjtJQUVELEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUUzQyw0Q0FBNEM7SUFFNUMsR0FBRyxHQUFHLGtCQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztTQUM1QixXQUFXLEVBQUUsQ0FDZDtJQUNELEdBQUcsR0FBRyxrQkFBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFN0IsR0FBRyxHQUFHLGtCQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRXJDLEdBQUcsR0FBRyxrQkFBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7UUFDekIsV0FBVyxFQUFFLENBQUM7UUFDZCxLQUFLLEVBQUUsSUFBSTtLQUNYLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUVkLG1CQUFtQjtJQUVuQixHQUFHLEdBQUcsdUJBQU8sQ0FBQyxHQUFHLEVBQUU7UUFDbEIsR0FBRyxFQUFFLElBQUk7UUFDVCxLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVU7S0FDekIsQ0FBQyxDQUFDO0lBRUg7Ozs7Ozs7Ozs7Ozs7O01BY0U7SUFFRixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFO1FBRXJDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFFSCxHQUFHLEdBQUcsR0FBRztTQUNQLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQ25CLDhCQUE4QjtRQUM5QiwyQkFBMkI7UUFDM0Isc0JBQXNCO1NBQ3JCLE9BQU8sQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUM7U0FDckMsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7U0FDdEIsT0FBTyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQztTQUN6QyxPQUFPLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxDQUFDO1NBQ2pELE9BQU8sQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDO1NBQzVCLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDO1NBQ3RCLE9BQU8sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDO1NBQ25CLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBRXBCO0lBRUQ7Ozs7TUFJRTtJQUVGOzs7Ozs7Ozs7O01BVUU7SUFFRixHQUFHLEdBQUcsY0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUV6QixPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUE5RkQsc0NBOEZDO0FBRUQsa0JBQWUsT0FBbUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMi8xNC8wMTQuXG4gKi9cblxuaW1wb3J0IFN0clV0aWwgZnJvbSAnc3RyLXV0aWwnO1xuaW1wb3J0IHN0cjJudW0gZnJvbSAnbm9ybWFsaXplLW51bSc7XG5cbmltcG9ydCB7IHpoMmpwIH0gZnJvbSAnY2prLWNvbnYnO1xuaW1wb3J0IHsgY24ydHcsIHR3MmNuIH0gZnJvbSAnY2prLWNvbnYvbGliL3poL2NvbnZlcnQvaW5kZXgnO1xuaW1wb3J0IHpoVGFibGUgPSByZXF1aXJlKCdjamstY29udi9saWIvemgvdGFibGUvaW5kZXgnKTtcbmltcG9ydCBub3ZlbEZpbGVuYW1lIGZyb20gJ2Nqay1jb252L2xpYi9ub3ZlbC9maWxlbmFtZSc7XG5pbXBvcnQgeyBzbHVnaWZ5IH0gZnJvbSAnY2prLWNvbnYvbGliL3poL3RhYmxlL2xpc3QnO1xuXG5leHBvcnQgaW50ZXJmYWNlIElPcHRpb25zXG57XG5cdHBhZE51bT86IG51bWJlcixcblx0Y2hlY2tSb21hbj86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVfc3RyaXAoc3RyOiBzdHJpbmcsIGlzRGlyPzogYm9vbGVhbilcbntcblx0aWYgKGlzRGlyKVxuXHR7XG5cdFx0aWYgKC9ecD9cXGR7NCx9W1xcc19dKC4rKShfXFwoXFxkK1xcKSkkLy5leGVjKHN0cikpXG5cdFx0e1xuXHRcdFx0c3RyID0gUmVnRXhwLiQxO1xuXHRcdH1cblx0XHRlbHNlIGlmICgvXnA/XFxkezQsfVtcXHNfXSguKykoX1xcKFxcZCtcXCkpPyQvLmV4ZWMoc3RyKSlcblx0XHR7XG5cdFx0XHRzdHIgPSBSZWdFeHAuJDE7XG5cdFx0fVxuXHR9XG5cdGVsc2Vcblx0e1xuXHRcdGlmICgvXlxcZCtfKC4rKVxcLlxcZCskLy5leGVjKHN0cikpXG5cdFx0e1xuXHRcdFx0c3RyID0gUmVnRXhwLiQxO1xuXHRcdH1cblx0XHRlbHNlIGlmICgvXmM/XFxkezQsfV8oLispJC8uZXhlYyhzdHIpKVxuXHRcdHtcblx0XHRcdHN0ciA9IFJlZ0V4cC4kMTtcblx0XHR9XG5cdH1cblxuXHRzdHIgPSBTdHJVdGlsLnRyaW0oc3RyLCAn44CAJyk7XG5cblx0cmV0dXJuIHN0cjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZV92YWwoc3RyOiBzdHJpbmcsIHBhZE51bTogbnVtYmVyID0gNSwgb3B0aW9uczogSU9wdGlvbnMgPSB7fSk6IHN0cmluZ1xue1xuXHRwYWROdW0gPSBwYWROdW0gfHwgb3B0aW9ucy5wYWROdW07XG5cblx0Ly9jb25zb2xlLmxvZygxMTEsIHN0cik7XG5cblx0c3RyID0gbm92ZWxGaWxlbmFtZS5maWxlbmFtZShzdHIpO1xuXG5cdGlmICgvXig/OuW6j3zjg5fjg63jg63jg7zjgrB8UHJvbG9ndWUpL2kudGVzdChzdHIpKVxuXHR7XG5cdFx0c3RyID0gJzBfJyArIHN0cjtcblx0fVxuXG5cdHN0ciA9IHN0ci5yZXBsYWNlKC9eKHdlYinniYgoXFxkKykvaSwgJyQxJDInKTtcblxuXHQvL3N0ciA9IHN0ci5yZXBsYWNlKC9eW2NwXShcXGR7NCx9XykvLCAnJDEnKTtcblxuXHRzdHIgPSBTdHJVdGlsLnRvSGFsZldpZHRoKHN0cilcblx0XHQudG9Mb3dlckNhc2UoKVxuXHQ7XG5cdHN0ciA9IFN0clV0aWwudHJpbShzdHIsICfjgIAnKTtcblxuXHRzdHIgPSBTdHJVdGlsLnpoMm51bShzdHIpLnRvU3RyaW5nKCk7XG5cblx0c3RyID0gU3RyVXRpbC56aDJudW0oc3RyLCB7XG5cdFx0dHJ1bmNhdGVPbmU6IDIsXG5cdFx0ZmxhZ3M6ICd1ZycsXG5cdH0pLnRvU3RyaW5nKCk7XG5cblx0Ly9jb25zb2xlLmxvZyhzdHIpO1xuXG5cdHN0ciA9IHN0cjJudW0oc3RyLCB7XG5cdFx0YWxsOiB0cnVlLFxuXHRcdHJvbWFuOiBvcHRpb25zLmNoZWNrUm9tYW4sXG5cdH0pO1xuXG5cdC8qXG5cdGlmIChvcHRpb25zLmNoZWNrUm9tYW4pXG5cdHtcblx0XHRsZXQgbSA9IGlzUm9tYW4oc3RyKTtcblxuXHRcdGlmIChtKVxuXHRcdHtcblx0XHRcdGxldCBuID0gZGVyb21hbml6ZShub3JtYWxpemVSb21hbihtWzFdKSk7XG5cdFx0XHRzdHIgPSBuLnRvU3RyaW5nKCkgKyBzdHIuc2xpY2UobVsxXS5sZW5ndGgpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhtWzFdLCBuLCBzdHIpO1xuXHRcdH1cblx0fVxuXG5cdHN0ciA9IGNpcmNsZTJudW0oc3RyKTtcblx0Ki9cblxuXHRzdHIgPSBzdHIucmVwbGFjZSgvXFxkKy9nLCBmdW5jdGlvbiAoJDApXG5cdHtcblx0XHRyZXR1cm4gJDAucGFkU3RhcnQocGFkTnVtLCAnMCcpO1xuXHR9KTtcblxuXHRzdHIgPSBzdHJcblx0XHQucmVwbGFjZSgvXuesrCsvLCAnJylcblx0XHQvLy5yZXBsYWNlKC8oXFxkKVvnq6DoqbFdL2csICckMV8nKVxuXHRcdC8vLnJlcGxhY2UoL+esrChcXGQpL2csICdfJDEnKVxuXHRcdC8vLnJlcGxhY2UoL1xcLi9nLCAnXycpXG5cdFx0LnJlcGxhY2UoL1vigJXigJTvvI3ilIDilIBcXC3igJXigJTilIDvvJ094oCV4oCU4oCU4pSA44O84pSAXS9nLCAnXycpXG5cdFx0LnJlcGxhY2UoL1tcXHPjgIBdL2csICdfJylcblx0XHQucmVwbGFjZSgvW1xcKFxcKeOAlO+8u+OAkOOAiu+8iOOAjOOAjuOAj+OAjeOAi++8ieOAkeOAle+8veOAlO+8u+OAle+8vV0vZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9bwrfigKfjg7vCt8K3wrfigKLjg7vOh+Gbq+KAouKApOKAp+KImeKLheK4seK4s+ODu+qej8K34oCn44O7wrfCt8K34oCiy5nil4/igKfvuZJdL2csICdfJylcblx0XHQucmVwbGFjZSgvW++8mu+8mu+4sO+5le+8mu+4k+KItjpdL3VnLCAnXycpXG5cdFx0LnJlcGxhY2UoL1vjg7s6LF0vZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9fKyQvZywgJycpXG5cdFx0LnJlcGxhY2UoL18rL2csICdfJylcblxuXHQ7XG5cblx0Lypcblx0c3RyID0gemgyanAoY24ydHcoc3RyKSBhcyBzdHJpbmcsIHtcblx0XHRzYWZlOiBmYWxzZSxcblx0fSk7XG5cdCovXG5cblx0Lypcblx0c3RyID0gemhUYWJsZS5hdXRvKGNuMnR3KHN0ciwge1xuXHRcdHNhZmU6IGZhbHNlLFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRncmVlZHlUYWJsZTogdHJ1ZSxcblx0fSksIHtcblx0XHRzYWZlOiBmYWxzZSxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Z3JlZWR5VGFibGU6IHRydWUsXG5cdH0pWzBdO1xuXHQqL1xuXG5cdHN0ciA9IHNsdWdpZnkoc3RyLCB0cnVlKTtcblxuXHRyZXR1cm4gc3RyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBleHBvcnRzIGFzIHR5cGVvZiBpbXBvcnQoJy4vaW5kZXgnKTtcbiJdfQ==