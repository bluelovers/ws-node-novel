"use strict";
/**
 * Created by user on 2018/11/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const array_hyper_unique_1 = require("array-hyper-unique");
const FastGlob = require("fast-glob");
const fs = require("fs-iconv");
const node_novel_info_1 = require("node-novel-info");
const BluebirdPromise = require("bluebird");
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
        .toLowerCase()
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJEQUFrRDtBQUNsRCxzQ0FBc0M7QUFDdEMsK0JBQStCO0FBQy9CLHFEQUE0RDtBQUM1RCw0Q0FBNkM7QUFFdEMsS0FBSyxVQUFVLGNBQWMsQ0FBc0MsSUFBWTtJQUVyRixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1NBQ3RCLElBQUksQ0FBQyxVQUFVLElBQUk7UUFFbkIsT0FBTyw4QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QixtQkFBbUI7WUFDbkIsS0FBSyxFQUFFLEtBQUs7WUFDWixpQkFBaUI7WUFDakIsYUFBYSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDO1FBRU4sT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDLENBQUMsQ0FDRjtBQUNGLENBQUM7QUFqQkQsd0NBaUJDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQXNDLElBQVk7SUFFbkYsSUFDQTtRQUNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFakMsYUFBYTtRQUNiLE9BQU8sOEJBQVksQ0FBQyxJQUFJLEVBQUU7WUFDekIsbUJBQW1CO1lBQ25CLEtBQUssRUFBRSxLQUFLO1lBQ1osaUJBQWlCO1lBQ2pCLGFBQWEsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQTtLQUNGO0lBQ0QsT0FBTyxDQUFDLEVBQ1I7S0FFQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQXBCRCxnREFvQkM7QUFFRCxTQUFnQixjQUFjLENBQXNDLElBQU87SUFFMUUsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFDdEI7UUFDQyxJQUFJLEdBQUcsR0FBRztZQUNSLE9BQU87WUFDUCxjQUFjO1lBQ2QsVUFBVTtZQUNWLFVBQVU7WUFDVixVQUFVO1NBQ1YsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQVc7WUFFL0IsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDOUI7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7YUFDdkI7WUFFRCxPQUFPLENBQUMsQ0FBQTtRQUNULENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDTjtRQUVELEdBQUcsR0FBRyxpQ0FBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sR0FBRyxDQUFDO0tBQ1g7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNYLENBQUM7QUE1QkQsd0NBNEJDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEdBQUcsSUFBMkM7SUFFdkUsT0FBTyxJQUFJLGVBQWUsQ0FBUyxVQUFVLE9BQU8sRUFBRSxNQUFNO1FBRTNELElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUVuQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVmLGFBQWE7WUFDYixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQWZELDhCQWVDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLElBQVk7SUFFbkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxRCxDQUFDO0FBSEQsMEJBR0M7QUFFRCxTQUFnQixlQUFlLENBQUMsS0FBYTtJQUU1QyxJQUFJLE1BQU0sR0FBRyxLQUFLO1NBQ2hCLFdBQVcsRUFBRTtTQUNiLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxFQUFFLENBQUM7U0FDbkMsT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FDckI7SUFFRCxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN4QixDQUFDO0FBVEQsMENBU0M7QUFFRCxTQUFnQixjQUFjLENBQUMsSUFBWTtJQUUxQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQztRQUV6QyxPQUFPLElBQUksR0FBRyxDQUFDLENBQUM7SUFDakIsQ0FBQyxDQUFDLENBQUE7QUFDSCxDQUFDO0FBTkQsd0NBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzExLzE0LzAxNC5cbiAqL1xuXG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0ICogYXMgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWljb252JztcbmltcG9ydCB7IElNZGNvbmZNZXRhLCBtZGNvbmZfcGFyc2UgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IEJsdWViaXJkUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkUmVhZG1lTWV0YTxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4oZmlsZTogc3RyaW5nKTogUHJvbWlzZTxUPlxue1xuXHRyZXR1cm4gZnMucmVhZEZpbGUoZmlsZSlcblx0XHQudGhlbihmdW5jdGlvbiAoZGF0YSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gbWRjb25mX3BhcnNlKGRhdGEsIHtcblx0XHRcdFx0Ly8g55W25rKS5pyJ5YyF5ZCr5b+F6KaB55qE5YWn5a655pmC5LiN55Si55Sf6Yyv6KqkXG5cdFx0XHRcdHRocm93OiBmYWxzZSxcblx0XHRcdFx0Ly8g5YWB6Kix5LiN5qiZ5rqW55qEIGluZm8g5YWn5a65XG5cdFx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0XHR9KTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0pXG5cdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRSZWFkbWVNZXRhU3luYzxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4oZmlsZTogc3RyaW5nKTogVFxue1xuXHR0cnlcblx0e1xuXHRcdGxldCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBtZGNvbmZfcGFyc2UoZGF0YSwge1xuXHRcdFx0Ly8g55W25rKS5pyJ5YyF5ZCr5b+F6KaB55qE5YWn5a655pmC5LiN55Si55Sf6Yyv6KqkXG5cdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHQvLyDlhYHoqLHkuI3mqJnmupbnmoQgaW5mbyDlhaflrrlcblx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0fSlcblx0fVxuXHRjYXRjaCAoZSlcblx0e1xuXG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdmVsVGl0bGVzPFQgZXh0ZW5kcyBJTWRjb25mTWV0YSA9IElNZGNvbmZNZXRhPihtZXRhOiBUKTogc3RyaW5nW11cbntcblx0aWYgKG1ldGEgJiYgbWV0YS5ub3ZlbClcblx0e1xuXHRcdGxldCBhcnIgPSBbXG5cdFx0XHRcdCd0aXRsZScsXG5cdFx0XHRcdCd0aXRsZV9zb3VyY2UnLFxuXHRcdFx0XHQndGl0bGVfemgnLFxuXHRcdFx0XHQndGl0bGVfdHcnLFxuXHRcdFx0XHQndGl0bGVfY24nLFxuXHRcdFx0XS5jb25jYXQoT2JqZWN0LmtleXMobWV0YS5ub3ZlbCkpXG5cdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBrZXk6IHN0cmluZylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGtleS5pbmRleE9mKCd0aXRsZScpID09PSAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKG1ldGEubm92ZWxba2V5XSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9LCBbXSlcblx0XHQ7XG5cblx0XHRhcnIgPSBhcnJheV91bmlxdWUoYXJyLmZpbHRlcih2ID0+IHYpKTtcblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRyZXR1cm4gW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnbG9iRmlyc3QoLi4uYXJndjogUGFyYW1ldGVyczx0eXBlb2YgRmFzdEdsb2JbXCJzdHJlYW1cIl0+KTogQmx1ZWJpcmRQcm9taXNlPHN0cmluZz5cbntcblx0cmV0dXJuIG5ldyBCbHVlYmlyZFByb21pc2U8c3RyaW5nPihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KVxuXHR7XG5cdFx0bGV0IGZncyA9IEZhc3RHbG9iLnN0cmVhbSguLi5hcmd2KTtcblxuXHRcdGZncy5vbignZGF0YScsIChlbnRyeSkgPT4ge1xuXHRcdFx0cmVzb2x2ZShlbnRyeSk7XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGZncy5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdFx0ZmdzLm9uY2UoJ2Vycm9yJywgcmVqZWN0KTtcblx0XHRmZ3Mub25jZSgnZW5kJywgKCkgPT4gcmVzb2x2ZSh1bmRlZmluZWQpKTtcblx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2hyZWYoaHJlZjogc3RyaW5nKVxue1xuXHRyZXR1cm4gaHJlZi5zcGxpdCgnLycpLm1hcChlbmNvZGVVUklDb21wb25lbnQpLmpvaW4oJy8nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2FuY2hvcl9naXRlZSh0aXRsZTogc3RyaW5nKVxue1xuXHRsZXQgYW5jaG9yID0gdGl0bGVcblx0XHQudG9Mb3dlckNhc2UoKVxuXHRcdC5yZXBsYWNlKC9bXFwu77yOXFwv77yP44CA77ygQO+8iO+8iVxcKFxcKe+9nn5dL2csICcnKVxuXHRcdC5yZXBsYWNlKC9bIF0vZywgJy0nKVxuXHQ7XG5cblx0cmV0dXJuIG1kX2hyZWYoYW5jaG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2xpbmtfZXNjYXBlKHRleHQ6IHN0cmluZylcbntcblx0cmV0dXJuIHRleHQucmVwbGFjZSgvW1xcW1xcXV0vZywgZnVuY3Rpb24gKHMpXG5cdHtcblx0XHRyZXR1cm4gJ1xcXFwnICsgcztcblx0fSlcbn1cbiJdfQ==