# @node-novel/md-loader

> 支援 Front Matter 的 mdconf 載入器 / Markdown Loader with Front Matter

[![npm version](https://img.shields.io/npm/v/@node-novel/md-loader.svg)](https://www.npmjs.com/package/@node-novel/md-loader)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組提供支援 Front Matter 的 Markdown 載入器，結合 `node-novel-info` 與 `mdconf` 功能。

## 安裝

```bash
# 安裝主套件
npm install @node-novel/md-loader

# 必須手動額外安裝 node-novel-info
npm install node-novel-info
```

> ⚠️ **注意**：請必須手動額外安裝 `node-novel-info`，這是為了防止當多個 `node-novel-info` 同時存在時的除錯問題。

## 使用方法

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
    // lowCheckLevel: true,
    throw: false,
  },
});

// 修改資料並重新生成 Markdown
let r = k.stringify({
  data: {
    // ...k.data,
    // kkk: 777,
  },
  // content: k.content,
  mdconf: {
    ...k.mdconf,
    aaa: {
      bbb: 777,
    },
  },
});

// 保持原始資料重新生成
let r2 = k.stringify(k);

console.dir(k, {
  colors: true,
});

console.log(r);
console.log('---------------------------');
console.log(r2);
```

## API

### parse(content: string, options?: IParseOptions): IParsedResult

解析 Markdown 內容，支援 Front Matter 與 mdconf。

**Options:**

| 選項 | 類型 | 說明 |
|------|------|------|
| `parseOptions.lowCheckLevel` | boolean | 低檢查級別 |
| `parseOptions.throw` | boolean | 是否拋出錯誤 |

### stringify(data: IStringifyOptions): string

將解析結果轉換回 Markdown 字串。

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [API](index.d.ts) - API 類型定義
- [demo.ts](test/demo.ts) - 範例程式碼
- [npm](https://www.npmjs.com/package/@node-novel/md-loader)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
