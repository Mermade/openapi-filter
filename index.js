'use strict';

const recurse = require('reftools/lib/recurse.js').recurse;
const clone = require('reftools/lib/clone.js').clone;
const jptr = require('reftools/lib/jptr.js').jptr;

function filter(obj,options) {

    const defaults = {};
    defaults.tags = ['x-internal'];
    defaults.inverse = false;
    defaults.strip = false;
    defaults.overrides = [];
    options = Object.assign({},defaults,options);

    let src = clone(obj);
    let filtered = {};
    recurse(src,{},function(obj,key,state){
        for (let override of options.overrides||[]) {
            if (key.startsWith(override)) {
                obj[key.substring(override.length)] = obj[key];

                if (options.strip) {
                    delete obj[key];
                }
            }
        }
        for (let tag of options.tags) {
            if (obj[key] && obj[key][tag]) {
                if (options.inverse || options.reverse) {
                    if (options.strip) {
                        delete obj[key][tag];
                    }

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
    if (options.inverse && options.valid) {
        if (src.swagger && !filtered.swagger) {
            filtered.swagger = src.swagger;
        }
        if (src.openapi && !filtered.openapi) {
            filtered.openapi = src.openapi;
        }
        if (src.info && (!filtered.info || !filtered.info.version || !filtered.info.title)) {
            filtered.info = Object.assign({}, filtered.info, { title: src.info.title, version: src.info.version });
        }
        if (!filtered.paths) filtered.paths = {};
    }
    let reversed = {}
    if (options.reverse) {
        reversed = filtered
        if (src.openapi && !reversed.openapi) {
            reversed.openapi = src.openapi
        }
        if (src.info && !reversed.info) {
            reversed.info = src.info
        }
        if (src.externalDocs && !reversed.externalDocs) {
            reversed.externalDocs = src.externalDocs
        }
        if (src.servers && !reversed.servers) {
            reversed.servers = src.servers
        }
        if (src.tags && !reversed.tags) {
            reversed.tags = src.tags
        }
        if (src['x-tagGroups'] && !reversed['x-tagGroups']) {
            reversed['x-tagGroups'] = src['x-tagGroups']
        }
        if (src.paths && !reversed.paths) {
            reversed.paths = src.paths
        }
        if (src.components && !reversed.components) {
            reversed.components = src.components
        }
    }
    return (options.inverse ? filtered : options.reverse? reversed : src);
}

module.exports = {
    filter : filter
};

