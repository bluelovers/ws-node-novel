# @node-novel/sort

> 小說檔案排序工具 / Sort Callback for @node-novel

[![npm version](https://img.shields.io/npm/v/@node-novel/sort.svg)](https://www.npmjs.com/package/@node-novel/sort)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組提供小說檔案排序用的回呼函式，支援自然排序與自訂排序邏輯。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/sort

# 使用 npm
npm install @node-novel/sort
```

## 使用方法

```typescript
import { defaultSortCallback, createSortCallback } from '@node-novel/sort';

// 基本字串排序
let arr1: string[] = ['第10章', '第2章', '第1章'];
arr1.sort(defaultSortCallback);
// => ['第1章', '第2章', '第10章']

// 物件陣列排序
let arr2: { key: string; name: string }[] = [
  { key: '10', name: 'b' },
  { key: '2', name: 'a' },
];

arr2.sort(function (a, b) {
  return defaultSortCallback(a.key, b.key) || defaultSortCallback(a.name, b.name);
});
```

## API

### defaultSortCallback(a: string, b: string): number

預設排序回呼函式，使用自然排序演算法。

**參數：**
- `a`: 第一個比較值
- `b`: 第二個比較值

**回傳值：**
- 負數：a 排在 b 之前
- 正數：a 排在 b 之後
- 0：兩者相等

### createSortCallback(options?): SortCallback

建立自訂排序回呼函式。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `locale` | string | `'zh-TW'` | 地區設定 |
| `numeric` | boolean | `true` | 是否啟用數字排序 |

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [API](https://github.com/bluelovers/ws-node-novel/tree/master/packages/node-novel-sort/index.ts)
- [npm](https://www.npmjs.com/package/@node-novel/sort)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
