#!/usr/bin/env node

// $ node examples simple

import fs from 'fs';
import path from 'path';
import { parse } from '..';

let file = path.resolve(process.argv[2] + '.md');

let str = fs.readFileSync(file, 'utf8');

console.log(JSON.stringify(parse(str), null, 2));
