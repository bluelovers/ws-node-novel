"use strict";
/**
 * Created by user on 2019/5/29.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const blank_line_1 = require("blank-line");
function _isIwordsArray(value) {
    return Array.isArray(value) && (value.length > 1);
}
exports._isIwordsArray = _isIwordsArray;
function _isIwordsArray2(value) {
    return Array.isArray(value) && value.length == 1 && typeof value[0] == 'function';
}
exports._isIwordsArray2 = _isIwordsArray2;
function _isIwordsUserSp(value) {
    return typeof value.s == 'string' && new RegExp(`${index_1.SP_KEY}(.+)$`).test(value.s);
}
exports._isIwordsUserSp = _isIwordsUserSp;
function _handleTextLayout(html, options) {
    if (!html.match(/[^\n]\n[^\n]/g)) {
        let [min, mid, max] = blank_line_1.default(html);
        if (min > 2) {
            options.allow_lf2 = false;
        }
        if (max >= 3) {
            if (min > 2) {
                let r = new RegExp(`\\n{${min - 1}}(\\n+)`, 'g');
                html = html
                    //.replace(/\n{2}(\n*)/g, '$1')
                    .replace(r, '$1');
            }
            html = html
                .replace(/\n{3,}/g, "\n\n\n");
        }
        //console.log(options);
        if (!options.allow_lf2) {
            html = html
                .replace(/\n\n/g, "\n");
        }
    }
    /*
    html = html
    // for ts
        .toString()
        .replace(/([^\n「」【】《》“”『』（）\[\]"](?:[！？?!。]*)?)\n((?:[—]+)?[「」“”【】《》（）『』])/ug, "$1\n\n$2")

        .replace(/([「」【】《》“”『』（）―\[\]"](?:[！？?!。]*)?)\n((?:\u3000*)[^\n「」“”【】《》（）『』])/ug, "$1\n\n$2")

        .replace(/([^\n「」【】《》“”『』（）\[\]"≪≫](?:[！？?!。]*)?)\n((?:[—]+)?[≪≫「」“”【】《》（）『』])/ug, "$1\n\n$2")

        .replace(/(）(?:[！？?!。]*)?)\n([「」【】《》『』“”])/ug, "$1\n\n$2")
    ;
    */
    html = html
        .replace(/^\n+|[\s\u3000]+$/g, '')
        .replace(/(\n){4,}/g, "\n\n\n\n" /* LF4 */);
    if (options.allow_lf3) {
        html = html
            .replace(/(\n){3,}/g, "\n\n\n" /* LF3 */);
    }
    else {
        html = html
            .replace(/(\n){3}/g, "\n\n" /* LF2 */);
    }
    return html;
}
exports._handleTextLayout = _handleTextLayout;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHOztBQUdILG1DQUFpQztBQUNqQywyQ0FBc0M7QUFFdEMsU0FBZ0IsY0FBYyxDQUFDLEtBQUs7SUFFbkMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuRCxDQUFDO0FBSEQsd0NBR0M7QUFFRCxTQUFnQixlQUFlLENBQUMsS0FBSztJQUVwQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDO0FBQ25GLENBQUM7QUFIRCwwQ0FHQztBQUVELFNBQWdCLGVBQWUsQ0FBQyxLQUFLO0lBRXBDLE9BQU8sT0FBTyxLQUFLLENBQUMsQ0FBQyxJQUFJLFFBQVEsSUFBSSxJQUFJLE1BQU0sQ0FBQyxHQUFHLGNBQU0sT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRixDQUFDO0FBSEQsMENBR0M7QUFFRCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsT0FBMkI7SUFFMUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQ2hDO1FBQ0MsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsb0JBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6QyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQ1g7WUFDQyxPQUFPLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztTQUMxQjtRQUVELElBQUksR0FBRyxJQUFJLENBQUMsRUFDWjtZQUNDLElBQUksR0FBRyxHQUFHLENBQUMsRUFDWDtnQkFDQyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFFakQsSUFBSSxHQUFHLElBQUk7b0JBQ1gsK0JBQStCO3FCQUM3QixPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUNqQjthQUNEO1lBRUQsSUFBSSxHQUFHLElBQUk7aUJBQ1QsT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FFN0I7U0FDRDtRQUVELHVCQUF1QjtRQUV2QixJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFDdEI7WUFDQyxJQUFJLEdBQUcsSUFBSTtpQkFDVCxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUN2QjtTQUNEO0tBQ0Q7SUFFRDs7Ozs7Ozs7Ozs7O01BWUU7SUFFRixJQUFJLEdBQUcsSUFBSTtTQUNULE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLENBQUM7U0FDakMsT0FBTyxDQUFDLFdBQVcsdUJBQWEsQ0FDakM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQ3JCO1FBQ0MsSUFBSSxHQUFHLElBQUk7YUFDVCxPQUFPLENBQUMsV0FBVyxxQkFBYSxDQUNqQztLQUNEO1NBRUQ7UUFDQyxJQUFJLEdBQUcsSUFBSTthQUNULE9BQU8sQ0FBQyxVQUFVLG1CQUFhLENBQ2hDO0tBQ0Q7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNiLENBQUM7QUF4RUQsOENBd0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IHVzZXIgb24gMjAxOS81LzI5LlxuICovXG5cbmltcG9ydCB7IEVudW1MRiwgSVRleHRMYXlvdXRPcHRpb25zLCBJV29yZHNBcnJheSwgSVdvcmRzQXJyYXkyLCBJV29yZHNVc2VyU1AgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IFNQX0tFWSB9IGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0IGdldE1pbk1pZE1heCBmcm9tICdibGFuay1saW5lJztcblxuZXhwb3J0IGZ1bmN0aW9uIF9pc0l3b3Jkc0FycmF5KHZhbHVlKTogdmFsdWUgaXMgSVdvcmRzQXJyYXlcbntcblx0cmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmICh2YWx1ZS5sZW5ndGggPiAxKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9pc0l3b3Jkc0FycmF5Mih2YWx1ZSk6IHZhbHVlIGlzIElXb3Jkc0FycmF5Mlxue1xuXHRyZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09IDEgJiYgdHlwZW9mIHZhbHVlWzBdID09ICdmdW5jdGlvbic7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfaXNJd29yZHNVc2VyU3AodmFsdWUpOiB2YWx1ZSBpcyBJV29yZHNVc2VyU1Bcbntcblx0cmV0dXJuIHR5cGVvZiB2YWx1ZS5zID09ICdzdHJpbmcnICYmIG5ldyBSZWdFeHAoYCR7U1BfS0VZfSguKykkYCkudGVzdCh2YWx1ZS5zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9oYW5kbGVUZXh0TGF5b3V0KGh0bWw6IHN0cmluZywgb3B0aW9uczogSVRleHRMYXlvdXRPcHRpb25zKTogc3RyaW5nXG57XG5cdGlmICghaHRtbC5tYXRjaCgvW15cXG5dXFxuW15cXG5dL2cpKVxuXHR7XG5cdFx0bGV0IFttaW4sIG1pZCwgbWF4XSA9IGdldE1pbk1pZE1heChodG1sKTtcblxuXHRcdGlmIChtaW4gPiAyKVxuXHRcdHtcblx0XHRcdG9wdGlvbnMuYWxsb3dfbGYyID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKG1heCA+PSAzKVxuXHRcdHtcblx0XHRcdGlmIChtaW4gPiAyKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgciA9IG5ldyBSZWdFeHAoYFxcXFxueyR7bWluIC0gMX19KFxcXFxuKylgLCAnZycpO1xuXG5cdFx0XHRcdGh0bWwgPSBodG1sXG5cdFx0XHRcdC8vLnJlcGxhY2UoL1xcbnsyfShcXG4qKS9nLCAnJDEnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKHIsICckMScpXG5cdFx0XHRcdDtcblx0XHRcdH1cblxuXHRcdFx0aHRtbCA9IGh0bWxcblx0XHRcdFx0LnJlcGxhY2UoL1xcbnszLH0vZywgXCJcXG5cXG5cXG5cIilcblx0XHRcdC8vLnJlcGxhY2UoL1xcbnsyfS9nLCBcIlxcblwiKVxuXHRcdFx0O1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5sb2cob3B0aW9ucyk7XG5cblx0XHRpZiAoIW9wdGlvbnMuYWxsb3dfbGYyKVxuXHRcdHtcblx0XHRcdGh0bWwgPSBodG1sXG5cdFx0XHRcdC5yZXBsYWNlKC9cXG5cXG4vZywgXCJcXG5cIilcblx0XHRcdDtcblx0XHR9XG5cdH1cblxuXHQvKlxuXHRodG1sID0gaHRtbFxuXHQvLyBmb3IgdHNcblx0XHQudG9TdHJpbmcoKVxuXHRcdC5yZXBsYWNlKC8oW15cXG7jgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvIlcXFtcXF1cIl0oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzpb4oCUXSspP1vjgIzjgI3igJzigJ3jgJDjgJHjgIrjgIvvvIjvvInjgI7jgI9dKS91ZywgXCIkMVxcblxcbiQyXCIpXG5cblx0XHQucmVwbGFjZSgvKFvjgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvInigJVcXFtcXF1cIl0oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzpcXHUzMDAwKilbXlxcbuOAjOOAjeKAnOKAneOAkOOAkeOAiuOAi++8iO+8ieOAjuOAj10pL3VnLCBcIiQxXFxuXFxuJDJcIilcblxuXHRcdC5yZXBsYWNlKC8oW15cXG7jgIzjgI3jgJDjgJHjgIrjgIvigJzigJ3jgI7jgI/vvIjvvIlcXFtcXF1cIuKJquKJq10oPzpb77yB77yfPyHjgIJdKik/KVxcbigoPzpb4oCUXSspP1viiariiavjgIzjgI3igJzigJ3jgJDjgJHjgIrjgIvvvIjvvInjgI7jgI9dKS91ZywgXCIkMVxcblxcbiQyXCIpXG5cblx0XHQucmVwbGFjZSgvKO+8iSg/OlvvvIHvvJ8/IeOAgl0qKT8pXFxuKFvjgIzjgI3jgJDjgJHjgIrjgIvjgI7jgI/igJzigJ1dKS91ZywgXCIkMVxcblxcbiQyXCIpXG5cdDtcblx0Ki9cblxuXHRodG1sID0gaHRtbFxuXHRcdC5yZXBsYWNlKC9eXFxuK3xbXFxzXFx1MzAwMF0rJC9nLCAnJylcblx0XHQucmVwbGFjZSgvKFxcbil7NCx9L2csIEVudW1MRi5MRjQpXG5cdDtcblxuXHRpZiAob3B0aW9ucy5hbGxvd19sZjMpXG5cdHtcblx0XHRodG1sID0gaHRtbFxuXHRcdFx0LnJlcGxhY2UoLyhcXG4pezMsfS9nLCBFbnVtTEYuTEYzKVxuXHRcdDtcblx0fVxuXHRlbHNlXG5cdHtcblx0XHRodG1sID0gaHRtbFxuXHRcdFx0LnJlcGxhY2UoLyhcXG4pezN9L2csIEVudW1MRi5MRjIpXG5cdFx0O1xuXHR9XG5cblx0cmV0dXJuIGh0bWw7XG59XG4iXX0=