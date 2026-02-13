# @node-novel/cache-loader

> 讀寫分析 novel-stat.json / Novel Stat Cache Loader

[![npm version](https://img.shields.io/npm/v/@node-novel/cache-loader.svg)](https://www.npmjs.com/package/@node-novel/cache-loader)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於讀寫與分析 `novel-stat.json` 快取檔案，提供小說統計資料的載入與管理功能。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/cache-loader

# 使用 npm
npm install @node-novel/cache-loader
```

## 使用方法

```ts
import create, { createFromJSON } from '@node-novel/cache-loader';
import path from 'upath2';

/**
 * 從檔案來讀取設定
 * Load configuration from file
 */
const novelStatCache = create({
  file: path.join(__dirname, 'res', 'novel-stat.json'),
  // file_git: path.join(__dirname, 'res', 'novel-stat.json'),
});

console.dir(novelStatCache);

/**
 * 從其他方式取得 data 來輸入資料
 * Load data from other sources (e.g., AJAX)
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
 * Get final state of all novels (default)
 * 例如 當 同時存在 xxx 與 xxx_out 時，只會回傳 xxx_out
 * For example, when both xxx and xxx_out exist, only xxx_out is returned
 */
console.log(novelStatCache.filterNovel());
```

## API

### create(options: ICreateOptions): NovelStatCache

從檔案建立快取實例。

**Options:**

| 選項 | 類型 | 說明 |
|------|------|------|
| `file` | string | novel-stat.json 檔案路徑 |
| `file_git` | string | Git 版本的檔案路徑 |

### createFromJSON(data: INovelStatCache): NovelStatCache

從 JSON 資料建立快取實例。

### filterNovel(): INovelInfo[]

過濾並返回小說的最終狀態列表。

## 類型定義

```ts
interface INovelStatCache {
  novels: Record<string, INovelInfo>;
  mdconf: Record<string, any>;
  meta: Record<string, any>;
  history: Record<string, any>;
}
```

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/cache-loader)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
