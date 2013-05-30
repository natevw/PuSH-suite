# PubSubHubbub 0.4 — Compliance test suite

Use this to test a server for compliance with the [PubSubHubbub spec](https://superfeedr-misc.s3.amazonaws.com/pubsubhubbub-core-0.4.html) at version 0.4.

**NOTE**: currently very unfinished


## Example usage

    HUB_URL=http://pubsubhubbub.superfeedr.com CB_URL=http://testsuite.lvh.me ./node_modules/.bin/mocha

This will run the test server. Note that this won't actually work unless the server behind HUB_URL can access CB_URL, which in this case is unlikely (unless you are Julien).

## Details

To use this test suite, you need to provide two URLS via the runtime environment:

- **HUB_URL**: this URL of the hub which will be tested for compliance with the PubSubHubbub spec
- **CB_URL**: this is the callback URL through which the hub will communicate with this test suite

You may also provide a **PORT** on which to bind, otherwise 8000 will be used as a default. (This test suite will bind to this port on all interfaces while it is active.)

Make sure your callback URL will indeed allow the hub to connect to the listening test suite, i.e. simply providing `CB_URL=http://localhost:8000` will only work if the hub's "localhost" is the same as the test suite's. To test a public hub, you will need to expose this test suite publicly, by e.g. deploying it to "production".

## An aside

To speed up development, I'm actually tunneling traffic from a public server of mine to my local machine.

1. nginx config (on public server)

Assuming wildcard DNS is already set up for an existing subdomain, add this to an nginx sites-enabled configuration file:

    server {
        listen 80;
        server_name testsuite.example.com;
        location / {
            proxy_pass http://localhost:8455;
            proxy_redirect / /;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
    
Then `sudo service nginx reload`.

2. ssh tunnelling (run from dev machine)

    ssh -R 8455:localhost:8008 user@testsuite.example.com -N        # blocks shell, add `-f` to run in background

3. There is no step three! Actually there is: run the testsuite with `CB_URL=http://testsuite.example.com`


## License (MIT)

Copyright (c) 2013 Nathan Vander Wilt

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.