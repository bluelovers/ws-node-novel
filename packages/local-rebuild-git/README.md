# @node-novel/local-rebuild-git

> 重建本地 Git 倉庫的檔案歷史紀錄

[![npm version](https://img.shields.io/npm/v/@node-novel/local-rebuild-git.svg)](https://www.npmjs.com/package/@node-novel/local-rebuild-git)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組用於重建本地 Git 倉庫的檔案歷史紀錄，適用於需要重新組織或清理 Git 歷史的場景。

**主要功能：**

- 取得所有檔案的 Git 歷史紀錄
- 偽造作者資訊（名稱與 Email）
- 重建 commits 歷史
- 備份與還原 Git 設定

## 安裝

```bash
# 使用 yarn
yarn add @node-novel/local-rebuild-git

# 使用 npm
npm install @node-novel/local-rebuild-git
```

## 命令列使用

```bash
# 直接執行
npx local-rebuild-git /path/to/git/repo
```

## API

### runAllJob(cwd)

重建指定 Git 倉庫的檔案歷史。

```ts
import { runAllJob } from '@node-novel/local-rebuild-git';

async function main() {
  await runAllJob('/path/to/git/repo');
}

main();
```

### fetchAllFileLog(repo, options)

取得指定目錄下所有檔案的 Git 紀錄。

```ts
import { fetchAllFileLog } from '@node-novel/local-rebuild-git';

const logs = await fetchAllFileLog('/path/to/repo', {
  sortFn(a, b) {
    return a.log.authorDateTimestamp - b.log.authorDateTimestamp;
  },
  sortDesc: false,
});

console.log(logs);
```

### git_fake_author(name?, email?)

產生偽造的作者資訊。

```ts
import { git_fake_author } from '@node-novel/local-rebuild-git';

const author = git_fake_author('Test User', 'test@example.com');
// => "Test User <test@example.com>"
```

### git_commit_file(row, cwd?)

提交檔案變更。

```ts
import { git_commit_file } from '@node-novel/local-rebuild-git';

await git_commit_file(fileLogRow, '/path/to/repo');
```

## 類型定義

```ts
interface IFetchAllFileLogRow {
  file: string;           // 檔案名稱
  fullpath: string;      // 完整路徑
  log: IFetchAllFileLogRowLog; // Git 紀錄
}

interface IFetchAllFileLogRowLog {
  sha: string;            // Commit SHA
  authorName: string;    // 作者名稱
  authorEmail: string;   // 作者 Email
  authorDateTimestamp: number; // 作者時間戳
  rawBody: string;       // 原始提交訊息
}
```

## 注意事項

⚠️ **警告：** 此工具會修改 Git 歷史，請確保在操作前備份您的資料。

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [npm](https://www.npmjs.com/package/@node-novel/local-rebuild-git)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
