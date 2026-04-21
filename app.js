const http = require('http');
const https = require('https');
const crypto = require('crypto');
const cheerio = require('cheerio');

const DEFAULT_OPTIONS = {
  html_response: false,
  handle_redirect: true,
  selector: null,
  timeout: 10000,
};

const normalizeUrl = (rawUrl) => {
  if (!/^https?:\/\//.test(rawUrl)) return `http://${rawUrl}`;
  return rawUrl;
};

const getMd5 = (text = '') =>
  crypto.createHash('md5').update(text).digest('hex');

const fetchUrl = (url, timeout) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const requestHandler = isHttps ? https : http;

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'GET',
      headers: {
        Accept: '*/*',
        'User-Agent': 'curl/7.16.3 (powerpc-apple-darwin9.0) libcurl/7.16.3',
      },
    };

    const req = requestHandler.request(reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms: ${url}`));
    });

    req.on('error', reject);
    req.end();
  });

const getHashUrl = async (url, $options) => {
  if (Array.isArray(url)) {
    return Promise.all(url.map((u) => getHashUrl(u, $options)));
  }

  const options = { ...DEFAULT_OPTIONS };
  if (typeof $options === 'string') {
    options.selector = $options;
  } else if ($options && typeof $options === 'object') {
    Object.assign(options, $options);
  }

  const normalizedUrl = normalizeUrl(url);
  const { statusCode, headers, body } = await fetchUrl(normalizedUrl, options.timeout);

  if (options.handle_redirect && statusCode >= 300 && statusCode < 400 && headers.location) {
    return getHashUrl(headers.location, $options);
  }

  const $ = cheerio.load(body);

  const response = {
    body: getMd5($('body').html()),
    head: getMd5($('head').html()),
    statusCode,
    headers,
    url,
  };

  if (options.selector !== null) {
    response.selector = getMd5($(options.selector).html());
  }

  if (options.html_response) {
    response.html = {
      body: $('body').html(),
      head: $('head').html(),
      all: $.html(),
    };
    if (options.selector !== null) {
      response.html.selector = $(options.selector).html();
    }
  }

  return response;
};

exports.getHash = getHashUrl;
