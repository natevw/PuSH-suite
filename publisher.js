var http = require('http');
var express = require('express');
var request = require('request');
var fs = require('fs')

var app = express();

app.use(express.compress());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.errorHandler());

app.get('/resource', function(req, res){
  publisher.self = req.protocol + "://" + req.get('host') + req.originalUrl;
  var callback = req.protocol + "://" + req.get('host') + '/validate'
  res.setHeader('Link' , [
                '<' + publisher.self + '>; rel="self";',
                '<' + publisher.hub + '>; rel="hub";',
                '<' + callback + '>; rel="validate";'
                ]);

  fs.readFile('./entries.xml', 'utf8', function (err,entries) {
    var feed = '<?xml version="1.0" encoding="utf-8"?>\
    <feed xmlns="http://www.w3.org/2005/Atom">\
    <title>Publisher example</title>\
    <link rel="self" type="application/atom+xml" href="' + publisher.self + '"/>\
    <link rel="hub" href="' + publisher.hub + '"/>\
    <updated>2013-06-14T12:13:49Z</updated>\
    <id>http://push-pub.appspot.com/feed</id>\
    <author>\
    <name>nobody</name>\
    </author>\
    ' + entries + '\
    </feed>';
    res.setHeader('Content-Type', 'application/atom+xml');
    res.send(200, feed);
  });
});

app.post('/validate', function(req, res) {
  if(req.body && req.body['hub.topic'] && req.body['hub.topic'].match(/denied$/))
    return res.send(401)
  return res.send(204)
});


var publisher = http.createServer(app);

publisher.hub = 'http://pubsubhubbub.superfeedr.com'; // default
publisher.self = null;

publisher.publish = function(cb) {
  // First, add a new entry to the list.
  var id = Math.random().toString().split('.')[1];
  var entry = '\
<entry>\
  <title>Another entry</title>\
  <id>' + id + '</id>\
  <published>' + new Date().toISOString() + '</published>\
  <content type="html">Another entry\'s content</content>\
  <link href="/entry/' + id + '"/>\
</entry>\
\
';
  fs.appendFile('./entries.xml', entry, function() {
    request.post(publisher.hub, {form: {'hub.mode':  'publish', 'hub.topic' : publisher.self}}, cb);
  });
}

module.exports = publisher;
