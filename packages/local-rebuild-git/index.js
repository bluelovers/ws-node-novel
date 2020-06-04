"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllJob = exports.git_set_user = exports.git_get_user = exports.git_commit_file = exports.git_fake_author = exports.fetchAllFileLog = exports.fetchFileLogRow = exports.console = void 0;
const fast_glob_1 = __importDefault(require("@bluelovers/fast-glob"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const cross_spawn_extra_1 = __importDefault(require("cross-spawn-extra"));
const bluebird_1 = __importDefault(require("bluebird"));
const moment_1 = __importDefault(require("moment"));
//import gitlog from 'gitlog2';
const gitlog2_1 = __importDefault(require("gitlog2"));
const git_root2_1 = __importDefault(require("git-root2"));
const upath2_1 = __importDefault(require("upath2"));
const email_normalize_1 = __importDefault(require("email-normalize"));
const uni_string_1 = __importDefault(require("uni-string"));
const create_new_empty_1 = require("./lib/create-new-empty");
const util_1 = require("@git-lazy/util");
Object.defineProperty(exports, "console", { enumerable: true, get: function () { return util_1.console; } });
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
async function fetchFileLogRow(repo, file) {
    let fullpath = upath2_1.default.join(repo, file);
    let log = await gitlog2_1.default.async({
        repo,
        file,
        returnAllFields: true,
        number: 1,
    })
        .then(ls => ls[0])
        .catch(e => null);
    if (log) {
        //let mf = gitlog.EnumGitDateFormat.ISO_8601;
        // @ts-ignore
        log.authorDateTimestamp = log.authorDateUnixTimestamp * 1000;
        // @ts-ignore
        log.committerDateTimestamp = log.committerDateUnixTimestamp * 1000;
        log.rawBody = trim(log.rawBody);
        let row = {
            file,
            fullpath,
            log,
        };
        return row;
    }
}
exports.fetchFileLogRow = fetchFileLogRow;
function trim(text) {
    return text
        .replace(/^\s+|\s+$/g, '');
}
function fetchAllFileLog(repo, options) {
    return bluebird_1.default.resolve(fast_glob_1.default.async([
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
        .reduce(async function (data, file) {
        // @ts-ignore
        let row = await fetchFileLogRow(repo, file).catch();
        if (row) {
            // @ts-ignore
            data.push([file, row]);
        }
        return data;
    }, [])
        .then(function (ls) {
        if (options && options.sortFn) {
            const sortFn = options.sortFn;
            const sortDesc = !!options.sortDesc;
            ls = ls.sort(function (a, b) {
                let n = +sortFn(a[1], b[1]);
                return (sortDesc ? 0 - n : n) || 0;
            });
        }
        return ls;
    });
}
exports.fetchAllFileLog = fetchAllFileLog;
function git_fake_author(name, email) {
    email = email_normalize_1.default(email || 'testbot@test.test')
        .replace(/^[\s　@]+|[\s　@]+$/g, '');
    if (email.split('@').length !== 2) {
        email = null;
    }
    name = (name || '')
        .replace(/[\-\+\<\>\[\]\?\*@\s"\'`~\{\}]+/ig, ' ');
    try {
        name = name
            .replace(/[\p{Punctuation}]/ug, function (s) {
            if (/^[\.]$/.test(s)) {
                return s;
            }
            return ' ';
        })
            .replace(/^[\s　\p{Punctuation}]+|[\s　\p{Punctuation}]+$/ug, '');
    }
    catch (e) {
    }
    name = name
        .replace(/^[\s　]+|[\s　\.]+$/g, '')
        .replace(/\s+/g, ' ');
    if (/[^\w \.]/.test(name) && uni_string_1.default.size(name) > 15) {
        name = uni_string_1.default.slice(name, 0, 20);
    }
    if (name == 'es b') {
        name = '';
    }
    return `${name || 'testbot'} <${email || 'testbot@test.test'}>`;
}
exports.git_fake_author = git_fake_author;
function git_commit_file(row, cwd) {
    let author_name = git_fake_author(row.log.authorName, row.log.authorEmail);
    if (!cwd) {
        cwd = upath2_1.default.dirname(row.fullpath);
    }
    return cross_spawn_extra_1.default.async('git', [
        'add',
        '--verbose',
        '--force',
        row.fullpath,
    ], {
        stdio: 'inherit',
        cwd,
    }).then(function () {
        let msg = row.log.rawBody;
        let ext = upath2_1.default.extname(row.file)
            .replace(/^\./, '');
        if (msg == 'add miss file') {
            msg = `${row.file}`;
            if (ext) {
                msg = `[${ext}]` + msg;
            }
        }
        else if (ext) {
            msg = msg.replace(/\[(epub|txt)\]/i, `[${ext}]`);
        }
        return cross_spawn_extra_1.default.async('git', [
            'commit',
            //'--verbose',
            //'--short',
            '--untracked-files=no',
            // @ts-ignore
            `--date=${moment_1.default(row.log.authorDateTimestamp).format(gitlog2_1.default.EnumGitDateFormat.ISO_8601)}`,
            `--author=${author_name}`,
            //'--dry-run',
            `-m`,
            msg,
            '--',
            row.fullpath,
        ], {
            stdio: 'inherit',
            cwd,
        });
    });
}
exports.git_commit_file = git_commit_file;
async function git_get_user(cwd) {
    let cp = await cross_spawn_extra_1.default.async('git', [
        'config',
        '--local',
        'user.name',
    ], {
        cwd,
        stripAnsi: true,
    });
    let name = trim(cp.output[1].toString());
    cp = await cross_spawn_extra_1.default.async('git', [
        'config',
        '--local',
        'user.email',
    ], {
        cwd,
        stripAnsi: true,
    });
    let email = trim(cp.output[1].toString());
    return {
        name,
        email,
    };
}
exports.git_get_user = git_get_user;
async function git_set_user(name, email, cwd) {
    await cross_spawn_extra_1.default.async('git', [
        'config',
        '--local',
        'user.name',
        name,
    ], {
        stdio: 'inherit',
        cwd,
    });
    await cross_spawn_extra_1.default.async('git', [
        'config',
        '--local',
        'user.email',
        email,
    ], {
        stdio: 'inherit',
        cwd,
    });
}
exports.git_set_user = git_set_user;
function runAllJob(cwd) {
    cwd = upath2_1.default.normalize(cwd);
    return bluebird_1.default.resolve()
        .tap(async function () {
        util_1.console.info(`檢查路徑`);
        let file;
        file = '.git/config';
        if (!fs_extra_1.default.pathExistsSync(upath2_1.default.join(cwd, file))) {
            throw new RangeError(`'${cwd}' not a git repo`);
        }
        file = '.node-novel.epub.gitkeep';
        if (!fs_extra_1.default.pathExistsSync(upath2_1.default.join(cwd, file))) {
            throw new RangeError(`'${file}' not exists`);
        }
        let root = await git_root2_1.default.async(cwd)
            .then(r => upath2_1.default.normalize(r));
        if (root !== cwd || !cwd || !root) {
            throw new RangeError(`'${cwd}' not a git root`);
        }
    })
        .then(function () {
        util_1.console.info(`取得所有檔案的歷史紀錄`);
        return fetchAllFileLog(cwd, {
            sortFn(a, b) {
                return a.log.authorDateTimestamp - b.log.authorDateTimestamp;
            },
        });
    })
        .tap(async function (oldData) {
        await create_new_empty_1._createMode001(cwd);
        let { name, email } = await git_get_user(cwd);
        let _git_path = upath2_1.default.join(cwd, '.git');
        let _git_path_backup = upath2_1.default.join(cwd, 'backup.git');
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
        util_1.console.info(`複製舊有 git 設定`);
        await bluebird_1.default.map(fast_glob_1.default.async([
            'config',
            'hooks/**/*',
            'info/**/*',
        ], {
            cwd: _git_path_backup,
        }), function (file) {
            return fs_extra_1.default.copy(upath2_1.default.join(_git_path_backup, file), upath2_1.default.join(_git_path, file), {
                preserveTimestamps: true,
                overwrite: true,
            }).then(r => util_1.console.debug('[copy]', file));
        });
        util_1.console.info(`開始偽造檔案歷史紀錄`);
        await bluebird_1.default.mapSeries(oldData, function (item, index, len) {
            util_1.console.debug('[commit]', `[${index}/${len}]`, item[0], moment_1.default(item[1].log.authorDateTimestamp).format());
            return git_commit_file(item[1], cwd);
        });
    })
        .tap(function () {
        util_1.console.debug(`Done`);
    });
}
exports.runAllJob = runAllJob;
//# sourceMappingURL=index.js.map