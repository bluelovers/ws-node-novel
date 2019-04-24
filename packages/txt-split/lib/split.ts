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

export function splitVolumeSync<O extends Partial<ISplitCache>>(txt: IContext, cache: O): IDataVolume
{
	let _vs: IDataChapter;

	txt = String(txt);

	if (!cache || !cache.chapter || !cache.chapter.r)
	{
		throw new RangeError(`options.chapter.r is required`)
	}

	if (cache.beforeStart)
	{
		cache.beforeStart(cache);
	}

	MAIN:
	if (cache.volume && !cache.volume.disable)
	{
		let _r = cache.volume.r;

		let _m = execall(_r, txt, {
			cloneRegexp,
		});

		//console.debug(_r, _m, txt);
		//console.debug(_r, _m, txt);

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

	if (!_vs)
	{
		_vs = {};
		_vs['00000_unknow'] = txt;
	}

	let _out: IDataVolume = {};

	cache.ix = 0;

	for (let vn in _vs)
	{
		let txt = _vs[vn];

		let _r = cache.chapter.r;
		let _m = execall(_r, txt, {
			cloneRegexp,
		});

		//console.log(_r, _m, txt);

		//console.log(cache.ix);

		if (!_m || !_m.length)
		{
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

export function splitChapterSync<O extends Partial<ISplitCache>>(txt: IContext, cache: O, _m: ISplitMatch, splitOption: ISplitOption): IDataChapter<string>
{
	let _files: IDataChapter = {};
	let idx = 0;

	let { cb, ignoreCb, ignoreRe } = splitOption;

	txt = String(txt);

	cache.txt = txt;

	let m_last;

	let i: string;
	let ix = cache.ix || 0;
	let ii: string;

	let name_last: string;

	for (i in _m)
	{
		ii = (parseInt(i) + ix).toString();

		let m = _m[i];

		if (ignoreRe)
		{
			if (ignoreRe.test(m.match))
			{
				/**
				 * @todo here maybe will has bug, need test
				 */
				continue;
			}

			ignoreRe.lastIndex = 0;
		}

		if (!m_last && idx == 0 && m.index != 0)
		{
			//console.log(m);

			let id = padIndex(ii, 5, '0');
			let name = 'unknow';

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
			}))
			{
				continue;
			}

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
				});

				if (_ret)
				{
					id = _ret.id;
					name = _ret.name;
					idx = _ret.idx;
				}
			}

			name = id + '_' + name;

			let txt_clip = txt.slice(idx, m.index);

			if (txt_clip)
			{
				_files[name_last = name] = txt_clip;

				idx = m.index;
			}
		}
		else if (m_last)
		{
			let id = padIndex(ii, 5, '0');
			let name = fix_name(m_last.match);

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
			}))
			{
				continue;
			}

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
				});

				if (_ret)
				{
					id = _ret.id;
					name = _ret.name;
					idx = _ret.idx;
				}
			}

			//console.log(id, name, _ret);

			name = id + '_' + name;

			//console.log([name]);

			//name = `${id}_Act：${StrUtil.toFullWidth(i.padStart(3, '0'))}`;

			let txt_clip = txt.slice(idx, m.index);

			if (txt_clip)
			{
				_files[name_last = name] = txt_clip;

				idx = m.index;
			}
		}

		m_last = m;
	}

	MAIN2:
	if (idx < txt.length - 1)
	{
		ii = (parseInt(i) + ix + 1).toString();

		let id = padIndex(ii, 5, '0');
		let name = fix_name(m_last.match);

		let _skip: boolean;

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
		}))
		{
			_skip = true;
		}

		if (_skip)
		{
			_files[name_last] += txt.slice(idx);

			break MAIN2;
		}

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

	cache.ix = parseInt(ii) + 1;

	return _files;
}
