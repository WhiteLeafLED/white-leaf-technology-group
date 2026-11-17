/* White Leaf — primary navigation (shared by index.html and privacy.html).
   Mobile menu button, touch-friendly dropdowns, Escape / tap-outside to close. */
(()=>{
const btn=document.querySelector('.menu-btn');
const menu=document.getElementById('site-nav');
if(!btn||!menu) return;
const narrow=matchMedia('(max-width:900px)');

const closeDropdowns=()=>{
  menu.querySelectorAll('.dd.open').forEach(d=>d.classList.remove('open'));
  menu.querySelectorAll('.dd-top').forEach(t=>t.setAttribute('aria-expanded','false'));
};
const setOpen=o=>{
  menu.classList.toggle('open',o);
  btn.setAttribute('aria-expanded',String(o));
  btn.setAttribute('aria-label',o?'Close menu':'Open menu');
  if(!o) closeDropdowns();
};
btn.addEventListener('click',()=>setOpen(!menu.classList.contains('open')));

menu.querySelectorAll('a:not(.dd-top)').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
menu.querySelectorAll('.dd-top').forEach(t=>{
  t.setAttribute('aria-expanded','false');
  t.addEventListener('click',e=>{
    const d=t.parentElement;
    if(narrow.matches && !d.classList.contains('open')){
      e.preventDefault();
      closeDropdowns();
      d.classList.add('open');
      t.setAttribute('aria-expanded','true');
      return;
    }
    setOpen(false);
  });
});

/* Escape closes the open mobile menu (focus goes back to the menu button)
   and dismisses a hover/focus dropdown on desktop. */
addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  if(menu.classList.contains('open')){
    setOpen(false);
    btn.focus();
    return;
  }
  const dd=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.dd');
  const hov=menu.querySelector('.dd:hover');
  const target=dd||hov;
  if(target){
    target.classList.add('dismissed');
    const top=target.querySelector('.dd-top');
    if(dd&&top&&document.activeElement!==top) top.focus();
  }
});
menu.querySelectorAll('.dd').forEach(d=>{
  const clear=()=>d.classList.remove('dismissed');
  d.addEventListener('mouseleave',clear);
  d.addEventListener('focusout',e=>{ if(!d.contains(e.relatedTarget)) clear(); });
});

/* Tap outside the open mobile menu closes it. */
document.addEventListener('click',e=>{
  if(!menu.classList.contains('open')) return;
  if(menu.contains(e.target)||btn.contains(e.target)) return;
  setOpen(false);
});
/* Rotating to a wide screen: reset the mobile state. */
narrow.addEventListener('change',()=>{ if(!narrow.matches) setOpen(false); });
})();
