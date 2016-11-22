var http = require('http');

var mock_response = '<h1>Hello, world!</h1>';
this.server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain'
    });
    res.end(mock_response);
});

exports.listen = function() {
    this.server.listen.apply(this.server, arguments);
};

exports.close = function(callback) {
    this.server.close(callback);
};

exports.mock_response = mock_response;
