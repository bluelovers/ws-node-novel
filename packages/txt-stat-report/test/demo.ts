import { txtReport, txtReportSum } from '../index';

let r = txtReport(`♀ 露絲的夢境 ♀



注意到的時候,老子發現自己已經站在向日葵田的中央.



「露絲—!」



被盛開的向日葵包圍的小道的前頭,莉安娜在看著老子.

猶如嗡嗡一般發出的聲音很精神的揮著手,浮起著不輸給周囲的向日葵一般精神明亮的笑容.

一點雲都沒有的晴朗的天空傾注而來的陽光,讓她的笑容更上了一層輝煌的色彩.
`);

console.dir(r);

console.dir(txtReportSum([r, r, r]));
