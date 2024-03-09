'use strict';

var gitDiffFrom = require('git-diff-from');
var upath2 = require('upath2');
var tslib = require('tslib');
var arrayHyperUniqueDecorator = require('@lazy-array/array-hyper-unique-decorator');

class NovelDiffFromLogParser {
  constructor(data) {
    this.data = data;
  }
  filterPathMains(filter) {
    return this.pathMains().filter(pathMain => filter(pathMain, this.data.list[pathMain])).reduce((a, b) => {
      a[b] = this.data.list[b];
      return a;
    }, {});
  }
  pathMains() {
    return Object.keys(this.data.list);
  }
  novelIDs() {
    return NovelDiffFromLogParser.novelIDs(this.data.list);
  }
  files(filter) {
    return NovelDiffFromLogParser.files(this.data.list, filter);
  }
  static novelIDs(list) {
    return Object.values(list).reduce((a, b) => {
      a.push(...Object.keys(b));
      return a;
    }, []);
  }
  static filterFiles(list, filter) {
    return list.filter(filter);
  }
  static files(list, filter) {
    let ls = Object.values(list).reduce((ls, listTop) => {
      Object.values(listTop).forEach(ls2 => {
        ls2.forEach(v => ls.push(v));
      });
      return ls;
    }, []);
    if (filter) {
      return NovelDiffFromLogParser.filterFiles(ls, filter);
    }
    return ls;
  }
}
tslib.__decorate([arrayHyperUniqueDecorator.ArrayUniqueDecorator(), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", []), tslib.__metadata("design:returntype", void 0)], NovelDiffFromLogParser.prototype, "pathMains", null);
tslib.__decorate([arrayHyperUniqueDecorator.ArrayUniqueDecorator(), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", []), tslib.__metadata("design:returntype", void 0)], NovelDiffFromLogParser.prototype, "novelIDs", null);
tslib.__decorate([arrayHyperUniqueDecorator.ArrayUniqueDecorator(), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Function]), tslib.__metadata("design:returntype", void 0)], NovelDiffFromLogParser.prototype, "files", null);
tslib.__decorate([arrayHyperUniqueDecorator.ArrayUniqueDecorator(), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object]), tslib.__metadata("design:returntype", void 0)], NovelDiffFromLogParser, "novelIDs", null);
tslib.__decorate([arrayHyperUniqueDecorator.ArrayUniqueDecorator(), tslib.__metadata("design:type", Function), tslib.__metadata("design:paramtypes", [Object, Function]), tslib.__metadata("design:returntype", void 0)], NovelDiffFromLogParser, "files", null);

const baseHashDefault = 5;
const targetTreeDefault = 'origin/master';
function novelDiffFromLog(options) {
  let {
    targetTree = targetTreeDefault,
    novelRoot = process.cwd(),
    baseHash = baseHashDefault
  } = options;
  novelRoot = upath2.resolve(novelRoot);
  let ls = gitDiffFrom.gitDiffFrom(baseHash, targetTree, {
    cwd: novelRoot
  });
  let ret = {
    novelRoot,
    baseHash,
    targetTree,
    list: {},
    range: {
      from: ls.from,
      to: ls.to
    },
    count: {
      main: 0,
      novel: 0,
      file: 0
    }
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
          var _a$pathMain;
          // @ts-ignore
          (_a$pathMain = a[pathMain])[novelID] || (_a$pathMain[novelID] = []);
          Object.defineProperties(a[pathMain][novelID], {
            pathMain: {
              enumerable: false,
              configurable: false,
              get() {
                return pathMain;
              }
            },
            novelID: {
              enumerable: false,
              configurable: false,
              get() {
                return novelID;
              }
            }
          });
        }
        a[pathMain][novelID].push(Object.assign(value, {
          pathMain,
          novelID,
          basename,
          subpath
        }));
        ret.count.file++;
      }
      return a;
    }, {});
  }
  return ret;
}

// @ts-ignore
module.exports = novelDiffFromLog;
//# sourceMappingURL=index.cjs.development.cjs.map
