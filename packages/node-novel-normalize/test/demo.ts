/**
 * Created by user on 2019/2/20.
 */

import { normalize_strip, normalize_val } from '@node-novel/normalize';

let text = '00090_2章 不希望獨占的日子結束的面具工薪族版_二百四十四話　逐漸増加的春季預予于於定.txt';

// => 2章 不希望獨占的日子結束的面具工薪族版_二百四十四話　逐漸増加的春季預予于於定.txt
console.log(normalize_strip(text));

// => 00090_00002章_不希望独佔の日子結束の面具工薪族坂_00244䛡_逐渐増加の春季預予于于定.txt
console.log(normalize_val(text));
