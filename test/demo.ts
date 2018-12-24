/**
 * Created by user on 2018/2/9/009.
 */

import novelText from '../';
import fs = require('fs-extra');

let text = '';
let options = {};

text = fs.readFileSync('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user/黑之魔王/00270_第２７章：アイシテル/第５２８話　戦功交渉.txt').toString();

let new_text = novelText.toStr(text);

new_text = novelText.textlayout(new_text, options);
//new_text = novelText.replace(new_text, {
//	words: true,
//});
//new_text = novelText.trim(new_text);

console.log(new_text);

