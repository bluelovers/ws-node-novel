/**
 * Created by user on 2019/2/1/001.
 */

import { parse } from '@node-novel/md-loader';

let k = parse(`
---
title: Home
---
# novel

- title: 破滅の魔導王とゴーレムの蛮妃
`, {
	parseOptions: {
		//lowCheckLevel: true,
		throw: false,
	},
});

let r1 = k.stringify(k);

let r2 = k.stringify({
	data: {
		//...k.data,
		//kkk: 777,
	},
	//content: k.content,
	mdconf: {
		...k.mdconf,
		aaa: {
			bbb: 777,
		},
	},
});

console.dir(k, {
	colors: true,
});

console.log('---------------------------');

console.log(r1);

console.log('---------------------------');

console.log(r2);
