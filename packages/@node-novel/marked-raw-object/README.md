# @node-novel/marked-raw-object

> Markdown 原始物件解析器 / Markdown Raw Object Parser

[![npm version](https://img.shields.io/npm/v/@node-novel/marked-raw-object.svg)](https://www.npmjs.com/package/@node-novel/marked-raw-object)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於將 Markdown 解析為原始物件結構，保留原始資訊以便後續處理與轉換。

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/marked-raw-object

# 使用 npm
npm install @node-novel/marked-raw-object

# 使用 yarn-tool
yarn-tool add @node-novel/marked-raw-object
```

## 使用方法

```ts
import { parse, stringify } from '@node-novel/marked-raw-object';

// 解析 Markdown 為原始物件
const rawObject = parse(`
# 標題

- item 1
- item 2
`);

console.log(rawObject);

// 將原始物件轉回 Markdown
const markdown = stringify(rawObject);
```

## API

### parse(markdown: string): IRawObject

將 Markdown 字串解析為原始物件結構。

### stringify(rawObject: IRawObject): string

將原始物件結構轉換回 Markdown 字串。

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [mdconf2](https://www.npmjs.com/package/mdconf2) - Markdown 設定解析
- [npm](https://www.npmjs.com/package/@node-novel/marked-raw-object)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
