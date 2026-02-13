# @node-novel/git-diff-log

> 比對 Git 歷史變化 / Git Diff Log Comparator

[![npm version](https://img.shields.io/npm/v/@node-novel/git-diff-log.svg)](https://www.npmjs.com/package/@node-novel/git-diff-log)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於比對目標路徑下的 Git 歷史變化，適用於任何符合 `主資料夾/副資料夾/子路徑` 結構的資料夾。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/git-diff-log

# 使用 npm
npm install @node-novel/git-diff-log
```

## 使用方法

```ts
import { novelDiffFromLog } from '@node-novel/git-diff-log';
import { NovelDiffFromLogParser } from '@node-novel/git-diff-log/class';

// 取得 Git 差異資料
let data = novelDiffFromLog({
  novelRoot: 'G:\\Users\\The Project\\nodejs-test\\node-novel2\\dist_novel',
  baseHash: 1,
});

console.dir(data, {
  depth: 5,
  colors: true,
});

// 使用 Parser 進一步處理
let cd = new NovelDiffFromLogParser(data as any);

console.dir(cd.files().length);

// 過濾路徑
let ps = cd.filterPathMains((s) => /_out$/.test(s));

console.dir(NovelDiffFromLogParser.files(ps).length);
```

## API

### novelDiffFromLog(options: INovelDiffFromLogOptions): INovelDiffData

比對 Git 歷史變化並返回差異資料。

**Options:**

| 選項 | 類型 | 說明 |
|------|------|------|
| `novelRoot` | string | 小說根目錄路徑 |
| `baseHash` | number | 基準 Hash 數量 |

### NovelDiffFromLogParser

差異資料解析器類別。

**方法：**
- `files()` - 取得所有檔案列表
- `filterPathMains(fn)` - 過濾主路徑

## 類型定義

詳見 [index.d.ts](index.d.ts) 與 [class.d.ts](class.d.ts)。

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/git-diff-log)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
