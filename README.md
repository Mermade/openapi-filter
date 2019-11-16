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
Usage: openapi-filter [options] {infile} [{outfile}]

Options:
  --info           include complete info object with --valid              [boolean]
  --servers        include complete servers object with --valid           [boolean]
  --valid           try to ensure inverse output is valid                 [boolean]
  -h, --help        Show help                                             [boolean]
  --version         Show version number                                   [boolean]
  -i, --inverse     output filtered elements only                         [boolean]
  -t, --tags        tags to filter by             [array] [default: ["x-internal"]]
  -s, --strip       strip the tags after filtering                        [boolean]
  -o, --overrides   tags that act as overrides                [array] [default: []]
  -l, --lineWidth   determines the line width of the output                [number]
```

use `--` to separate tags from other options, i.e.:

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
