'use strict';

const recurse = require('reftools/lib/recurse.js').recurse;
const clone = require('reftools/lib/clone.js').clone;
const jptr = require('reftools/lib/jptr.js').jptr;

function filter(obj,options) {
	let src = clone(obj);
    let filtered = {};
	recurse(src,{},function(obj,key,state){
		if (obj[key]["x-internal"]) {
            if (options.inverse) {
                jptr(filtered,state.path,clone(obj[key]));
            }
			delete obj[key];
		}
	});
	return (options.inverse ? filtered : src);
}

module.exports = {
	filter : filter
};

