/**
 * Created by user on 2018/2/9/009.
 */

export * from './text';
import * as StrUtil from 'str-util';
import { enspace } from './text';
import tiebaHarmony from 'tieba-harmony';
import chkBlankLine from 'blank-line';

export { StrUtil }
export { chkBlankLine }
export { tiebaHarmony }

export const novelText = enspace.create();
export default novelText;
