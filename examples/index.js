// $ node examples simple
let fs = require('fs');
let path = require('path');
let file = path.resolve(process.argv[2] + '.md');
let str = fs.readFileSync(file, 'utf8');
let md = require('..').parse;
console.log(JSON.stringify(md(str), null, 2));
