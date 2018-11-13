/**
 * Created by user on 2018/11/14/014.
 */

import { _handleOptions, makeOptions } from '../../lib/index';
import { IOptions, IOptionsRequired, IOptionsRequiredUser } from '../../lib/interface';

import { console } from '../../';

console.inspectOptions = {
	colors: true,
};

export const tplOptions: IOptionsRequiredUser = {

	//useRegExpCJK: true,

	volume: {
		r: [
			'第.章',
			'1',
		]
	},

	chapter: {
		//r: /^\d+\n(第\d+話) *([^\n]*)\n(---正文 *\n)$/,
		r: [
			'^',
			`(?:---後話\\s+（改稿紀錄，略）\\s+)?`,
			`(?:\\d+ +[^\\n]+\\n+完\\n+)?`,
			'\\d+\\n',
			'(',
			[
				`第\\d+話`,
				`\\S+[^\\n ]*`,
			].join('|'),
			')',
			` *([^\\n]*)\\n`,
			'(?:',
			`(?:[\\s\\S]*?\\n(?:---(?:正文)?)\\n)?`,
			')?\\n*',
			'',
		],
		cb({
			i,
			id,
			name,
			m,
			m_last,
			_files,
			idx,
		})
		{
			if (m_last)
			{
				let {
					match,
					sub,
				} = m_last;

				console.dir({
					sub,
					match,
				});

				name = sub.filter(v => v && v.trim()).join('　');

				idx += m_last.match.length;
			}

			return {
				/**
				 * 檔案序列(儲存檔案時會做為前置詞)
				 */
				id,
				/**
				 * 標題名稱 預設情況下等於 match 到的標題
				 */
				name,
				/**
				 * 本次 match 的 內文 start index
				 * 可通過修改數值來控制內文範圍
				 *
				 * @example
				 * idx += m_last.match.length; // 內文忽略本次 match 到的標題
				 */
				idx,
			}
		},
	},

	beforeStart(options)
	{
		console.dir(options);
	},

};

export default tplOptions
