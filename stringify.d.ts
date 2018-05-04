/**
 * Created by user on 2018/2/4/004.
 */
import { stringify } from './index';
declare const _s: typeof stringify & {
    default: typeof stringify;
    stringify: typeof stringify;
};
export = _s;
