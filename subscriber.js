var express = require('express');

var app = express();

app.get('/callback', function(req, res) {
  var self = req.protocol + "://" + req.get('host') + req.originalUrl;
  res.setHeader('Link' , '<' + self + '>; rel="self";');
  res.send(200,' THANKS ');
});

module.exports = app;
