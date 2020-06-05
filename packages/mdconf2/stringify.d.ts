/**
 * Created by user on 2018/2/4/004.
 */
import { stringify as _stringify } from './index';
declare function stringify(...argv: Parameters<typeof _stringify>): string;
declare namespace stringify {
    var default: typeof _stringify;
    var stringify: typeof _stringify;
}
export = stringify;
