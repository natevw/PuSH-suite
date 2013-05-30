var request = require('supertest');

var HUB_URL = process.env.HUB_URL,
    CB_URL = process.env.CB_URL,
    PORT = process.env.PORT || 8000;

describe('PubSubHubbub', function() {
    it('accepts subscription', function (done) {
        request(HUB_URL).post("/").type('form').send({
            'hub.callback': CB_URL + "/push-cb",
            'hub.mode': "subscribe",
            'hub.topic': CB_URL + "/feed"
        }).expect(202, done);
    });
});



// callback server (only active as long as Mocha runs)
var connect = require('connect');

var app = connect()
    .use(connect.logger('dev'))
    .use(connect.query())
    .use(connect.bodyParser())
    .use("/feed", function (req, res) {
        res.writeHead(200, {'Content-Type': "application/atom+xml"});
        // TODO: server may check this to see if it's a valid topic — make it so.
        res.end();
    })
    .use(function (req, res) {
        res.writeHead(200, {'Content-Type': "text/plain"});
        res.end('hello world\n');
    })
.listen(PORT);
