# @node-novel/layout

> 小說文字排版與格式化模組 / Novel Text Layout Module

[![npm version](https://img.shields.io/npm/v/@node-novel/layout.svg)](https://www.npmjs.com/package/@node-novel/layout)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組是小說文字排版的核心模組，提供文字格式化、正則替換與排版處理功能。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/layout

# 使用 npm
npm install @node-novel/layout
```

## 使用方法

```ts
import textLayout from '@node-novel/layout';

let old_text = '原始文字內容...';

// 排版選項設定
let options: ITextLayoutOptions = {
  allow_lf2: false,  // 不允許連續兩個換行
  allow_lf3: false,  // 不允許連續三個換行
};

// 執行排版
let new_text = textLayout.textlayout(old_text, options);

// 執行文字替換
new_text = textLayout.replace(new_text, {
  words: true,
});
```

## API

### textlayout(text: string, options?: ITextLayoutOptions): string

執行文字排版處理，調整換行與段落格式。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `allow_lf2` | boolean | `false` | 允許連續兩個換行 |
| `allow_lf3` | boolean | `false` | 允許連續三個換行 |

### replace(text: string, options?: IReplaceOptions): string

執行文字替換規則，處理特殊字元與詞語。

**Options:**

| 選項 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `words` | boolean | `false` | 啟用詞語替換 |

## 功能特色

- 📝 **文字排版** - 自動處理段落與換行
- 🔄 **正則替換** - 支援複雜的文字替換規則
- 🌐 **中文優化** - 針對中文小說文字優化
- ⚡ **高效處理** - 支援大量文字處理

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [node-novel](https://www.npmjs.com/search?q=node-novel) - 相關專案
- [npm](https://www.npmjs.com/package/@node-novel/layout)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
