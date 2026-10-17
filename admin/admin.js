const API_URL='https://script.google.com/macros/s/AKfycbwBduiRA5yoGNyCkOJgpcg6xOLpyVVh6jTwUqgbQNMpXQmC2dE-iXyvkkU682ujJ4GSXA/exec';
const $=id=>document.getElementById(id);
const ss={get:k=>{try{return sessionStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{sessionStorage.setItem(k,v)}catch(e){}},del:k=>{try{sessionStorage.removeItem(k)}catch(e){}}};
let token=ss.get('bso-t')||'';
const greske={lozinka:'Pogrešna lozinka.',blokirano:'Previše pogrešnih pokušaja. Sačekajte 15 minuta.',sesija:'Prijava je istekla. Prijavite se ponovo.',stara:'Trenutna lozinka nije tačna.',kratka:'Nova lozinka mora imati najmanje 8 znakova.',link:'Link za novu lozinku je istekao ili je već iskorišćen. Zatražite novi.',polja:'Proverite tekst i datume (datum „do“ ne sme biti pre datuma „od“).',podesavanja:'U skripti nisu upisani NOTIFY_EMAIL i ADMIN_URL, pa mejl ne može da se pošalje.',mreza:'Nema veze sa serverom. Proverite internet i pokušajte ponovo.',server:'Greška na serveru. Pokušajte ponovo za minut.',nepovezano:'Panel još nije povezan sa skriptom (API_URL je prazan).',nema:'To obaveštenje više ne postoji (možda je obrisano). Lista je osvežena.'};
const say=(el,t,ok)=>{el.textContent=t||'';el.className='msg'+(t?(ok?' ok':' er'):'')};
const err=g=>greske[g]||greske.server;
async function api(d){
if(!API_URL)return{ok:false,greska:'nepovezano'};
try{
const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(d)});
return await r.json();
}catch(e){return{ok:false,greska:'mreza'}}
}
function show(v){['v-login','v-reset','v-panel'].forEach(x=>$(x).hidden=x!==v);$('odjava').hidden=v!=='v-panel'}
function busy(f,b){const btn=f.querySelector('button[type=submit]');btn.disabled=b}
function setToken(t){token=t||'';if(token)ss.set('bso-t',token);else ss.del('bso-t')}
function izlaz(poruka){setToken('');show('v-login');if(poruka)say($('f-login').querySelector('.msg'),poruka);$('l-loz').focus()}
const fmt=s=>{const p=String(s).split('-');return p.length===3?(+p[2])+'.'+(+p[1])+'.'+p[0]+'.':s};
const stanja={aktivno:'aktivno',uskoro:'zakazano',isteklo:'isteklo'};
let editId=null;
function formaNova(){editId=null;const f=$('f-dodaj');f.querySelector('button[type=submit]').textContent='Dodaj obaveštenje';$('o-odustani').hidden=true;$('o-naslov').textContent='Novo obaveštenje';tekst.value='';$('o-br').textContent='0';$('o-od').value=danas();$('o-do').value=''}
function formaIzmena(o){editId=o.id;const f=$('f-dodaj');tekst.value=o.tekst;$('o-br').textContent=o.tekst.length;$('o-od').value=o.od;$('o-do').value=o.do;f.querySelector('button[type=submit]').textContent='Sačuvaj izmene';$('o-odustani').hidden=false;$('o-naslov').textContent='Izmena obaveštenja';say(f.querySelector('.msg'),'');$('o-naslov').scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>tekst.focus({preventScroll:true}),350)}
function crtaj(j){
if(editId&&!(j.obavestenja||[]).some(o=>o.id===editId))formaNova();
const ul=$('lista');ul.textContent='';
const ob=j.obavestenja||[];
$('prazno').hidden=ob.length>0;
ob.forEach(o=>{
const li=document.createElement('li');
const tx=document.createElement('div');tx.className='tx';
const st=document.createElement('span');st.className='st '+o.stanje;st.textContent=stanja[o.stanje]||o.stanje;
tx.append(st,document.createTextNode(o.tekst));
const dt=document.createElement('span');dt.className='dt';dt.textContent=fmt(o.od)+' – '+fmt(o.do);tx.appendChild(dt);
const ed=document.createElement('button');ed.type='button';ed.className='edit';ed.textContent='Izmeni';
ed.addEventListener('click',()=>formaIzmena(o));
const b=document.createElement('button');b.type='button';b.className='del';b.textContent='Obriši';
b.addEventListener('click',async()=>{
if(b.dataset.c!=='1'){b.dataset.c='1';b.textContent='Sigurno?';setTimeout(()=>{if(b.isConnected){b.dataset.c='';b.textContent='Obriši'}},4000);return}
b.disabled=true;b.textContent='Brišem…';
const r=await api({action:'obrisi',token:token,id:o.id});
if(r.ok)crtaj(r);else if(r.greska==='sesija')izlaz(err('sesija'));else{b.disabled=false;b.dataset.c='';b.textContent='Obriši';say($('f-dodaj').querySelector('.msg'),err(r.greska))}
});
const act=document.createElement('div');act.className='act';act.append(ed,b);
li.append(tx,act);ul.appendChild(li);
});
const pl=$('prop-lista');pl.textContent='';
const pr=j.propustene||[];
$('propustene').hidden=pr.length===0;
pr.forEach(p=>{
const li=document.createElement('li');
const tx=document.createElement('div');tx.className='tx';
const h=document.createElement('strong');h.textContent=p.ime;
const dt=document.createElement('span');dt.className='dt';dt.textContent=p.datum+' · '+p.email+(p.telefon?' · '+p.telefon:'');
const pm=document.createElement('p');pm.className='pm';pm.textContent=p.poruka;
tx.append(h,dt,pm);li.appendChild(tx);pl.appendChild(li);
});
}
async function ucitaj(){
const r=await api({action:'lista',token:token});
if(r.ok){show('v-panel');crtaj(r)}else if(r.greska==='sesija')izlaz();else{show('v-panel');say($('f-dodaj').querySelector('.msg'),err(r.greska))}
}
const danas=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function init(){
if(!API_URL){$('cfg').hidden=false}
const rt=new URLSearchParams(location.search).get('reset');
if(rt){show('v-reset');$('r-nova').focus();return}
if(token)ucitaj();else{show('v-login');$('l-loz').focus()}
}
$('f-login').addEventListener('submit',async e=>{
e.preventDefault();const f=e.target,m=f.querySelector('.msg');
const l=$('l-loz').value;if(!l){say(m,'Upišite lozinku.');return}
busy(f,true);say(m,'Proveravam…',true);
const r=await api({action:'login',lozinka:l});
busy(f,false);
if(r.ok){say(m,'');f.reset();setToken(r.token);ucitaj()}else{say(m,err(r.greska));$('l-loz').select()}
});
$('zab').addEventListener('click',async()=>{
const m=$('zab-msg');const b=$('zab');b.disabled=true;say(m,'Šaljem…',true);
const r=await api({action:'zaboravljena'});
b.disabled=false;
if(r.ok)say(m,'Ako je mejl podešen, link za novu lozinku je poslat na mejl salona. Važi 30 minuta. Proverite i Spam.',true);else say(m,err(r.greska));
});
$('f-reset').addEventListener('submit',async e=>{
e.preventDefault();const f=e.target,m=f.querySelector('.msg');
const n=$('r-nova').value,n2=$('r-nova2').value;
if(n.length<8){say(m,err('kratka'));return}
if(n!==n2){say(m,'Lozinke se ne poklapaju.');return}
busy(f,true);
const r=await api({action:'reset',reset:new URLSearchParams(location.search).get('reset'),nova:n});
busy(f,false);
if(r.ok){f.reset();history.replaceState(null,'',location.pathname);setToken(r.token);ucitaj()}else say(m,err(r.greska));
});
const tekst=$('o-tekst');
tekst.addEventListener('input',()=>{$('o-br').textContent=tekst.value.length});
$('o-od').value=danas();
$('o-od').addEventListener('change',()=>{if(!$('o-do').value||$('o-do').value<$('o-od').value)$('o-do').value=$('o-od').value});
$('f-dodaj').addEventListener('submit',async e=>{
e.preventDefault();const f=e.target,m=f.querySelector('.msg');
const d={action:editId?'izmeni':'dodaj',token:token,tekst:tekst.value.trim(),od:$('o-od').value,do:$('o-do').value};
if(editId)d.id=editId;
const bila=!!editId;
if(d.tekst.length<3){say(m,'Upišite tekst obaveštenja.');tekst.focus();return}
if(!d.od||!d.do){say(m,'Izaberite oba datuma.');return}
if(d.do<d.od){say(m,err('polja'));return}
busy(f,true);
const r=await api(d);
busy(f,false);
if(r.ok){formaNova();crtaj(r);say(m,(bila?'Izmena je sačuvana.':'Obaveštenje je dodato.')+' Na sajtu se vidi za najviše 5 minuta.',true)}
else if(r.greska==='sesija')izlaz(err('sesija'));
else if(r.greska==='nema'){formaNova();crtaj(r);say(m,err('nema'))}
else say(m,err(r.greska));
});
$('o-odustani').addEventListener('click',()=>{formaNova();say($('f-dodaj').querySelector('.msg'),'')
});
$('f-sifra').addEventListener('submit',async e=>{
e.preventDefault();const f=e.target,m=f.querySelector('.msg');
const s=$('s-stara').value,n=$('s-nova').value,n2=$('s-nova2').value;
if(!s){say(m,'Upišite trenutnu lozinku.');return}
if(n.length<8){say(m,err('kratka'));return}
if(n!==n2){say(m,'Nove lozinke se ne poklapaju.');return}
busy(f,true);
const r=await api({action:'sifra',token:token,stara:s,nova:n});
busy(f,false);
if(r.ok){f.reset();setToken(r.token);say(m,'Lozinka je promenjena. Od sada važi samo nova.',true)}
else if(r.greska==='sesija')izlaz(err('sesija'));else say(m,err(r.greska));
});
$('odjava').addEventListener('click',()=>{api({action:'odjava',token:token});izlaz()});
init();
