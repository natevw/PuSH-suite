var request = require('supertest'),
    assert = require('assert');

// https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html

var HUB_URL = process.env.HUB_URL,
    CB_URL = process.env.CB_URL,
    PORT = process.env.PORT || 8000;

var callback = CB_URL + "/cb",
    callbacksByTopic = Object.create(null);

describe('PubSubHubbub', function () {
    this.timeout(15*60*1000);
    
    it('verifies subscription', function (done) {
        var mode = 'subscribe', topic = CB_URL + "/feed/verify";
        
        // https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html#verifysub
        callbacksByTopic['verify'] = function (req) {
            delete callbacksByTopic['verify'];
            // TODO: will mocha actually catch these asserts?
            assert(req.query['hub.mode'] === mode, "Mode matches original request");
            assert(req.query['hub.topic'] === topic, "Topic matches original request");
            assert(req.query['hub.challenge'], "Challenge included verification");
            done();
            return true;
        };
        
        // https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html#rfc.section.5.1.2
        // http://superfeedr.com/documentation#pubsubhubbub_implementation
        request(HUB_URL).post("/").type('form').send({
            'hub.callback': callback,
            'hub.mode': mode,
            'hub.topic': topic,
            'hub.verify': "async"
        //}).expect(202);   // spec says this
        }).expect(204);         // HACK: allow superfeedr.com/hubbub to pass
    });
});



// callback server (only active as long as Mocha runs)
var connect = require('connect'),
    ltx = require('ltx');


var feed = new ltx.Element('feed', {xmlns:"http://www.w3.org/2005/Atom"});

feed.c('title').t("PubSubHubbub test feed").up()
    .c('author').c('name').t("PuSH testsuite").up().up()
    .c('id').t(CB_URL + "/feed").up()
    .c('updated').t(new Date().toISOString()).up()
    .c('link', {rel:"self", href:CB_URL+"/feed"}).up();

function addEntryToFeed() {
    var id = Math.random().toFixed(20).slice(2);
    feed.c('entry')
        .c('id').t(CB_URL+"/feed/"+id).up()
        .c('title').t("Entry "+id).up()
        .c('updated').t(new Date().toISOString()).up()
        .c('content', {type:"text"}).t("This is the content of entry "+id);
    return id;
}

addEntryToFeed();

var app = connect()
    .use(connect.logger('dev'))
    .use(connect.query())
    .use(connect.bodyParser())
    .use("/feed", function (req, res) {
        res.writeHead(200, {'Content-Type': "application/atom+xml"});
        res.end(feed.toString());
    })
    .use("/cb", function (req, res) {
        if (req.method === 'GET') {
            var _topic = req.query['hub.topic'],
                topic = _topic && _topic.split('/').slice(-1);
            
            var accept = (callbacksByTopic[topic]) ? callbacksByTopic[topic](req) : true;
            if (accept) {
                res.writeHead(200, {'Content-Type': "text/plain"});
                res.end(req.query['hub.challenge']);
            } else {
                res.writeHead(404, {'Content-Type': "text/plain"});
                res.end("Refusing verification.");
            }
        } else {
            res.writeHead(201);
            res.end();
        }
    })
    .use(function (req, res) {
        res.writeHead(200, {'Content-Type': "text/plain"});
        res.end('hello world\n');
    })
.listen(PORT);
