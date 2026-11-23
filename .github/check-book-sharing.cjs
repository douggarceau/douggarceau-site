// Exercise the public markup and the device actions without sending a message.
const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
const server = 'http://127.0.0.1:8787';
const base = '/the-names-he-carried/';
(async()=>{
  const browser = await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
  try {
    const ctx = await browser.newContext({permissions:['clipboard-read','clipboard-write']});
    const page = await ctx.newPage();
    await page.route('**/*',route=>route.request().url().startsWith(server)?route.continue():route.abort());
    await ctx.addInitScript(()=>{
      Object.defineProperty(navigator,'canShare',{configurable:true,value:data=>data.files?.length===1});
      Object.defineProperty(navigator,'share',{configurable:true,value:async data=>{
        window.testShare={url:data.url,text:data.text,file:data.files?.[0]?.name};
      }});
    });
    for(const route of ['/',base,base+'share/',base+'cold-case-file/evidence-vault.html',base+'web/']){
      const resp=await ctx.request.get(server+route);
      const raw=await resp.text();
      assert.equal(resp.status(),200);
      assert.match(raw,/<meta property="og:image" content="https:\/\/douggarceau\.com\/the-names-he-carried\/design\/shieldhill-book-card\.jpg">/);
      assert.match(raw,/<meta name="twitter:card" content="summary_large_image">/);
    }
    for(const slug of ['', '#chapter-2', 'cold-case-file/evidence-vault.html']){
      await page.goto(server+base+slug);
      const share=page.locator('.book-share-trigger');
      await share.click();
      const panel=page.getByRole('dialog');
      const expected=server+base+(slug || 'share/');
      assert.equal(await panel.getByRole('textbox').inputValue(),expected);
      await panel.getByRole('button',{name:'Copy link'}).click();
      assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected);
      assert.equal(await panel.getByRole('status').textContent(),'Link copied.');
      await panel.getByRole('button',{name:'Copy image',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('.book-share-panel [role=status]').textContent.startsWith('Image copied.'));
      const copiedSize = await page.evaluate(async()=>{
        const items = await navigator.clipboard.read();
        const png = await items[0].getType('image/png');
        const bitmap = await createImageBitmap(png);
        return [bitmap.width,bitmap.height];
      });
      assert.deepEqual(copiedSize,[1200,630]);
      await panel.getByRole('button',{name:'Share link…'}).click();
      assert.equal(await page.evaluate(()=>window.testShare.url),expected);
      await share.click();
      await panel.getByRole('button',{name:'Share image…'}).click();
      assert.equal(await page.evaluate(()=>window.testShare.file),'The-Names-He-Carried.jpg');
      assert.equal(await page.evaluate(()=>window.testShare.text),expected);
      await share.click();
      const downloadPromise=page.waitForEvent('download');
      await panel.getByRole('link',{name:'Save image'}).click();
      assert.equal((await downloadPromise).suggestedFilename(),'The-Names-He-Carried.jpg');
      await page.keyboard.press('Escape');
      assert.equal(await panel.count(),0);
    }
    await page.goto(server+base+'share/');
    await page.waitForURL(server+base);
    console.log('Passed static unfurl tags, fresh share URL, chapter and Vault links, clipboard, device-share payload, image download and keyboard dismissal.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
