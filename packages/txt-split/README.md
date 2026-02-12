# @node-novel/txt-split

> 分割小說文字檔案

[![npm version](https://img.shields.io/npm/v/@node-novel/txt-split.svg)](https://www.npmjs.com/package/@node-novel/txt-split)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於將大型小說文字檔案分割成較小的檔案，方便管理和處理。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/txt-split

# 使用 npm
npm install @node-novel/txt-split
```

## 使用方法

```ts
import { txtSplit } from '@node-novel/txt-split';
import { readFile } from 'fs-extra';
import { join } from 'path';

async function main() {
  const inputPath = join(__dirname, 'large-novel.txt');
  const outputDir = join(__dirname, 'output');

  await txtSplit(inputPath, outputDir, {
    maxLines: 1000,      // 每檔案最多行數
    encoding: 'utf-8',
  });

  console.log('分割完成！');
}

main();
```

## API

### txtSplit(inputPath, outputDir, options)

分割文字檔案。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `maxLines` | number | `1000` | 每檔案最大行數 |
| `encoding` | string | `'utf-8'` | 檔案編碼 |
| `prefix` | string | `'chapter-'` | 輸出檔案前綴 |
| `startNum` | number | `1` | 起始編號 |

## 範例輸出

```
output/
├── chapter-001.txt
├── chapter-002.txt
├── chapter-003.txt
└── ...
```

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/txt-split)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
