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
        arr = array_hyper_unique_1.array_unique(arr.filter(v => v));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJDQUFtRztBQUNuRywyREFBa0Q7QUFDbEQsc0NBQXNDO0FBQ3RDLCtCQUErQjtBQUMvQixxREFBNEQ7QUFDNUQsNENBQTZDO0FBQzdDLG9DQUFxQztBQUU5QixLQUFLLFVBQVUsY0FBYyxDQUFzQyxJQUFZO0lBRXJGLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDdEIsSUFBSSxDQUFDLFVBQVUsSUFBSTtRQUVuQixPQUFPLDhCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pCLG1CQUFtQjtZQUNuQixLQUFLLEVBQUUsS0FBSztZQUNaLGlCQUFpQjtZQUNqQixhQUFhLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUM7UUFFTixPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQWpCRCx3Q0FpQkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBc0MsSUFBWTtJQUVuRixJQUNBO1FBQ0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxhQUFhO1FBQ2IsT0FBTyw4QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QixtQkFBbUI7WUFDbkIsS0FBSyxFQUFFLEtBQUs7WUFDWixpQkFBaUI7WUFDakIsYUFBYSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFBO0tBQ0Y7SUFDRCxPQUFPLENBQUMsRUFDUjtLQUVDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBcEJELGdEQW9CQztBQUVELFNBQWdCLGNBQWMsQ0FBc0MsSUFBTztJQUUxRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUN0QjtRQUNDLElBQUksR0FBRyxHQUFHO1lBQ1IsT0FBTztZQUNQLGNB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QUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLENBQUE7SUFDVCxDQUFDO0lBQ0QsV0FBVyxFQUFFLHNCQUFlLENBQUMsaUJBQWlCO0NBQzlDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMTEvMTQvMDE0LlxuICovXG5cbmltcG9ydCB7IF90cmltLCBjcmVhdGVTb3J0Q2FsbGJhY2ssIGRlZmF1bHRTb3J0Q2FsbGJhY2ssIEVudW1Ub0xvd2VyQ2FzZSB9IGZyb20gJ0Bub2RlLW5vdmVsL3NvcnQnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCAqIGFzIEZhc3RHbG9iIGZyb20gJ2Zhc3QtZ2xvYic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1pY29udic7XG5pbXBvcnQgeyBJTWRjb25mTWV0YSwgbWRjb25mX3BhcnNlIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCBCbHVlYmlyZFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFJlYWRtZU1ldGE8VCBleHRlbmRzIElNZGNvbmZNZXRhID0gSU1kY29uZk1ldGE+KGZpbGU6IHN0cmluZyk6IFByb21pc2U8VD5cbntcblx0cmV0dXJuIGZzLnJlYWRGaWxlKGZpbGUpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGRhdGEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG1kY29uZl9wYXJzZShkYXRhLCB7XG5cdFx0XHRcdC8vIOeVtuaykuacieWMheWQq+W/heimgeeahOWFp+WuueaZguS4jeeUoueUn+mMr+iqpFxuXHRcdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHRcdC8vIOWFgeioseS4jeaomea6lueahCBpbmZvIOWFp+WuuVxuXHRcdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdFx0fSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9KVxuXHRcdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRSZWFkbWVNZXRhU3luYzxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4oZmlsZTogc3RyaW5nKTogVFxue1xuXHR0cnlcblx0e1xuXHRcdGxldCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBtZGNvbmZfcGFyc2UoZGF0YSwge1xuXHRcdFx0Ly8g55W25rKS5pyJ5YyF5ZCr5b+F6KaB55qE5YWn5a655pmC5LiN55Si55Sf6Yyv6KqkXG5cdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHQvLyDlhYHoqLHkuI3mqJnmupbnmoQgaW5mbyDlhaflrrlcblx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0fSlcblx0fVxuXHRjYXRjaCAoZSlcblx0e1xuXG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdmVsVGl0bGVzPFQgZXh0ZW5kcyBJTWRjb25mTWV0YSA9IElNZGNvbmZNZXRhPihtZXRhOiBUKTogc3RyaW5nW11cbntcblx0aWYgKG1ldGEgJiYgbWV0YS5ub3ZlbClcblx0e1xuXHRcdGxldCBhcnIgPSBbXG5cdFx0XHRcdCd0aXRsZScsXG5cdFx0XHRcdCd0aXRsZV9zb3VyY2UnLFxuXHRcdFx0XHQndGl0bGVfanAnLFxuXHRcdFx0XHQndGl0bGVfamEnLFxuXHRcdFx0XHQndGl0bGVfemgnLFxuXHRcdFx0XHQndGl0bGVfdHcnLFxuXHRcdFx0XHQndGl0bGVfY24nLFxuXHRcdFx0XS5jb25jYXQoT2JqZWN0LmtleXMobWV0YS5ub3ZlbCkpXG5cdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBrZXk6IHN0cmluZylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGtleS5pbmRleE9mKCd0aXRsZScpID09PSAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKG1ldGEubm92ZWxba2V5XSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9LCBbXSlcblx0XHQ7XG5cblx0XHRpZiAobWV0YS5ub3ZlbC5zZXJpZXMpXG5cdFx0e1xuXHRcdFx0YXJyLnB1c2gobWV0YS5ub3ZlbC5zZXJpZXMubmFtZSk7XG5cdFx0XHRhcnIucHVzaChtZXRhLm5vdmVsLnNlcmllcy5uYW1lX3Nob3J0KTtcblx0XHR9XG5cblx0XHRhcnIgPSBhcnJheV91bmlxdWUoYXJyLmZpbHRlcih2ID0+IHYpKTtcblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRyZXR1cm4gW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnbG9iRmlyc3QoLi4uYXJndjogUGFyYW1ldGVyczx0eXBlb2YgRmFzdEdsb2JbXCJzdHJlYW1cIl0+KTogQmx1ZWJpcmRQcm9taXNlPHN0cmluZz5cbntcblx0cmV0dXJuIG5ldyBCbHVlYmlyZFByb21pc2U8c3RyaW5nPihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KVxuXHR7XG5cdFx0bGV0IGZncyA9IEZhc3RHbG9iLnN0cmVhbSguLi5hcmd2KTtcblxuXHRcdGZncy5vbignZGF0YScsIChlbnRyeSkgPT5cblx0XHR7XG5cdFx0XHRyZXNvbHZlKGVudHJ5KTtcblxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0ZmdzLmRlc3Ryb3koKTtcblx0XHR9KTtcblx0XHRmZ3Mub25jZSgnZXJyb3InLCByZWplY3QpO1xuXHRcdGZncy5vbmNlKCdlbmQnLCAoKSA9PiByZXNvbHZlKHVuZGVmaW5lZCkpO1xuXHR9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWRfaHJlZihocmVmOiBzdHJpbmcpXG57XG5cdHJldHVybiBocmVmLnNwbGl0KCcvJykubWFwKGVuY29kZVVSSUNvbXBvbmVudCkuam9pbignLycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWRfYW5jaG9yX2dpdGVlKHRpdGxlOiBzdHJpbmcpXG57XG5cdGxldCBhbmNob3IgPSB0aXRsZVxuXHRcdC5yZXBsYWNlKC9bYS16XSsvaWcsIGZ1bmN0aW9uIChzKVxuXHRcdHtcblx0XHRcdHJldHVybiBzLnRvTG93ZXJDYXNlKCk7XG5cdFx0fSlcblx0XHQucmVwbGFjZSgvW1xcLu+8jlxcL++8j+OAgO+8oEDvvIjvvIlcXChcXCnvvZ5+XS9nLCAnJylcblx0XHQucmVwbGFjZSgvWyBdL2csICctJylcblx0O1xuXG5cdHJldHVybiBtZF9ocmVmKGFuY2hvcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZF9saW5rX2VzY2FwZSh0ZXh0OiBzdHJpbmcpXG57XG5cdHJldHVybiB0ZXh0LnJlcGxhY2UoL1tcXFtcXF1dL2csIGZ1bmN0aW9uIChzKVxuXHR7XG5cdFx0cmV0dXJuICdcXFxcJyArIHM7XG5cdH0pXG59XG5cbmV4cG9ydCBjb25zdCB0b2NTb3J0Q2FsbGJhY2sgPSBjcmVhdGVTb3J0Q2FsbGJhY2soe1xuXHRkb3ROdW06IHRydWUsXG5cdHRyYW5zcGlsZUJhc2UoaW5wdXQ6IHN0cmluZywgaXNTdWI/OiBhbnkpXG5cdHtcblx0XHRsZXQgcyA9IFN0clV0aWwudG9IYWxmV2lkdGgoaW5wdXQpO1xuXHRcdHJldHVybiBzXG5cdH0sXG5cdHRvTG93ZXJDYXNlOiBFbnVtVG9Mb3dlckNhc2UudG9Mb2NhbGVMb3dlckNhc2UsXG59KTtcbiJdfQ==