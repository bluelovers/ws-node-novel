
// $ node examples simple

let fs = require('fs');
let file = 'examples/' + process.argv[2] + '.md';

let str = fs.readFileSync(file, 'utf8');
let md = require('..');

console.log(JSON.stringify(md(str), null, 2));
