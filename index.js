'use strict';

const recurse = require('reftools/lib/recurse.js').recurse;
const clone = require('reftools/lib/clone.js').clone;
const jptr = require('reftools/lib/jptr.js').jptr;

function filter(obj,options) {

    const defaults = {};
    defaults.flags = ['x-internal'];
    defaults.flagValues = [];
    defaults.checkTags = false;
    defaults.inverse = false;
    defaults.strip = false;
    defaults.overrides = [];
    options = Object.assign({},defaults,options);

    let src = clone(obj);
    let filtered = {};
    let filteredpaths = [];
    recurse(src,{},function(obj,key,state){
        for (let override of options.overrides) {
            if (key.startsWith(override)) {
                obj[key.substring(override.length)] = obj[key];
                if (options.strip) {
                    delete obj[key];
                }
            }
        }

        for (let flag of options.flags) {
            if ((options.checkTags == false && (obj[key] && ((options.flagValues.length == 0 && obj[key][flag]) || options.flagValues.includes(obj[key][flag])))) || (options.checkTags && (obj[key] && obj[key].tags && Array.isArray(obj[key].tags) && obj[key].tags.includes(flag)))) {
                if (options.inverse) {
                    if (options.strip) {
                        delete obj[key][flag];
                    }
                    if (Array.isArray(obj)) {
                      // we need to seed the presence of an empty array
                      // otherwise jptr won't know whether it's setting
                      // an array entry or a property with a numeric key #26
                      const components = state.path.split('/');
                      components.pop(); // throw away last item
                      if (jptr(filtered,components.join('/')) === false) {
                        jptr(filtered,components.join('/'),[]);
                      }
                    }
                    jptr(filtered,state.path,clone(obj[key]));
                }
                filteredpaths.push(state.path);
                delete obj[key];
                break;
            }
        }
    });

    // remove undefined properties (important for YAML output)
    recurse((options.inverse ? filtered : src),{},function(obj,key,state){
        if (Array.isArray(obj[key])) {
            obj[key] = obj[key].filter(function(e){
                return typeof e !== 'undefined';
            });
        }
    });

    recurse(src,{},function(obj,key,state){
        if (Array.isArray(obj) && obj.length > 0) {
            for (let idx = 0; idx < obj.length; idx++) {
                if (obj[idx] && obj[idx].hasOwnProperty('$ref') && filteredpaths.includes(obj[idx].$ref)) {
                    obj.splice(idx, 1);
                    idx--;
                }
            }
        }
    });

    // tidy up any paths where we have removed all the operations
    for (let p in src.paths) {
        if (Object.keys(src.paths[p]).length === 0) {
            delete src.paths[p];
        }
    }

    if (options.inverse && options.valid) {
        // ensure any components being reffed are still included in output
        let checkForReferences = true;

        while (checkForReferences) {
            checkForReferences = false;
            let changesMade = false;

            recurse(filtered, {}, function (o, key, state) {
                if ((key === '$ref') && (typeof o[key] === 'string') && (o[key].startsWith('#'))) {
                    if (!jptr(filtered, o.$ref)) {
                        jptr(filtered, o.$ref, jptr(obj, o.$ref));

                        changesMade = true;
                    }
                }

                checkForReferences = changesMade;
            });
        }

        let info = {};
        if (src.info && (!filtered.info || !filtered.info.version || !filtered.info.title)) {
            info = Object.assign({}, filtered.info, options.info ? src.info : { title: src.info.title, version: src.info.version });
        }
        if (src.asyncapi && !filtered.asyncpi) {
            filtered = Object.assign({ asyncapi: src.asyncapi, info: info }, filtered);
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
        if (!filtered.paths && !filtered.asyncapi) filtered.paths = {};

        if (options.servers && !filtered.servers && Array.isArray(src.servers)) {
            filtered.servers = src.servers;
        }

        const activeSecuritySchemes=
            (src.paths?Object.keys(src.paths):[])
                .flatMap(pathUrl =>src.paths[pathUrl])
                .flatMap(pathElement => Object.keys(pathElement)
                .flatMap(method =>pathElement[method]))
                .filter(path => Object.keys(path).filter(value => options.flags.includes(value)))
                .flatMap(path =>{
                    if (!filtered.security && Array.isArray(path.security)) {
                        return path.security.flatMap(securityItem => Object.keys(securityItem));
                    } else {
                        return [];
                    }
                })
                .filter(filterUnique)

        // OAS2
        if (src.securityDefinitions) {
            filtered.securityDefinitions = Object.fromEntries(Object.entries(src.securityDefinitions).filter(([key]) => activeSecuritySchemes.includes(key)));
        }
        // OAS3
        if (src.components && src.components.securitySchemes) {
            if (!filtered.components){
                filtered.components ={};
            }
            filtered.components.securitySchemes = Object.fromEntries(Object.entries(src.components.securitySchemes).filter(([key]) => activeSecuritySchemes.includes(key)));
        }
    }
    return (options.inverse ? filtered : src);
}

function filterUnique(value, index, array) {
    return array.indexOf(value) === index;
}

module.exports = {
    filter : filter
};
