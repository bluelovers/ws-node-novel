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

	/**
	 * 這個參數 可刪除 如果沒有用到的話
	 */
	volume: {
		/**
		 * 故意放一個無效配對 實際使用時請自行更改
		 *
		 * 當沒有配對到的時候 會自動產生 00000_unknow 資料夾
		 */
		r: [
			'第.章',
			'1',
		],
	},

	/**
	 * 這個參數是必填選項
	 */
	chapter: {
		//r: /^\d+\n(第\d+話) *([^\n]*)$/,

		/**
		 * 正常來說不需要弄得這麼複雜的樣式 只需要配對標題就好
		 * 但懶惰想要在切 txt 的時候 順便縮減內文的話 就可以寫的複雜一點
		 *
		 * 當 r 不是 regexp 的時候 在執行時會自動將這個參數的內容轉成 regexp
		 */
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
			/**
			 * 於 match 列表中的 index 序列
			 */
			i,
			/**
			 * 檔案序列(儲存檔案時會做為前置詞)
			 */
			id,
			/**
			 * 標題名稱 預設情況下等於 match 到的標題
			 */
			name,
			/**
			 * 本階段的 match 值
			 */
			m,
			/**
			 * 上一次的 match 值
			 *
			 * 但是 實際上 這參數 才是本次 callback 真正的 match 內容
			 */
			m_last,
			/**
			 * 目前已經分割的檔案列表與內容
			 */
			_files,
			/**
			 * 於所有章節中的序列
			 *
			 * @readonly
			 */
			ii,
			/**
			 * 本次 match 的 內文 start index
			 * 可通過修改數值來控制內文範圍
			 *
			 * @example
			 * idx += m_last.match.length; // 內文忽略本次 match 到的標題
			 */
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
