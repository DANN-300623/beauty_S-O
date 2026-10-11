const SCRIPT_URL='';
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
form.addEventListener('submit',async ev=>{
ev.preventDefault();
msg.className='msg';
if(form.website.value){return}
const ime=form.ime.value.trim(),tel=form.tel.value.trim(),por=form.poruka.value.trim();
if(!ime||!tel||!por){msg.textContent='Popunite ime, telefon i poruku.';msg.className='msg er';return}
if(!form.saglasnost.checked){msg.textContent='Potvrdite saglasnost da Vas možemo kontaktirati.';msg.className='msg er';return}
if(!SCRIPT_URL){msg.textContent='Nacrt: slanje još nije povezano. Pozovite nas na telefon.';msg.className='msg er';return}
const btn=form.querySelector('button[type=submit]');
btn.disabled=true;
try{
const r=await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({ime:ime,telefon:tel,poruka:por})});
const j=await r.json();
if(j&&j.ok){msg.textContent='Hvala, poruka je poslata. Javićemo Vam se.';msg.className='msg ok';form.reset()}else{throw new Error('x')}
}catch(e){msg.textContent='Slanje nije uspelo. Pozovite nas na 065 425 2602.';msg.className='msg er'}
btn.disabled=false;
});
}
