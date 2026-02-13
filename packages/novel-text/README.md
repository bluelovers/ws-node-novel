# novel-text

> 小說核心文字處理模組 / Novel Text Processing Core Module

[![npm version](https://img.shields.io/npm/v/novel-text.svg)](https://www.npmjs.com/package/novel-text)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組是小說文字處理的核心模組，提供文字排版、格式化、替換與清理等功能。

## 安裝

```bash
# 使用 yarn
yarn add novel-text

# 使用 npm
npm install novel-text
```

## 使用方法

```ts
import novelText from 'novel-text';

// 文字轉換
let new_text = novelText.toStr(text);

// 文字排版
new_text = novelText.textlayout(new_text, options);

// 文字替換
new_text = novelText.replace(new_text, {
  words: true,
});

// 清理空白
new_text = novelText.trim(new_text);
```

## API

### toStr(text: string): string

將輸入文字轉換為標準格式。

### textlayout(text: string, options?: ITextLayoutOptions): string

進行文字排版處理。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `allow_lf2` | boolean | `false` | 允許連續兩個換行 |
| `allow_lf3` | boolean | `false` | 允許連續三個換行 |

### replace(text: string, options?: IReplaceOptions): string

執行文字替換規則。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `words` | boolean | `false` | 啟用詞語替換 |

### trim(text: string): string

清理文字前後的空白字元。

## 功能特色

- 📝 **文字排版** - 自動處理段落與換行
- 🔄 **格式轉換** - 統一文字格式
- ✂️ **空白清理** - 移除多餘空白
- 🌐 **中文支援** - 針對中文文字優化

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [node-novel](https://www.npmjs.com/search?q=node-novel) - 相關專案
- [npm](https://www.npmjs.com/package/novel-text)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
