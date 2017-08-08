# openapi-filter

Filter internal paths, operations, parameters, schemas etc from OpenAPI/Swagger definitions

Simply tag any object within the definition with an `x-internal` specification extension, and it will be removed from the output.

Works with OpenAPI/Swagger 2.0 and 3.0.x and AsyncAPI 1.x definitions.

```sh
Usage: openapi-filter {infile} [{outfile}]
```

or 

```javascript
var openapiFilter = require('openapi-filter');
var res = openapiFilter.filter(obj);
```
