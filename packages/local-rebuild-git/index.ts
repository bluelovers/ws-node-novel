import dotenv = require('dotenv');
import FastGlob = require('fast-glob');
import fs = require('fs-extra');
import CrossSpawn = require('cross-spawn-extra');
import Bluebird = require('bluebird');
import moment = require('moment');
//import gitlog from 'gitlog2';
import gitlog = require('gitlog2');
import GitRoot = require('git-root2');
import path = require('upath2');
import emailNormalize = require('email-normalize');
import UString = require('uni-string');
import { console } from 'debug-color2';

let git_repo = 'C:\\Temp\\test-no-git-lfs';

console.enabledColor = true;

console.inspectOptions = console.inspectOptions || {};
console.inspectOptions.colors = true;

export type IFetchAllFileLog = [string, IFetchAllFileLogRow][];

export interface IFetchAllFileLogRow
{
	file: string,
	fullpath: string,
	log: IFetchAllFileLogRowLog,
}

export interface IFetchAllFileLogRowLog extends gitlog.IParseCommit
{
	authorDateTimestamp?: number,
	committerDateTimestamp?: number,
}

//fetchAllFileLog(path.join(git_repo, 'dmzj_out'), {
//	sortFn(a: IFetchAllFileLogRow, b: IFetchAllFileLogRow): number
//	{
//		return a.log.authorDateTimestamp - b.log.authorDateTimestamp
//	},
//	sortDesc: true,
//})
//	.mapSeries(item =>
//	{
//		console.log(item[0], item[1].log.rawBody, moment(item[1].log.authorDateTimestamp).format());
//
//		return git_commit_file(item[1]);
//	})
//;

runAllJob(path.join(git_repo)).then(ret => console.log(ret));

//fetchFileLogRow(path.join(git_repo, 'cm'), '由于世界魔物满载.epub').then(ret => console.log(ret));

export async function fetchFileLogRow(repo: string, file: string)
{
	let fullpath = path.join(repo, file);

	let log: IFetchAllFileLogRowLog = await gitlog.async({
			repo,
			file,
			returnAllFields: true,

			number: 1,
		})
		.then(ls => ls[0])
		.catch();

	if (log)
	{
		let mf = [
			gitlog.EnumGitDateFormat.AUTHOR_DATE,
			gitlog.EnumGitDateFormat.COMMITTER_DATE,
		];

		log.authorDateTimestamp = moment(log.authorDate, mf).valueOf();
		log.committerDateTimestamp = moment(log.committerDate, mf).valueOf();

		log.rawBody = trim(log.rawBody);

		let row: IFetchAllFileLogRow = {
			file,
			fullpath,
			log,
		};

		return row;
	}
}

function trim(text: string)
{
	return text
		.replace(/^\s+|\s+$/g, '')
		;
}

export function fetchAllFileLog(repo: string, options?: {
	sortFn?(a: IFetchAllFileLogRow, b: IFetchAllFileLogRow): number,
	sortDesc?: boolean,
})
{
	return Bluebird.resolve(FastGlob.async<string>([
			'*',
			'**/*',
			'!.git',
			'!*.git',
			'!backup.git',
		], {
			deep: true,
			onlyFiles: true,
			cwd: repo,
		}))
		.reduce(async function (data, file)
		{
			let row = await fetchFileLogRow(repo, file).catch();

			if (row)
			{
				data.push([file, row])
			}

			return data;
		}, [] as IFetchAllFileLog)
		.then(function (ls)
		{
			if (options && options.sortFn)
			{
				const sortFn = options.sortFn;
				const sortDesc = !!options.sortDesc;

				ls.sort(function (a, b)
				{
					let n = sortFn(a[1], b[1]) | 0;

					return sortDesc ? 0 - n : n;
				})
			}

			return ls
		})
		;
}

export function git_fake_author(name?: string, email?: string)
{
	email = emailNormalize(email || 'testbot@test.test')
		.replace(/^[\s　@]+|[\s　@]+$/g, '')
	;

	if (email.split('@').length !== 2)
	{
		email = null;
	}

	name = (name || '')
		.replace(/[\-\+\<\>\[\]\?\*@\s"\'`~\{\}]+/ig, ' ')
	;

	try
	{
		name = name
			.replace(/[\p{Punctuation}]/ig, function (s)
			{
				if (/^[\.]$/.test(s))
				{
					return s;
				}

				return ' ';
			})
			.replace(/^[\s　\p{Punctuation}]+|[\s　\p{Punctuation}]+$/g, '')
		;
	}
	catch (e)
	{

	}

	name = name
		.replace(/^[\s　]+|[\s　\.]+$/g, '')
		.replace(/\s+/g, ' ')
	;

	if (/[^\w \.]/.test(name) && UString.size(name) > 15)
	{
		name = UString.slice(name, 0, 20);
	}

	if (name == 'es b')
	{
		name = '';
	}

	return `${name || 'testbot'} <${email || 'testbot@test.test'}>`;
}

export function git_commit_file(row: IFetchAllFileLogRow, cwd?: string)
{
	let author_name: string = git_fake_author(row.log.authorName, row.log.authorEmail);

	if (!cwd)
	{
		cwd = path.dirname(row.fullpath);
	}

	return CrossSpawn.async('git', [
		'add',
		row.fullpath,
	], {
		stdio: 'inherit',
		cwd,
	}).then(function ()
	{
		return CrossSpawn.async('git', [

			'commit',

			//'--verbose',

			//'--short',

			'--untracked-files=no',

			`--date=${moment(row.log.authorDateTimestamp).format(gitlog.EnumGitDateFormat.AUTHOR_DATE)}`,
			`--author=${author_name}`,

			//'--dry-run',

			`-m`,
			row.log.rawBody,

			'--',
			row.fullpath,

		], {
			stdio: 'inherit',
			cwd,
		})
	})
}

export async function git_get_user(cwd: string)
{
	let cp = await CrossSpawn.async('git', [
		'config',
		'--local',
		'user.name',
	], {
		cwd,
		stripAnsi: true,
	});

	let name: string = trim(cp.output[1].toString());

	cp = await CrossSpawn.async('git', [
		'config',
		'--local',
		'user.email',
	], {
		cwd,
		stripAnsi: true,
	});

	let email: string = trim(cp.output[1].toString());

	return {
		name,
		email,
	}
}

export async function git_set_user(name: string, email: string, cwd: string)
{
	await CrossSpawn.async('git', [
		'config',
		'--local',
		'user.name',
		name,
	], {
		stdio: 'inherit',
		cwd,
	});

	await CrossSpawn.async('git', [
		'config',
		'--local',
		'user.email',
		email,
	], {
		stdio: 'inherit',
		cwd,
	});
}

export function runAllJob(cwd: string)
{
	cwd = path.normalize(cwd);

	return Bluebird.resolve()
		.tap(async function ()
		{
			console.info(`檢查路徑`);

			let file: string;

			file = '.git/config';

			if (!fs.pathExistsSync(path.join(cwd, file)))
			{
				throw new RangeError(`'${cwd}' not a git repo`);
			}

			file = '.node-novel.epub.gitkeep';

			if (!fs.pathExistsSync(path.join(cwd, file)))
			{
				throw new RangeError(`'${file}' not exists`);
			}

			let root = await GitRoot.async(cwd)
				.then(r => path.normalize(r));

			if (root !== cwd || !cwd || !root)
			{
				throw new RangeError(`'${cwd}' not a git root`);
			}
		})
		.then(function ()
		{
			console.info(`取得所有檔案的歷史紀錄`);

			return fetchAllFileLog(cwd, {
				sortFn(a: IFetchAllFileLogRow, b: IFetchAllFileLogRow): number
				{
					return a.log.authorDateTimestamp - b.log.authorDateTimestamp
				},
				//sortDesc: true,
			})
				/*
				.mapSeries(item =>
				{
					console.log(item[0], item[1].log.rawBody, moment(item[1].log.authorDateTimestamp).format());

					return git_commit_file(item[1]);
				})
				*/
				;
		})
		.tap(async function (oldData)
		{
			let { name, email } = await git_get_user(cwd);

			let _git_path = path.join(cwd, '.git');
			let _git_path_backup = path.join(cwd, 'backup.git');

			console.info(`清除 backup.git`);
			await fs.remove(_git_path_backup);

			console.info(`.git 更名為 backup.git`);
			await fs.move(_git_path, _git_path_backup);

			await CrossSpawn.async('git', [
				'init',
			], {
				stdio: 'inherit',
				cwd,
			});

			//await git_set_user(name, email, cwd);

			console.info(`複製舊有 git 設定`);

			await Bluebird.map(FastGlob.async<string>([
				'config',
				'hooks/**/*',
				'info/**/*',
			], {
				cwd: _git_path_backup,
			}), function (file)
			{
				return fs.copy(path.join(_git_path_backup, file), path.join(_git_path, file), {
					preserveTimestamps: true,
					overwrite: true,
				}).then(r => console.debug('[copy]', file))
			})
			;

			console.info(`開始偽造檔案歷史紀錄`);

			await Bluebird.mapSeries(oldData, function (item)
			{
				console.debug('[commit]', item[0], moment(item[1].log.authorDateTimestamp).format());

				return git_commit_file(item[1], cwd);
			})
		})
		.tap(function ()
		{
			console.debug(`Done`);
		})
		;
}
