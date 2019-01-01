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
const debug_color2_1 = require("debug-color2");
let git_repo = 'C:\\Temp\\test-no-git-lfs';
debug_color2_1.console.enabledColor = true;
debug_color2_1.console.inspectOptions = debug_color2_1.console.inspectOptions || {};
debug_color2_1.console.inspectOptions.colors = true;
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
runAllJob(path.join(git_repo)).then(ret => debug_color2_1.console.log(ret));
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
        .catch();
    if (log) {
        let mf = [
            gitlog.EnumGitDateFormat.AUTHOR_DATE,
            gitlog.EnumGitDateFormat.COMMITTER_DATE,
        ];
        log.authorDateTimestamp = moment(log.authorDate, mf).valueOf();
        log.committerDateTimestamp = moment(log.committerDate, mf).valueOf();
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
        '!backup.git',
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
            ls.sort(function (a, b) {
                let n = sortFn(a[1], b[1]) | 0;
                return sortDesc ? 0 - n : n;
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
            .replace(/[\p{Punctuation}]/ig, function (s) {
            if (/^[\.]$/.test(s)) {
                return s;
            }
            return ' ';
        })
            .replace(/^[\s　\p{Punctuation}]+|[\s　\p{Punctuation}]+$/g, '');
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
        row.fullpath,
    ], {
        stdio: 'inherit',
        cwd,
    }).then(function () {
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
        debug_color2_1.console.info(`檢查路徑`);
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
        debug_color2_1.console.info(`取得所有檔案的歷史紀錄`);
        return fetchAllFileLog(cwd, {
            sortFn(a, b) {
                return a.log.authorDateTimestamp - b.log.authorDateTimestamp;
            },
        });
    })
        .tap(async function (oldData) {
        let { name, email } = await git_get_user(cwd);
        let _git_path = path.join(cwd, '.git');
        let _git_path_backup = path.join(cwd, 'backup.git');
        debug_color2_1.console.info(`清除 backup.git`);
        await fs.remove(_git_path_backup);
        debug_color2_1.console.info(`.git 更名為 backup.git`);
        await fs.move(_git_path, _git_path_backup);
        await CrossSpawn.async('git', [
            'init',
        ], {
            stdio: 'inherit',
            cwd,
        });
        //await git_set_user(name, email, cwd);
        debug_color2_1.console.info(`複製舊有 git 設定`);
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
            }).then(r => debug_color2_1.console.debug('[copy]', file));
        });
        debug_color2_1.console.info(`開始偽造檔案歷史紀錄`);
        await Bluebird.mapSeries(oldData, function (item) {
            debug_color2_1.console.debug('[commit]', item[0], moment(item[1].log.authorDateTimestamp).format());
            return git_commit_file(item[1], cwd);
        });
    })
        .tap(function () {
        debug_color2_1.console.debug(`Done`);
    });
}
exports.runAllJob = runAllJob;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHNDQUF1QztBQUN2QywrQkFBZ0M7QUFDaEMsZ0RBQWlEO0FBQ2pELHFDQUFzQztBQUN0QyxpQ0FBa0M7QUFDbEMsK0JBQStCO0FBQy9CLGtDQUFtQztBQUNuQyxxQ0FBc0M7QUFDdEMsK0JBQWdDO0FBQ2hDLGtEQUFtRDtBQUNuRCxzQ0FBdUM7QUFDdkMsK0NBQXVDO0FBRXZDLElBQUksUUFBUSxHQUFHLDJCQUEyQixDQUFDO0FBRTNDLHNCQUFPLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztBQUU1QixzQkFBTyxDQUFDLGNBQWMsR0FBRyxzQkFBTyxDQUFDLGNBQWMsSUFBSSxFQUFFLENBQUM7QUFDdEQsc0JBQU8sQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQWlCckMsb0RBQW9EO0FBQ3BELGlFQUFpRTtBQUNqRSxJQUFJO0FBQ0osZ0VBQWdFO0FBQ2hFLEtBQUs7QUFDTCxrQkFBa0I7QUFDbEIsSUFBSTtBQUNKLHFCQUFxQjtBQUNyQixJQUFJO0FBQ0osZ0dBQWdHO0FBQ2hHLEVBQUU7QUFDRixvQ0FBb0M7QUFDcEMsS0FBSztBQUNMLEdBQUc7QUFFSCxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLHNCQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFFN0QsNEZBQTRGO0FBRXJGLEtBQUssVUFBVSxlQUFlLENBQUMsSUFBWSxFQUFFLElBQVk7SUFFL0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFckMsSUFBSSxHQUFHLEdBQTJCLE1BQU0sTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNuRCxJQUFJO1FBQ0osSUFB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LElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUUzQixNQUFNLFFBQVEsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsSUFBSTtZQUUvQyxzQkFBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUVyRixPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUE7SUFDSCxDQUFDLENBQUM7U0FDRCxHQUFHLENBQUM7UUFFSixzQkFBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixDQUFDLENBQUMsQ0FDRDtBQUNILENBQUM7QUEzR0QsOEJBMkdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGRvdGVudiA9IHJlcXVpcmUoJ2RvdGVudicpO1xuaW1wb3J0IEZhc3RHbG9iID0gcmVxdWlyZSgnZmFzdC1nbG9iJyk7XG5pbXBvcnQgZnMgPSByZXF1aXJlKCdmcy1leHRyYScpO1xuaW1wb3J0IENyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bi1leHRyYScpO1xuaW1wb3J0IEJsdWViaXJkID0gcmVxdWlyZSgnYmx1ZWJpcmQnKTtcbmltcG9ydCBtb21lbnQgPSByZXF1aXJlKCdtb21lbnQnKTtcbi8vaW1wb3J0IGdpdGxvZyBmcm9tICdnaXRsb2cyJztcbmltcG9ydCBnaXRsb2cgPSByZXF1aXJlKCdnaXRsb2cyJyk7XG5pbXBvcnQgR2l0Um9vdCA9IHJlcXVpcmUoJ2dpdC1yb290MicpO1xuaW1wb3J0IHBhdGggPSByZXF1aXJlKCd1cGF0aDInKTtcbmltcG9ydCBlbWFpbE5vcm1hbGl6ZSA9IHJlcXVpcmUoJ2VtYWlsLW5vcm1hbGl6ZScpO1xuaW1wb3J0IFVTdHJpbmcgPSByZXF1aXJlKCd1bmktc3RyaW5nJyk7XG5pbXBvcnQgeyBjb25zb2xlIH0gZnJvbSAnZGVidWctY29sb3IyJztcblxubGV0IGdpdF9yZXBvID0gJ0M6XFxcXFRlbXBcXFxcdGVzdC1uby1naXQtbGZzJztcblxuY29uc29sZS5lbmFibGVkQ29sb3IgPSB0cnVlO1xuXG5jb25zb2xlLmluc3BlY3RPcHRpb25zID0gY29uc29sZS5pbnNwZWN0T3B0aW9ucyB8fCB7fTtcbmNvbnNvbGUuaW5zcGVjdE9wdGlvbnMuY29sb3JzID0gdHJ1ZTtcblxuZXhwb3J0IHR5cGUgSUZldGNoQWxsRmlsZUxvZyA9IFtzdHJpbmcsIElGZXRjaEFsbEZpbGVMb2dSb3ddW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUZldGNoQWxsRmlsZUxvZ1Jvd1xue1xuXHRmaWxlOiBzdHJpbmcsXG5cdGZ1bGxwYXRoOiBzdHJpbmcsXG5cdGxvZzogSUZldGNoQWxsRmlsZUxvZ1Jvd0xvZyxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRmV0Y2hBbGxGaWxlTG9nUm93TG9nIGV4dGVuZHMgZ2l0bG9nLklQYXJzZUNvbW1pdFxue1xuXHRhdXRob3JEYXRlVGltZXN0YW1wPzogbnVtYmVyLFxuXHRjb21taXR0ZXJEYXRlVGltZXN0YW1wPzogbnVtYmVyLFxufVxuXG4vL2ZldGNoQWxsRmlsZUxvZyhwYXRoLmpvaW4oZ2l0X3JlcG8sICdkbXpqX291dCcpLCB7XG4vL1x0c29ydEZuKGE6IElGZXRjaEFsbEZpbGVMb2dSb3csIGI6IElGZXRjaEFsbEZpbGVMb2dSb3cpOiBudW1iZXJcbi8vXHR7XG4vL1x0XHRyZXR1cm4gYS5sb2cuYXV0aG9yRGF0ZVRpbWVzdGFtcCAtIGIubG9nLmF1dGhvckRhdGVUaW1lc3RhbXBcbi8vXHR9LFxuLy9cdHNvcnREZXNjOiB0cnVlLFxuLy99KVxuLy9cdC5tYXBTZXJpZXMoaXRlbSA9PlxuLy9cdHtcbi8vXHRcdGNvbnNvbGUubG9nKGl0ZW1bMF0sIGl0ZW1bMV0ubG9nLnJhd0JvZHksIG1vbWVudChpdGVtWzFdLmxvZy5hdXRob3JEYXRlVGltZXN0YW1wKS5mb3JtYXQoKSk7XG4vL1xuLy9cdFx0cmV0dXJuIGdpdF9jb21taXRfZmlsZShpdGVtWzFdKTtcbi8vXHR9KVxuLy87XG5cbnJ1bkFsbEpvYihwYXRoLmpvaW4oZ2l0X3JlcG8pKS50aGVuKHJldCA9PiBjb25zb2xlLmxvZyhyZXQpKTtcblxuLy9mZXRjaEZpbGVMb2dSb3cocGF0aC5qb2luKGdpdF9yZXBvLCAnY20nKSwgJ+eUseS6juS4lueVjOmtlOeJqea7oei9vS5lcHViJykudGhlbihyZXQgPT4gY29uc29sZS5sb2cocmV0KSk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEZpbGVMb2dSb3cocmVwbzogc3RyaW5nLCBmaWxlOiBzdHJpbmcpXG57XG5cdGxldCBmdWxscGF0aCA9IHBhdGguam9pbihyZXBvLCBmaWxlKTtcblxuXHRsZXQgbG9nOiBJRmV0Y2hBbGxGaWxlTG9nUm93TG9nID0gYXdhaXQgZ2l0bG9nLmFzeW5jKHtcblx0XHRcdHJlcG8sXG5cdFx0XHRmaWxlLFxuXHRcdFx0cmV0dXJuQWxsRmllbGRzOiB0cnVlLFxuXG5cdFx0XHRudW1iZXI6IDEsXG5cdFx0fSlcblx0XHQudGhlbihscyA9PiBsc1swXSlcblx0XHQuY2F0Y2goKTtcblxuXHRpZiAobG9nKVxuXHR7XG5cdFx0bGV0IG1mID0gW1xuXHRcdFx0Z2l0bG9nLkVudW1HaXREYXRlRm9ybWF0LkFVVEhPUl9EQVRFLFxuXHRcdFx0Z2l0bG9nLkVudW1HaXREYXRlRm9ybWF0LkNPTU1JVFRFUl9EQVRFLFxuXHRcdF07XG5cblx0XHRsb2cuYXV0aG9yRGF0ZVRpbWVzdGFtcCA9IG1vbWVudChsb2cuYXV0aG9yRGF0ZSwgbWYpLnZhbHVlT2YoKTtcblx0XHRsb2cuY29tbWl0dGVyRGF0ZVRpbWVzdGFtcCA9IG1vbWVudChsb2cuY29tbWl0dGVyRGF0ZSwgbWYpLnZhbHVlT2YoKTtcblxuXHRcdGxvZy5yYXdCb2R5ID0gdHJpbShsb2cucmF3Qm9keSk7XG5cblx0XHRsZXQgcm93OiBJRmV0Y2hBbGxGaWxlTG9nUm93ID0ge1xuXHRcdFx0ZmlsZSxcblx0XHRcdGZ1bGxwYXRoLFxuXHRcdFx0bG9nLFxuXHRcdH07XG5cblx0XHRyZXR1cm4gcm93O1xuXHR9XG59XG5cbmZ1bmN0aW9uIHRyaW0odGV4dDogc3RyaW5nKVxue1xuXHRyZXR1cm4gdGV4dFxuXHRcdC5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmZXRjaEFsbEZpbGVMb2cocmVwbzogc3RyaW5nLCBvcHRpb25zPzoge1xuXHRzb3J0Rm4/KGE6IElGZXRjaEFsbEZpbGVMb2dSb3csIGI6IElGZXRjaEFsbEZpbGVMb2dSb3cpOiBudW1iZXIsXG5cdHNvcnREZXNjPzogYm9vbGVhbixcbn0pXG57XG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKEZhc3RHbG9iLmFzeW5jPHN0cmluZz4oW1xuXHRcdFx0JyonLFxuXHRcdFx0JyoqLyonLFxuXHRcdFx0JyEuZ2l0Jyxcblx0XHRcdCchKi5naXQnLFxuXHRcdFx0JyFiYWNrdXAuZ2l0Jyxcblx0XHRdLCB7XG5cdFx0XHRkZWVwOiB0cnVlLFxuXHRcdFx0b25seUZpbGVzOiB0cnVlLFxuXHRcdFx0Y3dkOiByZXBvLFxuXHRcdH0pKVxuXHRcdC5yZWR1Y2UoYXN5bmMgZnVuY3Rpb24gKGRhdGEsIGZpbGUpXG5cdFx0e1xuXHRcdFx0bGV0IHJvdyA9IGF3YWl0IGZldGNoRmlsZUxvZ1JvdyhyZXBvLCBmaWxlKS5jYXRjaCgpO1xuXG5cdFx0XHRpZiAocm93KVxuXHRcdFx0e1xuXHRcdFx0XHRkYXRhLnB1c2goW2ZpbGUsIHJvd10pXG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0sIFtdIGFzIElGZXRjaEFsbEZpbGVMb2cpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGxzKVxuXHRcdHtcblx0XHRcdGlmIChvcHRpb25zICYmIG9wdGlvbnMuc29ydEZuKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCBzb3J0Rm4gPSBvcHRpb25zLnNvcnRGbjtcblx0XHRcdFx0Y29uc3Qgc29ydERlc2MgPSAhIW9wdGlvbnMuc29ydERlc2M7XG5cblx0XHRcdFx0bHMuc29ydChmdW5jdGlvbiAoYSwgYilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGxldCBuID0gc29ydEZuKGFbMV0sIGJbMV0pIHwgMDtcblxuXHRcdFx0XHRcdHJldHVybiBzb3J0RGVzYyA/IDAgLSBuIDogbjtcblx0XHRcdFx0fSlcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGxzXG5cdFx0fSlcblx0XHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnaXRfZmFrZV9hdXRob3IobmFtZT86IHN0cmluZywgZW1haWw/OiBzdHJpbmcpXG57XG5cdGVtYWlsID0gZW1haWxOb3JtYWxpemUoZW1haWwgfHwgJ3Rlc3Rib3RAdGVzdC50ZXN0Jylcblx0XHQucmVwbGFjZSgvXltcXHPjgIBAXSt8W1xcc+OAgEBdKyQvZywgJycpXG5cdDtcblxuXHRpZiAoZW1haWwuc3BsaXQoJ0AnKS5sZW5ndGggIT09IDIpXG5cdHtcblx0XHRlbWFpbCA9IG51bGw7XG5cdH1cblxuXHRuYW1lID0gKG5hbWUgfHwgJycpXG5cdFx0LnJlcGxhY2UoL1tcXC1cXCtcXDxcXD5cXFtcXF1cXD9cXCpAXFxzXCJcXCdgflxce1xcfV0rL2lnLCAnICcpXG5cdDtcblxuXHR0cnlcblx0e1xuXHRcdG5hbWUgPSBuYW1lXG5cdFx0XHQucmVwbGFjZSgvW1xccHtQdW5jdHVhdGlvbn1dL2lnLCBmdW5jdGlvbiAocylcblx0XHRcdHtcblx0XHRcdFx0aWYgKC9eW1xcLl0kLy50ZXN0KHMpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gJyAnO1xuXHRcdFx0fSlcblx0XHRcdC5yZXBsYWNlKC9eW1xcc+OAgFxccHtQdW5jdHVhdGlvbn1dK3xbXFxz44CAXFxwe1B1bmN0dWF0aW9ufV0rJC9nLCAnJylcblx0XHQ7XG5cdH1cblx0Y2F0Y2ggKGUpXG5cdHtcblxuXHR9XG5cblx0bmFtZSA9IG5hbWVcblx0XHQucmVwbGFjZSgvXltcXHPjgIBdK3xbXFxz44CAXFwuXSskL2csICcnKVxuXHRcdC5yZXBsYWNlKC9cXHMrL2csICcgJylcblx0O1xuXG5cdGlmICgvW15cXHcgXFwuXS8udGVzdChuYW1lKSAmJiBVU3RyaW5nLnNpemUobmFtZSkgPiAxNSlcblx0e1xuXHRcdG5hbWUgPSBVU3RyaW5nLnNsaWNlKG5hbWUsIDAsIDIwKTtcblx0fVxuXG5cdGlmIChuYW1lID09ICdlcyBiJylcblx0e1xuXHRcdG5hbWUgPSAnJztcblx0fVxuXG5cdHJldHVybiBgJHtuYW1lIHx8ICd0ZXN0Ym90J30gPCR7ZW1haWwgfHwgJ3Rlc3Rib3RAdGVzdC50ZXN0J30+YDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdpdF9jb21taXRfZmlsZShyb3c6IElGZXRjaEFsbEZpbGVMb2dSb3csIGN3ZD86IHN0cmluZylcbntcblx0bGV0IGF1dGhvcl9uYW1lOiBzdHJpbmcgPSBnaXRfZmFrZV9hdXRob3Iocm93LmxvZy5hdXRob3JOYW1lLCByb3cubG9nLmF1dGhvckVtYWlsKTtcblxuXHRpZiAoIWN3ZClcblx0e1xuXHRcdGN3ZCA9IHBhdGguZGlybmFtZShyb3cuZnVsbHBhdGgpO1xuXHR9XG5cblx0cmV0dXJuIENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblx0XHQnYWRkJyxcblx0XHRyb3cuZnVsbHBhdGgsXG5cdF0sIHtcblx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdGN3ZCxcblx0fSkudGhlbihmdW5jdGlvbiAoKVxuXHR7XG5cdFx0cmV0dXJuIENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblxuXHRcdFx0J2NvbW1pdCcsXG5cblx0XHRcdC8vJy0tdmVyYm9zZScsXG5cblx0XHRcdC8vJy0tc2hvcnQnLFxuXG5cdFx0XHQnLS11bnRyYWNrZWQtZmlsZXM9bm8nLFxuXG5cdFx0XHRgLS1kYXRlPSR7bW9tZW50KHJvdy5sb2cuYXV0aG9yRGF0ZVRpbWVzdGFtcCkuZm9ybWF0KGdpdGxvZy5FbnVtR2l0RGF0ZUZvcm1hdC5BVVRIT1JfREFURSl9YCxcblx0XHRcdGAtLWF1dGhvcj0ke2F1dGhvcl9uYW1lfWAsXG5cblx0XHRcdC8vJy0tZHJ5LXJ1bicsXG5cblx0XHRcdGAtbWAsXG5cdFx0XHRyb3cubG9nLnJhd0JvZHksXG5cblx0XHRcdCctLScsXG5cdFx0XHRyb3cuZnVsbHBhdGgsXG5cblx0XHRdLCB7XG5cdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0Y3dkLFxuXHRcdH0pXG5cdH0pXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnaXRfZ2V0X3VzZXIoY3dkOiBzdHJpbmcpXG57XG5cdGxldCBjcCA9IGF3YWl0IENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblx0XHQnY29uZmlnJyxcblx0XHQnLS1sb2NhbCcsXG5cdFx0J3VzZXIubmFtZScsXG5cdF0sIHtcblx0XHRjd2QsXG5cdFx0c3RyaXBBbnNpOiB0cnVlLFxuXHR9KTtcblxuXHRsZXQgbmFtZTogc3RyaW5nID0gdHJpbShjcC5vdXRwdXRbMV0udG9TdHJpbmcoKSk7XG5cblx0Y3AgPSBhd2FpdCBDcm9zc1NwYXduLmFzeW5jKCdnaXQnLCBbXG5cdFx0J2NvbmZpZycsXG5cdFx0Jy0tbG9jYWwnLFxuXHRcdCd1c2VyLmVtYWlsJyxcblx0XSwge1xuXHRcdGN3ZCxcblx0XHRzdHJpcEFuc2k6IHRydWUsXG5cdH0pO1xuXG5cdGxldCBlbWFpbDogc3RyaW5nID0gdHJpbShjcC5vdXRwdXRbMV0udG9TdHJpbmcoKSk7XG5cblx0cmV0dXJuIHtcblx0XHRuYW1lLFxuXHRcdGVtYWlsLFxuXHR9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnaXRfc2V0X3VzZXIobmFtZTogc3RyaW5nLCBlbWFpbDogc3RyaW5nLCBjd2Q6IHN0cmluZylcbntcblx0YXdhaXQgQ3Jvc3NTcGF3bi5hc3luYygnZ2l0JywgW1xuXHRcdCdjb25maWcnLFxuXHRcdCctLWxvY2FsJyxcblx0XHQndXNlci5uYW1lJyxcblx0XHRuYW1lLFxuXHRdLCB7XG5cdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRjd2QsXG5cdH0pO1xuXG5cdGF3YWl0IENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblx0XHQnY29uZmlnJyxcblx0XHQnLS1sb2NhbCcsXG5cdFx0J3VzZXIuZW1haWwnLFxuXHRcdGVtYWlsLFxuXHRdLCB7XG5cdFx0c3RkaW86ICdpbmhlcml0Jyxcblx0XHRjd2QsXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuQWxsSm9iKGN3ZDogc3RyaW5nKVxue1xuXHRjd2QgPSBwYXRoLm5vcm1hbGl6ZShjd2QpO1xuXG5cdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHQudGFwKGFzeW5jIGZ1bmN0aW9uICgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5pbmZvKGDmqqLmn6Xot6/lvpFgKTtcblxuXHRcdFx0bGV0IGZpbGU6IHN0cmluZztcblxuXHRcdFx0ZmlsZSA9ICcuZ2l0L2NvbmZpZyc7XG5cblx0XHRcdGlmICghZnMucGF0aEV4aXN0c1N5bmMocGF0aC5qb2luKGN3ZCwgZmlsZSkpKVxuXHRcdFx0e1xuXHRcdFx0XHR0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJyR7Y3dkfScgbm90IGEgZ2l0IHJlcG9gKTtcblx0XHRcdH1cblxuXHRcdFx0ZmlsZSA9ICcubm9kZS1ub3ZlbC5lcHViLmdpdGtlZXAnO1xuXG5cdFx0XHRpZiAoIWZzLnBhdGhFeGlzdHNTeW5jKHBhdGguam9pbihjd2QsIGZpbGUpKSlcblx0XHRcdHtcblx0XHRcdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoYCcke2ZpbGV9JyBub3QgZXhpc3RzYCk7XG5cdFx0XHR9XG5cblx0XHRcdGxldCByb290ID0gYXdhaXQgR2l0Um9vdC5hc3luYyhjd2QpXG5cdFx0XHRcdC50aGVuKHIgPT4gcGF0aC5ub3JtYWxpemUocikpO1xuXG5cdFx0XHRpZiAocm9vdCAhPT0gY3dkIHx8ICFjd2QgfHwgIXJvb3QpXG5cdFx0XHR7XG5cdFx0XHRcdHRocm93IG5ldyBSYW5nZUVycm9yKGAnJHtjd2R9JyBub3QgYSBnaXQgcm9vdGApO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmluZm8oYOWPluW+l+aJgOacieaqlOahiOeahOatt+WPsue0gOmMhGApO1xuXG5cdFx0XHRyZXR1cm4gZmV0Y2hBbGxGaWxlTG9nKGN3ZCwge1xuXHRcdFx0XHRzb3J0Rm4oYTogSUZldGNoQWxsRmlsZUxvZ1JvdywgYjogSUZldGNoQWxsRmlsZUxvZ1Jvdyk6IG51bWJlclxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGEubG9nLmF1dGhvckRhdGVUaW1lc3RhbXAgLSBiLmxvZy5hdXRob3JEYXRlVGltZXN0YW1wXG5cdFx0XHRcdH0sXG5cdFx0XHRcdC8vc29ydERlc2M6IHRydWUsXG5cdFx0XHR9KVxuXHRcdFx0XHQvKlxuXHRcdFx0XHQubWFwU2VyaWVzKGl0ZW0gPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKGl0ZW1bMF0sIGl0ZW1bMV0ubG9nLnJhd0JvZHksIG1vbWVudChpdGVtWzFdLmxvZy5hdXRob3JEYXRlVGltZXN0YW1wKS5mb3JtYXQoKSk7XG5cblx0XHRcdFx0XHRyZXR1cm4gZ2l0X2NvbW1pdF9maWxlKGl0ZW1bMV0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQqL1xuXHRcdFx0XHQ7XG5cdFx0fSlcblx0XHQudGFwKGFzeW5jIGZ1bmN0aW9uIChvbGREYXRhKVxuXHRcdHtcblx0XHRcdGxldCB7IG5hbWUsIGVtYWlsIH0gPSBhd2FpdCBnaXRfZ2V0X3VzZXIoY3dkKTtcblxuXHRcdFx0bGV0IF9naXRfcGF0aCA9IHBhdGguam9pbihjd2QsICcuZ2l0Jyk7XG5cdFx0XHRsZXQgX2dpdF9wYXRoX2JhY2t1cCA9IHBhdGguam9pbihjd2QsICdiYWNrdXAuZ2l0Jyk7XG5cblx0XHRcdGNvbnNvbGUuaW5mbyhg5riF6ZmkIGJhY2t1cC5naXRgKTtcblx0XHRcdGF3YWl0IGZzLnJlbW92ZShfZ2l0X3BhdGhfYmFja3VwKTtcblxuXHRcdFx0Y29uc29sZS5pbmZvKGAuZ2l0IOabtOWQjeeCuiBiYWNrdXAuZ2l0YCk7XG5cdFx0XHRhd2FpdCBmcy5tb3ZlKF9naXRfcGF0aCwgX2dpdF9wYXRoX2JhY2t1cCk7XG5cblx0XHRcdGF3YWl0IENyb3NzU3Bhd24uYXN5bmMoJ2dpdCcsIFtcblx0XHRcdFx0J2luaXQnLFxuXHRcdFx0XSwge1xuXHRcdFx0XHRzdGRpbzogJ2luaGVyaXQnLFxuXHRcdFx0XHRjd2QsXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly9hd2FpdCBnaXRfc2V0X3VzZXIobmFtZSwgZW1haWwsIGN3ZCk7XG5cblx0XHRcdGNvbnNvbGUuaW5mbyhg6KSH6KO96IiK5pyJIGdpdCDoqK3lrppgKTtcblxuXHRcdFx0YXdhaXQgQmx1ZWJpcmQubWFwKEZhc3RHbG9iLmFzeW5jPHN0cmluZz4oW1xuXHRcdFx0XHQnY29uZmlnJyxcblx0XHRcdFx0J2hvb2tzLyoqLyonLFxuXHRcdFx0XHQnaW5mby8qKi8qJyxcblx0XHRcdF0sIHtcblx0XHRcdFx0Y3dkOiBfZ2l0X3BhdGhfYmFja3VwLFxuXHRcdFx0fSksIGZ1bmN0aW9uIChmaWxlKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gZnMuY29weShwYXRoLmpvaW4oX2dpdF9wYXRoX2JhY2t1cCwgZmlsZSksIHBhdGguam9pbihfZ2l0X3BhdGgsIGZpbGUpLCB7XG5cdFx0XHRcdFx0cHJlc2VydmVUaW1lc3RhbXBzOiB0cnVlLFxuXHRcdFx0XHRcdG92ZXJ3cml0ZTogdHJ1ZSxcblx0XHRcdFx0fSkudGhlbihyID0+IGNvbnNvbGUuZGVidWcoJ1tjb3B5XScsIGZpbGUpKVxuXHRcdFx0fSlcblx0XHRcdDtcblxuXHRcdFx0Y29uc29sZS5pbmZvKGDplovlp4vlgb3pgKDmqpTmoYjmrbflj7LntIDpjIRgKTtcblxuXHRcdFx0YXdhaXQgQmx1ZWJpcmQubWFwU2VyaWVzKG9sZERhdGEsIGZ1bmN0aW9uIChpdGVtKVxuXHRcdFx0e1xuXHRcdFx0XHRjb25zb2xlLmRlYnVnKCdbY29tbWl0XScsIGl0ZW1bMF0sIG1vbWVudChpdGVtWzFdLmxvZy5hdXRob3JEYXRlVGltZXN0YW1wKS5mb3JtYXQoKSk7XG5cblx0XHRcdFx0cmV0dXJuIGdpdF9jb21taXRfZmlsZShpdGVtWzFdLCBjd2QpO1xuXHRcdFx0fSlcblx0XHR9KVxuXHRcdC50YXAoZnVuY3Rpb24gKClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmRlYnVnKGBEb25lYCk7XG5cdFx0fSlcblx0XHQ7XG59XG4iXX0=