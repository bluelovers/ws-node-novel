#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const path = require("upath2");
const yargs = require("yargs");
let argv = yargs
    .option('cwd', {
    demandOption: true,
    normalize: true,
    description: 'target path for handle',
    alias: ['c'],
})
    .help()
    .argv;
let git_repo = path.resolve(argv.cwd);
__1.runAllJob(path.join(git_repo))
    .tap(ret => {
    //console.log(ret)
});
//# sourceMappingURL=local-rebuild-git.js.map