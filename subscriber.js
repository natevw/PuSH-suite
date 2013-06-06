var express = require('express');

var app = express();

app.get('/callback', function(req, res){
  res.send(200, 'Hello World');
});

module.exports = app;
