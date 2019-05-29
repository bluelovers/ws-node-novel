# README

> node-novel core module

`yarn add @node-novel/layout`

## demo

* [node-novel](https://www.npmjs.com/search?q=node-novel)

```ts
import textLayout from '@node-novel/layout';

let old_text = '';

let options: ITextLayoutOptions = {
	allow_lf2: false,
	allow_lf3: false,
};

let new_text = textLayout.textlayout(old_text, options);

new_text = textLayout.replace(new_text, {
	words: true,
});
```
