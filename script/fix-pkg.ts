/**
 * Created by user on 2018/12/17/017.
 */

import path = require('path');
import fs = require('fs-extra');
import FastGlob = require('fast-glob');
import sortPackageJson = require('sort-package-json');

FastGlob.async<string>([
	'*/package.json',
], {
	cwd: path.join(__dirname, '..', 'packages'),
	absolute: true,
}).then(function (ls)
{
	ls.forEach(function (filepath)
	{
		let dir = path.dirname(filepath);

		let dir_id = path.basename(dir);

		console.log(dir_id);

		let has_git = fs.pathExistsSync(path.join(dir, '.git'));

		let json = fs.readJSONSync(filepath);

		if (!has_git)
		{
			if (!json.homepage)
			{
				json.homepage = `https://github.com/bluelovers/ws-node-novel/tree/master/packages/${dir_id}#readme`;
			}

			json.bugs = Object.assign({
				"url": "https://github.com/bluelovers/ws-node-novel/issues",
			}, json.bugs);

			json.repository = Object.assign({
				"type": "git",
				"url": "git+https://github.com/bluelovers/ws-node-novel.git",
			}, json.repository);
		}

		if (!fs.pathExistsSync(path.join(dir, '.npmignore')))
		{
			fs.copySync(path.join(__dirname, '.npmignore'), path.join(dir, '.npmignore'));
		}

		json.keywords = json.keywords || [];

		json.keywords.push('@node-novel', 'node-novel');

		if (json.name.split('/').length)
		{
			json.keywords.push(...json.name.split('/'));
		}

		fs.writeJSONSync(filepath, sortPackageJson(json), {
			spaces: 2,
		});
	})
});
