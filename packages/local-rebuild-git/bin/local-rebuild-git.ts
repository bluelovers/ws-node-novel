#!/usr/bin/env node

import { runAllJob, console } from '..';
import path from 'upath2';
import yargs from 'yargs';
import fs = require('fs');

let argv = yargs
	.option('cwd', {
		demandOption: true,
		normalize: true,
		description: 'target path for handle',
		alias: ['c'],
	})
	.help()
	.argv
;

let git_repo = path.resolve(argv.cwd);

runAllJob(path.join(git_repo))
	.tap(ret =>
	{
		//console.log(ret)
	})
;
