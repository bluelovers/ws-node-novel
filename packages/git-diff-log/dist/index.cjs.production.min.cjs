"use strict";

var e = require("git-diff-from"), t = require("upath2"), a = require("tslib"), r = require("@lazy-array/array-hyper-unique-decorator");

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
    let a = Object.values(e).reduce(((e, t) => (Object.values(t).forEach((t => {
      t.forEach((t => e.push(t)));
    })), e)), []);
    return t ? NovelDiffFromLogParser.filterFiles(a, t) : a;
  }
}

a.__decorate([ r.ArrayUniqueDecorator(), a.__metadata("design:type", Function), a.__metadata("design:paramtypes", []), a.__metadata("design:returntype", void 0) ], NovelDiffFromLogParser.prototype, "pathMains", null), 
a.__decorate([ r.ArrayUniqueDecorator(), a.__metadata("design:type", Function), a.__metadata("design:paramtypes", []), a.__metadata("design:returntype", void 0) ], NovelDiffFromLogParser.prototype, "novelIDs", null), 
a.__decorate([ r.ArrayUniqueDecorator(), a.__metadata("design:type", Function), a.__metadata("design:paramtypes", [ Function ]), a.__metadata("design:returntype", void 0) ], NovelDiffFromLogParser.prototype, "files", null), 
a.__decorate([ r.ArrayUniqueDecorator(), a.__metadata("design:type", Function), a.__metadata("design:paramtypes", [ Object ]), a.__metadata("design:returntype", void 0) ], NovelDiffFromLogParser, "novelIDs", null), 
a.__decorate([ r.ArrayUniqueDecorator(), a.__metadata("design:type", Function), a.__metadata("design:paramtypes", [ Object, Function ]), a.__metadata("design:returntype", void 0) ], NovelDiffFromLogParser, "files", null);

const o = 5, i = "origin/master";

module.exports = function novelDiffFromLog(a) {
  let {targetTree: r = i, novelRoot: n = process.cwd(), baseHash: s = o} = a;
  n = t.resolve(n);
  let l = e.gitDiffFrom(s, r, {
    cwd: n
  }), u = {
    novelRoot: n,
    baseHash: s,
    targetTree: r,
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
  return l.length && (u.list = l.reduce((function(e, t) {
    let a = t.path.split(/[\\\/]/);
    if (a.length > 2) {
      let o = a[0], i = a[1], n = a[a.length - 1], s = a.slice(2).join("/");
      var r;
      e[o] || u.count.main++, e[o] = e[o] || {}, e[o][i] || u.count.novel++, null == e[o][i] && ((r = e[o])[i] || (r[i] = []), 
      Object.defineProperties(e[o][i], {
        pathMain: {
          enumerable: !1,
          configurable: !1,
          get: () => o
        },
        novelID: {
          enumerable: !1,
          configurable: !1,
          get: () => i
        }
      })), e[o][i].push(Object.assign(t, {
        pathMain: o,
        novelID: i,
        basename: n,
        subpath: s
      })), u.count.file++;
    }
    return e;
  }), {})), u;
};
//# sourceMappingURL=index.cjs.production.min.cjs.map
