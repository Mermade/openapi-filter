'use strict';

const recurse = require('reftools/lib/recurse.js').recurse;
const clone = require('reftools/lib/clone.js').clone;

function filter(obj,options) {
	var src = clone(obj);
	recurse(src,{},function(obj,key,state){
		if (obj[key]["x-internal"]) {
			delete obj[key];
		}
	});
	return src;
}

module.exports = {
	filter : filter
};

