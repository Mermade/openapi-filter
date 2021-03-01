# openapi-filter

![ci](https://github.com/Mermade/openapi-filter/workflows/ci/badge.svg)

Filter internal paths, operations, parameters, schemas etc from OpenAPI/Swagger/AsyncAPI definitions.

Simply flag any object within the definition with an `x-internal` specification extension, and it will be removed from the output.

For example:

```yaml
openapi: 3.0.0
info:
  title: API
  version: 1.0.0
paths:
  /:
    get:
      x-internal: true
      ...
```

Works with OpenAPI/Swagger 2.0 and 3.0.x and AsyncAPI definitions.

```
openapi-filter.js <infile> [outfile]

Positionals:
  infile   the input file
  outfile  the output file

Options:

  --info           include complete info object with --valid           [boolean]
  --inverse, -i    output filtered elements only                       [boolean]
  --flags, -f      flags to filter by          [array] [default: ["x-internal"]]
  --flagValues, -v flag String values to match             [array] [default: []]
  --checkTags      filter if flags given in --flags are in the tags array
                                                                       [boolean]
  --overrides, -o  prefixes used to override named properties[arr] [default: []]
  --valid          try to ensure inverse output is valid               [boolean]
  --strip, -s      strip the flags from the finished product           [boolean]
  --servers        include complete servers object with --valid        [boolean]
  --lineWidth, -l  max line width of yaml output          [number] [default: -1]
  --maxAliasCount  maximum YAML aliases allowed          [number] [default: 100]
  --configFile     The file & path for the filter options                 [path]
  --help           Show help                                           [boolean]
  --verbose        Output more details of the filter process             [count]
```

use `--` to separate flags or other array options from following options, i.e.:

`openapi-filter --flags x-private x-hidden -- source.yaml target.yaml`

or

```javascript
let openapiFilter = require('openapi-filter');
let options = {}; // defaults are shown
//options.inverse = false;
//options.valid = false;
//options.flags = ['x-internal'];
let res = openapiFilter.filter(obj,options);
```

See the [wiki](https://github.com/Mermade/openapi-filter/wiki) for further examples.
