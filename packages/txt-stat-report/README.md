# @node-novel/txt-stat-report

> 分析並產生小說文字統計報告

[![npm version](https://img.shields.io/npm/v/@node-novel/txt-stat-report.svg)](https://www.npmjs.com/package/@node-novel/txt-stat-report)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於分析小說文字檔案並產生統計報告，包含字數統計、行數計算、特殊標記分析等功能。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/txt-stat-report

# 使用 npm
npm install @node-novel/txt-stat-report
```

## 使用方法

```ts
import { txtStatReport } from '@node-novel/txt-stat-report';
import { readFile } from 'fs-extra';
import { join } from 'path';

async function main() {
  const filePath = join(__dirname, 'novel.txt');
  const content = await readFile(filePath, 'utf-8');

  const report = await txtStatReport(content, {
    // 選項配置
    encoding: 'utf-8',
    includeEmptyLines: false,
  });

  console.log(report);
}

main();
```

## API

### txtStatReport(content, options)

分析文字內容並返回統計報告。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `encoding` | string | `'utf-8'` | 檔案編碼 |
| `includeEmptyLines` | boolean | `false` | 是否包含空行 |
| `skipTags` | boolean | `true` | 是否跳過特殊標籤 |

**回傳值:**

```ts
interface IStatReport {
  charCount: number;      // 總字元數
  wordCount: number;      // 總字數
  lineCount: number;      // 總行數
  paragraphCount: number; // 段落數
  tags: Record<string, number>; // 標籤統計
}
```

## 範例輸出

```json
{
  "charCount": 12345,
  "wordCount": 6789,
  "lineCount": 456,
  "paragraphCount": 123,
  "tags": {
    "chapter": 50,
    "section": 10
  }
}
```

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/txt-stat-report)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
