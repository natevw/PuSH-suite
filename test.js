var request = require('supertest');

var HUB_URL = process.env.HUB_URL,
    CB_URL = process.env.CB_URL,
    PORT = process.env.PORT || 8000;

// assumes PUBLISHER_URL="http://ipcalf.com"
// i.e. not actually testing PubSubHubbub yet

describe('PubSubHubbub', function() {
  it('hub is alive', function (done) {
    request(HUB_URL).get("/")
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
  it('callback server is alive', function (done) {
    request(CB_URL).get("/")
      .expect('Content-Type', /plain/)
      .expect(200, done);
  });
  
});



// callback server (only active as long as Mocha runs)
var connect = require('connect');

var app = connect()
    .use(connect.logger('dev'))
    .use(function(req, res) {
        res.writeHead(200, {'Content-Type': "text/plain"});
        res.end('hello world\n');
    })
.listen(PORT);
