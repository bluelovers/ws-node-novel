"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitVolumeSync = splitVolumeSync;
exports.splitChapterSync = splitChapterSync;
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
        let _m = (0, execall2_1.execall)(_r, txt, {
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
        let _m = (0, execall2_1.execall)(_r, txt, {
            cloneRegexp,
        });
        //console.log(_r, _m, txt);
        //console.log(cache.ix);
        if (!_m || !_m.length) {
            // @ts-ignore
            let id = (0, util_1.padIndex)(cache.ix++, 5, '0');
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
            let id = (0, util_1.padIndex)(ii, 5, '0');
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
            let id = (0, util_1.padIndex)(ii, 5, '0');
            let name = (0, util_1.fix_name)(m_last.match);
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
        let id = (0, util_1.padIndex)(ii, 5, '0');
        let name = (0, util_1.fix_name)(m_last.match);
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
//# sourceMappingURL=split.js.map