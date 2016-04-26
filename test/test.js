var assert = require('assert');
var hashRequest = require("..");

exports['test basic'] = function(assert, done) {
    hashRequest.getHash("httpd.apache.org/security_report.html",function(response){
      assert.equal(response.statusCode, 200, 'error in status code');
    });
};

if (module == require.main) require('test').run(exports);
