import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--allow-file-access-from-files','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--do-not-de-elevate']}),page=await browser.newPage(),errors=[],external=[],checks=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
try{
 for(const [name,width,height] of [['desktop',1440,950],['phone',390,844],['small-phone',320,568],['short',844,390]]){
  await page.setViewportSize({width,height});await page.goto(pathToFileURL(path.resolve('index.html')).href+'#gallery');await page.waitForFunction(()=>window.anatomyGallery&&document.body.dataset.renderer==='webgl2');
  if(!await page.locator('#gallery').isVisible())await page.locator('#gallery-toggle').click();
  while(!await page.locator('#page-prev').isDisabled())await page.locator('#page-prev').click();assert.equal(await page.locator('.preset-card').count(),12);
  const seen=new Set();let n=0;
  while(true){
   const data=await page.locator('.preset-card:not([hidden])').evaluateAll(cards=>cards.map(c=>{const r=c.getBoundingClientRect(),im=c.querySelector('img');return{id:c.dataset.preset,ok:im.complete&&im.naturalWidth>0,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}}));
   data.forEach(c=>{assert(c.ok&&c.inside,name+' card '+c.id);seen.add(c.id)});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight));
   if(name==='desktop')await page.screenshot({path:'review/gallery-final-page-'+n+'.png'});
   assert(await page.evaluate(()=>document.querySelector('.app').scrollTop===0&&document.querySelector('.app-header').getBoundingClientRect().top>=0),'Header remains visible after focus/resize');if(name==='small-phone'&&n===0)await page.screenshot({path:'review/gallery-small-phone.png'});
   if(await page.locator('#page-next').isDisabled())break;await page.locator('#page-next').click();n++;
  }
  assert.equal(seen.size,12);checks.push(name+': all twelve embedded thumbnails load and every paginated card is reachable without page scroll');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);fs.writeFileSync('review/gallery-hub-qa.json',JSON.stringify({checks,errors,external},null,2));console.log(JSON.stringify({checks,errors,external},null,2));
}finally{await browser.close()}
