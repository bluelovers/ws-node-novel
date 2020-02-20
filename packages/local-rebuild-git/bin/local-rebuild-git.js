#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const upath2_1 = __importDefault(require("upath2"));
const yargs_1 = __importDefault(require("yargs"));
let argv = yargs_1.default
    .option('cwd', {
    demandOption: true,
    normalize: true,
    description: 'target path for handle',
    alias: ['c'],
})
    .help()
    .argv;
let git_repo = upath2_1.default.resolve(argv.cwd);
__1.runAllJob(upath2_1.default.join(git_repo))
    .tap(ret => {
    //console.log(ret)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtcmVidWlsZC1naXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2NhbC1yZWJ1aWxkLWdpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFFQSwwQkFBd0M7QUFDeEMsb0RBQTBCO0FBQzFCLGtEQUEwQjtBQUcxQixJQUFJLElBQUksR0FBRyxlQUFLO0tBQ2QsTUFBTSxDQUFDLEtBQUssRUFBRTtJQUNkLFlBQVksRUFBRSxJQUFJO0lBQ2xCLFNBQVMsRUFBRSxJQUFJO0lBQ2YsV0FBVyxFQUFFLHdCQUF3QjtJQUNyQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7Q0FDWixDQUFDO0tBQ0QsSUFBSSxFQUFFO0tBQ04sSUFBSSxDQUNMO0FBRUQsSUFBSSxRQUFRLEdBQUcsZ0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRXRDLGFBQVMsQ0FBQyxnQkFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM1QixHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7SUFFVixrQkFBa0I7QUFDbkIsQ0FBQyxDQUFDLENBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5cbmltcG9ydCB7IHJ1bkFsbEpvYiwgY29uc29sZSB9IGZyb20gJy4uJztcbmltcG9ydCBwYXRoIGZyb20gJ3VwYXRoMic7XG5pbXBvcnQgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IGZzID0gcmVxdWlyZSgnZnMnKTtcblxubGV0IGFyZ3YgPSB5YXJnc1xuXHQub3B0aW9uKCdjd2QnLCB7XG5cdFx0ZGVtYW5kT3B0aW9uOiB0cnVlLFxuXHRcdG5vcm1hbGl6ZTogdHJ1ZSxcblx0XHRkZXNjcmlwdGlvbjogJ3RhcmdldCBwYXRoIGZvciBoYW5kbGUnLFxuXHRcdGFsaWFzOiBbJ2MnXSxcblx0fSlcblx0LmhlbHAoKVxuXHQuYXJndlxuO1xuXG5sZXQgZ2l0X3JlcG8gPSBwYXRoLnJlc29sdmUoYXJndi5jd2QpO1xuXG5ydW5BbGxKb2IocGF0aC5qb2luKGdpdF9yZXBvKSlcblx0LnRhcChyZXQgPT5cblx0e1xuXHRcdC8vY29uc29sZS5sb2cocmV0KVxuXHR9KVxuO1xuIl19