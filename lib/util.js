"use strict";
/**
 * Created by user on 2018/11/14/014.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const FastGlob = require("fast-glob");
const array_hyper_unique_1 = require("array-hyper-unique");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUVILHNDQUFzQztBQUN0QywyREFBa0Q7QUFDbEQsK0JBQStCO0FBQy9CLHFEQUE0RDtBQUM1RCw0Q0FBNkM7QUFFdEMsS0FBSyxVQUFVLGNBQWMsQ0FBc0MsSUFBWTtJQUVyRixPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1NBQ3RCLElBQUksQ0FBQyxVQUFVLElBQUk7UUFFbkIsT0FBTyw4QkFBWSxDQUFDLElBQUksRUFBRTtZQUN6QixtQkFBbUI7WUFDbkIsS0FBSyxFQUFFLEtBQUs7WUFDWixpQkFBaUI7WUFDakIsYUFBYSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO1NBQ0QsS0FBSyxDQUFDO1FBRU4sT0FBTyxJQUFJLENBQUM7SUFDYixDQUFDLENBQUMsQ0FDRjtBQUNGLENBQUM7QUFqQkQsd0NBaUJDO0FBRUQsU0FBZ0Isa0JBQWtCLENBQXNDLElBQVk7SUFFbkYsSUFDQTtRQUNDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFakMsYUFBYTtRQUNiLE9BQU8sOEJBQVksQ0FBQyxJQUFJLEVBQUU7WUFDekIsbUJBQW1CO1lBQ25CLEtBQUssRUFBRSxLQUFLO1lBQ1osaUJBQWlCO1lBQ2pCLGFBQWEsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQTtLQUNGO0lBQ0QsT0FBTyxDQUFDLEVBQ1I7S0FFQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2IsQ0FBQztBQXBCRCxnREFvQkM7QUFFRCxTQUFnQixjQUFjLENBQXNDLElBQU87SUFFMUUsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFDdEI7UUFDQyxJQUFJLEdBQUcsR0FBRztZQUNSLE9BQU87WUFDUCxjQUFjO1lBQ2QsVUFBVTtZQUNWLFVBQVU7WUFDVixVQUFVO1NBQ1YsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDaEMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEdBQVc7WUFFL0IsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFDOUI7Z0JBQ0MsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7YUFDdkI7WUFFRCxPQUFPLENBQUMsQ0FBQTtRQUNULENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDTjtRQUVELEdBQUcsR0FBRyxpQ0FBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXZDLE9BQU8sR0FBRyxDQUFDO0tBQ1g7SUFFRCxPQUFPLEVBQUUsQ0FBQztBQUNYLENBQUM7QUE1QkQsd0NBNEJDO0FBRUQsU0FBZ0IsU0FBUyxDQUFDLEdBQUcsSUFBMkM7SUFFdkUsT0FBTyxJQUFJLGVBQWUsQ0FBUyxVQUFVLE9BQU8sRUFBRSxNQUFNO1FBRTNELElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUVuQyxHQUFHLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVmLGFBQWE7WUFDYixHQUFHLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUNILEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQzNDLENBQUMsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQWZELDhCQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOC8xMS8xNC8wMTQuXG4gKi9cblxuaW1wb3J0ICogYXMgRmFzdEdsb2IgZnJvbSAnZmFzdC1nbG9iJztcbmltcG9ydCB7IGFycmF5X3VuaXF1ZSB9IGZyb20gJ2FycmF5LWh5cGVyLXVuaXF1ZSc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcy1pY29udic7XG5pbXBvcnQgeyBJTWRjb25mTWV0YSwgbWRjb25mX3BhcnNlIH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcbmltcG9ydCBCbHVlYmlyZFByb21pc2UgPSByZXF1aXJlKCdibHVlYmlyZCcpO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZFJlYWRtZU1ldGE8VCBleHRlbmRzIElNZGNvbmZNZXRhID0gSU1kY29uZk1ldGE+KGZpbGU6IHN0cmluZyk6IFByb21pc2U8VD5cbntcblx0cmV0dXJuIGZzLnJlYWRGaWxlKGZpbGUpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGRhdGEpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIG1kY29uZl9wYXJzZShkYXRhLCB7XG5cdFx0XHRcdC8vIOeVtuaykuacieWMheWQq+W/heimgeeahOWFp+WuueaZguS4jeeUoueUn+mMr+iqpFxuXHRcdFx0XHR0aHJvdzogZmFsc2UsXG5cdFx0XHRcdC8vIOWFgeioseS4jeaomea6lueahCBpbmZvIOWFp+WuuVxuXHRcdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdFx0fSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9KVxuXHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2FkUmVhZG1lTWV0YVN5bmM8VCBleHRlbmRzIElNZGNvbmZNZXRhID0gSU1kY29uZk1ldGE+KGZpbGU6IHN0cmluZyk6IFRcbntcblx0dHJ5XG5cdHtcblx0XHRsZXQgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gbWRjb25mX3BhcnNlKGRhdGEsIHtcblx0XHRcdC8vIOeVtuaykuacieWMheWQq+W/heimgeeahOWFp+WuueaZguS4jeeUoueUn+mMr+iqpFxuXHRcdFx0dGhyb3c6IGZhbHNlLFxuXHRcdFx0Ly8g5YWB6Kix5LiN5qiZ5rqW55qEIGluZm8g5YWn5a65XG5cdFx0XHRsb3dDaGVja0xldmVsOiB0cnVlLFxuXHRcdH0pXG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblxuXHR9XG5cblx0cmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3ZlbFRpdGxlczxUIGV4dGVuZHMgSU1kY29uZk1ldGEgPSBJTWRjb25mTWV0YT4obWV0YTogVCk6IHN0cmluZ1tdXG57XG5cdGlmIChtZXRhICYmIG1ldGEubm92ZWwpXG5cdHtcblx0XHRsZXQgYXJyID0gW1xuXHRcdFx0XHQndGl0bGUnLFxuXHRcdFx0XHQndGl0bGVfc291cmNlJyxcblx0XHRcdFx0J3RpdGxlX3poJyxcblx0XHRcdFx0J3RpdGxlX3R3Jyxcblx0XHRcdFx0J3RpdGxlX2NuJyxcblx0XHRcdF0uY29uY2F0KE9iamVjdC5rZXlzKG1ldGEubm92ZWwpKVxuXHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYSwga2V5OiBzdHJpbmcpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChrZXkuaW5kZXhPZigndGl0bGUnKSA9PT0gMClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGEucHVzaChtZXRhLm5vdmVsW2tleV0pXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gYVxuXHRcdFx0fSwgW10pXG5cdFx0O1xuXG5cdFx0YXJyID0gYXJyYXlfdW5pcXVlKGFyci5maWx0ZXIodiA9PiB2KSk7XG5cblx0XHRyZXR1cm4gYXJyO1xuXHR9XG5cblx0cmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2xvYkZpcnN0KC4uLmFyZ3Y6IFBhcmFtZXRlcnM8dHlwZW9mIEZhc3RHbG9iW1wic3RyZWFtXCJdPik6IEJsdWViaXJkUHJvbWlzZTxzdHJpbmc+XG57XG5cdHJldHVybiBuZXcgQmx1ZWJpcmRQcm9taXNlPHN0cmluZz4oZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdClcblx0e1xuXHRcdGxldCBmZ3MgPSBGYXN0R2xvYi5zdHJlYW0oLi4uYXJndik7XG5cblx0XHRmZ3Mub24oJ2RhdGEnLCAoZW50cnkpID0+IHtcblx0XHRcdHJlc29sdmUoZW50cnkpO1xuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRmZ3MuZGVzdHJveSgpO1xuXHRcdH0pO1xuXHRcdGZncy5vbmNlKCdlcnJvcicsIHJlamVjdCk7XG5cdFx0ZmdzLm9uY2UoJ2VuZCcsICgpID0+IHJlc29sdmUodW5kZWZpbmVkKSk7XG5cdH0pXG59XG4iXX0=