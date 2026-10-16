import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const browser=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true,args:['--allow-file-access-from-files','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--do-not-de-elevate']});
const errors=[],page=await browser.newPage({viewport:{width:1600,height:1000}});page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const settle=async()=>{await page.waitForFunction(()=>window.anatomyViewer?.viewer&&!anatomyViewer.viewer.active&&Math.abs(anatomyGallery.state().apart-anatomyGallery.state().apartTarget)<.002,null,{timeout:30000});};
for(const id of ['pen','keyboard','watch']){
 await page.goto(pathToFileURL(path.resolve(id+'.html')).href);await page.waitForFunction(()=>window.anatomyGallery||document.body.dataset.error);console.log('entry',id,await page.evaluate(()=>({error:document.body.dataset.error,renderer:document.body.dataset.renderer})));await settle();await page.screenshot({path:'review/'+id+'-hero.png'});
 if(id!=='watch')for(let i=0;i<5;i++){await page.evaluate(i=>anatomyGallery.studyChapter(i),i);await settle();await page.evaluate(()=>anatomyGallery.studyPhase(.16));await settle();await page.screenshot({path:'review/'+id+'-chapter-'+i+'.png'});}
 console.log(id,await page.evaluate(()=>anatomyViewer.diagnostics()));
}
fs.writeFileSync('review/initial-capture.json',JSON.stringify({errors},null,2));console.log(errors);await browser.close();
