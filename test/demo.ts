/**
 * Created by user on 2018/2/9/009.
 */

import novelText from '../';

let text = '';
let options = {};

let new_text = novelText.toStr(text);

new_text = novelText.textlayout(new_text, options);
new_text = novelText.replace(new_text, {
	words: true,
});
new_text = novelText.trim(new_text);
