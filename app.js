var http = require("http"),
  fs = require("fs"),
  crypto = require("crypto"),
  cheerio = require("cheerio");

var jsonRequest = function(url) {
  var parseUrl = url.replace("http://", "").replace("https://").split("/");
  var hostname = parseUrl.shift();
  return {
    "hostname": hostname,
    "headers": {
      "Accept": "*/*",
      "User-Agent": "curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3"
    },
    "path": "/" + parseUrl.join("/"),
    "method": "GET"
  };
};
var returnMd5 = function(body) {
  var md5Sum = crypto.createHash("md5");
  md5Sum.update(body);
  var hash = md5Sum.digest("hex");
  return hash;
};

function getHashUrl(url, callback) {
  var body = "";
  var req = http.request(jsonRequest(url), function(resp) {
    resp.on("data", function(data) {
      body += data;
    });
    resp.on('close', function() {
      console.log("\n\nClose received!");
    });
    resp.on("end", function() {
      var $ = cheerio.load(body);
      callback({
        body: returnMd5($("body").html()),
        head: returnMd5($("head").html()),
        statusCode: resp.statusCode,
        headers: resp.headers
      });
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
}

exports.getHash = getHashUrl;
