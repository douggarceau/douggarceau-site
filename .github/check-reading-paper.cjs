// Check actual rendered surfaces, including pages reached by the reader's hash router.
const { chromium } = require('playwright-core');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const folder = 'the-names-he-carried';
const server = 'http://127.0.0.1:8787/';
function htmlFiles(start) {
  return fs.readdirSync(start, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(start, entry.name);
    return entry.isDirectory() ? htmlFiles(name) : (name.endsWith('.html') ? [name] : []);
  });
}

async function check() {
  const files = htmlFiles(folder);
  const chapters = JSON.parse(fs.readFileSync(folder + '/book.json')).chapters;
  const people = JSON.parse(fs.readFileSync(folder + '/people.json'));
  const routes = ['contents', 'tree', 'listen', 'records', 'people', 'sources', 'timeline', 'places',
    ...chapters.map(c => 'chapter-' + c.n), ...people.map(p => 'person-' + p.slug)];
  const assets = ['img/family-tree.svg', 'img/shieldhill-map.svg'];
  const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      await context.route('**/*', route => {
        const req = route.request();
        if (!req.url().startsWith(server) || ['image', 'media', 'font'].includes(req.resourceType())) return route.abort();
        return route.continue();
      });
      const page = await context.newPage();
      const failures = [];
      const audit = {};
      const inspect = require("./audit-book-page.cjs");
      const targets = [...files, ...routes.map(r => folder + '/#' + r)];
      for (const target of targets) {
        await page.goto(server + target, { waitUntil: 'load' });
        if (target.includes('#') || target === folder + '/index.html')
          await page.waitForSelector('#view > section, #view > article', { state: 'attached' });
        const observed = await page.evaluate(inspect);
        audit[target] = observed;
        if (width === 1440) { delete observed.links; delete observed.blocks; delete observed.ids; }
        if (target.endsWith('#chapter-1')) {
          assert.match(observed.opening[0], /pocket watch/i);
          assert.equal(observed.records.length, 1, 'Prologue birth-register link');
          assert.equal(await page.locator('.body .alisten').count(), 0);
        }
        const dark = await page.evaluate(() => {
          const main = document.querySelector('main');
          if (!main || !document.querySelector('.cloth-band')) return ['missing page or tartan'];
          const candidates = [document.documentElement, document.body, main,
            ...main.querySelectorAll('article,section,pre,header,figure:not(:has(img)),thead,tbody,.opener,.vault-scene')];
          return candidates.flatMap(el => {
            if (!el.getClientRects().length) return [];
            const css = getComputedStyle(el);
            const colors = (css.backgroundColor + ' ' + css.backgroundImage).match(/rgba?\([^)]+\)/g) || [];
            const darkColors = colors.filter(c => {
              const [r,g,b,a=1] = c.match(/[\d.]+/g).map(Number);
              return a > 0.85 && Math.max(r,g,b) < 75;
            });
            return darkColors.length ? [el.tagName + '.' + el.className + ' ' + darkColors.join(',')] : [];
          });
        });
        if (dark.length) failures.push([target, dark]);
      }
      fs.mkdirSync('book-audit-results', {recursive:true});
      fs.writeFileSync('book-audit-results/'+width+'.json', JSON.stringify(audit));
      for (const asset of assets) {
        await page.goto(server + folder + '/' + asset);
        assert.equal(await page.locator('svg > rect').first().getAttribute('fill'), '#fff9ec', asset);
      }
      // A missing external stylesheet should still leave old bookmarks readable.
      await context.route('**/douglas.css*', r => r.abort());
      for (const target of [folder + '/index.html', folder + '/cold-case-file/index.html', folder + '/sir-nathaniel/index.html', files.find(f=>f.includes('/docs/'))]) {
        await page.goto(server + target, {waitUntil:'load'});
        assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).backgroundColor), 'rgb(255, 249, 236)', target);
        assert.equal(await page.locator('main').evaluate(e=>getComputedStyle(e).backgroundColor), 'rgb(255, 249, 236)', target);
      }
      console.log(width + 'px: ' + files.length + ' HTML pages, ' + routes.length + ' reader views, 2 standalone diagrams, 4 fallback checks');
      assert.deepEqual(failures, [], 'Dark reading surfaces: ' + JSON.stringify(failures));
      await context.close();
    }
  } finally { await browser.close(); }
}
check().catch(err=>{ console.error(err); process.exitCode=1; });
