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
    console.log("httpCallback for:" + jsonName);
    resp.on("data", function(data) {
      body += data;
    });
    resp.on("end", function() {
      _responseJSON[name] = returnMd5(body);
      _requestPending--;
      console.log("remove Pending");
      console.log(_responseJSON[name]);
    });
  };
};


function readFiles(dirname, onFileContent, onError, finalCallback) {
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
        console.log("inde: " + index + " length: " + filenames.length);
        if (index == filenames.length - 1) {
          exec(_requestPending,finalCallback);
        }
      });
    });
  });
}

var timeCheck = null;


readFiles(__dirname + "/sources", function(filename, content) {
  http.get(JSON.parse(content), httpCallback(filename.replace(".json", "")));
}, console.log, function() {
  console.log("final calback");

  if (_requestPending.length !== 0) {
    timeCheck = setTimeout(function() {
      console.log("length: " + _requestPending.length);
      if (_requestPending.length !== 0) {

      } else {
        console.log(JSON.stringify(_responseJSON));

      }
    }, 5000);
  }

});
