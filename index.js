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
    let filteredpaths = [];
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
                if (options.inverse) {
                    if (options.strip) {
                        delete obj[key][tag];
                    }
                    jptr(filtered,state.path,clone(obj[key]));
                }
                filteredpaths.push(state.path);
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
    recurse(src,{},function(obj,key,state){
        if (obj.hasOwnProperty('$ref') && filteredpaths.includes(obj['$ref'])) {
            if (Array.isArray(state.parent)) {
                state.parent.splice(state.pkey, 1);
            }
        }
    });
    if (options.inverse && options.valid) {
        let info = {};
        if (src.info && (!filtered.info || !filtered.info.version || !filtered.info.title)) {
            info = Object.assign({}, filtered.info, options.info ? src.info : { title: src.info.title, version: src.info.version });
        }
        if (src.swagger && !filtered.swagger) {
            filtered = Object.assign({ swagger: src.swagger, info: info }, filtered);
        }
        if (src.openapi && !filtered.openapi) {
            filtered = Object.assign({ openapi: src.openapi, info: info }, filtered);
        }
        if (!filtered.security && Array.isArray(src.security)) {
            const filteredsecurityschemes = [];
            // OAS2
            if (filtered.securityDefinitions) {
                filteredsecurityschemes.push(...Object.keys(filtered.securityDefinitions));
            }
            // OAS3
            if (filtered.components && filtered.components.securitySchemes) {
                filteredsecurityschemes.push(...Object.keys(filtered.components.securitySchemes));
            }
            filtered.security = src.security.filter(req => {
                const filteredreq = {};
                Object.getOwnPropertyNames(req).forEach(function(n){
                    if (filteredsecurityschemes.includes(n)) {
                        filteredreq[n] = clone(req[n]);
                    }
                });
                return Object.getOwnPropertyNames(filteredreq).length !== 0;
            });
        }
        if (!filtered.paths) filtered.paths = {};

        if (options.servers && !filtered.servers && Array.isArray(src.servers)) {
            filtered.servers = src.servers;
        }
    }
    return (options.inverse ? filtered : src);
}

module.exports = {
    filter : filter
};

