// Generates execute-tool code that: opens an assets upload session; if Cloudflare already has every file,
// deploys immediately with that token; otherwise returns {jwt,buckets} so upload.js can upload first.
// usage: node make-code.js session "message"   -> session-code.js
//        node make-code.js deploy  "message"   -> deploy-code.js (uses completion-jwt.txt after upload.js)
const fs=require('fs');const site=process.env.SITE||require('path').resolve(__dirname,'..');
const SCRIPT=process.env.SCRIPT||'whiteleaf-site';   // set SCRIPT=whiteleaf-site-preview to deploy a preview Worker
const mode=process.argv[2], msg=(process.argv[3]||'Deploy White Leaf site from repo main').slice(0,100);
const manifest=fs.readFileSync('manifest.json','utf8');
const workerSrc=fs.readFileSync(site+'/worker/worker.js','utf8');
const config={run_worker_first:true,html_handling:process.env.HH||'none',not_found_handling:'404-page',_headers:(process.env.SCRIPT&&process.env.SCRIPT!=='whiteleaf-site'?'/*\n  X-Robots-Tag: noindex, nofollow\n':'')+fs.readFileSync(site+'/_headers','utf8'),_redirects:fs.readFileSync(site+'/_redirects','utf8')};
const deployFn=`async function deploy(jwt){ const metadata={main_module:'worker.js',bindings:[{type:'assets',name:'ASSETS'}],compatibility_date:'2025-10-01',assets:{jwt,config:${JSON.stringify(config)}},annotations:{'workers/message':${JSON.stringify(msg)}}}; const form=new FormData(); form.set('metadata', new Blob([JSON.stringify(metadata)],{type:'application/json'})); form.set('worker.js', new Blob([${JSON.stringify(workerSrc)}],{type:'application/javascript+module'}),'worker.js'); const r=await cloudflare.request({method:'PUT',path:\`/accounts/\${accountId}/workers/scripts/${SCRIPT}\`,body:form}); return {deployed:r.success, errors:r.errors, has_assets:r.result?.has_assets}; }`;
if(mode==='session'){
  fs.writeFileSync('session-code.js',`async () => { ${deployFn} const manifest=${manifest}; const s=(await cloudflare.request({method:'POST',path:\`/accounts/\${accountId}/workers/scripts/${SCRIPT}/assets-upload-session\`,body:{manifest}})).result; if(!s.buckets||!s.buckets.length){ return {nothing_to_upload:true, ...(await deploy(s.jwt))}; } return {jwt:s.jwt, buckets:s.buckets}; }`);
} else {
  const jwt=fs.readFileSync('completion-jwt.txt','utf8').trim();
  fs.writeFileSync('deploy-code.js',`async () => { ${deployFn} return deploy(${JSON.stringify(jwt)}); }`);
}
console.log('wrote',mode);
