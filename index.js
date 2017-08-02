'use strict';

var common = require('openapi_optimise/common.js');

function clone(o){
	return JSON.parse(JSON.stringify(o));
}

function filter(obj,options) {
	var src = clone(obj);
	common.recurse(src,{},function(o,state){
		if (o["x-internal"]) {
			delete state.parent[state.key];
		}
	});
	return src;
}

module.exports = {
	filter : filter
};

