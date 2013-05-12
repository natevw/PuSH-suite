var request = require('supertest');

// assumes PUBLISHER_URL="http://ipcalf.com"
// i.e. not actually testing PubSubHubbub yet

describe('Hello World.', function() {
  it('respond with json', function (done) {
    request(process.env.PUBLISHER_URL)
      .get("?format=json")
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});