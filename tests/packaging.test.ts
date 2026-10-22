import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
let output: string;

beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), 'forge-packaging-'));
  for (const target of ['backend', 'frontend']) {
    execFileSync(process.execPath, [
      join(root, 'node_modules/vite/bin/vite.js'), 'build',
      '--config', join(root, `vite.${target}.config.mts`),
      '--outDir', join(output, target), '--logLevel', 'silent',
    ], {
      cwd: root,
      env: { ...process.env, NODE_ENV: 'production' },
    });
  }
});

afterAll(async () => {
  if (output) await rm(output, { force: true, recursive: true });
});

describe('manual packaging', () => {
  it('loads every manifest handler and verifies JWTs without installed dependencies', async () => {
    const manifest = await readFile(join(root, 'manifest.yml'), 'utf8');
    const handlers = [...manifest.matchAll(/^\s+- handler: (.+)$/gm)].map((match) => match[1]);
    const result = execFileSync(process.execPath, ['-e', `
      const assert = require('node:assert/strict');
      const { createHmac, randomBytes } = require('node:crypto');
      const { join } = require('node:path');
      const handlers = JSON.parse(process.argv[1]);
      const backend = process.argv[2];
      for (const handler of handlers) {
        const dot = handler.lastIndexOf('.');
        const exports = require(join(backend, handler.slice(0, dot) + '.js'));
        assert.equal(typeof exports[handler.slice(dot + 1)], 'function', handler);
      }
      const { webtriggerDispatch } = require(join(backend, 'index.js'));
      const secret = randomBytes(32).toString('hex');
      process.env.FORGE_WEBTRIGGER_SECRET = secret;
      const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
      const now = Math.floor(Date.now() / 1000);
      const unsigned = encode({ alg: 'HS256' }) + '.' + encode({
        aud: 'write:workitem:custom', exp: now + 60, iat: now, iss: 'packaging-test',
      });
      const token = key => unsigned + '.' + createHmac('sha256', key).update(unsigned).digest('base64url');
      console.warn = () => {};
      (async () => {
        for (const [key, expected] of [
          [secret, 'status-error-bad-request-validate'],
          ['incorrect-secret', 'status-error-unauthorized'],
        ]) {
          const response = await webtriggerDispatch({
            body: '{}', headers: { authorization: ['Bearer ' + token(key)] },
          }, {});
          assert.equal(response.outputKey, expected);
        }
        process.stdout.write('ok');
      })().catch(error => { console.error(error); process.exitCode = 1; });
    `, JSON.stringify(handlers), join(output, 'backend')], {
      cwd: output,
      encoding: 'utf8',
      env: { ...process.env, NODE_PATH: '' },
    });
    expect(handlers).toHaveLength(7);
    expect(result).toBe('ok');
  });

  it('packages UI Kit scripts in the body with relative paths and valid JavaScript', async () => {
    const frontend = join(output, 'frontend');
    const files = await readdir(frontend, { recursive: true });
    expect(files.some((file) => file.split(/[\\/]/).some((part) => part.startsWith('__')))).toBe(false);
    const html = await readFile(join(frontend, 'index.html'), 'utf8');
    const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? '';
    const scripts = [...body.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
    expect(scripts).toHaveLength(1);
    expect(html.match(/<head>([\s\S]*?)<\/head>/)?.[1]).not.toContain('<script');
    expect(body.replace(/<script\b[^>]*><\/script>/g, '').trim()).toBe('');
    for (const script of scripts) {
      const path = script[1] ?? '';
      expect(path).toMatch(/^\.\//);
      const code = await readFile(join(frontend, path), 'utf8');
      execFileSync(process.execPath, ['--check', join(frontend, path)]);
      expect(code.includes('createElement')).toBe(true);
      expect(code.includes('new MutationObserver')).toBe(false);
      expect(code.includes('react/jsx-runtime')).toBe(false);
    }
  });
});
