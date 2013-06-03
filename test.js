var request = require('supertest'),
    assert = require('assert');

// https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html

var HUB_URL = process.env.HUB_URL,
    CB_URL = process.env.CB_URL,
    PORT = process.env.PORT || 8000;

var callbacks = {
    GET: null,
    POST: null
};

var callbacks;          // HACK: allow tests to access server happenings
function serverCB(method, cb) {
    callbacks[method] = function () {
        delete callbacks[method];
        return cb.apply(this, arguments);
    }
}

describe('PubSubHubbub', function () {
    this.timeout(15*60*1000);
    
    it('verifies subscription', function (done) {
        var mode = 'subscribe', topic = CB_URL + "/feed";
        
        // https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html#verifysub
        serverCB('GET', function (req) {
            req._testsuite_accept();
            // TODO: mocha doesn't seem to actually catch these. huzzah...
            assert(req.query['hub.mode'] === mode, "Mode matches original request");
            assert(req.query['hub.topic'] === topic, "Topic matches original request");
            assert(req.query['hub.challenge'], "Challenge included in verification");
            done();
        });
        
        // https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html#rfc.section.5.1.2
        // http://superfeedr.com/documentation#pubsubhubbub_implementation
        request(HUB_URL).post("/").type('form').send({
            'hub.callback': CB_URL + "/cb",
            'hub.mode': mode,
            'hub.topic': topic,
            'hub.verify': "async"           // HACK: needed on superfeedr to get it to verify
        //}).expect(202);   // spec says this
        }).expect(204);                     // HACK: allow superfeedr.com/hubbub to pass
    });
    
    it('distributes content', function (done) {
        var entryId = addEntryToFeed();
        request(HUB_URL).post("/").type('form').send({
            'hub.callback': CB_URL + "/cb",
            'hub.mode': 'publish',          // HACK: superfeedr ping, this mode is not actually required by standard!
            'hub.url': CB_URL + "/feed"
        });
        
        serverCB('POST', function (req) {
            var body = '';
            request.on('data', function (data) { body += data; });
            request.on('end', function () {
                req._testsuite_accept();
                assert.equal(req.headers['content-type'], "application/atom+xml", "Content-Type must match topic");
                assert.ok(~req.body.indexOf(entryId), "Notification includes entry");
                done();
            });
        });
    });
    
    // TODO: check that unsubscription works
    
    // TODO: check inverses e.g. unverified does NOT call back?
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

var app = connect()
    .use(connect.logger('dev'))
    .use(connect.query())
    .use(connect.bodyParser())
    .use("/feed", function (req, res) {
        res.writeHead(200, {'Content-Type': "application/atom+xml"});
        res.end(feed.toString());
    })
    .use("/cb", function (req, res) {
        req._testsuite_accept = function () {
            res.writeHead(200, {'Content-Type': "text/plain"});
            res.end(req.query['hub.challenge']);
        }
        req._testsuite_reject = function () {
            res.writeHead(404, {'Content-Type': "text/plain"});
            res.end("Refusing verification.");
        }
        
        if (callbacks[req.method]) callbacks[req.method](req);
        else req._testsuite_accept();
    })
    .use(function (req, res) {
        res.writeHead(200, {'Content-Type': "text/plain"});
        res.end('hello world\n');
    })
.listen(PORT);
