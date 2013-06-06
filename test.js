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
    describe('Subscription Request', function() {
      describe('Subscription Parameter details', function() {
      });

      describe('Subscription Response details', function() {
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


