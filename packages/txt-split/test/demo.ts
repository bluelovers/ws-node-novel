/**
 * Created by user on 2018/11/11/011.
 */

import txtSplit, { autoFile } from '..';
import { _wrapMethod } from '../lib/util';
import {} from 'bluebird';
import Bluebird = require('bluebird');

import { tplOptions } from './tpl/cqwt';

txtSplit.autoFile('./res/第1章 艾魯蒂雅王國篇.txt', {
	...tplOptions,
});
