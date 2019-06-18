"use strict";
/**
 * Created by user on 2019/6/18.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const git_diff_from_1 = require("git-diff-from");
const upath2_1 = require("upath2");
const baseHashDefault = 5;
const targetTreeDefault = 'origin/master';
/**
 * 比對目標路徑下的 git 歷史變化
 * 適用於任何符合 `主資料夾/副資料夾/子路徑` 這種結構的資料夾
 */
function novelDiffFromLog(options) {
    let { targetTree = targetTreeDefault, novelRoot = process.cwd(), baseHash = baseHashDefault } = options;
    novelRoot = upath2_1.resolve(novelRoot);
    let ls = git_diff_from_1.default(baseHash, targetTree, {
        cwd: novelRoot,
    });
    let ret = {
        novelRoot,
        baseHash,
        targetTree,
        list: {},
        range: {
            from: ls.from,
            to: ls.to,
        },
        count: {
            main: 0,
            novel: 0,
            file: 0,
        },
    };
    if (ls.length) {
        ret.list = ls.reduce(function (a, value) {
            let s = value.path.split(/[\\\/]/);
            if (s.length > 2) {
                let pathMain = s[0];
                let novelID = s[1];
                let basename = s[s.length - 1];
                let subpath = s.slice(2).join('/');
                if (!a[pathMain]) {
                    ret.count.main++;
                }
                a[pathMain] = a[pathMain] || {};
                if (!a[pathMain][novelID]) {
                    ret.count.novel++;
                }
                if (a[pathMain][novelID] == null) {
                    a[pathMain][novelID] = a[pathMain][novelID] || [];
                    Object.defineProperties(a[pathMain][novelID], {
                        pathMain: {
                            enumerable: false,
                            configurable: false,
                            get() {
                                return pathMain;
                            },
                        },
                        novelID: {
                            enumerable: false,
                            configurable: false,
                            get() {
                                return novelID;
                            },
                        },
                    });
                }
                a[pathMain][novelID].push(Object.assign(value, {
                    pathMain,
                    novelID,
                    basename,
                    subpath,
                }));
                ret.count.file++;
            }
            return a;
        }, {});
    }
    return ret;
}
exports.novelDiffFromLog = novelDiffFromLog;
exports.default = novelDiffFromLog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsaURBQTZEO0FBRTdELG1DQUFnQztBQUVoQyxNQUFNLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDMUIsTUFBTSxpQkFBaUIsR0FBRyxlQUFlLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsU0FBZ0IsZ0JBQWdCLENBQUMsT0FBNEM7SUFFNUUsSUFBSSxFQUFFLFVBQVUsR0FBRyxpQkFBaUIsRUFBRSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsR0FBRyxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFFeEcsU0FBUyxHQUFHLGdCQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFL0IsSUFBSSxFQUFFLEdBQUcsdUJBQVcsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFO1FBQzFDLEdBQUcsRUFBRSxTQUFTO0tBQ2QsQ0FBQyxDQUFDO0lBRUgsSUFBSSxHQUFHLEdBQXNCO1FBQzVCLFNBQVM7UUFDVCxRQUFRO1FBQ1IsVUFBVTtRQUNWLElBQUksRUFBRSxFQUFFO1FBRVIsS0FBSyxFQUFFO1lBQ04sSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO1lBQ2IsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO1NBQ1Q7UUFFRCxLQUFLLEVBQUU7WUFDTixJQUFJLEVBQUUsQ0FBQztZQUNQLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxFQUFFLENBQUM7U0FDUDtLQUNELENBQUM7SUFFRixJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQ2I7UUFDQyxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsS0FBSztZQUV0QyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUVuQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUNoQjtnQkFDQyxJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFbkIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRS9CLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUVuQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUNoQjtvQkFDQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUNqQjtnQkFFRCxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFFaEMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFDekI7b0JBQ0MsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDbEI7Z0JBRUQsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxFQUNoQztvQkFDQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFbEQsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRTt3QkFDN0MsUUFBUSxFQUFFOzRCQUNULFVBQVUsRUFBRSxLQUFLOzRCQUNqQixZQUFZLEVBQUUsS0FBSzs0QkFDbkIsR0FBRztnQ0FFRixPQUFPLFFBQVEsQ0FBQTs0QkFDaEIsQ0FBQzt5QkFDRDt3QkFDRCxPQUFPLEVBQUU7NEJBQ1IsVUFBVSxFQUFFLEtBQUs7NEJBQ2pCLFlBQVksRUFBRSxLQUFLOzRCQUNuQixHQUFHO2dDQUVGLE9BQU8sT0FBTyxDQUFBOzRCQUNmLENBQUM7eUJBQ0Q7cUJBQ0QsQ0FBQyxDQUFDO2lCQUNIO2dCQUVELENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7b0JBQzlDLFFBQVE7b0JBQ1IsT0FBTztvQkFDUCxRQUFRO29CQUNSLE9BQU87aUJBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUosR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNqQjtZQUVELE9BQU8sQ0FBQyxDQUFDO1FBQ1YsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ1A7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNaLENBQUM7QUE5RkQsNENBOEZDO0FBdUZELGtCQUFlLGdCQUFnQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS82LzE4LlxuICovXG5cbmltcG9ydCBnaXREaWZmRnJvbSwgeyBJR2l0RGlmZkZyb21Sb3cgfSBmcm9tICdnaXQtZGlmZi1mcm9tJztcbmltcG9ydCB7IElUU1BpY2tFeHRyYSB9IGZyb20gJ3RzLXR5cGUnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAndXBhdGgyJ1xuXG5jb25zdCBiYXNlSGFzaERlZmF1bHQgPSA1O1xuY29uc3QgdGFyZ2V0VHJlZURlZmF1bHQgPSAnb3JpZ2luL21hc3Rlcic7XG5cbi8qKlxuICog5q+U5bCN55uu5qiZ6Lev5b6R5LiL55qEIGdpdCDmrbflj7LororljJZcbiAqIOmBqeeUqOaWvOS7u+S9leespuWQiCBg5Li76LOH5paZ5aS+L+WJr+izh+aWmeWkvi/lrZDot6/lvpFgIOmAmeeorue1kOani+eahOizh+aWmeWkvlxuICovXG5leHBvcnQgZnVuY3Rpb24gbm92ZWxEaWZmRnJvbUxvZyhvcHRpb25zOiBJVFNQaWNrRXh0cmE8SU9wdGlvbnMsICdub3ZlbFJvb3QnPik6IElOb3ZlbERpZmZGcm9tTG9nXG57XG5cdGxldCB7IHRhcmdldFRyZWUgPSB0YXJnZXRUcmVlRGVmYXVsdCwgbm92ZWxSb290ID0gcHJvY2Vzcy5jd2QoKSwgYmFzZUhhc2ggPSBiYXNlSGFzaERlZmF1bHQgfSA9IG9wdGlvbnM7XG5cblx0bm92ZWxSb290ID0gcmVzb2x2ZShub3ZlbFJvb3QpO1xuXG5cdGxldCBscyA9IGdpdERpZmZGcm9tKGJhc2VIYXNoLCB0YXJnZXRUcmVlLCB7XG5cdFx0Y3dkOiBub3ZlbFJvb3QsXG5cdH0pO1xuXG5cdGxldCByZXQ6IElOb3ZlbERpZmZGcm9tTG9nID0ge1xuXHRcdG5vdmVsUm9vdCxcblx0XHRiYXNlSGFzaCxcblx0XHR0YXJnZXRUcmVlLFxuXHRcdGxpc3Q6IHt9LFxuXG5cdFx0cmFuZ2U6IHtcblx0XHRcdGZyb206IGxzLmZyb20sXG5cdFx0XHR0bzogbHMudG8sXG5cdFx0fSxcblxuXHRcdGNvdW50OiB7XG5cdFx0XHRtYWluOiAwLFxuXHRcdFx0bm92ZWw6IDAsXG5cdFx0XHRmaWxlOiAwLFxuXHRcdH0sXG5cdH07XG5cblx0aWYgKGxzLmxlbmd0aClcblx0e1xuXHRcdHJldC5saXN0ID0gbHMucmVkdWNlKGZ1bmN0aW9uIChhLCB2YWx1ZSlcblx0XHR7XG5cdFx0XHRsZXQgcyA9IHZhbHVlLnBhdGguc3BsaXQoL1tcXFxcXFwvXS8pO1xuXG5cdFx0XHRpZiAocy5sZW5ndGggPiAyKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgcGF0aE1haW4gPSBzWzBdO1xuXHRcdFx0XHRsZXQgbm92ZWxJRCA9IHNbMV07XG5cblx0XHRcdFx0bGV0IGJhc2VuYW1lID0gc1tzLmxlbmd0aCAtIDFdO1xuXG5cdFx0XHRcdGxldCBzdWJwYXRoID0gcy5zbGljZSgyKS5qb2luKCcvJyk7XG5cblx0XHRcdFx0aWYgKCFhW3BhdGhNYWluXSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldC5jb3VudC5tYWluKys7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRhW3BhdGhNYWluXSA9IGFbcGF0aE1haW5dIHx8IHt9O1xuXG5cdFx0XHRcdGlmICghYVtwYXRoTWFpbl1bbm92ZWxJRF0pXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXQuY291bnQubm92ZWwrKztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChhW3BhdGhNYWluXVtub3ZlbElEXSA9PSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YVtwYXRoTWFpbl1bbm92ZWxJRF0gPSBhW3BhdGhNYWluXVtub3ZlbElEXSB8fCBbXTtcblxuXHRcdFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKGFbcGF0aE1haW5dW25vdmVsSURdLCB7XG5cdFx0XHRcdFx0XHRwYXRoTWFpbjoge1xuXHRcdFx0XHRcdFx0XHRlbnVtZXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0Z2V0KClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBwYXRoTWFpblxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG5vdmVsSUQ6IHtcblx0XHRcdFx0XHRcdFx0ZW51bWVyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdGdldCgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gbm92ZWxJRFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFbcGF0aE1haW5dW25vdmVsSURdLnB1c2goT2JqZWN0LmFzc2lnbih2YWx1ZSwge1xuXHRcdFx0XHRcdHBhdGhNYWluLFxuXHRcdFx0XHRcdG5vdmVsSUQsXG5cdFx0XHRcdFx0YmFzZW5hbWUsXG5cdFx0XHRcdFx0c3VicGF0aCxcblx0XHRcdFx0fSkpO1xuXG5cdFx0XHRcdHJldC5jb3VudC5maWxlKys7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBhO1xuXHRcdH0sIHt9KTtcblx0fVxuXG5cdHJldHVybiByZXQ7XG59XG5cbmV4cG9ydCB0eXBlIElMaXN0RmlsZVJvdyA9IElHaXREaWZmRnJvbVJvdyAmIHtcblx0LyoqXG5cdCAqIOS4u+izh+aWmeWkviBJRFxuXHQgKi9cblx0cGF0aE1haW46IHN0cmluZyxcblx0LyoqXG5cdCAqIOizh+aWmeWkviBJRCAo5bCP6Kqq5ZCN56ixKVxuXHQgKi9cblx0bm92ZWxJRDogc3RyaW5nLFxuXHRiYXNlbmFtZTogc3RyaW5nLFxuXHRzdWJwYXRoOiBzdHJpbmcsXG59XG5cbmV4cG9ydCB0eXBlIElMaXN0Tm92ZWxSb3cgPSBJTGlzdEZpbGVSb3dbXSAmIHtcblx0LyoqXG5cdCAqIOS4u+izh+aWmeWkviBJRFxuXHQgKi9cblx0cmVhZG9ubHkgcGF0aE1haW46IHN0cmluZyxcblx0LyoqXG5cdCAqIOizh+aWmeWkviBJRCAo5bCP6Kqq5ZCN56ixKVxuXHQgKi9cblx0cmVhZG9ubHkgbm92ZWxJRDogc3RyaW5nLFxufVxuXG5leHBvcnQgdHlwZSBJTGlzdE1haW4gPSB7XG5cdFtwYXRoTWFpbjogc3RyaW5nXTogSUxpc3RNYWluUm93LFxufVxuXG5leHBvcnQgdHlwZSBJTGlzdE1haW5Sb3cgPSB7XG5cdFtub3ZlbElEOiBzdHJpbmddOiBJTGlzdE5vdmVsUm93XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSU9wdGlvbnNcbntcblx0LyoqXG5cdCAqIOaqouafpei3r+W+kVxuXHQgKiDnm67mqJnmoLnnm67pjIRcblx0ICovXG5cdG5vdmVsUm9vdDogc3RyaW5nLFxuXHQvKipcblx0ICog5qqi5p+l6LW35aeL6bueXG5cdCAqIOaqouafpSBoYXNoIOaIluiAhSDlj6/ovLjlhaXmlbjlrZcg5YmH6Ieq5YuV5pCc5bCLIOatpOaVuOWtl+S7peWFp+eahOe0gOmMhFxuXHQgKi9cblx0YmFzZUhhc2g6IG51bWJlciB8IHN0cmluZyxcblx0LyoqXG5cdCAqIOavlOWwjeebruaomeWIhuaUr+aIluiAhSBjb21taXQgaWRcblx0ICovXG5cdHRhcmdldFRyZWU6IHN0cmluZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTm92ZWxEaWZmRnJvbUxvZyBleHRlbmRzIElPcHRpb25zXG57XG5cdC8qKlxuXHQgKiDlm57lgrPliJfooahcblx0ICovXG5cdGxpc3Q6IElMaXN0TWFpbjtcblx0LyoqXG5cdCAqIOWvpumam+avlOWwjeevhOWcjVxuXHQgKi9cblx0cmFuZ2U6IHtcblx0XHQvKipcblx0XHQgKiDotbflp4tcblx0XHQgKi9cblx0XHRmcm9tOiBzdHJpbmc7XG5cdFx0LyoqXG5cdFx0ICog57WC6bueXG5cdFx0ICovXG5cdFx0dG86IHN0cmluZztcblx0fTtcblx0Y291bnQ6IHtcblx0XHQvKipcblx0XHQgKiDkuLvos4fmlpnlpL7mlbjph49cblx0XHQgKi9cblx0XHRtYWluOiBudW1iZXI7XG5cdFx0LyoqXG5cdFx0ICog5bCP6Kqq5pW46YePXG5cdFx0ICovXG5cdFx0bm92ZWw6IG51bWJlcjtcblx0XHQvKipcblx0XHQgKiDororljJbmqpTmoYjnuL3mlbhcblx0XHQgKi9cblx0XHRmaWxlOiBudW1iZXI7XG5cdH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5vdmVsRGlmZkZyb21Mb2dcbiJdfQ==