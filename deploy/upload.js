// Uploads assets in buckets returned by assets-upload-session, saves completion JWT
const {spawnSync}=require('child_process');const fs=require('fs');
const account='75252cda6e739fb59adfb9f5c157a398';
const jwt=fs.readFileSync('upload-jwt.txt','utf8').trim();
const buckets=JSON.parse(fs.readFileSync('buckets.json','utf8'));
const byHash=Object.fromEntries(JSON.parse(fs.readFileSync('files.json','utf8')).map(f=>[f.hash,f]));
let completion='';
if(!buckets.length){fs.writeFileSync('completion-jwt.txt',jwt);console.log('nothing to upload; session jwt is completion');process.exit(0);}
for(let i=0;i<buckets.length;i++){
  const tmp=`/tmp/wlb-${i}`;fs.mkdirSync(tmp,{recursive:true});
  const args=['-sS','-X','POST',`https://api.cloudflare.com/client/v4/accounts/${account}/workers/assets/upload?base64=true`,'-H',`Authorization: Bearer ${jwt}`,'-w','\nHTTP_STATUS:%{http_code}'];
  for(const h of buckets[i]){const f=byHash[h];if(!f)throw new Error('missing '+h);const p=`${tmp}/${h}`;fs.writeFileSync(p,fs.readFileSync(f.full).toString('base64'));args.push('-F',`${h}=<${p};type=${f.contentType}`);}
  const r=spawnSync('curl',args,{encoding:'utf8',maxBuffer:80*1024*1024});
  const out=r.stdout||'';const status=(out.match(/HTTP_STATUS:(\d+)/)||[])[1];const body=out.replace(/\n?HTTP_STATUS:\d+\s*$/,'');
  console.log(`bucket ${i+1}/${buckets.length} status ${status}`,body.slice(0,160).replace(/"jwt":"[^"]+"/,'"jwt":"…"'));
  const j=JSON.parse(body);if(j?.result?.jwt)completion=j.result.jwt;
  if(!['200','201','202'].includes(status)){console.error(r.stderr);process.exit(1);}
  fs.rmSync(tmp,{recursive:true,force:true});
}
if(!completion){console.error('no completion jwt');process.exit(1);}
fs.writeFileSync('completion-jwt.txt',completion);console.log('completion saved');
