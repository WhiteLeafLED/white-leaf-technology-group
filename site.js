(()=>{
const nav=document.getElementById('nav');
const menu=document.getElementById('site-nav');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const PANEL_IDS=new Set(['about','technology','tech-wavelengths','tech-led','tech-emerging','tech-used-today','red-light','blue-light','applications','app-milking-holsteins','app-nursery','app-heifer-huts','app-water-troughs','app-bacteria-impact-milking-cow','app-how-we-kill-unseen-enemy','app-unseen-enemy','case-studies','contact']);
const TECH_IDS=new Set(['technology','tech-wavelengths','tech-led','tech-emerging','tech-used-today','red-light','blue-light']);
const APP_IDS=new Set(['applications','app-milking-holsteins','app-nursery','app-heifer-huts','app-water-troughs','app-bacteria-impact-milking-cow','app-how-we-kill-unseen-enemy','app-unseen-enemy']);
const SITE_TITLE=document.title;
let firstView=true;

const setNavSolid=()=>{
  const solid = document.body.classList.contains('panel-mode') || scrollY>40;
  nav.classList.toggle('solid', solid);
};
addEventListener('scroll',setNavSolid,{passive:true});

const hv=document.querySelector('.hero-video');
if(rm&&hv){hv.pause();hv.removeAttribute('autoplay')}

const tryPlay=v=>{
  const snd=v.hasAttribute('data-play-sound');
  if(rm&&!snd) return;
  if(snd){v.muted=false;v.controls=true}else v.muted=true;
  const p=v.play();
  if(p&&typeof p.catch==='function') p.catch(()=>{});
};

/* Panel videos start with preload="none" so nothing downloads until its panel is opened. */
const warm=v=>{ if(v.preload==='none') v.preload='metadata'; };

/* Looping preview tiles (Applications grid) only download and play while on screen. */
const tileVideos=[...document.querySelectorAll('.tile video')];
const tileIO='IntersectionObserver' in window ? new IntersectionObserver(es=>es.forEach(e=>{
  const v=e.target;
  if(e.isIntersecting){ tryPlay(v); } else { try{v.pause()}catch(_){} }
}),{rootMargin:'120px 0px'}) : null;
if(tileIO) tileVideos.forEach(v=>tileIO.observe(v));

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
    if(v.closest('.tile')){ if(!tileIO) tryPlay(v); return; }   /* tiles are driven by the observer */
    warm(v);
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
  document.title=SITE_TITLE;
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
  /* Tell screen readers and the browser tab that the "page" changed. */
  const h=el&&el.querySelector('h2,h1');
  if(h){
    document.title=h.textContent.replace(/\s+/g,' ').trim()+' — White Leaf Technology Group';
    if(!firstView){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
  }
};

const applyHash=()=>{
  const id=(location.hash||'#top').slice(1);
  if(id==='home-cta'){
    showHome(true);
  } else if(PANEL_IDS.has(id)){
    showPanel(id);
  } else {
    showHome(false);
  }
  firstView=false;
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
  var widget = form.querySelector('.cf-turnstile');
  var widgetId = null;
  var MSG = {
    captcha_required: 'Please wait for the security check to finish, then try again.',
    captcha_failed: 'The security check did not pass. Please try again.',
    rate_limited: 'Too many messages from your connection. Please wait a few minutes or call Dave at 262-707-7288.',
    missing_fields: 'Please fill in your name, a valid email, and a message.',
    delivery_failed: 'We could not send your message right now. Please call Dave at 262-707-7288.'
  };
  var FIELD_MSG = {
    name: 'Please enter your name.',
    email: 'Please enter a valid email address, like name@example.com.',
    message: 'Please type a message.'
  };

  /* Cloudflare Turnstile ("are you human" check) is loaded only when the form is about to be used. */
  var tsRequested = false;
  function loadTurnstile() {
    if (tsRequested || !widget) return;
    tsRequested = true;
    window.wlTurnstileReady = function () {
      try { widgetId = window.turnstile.render(widget); } catch (_) {}
    };
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=wlTurnstileReady';
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, obs) {
      if (es.some(function (e) { return e.isIntersecting; })) { loadTurnstile(); obs.disconnect(); }
    }, { rootMargin: '400px 0px' }).observe(form);
  } else { loadTurnstile(); }
  form.addEventListener('focusin', loadTurnstile, { once: true });
  form.addEventListener('pointerdown', loadTurnstile, { once: true });

  function show(text, ok) {
    status.hidden = false; status.textContent = text;
    status.classList.toggle('ok', !!ok); status.classList.toggle('err', !ok);
  }
  function fieldErr(input) { return document.getElementById('err-' + input.name); }
  function clearField(input) {
    input.removeAttribute('aria-invalid');
    var er = fieldErr(input); if (er) { er.hidden = true; er.textContent = ''; }
  }
  function markInvalid(input) {
    input.setAttribute('aria-invalid', 'true');
    var er = fieldErr(input);
    if (er) { er.textContent = FIELD_MSG[input.name] || input.validationMessage; er.hidden = false; }
  }
  form.addEventListener('input', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('aria-invalid') && e.target.checkValidity()) clearField(e.target);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fields = form.querySelectorAll('input[name="name"], input[name="email"], textarea[name="message"]');
    var bad = [];
    fields.forEach(function (f) { clearField(f); if (!f.checkValidity()) bad.push(f); });
    if (bad.length) {
      bad.forEach(markInvalid);
      show('Please check the highlighted field' + (bad.length > 1 ? 's' : '') + ' and try again.', false);
      bad[0].focus();
      return;
    }
    btn.disabled = true; show('Sending…', true);
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok && d.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok) { form.reset(); show('Thank you. Your message was sent and Dave will get back to you soon.', true); }
        else { show(MSG[res.d.error] || 'Something went wrong. Please try again or call Dave at 262-707-7288.', false); }
      })
      .catch(function () { show('Network problem. Please try again or call Dave at 262-707-7288.', false); })
      .then(function () {
        btn.disabled = false;
        if (window.turnstile) { try { widgetId !== null ? window.turnstile.reset(widgetId) : window.turnstile.reset(); } catch (_) {} }
      });
  });
})();
