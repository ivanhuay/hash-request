import http from 'http';
import https from 'https';
import crypto from 'crypto';
import { load } from 'cheerio';

export interface HashOptions {
  html_response?: boolean;
  handle_redirect?: boolean;
  selector?: string | null;
  timeout?: number;
  headless?: boolean;
}

export interface HashHtml {
  body: string | null;
  head: string | null;
  all: string;
  selector?: string | null;
}

export interface HashResponse {
  body: string;
  head: string;
  statusCode: number;
  headers: Record<string, string | string[]>;
  url: string;
  selector?: string;
  html?: HashHtml;
}

const DEFAULT_OPTIONS: Required<HashOptions> = {
  html_response: false,
  handle_redirect: true,
  selector: null,
  timeout: 10000,
  headless: false,
};

const normalizeUrl = (rawUrl: string): string => {
  if (!/^https?:\/\//.test(rawUrl)) return `http://${rawUrl}`;
  return rawUrl;
};

const getMd5 = (text: string | null): string =>
  crypto
    .createHash('md5')
    .update(text ?? '')
    .digest('hex');

interface FetchResult {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: string;
}

const fetchUrl = (url: string, timeout: number): Promise<FetchResult> =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === 'https:';
    const requestHandler = isHttps ? https : http;

    const reqOptions: http.RequestOptions = {
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
      res.on('data', (chunk: Buffer) => {
        body += chunk;
      });
      res.on('end', () =>
        resolve({
          statusCode: res.statusCode ?? 0,
          headers: res.headers as Record<string, string | string[]>,
          body,
        })
      );
    });

    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error(`Request timeout after ${timeout}ms: ${url}`));
    });

    req.on('error', reject);
    req.end();
  });

interface PuppeteerResponse {
  status(): number;
  headers(): Record<string, string>;
}

interface PuppeteerPage {
  goto(
    url: string,
    opts?: { waitUntil?: string; timeout?: number }
  ): Promise<PuppeteerResponse | null>;
  content(): Promise<string>;
}

interface PuppeteerBrowser {
  newPage(): Promise<PuppeteerPage>;
  close(): Promise<void>;
}

interface PuppeteerModule {
  default?: { launch(opts: object): Promise<PuppeteerBrowser> };
  launch?: (opts: object) => Promise<PuppeteerBrowser>;
}

const fetchHeadless = async (url: string, timeout: number): Promise<FetchResult> => {
  let mod: PuppeteerModule;
  try {
    mod = await import('puppeteer');
  } catch {
    throw new Error('puppeteer is required for headless mode: npm install puppeteer');
  }

  const launchFn = mod.default?.launch?.bind(mod.default) ?? mod.launch;
  if (!launchFn) throw new Error('puppeteer: cannot find launch function');

  const browser = await launchFn({ headless: true });
  try {
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: 'networkidle2', timeout });
    if (!response) throw new Error(`No response from headless fetch: ${url}`);
    const body = await page.content();
    return {
      statusCode: response.status(),
      headers: response.headers(),
      body,
    };
  } finally {
    await browser.close();
  }
};

const resolveOptions = (raw: HashOptions | string | undefined): Required<HashOptions> => {
  const options = { ...DEFAULT_OPTIONS };
  if (typeof raw === 'string') {
    options.selector = raw;
  } else if (raw && typeof raw === 'object') {
    Object.assign(options, raw);
  }
  return options;
};

export function getHash(url: string[], options?: HashOptions | string): Promise<HashResponse[]>;
export function getHash(url: string, options?: HashOptions | string): Promise<HashResponse>;
export function getHash(
  url: string | string[],
  options?: HashOptions | string
): Promise<HashResponse | HashResponse[]> {
  if (Array.isArray(url)) {
    return Promise.all(url.map((u) => getHash(u, options)));
  }

  return getHashSingle(url, options);
}

const getHashSingle = async (
  url: string,
  rawOptions?: HashOptions | string,
  redirectCount = 0
): Promise<HashResponse> => {
  if (redirectCount > 10) {
    throw new Error(`Too many redirects: ${url}`);
  }
  const options = resolveOptions(rawOptions);
  const normalizedUrl = normalizeUrl(url);
  const { statusCode, headers, body } = options.headless
    ? await fetchHeadless(normalizedUrl, options.timeout)
    : await fetchUrl(normalizedUrl, options.timeout);

  if (
    !options.headless &&
    options.handle_redirect &&
    statusCode >= 300 &&
    statusCode < 400 &&
    headers.location
  ) {
    return getHashSingle(headers.location as string, rawOptions, redirectCount + 1);
  }

  const $ = load(body);

  const response: HashResponse = {
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
