# hash-request

Get hash html for check changes

### Usage

```javascript
var hashRequest = require('hash-request');

hashRequest.getHash("httpd.apache.org/security_report.html",function(response){
    console.log(JSON.stringify(response));
});
```

#### response:

    {
        "body":"912949687a6fe75350bf36928cf64b67",
        "head":"d5655ad639b3b7d8746d8e55f22b423e",
        "statusCode":200,
        "headers":{
            "date":"Wed, 27 Apr 2016 12:52:26 GMT",
            "server":"Apache/2.4.7 (Ubuntu)",
            "last-modified":"Sat, 20 Feb 2016 10:44:41 GMT",
            "etag":"\"1d63-52c3149824b03\"",
            "accept-ranges":"bytes",
            "content-length":"7523",
            "vary":"Accept-Encoding",
            "connection":"close",
            "content-type":"text/html"
        }
    }
