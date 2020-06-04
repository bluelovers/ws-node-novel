import dotenv from 'dotenv';
import FastGlob from '@bluelovers/fast-glob';
import fs from 'fs-extra';
import CrossSpawn from 'cross-spawn-extra';
import Bluebird from 'bluebird';
import moment from 'moment';
//import gitlog from 'gitlog2';
import gitlog, { IParseCommit } from 'gitlog2';
import GitRoot from 'git-root2';
import path from 'upath2';
import emailNormalize from 'email-normalize';
import UString from 'uni-string';
import { Console } from 'debug-color2';
import { _createMode002, _createMode001 } from './lib/create-new-empty';
import { console } from '@git-lazy/util';

export { console }

export type IFetchAllFileLog = [string, IFetchAllFileLogRow][];

export interface IFetchAllFileLogRow
{
	file: string,
	fullpath: string,
	log: IFetchAllFileLogRowLog,
}

export interface IFetchAllFileLogRowLog extends IParseCommit
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
		.catch(e => null);

	if (log)
	{
		//let mf = gitlog.EnumGitDateFormat.ISO_8601;

		// @ts-ignore
		log.authorDateTimestamp = log.authorDateUnixTimestamp * 1000;
		// @ts-ignore
		log.committerDateTimestamp = log.committerDateUnixTimestamp * 1000;

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
			'!*.git/**',
			'!backup.git',
			'!backup.git/**',
			'.gitignore',
			'.node-novel.epub.gitkeep',
		], {
		// @ts-ignore
			deep: true,
			onlyFiles: true,
			cwd: repo,
		}))
		.reduce(async function (data, file)
		{
			// @ts-ignore
			let row = await fetchFileLogRow(repo, file).catch();

			if (row)
			{
				// @ts-ignore
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

				ls = ls.sort(function (a, b)
				{
					let n = +sortFn(a[1], b[1]);

					return (sortDesc ? 0 - n : n) || 0;
				});
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
			.replace(/[\p{Punctuation}]/ug, function (s)
			{
				if (/^[\.]$/.test(s))
				{
					return s;
				}

				return ' ';
			})
			.replace(/^[\s　\p{Punctuation}]+|[\s　\p{Punctuation}]+$/ug, '')
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
		'--verbose',
		'--force',
		row.fullpath,
	], {
		stdio: 'inherit',
		cwd,
	}).then(function ()
	{
		let msg = row.log.rawBody;
		let ext = path.extname(row.file)
			.replace(/^\./, '')
		;

		if (msg == 'add miss file')
		{
			msg = `${row.file}`;

			if (ext)
			{
				msg = `[${ext}]` + msg;
			}
		}
		else if (ext)
		{
			msg = msg.replace(/\[(epub|txt)\]/i, `[${ext}]`);
		}

		return CrossSpawn.async('git', [

			'commit',

			//'--verbose',

			//'--short',

			'--untracked-files=no',

			// @ts-ignore
			`--date=${moment(row.log.authorDateTimestamp).format(gitlog.EnumGitDateFormat.ISO_8601)}`,
			`--author=${author_name}`,

			//'--dry-run',

			`-m`,
			msg,

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
			await _createMode001(cwd);

			let { name, email } = await git_get_user(cwd);

			let _git_path = path.join(cwd, '.git');
			let _git_path_backup = path.join(cwd, 'backup.git');

			/*
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
			*/

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

			await Bluebird.mapSeries(oldData, function (item, index, len)
			{
				console.debug('[commit]', `[${index}/${len}]`, item[0], moment(item[1].log.authorDateTimestamp).format());

				return git_commit_file(item[1], cwd);
			})
		})
		.tap(function ()
		{
			console.debug(`Done`);
		})
		;
}
