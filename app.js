var http = require("http"),
    https = require("https"),
    fs = require("fs"),
    crypto = require("crypto"),
    cheerio = require("cheerio");

var jsonRequest = function(url) {
    var parseUrl = url.replace("http://", "").replace("https://", "").split("/");
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
var returnMd5 = function(plainText) {
    var md5Sum = crypto.createHash("md5");
    md5Sum.update(plainText);
    var hash = md5Sum.digest("hex");
    return hash;
};

var getHashUrl = function(url, selector, callback, index) {
    if (url instanceof Array) {
        for (var i in url) {
            getHashUrl(url[i], selector, callback, i);
        }
        return;
    }

    if (typeof selector == "function") {
        callback = selector;
        selector = null;
    }

    var body = "",
        requestHandler = (/https/.test(url)) ? https : http,
        req = requestHandler.request(jsonRequest(url), function(resp) {
            resp.on("data", function(data) {
                body += data;
            });
            resp.on('close', function() {
                console.log("\n\nClose received!");
            });
            resp.on("end", function() {
                var $ = cheerio.load(body);
                var response = {
                    body: returnMd5($("body").html()),
                    head: returnMd5($("head").html()),
                    statusCode: resp.statusCode,
                    headers: resp.headers
                };
                if(typeof index !== "undefined") response.index = index;
                if (selector !== null) response.selector = returnMd5($(selector).html());
                callback(response);
            });
        });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
};

exports.getHash = getHashUrl;
