'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const yaml = require('yaml');

const filter = require('../index.js');

const doPrivate = (!process.env.SKIP_PRIVATE);

const tests = fs.readdirSync(__dirname).filter(file => {
    return fs.statSync(path.join(__dirname, file)).isDirectory() && (!file.startsWith('_') || doPrivate);
});

describe('Filter tests', () => {
tests.forEach((test) => {
    describe(test, () => {
        it('should match expected output', (done) => {
            let options = {};
            try {
                options = yaml.parse(fs.readFileSync(path.join(__dirname, test, 'options.yaml'),'utf8'), {schema:'core'});
            }
            catch (ex) {};

            if (options.maxAliasCount) {
                yaml.defaultOptions.maxAliasCount = options.maxAliasCount;
            }

            const input = yaml.parse(fs.readFileSync(path.join(__dirname, test, 'input.yaml'),'utf8'), {schema:'core'});
            let readOutput = false;
            let output = {};
            try {
              output = yaml.parse(fs.readFileSync(path.join(__dirname, test, 'output.yaml'),'utf8'), {schema:'core'});
              readOutput = true;
            }
            catch (ex) {};

            const result = filter.filter(input, options);
            if (!readOutput) {
              output = result;
              fs.writeFileSync(path.join(__dirname, test, 'output.yaml'), yaml.stringify(result), 'utf8');
            }

            assert.deepStrictEqual(result, output);
            return done();
        });
    });
});
});
