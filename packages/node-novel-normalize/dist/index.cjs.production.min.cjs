"use strict";

var e = require("@lazy-cjk/str-util-trim"), r = require("@lazy-cjk/zh2num"), l = require("@lazy-cjk/fullhalf"), a = require("normalize-num"), i = require("@lazy-cjk/novel-filename"), n = require("@lazy-cjk/zh-slugify");

function normalize_val(t, u = 5, c = {}) {
  return u = u || c.padNum, t = i.filename(t), /^(?:序|プロローグ|Prologue)/i.test(t) && (t = "0_" + t), 
  t = t.replace(/^(web)版(\d+)/i, "$1$2"), t = l.toHalfWidth(t).toLowerCase(), t = e.trim(t, "　"), 
  t = r.zh2num(t).toString(), t = r.zh2num(t, {
    truncateOne: 2,
    flags: "ug"
  }).toString(), t = (t = (t = a.str2num(t, {
    all: !0,
    roman: c.checkRoman
  })).replace(/\d+/g, (function(e) {
    return e.padStart(u, "0");
  }))).replace(/^第+/, "").replace(/[―—－──\-―—─＝=―——─ー─]/g, "_").replace(/[\s　]/g, "_").replace(/[\(\)〔［【《（「『』」》）】〕］〔［〕］]/g, "_").replace(/[·‧・···•・·᛫•․‧∙⋅⸱⸳・ꞏ·‧・···•˙●‧﹒]/g, "_").replace(/[：：︰﹕：︓∶:]/gu, "_").replace(/[・:,]/g, "_").replace(/_+$/g, "").replace(/_+/g, "_"), 
  n.slugify(t, !0);
}

Object.defineProperty(normalize_val, "__esModule", {
  value: !0
}), Object.defineProperty(normalize_val, "normalize_val", {
  value: normalize_val
}), Object.defineProperty(normalize_val, "default", {
  value: normalize_val
}), Object.defineProperty(normalize_val, "normalize_strip", {
  value: function normalize_strip(r, l) {
    return l ? (/^p?\d{4,}[\s_](.+)(_\(\d+\))$/.exec(r) || /^p?\d{4,}[\s_](.+)(_\(\d+\))?$/.exec(r)) && (r = RegExp.$1) : (/^\d+_(.+)\.\d+$/.exec(r) || /^c?\d{4,}_(.+)$/.exec(r)) && (r = RegExp.$1), 
    e.trim(r, "　");
  }
}), module.exports = normalize_val;
//# sourceMappingURL=index.cjs.production.min.cjs.map
