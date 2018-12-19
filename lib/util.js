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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILDJDQUFtRztBQUNuRywyREFBa0Q7QUFDbEQsc0NBQXNDO0FBQ3RDLCtCQUErQjtBQUMvQixxREFBNEQ7QUFDNUQsNENBQTZDO0FBQzdDLG9DQUFxQztBQUU5QixLQUFLLFVBQVUsY0FBYyxDQUFzQyxJQUFZO0lBRXJGLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7U0FDdEIsSUFBSSxDQUFDLFVBQVUsSUFBSTtRQUVuQixPQUFPLDhCQUFZLENBQUMsSUFBSSxFQUFFO1lBQ3pCLG1CQUFtQjtZQUNuQixLQUFLLEVBQUUsS0FBSztZQUNaLGlCQUFpQjtZQUNqQixhQUFhLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7SUFDSixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUM7UUFFTixPQUFPLElBQUksQ0FBQztJQUNiLENBQUMsQ0FBQyxDQUNGO0FBQ0YsQ0FBQztBQWpCRCx3Q0FpQkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBc0MsSUFBWTtJQUVuRixJQUNBO1FBQ0MsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVqQyxhQUFhO1FBQ2IsT0FBTyw4QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QixtQkFBbUI7WUFDbkIsS0FBSyxFQUFFLEtBQUs7WUFDWixpQkFBaUI7WUFDakIsYUFBYSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFBO0tBQ0Y7SUFDRCxPQUFPLENBQUMsRUFDUjtLQUVDO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDYixDQUFDO0FBcEJELGdEQW9CQztBQUVELFNBQWdCLGNBQWMsQ0FBc0MsSUFBTztJQUUxRSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxFQUN0QjtRQUNDLElBQUksR0FBRyxHQUFHO1lBQ1IsT0FBTztZQUNQLGNBQWM7WUFDZCxVQUFVO1lBQ1YsVUFBVTtZQUNWLFVBQVU7U0FDVixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsR0FBVztZQUUvQixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUM5QjtnQkFDQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTthQUN2QjtZQUVELE9BQU8sQ0FBQyxDQUFBO1FBQ1QsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNOO1FBRUQsR0FBRyxHQUFHLGlDQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdkMsT0FBTyxHQUFHLENBQUM7S0FDWDtJQUVELE9BQU8sRUFBRSxDQUFDO0FBQ1gsQ0FBQztBQTVCRCx3Q0E0QkM7QUFFRCxTQUFnQixTQUFTLENBQUMsR0FBRyxJQUEyQztJQUV2RSxPQUFPLElBQUksZUFBZSxDQUFTLFVBQVUsT0FBTyxFQUFFLE1BQU07UUFFM0QsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBRW5DLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDeEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWYsYUFBYTtZQUNiLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUIsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQyxDQUFDLENBQUE7QUFDSCxDQUFDO0FBZkQsOEJBZUM7QUFFRCxTQUFnQixPQUFPLENBQUMsSUFBWTtJQUVuQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzFELENBQUM7QUFIRCwwQkFHQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxLQUFhO0lBRTVDLElBQUksTUFBTSxHQUFHLEtBQUs7U0FDaEIsT0FBTyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUM7UUFFL0IsT0FBTyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDeEIsQ0FBQyxDQUFDO1NBQ0QsT0FBTyxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQztTQUNuQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUNyQjtJQUVELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLENBQUM7QUFaRCwwQ0FZQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxJQUFZO0lBRTFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDO1FBRXpDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNqQixDQUFDLENBQUMsQ0FBQTtBQUNILENBQUM7QUFORCx3Q0FNQztBQUVZLFFBQUEsZUFBZSxHQUFHLHlCQUFrQixDQUFDO0lBQ2pELE1BQU0sRUFBRSxJQUFJO0lBQ1osYUFBYSxDQUFDLEtBQWEsRUFBRSxLQUFXO1FBRXZDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLENBQUE7SUFDVCxDQUFDO0lBQ0QsV0FBVyxFQUFFLHNCQUFlLENBQUMsaUJBQWlCO0NBQzlDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTgvMTEvMTQvMDE0LlxuICovXG5cbmltcG9ydCB7IF90cmltLCBjcmVhdGVTb3J0Q2FsbGJhY2ssIGRlZmF1bHRTb3J0Q2FsbGJhY2ssIEVudW1Ub0xvd2VyQ2FzZSB9IGZyb20gJ0Bub2RlLW5vdmVsL3NvcnQnO1xuaW1wb3J0IHsgYXJyYXlfdW5pcXVlIH0gZnJvbSAnYXJyYXktaHlwZXItdW5pcXVlJztcbmltcG9ydCAqIGFzIEZhc3RHbG9iIGZyb20gJ2Zhc3QtZ2xvYic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1pY29udic7XG5pbXBvcnQgeyBJTWRjb25mTWV0YSwgbWRjb25mX3BhcnNlIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCBCbHVlYmlyZFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuaW1wb3J0IFN0clV0aWwgPSByZXF1aXJlKCdzdHItdXRpbCcpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFJlYWRtZU1ldGE8VCBleHRlbmRzIElNZGNvbmZNZXRhID0gSU1kY29uZk1ldGE+KGZpbGU6IHN0cmluZyk6IFByb21pc2U8VD5cbntcblx0cmV0dXJuIGZzLnJlYWRGaWxlKGZpbGUpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGRhdGEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG1kY29uZl9wYXJzZShkYXRhLCB7XG5cdFx0XHRcdC8vIOeVtuaykuacieWMheWQq+W/heimgeeahOWFp+WuueaZguS4jeeUoueUn+mMr+iqpFxuXHRcdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHRcdC8vIOWFgeioseS4jeaomea6lueahCBpbmZvIOWFp+WuuVxuXHRcdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdFx0fSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9KVxuXHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkUmVhZG1lTWV0YVN5bmM8VCBleHRlbmRzIElNZGNvbmZNZXRhID0gSU1kY29uZk1ldGE+KGZpbGU6IHN0cmluZyk6IFRcbntcblx0dHJ5XG5cdHtcblx0XHRsZXQgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbWRjb25mX3BhcnNlKGRhdGEsIHtcblx0XHRcdC8vIOeVtuaykuacieWMheWQq+W/heimgeeahOWFp+WuueaZguS4jeeUoueUn+mMr+iqpFxuXHRcdFx0dGhyb3c6IGZhbHNlLFxuXHRcdFx0Ly8g5YWB6Kix5LiN5qiZ5rqW55qEIGluZm8g5YWn5a65XG5cdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdH0pXG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3ZlbFRpdGxlczxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4obWV0YTogVCk6IHN0cmluZ1tdXG57XG5cdGlmIChtZXRhICYmIG1ldGEubm92ZWwpXG5cdHtcblx0XHRsZXQgYXJyID0gW1xuXHRcdFx0XHQndGl0bGUnLFxuXHRcdFx0XHQndGl0bGVfc291cmNlJyxcblx0XHRcdFx0J3RpdGxlX3poJyxcblx0XHRcdFx0J3RpdGxlX3R3Jyxcblx0XHRcdFx0J3RpdGxlX2NuJyxcblx0XHRcdF0uY29uY2F0KE9iamVjdC5rZXlzKG1ldGEubm92ZWwpKVxuXHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwga2V5OiBzdHJpbmcpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChrZXkuaW5kZXhPZigndGl0bGUnKSA9PT0gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChtZXRhLm5vdmVsW2tleV0pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0fSwgW10pXG5cdFx0O1xuXG5cdFx0YXJyID0gYXJyYXlfdW5pcXVlKGFyci5maWx0ZXIodiA9PiB2KSk7XG5cblx0XHRyZXR1cm4gYXJyO1xuXHR9XG5cblx0cmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2xvYkZpcnN0KC4uLmFyZ3Y6IFBhcmFtZXRlcnM8dHlwZW9mIEZhc3RHbG9iW1wic3RyZWFtXCJdPik6IEJsdWViaXJkUHJvbWlzZTxzdHJpbmc+XG57XG5cdHJldHVybiBuZXcgQmx1ZWJpcmRQcm9taXNlPHN0cmluZz4oZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdClcblx0e1xuXHRcdGxldCBmZ3MgPSBGYXN0R2xvYi5zdHJlYW0oLi4uYXJndik7XG5cblx0XHRmZ3Mub24oJ2RhdGEnLCAoZW50cnkpID0+IHtcblx0XHRcdHJlc29sdmUoZW50cnkpO1xuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRmZ3MuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHRcdGZncy5vbmNlKCdlcnJvcicsIHJlamVjdCk7XG5cdFx0ZmdzLm9uY2UoJ2VuZCcsICgpID0+IHJlc29sdmUodW5kZWZpbmVkKSk7XG5cdH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZF9ocmVmKGhyZWY6IHN0cmluZylcbntcblx0cmV0dXJuIGhyZWYuc3BsaXQoJy8nKS5tYXAoZW5jb2RlVVJJQ29tcG9uZW50KS5qb2luKCcvJyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZF9hbmNob3JfZ2l0ZWUodGl0bGU6IHN0cmluZylcbntcblx0bGV0IGFuY2hvciA9IHRpdGxlXG5cdFx0LnJlcGxhY2UoL1thLXpdKy9pZywgZnVuY3Rpb24gKHMpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHMudG9Mb3dlckNhc2UoKTtcblx0XHR9KVxuXHRcdC5yZXBsYWNlKC9bXFwu77yOXFwv77yP44CA77ygQO+8iO+8iVxcKFxcKe+9nn5dL2csICcnKVxuXHRcdC5yZXBsYWNlKC9bIF0vZywgJy0nKVxuXHQ7XG5cblx0cmV0dXJuIG1kX2hyZWYoYW5jaG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1kX2xpbmtfZXNjYXBlKHRleHQ6IHN0cmluZylcbntcblx0cmV0dXJuIHRleHQucmVwbGFjZSgvW1xcW1xcXV0vZywgZnVuY3Rpb24gKHMpXG5cdHtcblx0XHRyZXR1cm4gJ1xcXFwnICsgcztcblx0fSlcbn1cblxuZXhwb3J0IGNvbnN0IHRvY1NvcnRDYWxsYmFjayA9IGNyZWF0ZVNvcnRDYWxsYmFjayh7XG5cdGRvdE51bTogdHJ1ZSxcblx0dHJhbnNwaWxlQmFzZShpbnB1dDogc3RyaW5nLCBpc1N1Yj86IGFueSlcblx0e1xuXHRcdGxldCBzID0gU3RyVXRpbC50b0hhbGZXaWR0aChpbnB1dCk7XG5cdFx0cmV0dXJuIHNcblx0fSxcblx0dG9Mb3dlckNhc2U6IEVudW1Ub0xvd2VyQ2FzZS50b0xvY2FsZUxvd2VyQ2FzZSxcbn0pO1xuIl19