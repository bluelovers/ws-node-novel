/**
 * Created by user on 2018/11/11/011.
 */

import txtSplit, { autoFile } from '..';
import { _wrapMethod } from '../lib/util';
import Bluebird = require('bluebird');
import fs = require('fs-extra');
import path = require('path');

import { tplOptions } from './tpl/cqwt';
import { tplOptions as tplOptions2 } from './tpl/八男';

/**
 * 輸出資料夾位置
 */
let outDir = path.join(__dirname, './res/out');

/**
 * 清除目標資料夾內容
 */
fs.emptyDirSync(path.join(outDir, '00000_unknow'));

/**
 * 開始執行
 */
txtSplit.autoFile('./res/八男1-151.txt', {
	...tplOptions2,
	outDir,
});
