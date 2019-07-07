"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FastGlob = require("fast-glob");
const fs = require("fs-extra");
const CrossSpawn = require("cross-spawn-extra");
const Bluebird = require("bluebird");
const moment = require("moment");
//import gitlog from 'gitlog2';
const gitlog = require("gitlog2");
const GitRoot = require("git-root2");
const path = require("upath2");
const emailNormalize = require("email-normalize");
const UString = require("uni-string");
const create_new_empty_1 = require("./lib/create-new-empty");
const util_1 = require("@git-lazy/util");
exports.console = util_1.console;
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
    let fullpath = path.join(repo, file);
    let log = await gitlog.async({
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
    return Bluebird.resolve(FastGlob.async([
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
        deep: true,
        onlyFiles: true,
        cwd: repo,
    }))
        .reduce(async function (data, file) {
        let row = await fetchFileLogRow(repo, file).catch();
        if (row) {
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
    email = emailNormalize(email || 'testbot@test.test')
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
    if (/[^\w \.]/.test(name) && UString.size(name) > 15) {
        name = UString.slice(name, 0, 20);
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
    }).then(function () {
        let msg = row.log.rawBody;
        let ext = path.extname(row.file)
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
        });
    });
}
exports.git_commit_file = git_commit_file;
async function git_get_user(cwd) {
    let cp = await CrossSpawn.async('git', [
        'config',
        '--local',
        'user.name',
    ], {
        cwd,
        stripAnsi: true,
    });
    let name = trim(cp.output[1].toString());
    cp = await CrossSpawn.async('git', [
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
exports.git_set_user = git_set_user;
function runAllJob(cwd) {
    cwd = path.normalize(cwd);
    return Bluebird.resolve()
        .tap(async function () {
        util_1.console.info(`檢查路徑`);
        let file;
        file = '.git/config';
        if (!fs.pathExistsSync(path.join(cwd, file))) {
            throw new RangeError(`'${cwd}' not a git repo`);
        }
        file = '.node-novel.epub.gitkeep';
        if (!fs.pathExistsSync(path.join(cwd, file))) {
            throw new RangeError(`'${file}' not exists`);
        }
        let root = await GitRoot.async(cwd)
            .then(r => path.normalize(r));
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
        util_1.console.info(`複製舊有 git 設定`);
        await Bluebird.map(FastGlob.async([
            'config',
            'hooks/**/*',
            'info/**/*',
        ], {
            cwd: _git_path_backup,
        }), function (file) {
            return fs.copy(path.join(_git_path_backup, file), path.join(_git_path, file), {
                preserveTimestamps: true,
                overwrite: true,
            }).then(r => util_1.console.debug('[copy]', file));
        });
        util_1.console.info(`開始偽造檔案歷史紀錄`);
        await Bluebird.mapSeries(oldData, function (item, index, len) {
            util_1.console.debug('[commit]', `[${index}/${len}]`, item[0], moment(item[1].log.authorDateTimestamp).format());
            return git_commit_file(item[1], cwd);
        });
    })
        .tap(function () {
        util_1.console.debug(`Done`);
    });
}
exports.runAllJob = runAllJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNDQUF1QztBQUN2QywrQkFBZ0M7QUFDaEMsZ0RBQWlEO0FBQ2pELHFDQUFzQztBQUN0QyxpQ0FBa0M7QUFDbEMsK0JBQStCO0FBQy9CLGtDQUFtQztBQUNuQyxxQ0FBc0M7QUFDdEMsK0JBQWdDO0FBQ2hDLGtEQUFtRDtBQUNuRCxzQ0FBdUM7QUFFdkMsNkRBQXdFO0FBQ3hFLHlDQUF5QztBQUVoQyxrQkFGQSxjQUFPLENBRUE7QUFpQmhCLG9EQUFvRDtBQUNwRCxpRUFBaUU7QUFDakUsSUFBSTtBQUNKLGdFQUFnRTtBQUNoRSxLQUFLO0FBQ0wsa0JBQWtCO0FBQ2xCLElBQUk7QUFDSixxQkFBcUI7QUFDckIsSUFBSTtBQUNKLGdHQUFnRztBQUNoRyxFQUFFO0FBQ0Ysb0NBQW9DO0FBQ3BDLEtBQUs7QUFDTCxHQUFHO0FBSUgsNEZBQTRGO0FBRXJGLEtBQUssVUFBVSxlQUFlLENBQUMsSUFBWSxFQUFFLElBQVk7SUFFL0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFckMsSUFBSSxHQUFHLEdBQTJCLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNuRCxJQUFJO1FBQ0osSUFBSTtRQUNKLGVBQWUsRUFBRSxJQUFJO1FBRXJCLE1BQU0sRUFBRSxDQUFDO0tBQ1QsQ0FBQztTQUNELElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVuQixJQUFJLEdBQUcsRUFDUDtRQUNDLDZDQUE2QztRQUU3QyxhQUFhO1FBQ2IsR0FBRyxDQUFDLG1CQUFtQixHQUFHLEdBQUcsQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7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QUFLLENBQUMsVUFBVSxFQUFFLElBQUksS0FBSyxJQUFJLEdBQUcsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFFMUcsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQyxDQUFDO1NBQ0QsR0FBRyxDQUFDO1FBRUosY0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUM7QUEvR0QsOEJBK0dDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvdGVudiA9IHJlcXVpcmUoJ2RvdGVudicpO1xuaW1wb3J0IEZhc3RHbG9iID0gcmVxdWlyZSgnZmFzdC1nbG9iJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IENyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbi8vaW1wb3J0IGdpdGxvZyBmcm9tICdnaXRsb2cyJztcbmltcG9ydCBnaXRsb2cgPSByZXF1aXJlKCdnaXRsb2cyJyk7XG5pbXBvcnQgR2l0Um9vdCA9IHJlcXVpcmUoJ2dpdC1yb290MicpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBlbWFpbE5vcm1hbGl6ZSA9IHJlcXVpcmUoJ2VtYWlsLW5vcm1hbGl6ZScpO1xuaW1wb3J0IFVTdHJpbmcgPSByZXF1aXJlKCd1bmktc3RyaW5nJyk7XG5pbXBvcnQgeyBDb25zb2xlIH0gZnJvbSAnZGVidWctY29sb3IyJztcbmltcG9ydCB7IF9jcmVhdGVNb2RlMDAyLCBfY3JlYXRlTW9kZTAwMSB9IGZyb20gJy4vbGliL2NyZWF0ZS1uZXctZW1wdHknO1xuaW1wb3J0IHsgY29uc29sZSB9IGZyb20gJ0BnaXQtbGF6eS91dGlsJztcblxuZXhwb3J0IHsgY29uc29sZSB9XG5cbmV4cG9ydCB0eXBlIElGZXRjaEFsbEZpbGVMb2cgPSBbc3RyaW5nLCBJRmV0Y2hBbGxGaWxlTG9nUm93XVtdO1xuXG5leHBvcnQgaW50ZXJmYWNlIElGZXRjaEFsbEZpbGVMb2dSb3dcbntcblx0ZmlsZTogc3RyaW5nLFxuXHRmdWxscGF0aDogc3RyaW5nLFxuXHRsb2c6IElGZXRjaEFsbEZpbGVMb2dSb3dMb2csXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUZldGNoQWxsRmlsZUxvZ1Jvd0xvZyBleHRlbmRzIGdpdGxvZy5JUGFyc2VDb21taXRcbntcblx0YXV0aG9yRGF0ZVRpbWVzdGFtcD86IG51bWJlcixcblx0Y29tbWl0dGVyRGF0ZVRpbWVzdGFtcD86IG51bWJlcixcbn1cblxuLy9mZXRjaEFsbEZpbGVMb2cocGF0aC5qb2luKGdpdF9yZXBvLCAnZG16al9vdXQnKSwge1xuLy9cdHNvcnRGbihhOiBJRmV0Y2hBbGxGaWxlTG9nUm93LCBiOiBJRmV0Y2hBbGxGaWxlTG9nUm93KTogbnVtYmVyXG4vL1x0e1xuLy9cdFx0cmV0dXJuIGEubG9nLmF1dGhvckRhdGVUaW1lc3RhbXAgLSBiLmxvZy5hdXRob3JEYXRlVGltZXN0YW1wXG4vL1x0fSxcbi8vXHRzb3J0RGVzYzogdHJ1ZSxcbi8vfSlcbi8vXHQubWFwU2VyaWVzKGl0ZW0gPT5cbi8vXHR7XG4vL1x0XHRjb25zb2xlLmxvZyhpdGVtWzBdLCBpdGVtWzFdLmxvZy5yYXdCb2R5LCBtb21lbnQoaXRlbVsxXS5sb2cuYXV0aG9yRGF0ZVRpbWVzdGFtcCkuZm9ybWF0KCkpO1xuLy9cbi8vXHRcdHJldHVybiBnaXRfY29tbWl0X2ZpbGUoaXRlbVsxXSk7XG4vL1x0fSlcbi8vO1xuXG5cblxuLy9mZXRjaEZpbGVMb2dSb3cocGF0aC5qb2luKGdpdF9yZXBvLCAnY20nKSwgJ+eUseS6juS4lueVjOmtlOeJqea7oei9vS5lcHViJykudGhlbihyZXQgPT4gY29uc29sZS5sb2cocmV0KSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEZpbGVMb2dSb3cocmVwbzogc3RyaW5nLCBmaWxlOiBzdHJpbmcpXG57XG5cdGxldCBmdWxscGF0aCA9IHBhdGguam9pbihyZXBvLCBmaWxlKTtcblxuXHRsZXQgbG9nOiBJRmV0Y2hBbGxGaWxlTG9nUm93TG9nID0gYXdhaXQgZ2l0bG9nLmFzeW5jKHtcblx0XHRcdHJlcG8sXG5cdFx0XHRmaWxlLFxuXHRcdFx0cmV0dXJuQWxsRmllbGRzOiB0cnVlLFxuXG5cdFx0XHRudW1iZXI6IDEsXG5cdFx0fSlcblx0XHQudGhlbihscyA9PiBsc1swXSlcblx0XHQuY2F0Y2goZSA9PiBudWxsKTtcblxuXHRpZiAobG9nKVxuXHR7XG5cdFx0Ly9sZXQgbWYgPSBnaXRsb2cuRW51bUdpdERhdGVGb3JtYXQuSVNPXzg2MDE7XG5cblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0bG9nLmF1dGhvckRhdGVUaW1lc3RhbXAgPSBsb2cuYXV0aG9yRGF0ZVVuaXhUaW1lc3RhbXAgKiAxMDAwO1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRsb2cuY29tbWl0dGVyRGF0ZVRpbWVzdGFtcCA9IGxvZy5jb21taXR0ZXJEYXRlVW5peFRpbWVzdGFtcCAqIDEwMDA7XG5cblx0XHRsb2cucmF3Qm9keSA9IHRyaW0obG9nLnJhd0JvZHkpO1xuXG5cdFx0bGV0IHJvdzogSUZldGNoQWxsRmlsZUxvZ1JvdyA9IHtcblx0XHRcdGZpbGUsXG5cdFx0XHRmdWxscGF0aCxcblx0XHRcdGxvZyxcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHJvdztcblx0fVxufVxuXG5mdW5jdGlvbiB0cmltKHRleHQ6IHN0cmluZylcbntcblx0cmV0dXJuIHRleHRcblx0XHQucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZmV0Y2hBbGxGaWxlTG9nKHJlcG86IHN0cmluZywgb3B0aW9ucz86IHtcblx0c29ydEZuPyhhOiBJRmV0Y2hBbGxGaWxlTG9nUm93LCBiOiBJRmV0Y2hBbGxGaWxlTG9nUm93KTogbnVtYmVyLFxuXHRzb3J0RGVzYz86IGJvb2xlYW4sXG59KVxue1xuXHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZShGYXN0R2xvYi5hc3luYzxzdHJpbmc+KFtcblx0XHRcdCcqJyxcblx0XHRcdCcqKi8qJyxcblx0XHRcdCchLmdpdCcsXG5cdFx0XHQnISouZ2l0Jyxcblx0XHRcdCchKi5naXQvKionLFxuXHRcdFx0JyFiYWNrdXAuZ2l0Jyxcblx0XHRcdCchYmFja3VwLmdpdC8qKicsXG5cdFx0XHQnLmdpdGlnbm9yZScsXG5cdFx0XHQnLm5vZGUtbm92ZWwuZXB1Yi5naXRrZWVwJyxcblx0XHRdLCB7XG5cdFx0XHRkZWVwOiB0cnVlLFxuXHRcdFx0b25seUZpbGVzOiB0cnVlLFxuXHRcdFx0Y3dkOiByZXBvLFxuXHRcdH0pKVxuXHRcdC5yZWR1Y2UoYXN5bmMgZnVuY3Rpb24gKGRhdGEsIGZpbGUpXG5cdFx0e1xuXHRcdFx0bGV0IHJvdyA9IGF3YWl0IGZldGNoRmlsZUxvZ1JvdyhyZXBvLCBmaWxlKS5jYXRjaCgpO1xuXG5cdFx0XHRpZiAocm93KVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhLnB1c2goW2ZpbGUsIHJvd10pXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0sIFtdIGFzIElGZXRjaEFsbEZpbGVMb2cpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGxzKVxuXHRcdHtcblx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuc29ydEZuKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzb3J0Rm4gPSBvcHRpb25zLnNvcnRGbjtcblx0XHRcdFx0Y29uc3Qgc29ydERlc2MgPSAhIW9wdGlvbnMuc29ydERlc2M7XG5cblx0XHRcdFx0bHMgPSBscy5zb3J0KGZ1bmN0aW9uIChhLCBiKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IG4gPSArc29ydEZuKGFbMV0sIGJbMV0pO1xuXG5cdFx0XHRcdFx0cmV0dXJuIChzb3J0RGVzYyA/IDAgLSBuIDogbikgfHwgMDtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsc1xuXHRcdH0pXG5cdFx0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2l0X2Zha2VfYXV0aG9yKG5hbWU/OiBzdHJpbmcsIGVtYWlsPzogc3RyaW5nKVxue1xuXHRlbWFpbCA9IGVtYWlsTm9ybWFsaXplKGVtYWlsIHx8ICd0ZXN0Ym90QHRlc3QudGVzdCcpXG5cdFx0LnJlcGxhY2UoL15bXFxz44CAQF0rfFtcXHPjgIBAXSskL2csICcnKVxuXHQ7XG5cblx0aWYgKGVtYWlsLnNwbGl0KCdAJykubGVuZ3RoICE9PSAyKVxuXHR7XG5cdFx0ZW1haWwgPSBudWxsO1xuXHR9XG5cblx0bmFtZSA9IChuYW1lIHx8ICcnKVxuXHRcdC5yZXBsYWNlKC9bXFwtXFwrXFw8XFw+XFxbXFxdXFw/XFwqQFxcc1wiXFwnYH5cXHtcXH1dKy9pZywgJyAnKVxuXHQ7XG5cblx0dHJ5XG5cdHtcblx0XHRuYW1lID0gbmFtZVxuXHRcdFx0LnJlcGxhY2UoL1tcXHB7UHVuY3R1YXRpb259XS91ZywgZnVuY3Rpb24gKHMpXG5cdFx0XHR7XG5cdFx0XHRcdGlmICgvXltcXC5dJC8udGVzdChzKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBzO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuICcgJztcblx0XHRcdH0pXG5cdFx0XHQucmVwbGFjZSgvXltcXHPjgIBcXHB7UHVuY3R1YXRpb259XSt8W1xcc+OAgFxccHtQdW5jdHVhdGlvbn1dKyQvdWcsICcnKVxuXHRcdDtcblx0fVxuXHRjYXRjaCAoZSlcblx0e1xuXG5cdH1cblxuXHRuYW1lID0gbmFtZVxuXHRcdC5yZXBsYWNlKC9eW1xcc+OAgF0rfFtcXHPjgIBcXC5dKyQvZywgJycpXG5cdFx0LnJlcGxhY2UoL1xccysvZywgJyAnKVxuXHQ7XG5cblx0aWYgKC9bXlxcdyBcXC5dLy50ZXN0KG5hbWUpICYmIFVTdHJpbmcuc2l6ZShuYW1lKSA+IDE1KVxuXHR7XG5cdFx0bmFtZSA9IFVTdHJpbmcuc2xpY2UobmFtZSwgMCwgMjApO1xuXHR9XG5cblx0aWYgKG5hbWUgPT0gJ2VzIGInKVxuXHR7XG5cdFx0bmFtZSA9ICcnO1xuXHR9XG5cblx0cmV0dXJuIGAke25hbWUgfHwgJ3Rlc3Rib3QnfSA8JHtlbWFpbCB8fCAndGVzdGJvdEB0ZXN0LnRlc3QnfT5gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2l0X2NvbW1pdF9maWxlKHJvdzogSUZldGNoQWxsRmlsZUxvZ1JvdywgY3dkPzogc3RyaW5nKVxue1xuXHRsZXQgYXV0aG9yX25hbWU6IHN0cmluZyA9IGdpdF9mYWtlX2F1dGhvcihyb3cubG9nLmF1dGhvck5hbWUsIHJvdy5sb2cuYXV0aG9yRW1haWwpO1xuXG5cdGlmICghY3dkKVxuXHR7XG5cdFx0Y3dkID0gcGF0aC5kaXJuYW1lKHJvdy5mdWxscGF0aCk7XG5cdH1cblxuXHRyZXR1cm4gQ3Jvc3NTcGF3bi5hc3luYygnZ2l0JywgW1xuXHRcdCdhZGQnLFxuXHRcdCctLXZlcmJvc2UnLFxuXHRcdCctLWZvcmNlJyxcblx0XHRyb3cuZnVsbHBhdGgsXG5cdF0sIHtcblx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdGN3ZCxcblx0fSkudGhlbihmdW5jdGlvbiAoKVxuXHR7XG5cdFx0bGV0IG1zZyA9IHJvdy5sb2cucmF3Qm9keTtcblx0XHRsZXQgZXh0ID0gcGF0aC5leHRuYW1lKHJvdy5maWxlKVxuXHRcdFx0LnJlcGxhY2UoL15cXC4vLCAnJylcblx0XHQ7XG5cblx0XHRpZiAobXNnID09ICdhZGQgbWlzcyBmaWxlJylcblx0XHR7XG5cdFx0XHRtc2cgPSBgJHtyb3cuZmlsZX1gO1xuXG5cdFx0XHRpZiAoZXh0KVxuXHRcdFx0e1xuXHRcdFx0XHRtc2cgPSBgWyR7ZXh0fV1gICsgbXNnO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIGlmIChleHQpXG5cdFx0e1xuXHRcdFx0bXNnID0gbXNnLnJlcGxhY2UoL1xcWyhlcHVifHR4dClcXF0vaSwgYFske2V4dH1dYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblxuXHRcdFx0J2NvbW1pdCcsXG5cblx0XHRcdC8vJy0tdmVyYm9zZScsXG5cblx0XHRcdC8vJy0tc2hvcnQnLFxuXG5cdFx0XHQnLS11bnRyYWNrZWQtZmlsZXM9bm8nLFxuXG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRgLS1kYXRlPSR7bW9tZW50KHJvdy5sb2cuYXV0aG9yRGF0ZVRpbWVzdGFtcCkuZm9ybWF0KGdpdGxvZy5FbnVtR2l0RGF0ZUZvcm1hdC5JU09fODYwMSl9YCxcblx0XHRcdGAtLWF1dGhvcj0ke2F1dGhvcl9uYW1lfWAsXG5cblx0XHRcdC8vJy0tZHJ5LXJ1bicsXG5cblx0XHRcdGAtbWAsXG5cdFx0XHRtc2csXG5cblx0XHRcdCctLScsXG5cdFx0XHRyb3cuZnVsbHBhdGgsXG5cblx0XHRdLCB7XG5cdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0Y3dkLFxuXHRcdH0pXG5cdH0pXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnaXRfZ2V0X3VzZXIoY3dkOiBzdHJpbmcpXG57XG5cdGxldCBjcCA9IGF3YWl0IENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblx0XHQnY29uZmlnJyxcblx0XHQnLS1sb2NhbCcsXG5cdFx0J3VzZXIubmFtZScsXG5cdF0sIHtcblx0XHRjd2QsXG5cdFx0c3RyaXBBbnNpOiB0cnVlLFxuXHR9KTtcblxuXHRsZXQgbmFtZTogc3RyaW5nID0gdHJpbShjcC5vdXRwdXRbMV0udG9TdHJpbmcoKSk7XG5cblx0Y3AgPSBhd2FpdCBDcm9zc1NwYXduLmFzeW5jKCdnaXQnLCBbXG5cdFx0J2NvbmZpZycsXG5cdFx0Jy0tbG9jYWwnLFxuXHRcdCd1c2VyLmVtYWlsJyxcblx0XSwge1xuXHRcdGN3ZCxcblx0XHRzdHJpcEFuc2k6IHRydWUsXG5cdH0pO1xuXG5cdGxldCBlbWFpbDogc3RyaW5nID0gdHJpbShjcC5vdXRwdXRbMV0udG9TdHJpbmcoKSk7XG5cblx0cmV0dXJuIHtcblx0XHRuYW1lLFxuXHRcdGVtYWlsLFxuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnaXRfc2V0X3VzZXIobmFtZTogc3RyaW5nLCBlbWFpbDogc3RyaW5nLCBjd2Q6IHN0cmluZylcbntcblx0YXdhaXQgQ3Jvc3NTcGF3bi5hc3luYygnZ2l0JywgW1xuXHRcdCdjb25maWcnLFxuXHRcdCctLWxvY2FsJyxcblx0XHQndXNlci5uYW1lJyxcblx0XHRuYW1lLFxuXHRdLCB7XG5cdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRjd2QsXG5cdH0pO1xuXG5cdGF3YWl0IENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblx0XHQnY29uZmlnJyxcblx0XHQnLS1sb2NhbCcsXG5cdFx0J3VzZXIuZW1haWwnLFxuXHRcdGVtYWlsLFxuXHRdLCB7XG5cdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRjd2QsXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuQWxsSm9iKGN3ZDogc3RyaW5nKVxue1xuXHRjd2QgPSBwYXRoLm5vcm1hbGl6ZShjd2QpO1xuXG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHQudGFwKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5pbmZvKGDmqqLmn6Xot6/lvpFgKTtcblxuXHRcdFx0bGV0IGZpbGU6IHN0cmluZztcblxuXHRcdFx0ZmlsZSA9ICcuZ2l0L2NvbmZpZyc7XG5cblx0XHRcdGlmICghZnMucGF0aEV4aXN0c1N5bmMocGF0aC5qb2luKGN3ZCwgZmlsZSkpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJyR7Y3dkfScgbm90IGEgZ2l0IHJlcG9gKTtcblx0XHRcdH1cblxuXHRcdFx0ZmlsZSA9ICcubm9kZS1ub3ZlbC5lcHViLmdpdGtlZXAnO1xuXG5cdFx0XHRpZiAoIWZzLnBhdGhFeGlzdHNTeW5jKHBhdGguam9pbihjd2QsIGZpbGUpKSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoYCcke2ZpbGV9JyBub3QgZXhpc3RzYCk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCByb290ID0gYXdhaXQgR2l0Um9vdC5hc3luYyhjd2QpXG5cdFx0XHRcdC50aGVuKHIgPT4gcGF0aC5ub3JtYWxpemUocikpO1xuXG5cdFx0XHRpZiAocm9vdCAhPT0gY3dkIHx8ICFjd2QgfHwgIXJvb3QpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGAnJHtjd2R9JyBub3QgYSBnaXQgcm9vdGApO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmluZm8oYOWPluW+l+aJgOacieaqlOahiOeahOatt+WPsue0gOmMhGApO1xuXG5cdFx0XHRyZXR1cm4gZmV0Y2hBbGxGaWxlTG9nKGN3ZCwge1xuXHRcdFx0XHRzb3J0Rm4oYTogSUZldGNoQWxsRmlsZUxvZ1JvdywgYjogSUZldGNoQWxsRmlsZUxvZ1Jvdyk6IG51bWJlclxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGEubG9nLmF1dGhvckRhdGVUaW1lc3RhbXAgLSBiLmxvZy5hdXRob3JEYXRlVGltZXN0YW1wXG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vc29ydERlc2M6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0XHQvKlxuXHRcdFx0XHQubWFwU2VyaWVzKGl0ZW0gPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGl0ZW1bMF0sIGl0ZW1bMV0ubG9nLnJhd0JvZHksIG1vbWVudChpdGVtWzFdLmxvZy5hdXRob3JEYXRlVGltZXN0YW1wKS5mb3JtYXQoKSk7XG5cblx0XHRcdFx0XHRyZXR1cm4gZ2l0X2NvbW1pdF9maWxlKGl0ZW1bMV0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQqL1xuXHRcdFx0XHQ7XG5cdFx0fSlcblx0XHQudGFwKGFzeW5jIGZ1bmN0aW9uIChvbGREYXRhKVxuXHRcdHtcblx0XHRcdGF3YWl0IF9jcmVhdGVNb2RlMDAxKGN3ZCk7XG5cblx0XHRcdGxldCB7IG5hbWUsIGVtYWlsIH0gPSBhd2FpdCBnaXRfZ2V0X3VzZXIoY3dkKTtcblxuXHRcdFx0bGV0IF9naXRfcGF0aCA9IHBhdGguam9pbihjd2QsICcuZ2l0Jyk7XG5cdFx0XHRsZXQgX2dpdF9wYXRoX2JhY2t1cCA9IHBhdGguam9pbihjd2QsICdiYWNrdXAuZ2l0Jyk7XG5cblx0XHRcdC8qXG5cdFx0XHRjb25zb2xlLmluZm8oYOa4hemZpCBiYWNrdXAuZ2l0YCk7XG5cdFx0XHRhd2FpdCBmcy5yZW1vdmUoX2dpdF9wYXRoX2JhY2t1cCk7XG5cblx0XHRcdGNvbnNvbGUuaW5mbyhgLmdpdCDmm7TlkI3ngrogYmFja3VwLmdpdGApO1xuXHRcdFx0YXdhaXQgZnMubW92ZShfZ2l0X3BhdGgsIF9naXRfcGF0aF9iYWNrdXApO1xuXG5cdFx0XHRhd2FpdCBDcm9zc1NwYXduLmFzeW5jKCdnaXQnLCBbXG5cdFx0XHRcdCdpbml0Jyxcblx0XHRcdF0sIHtcblx0XHRcdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRcdFx0Y3dkLFxuXHRcdFx0fSk7XG5cdFx0XHQqL1xuXG5cdFx0XHQvL2F3YWl0IGdpdF9zZXRfdXNlcihuYW1lLCBlbWFpbCwgY3dkKTtcblxuXHRcdFx0Y29uc29sZS5pbmZvKGDopIfoo73oiIrmnIkgZ2l0IOioreWummApO1xuXG5cdFx0XHRhd2FpdCBCbHVlYmlyZC5tYXAoRmFzdEdsb2IuYXN5bmM8c3RyaW5nPihbXG5cdFx0XHRcdCdjb25maWcnLFxuXHRcdFx0XHQnaG9va3MvKiovKicsXG5cdFx0XHRcdCdpbmZvLyoqLyonLFxuXHRcdFx0XSwge1xuXHRcdFx0XHRjd2Q6IF9naXRfcGF0aF9iYWNrdXAsXG5cdFx0XHR9KSwgZnVuY3Rpb24gKGZpbGUpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmcy5jb3B5KHBhdGguam9pbihfZ2l0X3BhdGhfYmFja3VwLCBmaWxlKSwgcGF0aC5qb2luKF9naXRfcGF0aCwgZmlsZSksIHtcblx0XHRcdFx0XHRwcmVzZXJ2ZVRpbWVzdGFtcHM6IHRydWUsXG5cdFx0XHRcdFx0b3ZlcndyaXRlOiB0cnVlLFxuXHRcdFx0XHR9KS50aGVuKHIgPT4gY29uc29sZS5kZWJ1ZygnW2NvcHldJywgZmlsZSkpXG5cdFx0XHR9KVxuXHRcdFx0O1xuXG5cdFx0XHRjb25zb2xlLmluZm8oYOmWi+Wni+WBvemAoOaqlOahiOatt+WPsue0gOmMhGApO1xuXG5cdFx0XHRhd2FpdCBCbHVlYmlyZC5tYXBTZXJpZXMob2xkRGF0YSwgZnVuY3Rpb24gKGl0ZW0sIGluZGV4LCBsZW4pXG5cdFx0XHR7XG5cdFx0XHRcdGNvbnNvbGUuZGVidWcoJ1tjb21taXRdJywgYFske2luZGV4fS8ke2xlbn1dYCwgaXRlbVswXSwgbW9tZW50KGl0ZW1bMV0ubG9nLmF1dGhvckRhdGVUaW1lc3RhbXApLmZvcm1hdCgpKTtcblxuXHRcdFx0XHRyZXR1cm4gZ2l0X2NvbW1pdF9maWxlKGl0ZW1bMV0sIGN3ZCk7XG5cdFx0XHR9KVxuXHRcdH0pXG5cdFx0LnRhcChmdW5jdGlvbiAoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUuZGVidWcoYERvbmVgKTtcblx0XHR9KVxuXHRcdDtcbn1cbiJdfQ==