import { trim as e } from "@lazy-cjk/str-util-trim";

import { zh2num as r } from "@lazy-cjk/zh2num";

import { toHalfWidth as a } from "@lazy-cjk/fullhalf";

import { str2num as l } from "normalize-num";

import { filename as o } from "@lazy-cjk/novel-filename";

import { slugify as t } from "@lazy-cjk/zh-slugify";

function normalize_strip(r, a) {
  return a ? (/^p?\d{4,}[\s_](.+)(_\(\d+\))$/.exec(r) || /^p?\d{4,}[\s_](.+)(_\(\d+\))?$/.exec(r)) && (r = RegExp.$1) : (/^\d+_(.+)\.\d+$/.exec(r) || /^c?\d{4,}_(.+)$/.exec(r)) && (r = RegExp.$1), 
  e(r, "　");
}

function normalize_val(c, p = 5, i = {}) {
  return p = p || i.padNum, c = o(c), /^(?:序|プロローグ|Prologue)/i.test(c) && (c = "0_" + c), 
  c = c.replace(/^(web)版(\d+)/i, "$1$2"), c = a(c).toLowerCase(), c = e(c, "　"), c = r(c).toString(), 
  c = r(c, {
    truncateOne: 2,
    flags: "ug"
  }).toString(), c = (c = (c = l(c, {
    all: !0,
    roman: i.checkRoman
  })).replace(/\d+/g, (function(e) {
    return e.padStart(p, "0");
  }))).replace(/^第+/, "").replace(/[―—－──\-―—─＝=―——─ー─]/g, "_").replace(/[\s　]/g, "_").replace(/[\(\)〔［【《（「『』」》）】〕］〔［〕］]/g, "_").replace(/[·‧・···•・·᛫•․‧∙⋅⸱⸳・ꞏ·‧・···•˙●‧﹒]/g, "_").replace(/[：：︰﹕：︓∶:]/gu, "_").replace(/[・:,]/g, "_").replace(/_+$/g, "").replace(/_+/g, "_"), 
  t(c, !0);
}

export { normalize_val as default, normalize_strip, normalize_val };
//# sourceMappingURL=index.esm.mjs.map
