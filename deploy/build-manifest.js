// Builds manifest.json + files.json for a Workers static-assets upload of /workspace/whiteleaf-site
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=process.argv[2]||process.env.SITE||require('path').resolve(__dirname,'..');
const ignore=new Set(fs.readFileSync(path.join(root,'.assetsignore'),'utf8').split('\n').map(s=>s.trim()).filter(Boolean));
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'application/javascript; charset=utf-8',txt:'text/plain; charset=utf-8',xml:'application/xml; charset=utf-8',json:'application/json',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',ico:'image/x-icon',mp4:'video/mp4',webm:'video/webm',pdf:'application/pdf',webmanifest:'application/manifest+json',woff2:'font/woff2'};
const files=[];
(function walk(d,rel){for(const n of fs.readdirSync(d)){if(rel===''&&ignore.has(n))continue;const full=path.join(d,n),r=rel+'/'+n;const st=fs.statSync(full);if(st.isDirectory())walk(full,r);else{const ext=n.split('.').pop().toLowerCase();if(st.size>25*1024*1024)throw new Error('TOO BIG '+r+' '+st.size);const b64=fs.readFileSync(full).toString('base64');const hash=crypto.createHash('sha256').update(b64+ext).digest('hex').slice(0,32);files.push({path:r,hash,size:st.size,full,contentType:types[ext]||'application/octet-stream'});}}})(root,'');
const manifest=Object.fromEntries(files.map(f=>[f.path,{hash:f.hash,size:f.size}]));
fs.writeFileSync('files.json',JSON.stringify(files,null,1));fs.writeFileSync('manifest.json',JSON.stringify(manifest));
console.log(files.length,'files',files.reduce((a,f)=>a+f.size,0),'bytes; unknown types:',files.filter(f=>f.contentType.includes('octet')).map(f=>f.path));
