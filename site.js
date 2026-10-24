(()=>{
const nav=document.getElementById('nav');
const btn=document.querySelector('.menu-btn');
const menu=document.getElementById('site-nav');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PANEL_IDS=new Set(['about','technology','applications','results','case-studies']);
const HOME_IDS=new Set(['top','contact','']);

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
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  menu.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
}));

const hv=document.querySelector('.hero-video');
if(rm&&hv){hv.pause();hv.removeAttribute('autoplay')}

const clearActivePanels=()=>{
  document.querySelectorAll('.nav-panel.is-active').forEach(el=>el.classList.remove('is-active'));
  menu.querySelectorAll('a.is-active').forEach(a=>a.classList.remove('is-active'));
  document.body.className = document.body.className
    .split(/\s+/).filter(c=>c && !c.startsWith('view-') && c!=='home-mode' && c!=='panel-mode').join(' ');
};

const showHome=(scrollToContact)=>{
  clearActivePanels();
  document.body.classList.add('home-mode');
  setNavSolid();
  if(scrollToContact){
    const c=document.getElementById('contact');
    if(c) c.scrollIntoView({behavior: rm?'auto':'smooth'});
  } else {
    scrollTo({top:0,behavior: rm?'auto':'smooth'});
  }
  // mark Contact when scrolled there via nav
  if(scrollToContact){
    const link=menu.querySelector('a[href="#contact"]');
    if(link) link.classList.add('is-active');
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
  // Technology also reveals In the barn
  if(id==='technology'){
    const barn=document.getElementById('in-the-barn');
    if(barn){
      barn.classList.add('is-active');
      barn.querySelectorAll('.reveal').forEach(r=>r.classList.add('in'));
    }
  }
  const link=menu.querySelector(`a[href="#${id}"]`);
  if(link) link.classList.add('is-active');
  setNavSolid();
  scrollTo({top:0,behavior:'auto'});
};

const applyHash=()=>{
  const id=(location.hash||'#top').slice(1);
  if(id==='contact'){
    showHome(true);
    return;
  }
  if(PANEL_IDS.has(id)){
    showPanel(id);
    return;
  }
  // in-the-barn has no nav item; treat as technology
  if(id==='in-the-barn'){
    history.replaceState(null,'','#technology');
    showPanel('technology');
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
