## curl GET with custom header
{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "Host": "httpbin.org",
    "User-Agent": "curl/8.7.1",
    "X-Custom-Header": "custom value"
  },
  "method": "GET",
  "origin": "66.219.208.222",
  "url": "https://httpbin.org/get"
}

## curl POST with form data
{
  "args": {},
  "headers": {
    "Accept": "*/*",
    "Content-Length": "15",
    "Content-Type": "application/x-www-form-urlencoded",
    "Host": "httpbin.org",
    "User-Agent": "curl/8.7.1"
  },
  "method": "POST",
  "origin": "66.219.208.222",
  "url": "https://httpbin.org/post",
  "data": "",
  "files": {},
  "form": {
    "bar": "baz",
    "foo": "bar"
  },
  "json": null
}

## curl HEAD on google.com:443
HTTP/2 301 
location: https://www.google.com/
content-type: text/html; charset=UTF-8
content-security-policy-report-only: object-src 'none';base-uri 'self';script-src 'nonce-_mwiMB478zPozilPzsma8Q' 'strict-dynamic' 'report-sample' 'unsafe-eval' 'unsafe-inline' https: http:;report-uri https://csp.withgoogle.com/csp/gws/other-hp
date: Mon, 23 Nov 2026 01:35:15 GMT
expires: Wed, 23 Dec 2026 01:35:15 GMT
cache-control: public, max-age=2592000
server: gws
content-length: 220
x-xss-protection: 0
x-frame-options: SAMEORIGIN
alt-svc: h3=":443"; ma=2592000,h3-29=":443"; ma=2592000

