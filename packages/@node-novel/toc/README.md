# @node-novel/toc

> 建立小說索引目錄

[![npm version](https://img.shields.io/npm/v/@node-novel/toc.svg)](https://www.npmjs.com/package/@node-novel/toc)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於建立小說的索引目錄（Table of Contents），可掃描小說檔案並產生章節目錄結構。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/toc

# 使用 npm
npm install @node-novel/toc
```

## 使用方法

```ts
import { processToc } from '@node-novel/toc';

async function main() {
  const toc = await processToc('/path/to/novel');

  toc.forEach((chapter) => {
    console.log(`[${chapter.level}] ${chapter.title}`);
  });
}

main();
```

## API

### processToc(directory, options?)

掃描目錄並建立章節索引。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `directory` | string | - | 小說目錄路徑 |
| `encoding` | string | `'utf-8'` | 檔案編碼 |
| `recursive` | boolean | `true` | 是否遞迴掃描子目錄 |

**回傳值:**

```ts
interface ITocItem {
  title: string;      // 章節標題
  level: number;       // 階層等級
  path: string;        // 檔案路徑
  lineNumber: number;  // 行號
}
```

## 範例輸出

```json
[
  {
    "title": "序章",
    "level": 1,
    "path": "novel/chapter-01.txt",
    "lineNumber": 10
  },
  {
    "title": "第一章",
    "level": 1,
    "path": "novel/chapter-02.txt",
    "lineNumber": 1
  }
]
```

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/toc)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
