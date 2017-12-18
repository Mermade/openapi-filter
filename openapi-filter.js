#!/bin/env node

'use strict';

const fs = require('fs');
const yaml = require('js-yaml');
const yargs = require('yargs');
const openapiFilter = require('./index.js');

let argv = require('yargs')
    .usage('Usage: openapi-filter [options] {infile} [{outfile}]')
    .demand(1)
    .strict()
    .boolean('inverse')
    .describe('inverse','output filtered elements only')
    .alias('i','inverse')
    .help('h')
    .alias('h', 'help')
    .version()
    .argv;

let s = fs.readFileSync(argv._[0],'utf8');
let obj = yaml.safeLoad(s,{json:true});
let res = openapiFilter.filter(obj,argv);
if (argv._[0].indexOf('.json')>=0) {
	s = JSON.stringify(res,null,2);
}
else {
	s = yaml.safeDump(res,{lineWidth:-1});
}
if (argv._.length>1) {
	fs.writeFileSync(argv._[1],s,'utf8');
}
else {
	console.log(s);
}

