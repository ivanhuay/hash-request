var hashRequest = require("..");

describe("hash http request", function() {
    describe("simple http request", function() {
        it("check http response status", function() {
            hashRequest.getHash("httpd.apache.org/security_report.html", function(response) {
                expected(200).to.equal(response.statusCode);
            });
        });
    });
    describe("https request", function() {
        it("check https response status", function() {
            hashRequest.getHash("https://github.com/", function(response) {
                expected(200).to.equal(response.statusCode);
            });
        });
    });
    describe("status and content with custom selector", function() {
        it("get status and not null selector", function() {
            hashRequest.getHash("httpd.apache.org/security_report.html", "h1", function(response) {
                expected(200).to.equal(response.statusCode);
                expected(null).not.to.equal(response.selector);
            });
        });
    });
});

describe("multiple url hash", function() {
    describe("http simple multiple request", function() {
        it("check status in multiple request", function() {
            var hashes = ["912949687a6fe75350bf36928cf64b67", "61fa172f7c9ecdd884f589a9d89b725a", "f2c0c63aed3f8a71d47eec78e697f483"];
            hashRequest.getHash(["httpd.apache.org/security_report.html", "https://www.npmjs.com", "https://nodejs.org"], function(response) {
                expected(200).to.equal(response.statusCode);
                expected(hashes[response.index]).to.equal(response.body);
            });
        });
    });
});
