# README

    比對目標路徑下的 git 歷史變化
    適用於任何符合 `主資料夾/副資料夾/子路徑` 這種結構的資料夾

```
yarn add @node-novel/git-diff-log
```

[index.d.ts](index.d.ts)

[class.d.ts](class.d.ts)

## demo

[demo.ts](test/demo.ts)

```ts
/**
 * Created by user on 2019/6/18.
 */
import { novelDiffFromLog } from '@node-novel/git-diff-log';
import { NovelDiffFromLogParser } from '@node-novel/git-diff-log/class';

let data = novelDiffFromLog({
 novelRoot: 'G:\\Users\\The Project\\nodejs-test\\node-novel2\\dist_novel',
 baseHash: 1,
});

console.dir(data, {
 depth: 5,
 colors: true,
});

let cd = new NovelDiffFromLogParser(data as any);

console.dir(cd.files().length);

let ps = cd.filterPathMains((s) => /_out$/.test(s));

console.dir(NovelDiffFromLogParser.files(ps).length);
```

