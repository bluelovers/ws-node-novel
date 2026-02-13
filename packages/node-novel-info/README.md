# node-novel-info

> node-novel 的 mdconf 模組 / mdconf Module for node-novel

[![npm version](https://img.shields.io/npm/v/node-novel-info.svg)](https://www.npmjs.com/package/node-novel-info)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## 簡介

此模組是 node-novel 的 mdconf 解析模組，用於解析與生成小說資訊設定檔。

## 安裝

```bash
# 使用 yarn
yarn add node-novel-info

# 使用 npm
npm install node-novel-info
```

## 使用方法

```ts
// CommonJS
const novelInfo = require('node-novel-info');

// ES Module
import * as novelInfo from 'node-novel-info';
import novelInfo from 'node-novel-info';
```

### mdconf_parse

```js
import * as novelInfo from 'node-novel-info';
import * as fs from 'fs-extra';

fs.readFile('./test/res/README.md')
  .then(function (buf) {
    return novelInfo.parse(buf, {
      // chk: false
    });
  })
  .then(function (conf) {
    console.log(conf);
    return conf;
  });
```

#### 輸出範例

```
{ novel:
   { title: '自卫队三部曲',
     author: '有川浩',
     source: 'http://www.wenku8.com/modules/article/reader.php?aid=350',
     publisher: '富士见文库',
     cover: 'http://img.wenku8.com/image/0/350/350s.jpg',
     date: '2011-06-22T00:00:00+08:00',
     status: '已完成',
     preface: '故事背景架构在近未来（或可称为平行世界）的曰本。\n某天，直径五百公尺的白色陨石状物体以迅雷不及掩耳之势坠落在地球上。\n同一时间，发生了人类变化成盐柱的诡异现象（一般称之为“盐害”），光是曰本地区的死亡人数便估计多达八千万人。文明社会在一瞬间崩溃，劫后余生的人们逃到农村，过着自给自足的贫乏生活……',
     tags: [ 'node-novel', 'wenku8' ] },
  options: { textlayout: { allow_lf2: 'true' } } }
```

### Mdconf.stringify

```js
import * as novelInfo from 'node-novel-info';
import moment from 'moment';

console.log(novelInfo.stringify({
  novel: {
    test: true,
  },
  options: {
    textlayout: {
      lf: true,
    },
    data: moment(),
  }
}));
```

#### 輸出範例

```markdown
#novel

- test: true

#options

- data: 2018-02-04T02:48:24+08:00

##textlayout

- lf: true
```

## API

### parse(content: Buffer | string, options?: IParseOptions): IConf

解析 Markdown 設定檔內容。

### stringify(data: IConf): string

將設定物件轉換為 Markdown 格式。

## 相關連結

- [ws-node-novel](https://github.com/bluelovers/ws-node-novel) - 父專案
- [README.md](test/res/README.md) - 範例檔案
- [node-novel-info](https://www.npmjs.com/package/node-novel-info)
- [mdconf2](https://www.npmjs.com/package/mdconf2)
- [mdconf-stringify](https://www.npmjs.com/package/mdconf-stringify)
- [Issues](https://github.com/bluelovers/ws-node-novel/issues)
