# @node-novel/cache-loader

    讀寫分析 novel-stat.json

## install

```base
npm install @node-novel/cache-loader
```

## demo

```ts
import create, { createFromJSON } from '@node-novel/cache-loader';
import path = require('upath2');

/**
 * 從檔案來讀取設定
 */
const novelStatCache = create({
	file: path.join(__dirname, 'res', 'novel-stat.json'),
	//file_git: path.join(__dirname, 'res', 'novel-stat.json'),
});

console.dir(novelStatCache);

/**
 * 從其他方式取得 data 來輸入資料
 * 例如 透過 AJAX 取得伺服器上的 json
 */
const data: INovelStatCache = {
	novels: {},
	mdconf: {},
	meta: {},
	history: {},
};

const novelStatCache2 = createFromJSON(data);

console.dir(novelStatCache2);

/**
 * 取得所有小說的最終狀態(預設時)
 * 例如 當 同時存在 xxx 與 xxx_out 時，只會回傳 xxx_out
 */
console.log(novelStatCache.filterNovel());
```
