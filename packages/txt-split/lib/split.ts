/**
 * 文字分割核心功能
 * Text Split Core Functionality
 *
 * 此模組提供文字分割的核心實現，包括卷和章節的分割邏輯。
 * This module provides core implementation for text splitting, including volume and chapter splitting logic.
 *
 * @module txt-split/lib/split
 */

import { fix_name, padIndex } from './util';
import {
	IContext,
	IDataChapter,
	IDataVolume,
	IOptions,
	ISplitCache,
	ISplitCB,
	ISplitMatch,
	ISplitMatchItem,
	IOptionsRequired, ISplitOption,
} from './interface';
import { execall } from 'execall2';
import { console } from './console';

/**
 * 同步分割卷
 * Split volume synchronously
 *
 * 將文字內容根據卷和章節規則進行分割。
 * Splits text content according to volume and chapter rules.
 *
 * @template O - 快取類型 / Cache type
 * @param txt - 要分割的文字內容 / Text content to split
 * @param cache - 分割快取和選項 / Split cache and options
 * @returns 分割後的卷資料結構 / Split volume data structure
 */
export function splitVolumeSync<O extends Partial<ISplitCache>>(txt: IContext, cache: O): IDataVolume
{
	let _vs: IDataChapter;

	txt = String(txt);

	// 驗證必要選項 / Validate required options
	if (!cache || !cache.chapter || !cache.chapter.r)
	{
		throw new RangeError(`options.chapter.r is required`)
	}

	// 執行開始前回調 / Execute before start callback
	if (cache.beforeStart)
	{
		cache.beforeStart(cache);
	}

	// 處理卷分割 / Process volume splitting
	MAIN:
	if (cache.volume && !cache.volume.disable)
	{
		let _r = cache.volume.r;

		let _m = execall(_r, txt, {
			cloneRegexp,
		});

		//console.debug(_r, _m, txt);
		//console.debug(_r, _m, txt);

		// 檢查是否有匹配結果 / Check if there are match results
		if (!_m || !_m.length)
		{
			let msg = `volume match is empty ${_r}`;

			console.warn(msg);

			if (!cache.volume.allowNoMatch)
			{
				throw new Error(msg);
			}

			break MAIN;
		}

		//console.log(_r, _m, _r.test(txt));

		_vs = splitChapterSync(txt, cache, _m, cache.volume);
	}

	// 如果沒有卷分割結果，使用未知卷 / If no volume split result, use unknown volume
	if (!_vs)
	{
		_vs = {};
		_vs['00000_unknow'] = txt;
	}

	let _out: IDataVolume = {};

	// @ts-ignore
	cache.ix = 0;

	// 遍歷卷並分割章節 / Iterate volumes and split chapters
	for (let vn in _vs)
	{
		let txt = _vs[vn];

		let _r = cache.chapter.r;
		let _m = execall(_r, txt, {
			cloneRegexp,
		});

		//console.log(_r, _m, txt);

		//console.log(cache.ix);

		// 如果沒有章節匹配，使用未知章節 / If no chapter match, use unknown chapter
		if (!_m || !_m.length)
		{
			// @ts-ignore
			let id = padIndex(cache.ix++, 5, '0');

			_out[vn] = {};

			_out[vn][`${id}_unknow`] = txt;

			continue;
		}

		let _cs = splitChapterSync(txt, cache, _m, cache.chapter);

		_out[vn] = {};

		for (let cn in _cs)
		{
			_out[vn][cn] = _cs[cn];
		}
	}

	/**
	 * 複製正則表達式
	 * Clone regular expression
	 *
	 * 確保正則表達式具有全局旗標。
	 * Ensures regular expression has global flag.
	 *
	 * @param re - 原始正則表達式 / Original regular expression
	 * @returns 具有全局旗標的新正則表達式 / New regular expression with global flag
	 */
	function cloneRegexp(re)
	{
		let flags = (re.flags || '');

		if (flags.indexOf('g') === -1)
		{
			flags += 'g';
		}

		// @ts-ignore
		let r = new (cache.useRegExpCJK || RegExp)(re, flags);

		return r
	}

	//console.log(_out);

	return _out;
}

/**
 * 同步分割章節
 * Split chapter synchronously
 *
 * 將文字內容根據章節規則進行分割。
 * Splits text content according to chapter rules.
 *
 * @template O - 快取類型 / Cache type
 * @param txt - 要分割的文字內容 / Text content to split
 * @param cache - 分割快取和選項 / Split cache and options
 * @param _m - 匹配結果列表 / Match result list
 * @param splitOption - 分割選項 / Split options
 * @returns 分割後的章節資料結構 / Split chapter data structure
 */
export function splitChapterSync<O extends Partial<ISplitCache>>(txt: IContext, cache: O, _m: ISplitMatch, splitOption: ISplitOption): IDataChapter<string>
{
	let _files: IDataChapter = {};
	let idx = 0;

	let { cb, ignoreCb, ignoreRe, idxSkipIgnored } = splitOption;

	txt = String(txt);

	// @ts-ignore
	cache.txt = txt;

	let m_last;

	let i: string;
	let ix = cache.ix || 0;
	let ii: string;
	let ic: number = 0;
	let ic_all = cache.ic_all || 0;

	let ii_rebase: number = 0;

	let name_last: string;
	let has_unknow: boolean;
	let i_int: number;

	let i_ignored: number = 0;

	// 遍歷所有匹配項 / Iterate all match items
	for (i in _m)
	{
		i_int = parseInt(i);

		ii = (i_int + ix - ii_rebase).toString();

		let m = _m[i];

		// 檢查是否應該忽略此匹配 / Check if this match should be ignored
		if (ignoreRe)
		{
			if (ignoreRe.test(m.match))
			{
				i_ignored++;

				if (idxSkipIgnored)
				{
					ii_rebase++;
				}

				/**
				 * @todo here maybe will has bug, need test
				 */
				continue;
			}

			ignoreRe.lastIndex = 0;
		}

		// 處理第一個匹配前的未知內容 / Handle unknown content before first match
		if (!m_last && idx == 0 && m.index != 0)
		{
			//console.log(m);

			let id = padIndex(ii, 5, '0');
			let name = 'unknow';

			// 執行忽略回調檢查 / Execute ignore callback check
			if (ignoreCb && ignoreCb({
				i,
				id,
				name,
				m,
				m_last,
				_files,
				ii,
				cache,
				idx,

				ic,
				ic_all,
				ix,
			}))
			{
				i_ignored++;

				if (idxSkipIgnored)
				{
					ii_rebase++;
				}

				continue;
			}

			// 執行自定義回調 / Execute custom callback
			if (cb)
			{
				let _ret = cb({
					i,
					id,
					name,
					m,
					m_last,
					_files,
					ii,
					cache,
					idx,

					ic,
					ic_all,
					ix,
				});

				if (_ret)
				{
					id = _ret.id;
					name = _ret.name;
					idx = _ret.idx;
				}
			}

			let txt_clip = txt.slice(idx, m.index);

			name = id + '_' + name;

			// 處理非空內容 / Handle non-empty content
			if (txt_clip.length)
			{
				if (has_unknow == null && !txt_clip.replace(/\s+/g, '').length)
				{
					has_unknow = false;

					ii_rebase++;
				}
				else
				{
					_files[name_last = name] = txt_clip;

					ic++;

					has_unknow = true;
				}

				idx = m.index;
			}
		}
		// 處理後續匹配 / Handle subsequent matches
		else if (m_last)
		{
			let id = padIndex(ii, 5, '0');
			let name = fix_name(m_last.match);

			// 執行忽略回調檢查 / Execute ignore callback check
			if (ignoreCb && ignoreCb({
				i,
				id,
				name,
				m,
				m_last,
				_files,
				ii,
				cache,
				idx,

				ic,
				ic_all,
				ix,
			}))
			{
				i_ignored++;

				if (idxSkipIgnored)
				{
					ii_rebase++;
				}

				continue;
			}

			// 執行自定義回調 / Execute custom callback
			if (cb)
			{
				let _ret = cb({
					i,
					id,
					name,
					m,
					m_last,
					_files,
					ii,
					cache,
					idx,

					ic,
					ic_all,
					ix,
				});

				if (_ret)
				{
					id = _ret.id;
					name = _ret.name;
					idx = _ret.idx;
				}
			}

			let txt_clip = txt.slice(idx, m.index);

			name = id + '_' + name;

			if (txt_clip.length)
			{
				_files[name_last = name] = txt_clip;

				idx = m.index;

				ic++;
			}
		}

		m_last = m;
	}

	// 處理剩餘內容 / Handle remaining content
	MAIN2:
	if (idx < txt.length - 1)
	{
		ii = (i_int + ix + 1 - ii_rebase).toString();

		let id = padIndex(ii, 5, '0');
		let name = fix_name(m_last.match);

		const id_old = id;

		let _skip: boolean;

		// 檢查是否應該跳過 / Check if should skip
		if (ignoreRe && ignoreRe.test(m_last.match))
		{
			_skip = true;
		}
		else if (ignoreCb && ignoreCb({
			i,
			id,
			name,
			m: null,
			m_last,
			_files,
			ii,
			cache,
			idx,

			ic,
			ic_all,
			ix,
		}))
		{
			_skip = true;
		}

		// 處理跳過的情況 / Handle skip case
		if (_skip)
		{
			if (name_last == null)
			{
				let name = 'unknow';
				let name_last = id + '_' + name;

				_files[name_last] = txt.slice(idx);
			}
			else
			{
				_files[name_last] += txt.slice(idx);
			}

			break MAIN2;
		}

		// 執行自定義回調 / Execute custom callback
		if (cb)
		{
			let m;

			let _ret = cb({
				i,
				id,
				name,
				m,
				m_last,
				_files,
				ii,
				cache,
				idx,

				ic,
				ic_all,
				ix,
			});

			if (_ret)
			{
				id = _ret.id;
				name = _ret.name;
				idx = _ret.idx;
			}
		}

		name = (id !== '' ? id + '_' : '') + name;

		_files[name] = txt.slice(idx);
	}

	// @ts-ignore
	cache.ix = parseInt(ii) + 1;

	return _files;
}
