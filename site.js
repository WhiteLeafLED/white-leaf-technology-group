(()=>{const nav=document.getElementById('nav'),btn=document.querySelector('.menu-btn'),menu=document.getElementById('site-nav');
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const onS=()=>nav.classList.toggle('solid',scrollY>40);onS();addEventListener('scroll',onS,{passive:true});
btn.addEventListener('click',()=>{const o=menu.classList.toggle('open');btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Close menu':'Open menu')});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');btn.setAttribute('aria-expanded',false)}));
const hv=document.querySelector('.hero-video');if(rm&&hv){hv.pause();hv.removeAttribute('autoplay')}
const count=el=>{const to=+el.dataset.to,d=+(el.dataset.dec||0),t0=performance.now(),dur=1400;
const f=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);el.textContent=(to*e).toFixed(d);if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)};
if(!('IntersectionObserver' in window)||rm){document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in'));return}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');const b=e.target.querySelector('b[data-to]');if(b)count(b);io.unobserve(e.target)}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(e=>io.observe(e));})();
