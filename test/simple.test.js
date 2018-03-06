const util = require('util');
const express = require('express');
const {memviz} = require('memviz');

const app = express();

app.use('/memory', memviz({
  frequency: 1000
}));

app.use(function (req, res, next) {
  next(new Error('404'));
});

app.use(function (err, req, res, next) {
  res.send('There was an application error => ' + util.inspect(err));
});

const port = parseInt(process.env.MEMVIZ_TEST_PORT || '3001');

if (!Number.isInteger(port)) {
  throw new Error('port is not an integer: ' + port);
}

app.listen(port, function () {
  console.log('app is listening on port:', port)
});

app.on('error', function (err) {
  err && console.error(err.stack || err);
});