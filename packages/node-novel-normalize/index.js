"use strict";
/**
 * Created by user on 2018/2/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const StrUtil = require("str-util");
const normalize_num_1 = require("normalize-num");
const cjk_conv_1 = require("cjk-conv");
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
    str = cjk_conv_1.novelFilename.filename(str);
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
        .replace(/[―—－──\-―—─＝=]/g, '_')
        .replace(/[\s　]/g, '_')
        .replace(/[\(\)〔［【《（「『』」》）】〕］]/g, '_')
        .replace(/[·‧・···•]/g, '_')
        .replace(/[：：︰﹕：]/ug, '_')
        .replace(/[・:,]/g, '_')
        .replace(/_+$/g, '')
        .replace(/_+/g, '_');
    str = cjk_conv_1.zh2jp(cjk_conv_1.cn2tw(str), {
        safe: false,
    });
    //console.log(str);
    return str;
}
exports.normalize_val = normalize_val;
const self = require("./index");
exports.default = self;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsb0NBQW9DO0FBQ3BDLGlEQUFvQztBQUVwQyx1Q0FBdUQ7QUFRdkQsU0FBZ0IsZUFBZSxDQUFDLEdBQVcsRUFBRSxLQUFlO0lBRTNELElBQUksS0FBSyxFQUNUO1FBQ0MsSUFBSSwrQkFBK0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQzdDO1lBQ0MsR0FBRyxHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUM7U0FDaEI7YUFDSSxJQUFJLGdDQUFnQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDbkQ7WUFDQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztTQUNoQjtLQUNEO1NBRUQ7UUFDQyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDL0I7WUFDQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztTQUNoQjthQUNJLElBQUksaUJBQWlCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUNwQztZQUNDLEdBQUcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1NBQ2hCO0tBQ0Q7SUFFRCxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFN0IsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBNUJELDBDQTRCQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxHQUFXLEVBQUUsU0FBaUIsQ0FBQyxFQUFFLFVBQW9CLEVBQUU7SUFFcEYsTUFBTSxHQUFHLE1BQU0sSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDO0lBRWxDLHdCQUF3QjtJQUV4QixHQUFHLEdBQUcsd0JBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFbEMsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQ3RDO1FBQ0MsR0FBRyxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7S0FDakI7SUFFRCxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFFM0MsNENBQTRDO0lBRTVDLEdBQUcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztTQUM1QixXQUFXLEVBQUUsQ0FDZDtJQUNELEdBQUcsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUU3QixHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUVyQyxHQUFHLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7UUFDekIsV0FBVyxFQUFFLENBQUM7UUFDZCxLQUFLLEVBQUUsSUFBSTtLQUNYLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUVkLG1CQUFtQjtJQUVuQixHQUFHLEdBQUcsdUJBQU8sQ0FBQyxHQUFHLEVBQUU7UUFDbEIsR0FBRyxFQUFFLElBQUk7UUFDVCxLQUFLLEVBQUUsT0FBTyxDQUFDLFVBQVU7S0FDekIsQ0FBQyxDQUFDO0lBRUg7Ozs7Ozs7Ozs7Ozs7O01BY0U7SUFFRixHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFO1FBRXJDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFFSCxHQUFHLEdBQUcsR0FBRztTQUNQLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1FBQ25CLDhCQUE4QjtRQUM5QiwyQkFBMkI7UUFDM0Isc0JBQXNCO1NBQ3JCLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUM7U0FDL0IsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7U0FDdEIsT0FBTyxDQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQztTQUNyQyxPQUFPLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQztTQUMxQixPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQztTQUN6QixPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQztTQUN0QixPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQztTQUNuQixPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUVwQjtJQUVELEdBQUcsR0FBRyxnQkFBSyxDQUFDLGdCQUFLLENBQUMsR0FBRyxDQUFXLEVBQUU7UUFDakMsSUFBSSxFQUFFLEtBQUs7S0FDWCxDQUFDLENBQUM7SUFFSCxtQkFBbUI7SUFFbkIsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBaEZELHNDQWdGQztBQUVELGdDQUFnQztBQUNoQyxrQkFBZSxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzIvMTQvMDE0LlxuICovXG5cbmltcG9ydCAqIGFzIFN0clV0aWwgZnJvbSAnc3RyLXV0aWwnO1xuaW1wb3J0IHN0cjJudW0gZnJvbSAnbm9ybWFsaXplLW51bSc7XG5cbmltcG9ydCB7IGNuMnR3LCB6aDJqcCwgbm92ZWxGaWxlbmFtZSB9IGZyb20gJ2Nqay1jb252JztcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uc1xue1xuXHRwYWROdW0/OiBudW1iZXIsXG5cdGNoZWNrUm9tYW4/OiBib29sZWFuLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplX3N0cmlwKHN0cjogc3RyaW5nLCBpc0Rpcj86IGJvb2xlYW4pXG57XG5cdGlmIChpc0Rpcilcblx0e1xuXHRcdGlmICgvXnA/XFxkezQsfVtcXHNfXSguKykoX1xcKFxcZCtcXCkpJC8uZXhlYyhzdHIpKVxuXHRcdHtcblx0XHRcdHN0ciA9IFJlZ0V4cC4kMTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoL15wP1xcZHs0LH1bXFxzX10oLispKF9cXChcXGQrXFwpKT8kLy5leGVjKHN0cikpXG5cdFx0e1xuXHRcdFx0c3RyID0gUmVnRXhwLiQxO1xuXHRcdH1cblx0fVxuXHRlbHNlXG5cdHtcblx0XHRpZiAoL15cXGQrXyguKylcXC5cXGQrJC8uZXhlYyhzdHIpKVxuXHRcdHtcblx0XHRcdHN0ciA9IFJlZ0V4cC4kMTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoL15jP1xcZHs0LH1fKC4rKSQvLmV4ZWMoc3RyKSlcblx0XHR7XG5cdFx0XHRzdHIgPSBSZWdFeHAuJDE7XG5cdFx0fVxuXHR9XG5cblx0c3RyID0gU3RyVXRpbC50cmltKHN0ciwgJ+OAgCcpO1xuXG5cdHJldHVybiBzdHI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVfdmFsKHN0cjogc3RyaW5nLCBwYWROdW06IG51bWJlciA9IDUsIG9wdGlvbnM6IElPcHRpb25zID0ge30pOiBzdHJpbmdcbntcblx0cGFkTnVtID0gcGFkTnVtIHx8IG9wdGlvbnMucGFkTnVtO1xuXG5cdC8vY29uc29sZS5sb2coMTExLCBzdHIpO1xuXG5cdHN0ciA9IG5vdmVsRmlsZW5hbWUuZmlsZW5hbWUoc3RyKTtcblxuXHRpZiAoL14oPzrluo9844OX44Ot44Ot44O844KwfFByb2xvZ3VlKS9pLnRlc3Qoc3RyKSlcblx0e1xuXHRcdHN0ciA9ICcwXycgKyBzdHI7XG5cdH1cblxuXHRzdHIgPSBzdHIucmVwbGFjZSgvXih3ZWIp54mIKFxcZCspL2ksICckMSQyJyk7XG5cblx0Ly9zdHIgPSBzdHIucmVwbGFjZSgvXltjcF0oXFxkezQsfV8pLywgJyQxJyk7XG5cblx0c3RyID0gU3RyVXRpbC50b0hhbGZXaWR0aChzdHIpXG5cdFx0LnRvTG93ZXJDYXNlKClcblx0O1xuXHRzdHIgPSBTdHJVdGlsLnRyaW0oc3RyLCAn44CAJyk7XG5cblx0c3RyID0gU3RyVXRpbC56aDJudW0oc3RyKS50b1N0cmluZygpO1xuXG5cdHN0ciA9IFN0clV0aWwuemgybnVtKHN0ciwge1xuXHRcdHRydW5jYXRlT25lOiAyLFxuXHRcdGZsYWdzOiAndWcnLFxuXHR9KS50b1N0cmluZygpO1xuXG5cdC8vY29uc29sZS5sb2coc3RyKTtcblxuXHRzdHIgPSBzdHIybnVtKHN0ciwge1xuXHRcdGFsbDogdHJ1ZSxcblx0XHRyb21hbjogb3B0aW9ucy5jaGVja1JvbWFuLFxuXHR9KTtcblxuXHQvKlxuXHRpZiAob3B0aW9ucy5jaGVja1JvbWFuKVxuXHR7XG5cdFx0bGV0IG0gPSBpc1JvbWFuKHN0cik7XG5cblx0XHRpZiAobSlcblx0XHR7XG5cdFx0XHRsZXQgbiA9IGRlcm9tYW5pemUobm9ybWFsaXplUm9tYW4obVsxXSkpO1xuXHRcdFx0c3RyID0gbi50b1N0cmluZygpICsgc3RyLnNsaWNlKG1bMV0ubGVuZ3RoKTtcblx0XHRcdC8vY29uc29sZS5sb2cobVsxXSwgbiwgc3RyKTtcblx0XHR9XG5cdH1cblxuXHRzdHIgPSBjaXJjbGUybnVtKHN0cik7XG5cdCovXG5cblx0c3RyID0gc3RyLnJlcGxhY2UoL1xcZCsvZywgZnVuY3Rpb24gKCQwKVxuXHR7XG5cdFx0cmV0dXJuICQwLnBhZFN0YXJ0KHBhZE51bSwgJzAnKTtcblx0fSk7XG5cblx0c3RyID0gc3RyXG5cdFx0LnJlcGxhY2UoL17nrKwrLywgJycpXG5cdFx0Ly8ucmVwbGFjZSgvKFxcZClb56ug6KmxXS9nLCAnJDFfJylcblx0XHQvLy5yZXBsYWNlKC/nrKwoXFxkKS9nLCAnXyQxJylcblx0XHQvLy5yZXBsYWNlKC9cXC4vZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9b4oCV4oCU77yN4pSA4pSAXFwt4oCV4oCU4pSA77ydPV0vZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9bXFxz44CAXS9nLCAnXycpXG5cdFx0LnJlcGxhY2UoL1tcXChcXCnjgJTvvLvjgJDjgIrvvIjjgIzjgI7jgI/jgI3jgIvvvInjgJHjgJXvvL1dL2csICdfJylcblx0XHQucmVwbGFjZSgvW8K34oCn44O7wrfCt8K34oCiXS9nLCAnXycpXG5cdFx0LnJlcGxhY2UoL1vvvJrvvJrvuLDvuZXvvJpdL3VnLCAnXycpXG5cdFx0LnJlcGxhY2UoL1vjg7s6LF0vZywgJ18nKVxuXHRcdC5yZXBsYWNlKC9fKyQvZywgJycpXG5cdFx0LnJlcGxhY2UoL18rL2csICdfJylcblxuXHQ7XG5cblx0c3RyID0gemgyanAoY24ydHcoc3RyKSBhcyBzdHJpbmcsIHtcblx0XHRzYWZlOiBmYWxzZSxcblx0fSk7XG5cblx0Ly9jb25zb2xlLmxvZyhzdHIpO1xuXG5cdHJldHVybiBzdHI7XG59XG5cbmltcG9ydCAqIGFzIHNlbGYgZnJvbSAnLi9pbmRleCc7XG5leHBvcnQgZGVmYXVsdCBzZWxmO1xuIl19