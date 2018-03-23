/**
 * Created by user on 2018/2/4/004.
 */

import { stringify } from './index';

const _s = stringify as typeof stringify & {
	default: typeof stringify,
	stringify: typeof stringify,
};

_s.default = _s.stringify = stringify;

export = _s;
