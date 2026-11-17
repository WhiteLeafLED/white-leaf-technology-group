(()=>{
const nav=document.getElementById('nav');
const btn=document.querySelector('.menu-btn');
const menu=document.getElementById('site-nav');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PANEL_IDS=new Set(['about','technology','tech-wavelengths','tech-led','tech-emerging','tech-used-today','red-light','blue-light','applications','app-milking-holsteins','app-nursery','app-heifer-huts','app-water-troughs','app-bacteria-impact-milking-cow','app-how-we-kill-unseen-enemy','app-unseen-enemy','case-studies','contact']);
const TECH_IDS=new Set(['technology','tech-wavelengths','tech-led','tech-emerging','tech-used-today','red-light','blue-light']);
const APP_IDS=new Set(['applications','app-milking-holsteins','app-nursery','app-heifer-huts','app-water-troughs','app-bacteria-impact-milking-cow','app-how-we-kill-unseen-enemy','app-unseen-enemy']);

const setNavSolid=()=>{
  const solid = document.body.classList.contains('panel-mode') || scrollY>40;
  nav.classList.toggle('solid', solid);
};
addEventListener('scroll',setNavSolid,{passive:true});

const closeDropdowns=()=>{
  menu.querySelectorAll('.dd.open').forEach(d=>d.classList.remove('open'));
  menu.querySelectorAll('.dd-top').forEach(t=>t.setAttribute('aria-expanded','false'));
};
const closeMenu=()=>{
  menu.classList.remove('open');
  btn.setAttribute('aria-expanded','false');
  btn.setAttribute('aria-label','Open menu');
  closeDropdowns();
};
btn.addEventListener('click',()=>{
  const o=menu.classList.toggle('open');
  btn.setAttribute('aria-expanded',String(o));
  btn.setAttribute('aria-label',o?'Close menu':'Open menu');
  if(!o) closeDropdowns();
});
menu.querySelectorAll('a:not(.dd-top)').forEach(a=>a.addEventListener('click',()=>{
  closeMenu();
}));
menu.querySelectorAll('.dd-top').forEach(t=>{
  t.setAttribute('aria-expanded','false');
  t.addEventListener('click',e=>{
    const d=t.parentElement;
    const narrow=matchMedia('(max-width:900px)').matches;
    if(narrow && !d.classList.contains('open')){
      e.preventDefault();
      closeDropdowns();
      d.classList.add('open');
      t.setAttribute('aria-expanded','true');
      return;
    }
    closeMenu();
  });
});

const hv=document.querySelector('.hero-video');
if(rm&&hv){hv.pause();hv.removeAttribute('autoplay')}

const tryPlay=v=>{
  const snd=v.hasAttribute('data-play-sound');
  if(rm&&!snd) return;
  if(snd){v.muted=false;v.controls=true}else v.muted=true;
  const p=v.play();
  if(p&&typeof p.catch==='function') p.catch(()=>{});
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
  playActiveVideos();
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

/* White Leaf contact form */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('contact-status');
  var btn = form.querySelector('button[type="submit"]');
  var MSG = {
    captcha_required: 'Please wait for the security check to finish, then try again.',
    captcha_failed: 'The security check did not pass. Please try again.',
    rate_limited: 'Too many messages from your connection. Please wait a few minutes or call Dave at 262-707-7288.',
    missing_fields: 'Please fill in your name, a valid email, and a message.',
    delivery_failed: 'We could not send your message right now. Please call Dave at 262-707-7288.'
  };
  function show(text, ok) { status.hidden = false; status.textContent = text; status.style.color = ok ? '#7ee2a8' : '#ff8a96'; }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    btn.disabled = true; show('Sending…', true);
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok && d.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok) { form.reset(); show('Thank you. Your message was sent and Dave will get back to you soon.', true); }
        else { show(MSG[res.d.error] || 'Something went wrong. Please try again or call Dave at 262-707-7288.', false); }
      })
      .catch(function () { show('Network problem. Please try again or call Dave at 262-707-7288.', false); })
      .then(function () { btn.disabled = false; if (window.turnstile) { try { window.turnstile.reset(); } catch (_) {} } });
  });
})();
