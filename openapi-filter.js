#!/usr/bin/env node

'use strict';

const fs = require('fs');
const yaml = require('yaml');
const {strOptions} = require('yaml/types');
const openapiFilter = require('./index.js');

let argv = require('yargs')
    .usage('$0 <infile> [outfile]',false,(yargs) => {
      yargs
        .positional('infile',{ describe: 'the input file' })
        .positional('outfile',{ describe: 'the output file' })
    })
    .strict()
    .boolean('info')
    .describe('info','include complete info object with --valid')
    .boolean('inverse')
    .describe('inverse','output filtered elements only')
    .alias('inverse','i')
    .boolean('servers')
    .describe('servers','include complete servers object with --valid')
    .array('flags')
    .alias('flags','f')
    .describe('flags','flags to filter by')
    .default('flags',['x-internal'])
    .array('flagValues')
    .alias('flagValues', 'v')
    .describe('flagValues', 'flag string values to consider as a filter match (in addition to matching on boolean types)')
    .default('flagValues', [])
    .boolean('checkTags')
    .describe('checkTags', 'filter if flags given in --flags are in the tags array')
    .array('overrides')
    .alias('overrides','o')
    .default('overrides', [])
    .describe('overrides', 'prefixes used to override named properties')
    .boolean('valid')
    .describe('valid', 'try to ensure inverse output is valid')
    .boolean('strip')
    .alias('strip','s')
    .describe('strip','strip the flags from the finished product')
    .number('lineWidth')
    .alias('lineWidth','l')
    .describe('lineWidth','max line width of yaml output')
    .default('lineWidth',-1)
    .number('maxAliasCount')
    .default('maxAliasCount',100)
    .describe('maxAliasCount','maximum YAML aliases allowed')
    .help()
    .version()
    .argv;

let s = fs.readFileSync(argv.infile,'utf8');
let obj = yaml.parse(s, {maxAliasCount: argv.maxAliasCount});
let res = openapiFilter.filter(obj,argv);
if (argv.infile.indexOf('.json')>=0) {
    s = JSON.stringify(res,null,2);
}
else {
    strOptions.fold.lineWidth = argv.lineWidth;
    s = yaml.stringify(res);
}
if (argv.outfile) {
    fs.writeFileSync(argv.outfile,s,'utf8');
}
else {
    console.log(s);
}

