import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { load } from 'cheerio';
import { getHash } from '../src/index';
import { MockServer } from './mock-server';

const md5 = (s: string | null) => crypto.createHash('md5').update(s ?? '').digest('hex');

const HTML = '<html><head><title>Test</title></head><body><h1>Hello</h1><p>World</p></body></html>';
const EMPTY_HTML = '<html><head></head><body></body></html>';
const NOT_FOUND_HTML = '<html><head></head><body><p>Not Found</p></body></html>';

let server: MockServer;
let base: string;

beforeAll(async () => {
  server = new MockServer();
  await server.listen();
  base = server.baseUrl;

  server
    .route('/', { statusCode: 200, body: HTML })
    .route('/empty', { statusCode: 200, body: EMPTY_HTML })
    .route('/404', { statusCode: 404, body: NOT_FOUND_HTML })
    .route('/redirect', { statusCode: 301, headers: { location: `${base}/` } })
    .route('/loop-a', { statusCode: 301, headers: { location: `${base}/loop-b` } })
    .route('/loop-b', { statusCode: 301, headers: { location: `${base}/loop-a` } })
    .route('/slow', { statusCode: 200, body: HTML, delay: 3000 });
});

afterAll(() => server.close());

describe('single URL', () => {
  it('statusCode 200', async () => {
    const res = await getHash(`${base}/`);
    expect(res.statusCode).toBe(200);
  });

  it('url preserved', async () => {
    const res = await getHash(`${base}/`);
    expect(res.url).toBe(`${base}/`);
  });

  it('body is md5 of cheerio body html', async () => {
    const $ = load(HTML);
    const res = await getHash(`${base}/`);
    expect(res.body).toBe(md5($('body').html()));
  });

  it('head is md5 of cheerio head html', async () => {
    const $ = load(HTML);
    const res = await getHash(`${base}/`);
    expect(res.head).toBe(md5($('head').html()));
  });
});

describe('html_response option', () => {
  it('includes html object', async () => {
    const res = await getHash(`${base}/`, { html_response: true });
    expect(res.html).toBeDefined();
  });

  it('html.all matches full document', async () => {
    const $ = load(HTML);
    const res = await getHash(`${base}/`, { html_response: true });
    expect(res.html!.all).toBe($.html());
  });

  it('html.body and html.head present', async () => {
    const res = await getHash(`${base}/`, { html_response: true });
    expect(res.html!.body).toContain('Hello');
    expect(res.html!.head).toContain('Test');
  });
});

describe('selector option', () => {
  it('object option: selector field', async () => {
    const $ = load(HTML);
    const res = await getHash(`${base}/`, { selector: 'h1' });
    expect(res.selector).toBe(md5($('h1').html()));
  });

  it('string second arg acts as selector', async () => {
    const $ = load(HTML);
    const res = await getHash(`${base}/`, 'h1');
    expect(res.selector).toBe(md5($('h1').html()));
  });

  it('missing selector returns md5 of null', async () => {
    const res = await getHash(`${base}/`, { selector: '.nonexistent' });
    expect(res.selector).toBe(md5(null));
  });

  it('html_response includes selector html', async () => {
    const $ = load(HTML);
    const res = await getHash(`${base}/`, { html_response: true, selector: 'h1' });
    expect(res.html!.selector).toBe($('h1').html());
  });
});

describe('404 response', () => {
  it('returns statusCode 404', async () => {
    const res = await getHash(`${base}/404`);
    expect(res.statusCode).toBe(404);
  });

  it('still returns body hash on 404', async () => {
    const $ = load(NOT_FOUND_HTML);
    const res = await getHash(`${base}/404`);
    expect(res.body).toBe(md5($('body').html()));
  });
});

describe('redirect handling', () => {
  it('follows redirect by default', async () => {
    const res = await getHash(`${base}/redirect`);
    expect(res.statusCode).toBe(200);
  });

  it('returns 301 when handle_redirect: false', async () => {
    const res = await getHash(`${base}/redirect`, { handle_redirect: false });
    expect(res.statusCode).toBe(301);
  });

  it('throws on redirect loop', async () => {
    await expect(getHash(`${base}/loop-a`)).rejects.toThrow('Too many redirects');
  });
});

describe('timeout', () => {
  it('throws on request timeout', async () => {
    await expect(getHash(`${base}/slow`, { timeout: 150 })).rejects.toThrow(/timeout/i);
  });
});

describe('malformed URL', () => {
  it('throws on unparseable URL', async () => {
    await expect(getHash('http://')).rejects.toThrow();
  });
});

describe('empty body', () => {
  it('returns 200 with valid hashes for empty body', async () => {
    const $ = load(EMPTY_HTML);
    const res = await getHash(`${base}/empty`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBe(md5($('body').html()));
  });
});

describe('array of URLs', () => {
  it('returns array with correct length', async () => {
    const responses = await getHash([`${base}/`, `${base}/404`]);
    expect(responses).toHaveLength(2);
  });

  it('each response has correct statusCode', async () => {
    const responses = await getHash([`${base}/`, `${base}/404`]);
    expect(responses[0].statusCode).toBe(200);
    expect(responses[1].statusCode).toBe(404);
  });

  it('each response has correct url', async () => {
    const responses = await getHash([`${base}/`, `${base}/404`]);
    expect(responses[0].url).toBe(`${base}/`);
    expect(responses[1].url).toBe(`${base}/404`);
  });
});
