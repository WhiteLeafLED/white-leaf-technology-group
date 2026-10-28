(()=>{
const nav=document.getElementById('nav');
const btn=document.querySelector('.menu-btn');
const menu=document.getElementById('site-nav');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PANEL_IDS=new Set(['about','technology','tech-wavelengths','tech-led','tech-emerging','tech-used-today','red-light','blue-light','applications','app-milking-holsteins','app-nursery','app-heifer-huts','app-water-troughs','app-unseen-enemy','app-how-we-kill-unseen-enemy','case-studies','contact']);
const TECH_IDS=new Set(['technology','tech-wavelengths','tech-led','tech-emerging','tech-used-today','red-light','blue-light']);
const APP_IDS=new Set(['applications','app-milking-holsteins','app-nursery','app-heifer-huts','app-water-troughs','app-unseen-enemy','app-how-we-kill-unseen-enemy']);

const setNavSolid=()=>{
  const solid = document.body.classList.contains('panel-mode') || scrollY>40;
  nav.classList.toggle('solid', solid);
};
addEventListener('scroll',setNavSolid,{passive:true});

btn.addEventListener('click',()=>{
  const o=menu.classList.toggle('open');
  btn.setAttribute('aria-expanded',o);
  btn.setAttribute('aria-label',o?'Close menu':'Open menu');
});
menu.querySelectorAll('a:not(.dd-top)').forEach(a=>a.addEventListener('click',()=>{
  menu.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
  menu.querySelectorAll('.dd.open').forEach(d=>d.classList.remove('open'));
}));
menu.querySelectorAll('.dd-top').forEach(t=>t.addEventListener('click',e=>{
  const d=t.parentElement;
  if(matchMedia('(max-width:900px)').matches && !d.classList.contains('open')){e.preventDefault();d.classList.add('open');return}
  menu.classList.remove('open');btn.setAttribute('aria-expanded','false');d.classList.remove('open');
}));

const hv=document.querySelector('.hero-video');
if(rm&&hv){hv.pause();hv.removeAttribute('autoplay')}

const tryPlay=v=>{
  if(rm) return;
  v.muted=true;
  const kick=()=>{
    const p=v.play();
    if(p&&typeof p.catch==='function') p.catch(()=>{});
  };
  if(v.readyState>=2){kick();return}
  const onReady=()=>{v.removeEventListener('canplay',onReady);kick()};
  v.addEventListener('canplay',onReady);
  try{v.load()}catch(_){}
};

const pauseHiddenVideos=()=>{
  document.querySelectorAll('.nav-panel video').forEach(v=>{
    if(!v.closest('.nav-panel.is-active')){
      try{v.pause()}catch(_){}
    }
  });
};

const playActiveVideos=()=>{
  const panel=document.querySelector('.nav-panel.is-active');
  if(!panel) return;
  panel.querySelectorAll('video').forEach(v=>{
    try{
      if(!v.loop && (v.ended || v.currentTime>0.2)) v.currentTime=0;
    }catch(_){}
    tryPlay(v);
  });
};

const clearActivePanels=()=>{
  document.querySelectorAll('.nav-panel.is-active').forEach(el=>el.classList.remove('is-active'));
  menu.querySelectorAll('a.is-active').forEach(a=>a.classList.remove('is-active'));
  document.body.className = document.body.className
    .split(/\s+/).filter(c=>c && !c.startsWith('view-') && c!=='home-mode' && c!=='panel-mode').join(' ');
};

const showHome=(scrollToCta)=>{
  clearActivePanels();
  document.body.classList.add('home-mode');
  pauseHiddenVideos();
  setNavSolid();
  if(scrollToCta){
    const c=document.getElementById('home-cta');
    if(c) c.scrollIntoView({behavior: rm?'auto':'smooth'});
  } else {
    scrollTo({top:0,behavior: rm?'auto':'smooth'});
  }
};

const showPanel=(id)=>{
  clearActivePanels();
  document.body.classList.add('panel-mode', `view-${id}`);
  const el=document.getElementById(id);
  if(el){
    el.classList.add('is-active');
    el.querySelectorAll('.reveal').forEach(r=>r.classList.add('in'));
  }
  const link=menu.querySelector(`a[href="#${id}"]`);
  if(link) link.classList.add('is-active');
  if(TECH_IDS.has(id)){const t=menu.querySelector('.dd-top[href="#technology"]');if(t)t.classList.add('is-active');}
  if(APP_IDS.has(id)){const a=menu.querySelector('.dd-top[href="#applications"]');if(a)a.classList.add('is-active');}
  setNavSolid();
  scrollTo({top:0,behavior:'auto'});
  pauseHiddenVideos();
  requestAnimationFrame(()=>requestAnimationFrame(playActiveVideos));
};

const applyHash=()=>{
  const id=(location.hash||'#top').slice(1);
  if(id==='home-cta'){
    showHome(true);
    return;
  }
  if(PANEL_IDS.has(id)){
    showPanel(id);
    return;
  }
  showHome(false);
};

addEventListener('hashchange',applyHash);
applyHash();

const count=el=>{
  const to=+el.dataset.to,d=+(el.dataset.dec||0),t0=performance.now(),dur=1400;
  const f=t=>{
    const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=(to*e).toFixed(d);
    if(p<1)requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
};
if(!('IntersectionObserver' in window)||rm){
  document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));
} else {
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.classList.add('in');
    const b=e.target.querySelector('b[data-to]');
    if(b)count(b);
    io.unobserve(e.target);
  }),{threshold:.15});
  document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
}
})();
