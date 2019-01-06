/**
 * Created by user on 2019/1/6/006.
 */

import create from '..';
import path = require('upath2');

const novelStatCache = create({
	file: path.join(__dirname, 'res', 'novel-stat.json'),
	//file_git: path.join(__dirname, 'res', 'novel-stat.json'),
});

console.dir(novelStatCache);

