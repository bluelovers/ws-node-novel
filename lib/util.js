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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJDQUFtRztBQUNuRywyREFBa0Q7QUFDbEQsc0NBQXVDO0FBQ3ZDLCtCQUFnQztBQUNoQyxxREFBNEQ7QUFDNUQsNENBQTZDO0FBQzdDLG9DQUFxQztBQUU5QixLQUFLLFVBQVUsY0FBYyxDQUFzQyxJQUFZO0lBRXJGLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDdEIsSUFBSSxDQUFDLFVBQVUsSUFBSTtRQUVuQixPQUFPLDhCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pCLG1CQUFtQjtZQUNuQixLQUFLLEVBQUUsS0FBSztZQUNaLGlCQUFpQjtZQUNqQixhQUFhLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUM7UUFFTixPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQyxDQUNEO0FBQ0gsQ0FBQztBQWpCRCx3Q0FpQkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBc0MsSUFBWTtJQUVuRixJQUNBO1FBQ0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxhQUFhO1FBQ2IsT0FBTyw4QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QixtQkFBbUI7WUFDbkIsS0FBSyxFQUFFLEtBQUs7WUFDWixpQkFBaUI7WUFDakIsYUFBYSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFBO0tBQ0Y7SUFDRCxPQUFPLENBQUMsRUFDUjtLQUVDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBcEJELGdEQW9CQztBQUVELFNBQWdCLGNBQWMsQ0FBc0MsSUFBTztJQUUxRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUN0QjtRQUNDLElBQUksR0FBRyxHQUFHO1lBQ1IsT0FBTztZQUNQLGNB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eUJBQWtCLENBQUM7SUFDakQsTUFBTSxFQUFFLElBQUk7SUFDWixhQUFhLENBQUMsS0FBYSxFQUFFLEtBQVc7UUFFdkMsSUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxPQUFPLENBQUMsQ0FBQTtJQUNULENBQUM7SUFDRCxXQUFXLEVBQUUsc0JBQWUsQ0FBQyxpQkFBaUI7Q0FDOUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8xMS8xNC8wMTQuXG4gKi9cblxuaW1wb3J0IHsgX3RyaW0sIGNyZWF0ZVNvcnRDYWxsYmFjaywgZGVmYXVsdFNvcnRDYWxsYmFjaywgRW51bVRvTG93ZXJDYXNlIH0gZnJvbSAnQG5vZGUtbm92ZWwvc29ydCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0IEZhc3RHbG9iID0gcmVxdWlyZSgnZmFzdC1nbG9iJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1pY29udicpO1xuaW1wb3J0IHsgSU1kY29uZk1ldGEsIG1kY29uZl9wYXJzZSB9IGZyb20gJ25vZGUtbm92ZWwtaW5mbyc7XG5pbXBvcnQgQmx1ZWJpcmRQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBTdHJVdGlsID0gcmVxdWlyZSgnc3RyLXV0aWwnKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRSZWFkbWVNZXRhPFQgZXh0ZW5kcyBJTWRjb25mTWV0YSA9IElNZGNvbmZNZXRhPihmaWxlOiBzdHJpbmcpOiBQcm9taXNlPFQ+XG57XG5cdHJldHVybiBmcy5yZWFkRmlsZShmaWxlKVxuXHRcdC50aGVuKGZ1bmN0aW9uIChkYXRhKVxuXHRcdHtcblx0XHRcdHJldHVybiBtZGNvbmZfcGFyc2UoZGF0YSwge1xuXHRcdFx0XHQvLyDnlbbmspLmnInljIXlkKvlv4XopoHnmoTlhaflrrnmmYLkuI3nlKLnlJ/pjK/oqqRcblx0XHRcdFx0dGhyb3c6IGZhbHNlLFxuXHRcdFx0XHQvLyDlhYHoqLHkuI3mqJnmupbnmoQgaW5mbyDlhaflrrlcblx0XHRcdFx0bG93Q2hlY2tMZXZlbDogdHJ1ZSxcblx0XHRcdH0pO1xuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkUmVhZG1lTWV0YVN5bmM8VCBleHRlbmRzIElNZGNvbmZNZXRhID0gSU1kY29uZk1ldGE+KGZpbGU6IHN0cmluZyk6IFRcbntcblx0dHJ5XG5cdHtcblx0XHRsZXQgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbWRjb25mX3BhcnNlKGRhdGEsIHtcblx0XHRcdC8vIOeVtuaykuacieWMheWQq+W/heimgeeahOWFp+WuueaZguS4jeeUoueUn+mMr+iqpFxuXHRcdFx0dGhyb3c6IGZhbHNlLFxuXHRcdFx0Ly8g5YWB6Kix5LiN5qiZ5rqW55qEIGluZm8g5YWn5a65XG5cdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdH0pXG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3ZlbFRpdGxlczxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4obWV0YTogVCk6IHN0cmluZ1tdXG57XG5cdGlmIChtZXRhICYmIG1ldGEubm92ZWwpXG5cdHtcblx0XHRsZXQgYXJyID0gW1xuXHRcdFx0XHQndGl0bGUnLFxuXHRcdFx0XHQndGl0bGVfc291cmNlJyxcblx0XHRcdFx0J3RpdGxlX2pwJyxcblx0XHRcdFx0J3RpdGxlX2phJyxcblx0XHRcdFx0J3RpdGxlX3poJyxcblx0XHRcdFx0J3RpdGxlX3R3Jyxcblx0XHRcdFx0J3RpdGxlX2NuJyxcblx0XHRcdF0uY29uY2F0KE9iamVjdC5rZXlzKG1ldGEubm92ZWwpKVxuXHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwga2V5OiBzdHJpbmcpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChrZXkuaW5kZXhPZigndGl0bGUnKSA9PT0gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChtZXRhLm5vdmVsW2tleV0pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0fSwgW10pXG5cdFx0O1xuXG5cdFx0aWYgKG1ldGEubm92ZWwuc2VyaWVzKVxuXHRcdHtcblx0XHRcdGFyci5wdXNoKG1ldGEubm92ZWwuc2VyaWVzLm5hbWUpO1xuXHRcdFx0YXJyLnB1c2gobWV0YS5ub3ZlbC5zZXJpZXMubmFtZV9zaG9ydCk7XG5cdFx0fVxuXG5cdFx0YXJyID0gYXJyYXlfdW5pcXVlKGFyci5maWx0ZXIodiA9PiB2ICYmICFbXG5cdFx0XHQndW5kZWZpbmVkJyxcblx0XHRcdCfplbfnt6gg44CQ6YCj6LyJ44CRJyxcblx0XHRcdCfpgKPovInkuK0nLFxuXHRcdF0uaW5jbHVkZXModikpKTtcblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRyZXR1cm4gW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnbG9iRmlyc3QoLi4uYXJndjogUGFyYW1ldGVyczx0eXBlb2YgRmFzdEdsb2JbXCJzdHJlYW1cIl0+KTogQmx1ZWJpcmRQcm9taXNlPHN0cmluZz5cbntcblx0cmV0dXJuIG5ldyBCbHVlYmlyZFByb21pc2U8c3RyaW5nPihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KVxuXHR7XG5cdFx0bGV0IGZncyA9IEZhc3RHbG9iLnN0cmVhbSguLi5hcmd2KTtcblxuXHRcdGZncy5vbignZGF0YScsIChlbnRyeSkgPT5cblx0XHR7XG5cdFx0XHRyZXNvbHZlKGVudHJ5KTtcblxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0ZmdzLmRlc3Ryb3koKTtcblx0XHR9KTtcblx0XHRmZ3Mub25jZSgnZXJyb3InLCByZWplY3QpO1xuXHRcdGZncy5vbmNlKCdlbmQnLCAoKSA9PiByZXNvbHZlKHVuZGVmaW5lZCkpO1xuXHR9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWRfaHJlZihocmVmOiBzdHJpbmcpXG57XG5cdHJldHVybiBocmVmLnNwbGl0KCcvJykubWFwKGVuY29kZVVSSUNvbXBvbmVudCkuam9pbignLycpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWRfYW5jaG9yX2dpdGVlKHRpdGxlOiBzdHJpbmcpXG57XG5cdGxldCBhbmNob3IgPSB0aXRsZVxuXHRcdC5yZXBsYWNlKC9bYS16XSsvaWcsIGZ1bmN0aW9uIChzKVxuXHRcdHtcblx0XHRcdHJldHVybiBzLnRvTG93ZXJDYXNlKCk7XG5cdFx0fSlcblx0XHQucmVwbGFjZSgvW1xcLu+8jlxcL++8j+OAgO+8oEDvvIjvvIlcXChcXCnvvZ5+XS9nLCAnJylcblx0XHQucmVwbGFjZSgvWyBdL2csICctJylcblx0O1xuXG5cdHJldHVybiBtZF9ocmVmKGFuY2hvcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZF9saW5rX2VzY2FwZSh0ZXh0OiBzdHJpbmcpXG57XG5cdHJldHVybiB0ZXh0LnJlcGxhY2UoL1tcXFtcXF1dL2csIGZ1bmN0aW9uIChzKVxuXHR7XG5cdFx0cmV0dXJuICdcXFxcJyArIHM7XG5cdH0pXG59XG5cbmV4cG9ydCBjb25zdCB0b2NTb3J0Q2FsbGJhY2sgPSBjcmVhdGVTb3J0Q2FsbGJhY2soe1xuXHRkb3ROdW06IHRydWUsXG5cdHRyYW5zcGlsZUJhc2UoaW5wdXQ6IHN0cmluZywgaXNTdWI/OiBhbnkpXG5cdHtcblx0XHRsZXQgcyA9IFN0clV0aWwudG9IYWxmV2lkdGgoaW5wdXQpO1xuXHRcdHJldHVybiBzXG5cdH0sXG5cdHRvTG93ZXJDYXNlOiBFbnVtVG9Mb3dlckNhc2UudG9Mb2NhbGVMb3dlckNhc2UsXG59KTtcbiJdfQ==