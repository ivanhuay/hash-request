var hashRequest = require("..");
var expect = require('chai').expect;
var simpleServer = require("./simple-server");
describe("hash http request", function() {
    describe("simple http request", function() {
        it("check http response status", function(done) {
            return hashRequest.getHash("httpd.apache.org/security_report.html")
                .then(function(response) {
                    expect(200).to.equal(response.statusCode);
                    done();
                }).catch(done);
        });
        it("check url in json", function(done) {
            return hashRequest.getHash("httpd.apache.org/security_report.html")
                .then(function(response) {
                    expect("httpd.apache.org/security_report.html").to.equal(response.url);
                    done();
                }).catch(done);
        });
    });

    describe("https request", function() {
        it("check https response status", function(done) {
            return hashRequest.getHash("https://github.com/")
                .then(function(response) {
                    expect(200).to.equal(response.statusCode);
                    done();
                }).catch(done);
        });
    });
    describe("status and content with custom selector", function() {
        it("get status and not null selector", function(done) {
            hashRequest.getHash("httpd.apache.org/security_report.html", "h1")
                .then(function(response) {
                    expect(200).to.equal(response.statusCode);
                    expect(null).not.to.equal(response.selector);
                    done();
                }).catch(done);
        });
    });
});

describe("multiple url hash", function() {
    describe("http simple multiple request", function() {
        this.timeout(10000);
        it("check status in multiple request", function(done) {
            var hashes = {
                "httpd.apache.org/security_report.html": "73136c4a0fa91b56483b8ed103fe1876",
                "https://www.npmjs.com": "a7d9ff734e0dd313abe611be06085a53",
                "https://nodejs.org/en/": "80a50a1095fcb8feddfcda879f4d5781",
                "https://nodejs.org": "f2c0c63aed3f8a71d47eec78e697f483"
            };
            hashRequest.getHash(["httpd.apache.org/security_report.html", "https://www.npmjs.com", "https://nodejs.org"])
                .then(function(responses) {
                    responses.map(function(response) {
                        expect(200).to.equal(response.statusCode);
                        expect(hashes[response.url]).to.equal(response.body);
                    });
                    done();
                }).catch(done);
        });
        it("check url in json", function(done) {
            hashRequest.getHash("httpd.apache.org/security_report.html")
                .then(function(response) {
                    expect("httpd.apache.org/security_report.html").to.equal(response.url);
                    done();
                }).catch(done);
        });
    });
});

describe("Redirect handle", function() {
    describe("http to https redirect", function() {
        it("check response status", function(done) {
            hashRequest.getHash("http://ivanhuay.com.ar")
                .then(function(response) {
                    expect(200).to.equal(response.statusCode);
                    done();
                }).catch(done);
        });
        it("check status 300 when disable handle_redirect option", function(done) {
            hashRequest.getHash("ivanhuay.com.ar", {
                    handle_redirect: false
                })
                .then(function(_response) {
                    expect(301).to.equal(_response.statusCode);
                    done();
                }).catch(done);
        });
    });
});
describe("Local server http response:", function() {
    before(function() {
        simpleServer.listen(9999);
    });
    after(function() {
        simpleServer.close();
    });
    describe("using mock server", function() {
        it("simple html compare", function(done) {
            hashRequest.getHash("http://localhost:9999", {
                    html_response: true
                })
                .then(function(response) {
                    expect(200).to.equal(response.statusCode);
                    expect(simpleServer.mock_response).to.equal(response.html.all);
                    done();
                }).catch(done);
        });
    });
});
