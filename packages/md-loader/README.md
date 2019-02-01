# @node-novel/md-loader

    支援 Front Matter 的 node-novel-info / mdconf

## install

    npm install @node-novel/md-loader node-novel-info

**請注意必須要手動額外安裝 node-novel-info 這是為了防止當多個 node-novel-info 同時存在時的除錯問題**

請注意必須要手動額外安裝 node-novel-info 這是為了防止當多個 node-novel-info 同時存在時的除錯問題

## demo

> see api in [API](index.d.ts)

> [demo.ts](test/demo.ts)

```ts
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

let r = k.stringify({
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

let r2 = k.stringify(k);

console.dir(k, {
	colors: true,
});

console.log(r);

console.log('---------------------------');

console.log(r2);
```
