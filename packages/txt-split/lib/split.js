"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const execall2_1 = require("execall2");
const console_1 = require("./console");
function splitVolumeSync(txt, cache) {
    let _vs;
    txt = String(txt);
    if (!cache || !cache.chapter || !cache.chapter.r) {
        throw new RangeError(`options.chapter.r is required`);
    }
    if (cache.beforeStart) {
        cache.beforeStart(cache);
    }
    MAIN: if (cache.volume && !cache.volume.disable) {
        let _r = cache.volume.r;
        let _m = execall2_1.execall(_r, txt, {
            cloneRegexp,
        });
        //console.debug(_r, _m, txt);
        //console.debug(_r, _m, txt);
        if (!_m || !_m.length) {
            let msg = `volume match is empty ${_r}`;
            console_1.console.warn(msg);
            if (!cache.volume.allowNoMatch) {
                throw new Error(msg);
            }
            break MAIN;
        }
        //console.log(_r, _m, _r.test(txt));
        _vs = splitChapterSync(txt, cache, _m, cache.volume);
    }
    if (!_vs) {
        _vs = {};
        _vs['00000_unknow'] = txt;
    }
    let _out = {};
    // @ts-ignore
    cache.ix = 0;
    for (let vn in _vs) {
        let txt = _vs[vn];
        let _r = cache.chapter.r;
        let _m = execall2_1.execall(_r, txt, {
            cloneRegexp,
        });
        //console.log(_r, _m, txt);
        //console.log(cache.ix);
        if (!_m || !_m.length) {
            // @ts-ignore
            let id = util_1.padIndex(cache.ix++, 5, '0');
            _out[vn] = {};
            _out[vn][`${id}_unknow`] = txt;
            continue;
        }
        let _cs = splitChapterSync(txt, cache, _m, cache.chapter);
        _out[vn] = {};
        for (let cn in _cs) {
            _out[vn][cn] = _cs[cn];
        }
    }
    function cloneRegexp(re) {
        let flags = (re.flags || '');
        if (flags.indexOf('g') === -1) {
            flags += 'g';
        }
        // @ts-ignore
        let r = new (cache.useRegExpCJK || RegExp)(re, flags);
        return r;
    }
    //console.log(_out);
    return _out;
}
exports.splitVolumeSync = splitVolumeSync;
function splitChapterSync(txt, cache, _m, splitOption) {
    let _files = {};
    let idx = 0;
    let { cb, ignoreCb, ignoreRe, idxSkipIgnored } = splitOption;
    txt = String(txt);
    // @ts-ignore
    cache.txt = txt;
    let m_last;
    let i;
    let ix = cache.ix || 0;
    let ii;
    let ic = 0;
    let ic_all = cache.ic_all || 0;
    let ii_rebase = 0;
    let name_last;
    let has_unknow;
    let i_int;
    let i_ignored = 0;
    for (i in _m) {
        i_int = parseInt(i);
        ii = (i_int + ix - ii_rebase).toString();
        let m = _m[i];
        if (ignoreRe) {
            if (ignoreRe.test(m.match)) {
                i_ignored++;
                if (idxSkipIgnored) {
                    ii_rebase++;
                }
                /**
                 * @todo here maybe will has bug, need test
                 */
                continue;
            }
            ignoreRe.lastIndex = 0;
        }
        if (!m_last && idx == 0 && m.index != 0) {
            //console.log(m);
            let id = util_1.padIndex(ii, 5, '0');
            let name = 'unknow';
            if (ignoreCb && ignoreCb({
                i,
                id,
                name,
                m,
                m_last,
                _files,
                ii,
                cache,
                idx,
                ic,
                ic_all,
                ix,
            })) {
                i_ignored++;
                if (idxSkipIgnored) {
                    ii_rebase++;
                }
                continue;
            }
            if (cb) {
                let _ret = cb({
                    i,
                    id,
                    name,
                    m,
                    m_last,
                    _files,
                    ii,
                    cache,
                    idx,
                    ic,
                    ic_all,
                    ix,
                });
                if (_ret) {
                    id = _ret.id;
                    name = _ret.name;
                    idx = _ret.idx;
                }
            }
            let txt_clip = txt.slice(idx, m.index);
            name = id + '_' + name;
            if (txt_clip.length) {
                if (has_unknow == null && !txt_clip.replace(/\s+/g, '').length) {
                    has_unknow = false;
                    ii_rebase++;
                }
                else {
                    _files[name_last = name] = txt_clip;
                    ic++;
                    has_unknow = true;
                }
                idx = m.index;
            }
        }
        else if (m_last) {
            let id = util_1.padIndex(ii, 5, '0');
            let name = util_1.fix_name(m_last.match);
            if (ignoreCb && ignoreCb({
                i,
                id,
                name,
                m,
                m_last,
                _files,
                ii,
                cache,
                idx,
                ic,
                ic_all,
                ix,
            })) {
                i_ignored++;
                if (idxSkipIgnored) {
                    ii_rebase++;
                }
                continue;
            }
            if (cb) {
                let _ret = cb({
                    i,
                    id,
                    name,
                    m,
                    m_last,
                    _files,
                    ii,
                    cache,
                    idx,
                    ic,
                    ic_all,
                    ix,
                });
                if (_ret) {
                    id = _ret.id;
                    name = _ret.name;
                    idx = _ret.idx;
                }
            }
            let txt_clip = txt.slice(idx, m.index);
            name = id + '_' + name;
            if (txt_clip.length) {
                _files[name_last = name] = txt_clip;
                idx = m.index;
                ic++;
            }
        }
        m_last = m;
    }
    MAIN2: if (idx < txt.length - 1) {
        ii = (i_int + ix + 1 - ii_rebase).toString();
        let id = util_1.padIndex(ii, 5, '0');
        let name = util_1.fix_name(m_last.match);
        const id_old = id;
        let _skip;
        if (ignoreRe && ignoreRe.test(m_last.match)) {
            _skip = true;
        }
        else if (ignoreCb && ignoreCb({
            i,
            id,
            name,
            m: null,
            m_last,
            _files,
            ii,
            cache,
            idx,
            ic,
            ic_all,
            ix,
        })) {
            _skip = true;
        }
        if (_skip) {
            if (name_last == null) {
                let name = 'unknow';
                let name_last = id + '_' + name;
                _files[name_last] = txt.slice(idx);
            }
            else {
                _files[name_last] += txt.slice(idx);
            }
            break MAIN2;
        }
        if (cb) {
            let m;
            let _ret = cb({
                i,
                id,
                name,
                m,
                m_last,
                _files,
                ii,
                cache,
                idx,
                ic,
                ic_all,
                ix,
            });
            if (_ret) {
                id = _ret.id;
                name = _ret.name;
                idx = _ret.idx;
            }
        }
        name = (id !== '' ? id + '_' : '') + name;
        _files[name] = txt.slice(idx);
    }
    // @ts-ignore
    cache.ix = parseInt(ii) + 1;
    return _files;
}
exports.splitChapterSync = splitChapterSync;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BsaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcGxpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE0QztBQVk1Qyx1Q0FBbUM7QUFDbkMsdUNBQW9DO0FBRXBDLFNBQWdCLGVBQWUsQ0FBaUMsR0FBYSxFQUFFLEtBQVE7SUFFdEYsSUFBSSxHQUFpQixDQUFDO0lBRXRCLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFFbEIsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFDaEQ7UUFDQyxNQUFNLElBQUksVUFBVSxDQUFDLCtCQUErQixDQUFDLENBQUE7S0FDckQ7SUFFRCxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQ3JCO1FBQ0MsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN6QjtJQUVELElBQUksRUFDSixJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFDekM7UUFDQyxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUV4QixJQUFJLEVBQUUsR0FBRyxrQkFBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUU7WUFDekIsV0FBVztTQUNYLENBQUMsQ0FBQztRQUVILDZCQUE2QjtRQUM3Qiw2QkFBNkI7UUFFN0IsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQ3JCO1lBQ0MsSUFBSSxHQUFHLEdBQUcseUJBQXlCLEVBQUUsRUFBRSxDQUFDO1lBRXhDLGlCQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWxCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksRUFDOUI7Z0JBQ0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzth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ZW50IjpbImltcG9ydCB7IGZpeF9uYW1lLCBwYWRJbmRleCB9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQge1xuXHRJQ29udGV4dCxcblx0SURhdGFDaGFwdGVyLFxuXHRJRGF0YVZvbHVtZSxcblx0SU9wdGlvbnMsXG5cdElTcGxpdENhY2hlLFxuXHRJU3BsaXRDQixcblx0SVNwbGl0TWF0Y2gsXG5cdElTcGxpdE1hdGNoSXRlbSxcblx0SU9wdGlvbnNSZXF1aXJlZCwgSVNwbGl0T3B0aW9uLFxufSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQgeyBleGVjYWxsIH0gZnJvbSAnZXhlY2FsbDInO1xuaW1wb3J0IHsgY29uc29sZSB9IGZyb20gJy4vY29uc29sZSc7XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdFZvbHVtZVN5bmM8TyBleHRlbmRzIFBhcnRpYWw8SVNwbGl0Q2FjaGU+Pih0eHQ6IElDb250ZXh0LCBjYWNoZTogTyk6IElEYXRhVm9sdW1lXG57XG5cdGxldCBfdnM6IElEYXRhQ2hhcHRlcjtcblxuXHR0eHQgPSBTdHJpbmcodHh0KTtcblxuXHRpZiAoIWNhY2hlIHx8ICFjYWNoZS5jaGFwdGVyIHx8ICFjYWNoZS5jaGFwdGVyLnIpXG5cdHtcblx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihgb3B0aW9ucy5jaGFwdGVyLnIgaXMgcmVxdWlyZWRgKVxuXHR9XG5cblx0aWYgKGNhY2hlLmJlZm9yZVN0YXJ0KVxuXHR7XG5cdFx0Y2FjaGUuYmVmb3JlU3RhcnQoY2FjaGUpO1xuXHR9XG5cblx0TUFJTjpcblx0aWYgKGNhY2hlLnZvbHVtZSAmJiAhY2FjaGUudm9sdW1lLmRpc2FibGUpXG5cdHtcblx0XHRsZXQgX3IgPSBjYWNoZS52b2x1bWUucjtcblxuXHRcdGxldCBfbSA9IGV4ZWNhbGwoX3IsIHR4dCwge1xuXHRcdFx0Y2xvbmVSZWdleHAsXG5cdFx0fSk7XG5cblx0XHQvL2NvbnNvbGUuZGVidWcoX3IsIF9tLCB0eHQpO1xuXHRcdC8vY29uc29sZS5kZWJ1ZyhfciwgX20sIHR4dCk7XG5cblx0XHRpZiAoIV9tIHx8ICFfbS5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0bGV0IG1zZyA9IGB2b2x1bWUgbWF0Y2ggaXMgZW1wdHkgJHtfcn1gO1xuXG5cdFx0XHRjb25zb2xlLndhcm4obXNnKTtcblxuXHRcdFx0aWYgKCFjYWNoZS52b2x1bWUuYWxsb3dOb01hdGNoKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IobXNnKTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWsgTUFJTjtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKF9yLCBfbSwgX3IudGVzdCh0eHQpKTtcblxuXHRcdF92cyA9IHNwbGl0Q2hhcHRlclN5bmModHh0LCBjYWNoZSwgX20sIGNhY2hlLnZvbHVtZSk7XG5cdH1cblxuXHRpZiAoIV92cylcblx0e1xuXHRcdF92cyA9IHt9O1xuXHRcdF92c1snMDAwMDBfdW5rbm93J10gPSB0eHQ7XG5cdH1cblxuXHRsZXQgX291dDogSURhdGFWb2x1bWUgPSB7fTtcblxuXHQvLyBAdHMtaWdub3JlXG5cdGNhY2hlLml4ID0gMDtcblxuXHRmb3IgKGxldCB2biBpbiBfdnMpXG5cdHtcblx0XHRsZXQgdHh0ID0gX3ZzW3ZuXTtcblxuXHRcdGxldCBfciA9IGNhY2hlLmNoYXB0ZXIucjtcblx0XHRsZXQgX20gPSBleGVjYWxsKF9yLCB0eHQsIHtcblx0XHRcdGNsb25lUmVnZXhwLFxuXHRcdH0pO1xuXG5cdFx0Ly9jb25zb2xlLmxvZyhfciwgX20sIHR4dCk7XG5cblx0XHQvL2NvbnNvbGUubG9nKGNhY2hlLml4KTtcblxuXHRcdGlmICghX20gfHwgIV9tLmxlbmd0aClcblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRsZXQgaWQgPSBwYWRJbmRleChjYWNoZS5peCsrLCA1LCAnMCcpO1xuXG5cdFx0XHRfb3V0W3ZuXSA9IHt9O1xuXG5cdFx0XHRfb3V0W3ZuXVtgJHtpZH1fdW5rbm93YF0gPSB0eHQ7XG5cblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdGxldCBfY3MgPSBzcGxpdENoYXB0ZXJTeW5jKHR4dCwgY2FjaGUsIF9tLCBjYWNoZS5jaGFwdGVyKTtcblxuXHRcdF9vdXRbdm5dID0ge307XG5cblx0XHRmb3IgKGxldCBjbiBpbiBfY3MpXG5cdFx0e1xuXHRcdFx0X291dFt2bl1bY25dID0gX2NzW2NuXTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBjbG9uZVJlZ2V4cChyZSlcblx0e1xuXHRcdGxldCBmbGFncyA9IChyZS5mbGFncyB8fCAnJyk7XG5cblx0XHRpZiAoZmxhZ3MuaW5kZXhPZignZycpID09PSAtMSlcblx0XHR7XG5cdFx0XHRmbGFncyArPSAnZyc7XG5cdFx0fVxuXG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGxldCByID0gbmV3IChjYWNoZS51c2VSZWdFeHBDSksgfHwgUmVnRXhwKShyZSwgZmxhZ3MpO1xuXG5cdFx0cmV0dXJuIHJcblx0fVxuXG5cdC8vY29uc29sZS5sb2coX291dCk7XG5cblx0cmV0dXJuIF9vdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdENoYXB0ZXJTeW5jPE8gZXh0ZW5kcyBQYXJ0aWFsPElTcGxpdENhY2hlPj4odHh0OiBJQ29udGV4dCwgY2FjaGU6IE8sIF9tOiBJU3BsaXRNYXRjaCwgc3BsaXRPcHRpb246IElTcGxpdE9wdGlvbik6IElEYXRhQ2hhcHRlcjxzdHJpbmc+XG57XG5cdGxldCBfZmlsZXM6IElEYXRhQ2hhcHRlciA9IHt9O1xuXHRsZXQgaWR4ID0gMDtcblxuXHRsZXQgeyBjYiwgaWdub3JlQ2IsIGlnbm9yZVJlLCBpZHhTa2lwSWdub3JlZCB9ID0gc3BsaXRPcHRpb247XG5cblx0dHh0ID0gU3RyaW5nKHR4dCk7XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS50eHQgPSB0eHQ7XG5cblx0bGV0IG1fbGFzdDtcblxuXHRsZXQgaTogc3RyaW5nO1xuXHRsZXQgaXggPSBjYWNoZS5peCB8fCAwO1xuXHRsZXQgaWk6IHN0cmluZztcblx0bGV0IGljOiBudW1iZXIgPSAwO1xuXHRsZXQgaWNfYWxsID0gY2FjaGUuaWNfYWxsIHx8IDA7XG5cblx0bGV0IGlpX3JlYmFzZTogbnVtYmVyID0gMDtcblxuXHRsZXQgbmFtZV9sYXN0OiBzdHJpbmc7XG5cdGxldCBoYXNfdW5rbm93OiBib29sZWFuO1xuXHRsZXQgaV9pbnQ6IG51bWJlcjtcblxuXHRsZXQgaV9pZ25vcmVkOiBudW1iZXIgPSAwO1xuXG5cdGZvciAoaSBpbiBfbSlcblx0e1xuXHRcdGlfaW50ID0gcGFyc2VJbnQoaSk7XG5cblx0XHRpaSA9IChpX2ludCArIGl4IC0gaWlfcmViYXNlKS50b1N0cmluZygpO1xuXG5cdFx0bGV0IG0gPSBfbVtpXTtcblxuXHRcdGlmIChpZ25vcmVSZSlcblx0XHR7XG5cdFx0XHRpZiAoaWdub3JlUmUudGVzdChtLm1hdGNoKSlcblx0XHRcdHtcblx0XHRcdFx0aV9pZ25vcmVkKys7XG5cblx0XHRcdFx0aWYgKGlkeFNraXBJZ25vcmVkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWlfcmViYXNlKys7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvKipcblx0XHRcdFx0ICogQHRvZG8gaGVyZSBtYXliZSB3aWxsIGhhcyBidWcsIG5lZWQgdGVzdFxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlnbm9yZVJlLmxhc3RJbmRleCA9IDA7XG5cdFx0fVxuXG5cdFx0aWYgKCFtX2xhc3QgJiYgaWR4ID09IDAgJiYgbS5pbmRleCAhPSAwKVxuXHRcdHtcblx0XHRcdC8vY29uc29sZS5sb2cobSk7XG5cblx0XHRcdGxldCBpZCA9IHBhZEluZGV4KGlpLCA1LCAnMCcpO1xuXHRcdFx0bGV0IG5hbWUgPSAndW5rbm93JztcblxuXHRcdFx0aWYgKGlnbm9yZUNiICYmIGlnbm9yZUNiKHtcblx0XHRcdFx0aSxcblx0XHRcdFx0aWQsXG5cdFx0XHRcdG5hbWUsXG5cdFx0XHRcdG0sXG5cdFx0XHRcdG1fbGFzdCxcblx0XHRcdFx0X2ZpbGVzLFxuXHRcdFx0XHRpaSxcblx0XHRcdFx0Y2FjaGUsXG5cdFx0XHRcdGlkeCxcblxuXHRcdFx0XHRpYyxcblx0XHRcdFx0aWNfYWxsLFxuXHRcdFx0XHRpeCxcblx0XHRcdH0pKVxuXHRcdFx0e1xuXHRcdFx0XHRpX2lnbm9yZWQrKztcblxuXHRcdFx0XHRpZiAoaWR4U2tpcElnbm9yZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpaV9yZWJhc2UrKztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY2IpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBfcmV0ID0gY2Ioe1xuXHRcdFx0XHRcdGksXG5cdFx0XHRcdFx0aWQsXG5cdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRtLFxuXHRcdFx0XHRcdG1fbGFzdCxcblx0XHRcdFx0XHRfZmlsZXMsXG5cdFx0XHRcdFx0aWksXG5cdFx0XHRcdFx0Y2FjaGUsXG5cdFx0XHRcdFx0aWR4LFxuXG5cdFx0XHRcdFx0aWMsXG5cdFx0XHRcdFx0aWNfYWxsLFxuXHRcdFx0XHRcdGl4LFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoX3JldClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkID0gX3JldC5pZDtcblx0XHRcdFx0XHRuYW1lID0gX3JldC5uYW1lO1xuXHRcdFx0XHRcdGlkeCA9IF9yZXQuaWR4O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCB0eHRfY2xpcCA9IHR4dC5zbGljZShpZHgsIG0uaW5kZXgpO1xuXG5cdFx0XHRuYW1lID0gaWQgKyAnXycgKyBuYW1lO1xuXG5cdFx0XHRpZiAodHh0X2NsaXAubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaGFzX3Vua25vdyA9PSBudWxsICYmICF0eHRfY2xpcC5yZXBsYWNlKC9cXHMrL2csICcnKS5sZW5ndGgpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRoYXNfdW5rbm93ID0gZmFsc2U7XG5cblx0XHRcdFx0XHRpaV9yZWJhc2UrKztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRfZmlsZXNbbmFtZV9sYXN0ID0gbmFtZV0gPSB0eHRfY2xpcDtcblxuXHRcdFx0XHRcdGljKys7XG5cblx0XHRcdFx0XHRoYXNfdW5rbm93ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlkeCA9IG0uaW5kZXg7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2UgaWYgKG1fbGFzdClcblx0XHR7XG5cdFx0XHRsZXQgaWQgPSBwYWRJbmRleChpaSwgNSwgJzAnKTtcblx0XHRcdGxldCBuYW1lID0gZml4X25hbWUobV9sYXN0Lm1hdGNoKTtcblxuXHRcdFx0aWYgKGlnbm9yZUNiICYmIGlnbm9yZUNiKHtcblx0XHRcdFx0aSxcblx0XHRcdFx0aWQsXG5cdFx0XHRcdG5hbWUsXG5cdFx0XHRcdG0sXG5cdFx0XHRcdG1fbGFzdCxcblx0XHRcdFx0X2ZpbGVzLFxuXHRcdFx0XHRpaSxcblx0XHRcdFx0Y2FjaGUsXG5cdFx0XHRcdGlkeCxcblxuXHRcdFx0XHRpYyxcblx0XHRcdFx0aWNfYWxsLFxuXHRcdFx0XHRpeCxcblx0XHRcdH0pKVxuXHRcdFx0e1xuXHRcdFx0XHRpX2lnbm9yZWQrKztcblxuXHRcdFx0XHRpZiAoaWR4U2tpcElnbm9yZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpaV9yZWJhc2UrKztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY2IpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBfcmV0ID0gY2Ioe1xuXHRcdFx0XHRcdGksXG5cdFx0XHRcdFx0aWQsXG5cdFx0XHRcdFx0bmFtZSxcblx0XHRcdFx0XHRtLFxuXHRcdFx0XHRcdG1fbGFzdCxcblx0XHRcdFx0XHRfZmlsZXMsXG5cdFx0XHRcdFx0aWksXG5cdFx0XHRcdFx0Y2FjaGUsXG5cdFx0XHRcdFx0aWR4LFxuXG5cdFx0XHRcdFx0aWMsXG5cdFx0XHRcdFx0aWNfYWxsLFxuXHRcdFx0XHRcdGl4LFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoX3JldClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlkID0gX3JldC5pZDtcblx0XHRcdFx0XHRuYW1lID0gX3JldC5uYW1lO1xuXHRcdFx0XHRcdGlkeCA9IF9yZXQuaWR4O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCB0eHRfY2xpcCA9IHR4dC5zbGljZShpZHgsIG0uaW5kZXgpO1xuXG5cdFx0XHRuYW1lID0gaWQgKyAnXycgKyBuYW1lO1xuXG5cdFx0XHRpZiAodHh0X2NsaXAubGVuZ3RoKVxuXHRcdFx0e1xuXHRcdFx0XHRfZmlsZXNbbmFtZV9sYXN0ID0gbmFtZV0gPSB0eHRfY2xpcDtcblxuXHRcdFx0XHRpZHggPSBtLmluZGV4O1xuXG5cdFx0XHRcdGljKys7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bV9sYXN0ID0gbTtcblx0fVxuXG5cdE1BSU4yOlxuXHRpZiAoaWR4IDwgdHh0Lmxlbmd0aCAtIDEpXG5cdHtcblx0XHRpaSA9IChpX2ludCArIGl4ICsgMSAtIGlpX3JlYmFzZSkudG9TdHJpbmcoKTtcblxuXHRcdGxldCBpZCA9IHBhZEluZGV4KGlpLCA1LCAnMCcpO1xuXHRcdGxldCBuYW1lID0gZml4X25hbWUobV9sYXN0Lm1hdGNoKTtcblxuXHRcdGNvbnN0IGlkX29sZCA9IGlkO1xuXG5cdFx0bGV0IF9za2lwOiBib29sZWFuO1xuXG5cdFx0aWYgKGlnbm9yZVJlICYmIGlnbm9yZVJlLnRlc3QobV9sYXN0Lm1hdGNoKSlcblx0XHR7XG5cdFx0XHRfc2tpcCA9IHRydWU7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGlnbm9yZUNiICYmIGlnbm9yZUNiKHtcblx0XHRcdGksXG5cdFx0XHRpZCxcblx0XHRcdG5hbWUsXG5cdFx0XHRtOiBudWxsLFxuXHRcdFx0bV9sYXN0LFxuXHRcdFx0X2ZpbGVzLFxuXHRcdFx0aWksXG5cdFx0XHRjYWNoZSxcblx0XHRcdGlkeCxcblxuXHRcdFx0aWMsXG5cdFx0XHRpY19hbGwsXG5cdFx0XHRpeCxcblx0XHR9KSlcblx0XHR7XG5cdFx0XHRfc2tpcCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKF9za2lwKVxuXHRcdHtcblx0XHRcdGlmIChuYW1lX2xhc3QgPT0gbnVsbClcblx0XHRcdHtcblx0XHRcdFx0bGV0IG5hbWUgPSAndW5rbm93Jztcblx0XHRcdFx0bGV0IG5hbWVfbGFzdCA9IGlkICsgJ18nICsgbmFtZTtcblxuXHRcdFx0XHRfZmlsZXNbbmFtZV9sYXN0XSA9IHR4dC5zbGljZShpZHgpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRfZmlsZXNbbmFtZV9sYXN0XSArPSB0eHQuc2xpY2UoaWR4KTtcblx0XHRcdH1cblxuXHRcdFx0YnJlYWsgTUFJTjI7XG5cdFx0fVxuXG5cdFx0aWYgKGNiKVxuXHRcdHtcblx0XHRcdGxldCBtO1xuXG5cdFx0XHRsZXQgX3JldCA9IGNiKHtcblx0XHRcdFx0aSxcblx0XHRcdFx0aWQsXG5cdFx0XHRcdG5hbWUsXG5cdFx0XHRcdG0sXG5cdFx0XHRcdG1fbGFzdCxcblx0XHRcdFx0X2ZpbGVzLFxuXHRcdFx0XHRpaSxcblx0XHRcdFx0Y2FjaGUsXG5cdFx0XHRcdGlkeCxcblxuXHRcdFx0XHRpYyxcblx0XHRcdFx0aWNfYWxsLFxuXHRcdFx0XHRpeCxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoX3JldClcblx0XHRcdHtcblx0XHRcdFx0aWQgPSBfcmV0LmlkO1xuXHRcdFx0XHRuYW1lID0gX3JldC5uYW1lO1xuXHRcdFx0XHRpZHggPSBfcmV0LmlkeDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRuYW1lID0gKGlkICE9PSAnJyA/IGlkICsgJ18nIDogJycpICsgbmFtZTtcblxuXHRcdF9maWxlc1tuYW1lXSA9IHR4dC5zbGljZShpZHgpO1xuXHR9XG5cblx0Ly8gQHRzLWlnbm9yZVxuXHRjYWNoZS5peCA9IHBhcnNlSW50KGlpKSArIDE7XG5cblx0cmV0dXJuIF9maWxlcztcbn1cbiJdfQ==