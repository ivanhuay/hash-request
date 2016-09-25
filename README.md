# hash-request

Get hash html for check changes

### installation

	npm install hash-request

### Usage

hash-request use promises so you can use the .then() and .catch() for manage response and error.

```javascript
var hashRequest = require('hash-request');

hashRequest.getHash("httpd.apache.org/security_report.html").then(function(response){
    console.log(JSON.stringify(response));
}).catch(function(err){
	console.error(err);
});
```


#### response:

```javascript
  {
      "body":"912949687a6fe75350bf36928cf64b67",
      "head":"d5655ad639b3b7d8746d8e55f22b423e",
      "statusCode":200,
			"url":"httpd.apache.org/security_report.html"
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
```
### custom selector

format:

	hashRequest.getHash(url,selector);

```javascript
var hashRequest = require('hash-request');

hashRequest.getHash("httpd.apache.org/security_report.html","h1").then(function(response){
    console.log(JSON.stringify(response));
});
```

#### response:
```javascript
{
	"body":"912949687a6fe75350bf36928cf64b67",
	"head":"d5655ad639b3b7d8746d8e55f22b423e",
    "selector":"d5655ad639b3b7d8746d8e55f22b423e",//<-- selector content hash
    "statusCode":200,
		"url":"httpd.apache.org/security_report.html"
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
```

### multiples url

format:

	hashRequest.getHash([url],selector);

```javascript
var hashRequest = require('hash-request');

hashRequest.getHash(["httpd.apache.org/security_report.html","https://www.npmjs.com"],"h1").then(function(response){
    console.log(JSON.stringify(response));
});
```

#### response:
```javascript
{
	"body":"912949687a6fe75350bf36928cf64b67",
	"head":"d5655ad639b3b7d8746d8e55f22b423e",
    "selector":"d5655ad639b3b7d8746d8e55f22b423e",//selector content hash
    "statusCode":200,
		"url":"httpd.apache.org/security_report.html",
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
```

## updates:

* vo.1.0 - Promises and url in json response added.
