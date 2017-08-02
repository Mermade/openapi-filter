#!/bin/env node

'use strict';

var fs = require('fs');
var yaml = require('js-yaml');
var openapiFilter = require('./index.js');

if (process.argv.length>2) {
	var s = fs.readFileSync(process.argv[2],'utf8');
	var obj = yaml.safeLoad(s,{json:true});
	var res = openapiFilter.filter(obj);
	if (process.argv[2].indexOf('.json')>=0) {
		s = JSON.stringify(res,null,2);
	}
	else {
		s = yaml.safeDump(res,{lineWidth:-1});
	}
	if (process.argv.length>3) {
		fs.writeFileSync(process.argv[3],s,'utf8');
	}
	else {
		console.log(s);
	}
}
else {
	console.log('Usage: openapi-filter {infile} [{outfile}]');
}

