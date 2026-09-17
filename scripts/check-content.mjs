// Run after pnpm build: node scripts/check-content.mjs
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = path => readFileSync(`dist/${path ? `${path}/` : ''}index.html`, 'utf8');
const projects = ['anthon', 'drivewise', 'amber', 'c-code-lab', 'physic-engine'];
for (const locale of ['en', 'it']) {
  const prefix = locale === 'it' ? 'it/' : '';
  const home = read(prefix.replace(/\/$/, ''));
  assert.match(home, new RegExp(`lang="${locale}"`));
  for (const slug of projects) {
    assert.ok(home.includes(`/${prefix}projects/${slug}`), slug);
    const page = read(`${prefix}projects/${slug}`);
    assert.match(page, new RegExp(`lang="${locale}"`));
    assert.ok(page.includes(`/${prefix}projects`));
    assert.ok(page.includes(`https://kovdev.me/${locale === 'it' ? '' : 'it/'}projects/${slug}`));
    assert.ok(existsSync(`dist/og/${prefix}projects/${slug}.png`));
    if (slug !== 'anthon') assert.ok(!page.includes('class="plate-row">\n          <dt>demo</dt>'));
  }
  const profile = read(`${prefix}about`);
  assert.match(profile, new RegExp(`lang="${locale}"`));
  assert.ok(home.includes(`/${prefix}about`));
  assert.ok(existsSync(`dist/og/${prefix}about.png`));
  for (const fact of ['JA Alumni Italy', 'UrbanHeroes', 'CyberChallenge.IT', 'SmemoBox', 'CanSat', '57', 'B2', 'C1']) {
    assert.ok(profile.includes(fact), `Missing CV fact: ${fact}`);
  }
  const now = read(`${prefix}now`);
  assert.ok(now.includes('Amber') && now.includes('Drivewise'));
  assert.ok(now.includes('aria-label="0%"'));
  assert.ok(!read(`${prefix}uses`).includes('dotfiles'));
  assert.ok(!read(`${prefix}changelog`).includes('2025-01'));
}
for (const path of ['projects/allocator', 'notes/page-cache', 'lab/sched-trace']) {
  assert.ok(!existsSync(`dist/${path}/index.html`), path);
  assert.ok(!readFileSync('dist/sitemap-0.xml', 'utf8').includes(path), path);
}
assert.ok(read('projects/anthon').includes('https://tryanthon.com'));
assert.ok(!read('projects/c-code-lab').includes('https://c-code-lab.vercel.app'));
assert.ok(read('it/notes').includes('In inglese'));
assert.ok(!read('notes/the-work-that-disappears').includes('published Jan'));
assert.match(readFileSync('dist/rss.xml', 'utf8'), /<pubDate>Mon, 14 Sep 2026 00:00:00 GMT<\/pubDate>/);
for (const prefix of ['', 'it/']) {
  assert.ok(!read(`${prefix}projects/anthon`).includes('/images/projects/anthon/'));
}
console.log('Passed: localized project routes, language alternates, OG images, confirmed content, zero reading progress, mock removal and article publication date and Anthon image removal and bilingual CV profile.');
