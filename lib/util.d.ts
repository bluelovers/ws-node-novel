/**
 * Created by user on 2018/11/14/014.
 */
import * as FastGlob from 'fast-glob';
import { IMdconfMeta } from 'node-novel-info';
import BluebirdPromise = require('bluebird');
export declare function loadReadmeMeta<T extends IMdconfMeta = IMdconfMeta>(file: string): Promise<T>;
export declare function loadReadmeMetaSync<T extends IMdconfMeta = IMdconfMeta>(file: string): T;
export declare function getNovelTitles<T extends IMdconfMeta = IMdconfMeta>(meta: T): string[];
export declare function globFirst(...argv: Parameters<typeof FastGlob["stream"]>): BluebirdPromise<string>;
export declare function md_href(href: string): string;
export declare function md_anchor_gitee(title: string): string;
export declare function md_link_escape(text: string): string;
