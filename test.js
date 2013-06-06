var request = require('supertest'),
assert = require('assert');

var publisher = require('./publisher.js'),
susbcriber = require('./subscriber.js');

// https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html

var HUB_URL = process.env.HUB_URL

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
    it('should return a 202 when issuing a valid subscription request');
    it('should accept http callback urls')
    it('should accept https callback urls')
    it('should accept callback urls with extra string parameters')
    it('should accept only the self link provided by the discovery phase, if there is any')
    it('should return a 4xx when issuing a invalid subscription request with no hub.callback and provide the right error in the body');
    it('should return a 4xx when issuing a invalid subscription request with no hub.mode and provide the right error in the body');
    it('should return a 4xx when issuing a invalid subscription request with no hub.topic and provide the right error in the body');
    it('should return a 4xx when issuing a invalid subscription request with a hub.topic which is not the self url and provide the right error in the body');
    it('should ignore extra parameters they do not understand')
    it('should accept re-subscriptions')


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


