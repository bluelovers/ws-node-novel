/**
 * Created by user on 2019/5/29.
 */

export * from './lib';
import { TextLayout, create } from './lib';
export { IWordsAll, IWordsFunction, IWordsArray, IWordsArray2, IWordsUser, IWordsRuntime, IConstructorOptions, ITextLayoutOptions } from './lib/types';

/**
 * 預設的 排版處理核心 如需要自訂預設值 可以 使用 `TextLayout.create(options)`
 *
 * @type {TextLayout}
 */
export const textLayout = create();

/**
 * @deprecated
 */
export { textLayout as novelText }

export default textLayout;
