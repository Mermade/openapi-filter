#!/usr/bin/env node

'use strict';

const fs = require('fs');
const yaml = require('yaml');
const {strOptions} = require('yaml/types');
const openapiFilter = require('./index.js');
const recurse = require('reftools/lib/recurse.js').recurse;

let argv = require('yargs')
    .usage('$0 <infile> [outfile]',false,(yargs) => {
      yargs
        .positional('infile',{ describe: 'the input file' })
        .positional('outfile',{ describe: 'the output file, can be .yaml or .json' })
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
    .array('scopes')
    .describe('scopes', 'filter based upon oauth security scheme scopes, instead of \'x-internal\' flags')
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

//  --scopes on the cmdline  turns on checkScopes options, and the listed scopes move to flags; to make the code simpler...
if(argv.scopes) {
    argv.flags = argv.scopes;
    argv.checkScopes = true;
}

let s = fs.readFileSync(argv.infile,'utf8');
let obj = yaml.parse(s, {maxAliasCount: argv.maxAliasCount});
let oasSpec = openapiFilter.filter(obj,argv);

// All that filtering, may mean we have to prune the /components/schemas  and tags....
let usedSchemas = [];
var additions=0;

// go looking for $refs,put the target schema into the list...
let checkRef = (obj, key, state) => {
    if(obj.$ref && obj.$ref.startsWith('#/components/schemas/')) {

        if(! usedSchemas.includes(obj.$ref.substring(21))) {
            usedSchemas.push(obj.$ref.substring(21));
            additions++; // keep track of additions made (in GLOBAL variable, naughty, naughty)
        }
    }
};

// check oasSpec.paths to get the set of components/schemas that're actually used...
Object.keys(oasSpec.paths).forEach((key, ndx, keys) => {
    recurse(oasSpec.paths[key], {}, checkRef);
});


// check all the various components sections (parameters, responses, requestBodies, callbacks, etc)
// for more $refs to components/schemas 
Object.keys(oasSpec.components).forEach((section, sNdx, sections) => {

    // don't do component/schemas ... that has to be done carefully in just a sec
    if(section != 'schemas') {

        Object.keys(oasSpec.components[section]).forEach((key, kNdx, keys) => {
            recurse(oasSpec.components[section][key], {}, checkRef);
        });
    }
});

// go looking for $refs in the set of usedSchemas...and augment the set of usedSchemas as appropriate
do {    // keep going until we don't add any more schemas; cycles will break this.
    additions = 0;
    usedSchemas.forEach((key, ndx, keys) => {
        recurse(oasSpec.components.schemas[key], {}, checkRef);
    });
} while (additions > 0);


// prune the set of schemas in the original oasSpec, to be only the ones we're using...
Object.keys(oasSpec.components.schemas).forEach((key, ndx, keys) => {

    if(! usedSchemas.includes(key)) {
        delete oasSpec.components.schemas[key];
    }
});


// Now check for tags...
let usedTagNames = []
let checkTags = (obj, key, state) => {
    if(obj.tags) {
        obj.tags.forEach((tag, tNdx, tags) => {
            if(! usedTagNames.includes(tag)) {
                usedTagNames.push(tag);
            }    
        });
    }
};
// check oasSpec.paths to get the set of tags that're actually used...
Object.keys(oasSpec.paths).forEach((key, ndx, keys) => {
    recurse(oasSpec.paths[key], {}, checkTags);
});

// assemble a new set of tags, to be only the ones we're using...
let newTagDefns = [];
oasSpec.tags.forEach((tag, tNdx, tags) => {
    if(usedTagNames.includes(tag.name) || tag.name.endsWith("Overview"))
        newTagDefns.push(tag);
});
oasSpec.tags = newTagDefns;

// Now write out the result in either YAML or JSON 
if (argv.infile.indexOf('.json')>=0 || (argv.outfile && argv.outfile.indexOf('.json')>=0)) {
    s = JSON.stringify(oasSpec,null,2);
}
else {
    strOptions.fold.lineWidth = argv.lineWidth;
    s = yaml.stringify(oasSpec);
}
if (argv.outfile) {
    fs.writeFileSync(argv.outfile,s,'utf8');
}
else {
    console.log(s);
}

