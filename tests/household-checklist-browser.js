/* Isolated real-browser UI test; all authentication/network sync disabled in fixture. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.join(__dirname,'..');
(async()=>{
  const server=http.createServer((req,res)=>{
    const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    try{res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));}
    catch(e){res.writeHead(404);res.end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  let browser;
  try{
    browser=await chromium.launch({headless:true,...(process.env.HOUSEHOLD_BROWSER_PATH?{executablePath:process.env.HOUSEHOLD_BROWSER_PATH}:{})});
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>{
      const url=new URL(route.request().url());
      if(url.origin!==origin)return route.abort();
      if(['/auth.js','/sync.js','/topbar.js','/push.js'].includes(url.pathname))return route.fulfill({contentType:'application/javascript',body:''});
      return route.continue();
    });
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    const frame=page.frameLocator('#dailyMissions2Frame');
    await frame.locator('[data-mission="household"]').click({timeout:10000});
    const dialog=page.locator('.hh-dialog');
    await dialog.waitFor({state:'visible'});
    await dialog.locator('[data-hh-step="clothes"]').check();
    await dialog.locator('[data-hh-close]').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await frame.locator('[data-mission="household"]').click();
    assert.equal(await dialog.locator('[data-hh-step="clothes"]').isChecked(),true);
    assert.equal(await dialog.locator('[data-hh-step="trash"]').isChecked(),false);
    const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}').household||{});
    assert.equal(Object.keys(before).length,0,'substep does not complete habit');
    await dialog.locator('[data-hh-complete]').click();
    assert.equal(await dialog.locator('[data-hh-complete]').isDisabled(),true);
    const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('rpg_habitlog_v1')||'{}').household||{});
    assert.equal(Object.keys(after).length,1,'completion uses canonical daily habit log');
    const bounds=await dialog.boundingBox();
    assert(bounds.x>=0 && bounds.x+bounds.width<=390,'fits mobile width');
    await page.screenshot({path:'/workspace/scratch/31a35b09f188/household-mobile.png'});
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    assert.deepEqual(errors,[]);
    console.log('PASS real mobile browser: Home card, reopen, reload, no accidental completion, canonical completion, viewport, Escape, no JS errors');
  } finally {if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
