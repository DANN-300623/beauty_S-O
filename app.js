const SCRIPT_URL='https://script.google.com/macros/s/AKfycbwBduiRA5yoGNyCkOJgpcg6xOLpyVVh6jTwUqgbQNMpXQmC2dE-iXyvkkU682ujJ4GSXA/exec';
const burger=document.getElementById('burger');
const nav=document.getElementById('nav');
if(burger&&nav){
burger.addEventListener('click',()=>{const o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false')});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');burger.setAttribute('aria-expanded','false')}));
}
const els=document.querySelectorAll('.rv');
if('IntersectionObserver' in window){
const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
els.forEach(e=>io.observe(e));
}else{els.forEach(e=>e.classList.add('in'))}
const form=document.getElementById('kform');
if(form){
const msg=document.getElementById('kmsg');
const btn=form.querySelector('button[type=submit]');
const say=(t,ok)=>{msg.textContent=t;msg.className='msg '+(ok?'ok':'er')};
const bad=el=>{el.setAttribute('aria-invalid','true');el.focus()};
form.querySelectorAll('input,textarea').forEach(el=>el.addEventListener('input',()=>el.removeAttribute('aria-invalid')));
form.addEventListener('submit',async ev=>{
ev.preventDefault();
msg.className='msg';msg.textContent='';
const f=form.elements;
const d={ime:f.ime.value.trim(),email:f.email.value.trim(),telefon:f.tel.value.trim(),poruka:f.poruka.value.trim(),saglasnost:f.saglasnost.checked,website:f.website.value};
if(d.website){say('Hvala, poruka je poslata.',true);form.reset();return}
if(d.ime.length<2){say('Upišite ime i prezime.');bad(f.ime);return}
if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)){say('Upišite ispravnu email adresu, npr. ime@gmail.com.');bad(f.email);return}
if(d.telefon&&!/^[0-9+()\/\-\s]{6,30}$/.test(d.telefon)){say('Telefon može da sadrži samo brojeve, razmake i znak +.');bad(f.tel);return}
if(d.poruka.length<2){say('Upišite poruku.');bad(f.poruka);return}
if(!d.saglasnost){say('Potvrdite saglasnost da Vas možemo kontaktirati.');bad(f.saglasnost);return}
if(!SCRIPT_URL){say('Slanje poruka trenutno ne radi. Pozovite nas na 065 425 2602 ili pišite na Viber.');return}
btn.disabled=true;const bt=btn.textContent;btn.textContent='Šaljem…';
let j=null;
try{
const ctl=new AbortController();const tm=setTimeout(()=>ctl.abort(),25000);
const r=await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(Object.assign({action:'poruka'},d)),signal:ctl.signal});
clearTimeout(tm);
j=await r.json();
}catch(e){j=null}
btn.disabled=false;btn.textContent=bt;
if(j&&j.ok){
form.reset();
if(j.klijent===false){say('Poruka je primljena, ali potvrdu na Vaš email nismo uspeli da pošaljemo. Proverite adresu – javićemo Vam se.',true)}
else{say('Hvala, poruka je poslata. Potvrdu smo poslali na Vaš email (proverite i Spam). Javićemo Vam se uskoro.',true)}
return}
const g=j&&j.greska;
if(g==='polja'){say('Proverite ime, email i poruku pa pokušajte ponovo.')}
else if(g==='saglasnost'){say('Potvrdite saglasnost da Vas možemo kontaktirati.')}
else if(g==='zauzeto'){say('Previše poruka u kratkom roku. Pokušajte za nekoliko minuta ili nas pozovite na 065 425 2602.')}
else{say('Poruka nije poslata zbog tehničke greške. Pokušajte ponovo ili nas pozovite na 065 425 2602.')}
});
}
if(SCRIPT_URL){
const ls={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
fetch(SCRIPT_URL+'?action=obavestenja').then(r=>r.json()).then(j=>{
const ob=(j&&j.ok&&Array.isArray(j.obavestenja))?j.obavestenja.filter(o=>o&&o.tekst):[];
if(!ob.length)return;
const hrs=document.querySelector('.hours');
if(hrs){const h=document.createElement('div');h.className='hnote';ob.forEach(o=>{const p=document.createElement('p');p.textContent=o.tekst;h.appendChild(p)});hrs.after(h)}
const key=ob.map(o=>o.id).join(',');
if(ls.get('note-x')===key)return;
const bar=document.createElement('div');bar.className='note';bar.setAttribute('role','status');
const t=document.createElement('p');t.textContent=ob.map(o=>o.tekst).join(' · ');
const x=document.createElement('button');x.type='button';x.setAttribute('aria-label','Zatvori obaveštenje');x.textContent='✕';
x.addEventListener('click',()=>{bar.remove();ls.set('note-x',key)});
bar.append(t,x);document.body.prepend(bar);
}).catch(()=>{});
}
const jl=[...document.querySelectorAll('.jump a')];
if(jl.length){
const gs=jl.map(a=>document.getElementById(a.getAttribute('href').slice(1)));
let lock=0;
const mark=a=>{jl.forEach(x=>x.classList.toggle('on',x===a))};
const upd=()=>{if(Date.now()<lock)return;const bar=document.querySelector('.jump');const lim=bar.getBoundingClientRect().bottom+70;let best=jl[0],bd=1e9;gs.forEach((g,i)=>{if(!g)return;const t=g.getBoundingClientRect().top;if(t>window.innerHeight*0.6)return;const d=t<=lim?lim-t:(t-lim)*3;if(d<bd){bd=d;best=jl[i]}});if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4&&gs[gs.length-1].getBoundingClientRect().top<window.innerHeight)best=jl[jl.length-1];mark(best)};
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const goTo=g=>{const off=()=>{const bar=document.querySelector('.jump');return bar.offsetHeight+document.querySelector('.hdr').offsetHeight+32};const y=()=>Math.max(0,g.getBoundingClientRect().top+window.scrollY-off());window.scrollTo({top:y(),behavior:rm?'auto':'smooth'});setTimeout(()=>{const t=y();if(Math.abs(window.scrollY-t)>12)window.scrollTo({top:t,behavior:'auto'})},750)};
jl.forEach((a,i)=>a.addEventListener('click',ev=>{const g=gs[i];if(!g)return;ev.preventDefault();mark(a);lock=Date.now()+1100;goTo(g);history.replaceState(null,'','#'+g.id)}));
const qg=new URLSearchParams(location.search).get('g')||location.hash.slice(1);
if(qg){const g=document.getElementById(qg);if(g&&gs.includes(g)){const i=gs.indexOf(g);const jump=()=>{mark(jl[i]);lock=Date.now()+600;const bar=document.querySelector('.jump');const off=bar.offsetHeight+document.querySelector('.hdr').offsetHeight+32;window.scrollTo({top:Math.max(0,g.getBoundingClientRect().top+window.scrollY-off),behavior:'instant'})};document.documentElement.style.scrollBehavior='auto';jump();window.addEventListener('load',()=>{jump();setTimeout(()=>{document.documentElement.style.scrollBehavior=''},50)})}}
window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
}
const tt=document.createElement('button');
tt.type='button';tt.className='totop';tt.setAttribute('aria-label','Nazad na vrh stranice');
tt.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
document.body.appendChild(tt);
tt.addEventListener('click',()=>{const r=matchMedia('(prefers-reduced-motion: reduce)').matches;window.scrollTo({top:0,behavior:r?'auto':'smooth'});setTimeout(()=>{if(window.scrollY>12)window.scrollTo({top:0,behavior:'auto'})},800)});
const ttu=()=>{tt.classList.toggle('show',window.scrollY>window.innerHeight*0.9)};
window.addEventListener('scroll',ttu,{passive:true});ttu();
