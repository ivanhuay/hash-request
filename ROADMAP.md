# Roadmap — hash-request v1.0.0

## Current state (v0.2.1)

- Raw HTTP/HTTPS fetch + cheerio parse → MD5 hash
- Supports: single URL, array of URLs, CSS selector, redirect follow, html_response
- CommonJS, `var`, callback-style Promises
- Tests hit real external URLs (flaky, hardcoded hashes)

---

## Analysis: problems to fix

### Dependencies

| Issue                              | Fix                    |
| ---------------------------------- | ---------------------- |
| `crypto: "0.0.3"` npm shim in deps | Remove — Node built-in |
| `cheerio ^0.20.0`                  | Upgrade to `^1.0`      |
| `mocha ^2.5.3` / `chai ^3.5.0`     | Replace with Vitest    |

### Core code (`app.js`)

| Issue                               | Location    | Fix                                |
| ----------------------------------- | ----------- | ---------------------------------- |
| Manual URL parsing with regex       | `app.js:13` | Use `new URL()`                    |
| `var` everywhere                    | all         | `const`/`let`                      |
| Raw Promise + callback style        | `app.js:58` | `async/await`                      |
| No request timeout                  | `app.js:63` | Add `timeout` option (default 10s) |
| Debug `console.log` in prod         | `app.js:68` | Remove                             |
| `http`/`https` manual module switch | `app.js:61` | Use `fetch` (Node 18+)             |

### Tests (`test/test.js`)

| Issue                                | Fix                                         |
| ------------------------------------ | ------------------------------------------- |
| Hits real external URLs              | Replace with local mock server              |
| Hardcoded hash values for live sites | Hashes change when sites update — mock only |
| `done` callback style                | `async/await`                               |
| No edge case coverage                | Add: timeout, 404, redirect loop, bad URL   |

### TypeScript benefits

Migrating to TS gives:

- `HashOptions` interface → IDE autocomplete, no silent typos on option keys
- `HashResponse` return type → callers know exact shape
- Compile-time catch on wrong option types (e.g. passing string to `handle_redirect`)
- Self-documenting public API without needing README
- No runtime cost, ships as compiled JS

---

## v1.0.0 Milestones

### Phase 1 — Clean core (no breaking changes)

- [x] Remove `crypto` npm dep
- [x] Upgrade `cheerio` to `^1.0`
- [x] Replace `var` → `const`/`let`
- [x] Replace manual URL parsing with `new URL()`
- [x] Remove debug `console.log`
- [x] Add `timeout` option (default: `10000ms`)
- [x] Rewrite with `async/await`
- [ ] Use native `fetch` (Node 18+ requirement) — drop `http`/`https` modules — deferred: redirect manual mode needs more investigation

### Phase 2 — TypeScript migration

- [x] Add TypeScript + `tsconfig.json`
- [x] Define `HashOptions` interface
- [x] Define `HashResponse` type
- [x] Dual CJS/ESM output via `tsup`
- [x] Type declarations shipped in package (`"types"` field in `package.json`)

### Phase 3 — Linting & formatting

- [x] Add ESLint with `@typescript-eslint` rules
- [x] Add Prettier for formatting
- [x] `eslint.config.mjs` + `.prettierrc` config files
- [x] `lint` and `format` scripts in `package.json`
- [x] `lint:fix` script for auto-fixable rules
- [x] Pre-commit hook via `husky` + `lint-staged` — lint/format on staged files only
- [ ] CI fails on lint errors — needs CI config (Phase 6)

### Phase 4 — Tests overhaul

- [x] Replace `mocha`/`chai` with Vitest
- [x] All tests use local mock server — zero external network calls
- [x] `async/await` test style
- [x] Add cases: timeout, 404, 301 loop guard, malformed URL, empty body, selector not found
- [x] Coverage report

### Phase 5 — Headless mode (optional, opt-in)

- [x] Add `{ headless: true }` option using Puppeteer
- [x] Peer dependency — not bundled by default
- [x] Same `HashResponse` shape as HTTP mode
- [x] Targets: SPAs, JS-rendered content (React/Vue/Angular sites)

### Phase 5.5 — CLI & monitoring mode

- [ ] `src/cli.ts` entry point + `bin` field in `package.json`
- [ ] `-u <url>` target URL (repeatable, max 10 targets)
- [ ] `-f <seconds>` poll interval (default: 300s)
- [ ] `-s <selector>` CSS selector to watch (e.g. `#showtimes`)
- [ ] `-t <term>` word/phrase to watch — alerts on count or position change
- [ ] `--threshold <pct>` body change threshold (10% steps, default: 100 = any change)
  - Body text split into 10 equal chunks → 10 md5s
  - Changed chunks / 10 = % change; alert if ≥ threshold
- [ ] State file (`~/.hash-request-state.json`) — persist previous hashes between runs
- [ ] System notification on alert trigger (`node-notifier`, macOS/Linux/Windows)
- [ ] Hard limit: max 10 monitored targets per CLI instance (enforced at state file level, not in library)

### Phase 6 — Packaging & docs

- [ ] Update `README.md` with new API + TypeScript examples
- [ ] Publish `1.0.0` to npm
- [ ] Add `CHANGELOG.md`

---

## Breaking changes in v1.0.0

| Change                                 | Reason                                    |
| -------------------------------------- | ----------------------------------------- |
| Node ≥ 18 required                     | Native `fetch`                            |
| `crypto` npm dep removed               | Was wrong dep, Node built-in used instead |
| Option key `html_response` unchanged   | Keep backward compat                      |
| Option key `handle_redirect` unchanged | Keep backward compat                      |

---

## Out of scope for v1.0.0

- Scheduling / polling built-in (use cron externally)
- Storage / diffing persistence (out of this lib's responsibility)
- Browser bundle
