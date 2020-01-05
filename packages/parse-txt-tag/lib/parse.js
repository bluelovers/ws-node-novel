"use strict";
/**
 * Created by user on 2020/1/4.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tags_1 = require("./tags");
const fullhalf_1 = require("str-util/lib/fullhalf");
const util_1 = require("./util");
function parse(source, options) {
    let context = source;
    const { cache = {}, attach = {} } = options;
    attach.images = attach.images || {};
    if (options.on) {
        context = context
            .replace(tags_1.reTxtHtmlTag, (s, tagName = '', attr = '', innerContext = '') => {
            tagName = fullhalf_1.toHalfWidth(tagName).toLowerCase();
            let cb = options.on[tagName] || options.on.default;
            if (tagName === 'ruby') {
                innerContext = util_1._fixRubyInnerContext(innerContext);
            }
            if (cb) {
                let ret = cb({
                    tagName,
                    attr,
                    innerContext,
                    cache,
                    attach,
                });
                if (ret != null) {
                    return ret;
                }
            }
            return `<${tagName}>` + innerContext + `</${tagName}>`;
        });
        let tagName = 'img';
        let cb = (options.on[tagName] || options.on.default);
        if (cb) {
            context = context
                .replace(tags_1.reTxtImgTag, (s, id) => {
                let ret = cb({
                    tagName,
                    attr: '',
                    innerContext: id,
                    cache,
                    attach,
                });
                if (ret != null) {
                    return ret;
                }
                return s;
            });
        }
    }
    return {
        context,
        cache,
        attach,
    };
}
exports.parse = parse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYXJzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7O0dBRUc7O0FBRUgsaUNBQXdFO0FBQ3hFLG9EQUFvRDtBQUNwRCxpQ0FBOEM7QUFHOUMsU0FBZ0IsS0FBSyxDQUErRyxNQUFjLEVBQUUsT0FBK0I7SUFFbEwsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBRXJCLE1BQU0sRUFBRSxLQUFLLEdBQUcsRUFBTyxFQUFFLE1BQU0sR0FBRyxFQUFPLEVBQUUsR0FBRyxPQUFPLENBQUM7SUFDdEQsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztJQUVwQyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEVBQ2Q7UUFDQyxPQUFPLEdBQUcsT0FBTzthQUNmLE9BQU8sQ0FBQyxtQkFBWSxFQUFFLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBeUIsRUFBRSxJQUFJLEdBQUcsRUFBRSxFQUFFLFlBQVksR0FBRyxFQUFFLEVBQUUsRUFBRTtZQUcvRixPQUFPLEdBQUcsc0JBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUU3QyxJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDO1lBRW5ELElBQUksT0FBTyxLQUFLLE1BQU0sRUFDdEI7Z0JBQ0MsWUFBWSxHQUFHLDJCQUFvQixDQUFDLFlBQVksQ0FBQyxDQUFBO2FBQ2pEO1lBRUQsSUFBSSxFQUFFLEVBQ047Z0JBQ0MsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO29CQUNaLE9BQU87b0JBQ1AsSUFBSTtvQkFDSixZQUFZO29CQUNaLEtBQUs7b0JBQ0wsTUFBTTtpQkFDTixDQUFDLENBQUM7Z0JBRUgsSUFBSSxHQUFHLElBQUksSUFBSSxFQUNmO29CQUNDLE9BQU8sR0FBRyxDQUFDO2lCQUNYO2FBQ0Q7WUFFRCxPQUFPLElBQUksT0FBTyxHQUFHLEdBQUcsWUFBWSxHQUFHLEtBQUssT0FBTyxHQUFHLENBQUM7UUFDeEQsQ0FBQyxDQUFDLENBQ0Y7UUFFRCxJQUFJLE9BQU8sR0FBRyxLQUFjLENBQUM7UUFDN0IsSUFBSSxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBMkMsQ0FBQyxDQUFDO1FBRXpGLElBQUksRUFBRSxFQUNOO1lBQ0MsT0FBTyxHQUFHLE9BQU87aUJBQ2YsT0FBTyxDQUFDLGtCQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBVSxFQUFFLEVBQUU7Z0JBR3ZDLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztvQkFDWixPQUFPO29CQUNQLElBQUksRUFBRSxFQUFFO29CQUNSLFlBQVksRUFBRSxFQUFFO29CQUNoQixLQUFLO29CQUNMLE1BQU07aUJBQ04sQ0FBQyxDQUFDO2dCQUVILElBQUksR0FBRyxJQUFJLElBQUksRUFDZjtvQkFDQyxPQUFPLEdBQUcsQ0FBQztpQkFDWDtnQkFFRCxPQUFPLENBQUMsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUNGO1NBQ0Q7S0FDRDtJQUVELE9BQU87UUFDTixPQUFPO1FBQ1AsS0FBSztRQUNMLE1BQU07S0FDTixDQUFDO0FBQ0gsQ0FBQztBQTNFRCxzQkEyRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZWQgYnkgdXNlciBvbiAyMDIwLzEvNC5cbiAqL1xuXG5pbXBvcnQgeyByZVR4dEh0bWxUYWcsIHJlVHh0SW1nVGFnLCBJQWxsb3dlZEh0bWxUYWdMaXN0IH0gZnJvbSAnLi90YWdzJztcbmltcG9ydCB7IHRvSGFsZldpZHRoIH0gZnJvbSAnc3RyLXV0aWwvbGliL2Z1bGxoYWxmJztcbmltcG9ydCB7IF9maXhSdWJ5SW5uZXJDb250ZXh0IH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7IElQYXJzZU9wdGlvbnMsIElQYXJzZU9uVGFnLCBJUGFyc2VPbk1hcENhbGxiYWNrLCBJUGFyc2VDYWNoZU1hcCwgSUF0dGFjaE1hcCB9IGZyb20gJy4vdHlwZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2U8QyBleHRlbmRzIElQYXJzZUNhY2hlTWFwID0gSVBhcnNlQ2FjaGVNYXAsIEEgZXh0ZW5kcyBJQXR0YWNoTWFwID0gSUF0dGFjaE1hcCwgVCBleHRlbmRzIHN0cmluZyA9IElQYXJzZU9uVGFnPihzb3VyY2U6IHN0cmluZywgb3B0aW9uczogSVBhcnNlT3B0aW9uczxDLCBBLCBUPilcbntcblx0bGV0IGNvbnRleHQgPSBzb3VyY2U7XG5cblx0Y29uc3QgeyBjYWNoZSA9IHt9IGFzIEMsIGF0dGFjaCA9IHt9IGFzIEEgfSA9IG9wdGlvbnM7XG5cdGF0dGFjaC5pbWFnZXMgPSBhdHRhY2guaW1hZ2VzIHx8IHt9O1xuXG5cdGlmIChvcHRpb25zLm9uKVxuXHR7XG5cdFx0Y29udGV4dCA9IGNvbnRleHRcblx0XHRcdC5yZXBsYWNlKHJlVHh0SHRtbFRhZywgKHMsIHRhZ05hbWUgPSAnJyBhcyBJQWxsb3dlZEh0bWxUYWdMaXN0LCBhdHRyID0gJycsIGlubmVyQ29udGV4dCA9ICcnKSA9PlxuXHRcdFx0e1xuXG5cdFx0XHRcdHRhZ05hbWUgPSB0b0hhbGZXaWR0aCh0YWdOYW1lKS50b0xvd2VyQ2FzZSgpO1xuXG5cdFx0XHRcdGxldCBjYiA9IG9wdGlvbnMub25bdGFnTmFtZV0gfHwgb3B0aW9ucy5vbi5kZWZhdWx0O1xuXG5cdFx0XHRcdGlmICh0YWdOYW1lID09PSAncnVieScpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpbm5lckNvbnRleHQgPSBfZml4UnVieUlubmVyQ29udGV4dChpbm5lckNvbnRleHQpXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY2IpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgcmV0ID0gY2Ioe1xuXHRcdFx0XHRcdFx0dGFnTmFtZSxcblx0XHRcdFx0XHRcdGF0dHIsXG5cdFx0XHRcdFx0XHRpbm5lckNvbnRleHQsXG5cdFx0XHRcdFx0XHRjYWNoZSxcblx0XHRcdFx0XHRcdGF0dGFjaCxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmIChyZXQgIT0gbnVsbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBgPCR7dGFnTmFtZX0+YCArIGlubmVyQ29udGV4dCArIGA8LyR7dGFnTmFtZX0+YDtcblx0XHRcdH0pXG5cdFx0O1xuXG5cdFx0bGV0IHRhZ05hbWUgPSAnaW1nJyBhcyBjb25zdDtcblx0XHRsZXQgY2IgPSAob3B0aW9ucy5vblt0YWdOYW1lXSB8fCBvcHRpb25zLm9uLmRlZmF1bHQgYXMgSVBhcnNlT25NYXBDYWxsYmFjazxDLCBBLCAnaW1nJz4pO1xuXG5cdFx0aWYgKGNiKVxuXHRcdHtcblx0XHRcdGNvbnRleHQgPSBjb250ZXh0XG5cdFx0XHRcdC5yZXBsYWNlKHJlVHh0SW1nVGFnLCAocywgaWQ6IHN0cmluZykgPT5cblx0XHRcdFx0e1xuXG5cdFx0XHRcdFx0bGV0IHJldCA9IGNiKHtcblx0XHRcdFx0XHRcdHRhZ05hbWUsXG5cdFx0XHRcdFx0XHRhdHRyOiAnJyxcblx0XHRcdFx0XHRcdGlubmVyQ29udGV4dDogaWQsXG5cdFx0XHRcdFx0XHRjYWNoZSxcblx0XHRcdFx0XHRcdGF0dGFjaCxcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmIChyZXQgIT0gbnVsbClcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmV0O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBzO1xuXHRcdFx0XHR9KVxuXHRcdFx0O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y29udGV4dCxcblx0XHRjYWNoZSxcblx0XHRhdHRhY2gsXG5cdH07XG59XG4iXX0=