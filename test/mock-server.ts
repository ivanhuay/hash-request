import http from 'http';

interface RouteConfig {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
  delay?: number;
}

export class MockServer {
  private server: http.Server;
  private routes = new Map<string, RouteConfig>();

  constructor() {
    this.server = http.createServer((req, res) => {
      const config = this.routes.get(req.url ?? '/') ?? { statusCode: 404, body: '' };
      const respond = () => {
        res.writeHead(config.statusCode, { 'Content-Type': 'text/html', ...config.headers });
        res.end(config.body ?? '');
      };
      if (config.delay) {
        setTimeout(respond, config.delay);
      } else {
        respond();
      }
    });
  }

  route(path: string, config: RouteConfig): this {
    this.routes.set(path, config);
    return this;
  }

  listen(): Promise<void> {
    return new Promise((resolve) => this.server.listen(0, '127.0.0.1', resolve));
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.server.close((err) => (err ? reject(err) : resolve()))
    );
  }

  get port(): number {
    const addr = this.server.address();
    if (addr && typeof addr === 'object') return addr.port;
    throw new Error('Server not listening');
  }

  get baseUrl(): string {
    return `http://127.0.0.1:${this.port}`;
  }
}
