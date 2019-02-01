#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const path = require("upath2");
let git_repo = 'C:\\Temp\\test-no-git-lfs';
__1.runAllJob(path.join(git_repo))
    .tap(ret => {
    //console.log(ret)
});
//# sourceMappingURL=local-rebuild-git.js.map