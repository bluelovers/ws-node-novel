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
//# sourceMappingURL=local-rebuild-git.js.map