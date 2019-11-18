#!/usr/bin/env node

'use strict';

const fs = require('fs');
const yaml = require('yaml');
const {strOptions} = require('yaml/types');
const openapiFilter = require('./index.js');

let argv = require('yargs')
    .usage('Usage: openapi-filter [options] {infile} [{outfile}]')
    .demand(1)
    .strict()
    .boolean('info')
    .describe('info','include complete info object with --valid')
    .boolean('inverse')
    .describe('inverse','output filtered elements only')
    .alias('i','inverse')
    .boolean('servers')
    .describe('servers','include complete servers object with --valid')
    .array('tags')
    .alias('t','tags')
    .describe('tags','tags to filter by')
    .default('tags',['x-internal'])
    .array('overrides')
    .alias('o', 'overrides')
    .default('overrides', [])
    .describe('overrides', 'tags to override fields')
    .boolean('valid')
    .describe('valid','try to ensure inverse output is valid')
    .boolean('strip')
    .alias('s', 'strip')
    .describe('strip','strip the tags from the finished product')
    .number('lineWidth')
    .alias('l', 'lineWidth')
    .describe('lineWidth','max line width of yaml output')
    .default('lineWidth',-1)
    .help('h')
    .alias('h', 'help')
    .version()
    .argv;

let s = fs.readFileSync(argv._[0],'utf8');
let obj = yaml.parse(s);
let res = openapiFilter.filter(obj,argv);
if (argv._[0].indexOf('.json')>=0) {
    s = JSON.stringify(res,null,2);
}
else {
    strOptions.fold.lineWidth = argv.lineWidth;
    s = yaml.stringify(res);
}
if (argv._.length>1) {
    fs.writeFileSync(argv._[1],s,'utf8');
}
else {
    console.log(s);
}

