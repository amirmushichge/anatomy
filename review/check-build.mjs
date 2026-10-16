import fs from 'node:fs';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const files=['index','pen','keyboard','watch','lens','gamepad','lock','hub','engine','motor','speaker','pump','hdd'].map(id=>id+'.html');
for(let i=0;i<2;i++){const r=spawnSync(process.execPath,['build.mjs'],{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||r.stdout);if(i===0)globalThis.first=Object.fromEntries(files.map(p=>[p,hash(p)]));else for(const p of files)assert.equal(hash(p),first[p],p+' nondeterministic');}
for(const p of files)assert.equal(hash(p),hash('dist/'+p));
fs.writeFileSync('review/build-qa.json',JSON.stringify({deterministic:true,standalone:files.map(path=>({path,bytes:fs.statSync(path).size,sha256:hash(path)})),distMatches:true},null,2));console.log('Thirteen standalone entries deterministic across two builds; dist matches gallery');
