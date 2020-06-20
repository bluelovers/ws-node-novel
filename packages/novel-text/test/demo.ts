/**
 * Created by user on 2018/2/9/009.
 */

import novelText, { ITextLayoutOptions } from '../';
import fs from 'fs-extra';

let text = '';
let options: ITextLayoutOptions = {
	allow_lf2: false,
	allow_lf3: true,
};

text = fs.readFileSync('D:/Users/Documents/The Project/nodejs-test/node-novel2/dist_novel/user/黑之魔王/00270_第２７章：アイシテル/第５３０話　新たなる防具を求めて.txt').toString();

let new_text = novelText.toStr(text);

new_text = novelText.textlayout(new_text, options);
//new_text = novelText.replace(new_text, {
//	words: true,
//});
//new_text = novelText.trim(new_text);

console.log(new_text);
