# ws-node-novel

Node.js 小說文本處理工具集合 (Monorepo)

[![npm version](https://img.shields.io/npm/v/ws-node-novel.svg)](https://www.npmjs.com/package/ws-node-novel)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org/)

> A collection of Node.js tools for processing novel text files / 小說文本處理工具集合

## 目錄 (Table of Contents)

- [簡介](#簡介)
- [功能特色](#功能特色)
- [Packages](#packages)
- [安裝](#安裝)
- [快速開始](#快速開始)
- [使用範例](#使用範例)
- [開發指南](#開發指南)
- [貢獻指南](#貢獻指南)
- [授權](#授權)
- [相關連結](#相關連結)

## 簡介

這是一個用於處理小說文本的 Node.js Monorepo 專案，採用 Yarn Workspaces + Lerna 管理，包含多種工具：

- 📖 小說資訊解析與處理
- 📝 文字排版與格式化
- 🔄 Git 版本差異分析
- 📄 Markdown 載入器
- 💾 快取管理
- ✂️ 檔案分割與合併

## Packages

| Package | Description |
|---------|-------------|
| [@node-novel/cache-loader](./packages/cache-loader/) | 讀寫分析 novel-stat.json |
| [@node-novel/git-diff-log](./packages/git-diff-log/) | 比對 git 歷史變化 |
| [@node-novel/md-loader](./packages/md-loader/) | 支援 Front Matter 的 mdconf |
| [novel-text](./packages/novel-text/) | 小說核心文字處理模組 |
| [node-novel-info](./packages/node-novel-info/) | mdconf 模組 |
| [@node-novel/txt-split](./packages/txt-split/) | 分割 txt 檔案 |
| [txt-split](./packages/txt-split/) | txt 檔案分割工具 |
| [parse-txt-tag](./packages/parse-txt-tag/) | 解析 txt 標籤 |
| [node-novel-normalize](./packages/node-novel-normalize/) | 標準化處理 |
| [node-novel-sort](./packages/node-novel-sort/) | 排序工具 |
| [mdconf2](./packages/mdconf2/) | mdconf 解析與字串化 |
| [layout](./packages/layout/) | 版面配置 |
| [local-rebuild-git](./packages/local-rebuild-git/) | 本地重建 git |
| [txt-stat-report](./packages/txt-stat-report/) | 統計報告 |

## 安裝

```bash
# 安裝全部依賴
yarn install

# 或使用 pnpm
pnpm install

# 或使用 npm
npm install
```

## 安裝單一 Package

```bash
yarn add <package-name>
npm install <package-name>
```

## 使用範例

### novel-text

```ts
import novelText from 'novel-text';

let new_text = novelText.toStr(text);
new_text = novelText.textlayout(new_text, options);
new_text = novelText.replace(new_text, { words: true });
new_text = novelText.trim(new_text);
```

### node-novel-info

```ts
import * as novelInfo from 'node-novel-info';

const conf = await novelInfo.parse(buf);
console.log(conf.novel.title);
```

### @node-novel/git-diff-log

```ts
import { novelDiffFromLog } from '@node-novel/git-diff-log';

let data = novelDiffFromLog({
  novelRoot: '/path/to/novels',
  baseHash: 1,
});
```

## 開發指南

### 環境需求

- Node.js >= 18
- Yarn >= 1.22 或 pnpm >= 8
- TypeScript 5.x

### 快速開始

```bash
# 1. 複製專案
git clone https://github.com/bluelovers/ws-node-novel.git
cd ws-node-novel

# 2. 安裝依賴
yarn install

# 3. 執行測試
yarn test

# 4. 建立所有 packages
yarn build:all
```

### 新增 Package

```bash
# 使用 lerna 建立新 package
npx lerna create <package-name>
```

### 開發流程

1. 在 `packages/` 目錄下建立或修改 package
2. 確保所有測試通過：`yarn test`
3. 確保程式碼風格一致：`yarn lint:all`
4. 提交前執行：`yarn build:all`

## 貢獻指南

歡迎貢獻此專案！請遵循以下步驟：

1. **Fork** 此專案
2. 建立分支：`git checkout -b feature/your-feature`
3. 提交變更：`git commit -m 'Add some feature'`
4. 推送分支：`git push origin feature/your-feature`
5. 建立 **Pull Request**

### 程式碼規範

- 使用 TypeScript 撰寫
- 遵守 ESLint 規則
- 所有新功能需包含測試
- 提交訊息需符合 [Conventional Commits](https://www.conventionalcommits.org/)

## 技術栈

- **Language**: TypeScript 5.x
- **Monorepo**: Yarn Workspaces + Lerna
- **Testing**: Jest
- **Build**: tsc (TypeScript Compiler)
- **Code Style**: ESLint

## 授權

本專案採用 **ISC License** 授權。

```
ISC License

Copyright (c) 2023-present, bluelovers

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 相關連結

### 官方資源

- [GitHub Repository](https://github.com/bluelovers/ws-node-novel)
- [NPM Packages](https://www.npmjs.com/search?q=node-novel)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)

### 相關專案

- [node-novel](https://github.com/bluelovers/node-novel) - 原始專案
- [mdconf2](https://www.npmjs.com/package/mdconf2) - Markdown 設定解析
- [marked](https://www.npmjs.com/package/marked) - Markdown 解析器

### 學習資源

- [Yarn Workspaces 文件](https://yarnpkg.com/features/workspaces)
- [Lerna 文件](https://lerna.js.org/)
- [TypeScript 手冊](https://www.typescriptlang.org/docs/)

## 貢獻者

[貢獻者列表](https://github.com/bluelovers/ws-node-novel/graphs/contributors)

## 問題回報

[GitHub Issues](https://github.com/bluelovers/ws-node-novel/issues)
