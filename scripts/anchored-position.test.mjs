import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { chromium } from 'playwright';
import ts from 'typescript';

// A real layout engine is needed: removing max-height resets scrollTop only
// after the browser measures the expanded panel.
const source = await readFile(new URL('../src/lib/actions/anchored-position.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
}).outputText.replace('export function anchoredPosition', 'function anchoredPosition');

test('a constrained popover can scroll to Apply and stays usable after repositioning', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 741, height: 632 }, { width: 1280, height: 720 }, { width: 280, height: 600 }]) {
      const page = await browser.newPage({ viewport });
      try {
        await page.setContent(`
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; }
            #modal { position: fixed; inset: 20px; overflow: auto; }
            #anchor { margin-top: 440px; height: 38px; }
            #panel { width: 640px; padding: 16px; border: 1px solid; background: white; }
            #calendar { height: 700px; }
          </style>
          <div id="modal">
            <button id="anchor">Date range</button>
            <div id="panel"><div id="calendar">Calendar</div><button id="apply">Apply</button></div>
            <div style="height: 700px"></div>
          </div>
        `);
        await page.addScriptTag({ content: compiled + `
          window.positionAction = anchoredPosition(document.querySelector('#panel'), {
            anchor: document.querySelector('#anchor')
          });
          document.querySelector('#apply').onclick = () => window.applied = true;
        ` });
        const panel = page.locator('#panel');
        await panel.hover();
        await page.mouse.wheel(0, 1500);
        // Let scroll events, ResizeObserver, and the next frame finish.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const result = await panel.evaluate(node => {
          const box = node.getBoundingClientRect();
          const apply = node.querySelector('#apply').getBoundingClientRect();
          return { scrollTop: node.scrollTop, bottomVisible: apply.bottom <= box.bottom,
            fits: box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight };
        });
        assert.ok(result.scrollTop > 0, `Scroll resets at ${viewport.width}px`);
        assert.ok(result.bottomVisible, `Apply is clipped at ${viewport.width}px`);
        assert.ok(result.fits, `Panel exceeds viewport at ${viewport.width}px`);
        const before = await panel.evaluate(node => node.scrollTop);
        await page.evaluate(() => document.querySelector('#modal').scrollTop = 25);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.ok(await panel.evaluate(node => node.scrollTop) >= before, 'Ancestor scroll loses the panel position');
        await page.locator('#apply').click();
        assert.equal(await page.evaluate(() => window.applied), true);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});

test('a date picker can use the full viewport without scrolling to Apply', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 741, height: 632 } });
    await page.setContent(`
      <style>
        * { box-sizing: border-box; }
        #anchor { position: fixed; top: 400px; height: 38px; }
        #panel { width: 640px; padding: 16px; border: 1px solid; background: white; }
        #calendar { height: 460px; }
      </style>
      <button id="anchor">Date range</button>
      <div id="panel"><div id="calendar">Calendar</div><button id="apply">Apply</button></div>
    `);
    await page.addScriptTag({ content: compiled + `
      anchoredPosition(document.querySelector('#panel'), {
        anchor: document.querySelector('#anchor'), allowOverlap: true
      });
    ` });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const result = await page.locator('#panel').evaluate(panel => {
      const box = panel.getBoundingClientRect();
      const apply = document.querySelector('#apply').getBoundingClientRect();
      return {
        scrolls: panel.scrollHeight > panel.clientHeight,
        fits: box.top >= 8 && box.bottom <= innerHeight - 8,
        applyVisible: apply.top >= box.top && apply.bottom <= box.bottom
      };
    });
    assert.equal(result.scrolls, false);
    assert.ok(result.fits);
    assert.ok(result.applyVisible);
  } finally {
    await browser.close();
  }
});
