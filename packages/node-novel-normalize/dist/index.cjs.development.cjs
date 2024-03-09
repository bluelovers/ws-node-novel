'use strict';

var strUtilTrim = require('@lazy-cjk/str-util-trim');
var zh2num = require('@lazy-cjk/zh2num');
var fullhalf = require('@lazy-cjk/fullhalf');
var normalizeNum = require('normalize-num');
var novelFilename = require('@lazy-cjk/novel-filename');
var zhSlugify = require('@lazy-cjk/zh-slugify');

function normalize_strip(str, isDir) {
  if (isDir) {
    if (/^p?\d{4,}[\s_](.+)(_\(\d+\))$/.exec(str)) {
      str = RegExp.$1;
    } else if (/^p?\d{4,}[\s_](.+)(_\(\d+\))?$/.exec(str)) {
      str = RegExp.$1;
    }
  } else {
    if (/^\d+_(.+)\.\d+$/.exec(str)) {
      str = RegExp.$1;
    } else if (/^c?\d{4,}_(.+)$/.exec(str)) {
      str = RegExp.$1;
    }
  }
  str = strUtilTrim.trim(str, '　');
  return str;
}
function normalize_val(str, padNum = 5, options = {}) {
  padNum = padNum || options.padNum;
  str = novelFilename.filename(str);
  if (/^(?:序|プロローグ|Prologue)/i.test(str)) {
    str = '0_' + str;
  }
  str = str.replace(/^(web)版(\d+)/i, '$1$2');
  str = fullhalf.toHalfWidth(str).toLowerCase();
  str = strUtilTrim.trim(str, '　');
  str = zh2num.zh2num(str).toString();
  str = zh2num.zh2num(str, {
    truncateOne: 2,
    flags: 'ug'
  }).toString();
  str = normalizeNum.str2num(str, {
    all: true,
    roman: options.checkRoman
  });
  str = str.replace(/\d+/g, function ($0) {
    return $0.padStart(padNum, '0');
  });
  str = str.replace(/^第+/, '').replace(/[―—－──\-―—─＝=―——─ー─]/g, '_').replace(/[\s　]/g, '_').replace(/[\(\)〔［【《（「『』」》）】〕］〔［〕］]/g, '_').replace(/[·‧・···•・·᛫•․‧∙⋅⸱⸳・ꞏ·‧・···•˙●‧﹒]/g, '_').replace(/[：：︰﹕：︓∶:]/ug, '_').replace(/[・:,]/g, '_').replace(/_+$/g, '').replace(/_+/g, '_');
  str = zhSlugify.slugify(str, true);
  return str;
}
// @ts-ignore
{
  Object.defineProperty(normalize_val, "__esModule", {
    value: true
  });
  Object.defineProperty(normalize_val, 'normalize_val', {
    value: normalize_val
  });
  Object.defineProperty(normalize_val, 'default', {
    value: normalize_val
  });
  Object.defineProperty(normalize_val, 'normalize_strip', {
    value: normalize_strip
  });
}

// @ts-ignore
module.exports = normalize_val;
//# sourceMappingURL=index.cjs.development.cjs.map
