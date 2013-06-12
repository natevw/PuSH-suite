var express = require('express');

var app = express();

app.get('/resource', function(req, res){
  var self = req.protocol + "://" + req.get('host') + req.originalUrl;
  var hub = req.query.hub || 'http://pubsubhubbub.superfeedr.com';
  res.setHeader('Link' , ['<' + self + '>; rel="self";', '<' + hub + '>; rel="hub";']);
  res.send(200,'XXX');
});

module.exports = app;
