import _zhRegExp from 'regexp-cjk';
import createZhRegExpPlugin from 'regexp-cjk-plugin-extra';
import createZhRegExpCorePlugin from 'regexp-cjk-plugin-escape-unicode-property';
import { outputFile } from 'fs-extra';
import { join } from 'path';

const rootDir = join(__dirname, '..', '..');

const zhRegExp = _zhRegExp.use({
	onCore: [
		createZhRegExpCorePlugin({
			escapeAuto: true,
		}),
	],
	on: [
		createZhRegExpPlugin({
			autoVoice: true,
			autoLocale: true,
			autoDeburr: true,
			autoFullHaif: true,
		})
	],
	unsafe: true,
	greedyTable: 2,
});

export const reTxtImgTag = new zhRegExp(`[(（](?:插(?:圖|畫|絵)|圖(?:片|像)|画像|img|image|photo|illus)([a-z0-9ａ-ｚ０-９_―——─－一─——－\u2E3A\u0332\u0331\u02CD﹘\\-]+)[)）]`, 'iug', {
	greedyTable: 2,
});

export const enum EnumHtmlTag
{
	OPEN = '&lt;|\\u003C|＜',
	CLOSE = '&gt;|\\u003E|＞',
}

export const allowedHtmlTagList = [
	's',
	'ruby',
	'i',
	'b',
	'sup',
	'sub',
] as const;

export const reTxtHtmlTag = createHtmlTagRe(allowedHtmlTagList);
export const reHtmlRubyRt = createHtmlTagRe(['rt']);
export const reHtmlRubyRp = createHtmlTagRe(['rp']);

export const reHtmlTagOpen = new zhRegExp(EnumHtmlTag.OPEN, 'igu');
export const reHtmlTagClose = new zhRegExp(EnumHtmlTag.CLOSE, 'igu');

export const reHtmlAttr = new zhRegExp(`(?<=(?:[\\s 　]+))([\\wａ-ｚ０-９]+)(?:＝|═|=)([#＃\\wａ-ｚ０-９]+)`, 'iug', {
	greedyTable: 2,
});

outputFile(join(rootDir, 'lib', 'tags.ts'), `/**
 * do not edit this file
 */

export const enum EnumHtmlTag
{
\tOPEN = '&lt;|\\\\u003C|＜',
\tCLOSE = '&gt;|\\\\u003E|＞',
}

export type IAllowedHtmlTagList = ${allowedHtmlTagList.map(v => `"${v}"`).join(' | ')};

export const allowedHtmlTagList = [
\t${allowedHtmlTagList.map(v => `"${v}"`).join(',\n\t')}
] as const;

export const reTxtHtmlTag = ${reTxtHtmlTag};
export const reHtmlRubyRt = ${reHtmlRubyRt};
export const reHtmlRubyRp = ${reHtmlRubyRp};

export const reHtmlTagOpen = ${reHtmlTagOpen};
export const reHtmlTagClose = ${reHtmlTagClose};

export const reTxtImgTag = ${reTxtImgTag};

`);

export function createHtmlTagRe(allowedHtmlTagList: string[] | readonly string[])
{
	return new zhRegExp(`(?:${EnumHtmlTag.OPEN})(${allowedHtmlTagList.join('|')})((?:\\s+[\\w \\t＝═=ａ-ｚ０-９]*?)?)(?:${EnumHtmlTag.CLOSE})([^\\n]*?)(?:${EnumHtmlTag.OPEN})(?:(?:\\/|／)\\1)(?:${EnumHtmlTag.CLOSE})`, 'iug', {
		greedyTable: 2,
	})
}
