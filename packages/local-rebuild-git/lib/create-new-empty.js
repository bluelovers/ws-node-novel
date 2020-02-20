"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const fs_extra_1 = __importDefault(require("fs-extra"));
const upath2_1 = __importDefault(require("upath2"));
const git_1 = require("@git-lazy/util/spawn/git");
const branch_1 = require("@git-lazy/branch");
const moment_1 = __importDefault(require("moment"));
const util_1 = require("@git-lazy/util");
async function _createMode001(cwd) {
    let { name, email } = await index_1.git_get_user(cwd);
    let _git_path = upath2_1.default.join(cwd, '.git');
    let _git_path_backup = upath2_1.default.join(cwd, 'backup.git');
    util_1.console.info(`清除 backup.git`);
    await fs_extra_1.default.remove(_git_path_backup);
    util_1.console.info(`.git 更名為 backup.git`);
    await fs_extra_1.default.move(_git_path, _git_path_backup);
    await git_1.crossSpawnAsync('git', [
        'init',
    ], {
        stdio: 'inherit',
        cwd,
    });
}
exports._createMode001 = _createMode001;
async function _createMode002(cwd) {
    let new_name = 'rebuild/' + moment_1.default().format('YYYY-MM-DD-HH-mm-ss');
    await branch_1.createEmptyBranch(new_name, {
        cwd,
    });
    util_1.console.info(`create branch "${new_name}"`);
}
exports._createMode002 = _createMode002;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlLW5ldy1lbXB0eS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNyZWF0ZS1uZXctZW1wdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvQ0FBd0M7QUFDeEMsd0RBQTBCO0FBRzFCLG9EQUEwQjtBQUMxQixrREFBeUc7QUFDekcsNkNBQXFEO0FBQ3JELG9EQUE0QjtBQUM1Qix5Q0FBeUM7QUFFbEMsS0FBSyxVQUFVLGNBQWMsQ0FBQyxHQUFXO0lBRS9DLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsTUFBTSxvQkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRTlDLElBQUksU0FBUyxHQUFHLGdCQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2QyxJQUFJLGdCQUFnQixHQUFHLGdCQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUVwRCxjQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzlCLE1BQU0sa0JBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUVsQyxjQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDcEMsTUFBTSxrQkFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUUzQyxNQUFNLHFCQUFlLENBQUMsS0FBSyxFQUFFO1FBQzVCLE1BQU07S0FDTixFQUFFO1FBQ0YsS0FBSyxFQUFFLFNBQVM7UUFDaEIsR0FBRztLQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFuQkQsd0NBbUJDO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxHQUFXO0lBRS9DLElBQUksUUFBUSxHQUFHLFVBQVUsR0FBRyxnQkFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFFbkUsTUFBTSwwQkFBaUIsQ0FBQyxRQUFRLEVBQUU7UUFDakMsR0FBRztLQUNILENBQUMsQ0FBQztJQUVILGNBQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQVRELHdDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2l0X2dldF91c2VyIH0gZnJvbSAnLi4vaW5kZXgnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcbmltcG9ydCBDcm9zc1NwYXduIGZyb20gJ2Nyb3NzLXNwYXduLWV4dHJhJztcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgcGF0aCBmcm9tICd1cGF0aDInO1xuaW1wb3J0IHsgY2hlY2tHaXRPdXRwdXQsIGNyb3NzU3Bhd25TeW5jLCBTcGF3bk9wdGlvbnMsIGNyb3NzU3Bhd25Bc3luYyB9IGZyb20gJ0BnaXQtbGF6eS91dGlsL3NwYXduL2dpdCc7XG5pbXBvcnQgeyBjcmVhdGVFbXB0eUJyYW5jaCB9IGZyb20gJ0BnaXQtbGF6eS9icmFuY2gnO1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IHsgY29uc29sZSB9IGZyb20gJ0BnaXQtbGF6eS91dGlsJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9jcmVhdGVNb2RlMDAxKGN3ZDogc3RyaW5nKVxue1xuXHRsZXQgeyBuYW1lLCBlbWFpbCB9ID0gYXdhaXQgZ2l0X2dldF91c2VyKGN3ZCk7XG5cblx0bGV0IF9naXRfcGF0aCA9IHBhdGguam9pbihjd2QsICcuZ2l0Jyk7XG5cdGxldCBfZ2l0X3BhdGhfYmFja3VwID0gcGF0aC5qb2luKGN3ZCwgJ2JhY2t1cC5naXQnKTtcblxuXHRjb25zb2xlLmluZm8oYOa4hemZpCBiYWNrdXAuZ2l0YCk7XG5cdGF3YWl0IGZzLnJlbW92ZShfZ2l0X3BhdGhfYmFja3VwKTtcblxuXHRjb25zb2xlLmluZm8oYC5naXQg5pu05ZCN54K6IGJhY2t1cC5naXRgKTtcblx0YXdhaXQgZnMubW92ZShfZ2l0X3BhdGgsIF9naXRfcGF0aF9iYWNrdXApO1xuXG5cdGF3YWl0IGNyb3NzU3Bhd25Bc3luYygnZ2l0JywgW1xuXHRcdCdpbml0Jyxcblx0XSwge1xuXHRcdHN0ZGlvOiAnaW5oZXJpdCcsXG5cdFx0Y3dkLFxuXHR9KTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9jcmVhdGVNb2RlMDAyKGN3ZDogc3RyaW5nKVxue1xuXHRsZXQgbmV3X25hbWUgPSAncmVidWlsZC8nICsgbW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLURELUhILW1tLXNzJyk7XG5cblx0YXdhaXQgY3JlYXRlRW1wdHlCcmFuY2gobmV3X25hbWUsIHtcblx0XHRjd2QsXG5cdH0pO1xuXG5cdGNvbnNvbGUuaW5mbyhgY3JlYXRlIGJyYW5jaCBcIiR7bmV3X25hbWV9XCJgKTtcbn1cbiJdfQ==