'use strict';

const recurse = require('reftools/lib/recurse.js').recurse;
const clone = require('reftools/lib/clone.js').clone;
const jptr = require('reftools/lib/jptr.js').jptr;

function filter(obj,options) {

    const defaults = {};
    defaults.tags = ['x-internal'];
    defaults.inverse = false;
    options = Object.assign({},defaults,options);

    let src = clone(obj);
    let filtered = {};
    recurse(src,{},function(obj,key,state){
        for (let tag of options.tags) {
            if (obj[key] && obj[key][tag]) {
                if (options.inverse) {
                    jptr(filtered,state.path,clone(obj[key]));
                }
                delete obj[key];
                break;
            }
        }
    });
    recurse(src,{},function(obj,key,state){
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].filter(function(e){
                return typeof e !== 'undefined';
            });
        }
    });
    return (options.inverse ? filtered : src);
}

module.exports = {
    filter : filter
};

