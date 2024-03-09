import { gitDiffFrom as e } from "git-diff-from";

import { resolve as t } from "upath2";

import { __decorate as r, __metadata as o } from "tslib";

import { ArrayUniqueDecorator as i } from "@lazy-array/array-hyper-unique-decorator";

class NovelDiffFromLogParser {
  constructor(e) {
    this.data = e;
  }
  filterPathMains(e) {
    return this.pathMains().filter((t => e(t, this.data.list[t]))).reduce(((e, t) => (e[t] = this.data.list[t], 
    e)), {});
  }
  pathMains() {
    return Object.keys(this.data.list);
  }
  novelIDs() {
    return NovelDiffFromLogParser.novelIDs(this.data.list);
  }
  files(e) {
    return NovelDiffFromLogParser.files(this.data.list, e);
  }
  static novelIDs(e) {
    return Object.values(e).reduce(((e, t) => (e.push(...Object.keys(t)), e)), []);
  }
  static filterFiles(e, t) {
    return e.filter(t);
  }
  static files(e, t) {
    let r = Object.values(e).reduce(((e, t) => (Object.values(t).forEach((t => {
      t.forEach((t => e.push(t)));
    })), e)), []);
    return t ? NovelDiffFromLogParser.filterFiles(r, t) : r;
  }
}

r([ i(), o("design:type", Function), o("design:paramtypes", []), o("design:returntype", void 0) ], NovelDiffFromLogParser.prototype, "pathMains", null), 
r([ i(), o("design:type", Function), o("design:paramtypes", []), o("design:returntype", void 0) ], NovelDiffFromLogParser.prototype, "novelIDs", null), 
r([ i(), o("design:type", Function), o("design:paramtypes", [ Function ]), o("design:returntype", void 0) ], NovelDiffFromLogParser.prototype, "files", null), 
r([ i(), o("design:type", Function), o("design:paramtypes", [ Object ]), o("design:returntype", void 0) ], NovelDiffFromLogParser, "novelIDs", null), 
r([ i(), o("design:type", Function), o("design:paramtypes", [ Object, Function ]), o("design:returntype", void 0) ], NovelDiffFromLogParser, "files", null);

const n = 5, s = "origin/master";

function novelDiffFromLog(r) {
  let {targetTree: o = s, novelRoot: i = process.cwd(), baseHash: a = n} = r;
  i = t(i);
  let l = e(a, o, {
    cwd: i
  }), f = {
    novelRoot: i,
    baseHash: a,
    targetTree: o,
    list: {},
    range: {
      from: l.from,
      to: l.to
    },
    count: {
      main: 0,
      novel: 0,
      file: 0
    }
  };
  return l.length && (f.list = l.reduce((function(e, t) {
    let r = t.path.split(/[\\\/]/);
    if (r.length > 2) {
      let i = r[0], n = r[1], s = r[r.length - 1], a = r.slice(2).join("/");
      var o;
      e[i] || f.count.main++, e[i] = e[i] || {}, e[i][n] || f.count.novel++, null == e[i][n] && ((o = e[i])[n] || (o[n] = []), 
      Object.defineProperties(e[i][n], {
        pathMain: {
          enumerable: !1,
          configurable: !1,
          get: () => i
        },
        novelID: {
          enumerable: !1,
          configurable: !1,
          get: () => n
        }
      })), e[i][n].push(Object.assign(t, {
        pathMain: i,
        novelID: n,
        basename: s,
        subpath: a
      })), f.count.file++;
    }
    return e;
  }), {})), f;
}

export { NovelDiffFromLogParser, novelDiffFromLog as default, novelDiffFromLog };
//# sourceMappingURL=index.esm.mjs.map
