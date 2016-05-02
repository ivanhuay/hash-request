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
});
