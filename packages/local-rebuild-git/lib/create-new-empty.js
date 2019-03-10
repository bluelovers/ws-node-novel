"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const fs = require("fs-extra");
const path = require("upath2");
const git_1 = require("@git-lazy/util/spawn/git");
const branch_1 = require("@git-lazy/branch");
const moment = require("moment");
const util_1 = require("@git-lazy/util");
async function _createMode001(cwd) {
    let { name, email } = await index_1.git_get_user(cwd);
    let _git_path = path.join(cwd, '.git');
    let _git_path_backup = path.join(cwd, 'backup.git');
    util_1.console.info(`清除 backup.git`);
    await fs.remove(_git_path_backup);
    util_1.console.info(`.git 更名為 backup.git`);
    await fs.move(_git_path, _git_path_backup);
    await git_1.crossSpawnAsync('git', [
        'init',
    ], {
        stdio: 'inherit',
        cwd,
    });
}
exports._createMode001 = _createMode001;
async function _createMode002(cwd) {
    let new_name = 'rebuild/' + moment().format('YYYY-MM-DD-HH-mm-ss');
    await branch_1.createEmptyBranch(new_name, {
        cwd,
    });
    util_1.console.info(`create branch "${new_name}"`);
}
exports._createMode002 = _createMode002;
//# sourceMappingURL=create-new-empty.js.map