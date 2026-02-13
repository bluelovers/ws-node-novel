# @node-novel/parse-txt-tag

> 分析 node-novel 風格的 txt 標籤 / Parse txt Tags in node-novel Style

[![npm version](https://img.shields.io/npm/v/@node-novel/parse-txt-tag.svg)](https://www.npmjs.com/package/@node-novel/parse-txt-tag)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於分析與解析 node-novel 風格的 txt 標籤，支援自訂標籤處理回呼。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/parse-txt-tag

# 使用 npm
npm install @node-novel/parse-txt-tag
```

## 使用方法

```ts
import { outputFile, readFile } from 'fs-extra';
import { join } from 'path';
import { parse } from '@node-novel/parse-txt-tag';

const rootDir = join(__dirname, '..');

readFile(join(rootDir, 'test/res', '排版格式.txt'))
  .then(buf => {
    return parse(buf.toString(), {
      on: {
        default({ tagName, innerContext, cache, attach }) {
          console.dir({
            tagName,
            innerContext,
          });

          return null; // 如果回傳非 null 則會取代原始文字內容
        }
      }
    });
  })
  .then(v => console.dir(v));
```

## API

### parse(content: string, options?: IParseOptions): IParseResult

解析文字內容中的標籤。

**Options:**

| 選項 | 類型 | 說明 |
|------|------|------|
| `on.default` | function | 預設標籤處理回呼 |

**回呼參數：**

| 參數 | 類型 | 說明 |
|------|------|------|
| `tagName` | string | 標籤名稱 |
| `innerContext` | string | 標籤內容 |
| `cache` | object | 快取物件 |
| `attach` | object | 附加資料 |

**回傳值：**
- 返回 `null` 則保留原始內容
- 返回字串則取代原始內容

## 標籤格式

支援 node-novel 風格的標籤格式，例如：

```
<!-- tag:chapter -->
標籤內容
<!-- /tag:chapter -->
```

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/parse-txt-tag)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
