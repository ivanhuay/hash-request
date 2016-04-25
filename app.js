var http = require("http"),
  fs = require("fs"),
  crypto = require("crypto"),
  exec = require('child_process').exec,
  _responseJSON = [];
_requestPending = 0;


var returnMd5 = function(body) {
  var md5Sum = crypto.createHash("md5");
  md5Sum.update(body);
  var hash = md5Sum.digest("hex");
  return hash;
};

var httpCallback = function(jsonName) {
  return function(resp) {
    var body = "";
    var name = jsonName;
    resp.on("data", function(data) {
      body += data;
    });
    resp.on("end", function() {
      _responseJSON[name] = returnMd5(body);
      console.log(name+": "+_responseJSON[name]);
    });
  };
};


function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function(err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function(filename, index) {
      fs.readFile(dirname + "/" + filename, 'utf-8', function(err, content) {
        if (err) {
          onError(err);
          return;
        }
        _requestPending++;
        onFileContent(filename, content);
      });
    });
  });
}

readFiles(__dirname + "/sources", function(filename, content) {
  http.get(JSON.parse(content), httpCallback(filename.replace(".json", "")));
}, console.log);
