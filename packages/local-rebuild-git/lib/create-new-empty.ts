import { git_get_user } from '../index';
import fs = require('fs-extra');
import CrossSpawn = require('cross-spawn-extra');
import Bluebird = require('bluebird');
import path = require('upath2');
import { checkGitOutput, crossSpawnSync, SpawnOptions, crossSpawnAsync } from '@git-lazy/util/spawn/git';
import { createEmptyBranch } from '@git-lazy/branch';
import moment = require('moment');
import { console } from '@git-lazy/util';

export async function _createMode001(cwd: string)
{
	let { name, email } = await git_get_user(cwd);

	let _git_path = path.join(cwd, '.git');
	let _git_path_backup = path.join(cwd, 'backup.git');

	console.info(`清除 backup.git`);
	await fs.remove(_git_path_backup);

	console.info(`.git 更名為 backup.git`);
	await fs.move(_git_path, _git_path_backup);

	await crossSpawnAsync('git', [
		'init',
	], {
		stdio: 'inherit',
		cwd,
	});
}

export async function _createMode002(cwd: string)
{
	let new_name = 'rebuild/' + moment().format('YYYY-MM-DD-HH-mm-ss');

	await createEmptyBranch(new_name, {
		cwd,
	});

	console.info(`create branch "${new_name}"`);
}
