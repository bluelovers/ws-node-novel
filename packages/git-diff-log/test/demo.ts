/**
 * Created by user on 2019/6/18.
 */
import { novelDiffFromLog } from '../index';
import { NovelDiffFromLogParser } from '../class';

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
