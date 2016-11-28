# hash-request

Get hash html for check changes.

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
## new configurable options v0.2.x:
1) handle_redirect: (default: true) Handle redirect status like 301. Con handle_redirect:false no redirege automaticamente las paginas http en https.
2) html_response:true (default: false) Returns the json response.html with all selectors and the complete dom as html strings.

## handle_redirect:

```javascript
var hashRequest = require('hash-request');

hashRequest.getHash("http://www.npmjs.com").then(function(response){
    console.log(JSON.stringify(response));
});
```
### response: the https repose by redirect
```javascript
{ body: '80a50a1095fcb8feddfcda879f4d5781',
  head: 'feceba948baefa9763ebc9b769c0b515',
  statusCode: 200,
  headers:
   { date: 'Mon, 28 Nov 2016 23:03:38 GMT',
     'content-type': 'text/html',
     'transfer-encoding': 'chunked',
     connection: 'close',
     'set-cookie': [ '__cfduid=d87047e1f2f275de83642948504a295641480374218; expires=Tue, 28-Nov-17 23:03:38 GMT; path=/; domain=.nodejs.org; HttpOnly' ],
     'last-modified': 'Mon, 28 Nov 2016 15:23:12 GMT',
     'cf-cache-status': 'HIT',
     expires: 'Tue, 29 Nov 2016 03:03:38 GMT',
     'cache-control': 'public, max-age=14400',
     server: 'cloudflare-nginx',
     'cf-ray': '3091744edb0a163b-LIM' },
  url: 'https://nodejs.org/en/' }

```
## html_response:

```javascript
var hashRequest = require('hash-request');

hashRequest.getHash("http://localhost/example",{html_response:true}).then(function(response){
    console.log(JSON.stringify(response));
});
```
### response: html response in response.html
```javascript
{ body: '80a50a1095fcb8feddfcda879f4d5781',
  head: 'feceba948baefa9763ebc9b769c0b515',
  statusCode: 200,
  headers:
   {
     'content-type': 'text/html',
     connection: 'close',
	 },
  url: 'https://nodejs.org/en/',
 	html:{
		body:'<h1>example</h1>',
		head:'<title>some example</title>',
		all:'<html><head><title>some example</title></head><body><title>some example</title></body></html>'
	}}
```

## updates:

* v0.1.0 - Promises and url in json response added.
* v0.2.0 - Config, handle redirects, optional html reponse aditional to hash.

hash-request: Improving every week!
