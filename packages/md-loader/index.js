"use strict";
/**
 * Created by user on 2019/2/1/001.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const GrayMatter = require("gray-matter");
const node_novel_info_1 = require("node-novel-info");
function parse(inputContent, options) {
    let { matterOptions, parseOptions, parser = node_novel_info_1.mdconf_parse } = (options || {});
    let _stringify = options.stringify || node_novel_info_1.stringify;
    if (inputContent == null || typeof stringify !== 'function' || typeof parser !== 'function') {
        let e = new TypeError(``);
        // @ts-ignore
        e.inputContent = inputContent;
        // @ts-ignore
        e._options = options;
        throw e;
    }
    // @ts-ignore
    inputContent = fixContent(inputContent);
    let matter = GrayMatter(inputContent, matterOptions);
    // @ts-ignore
    let mdconf = parser(inputContent, parseOptions);
    if (!mdconf || mdconf && Object.keys(mdconf).length == 0) {
        mdconf = null;
    }
    return {
        /**
         * 經由 gray-matter 解析後的物件
         */
        matter,
        /**
         * 排除 Front Matter 後的原始內容
         */
        content: matter.content,
        /**
         * Front Matter 資料
         */
        data: matter.data,
        /**
         * 回傳的 mdconf 資料 預設為 node-novel-info
         * 如果回傳的 為 {} 空物件則會被轉換為 null
         */
        mdconf,
        /**
         * 用來將取得的物件轉換回 md
         * 當 content, mdconf 同時存在時 content > mdconf
         */
        stringify(inputData) {
            return stringify(inputData, {
                // @ts-ignore
                matterOptions,
                stringify: _stringify,
            });
        },
    };
}
exports.parse = parse;
/**
 * 用來將取得的物件轉換回 md
 * 當 content, mdconf 同時存在時 content > mdconf
 */
function stringify(inputData, options) {
    let { matterOptions, stringify = node_novel_info_1.stringify } = (options || {});
    // @ts-ignore
    let content = inputData.content != null
        // @ts-ignore
        ? inputData.content
        // @ts-ignore
        : inputData.mdconf ? stringify(inputData.mdconf) : null;
    return GrayMatter.stringify(fixContent(content), 
    // @ts-ignore
    inputData.data, 
    // @ts-ignore
    matterOptions);
}
exports.stringify = stringify;
/**
 * 將 inputContent 轉為 string
 */
function fixContent(inputContent) {
    if (inputContent != null) {
        // @ts-ignore
        inputContent = String(inputContent)
            .replace(/^[\r\n]+/, '');
        // @ts-ignore
        return inputContent;
    }
}
exports.fixContent = fixContent;
exports.default = exports;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsMENBQTJDO0FBQzNDLHFEQUE2RjtBQTRCN0YsU0FBZ0IsS0FBSyxDQUFtQyxZQUFlLEVBQUUsT0FBa0M7SUFFMUcsSUFBSSxFQUFFLGFBQWEsRUFBRSxZQUFZLEVBQUUsTUFBTSxHQUFHLDhCQUFZLEVBQUUsR0FBRyxDQUFDLE9BQU8sSUFBSSxFQUFVLENBQUMsQ0FBQztJQUdyRixJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMsU0FBUyxJQUFJLDJCQUFnQixDQUFDO0lBRXZELElBQUksWUFBWSxJQUFJLElBQUksSUFBSSxPQUFPLFNBQVMsS0FBSyxVQUFVLElBQUksT0FBTyxNQUFNLEtBQUssVUFBVSxFQUMzRjtRQUNDLElBQUksQ0FBQyxHQUFHLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTFCLGFBQWE7UUFDYixDQUFDLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUM5QixhQUFhO1FBQ2IsQ0FBQyxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFFckIsTUFBTSxDQUFDLENBQUE7S0FDUDtJQUVELGFBQWE7SUFDYixZQUFZLEdBQUcsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBRXhDLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxZQUFZLEVBQUUsYUFBb0IsQ0FBQyxDQUFDO0lBQzVELGFBQWE7SUFDYixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBRWhELElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFDeEQ7UUFDQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0tBQ2Q7SUFFRCxPQUFPO1FBQ047O1dBRUc7UUFDSCxNQUFNO1FBQ047O1dBRUc7UUFDSCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87UUFDdkI7O1dBRUc7UUFDSCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQWtCO1FBQy9COzs7V0FHRztRQUNILE1BQU07UUFDTjs7O1dBR0c7UUFDSCxTQUFTLENBQW1CLFNBQWlDO1lBRTVELE9BQU8sU0FBUyxDQUFTLFNBQVMsRUFBRTtnQkFDbkMsYUFBYTtnQkFDYixhQUFhO2dCQUNiLFNBQVMsRUFBRSxVQUFVO2FBQ3JCLENBQUMsQ0FBQTtRQUNILENBQUM7S0FDRCxDQUFBO0FBQ0YsQ0FBQztBQTlERCxzQkE4REM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixTQUFTLENBQVMsU0FBaUMsRUFBRSxPQUduRTtJQUVELElBQUksRUFBRSxhQUFhLEVBQUUsU0FBUyxHQUFHLDJCQUFnQixFQUFFLEdBQUcsQ0FBQyxPQUFPLElBQUksRUFBVSxDQUFDLENBQUM7SUFFOUUsYUFBYTtJQUNiLElBQUksT0FBTyxHQUFXLFNBQVMsQ0FBQyxPQUFPLElBQUksSUFBSTtRQUM5QyxhQUFhO1FBQ2IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPO1FBQ25CLGFBQWE7UUFDYixDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUN2RDtJQUVELE9BQU8sVUFBVSxDQUFDLFNBQVMsQ0FDMUIsVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUNuQixhQUFhO0lBQ2IsU0FBUyxDQUFDLElBQUk7SUFDZCxhQUFhO0lBQ2IsYUFBYSxDQUNiLENBQUE7QUFDRixDQUFDO0FBdEJELDhCQXNCQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IsVUFBVSxDQUFtQixZQUFlO0lBRTNELElBQUksWUFBWSxJQUFJLElBQUksRUFDeEI7UUFDQyxhQUFhO1FBQ2IsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFDakMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FDeEI7UUFFRCxhQUFhO1FBQ2IsT0FBTyxZQUFZLENBQUM7S0FDcEI7QUFDRixDQUFDO0FBWkQsZ0NBWUM7QUFxQkQsa0JBQWUsT0FBbUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSB1c2VyIG9uIDIwMTkvMi8xLzAwMS5cbiAqL1xuXG5pbXBvcnQgR3JheU1hdHRlciA9IHJlcXVpcmUoJ2dyYXktbWF0dGVyJyk7XG5pbXBvcnQgeyBJT3B0aW9uc1BhcnNlLCBtZGNvbmZfcGFyc2UsIHN0cmluZ2lmeSBhcyBtZGNvbmZfc3RyaW5naWZ5IH0gZnJvbSAnbm9kZS1ub3ZlbC1pbmZvJztcblxuZXhwb3J0IGludGVyZmFjZSBJT3B0aW9uczxJIGV4dGVuZHMgSUlucHV0LCBPVVQgZXh0ZW5kcyBhbnksIFBPLCBHTz5cbntcblx0LyoqXG5cdCAqIOWCs+e1piBncmF5LW1hdHRlciDnmoQgb3B0aW9uc1xuXHQgKiBAc2VlIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2dyYXktbWF0dGVyXG5cdCAqL1xuXHRtYXR0ZXJPcHRpb25zPzogR3JheU1hdHRlci5HcmF5TWF0dGVyT3B0aW9uPEksIEdPPixcblxuXHQvKipcblx0ICog6Ieq6KiCIG1kY29uZiDnmoTop6PmnpDlh73mlbhcblx0ICog6aCQ6Kit54uA5rOB5LiL54K6IG5vZGUtbm92ZWwtaW5mb1xuXHQgKi9cblx0cGFyc2VyPyhpbnB1dDogSSwgcGFyc2VPcHRpb25zPzogSVBhcnNlT3B0aW9uczxQTz4pOiBJT2JqZWN0PE9VVD4sXG5cdC8qKlxuXHQgKiDlgrPntaYgcGFyc2VyIOeahCBvcHRpb25zXG5cdCAqIOmgkOioreeLgOazgeS4i+eCuiBub2RlLW5vdmVsLWluZm8g55qEIElPcHRpb25zUGFyc2Vcblx0ICovXG5cdHBhcnNlT3B0aW9ucz86IElQYXJzZU9wdGlvbnM8UE8+LFxuXG5cdC8qKlxuXHQgKiDnlKjkvoblsIcgbWRjb25mIOi9ieaPm+WbniBtZCDnmoTlh73mlbhcblx0ICog6aCQ6Kit54uA5rOB5LiL54K6IG5vZGUtbm92ZWwtaW5mb1xuXHQgKi9cblx0c3RyaW5naWZ5PyhpbnB1dCk6IHN0cmluZyxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlPEkgZXh0ZW5kcyBJSW5wdXQsIEQsIE9VVCwgUE8sIEdPPihpbnB1dENvbnRlbnQ6IEksIG9wdGlvbnM/OiBJT3B0aW9uczxJLCBPVVQsIFBPLCBHTz4pXG57XG5cdGxldCB7IG1hdHRlck9wdGlvbnMsIHBhcnNlT3B0aW9ucywgcGFyc2VyID0gbWRjb25mX3BhcnNlIH0gPSAob3B0aW9ucyB8fCB7fSBhcyBudWxsKTtcblxuXG5cdGxldCBfc3RyaW5naWZ5ID0gb3B0aW9ucy5zdHJpbmdpZnkgfHwgbWRjb25mX3N0cmluZ2lmeTtcblxuXHRpZiAoaW5wdXRDb250ZW50ID09IG51bGwgfHwgdHlwZW9mIHN0cmluZ2lmeSAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgcGFyc2VyICE9PSAnZnVuY3Rpb24nKVxuXHR7XG5cdFx0bGV0IGUgPSBuZXcgVHlwZUVycm9yKGBgKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRlLmlucHV0Q29udGVudCA9IGlucHV0Q29udGVudDtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0ZS5fb3B0aW9ucyA9IG9wdGlvbnM7XG5cblx0XHR0aHJvdyBlXG5cdH1cblxuXHQvLyBAdHMtaWdub3JlXG5cdGlucHV0Q29udGVudCA9IGZpeENvbnRlbnQoaW5wdXRDb250ZW50KTtcblxuXHRsZXQgbWF0dGVyID0gR3JheU1hdHRlcihpbnB1dENvbnRlbnQsIG1hdHRlck9wdGlvbnMgYXMgYW55KTtcblx0Ly8gQHRzLWlnbm9yZVxuXHRsZXQgbWRjb25mID0gcGFyc2VyKGlucHV0Q29udGVudCwgcGFyc2VPcHRpb25zKTtcblxuXHRpZiAoIW1kY29uZiB8fCBtZGNvbmYgJiYgT2JqZWN0LmtleXMobWRjb25mKS5sZW5ndGggPT0gMClcblx0e1xuXHRcdG1kY29uZiA9IG51bGw7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdC8qKlxuXHRcdCAqIOe2k+eUsSBncmF5LW1hdHRlciDop6PmnpDlvoznmoTnianku7Zcblx0XHQgKi9cblx0XHRtYXR0ZXIsXG5cdFx0LyoqXG5cdFx0ICog5o6S6ZmkIEZyb250IE1hdHRlciDlvoznmoTljp/lp4vlhaflrrlcblx0XHQgKi9cblx0XHRjb250ZW50OiBtYXR0ZXIuY29udGVudCxcblx0XHQvKipcblx0XHQgKiBGcm9udCBNYXR0ZXIg6LOH5paZXG5cdFx0ICovXG5cdFx0ZGF0YTogbWF0dGVyLmRhdGEgYXMgSU9iamVjdDxEPixcblx0XHQvKipcblx0XHQgKiDlm57lgrPnmoQgbWRjb25mIOizh+aWmSDpoJDoqK3ngrogbm9kZS1ub3ZlbC1pbmZvXG5cdFx0ICog5aaC5p6c5Zue5YKz55qEIOeCuiB7fSDnqbrnianku7bliYfmnIPooqvovYnmj5vngrogbnVsbFxuXHRcdCAqL1xuXHRcdG1kY29uZixcblx0XHQvKipcblx0XHQgKiDnlKjkvoblsIflj5blvpfnmoTnianku7bovYnmj5vlm54gbWRcblx0XHQgKiDnlbYgY29udGVudCwgbWRjb25mIOWQjOaZguWtmOWcqOaZgiBjb250ZW50ID4gbWRjb25mXG5cdFx0ICovXG5cdFx0c3RyaW5naWZ5PFQxID0gRCwgVDIgPSBPVVQ+KGlucHV0RGF0YTogSVN0cmluZ2lmeURhdGE8VDEsIFQyPik6IHN0cmluZ1xuXHRcdHtcblx0XHRcdHJldHVybiBzdHJpbmdpZnk8VDEsIFQyPihpbnB1dERhdGEsIHtcblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRtYXR0ZXJPcHRpb25zLFxuXHRcdFx0XHRzdHJpbmdpZnk6IF9zdHJpbmdpZnksXG5cdFx0XHR9KVxuXHRcdH0sXG5cdH1cbn1cblxuLyoqXG4gKiDnlKjkvoblsIflj5blvpfnmoTnianku7bovYnmj5vlm54gbWRcbiAqIOeVtiBjb250ZW50LCBtZGNvbmYg5ZCM5pmC5a2Y5Zyo5pmCIGNvbnRlbnQgPiBtZGNvbmZcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeTxUMSwgVDI+KGlucHV0RGF0YTogSVN0cmluZ2lmeURhdGE8VDEsIFQyPiwgb3B0aW9ucz86IElPYmplY3Q8e1xuXHRtYXR0ZXJPcHRpb25zPzogR3JheU1hdHRlci5HcmF5TWF0dGVyT3B0aW9uPElJbnB1dCwgYW55Pixcblx0c3RyaW5naWZ5PyhpbnB1dCk6IHN0cmluZyxcbn0+KVxue1xuXHRsZXQgeyBtYXR0ZXJPcHRpb25zLCBzdHJpbmdpZnkgPSBtZGNvbmZfc3RyaW5naWZ5IH0gPSAob3B0aW9ucyB8fCB7fSBhcyBudWxsKTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGxldCBjb250ZW50OiBzdHJpbmcgPSBpbnB1dERhdGEuY29udGVudCAhPSBudWxsXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdD8gaW5wdXREYXRhLmNvbnRlbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0OiBpbnB1dERhdGEubWRjb25mID8gc3RyaW5naWZ5KGlucHV0RGF0YS5tZGNvbmYpIDogbnVsbFxuXHQ7XG5cblx0cmV0dXJuIEdyYXlNYXR0ZXIuc3RyaW5naWZ5KFxuXHRcdGZpeENvbnRlbnQoY29udGVudCksXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGlucHV0RGF0YS5kYXRhLFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRtYXR0ZXJPcHRpb25zLFxuXHQpXG59XG5cbi8qKlxuICog5bCHIGlucHV0Q29udGVudCDovYnngrogc3RyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaXhDb250ZW50PEkgZXh0ZW5kcyBJSW5wdXQ+KGlucHV0Q29udGVudDogSSk6IHN0cmluZ1xue1xuXHRpZiAoaW5wdXRDb250ZW50ICE9IG51bGwpXG5cdHtcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0aW5wdXRDb250ZW50ID0gU3RyaW5nKGlucHV0Q29udGVudClcblx0XHRcdC5yZXBsYWNlKC9eW1xcclxcbl0rLywgJycpXG5cdFx0O1xuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdHJldHVybiBpbnB1dENvbnRlbnQ7XG5cdH1cbn1cblxuLyoqXG4gKiDmnIDlvozomZXnkIbmmYIg6YO95pyD6KKr6L2J54K6IHN0cmluZ1xuICovXG5leHBvcnQgdHlwZSBJSW5wdXQgPSBCdWZmZXIgfCBzdHJpbmc7XG5leHBvcnQgdHlwZSBJUGFyc2VPcHRpb25zPFBPPiA9IChJT3B0aW9uc1BhcnNlIHwgb2JqZWN0KSB8IFBPO1xuXG4vKipcbiAqIOeVtiBjb250ZW50LCBtZGNvbmYg5ZCM5pmC5a2Y5Zyo5pmCIGNvbnRlbnQgPiBtZGNvbmZcbiAqL1xuZXhwb3J0IHR5cGUgSVN0cmluZ2lmeURhdGE8VCBleHRlbmRzIGFueSwgT1VUIGV4dGVuZHMgYW55PiA9IElPYmplY3Q8e1xuXHRkYXRhPzogSU9iamVjdDxUPixcbn0gJiAoeyBjb250ZW50OiBJSW5wdXQ7IH0gfCB7IG1kY29uZjogT1VULCB9KT47XG5cbmV4cG9ydCB0eXBlIElPYmplY3Q8VCBleHRlbmRzIGFueSwgQiBleHRlbmRzIHtcblx0W2tleTogc3RyaW5nXTogYW55XG59ID0ge1xuXHRba2V5OiBzdHJpbmddOiBhbnlcbn0+ID0gQiAmIFRcblxuZXhwb3J0IGRlZmF1bHQgZXhwb3J0cyBhcyB0eXBlb2YgaW1wb3J0KCcuL2luZGV4Jyk7XG4iXX0=