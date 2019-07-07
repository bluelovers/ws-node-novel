"use strict";
/**
 * Created by user on 2018/2/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
const normalize_num_1 = require("normalize-num");
const filename_1 = require("cjk-conv/lib/novel/filename");
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
    str = StrUtil.trim(str, '　');
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
    str = StrUtil.toHalfWidth(str)
        .toLowerCase();
    str = StrUtil.trim(str, '　');
    str = StrUtil.zh2num(str).toString();
    str = StrUtil.zh2num(str, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0NBQXFDO0FBQ3JDLGlEQUFvQztBQUtwQywwREFBd0Q7QUFDeEQscURBQXFEO0FBUXJELFNBQWdCLGVBQWUsQ0FBQyxHQUFXLEVBQUUsS0FBZTtJQUUzRCxJQUFJLEtBQUssRUFDVDtRQUNDLElBQUksK0JBQStCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUM3QztZQUNDLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1NBQ2hCO2FBQ0ksSUFBSSxnQ0FBZ0MsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ25EO1lBQ0MsR0FBRyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7U0FDaEI7S0FDRDtTQUVEO1FBQ0MsSUFBSSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQy9CO1lBQ0MsR0FBRyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7U0FDaEI7YUFDSSxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDcEM7WUFDQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztTQUNoQjtLQUNEO0lBRUQsR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTdCLE9BQU8sR0FBRyxDQUFDO0FBQ1osQ0FBQztBQTVCRCwwQ0E0QkM7QUFFRCxTQUFnQixhQUFhLENBQUMsR0FBVyxFQUFFLFNBQWlCLENBQUMsRUFBRSxVQUFvQixFQUFFO0lBRXBGLE1BQU0sR0FBRyxNQUFNLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUVsQyx3QkFBd0I7SUFFeEIsR0FBRyxHQUFHLGtCQUFhLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWxDLElBQUksd0JBQXdCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUN0QztRQUNDLEdBQUcsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDO0tBQ2pCO0lBRUQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRTNDLDRDQUE0QztJQUU1QyxHQUFHLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7U0FDNUIsV0FBVyxFQUFFLENBQ2Q7SUFDRCxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFN0IsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFckMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO1FBQ3pCLFdBQVcsRUFBRSxDQUFDO1FBQ2QsS0FBSyxFQUFFLElBQUk7S0FDWCxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFFZCxtQkFBbUI7SUFFbkIsR0FBRyxHQUFHLHVCQUFPLENBQUMsR0FBRyxFQUFFO1FBQ2xCLEdBQUcsRUFBRSxJQUFJO1FBQ1QsS0FBSyxFQUFFLE9BQU8sQ0FBQyxVQUFVO0tBQ3pCLENBQUMsQ0FBQztJQUVIOzs7Ozs7Ozs7Ozs7OztNQWNFO0lBRUYsR0FBRyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRTtRQUVyQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBRUgsR0FBRyxHQUFHLEdBQUc7U0FDUCxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztRQUNuQiw4QkFBOEI7UUFDOUIsMkJBQTJCO1FBQzNCLHNCQUFzQjtTQUNyQixPQUFPLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxDQUFDO1NBQ3JDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDO1NBQ3RCLE9BQU8sQ0FBQywyQkFBMkIsRUFBRSxHQUFHLENBQUM7U0FDekMsT0FBTyxDQUFDLG1DQUFtQyxFQUFFLEdBQUcsQ0FBQztTQUNqRCxPQUFPLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQztTQUM1QixPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztTQUN0QixPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztTQUNuQixPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUVwQjtJQUVEOzs7O01BSUU7SUFFRjs7Ozs7Ozs7OztNQVVFO0lBRUYsR0FBRyxHQUFHLGNBQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFekIsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBOUZELHNDQThGQztBQUVELGtCQUFlLE9BQW1DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTQvMDE0LlxuICovXG5cbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcbmltcG9ydCBzdHIybnVtIGZyb20gJ25vcm1hbGl6ZS1udW0nO1xuXG5pbXBvcnQgeyB6aDJqcCB9IGZyb20gJ2Nqay1jb252JztcbmltcG9ydCB7IGNuMnR3LCB0dzJjbiB9IGZyb20gJ2Nqay1jb252L2xpYi96aC9jb252ZXJ0L2luZGV4JztcbmltcG9ydCB6aFRhYmxlID0gcmVxdWlyZSgnY2prLWNvbnYvbGliL3poL3RhYmxlL2luZGV4Jyk7XG5pbXBvcnQgbm92ZWxGaWxlbmFtZSBmcm9tICdjamstY29udi9saWIvbm92ZWwvZmlsZW5hbWUnO1xuaW1wb3J0IHsgc2x1Z2lmeSB9IGZyb20gJ2Nqay1jb252L2xpYi96aC90YWJsZS9saXN0JztcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1xue1xuXHRwYWROdW0/OiBudW1iZXIsXG5cdGNoZWNrUm9tYW4/OiBib29sZWFuLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplX3N0cmlwKHN0cjogc3RyaW5nLCBpc0Rpcj86IGJvb2xlYW4pXG57XG5cdGlmIChpc0Rpcilcblx0e1xuXHRcdGlmICgvXnA/XFxkezQsfVtcXHNfXSguKykoX1xcKFxcZCtcXCkpJC8uZXhlYyhzdHIpKVxuXHRcdHtcblx0XHRcdHN0ciA9IFJlZ0V4cC4kMTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoL15wP1xcZHs0LH1bXFxzX10oLispKF9cXChcXGQrXFwpKT8kLy5leGVjKHN0cikpXG5cdFx0e1xuXHRcdFx0c3RyID0gUmVnRXhwLiQxO1xuXHRcdH1cblx0fVxuXHRlbHNlXG5cdHtcblx0XHRpZiAoL15cXGQrXyguKylcXC5cXGQrJC8uZXhlYyhzdHIpKVxuXHRcdHtcblx0XHRcdHN0ciA9IFJlZ0V4cC4kMTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoL15jP1xcZHs0LH1fKC4rKSQvLmV4ZWMoc3RyKSlcblx0XHR7XG5cdFx0XHRzdHIgPSBSZWdFeHAuJDE7XG5cdFx0fVxuXHR9XG5cblx0c3RyID0gU3RyVXRpbC50cmltKHN0ciwgJ+OAgCcpO1xuXG5cdHJldHVybiBzdHI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVfdmFsKHN0cjogc3RyaW5nLCBwYWROdW06IG51bWJlciA9IDUsIG9wdGlvbnM6IElPcHRpb25zID0ge30pOiBzdHJpbmdcbntcblx0cGFkTnVtID0gcGFkTnVtIHx8IG9wdGlvbnMucGFkTnVtO1xuXG5cdC8vY29uc29sZS5sb2coMTExLCBzdHIpO1xuXG5cdHN0ciA9IG5vdmVsRmlsZW5hbWUuZmlsZW5hbWUoc3RyKTtcblxuXHRpZiAoL14oPzrluo9844OX44Ot44Ot44O844KwfFByb2xvZ3VlKS9pLnRlc3Qoc3RyKSlcblx0e1xuXHRcdHN0ciA9ICcwXycgKyBzdHI7XG5cdH1cblxuXHRzdHIgPSBzdHIucmVwbGFjZSgvXih3ZWIp54mIKFxcZCspL2ksICckMSQyJyk7XG5cblx0Ly9zdHIgPSBzdHIucmVwbGFjZSgvXltjcF0oXFxkezQsfV8pLywgJyQxJyk7XG5cblx0c3RyID0gU3RyVXRpbC50b0hhbGZXaWR0aChzdHIpXG5cdFx0LnRvTG93ZXJDYXNlKClcblx0O1xuXHRzdHIgPSBTdHJVdGlsLnRyaW0oc3RyLCAn44CAJyk7XG5cblx0c3RyID0gU3RyVXRpbC56aDJudW0oc3RyKS50b1N0cmluZygpO1xuXG5cdHN0ciA9IFN0clV0aWwuemgybnVtKHN0ciwge1xuXHRcdHRydW5jYXRlT25lOiAyLFxuXHRcdGZsYWdzOiAndWcnLFxuXHR9KS50b1N0cmluZygpO1xuXG5cdC8vY29uc29sZS5sb2coc3RyKTtcblxuXHRzdHIgPSBzdHIybnVtKHN0ciwge1xuXHRcdGFsbDogdHJ1ZSxcblx0XHRyb21hbjogb3B0aW9ucy5jaGVja1JvbWFuLFxuXHR9KTtcblxuXHQvKlxuXHRpZiAob3B0aW9ucy5jaGVja1JvbWFuKVxuXHR7XG5cdFx0bGV0IG0gPSBpc1JvbWFuKHN0cik7XG5cblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHRsZXQgbiA9IGRlcm9tYW5pemUobm9ybWFsaXplUm9tYW4obVsxXSkpO1xuXHRcdFx0c3RyID0gbi50b1N0cmluZygpICsgc3RyLnNsaWNlKG1bMV0ubGVuZ3RoKTtcblx0XHRcdC8vY29uc29sZS5sb2cobVsxXSwgbiwgc3RyKTtcblx0XHR9XG5cdH1cblxuXHRzdHIgPSBjaXJjbGUybnVtKHN0cik7XG5cdCovXG5cblx0c3RyID0gc3RyLnJlcGxhY2UoL1xcZCsvZywgZnVuY3Rpb24gKCQwKVxuXHR7XG5cdFx0cmV0dXJuICQwLnBhZFN0YXJ0KHBhZE51bSwgJzAnKTtcblx0fSk7XG5cblx0c3RyID0gc3RyXG5cdFx0LnJlcGxhY2UoL17nrKwrLywgJycpXG5cdFx0Ly8ucmVwbGFjZSgvKFxcZClb56ug6KmxXS9nLCAnJDFfJylcblx0XHQvLy5yZXBsYWNlKC/nrKwoXFxkKS9nLCAnXyQxJylcblx0XHQvLy5yZXBsYWNlKC9cXC4vZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9b4oCV4oCU77yN4pSA4pSAXFwt4oCV4oCU4pSA77ydPeKAleKAlOKAlOKUgOODvOKUgF0vZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9bXFxz44CAXS9nLCAnXycpXG5cdFx0LnJlcGxhY2UoL1tcXChcXCnjgJTvvLvjgJDjgIrvvIjjgIzjgI7jgI/jgI3jgIvvvInjgJHjgJXvvL3jgJTvvLvjgJXvvL1dL2csICdfJylcblx0XHQucmVwbGFjZSgvW8K34oCn44O7wrfCt8K34oCi44O7zofhm6vigKLigKTigKfiiJnii4XiuLHiuLPjg7vqno/Ct+KAp+ODu8K3wrfCt+KAosuZ4peP4oCn77mSXS9nLCAnXycpXG5cdFx0LnJlcGxhY2UoL1vvvJrvvJrvuLDvuZXvvJrvuJPiiLY6XS91ZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9b44O7OixdL2csICdfJylcblx0XHQucmVwbGFjZSgvXyskL2csICcnKVxuXHRcdC5yZXBsYWNlKC9fKy9nLCAnXycpXG5cblx0O1xuXG5cdC8qXG5cdHN0ciA9IHpoMmpwKGNuMnR3KHN0cikgYXMgc3RyaW5nLCB7XG5cdFx0c2FmZTogZmFsc2UsXG5cdH0pO1xuXHQqL1xuXG5cdC8qXG5cdHN0ciA9IHpoVGFibGUuYXV0byhjbjJ0dyhzdHIsIHtcblx0XHRzYWZlOiBmYWxzZSxcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Z3JlZWR5VGFibGU6IHRydWUsXG5cdH0pLCB7XG5cdFx0c2FmZTogZmFsc2UsXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGdyZWVkeVRhYmxlOiB0cnVlLFxuXHR9KVswXTtcblx0Ki9cblxuXHRzdHIgPSBzbHVnaWZ5KHN0ciwgdHJ1ZSk7XG5cblx0cmV0dXJuIHN0cjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL2luZGV4Jyk7XG4iXX0=