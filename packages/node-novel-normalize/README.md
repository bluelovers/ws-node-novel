# @node-novel/normalize

> 檔案名稱標準化處理 / File Name Normalization for Sort

[![npm version](https://img.shields.io/npm/v/@node-novel/normalize.svg)](https://www.npmjs.com/package/@node-novel/normalize)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於標準化檔案名稱，以便進行正確的排序。支援中文數字、羅馬數字、全形/半形字符等轉換。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/normalize

# 使用 npm
npm install @node-novel/normalize
```

## 使用方法

```ts
import { normalize_strip, normalize_val } from '@node-novel/normalize';

let text = '00090_2章 不希望獨占的日子結束的面具工薪族版_二百四十四話　逐漸増加的春季預予于於定.txt';

// 去除數字前綴與特殊標記
// => 2章 不希望獨占的日子結束的面具工薪族版_二百四十四話　逐漸増加的春季預予于於定.txt
console.log(normalize_strip(text));

// 標準化為統一格式
// => 00090_00002章_不希望独佔の日子結束の面具工薪族坂_00244䛡_逐渐増加の春季預予于于定.txt
console.log(normalize_val(text));
```

## API 說明

### normalize_strip(str: string, isDir?: boolean): string

去除字串中的數字前綴與特殊標記。

**參數：**
- `str`: 要處理的字串
- `isDir`: 是否為目錄路徑（預設為 false）

### normalize_val(str: string, padNum?: number, options?: IOptions): string

將字串標準化為統一格式，包含數字轉換、大小寫轉換、特殊字符處理等。

**參數：**
- `str`: 要處理的字串
- `padNum`: 數字填充位數（預設為 5）
- `options`: 處理選項

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `padNum` | number | `5` | 數字填充位數 |
| `checkRoman` | boolean | `false` | 是否檢查羅馬數字 |

## 功能特色

- 📝 **雙語註解** - 原始碼包含繁體中文與英文的詳細註解，便於理解與維護
- 🌐 **多格式支援** - 支援處理中文數字、羅馬數字、全形/半形字符等
- 📊 **標準化輸出** - 統一的數字填充與分隔符號，確保排序一致性
- 🔧 **模組化設計** - 提供多個獨立功能函式，可依需求選擇使用

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/normalize)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
