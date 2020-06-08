/**
 * Created by user on 2018/2/12/012.
 */

import naturalCompare from '@bluelovers/string-natural-compare';
import { createSortCallback } from './lib/core';

export * from './lib/core';
export * from './lib/types';
export * from './lib/util';

export { naturalCompare }

export const defaultSortCallback = createSortCallback({
	dotNum: true,
});

export default defaultSortCallback
