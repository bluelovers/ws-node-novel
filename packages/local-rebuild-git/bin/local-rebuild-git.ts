#!/usr/bin/env node

import { runAllJob, console } from '..';
import path = require('upath2');

let git_repo = 'C:\\Temp\\test-no-git-lfs';

runAllJob(path.join(git_repo))
	.tap(ret =>
	{
		//console.log(ret)
	})
;

