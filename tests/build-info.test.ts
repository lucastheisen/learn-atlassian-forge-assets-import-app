import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getBuildInfo } from '../build-info.mts';

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'forge-build-info-'));
  await mkdir(join(root, 'src'));
  for (const file of ['build-info.mts', 'manifest.yml', 'package-lock.json', 'tsconfig.json', 'vite.backend.config.mts', 'vite.frontend.config.mts']) {
    await writeFile(join(root, file), '');
  }
  await writeFile(join(root, 'package.json'), JSON.stringify({ version: '1.2.3' }));
  await writeFile(join(root, 'src/index.ts'), 'export const value = 1;');
});

afterEach(async () => {
  await rm(root, { force: true, recursive: true });
});

describe('getBuildInfo', () => {
  it('changes when source or dependency inputs change', async () => {
    const original = getBuildInfo(root).buildId;
    await writeFile(join(root, 'src/index.ts'), 'export const value = 2;');
    const changedSource = getBuildInfo(root).buildId;
    expect(changedSource).not.toBe(original);
    await writeFile(join(root, 'package-lock.json'), '{}');
    expect(getBuildInfo(root).buildId).not.toBe(changedSource);
  });

  it('ignores deployment outputs and agent scratch files', async () => {
    const original = getBuildInfo(root);
    for (const directory of ['.agent', 'dist']) {
      await mkdir(join(root, directory));
      await writeFile(join(root, directory, 'output.json'), '{}');
    }
    expect(getBuildInfo(root)).toEqual(original);
  });

  it('returns the package version and a stable identifier', () => {
    const original = getBuildInfo(root);
    expect(original.version).toBe('1.2.3');
    expect(original.buildId).toMatch(/^[0-9a-f]{12}$/);
    expect(getBuildInfo(root)).toEqual(original);
  });
});
