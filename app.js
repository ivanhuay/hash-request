var http = require("http"),
    https = require("https"),
    fs = require("fs"),
    crypto = require("crypto"),
    cheerio = require("cheerio");

var getConfigJSON = function(url) {

    var port = 80;
    if (/^https/.test(url)) {
        port = 443;
    }
    var parseUrl = url.replace(/^http:\/\//, "").replace(/^https:\/\//, "").split("/");
    var hostname = parseUrl.shift();
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
var getMd5 = function(plainText) {
    if (!plainText) plainText = "";
    var md5Sum = crypto.createHash("md5");
    md5Sum.update(plainText);
    var hash = md5Sum.digest("hex");
    return hash;
};
var getHashUrl = function(url, $options) {
    var options = {
        html_response: false,
        handle_redirect: true,
        selector: null
    };
    if (url instanceof Array) {
        var hashedRequest = url.map(function(current_url) {
            return getHashUrl(current_url, $options);
        });
        return Promise.all(hashedRequest);
    }
    if (typeof $options == "string") {
        options.selector = $options;
    } else if (typeof $options == "object") {
        for (var key in $options) {
            options[key] = $options[key];
        }
    }

    return new Promise(function(resolve, reject) {

        var body = "";
        var requestHandler = (/^https/.test(url)) ? https : http;
        //TODO:handle redirects
        var req = requestHandler.request(getConfigJSON(url), function(resp) {
            resp.on("data", function(data) {
                body += data;
            });
            resp.on('close', function() {
                console.log("\n\nClose received!");
            });
            resp.on("end", function() {
                if (options.handle_redirect && resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
                    getHashUrl(resp.headers.location, $options)
                        .then(resolve)
                        .catch(reject);
                } else {
                    var $ = cheerio.load(body);
                    var response = {
                        body: getMd5($("body").html()),
                        head: getMd5($("head").html()),
                        statusCode: resp.statusCode,
                        headers: resp.headers,
                        url: url
                    };
                    if (options.selector !== null) response.selector = getMd5($(options.selector).html());
                    if (options.html_response) {
                        response.html = {
                            body: $("body").html(),
                            head: $("head").html(),
                            all: $.html()
                        };
                        if (options.selector !== null) response.html.selector = $(options.selector).html();
                    }
                    resolve(response);
                }
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
