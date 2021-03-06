var express = require('express');
var wagner = require('wagner-core');

require('./models')(wagner);
require('./dependencies')(wagner);

var app = express();

wagner.invoke(require('./auth'), { app: app });

app.use('/api/v1', require('./api')(wagner));

// serve statick pages from the file system
app.use(express.static('../', {maxAge: 4 * 60 * 60 * 1000 }))

app.listen(3000);
console.log('Listening on port 3000!');
