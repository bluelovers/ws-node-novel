/**
 * Created by user on 2019/3/10.
 */

import { runAllJob, console } from '..';
import path from 'upath2';

let git_repo = 'C:\\Home\\Temp\\test-no-git-lfs';

runAllJob(path.join(git_repo))
	.tap(ret =>
	{
		//console.log(ret)
	})
;
