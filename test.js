var urlParser = require('url');
var request = require('supertest'),
assert = require('assert');

var publisher = require('./publisher.js'),
subscriber = require('./subscriber.js');

// https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html

var HUB_URL = process.env.HUB_URL

if(!HUB_URL) {
  console.log('Please define HUB_URL');
  process.exit('1')
}

describe('PubSubHubbub', function () {
  describe('Discovery', function() {
    describe('The publisher', function() {
      it('should serve the resources with a link header pointing to a self url', function(done) {
        request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
          assert(res.links.self);
          done();
        });
      });
      it('should serve the resources with a link header pointing to the right hub', function(done) {
        request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
          assert.equal(res.links.hub, HUB_URL);
          done();
        });
      });
    });
  });

  describe('Subscribing', function() {
    it('should return a 202 when issuing a valid subscription request', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          expect(202, done);
        });
      });
    });

    it('should accept http callback urls', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          expect(202, done);
        });
      });
    });

    it('should accept https callback urls', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self.replace('http', 'https');
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          expect(202, done);
        });
      });
    });

    it('should accept callback urls with extra string parameters', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self + '?param=extra';
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          expect(202, done);
        });
      });
    });

    it('should accept only the self link provided by the discovery phase, if there is any', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var parsed = urlParser.parse(res.links.self);
        parsed.hash = 'hello'
        var resource = urlParser.format(parsed);
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          expect(422, done);
        });
      });
    });


    it('should return a 4xx when issuing a invalid subscription request with no hub.callback and provide the right error in the body', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          expect(422, /hub\.callback/, done);
        });
      });
    });

    it('should return a 4xx when issuing a invalid subscription request with no hub.mode and provide the right error in the body', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          expect(422, /hub\.mode/, done);
        });
      });
    });

    it('should return a 4xx when issuing a invalid subscription request with no hub.topic and provide the right error in the body', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.callback=' + callback).
          expect(422, /hub\.topic/, done);
        });
      });
    });

    it('should ignore extra parameters they do not understand', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          send('another=param').
          expect(202, done);
        });
      });
    });

    it('should accept re-subscriptions', function(done) {
      request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
        var resource = res.links.self;
        request(subscriber).get('/callback').expect(200, function(err, res) {
          var callback = res.links.self;
          request(HUB_URL).
          post('/').
          type('form').
          send('hub.mode=subscribe').
          send('hub.topic=' + resource).
          send('hub.callback=' + callback).
          expect(202, function() {
            request(publisher).get('/resource?hub=' + HUB_URL).expect(200, function(err, res) {
              var resource = res.links.self;
              request(subscriber).get('/callback').expect(200, function(err, res) {
                var callback = res.links.self;
                request(HUB_URL).
                post('/').
                type('form').
                send('hub.mode=subscribe').
                send('hub.topic=' + resource).
                send('hub.callback=' + callback).
                expect(202, done);
              });
            });
          });
        });
      });
    });


    describe('Subscription Validation', function() {

    });

    describe('Hub Verifies Intent of the Subscriber', function() {
      describe('Verification Details', function() {

      });
    });
  });

  describe('Publishing', function() {
  });

  describe('Content Distribution', function() {
  });

  describe('Authenticated Content Distribution', function() {
  });
});


