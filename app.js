var http = require("http"),
    https = require("https"),
    fs = require("fs"),
    crypto = require("crypto"),
    cheerio = require("cheerio");

var joinJson = function(firstobj, secondobj) {
    if (typeof firstobj == "undefined") firstobj = {};
    for (var i in secondobj) {
        if (typeof secondobj[i] == "object") {
            firstobj[i] = joinJson(firstobj[i], secondobj[i]);
        } else {
            firstobj[i] = secondobj[i];
        }
    }
    return firstobj;
};

var returnMd5 = function(plainText) {
    var md5Sum = crypto.createHash("md5");
    md5Sum.update(plainText);
    var hash = md5Sum.digest("hex");
    return hash;
};

var jsonRequest = function(url, headers) {
    var parseUrl = url.replace("http://", "").replace("https://", "").split("/");
    var hostname = parseUrl.shift();
    var default_headers = {
        "Accept": "*/*",
        "User-Agent": "curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3"
    };
    return {
        "hostname": hostname,
        "headers": joinJson(default_headers,headers),
        "path": "/" + parseUrl.join("/"),
        "method": "GET"
    };
};

var getHashUrl = function(url, selector, callback, index) {
    var config = {
        selector: selector,
        headers: {},
        callback: function() {}
    };

    if (url instanceof Array) {
        for (var i in url) {
            getHashUrl(url[i], selector, callback, i);
        }
        return;
    }

    switch (typeof selector) {
        case "function":
            config.callback = selector;
            config.selector = null;
            break;
        case "object":
            config = joinJson(config, selector);
            break;
        default:
    }

    var body = "",
        requestHandler = (/https/.test(url)) ? https : http,
        req = requestHandler.request(jsonRequest(url, config.headers), function(resp) {
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
                if (typeof index !== "undefined") response.index = index;
                if (config.selector !== null) response.selector = returnMd5($(config.selector).html());
                config.callback(response);
            });
        });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.end();
};

exports.getHash = getHashUrl;
