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
const StrUtil = require("str-util");
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
exports.tocSortCallback = sort_1.createSortCallback({
    dotNum: true,
    transpile(input, isSub) {
        return StrUtil.toHalfWidth(sort_1._trim(input)).toLocaleLowerCase();
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJDQUE2RDtBQUM3RCwyREFBa0Q7QUFDbEQsc0NBQXNDO0FBQ3RDLCtCQUErQjtBQUMvQixxREFBNEQ7QUFDNUQsb0NBQXFDO0FBQ3JDLDRDQUE2QztBQUV0QyxLQUFLLFVBQVUsY0FBYyxDQUFzQyxJQUFZO0lBRXJGLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDdEIsSUFBSSxDQUFDLFVBQVUsSUFBSTtRQUVuQixPQUFPLDhCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pCLG1CQUFtQjtZQUNuQixLQUFLLEVBQUUsS0FBSztZQUNaLGlCQUFpQjtZQUNqQixhQUFhLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUM7UUFFTixPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQyxDQUNGO0FBQ0YsQ0FBQztBQWpCRCx3Q0FpQkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBc0MsSUFBWTtJQUVuRixJQUNBO1FBQ0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxhQUFhO1FBQ2IsT0FBTyw4QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QixtQkFBbUI7WUFDbkIsS0FBSyxFQUFFLEtBQUs7WUFDWixpQkFBaUI7WUFDakIsYUFBYSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFBO0tBQ0Y7SUFDRCxPQUFPLENBQUMsRUFDUjtLQUVDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBcEJELGdEQW9CQztBQUVELFNBQWdCLGNBQWMsQ0FBc0MsSUFBTztJQUUxRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUN0QjtRQUNDLElBQUksR0FBRyxHQUFHO1lBQ1IsT0FBTztZQUNQLGNBQWM7WUFDZCxVQUFVO1lBQ1YsVUFBVTtZQUNWLFVBQVU7U0FDVixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBVztZQUUvQixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUM5QjtnQkFDQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTthQUN2QjtZQUVELE9BQU8sQ0FBQyxDQUFBO1FBQ1QsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNOO1FBRUQsR0FBRyxHQUFHLGlDQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkMsT0FBTyxHQUFHLENBQUM7S0FDWDtJQUVELE9BQU8sRUFBRSxDQUFDO0FBQ1gsQ0FBQztBQTVCRCx3Q0E0QkM7QUFFRCxTQUFnQixTQUFTLENBQUMsR0FBRyxJQUEyQztJQUV2RSxPQUFPLElBQUksZUFBZSxDQUFTLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFFM0QsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRW5DLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWYsYUFBYTtZQUNiLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUIsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUE7QUFDSCxDQUFDO0FBZkQsOEJBZUM7QUFFRCxTQUFnQixPQUFPLENBQUMsSUFBWTtJQUVuQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFIRCwwQkFHQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxLQUFhO0lBRTVDLElBQUksTUFBTSxHQUFHLEtBQUs7U0FDaEIsV0FBVyxFQUFFO1NBQ2IsT0FBTyxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQztTQUNuQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUNyQjtJQUVELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLENBQUM7QUFURCwwQ0FTQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZO0lBRTFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1FBRXpDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUMsQ0FBQTtBQUNILENBQUM7QUFORCx3Q0FNQztBQUVZLFFBQUEsZUFBZSxHQUFHLHlCQUFrQixDQUFDO0lBQ2pELE1BQU0sRUFBRSxJQUFJO0lBQ1osU0FBUyxDQUFDLEtBQVUsRUFBRSxLQUFXO1FBRWhDLE9BQU8sT0FBTyxDQUFDLFdBQVcsQ0FBQyxZQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFBO0lBQzdELENBQUM7Q0FDRCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDE4LzExLzE0LzAxNC5cbiAqL1xuXG5pbXBvcnQgeyBjcmVhdGVTb3J0Q2FsbGJhY2ssIF90cmltIH0gZnJvbSAnQG5vZGUtbm92ZWwvc29ydCc7XG5pbXBvcnQgeyBhcnJheV91bmlxdWUgfSBmcm9tICdhcnJheS1oeXBlci11bmlxdWUnO1xuaW1wb3J0ICogYXMgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzLWljb252JztcbmltcG9ydCB7IElNZGNvbmZNZXRhLCBtZGNvbmZfcGFyc2UgfSBmcm9tICdub2RlLW5vdmVsLWluZm8nO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuaW1wb3J0IEJsdWViaXJkUHJvbWlzZSA9IHJlcXVpcmUoJ2JsdWViaXJkJyk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkUmVhZG1lTWV0YTxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4oZmlsZTogc3RyaW5nKTogUHJvbWlzZTxUPlxue1xuXHRyZXR1cm4gZnMucmVhZEZpbGUoZmlsZSlcblx0XHQudGhlbihmdW5jdGlvbiAoZGF0YSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gbWRjb25mX3BhcnNlKGRhdGEsIHtcblx0XHRcdFx0Ly8g55W25rKS5pyJ5YyF5ZCr5b+F6KaB55qE5YWn5a655pmC5LiN55Si55Sf6Yyv6KqkXG5cdFx0XHRcdHRocm93OiBmYWxzZSxcblx0XHRcdFx0Ly8g5YWB6Kix5LiN5qiZ5rqW55qEIGluZm8g5YWn5a65XG5cdFx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0XHR9KTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0pXG5cdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvYWRSZWFkbWVNZXRhU3luYzxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4oZmlsZTogc3RyaW5nKTogVFxue1xuXHR0cnlcblx0e1xuXHRcdGxldCBkYXRhID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpO1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBtZGNvbmZfcGFyc2UoZGF0YSwge1xuXHRcdFx0Ly8g55W25rKS5pyJ5YyF5ZCr5b+F6KaB55qE5YWn5a655pmC5LiN55Si55Sf6Yyv6KqkXG5cdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHQvLyDlhYHoqLHkuI3mqJnmupbnmoQgaW5mbyDlhaflrrlcblx0XHRcdGxvd0NoZWNrTGV2ZWw6IHRydWUsXG5cdFx0fSlcblx0fVxuXHRjYXRjaCAoZSlcblx0e1xuXG5cdH1cblxuXHRyZXR1cm4gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdmVsVGl0bGVzPFQgZXh0ZW5kcyBJTWRjb25mTWV0YSA9IElNZGNvbmZNZXRhPihtZXRhOiBUKTogc3RyaW5nW11cbntcblx0aWYgKG1ldGEgJiYgbWV0YS5ub3ZlbClcblx0e1xuXHRcdGxldCBhcnIgPSBbXG5cdFx0XHRcdCd0aXRsZScsXG5cdFx0XHRcdCd0aXRsZV9zb3VyY2UnLFxuXHRcdFx0XHQndGl0bGVfemgnLFxuXHRcdFx0XHQndGl0bGVfdHcnLFxuXHRcdFx0XHQndGl0bGVfY24nLFxuXHRcdFx0XS5jb25jYXQoT2JqZWN0LmtleXMobWV0YS5ub3ZlbCkpXG5cdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhLCBrZXk6IHN0cmluZylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGtleS5pbmRleE9mKCd0aXRsZScpID09PSAwKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YS5wdXNoKG1ldGEubm92ZWxba2V5XSlcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhXG5cdFx0XHR9LCBbXSlcblx0XHQ7XG5cblx0XHRhcnIgPSBhcnJheV91bmlxdWUoYXJyLmZpbHRlcih2ID0+IHYpKTtcblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRyZXR1cm4gW107XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnbG9iRmlyc3QoLi4uYXJndjogUGFyYW1ldGVyczx0eXBlb2YgRmFzdEdsb2JbXCJzdHJlYW1cIl0+KTogQmx1ZWJpcmRQcm9taXNlPHN0cmluZz5cbntcblx0cmV0dXJuIG5ldyBCbHVlYmlyZFByb21pc2U8c3RyaW5nPihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KVxuXHR7XG5cdFx0bGV0IGZncyA9IEZhc3RHbG9iLnN0cmVhbSguLi5hcmd2KTtcblxuXHRcdGZncy5vbignZGF0YScsIChlbnRyeSkgPT4ge1xuXHRcdFx0cmVzb2x2ZShlbnRyeSk7XG5cblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGZncy5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdFx0ZmdzLm9uY2UoJ2Vycm9yJywgcmVqZWN0KTtcblx0XHRmZ3Mub25jZSgnZW5kJywgKCkgPT4gcmVzb2x2ZSh1bmRlZmluZWQpKTtcblx0fSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2hyZWYoaHJlZjogc3RyaW5nKVxue1xuXHRyZXR1cm4gaHJlZi5zcGxpdCgnLycpLm1hcChlbmNvZGVVUklDb21wb25lbnQpLmpvaW4oJy8nKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2FuY2hvcl9naXRlZSh0aXRsZTogc3RyaW5nKVxue1xuXHRsZXQgYW5jaG9yID0gdGl0bGVcblx0XHQudG9Mb3dlckNhc2UoKVxuXHRcdC5yZXBsYWNlKC9bXFwu77yOXFwv77yP44CA77ygQO+8iO+8iVxcKFxcKe+9nn5dL2csICcnKVxuXHRcdC5yZXBsYWNlKC9bIF0vZywgJy0nKVxuXHQ7XG5cblx0cmV0dXJuIG1kX2hyZWYoYW5jaG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2xpbmtfZXNjYXBlKHRleHQ6IHN0cmluZylcbntcblx0cmV0dXJuIHRleHQucmVwbGFjZSgvW1xcW1xcXV0vZywgZnVuY3Rpb24gKHMpXG5cdHtcblx0XHRyZXR1cm4gJ1xcXFwnICsgcztcblx0fSlcbn1cblxuZXhwb3J0IGNvbnN0IHRvY1NvcnRDYWxsYmFjayA9IGNyZWF0ZVNvcnRDYWxsYmFjayh7XG5cdGRvdE51bTogdHJ1ZSxcblx0dHJhbnNwaWxlKGlucHV0OiBhbnksIGlzU3ViPzogYW55KVxuXHR7XG5cdFx0cmV0dXJuIFN0clV0aWwudG9IYWxmV2lkdGgoX3RyaW0oaW5wdXQpKS50b0xvY2FsZUxvd2VyQ2FzZSgpXG5cdH0sXG59KTtcbiJdfQ==