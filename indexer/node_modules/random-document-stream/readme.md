random document stream
====

creates a stream of random documents for use in testing PouchDB/CouchDB

```bash
npm install random-document-stream
```

```js
var Random = require('random-document-stream');
var random = new Random(n);
random.on('data', function (d) {
  // called n times
})
```