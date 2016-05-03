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
