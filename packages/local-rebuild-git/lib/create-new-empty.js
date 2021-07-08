"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._createMode002 = exports._createMode001 = void 0;
const tslib_1 = require("tslib");
const index_1 = require("../index");
const fs_extra_1 = (0, tslib_1.__importDefault)(require("fs-extra"));
const upath2_1 = (0, tslib_1.__importDefault)(require("upath2"));
const git_1 = require("@git-lazy/util/spawn/git");
const branch_1 = require("@git-lazy/branch");
const moment_1 = (0, tslib_1.__importDefault)(require("moment"));
const util_1 = require("@git-lazy/util");
async function _createMode001(cwd) {
    let { name, email } = await (0, index_1.git_get_user)(cwd);
    let _git_path = upath2_1.default.join(cwd, '.git');
    let _git_path_backup = upath2_1.default.join(cwd, 'backup.git');
    util_1.console.info(`清除 backup.git`);
    await fs_extra_1.default.remove(_git_path_backup);
    util_1.console.info(`.git 更名為 backup.git`);
    await fs_extra_1.default.move(_git_path, _git_path_backup);
    await (0, git_1.crossSpawnAsync)('git', [
        'init',
    ], {
        stdio: 'inherit',
        cwd,
    });
}
exports._createMode001 = _createMode001;
async function _createMode002(cwd) {
    let new_name = 'rebuild/' + (0, moment_1.default)().format('YYYY-MM-DD-HH-mm-ss');
    await (0, branch_1.createEmptyBranch)(new_name, {
        cwd,
    });
    util_1.console.info(`create branch "${new_name}"`);
}
exports._createMode002 = _createMode002;
//# sourceMappingURL=create-new-empty.js.map