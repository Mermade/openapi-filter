# openapi-filter

Filter internal paths, operations, parameters, schemas etc from OpenAPI/Swagger definitions

Simply tag any object within the definition with an `x-internal` specification extension, and it will be removed from the output.

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

Works with OpenAPI/Swagger 2.0 and 3.0.x and AsyncAPI 1.x definitions.

```
openapi-filter.js <infile> [outfile]

Positionals:
  infile   the input file
  outfile  the output file

Options:

  --info           include complete info object with --valid           [boolean]
  --inverse, -i    output filtered elements only                       [boolean]
  --tags, -t       tags to filter by           [array] [default: ["x-internal"]]
  --overrides, -o  tags to override fields                 [array] [default: []]
  --valid          try to ensure inverse output is valid               [boolean]
  --strip, -s      strip the tags from the finished product            [boolean]
  --servers        include complete servers object with --valid        [boolean]
  --lineWidth, -l  max line width of yaml output          [number] [default: -1]
  --maxAliasCount  maximum YAML aliases allowed          [number] [default: 100]
  --help           Show help                                           [boolean]

```

use `--` to separate tags or other array options from following options, i.e.:

`openapi-filter --tags x-private x-hidden -- source.yaml target.yaml`

or

```javascript
let openapiFilter = require('openapi-filter');
let options = {}; // defaults are shown
//options.inverse = false;
//options.valid = false;
//options.tags = ['x-internal'];
let res = openapiFilter.filter(obj,options);
```
