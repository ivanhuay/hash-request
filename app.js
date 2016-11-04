var http = require("http"),
    https = require("https"),
    fs = require("fs"),
    crypto = require("crypto"),
    cheerio = require("cheerio");

var jsonRequest = function(url) {
    var parseUrl = url.replace(/^http:\/\//, "").replace(/^https:\/\//, "").split("/");
    var hostname = parseUrl.shift();
    var port = 80;
    if (/:[0-9]+/.test(hostname)) {
        var sections = hostname.split(":");
        hostname = sections[0];
        port = sections[1];
    }
    return {
        "hostname": hostname,
        "headers": {
            "Accept": "*/*",
            "User-Agent": "curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3"
        },
        "path": "/" + parseUrl.join("/"),
        "method": "GET",
        "port": port
    };
};
var returnMd5 = function(plainText) {
    var md5Sum = crypto.createHash("md5");
    md5Sum.update(plainText);
    var hash = md5Sum.digest("hex");
    return hash;
};

var getHashUrl = function(url, selector) {
    if (url instanceof Array) {
        var hashedRequest = url.map(function(current_url) {
            return getHashUrl(current_url, selector);
        });
        return Promise.all(hashedRequest);
    }

    if (typeof selector == "function") {
        callback = selector;
        selector = null;
    }
    return new Promise(function(resolve, reject) {
        var body = "",
            requestHandler = (/^https/.test(url)) ? https : http,
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
                        headers: resp.headers,
                        url: url
                    };
                    if (selector !== null) response.selector = returnMd5($(selector).html());
                    resolve(response);
                });
            });

        req.on('error', function(e) {
            console.error('problem with request: ' + e.message);
            reject(e);
        });
        req.end();

    });
};

exports.getHash = getHashUrl;
