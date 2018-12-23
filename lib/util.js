"use strict";
/**
 * Created by user on 2018/11/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sort_1 = require("@node-novel/sort");
const array_hyper_unique_1 = require("array-hyper-unique");
const FastGlob = require("fast-glob");
const fs = require("fs-iconv");
const node_novel_info_1 = require("node-novel-info");
const BluebirdPromise = require("bluebird");
const StrUtil = require("str-util");
async function loadReadmeMeta(file) {
    return fs.readFile(file)
        .then(function (data) {
        return node_novel_info_1.mdconf_parse(data, {
            // 當沒有包含必要的內容時不產生錯誤
            throw: false,
            // 允許不標準的 info 內容
            lowCheckLevel: true,
        });
    })
        .catch(function () {
        return null;
    });
}
exports.loadReadmeMeta = loadReadmeMeta;
function loadReadmeMetaSync(file) {
    try {
        let data = fs.readFileSync(file);
        // @ts-ignore
        return node_novel_info_1.mdconf_parse(data, {
            // 當沒有包含必要的內容時不產生錯誤
            throw: false,
            // 允許不標準的 info 內容
            lowCheckLevel: true,
        });
    }
    catch (e) {
    }
    return null;
}
exports.loadReadmeMetaSync = loadReadmeMetaSync;
function getNovelTitles(meta) {
    if (meta && meta.novel) {
        let arr = [
            'title',
            'title_source',
            'title_jp',
            'title_ja',
            'title_zh',
            'title_tw',
            'title_cn',
        ].concat(Object.keys(meta.novel))
            .reduce(function (a, key) {
            if (key.indexOf('title') === 0) {
                a.push(meta.novel[key]);
            }
            return a;
        }, []);
        if (meta.novel.series) {
            arr.push(meta.novel.series.name);
            arr.push(meta.novel.series.name_short);
        }
        arr = array_hyper_unique_1.array_unique(arr.filter(v => v && ![
            'undefined',
            '長編 【連載】',
            '連載中',
        ].includes(v)));
        return arr;
    }
    return [];
}
exports.getNovelTitles = getNovelTitles;
function globFirst(...argv) {
    return new BluebirdPromise(function (resolve, reject) {
        let fgs = FastGlob.stream(...argv);
        fgs.on('data', (entry) => {
            resolve(entry);
            // @ts-ignore
            fgs.destroy();
        });
        fgs.once('error', reject);
        fgs.once('end', () => resolve(undefined));
    });
}
exports.globFirst = globFirst;
function md_href(href) {
    return href.split('/').map(encodeURIComponent).join('/');
}
exports.md_href = md_href;
function md_anchor_gitee(title) {
    let anchor = title
        .replace(/[a-z]+/ig, function (s) {
        return s.toLowerCase();
    })
        .replace(/[\.．\/／　＠@（）\(\)～~]/g, '')
        .replace(/[ ]/g, '-');
    return md_href(anchor);
}
exports.md_anchor_gitee = md_anchor_gitee;
function md_link_escape(text) {
    return text.replace(/[\[\]]/g, function (s) {
        return '\\' + s;
    });
}
exports.md_link_escape = md_link_escape;
exports.tocSortCallback = sort_1.createSortCallback({
    dotNum: true,
    transpileBase(input, isSub) {
        let s = StrUtil.toHalfWidth(input);
        return s;
    },
    toLowerCase: sort_1.EnumToLowerCase.toLocaleLowerCase,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJDQUFtRztBQUNuRywyREFBa0Q7QUFDbEQsc0NBQXNDO0FBQ3RDLCtCQUErQjtBQUMvQixxREFBNEQ7QUFDNUQsNENBQTZDO0FBQzdDLG9DQUFxQztBQUU5QixLQUFLLFVBQVUsY0FBYyxDQUFzQyxJQUFZO0lBRXJGLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDdEIsSUFBSSxDQUFDLFVBQVUsSUFBSTtRQUVuQixPQUFPLDhCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pCLG1CQUFtQjtZQUNuQixLQUFLLEVBQUUsS0FBSztZQUNaLGlCQUFpQjtZQUNqQixhQUFhLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUM7UUFFTixPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQWpCRCx3Q0FpQkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBc0MsSUFBWTtJQUVuRixJQUNBO1FBQ0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxhQUFhO1FBQ2IsT0FBTyw4QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QixtQkFBbUI7WUFDbkIsS0FBSyxFQUFFLEtBQUs7WUFDWixpQkFBaUI7WUFDakIsYUFBYSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFBO0tBQ0Y7SUFDRCxPQUFPLENBQUMsRUFDUjtLQUVDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBcEJELGdEQW9CQztBQUVELFNBQWdCLGNBQWMsQ0FBc0MsSUFBTztJQUUxRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUN0QjtRQUNDLElBQUksR0FBRyxHQUFHO1lBQ1IsT0FBTztZQUNQLGNB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eUJBQWtCLENBQUM7SUFDakQsTUFBTSxFQUFFLElBQUk7SUFDWixhQUFhLENBQUMsS0FBYSxFQUFFLEtBQVc7UUFFdkMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxPQUFPLENBQUMsQ0FBQTtJQUNULENBQUM7SUFDRCxXQUFXLEVBQUUsc0JBQWUsQ0FBQyxpQkFBaUI7Q0FDOUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8xMS8xNC8wMTQuXG4gKi9cblxuaW1wb3J0IHsgX3RyaW0sIGNyZWF0ZVNvcnRDYWxsYmFjaywgZGVmYXVsdFNvcnRDYWxsYmFjaywgRW51bVRvTG93ZXJDYXNlIH0gZnJvbSAnQG5vZGUtbm92ZWwvc29ydCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0ICogYXMgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWljb252JztcbmltcG9ydCB7IElNZGNvbmZNZXRhLCBtZGNvbmZfcGFyc2UgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IEJsdWViaXJkUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5pbXBvcnQgU3RyVXRpbCA9IHJlcXVpcmUoJ3N0ci11dGlsJyk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkUmVhZG1lTWV0YTxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4oZmlsZTogc3RyaW5nKTogUHJvbWlzZTxUPlxue1xuXHRyZXR1cm4gZnMucmVhZEZpbGUoZmlsZSlcblx0XHQudGhlbihmdW5jdGlvbiAoZGF0YSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gbWRjb25mX3BhcnNlKGRhdGEsIHtcblx0XHRcdFx0Ly8g55W25rKS5pyJ5YyF5ZCr5b+F6KaB55qE5YWn5a655pmC5LiN55Si55Sf6Yyv6KqkXG5cdFx0XHRcdHRocm93OiBmYWxzZSxcblx0XHRcdFx0Ly8g5YWB6Kix5LiN5qiZ5rqW55qEIGluZm8g5YWn5a65XG5cdFx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0XHR9KTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9hZFJlYWRtZU1ldGFTeW5jPFQgZXh0ZW5kcyBJTWRjb25mTWV0YSA9IElNZGNvbmZNZXRhPihmaWxlOiBzdHJpbmcpOiBUXG57XG5cdHRyeVxuXHR7XG5cdFx0bGV0IGRhdGEgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZSk7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0cmV0dXJuIG1kY29uZl9wYXJzZShkYXRhLCB7XG5cdFx0XHQvLyDnlbbmspLmnInljIXlkKvlv4XopoHnmoTlhaflrrnmmYLkuI3nlKLnlJ/pjK/oqqRcblx0XHRcdHRocm93OiBmYWxzZSxcblx0XHRcdC8vIOWFgeioseS4jeaomea6lueahCBpbmZvIOWFp+WuuVxuXHRcdFx0bG93Q2hlY2tMZXZlbDogdHJ1ZSxcblx0XHR9KVxuXHR9XG5cdGNhdGNoIChlKVxuXHR7XG5cblx0fVxuXG5cdHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm92ZWxUaXRsZXM8VCBleHRlbmRzIElNZGNvbmZNZXRhID0gSU1kY29uZk1ldGE+KG1ldGE6IFQpOiBzdHJpbmdbXVxue1xuXHRpZiAobWV0YSAmJiBtZXRhLm5vdmVsKVxuXHR7XG5cdFx0bGV0IGFyciA9IFtcblx0XHRcdFx0J3RpdGxlJyxcblx0XHRcdFx0J3RpdGxlX3NvdXJjZScsXG5cdFx0XHRcdCd0aXRsZV9qcCcsXG5cdFx0XHRcdCd0aXRsZV9qYScsXG5cdFx0XHRcdCd0aXRsZV96aCcsXG5cdFx0XHRcdCd0aXRsZV90dycsXG5cdFx0XHRcdCd0aXRsZV9jbicsXG5cdFx0XHRdLmNvbmNhdChPYmplY3Qua2V5cyhtZXRhLm5vdmVsKSlcblx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGEsIGtleTogc3RyaW5nKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoa2V5LmluZGV4T2YoJ3RpdGxlJykgPT09IDApXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhLnB1c2gobWV0YS5ub3ZlbFtrZXldKVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGFcblx0XHRcdH0sIFtdKVxuXHRcdDtcblxuXHRcdGlmIChtZXRhLm5vdmVsLnNlcmllcylcblx0XHR7XG5cdFx0XHRhcnIucHVzaChtZXRhLm5vdmVsLnNlcmllcy5uYW1lKTtcblx0XHRcdGFyci5wdXNoKG1ldGEubm92ZWwuc2VyaWVzLm5hbWVfc2hvcnQpO1xuXHRcdH1cblxuXHRcdGFyciA9IGFycmF5X3VuaXF1ZShhcnIuZmlsdGVyKHYgPT4gdiAmJiAhW1xuXHRcdFx0J3VuZGVmaW5lZCcsXG5cdFx0XHQn6ZW357eoIOOAkOmAo+i8ieOAkScsXG5cdFx0XHQn6YCj6LyJ5LitJyxcblx0XHRdLmluY2x1ZGVzKHYpKSk7XG5cblx0XHRyZXR1cm4gYXJyO1xuXHR9XG5cblx0cmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2xvYkZpcnN0KC4uLmFyZ3Y6IFBhcmFtZXRlcnM8dHlwZW9mIEZhc3RHbG9iW1wic3RyZWFtXCJdPik6IEJsdWViaXJkUHJvbWlzZTxzdHJpbmc+XG57XG5cdHJldHVybiBuZXcgQmx1ZWJpcmRQcm9taXNlPHN0cmluZz4oZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdClcblx0e1xuXHRcdGxldCBmZ3MgPSBGYXN0R2xvYi5zdHJlYW0oLi4uYXJndik7XG5cblx0XHRmZ3Mub24oJ2RhdGEnLCAoZW50cnkpID0+XG5cdFx0e1xuXHRcdFx0cmVzb2x2ZShlbnRyeSk7XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGZncy5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdFx0ZmdzLm9uY2UoJ2Vycm9yJywgcmVqZWN0KTtcblx0XHRmZ3Mub25jZSgnZW5kJywgKCkgPT4gcmVzb2x2ZSh1bmRlZmluZWQpKTtcblx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2hyZWYoaHJlZjogc3RyaW5nKVxue1xuXHRyZXR1cm4gaHJlZi5zcGxpdCgnLycpLm1hcChlbmNvZGVVUklDb21wb25lbnQpLmpvaW4oJy8nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2FuY2hvcl9naXRlZSh0aXRsZTogc3RyaW5nKVxue1xuXHRsZXQgYW5jaG9yID0gdGl0bGVcblx0XHQucmVwbGFjZSgvW2Etel0rL2lnLCBmdW5jdGlvbiAocylcblx0XHR7XG5cdFx0XHRyZXR1cm4gcy50b0xvd2VyQ2FzZSgpO1xuXHRcdH0pXG5cdFx0LnJlcGxhY2UoL1tcXC7vvI5cXC/vvI/jgIDvvKBA77yI77yJXFwoXFwp772efl0vZywgJycpXG5cdFx0LnJlcGxhY2UoL1sgXS9nLCAnLScpXG5cdDtcblxuXHRyZXR1cm4gbWRfaHJlZihhbmNob3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWRfbGlua19lc2NhcGUodGV4dDogc3RyaW5nKVxue1xuXHRyZXR1cm4gdGV4dC5yZXBsYWNlKC9bXFxbXFxdXS9nLCBmdW5jdGlvbiAocylcblx0e1xuXHRcdHJldHVybiAnXFxcXCcgKyBzO1xuXHR9KVxufVxuXG5leHBvcnQgY29uc3QgdG9jU29ydENhbGxiYWNrID0gY3JlYXRlU29ydENhbGxiYWNrKHtcblx0ZG90TnVtOiB0cnVlLFxuXHR0cmFuc3BpbGVCYXNlKGlucHV0OiBzdHJpbmcsIGlzU3ViPzogYW55KVxuXHR7XG5cdFx0bGV0IHMgPSBTdHJVdGlsLnRvSGFsZldpZHRoKGlucHV0KTtcblx0XHRyZXR1cm4gc1xuXHR9LFxuXHR0b0xvd2VyQ2FzZTogRW51bVRvTG93ZXJDYXNlLnRvTG9jYWxlTG93ZXJDYXNlLFxufSk7XG4iXX0=