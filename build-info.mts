import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { BuildInfo } from './src/version.js';

export function getBuildInfo(projectDir: string): BuildInfo {
  const files = [
    'build-info.mts',
    'manifest.yml',
    'package-lock.json',
    'package.json',
    'tsconfig.json',
    'vite.backend.config.mts',
    'vite.frontend.config.mts',
    ...readdirSync(join(projectDir, 'src'), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => relative(projectDir, join(entry.parentPath, entry.name))),
  ].sort();
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(file).update('\0').update(readFileSync(join(projectDir, file))).update('\0');
  }
  const { version } = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8')) as { version: string };
  return { buildId: hash.digest('hex').slice(0, 12), version };
}
