import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Source markup uses root-relative URLs; scope those URLs to the Pages project.
const base = process.env.SITE_BASE?.replace(/\/$/, '');
if (!base || base === '/') throw new Error('SITE_BASE is required');
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await visit(path);
    else if (/\.(html|css|js)$/.test(entry.name)) {
      const source = await readFile(path, 'utf8');
      const result = source.replace(/srcset="([^"]*)"/g, (match, value) => {
        return `srcset="${value.replace(/(^|,\s*)\/(?!\/)/g, `$1${base}/`)}"`;
      }).replace(/(["'`]|url\(\s*)\/(?!\/)([^"'`\s)<>]*)/g, (match, prefix, rest) => {
        if (rest === base.slice(1) || rest.startsWith(base.slice(1) + '/')) return match;
        return `${prefix}${base}/${rest}`;
      });
      await writeFile(path, result);
    }
  }
}
await visit('dist');
