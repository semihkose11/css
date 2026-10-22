/* Gemi Bileşen Kaydı — Supabase sürümü */
const CATS=[
 {key:'kamera',label:'Kameralar',one:'Kamera',fields:[['ip','IP adresi'],['resolution','Çözünürlük'],['lens','Lens / görüş açısı'],['mount','Montaj tipi',['Tavan','Duvar','Direk','Gömme','Diğer']]]},
 {key:'kablo',label:'Kablolar',one:'Kablo',fields:[['cableType','Kablo tipi',['Cat6','Cat6A','Cat7','Fiber (SM)','Fiber (MM)','Koaksiyel','Enerji','Kontrol','Diğer']],['length','Uzunluk (m)','number'],['label','Kablo etiketi'],['from','Başlangıç noktası'],['to','Bitiş noktası']]},
 {key:'ag',label:'Ağ cihazları',one:'Ağ cihazı',fields:[['ip','IP adresi'],['ports','Port sayısı','number'],['rack','Kabin / rack']]},
 {key:'ekran',label:'Ekranlar',one:'Ekran',fields:[['size','Boyut (inç)','number'],['resolution','Çözünürlük'],['input','Giriş tipi']]},
 {key:'sensor',label:'Sensörler',one:'Sensör',fields:[['sensorType','Sensör tipi'],['range','Ölçüm aralığı']]},
 {key:'diger',label:'Diğer',one:'Bileşen',fields:[['kind','Bileşen türü']]}
];
const CAT=Object.fromEntries(CATS.map(c=>[c.key,c]));
const STATUS=[['ok','Sağlam','good'],['test','Test edildi','good'],['wait','Montaj bekliyor','info'],['fault','Arızalı','bad'],['replace','Değişecek','warn']];
const ST=Object.fromEntries(STATUS.map(s=>[s[0],s]));
const ANGLES=['Genel görünüm','Ön','Arka','Sol','Sağ','Üst','Alt','Bağlantı noktası','Etiket / seri no','Montaj yeri','Detay'];
const COMMON=[['name','Ad / tanım'],['code','Envanter kodu'],['brand','Marka'],['model','Model'],['serial','Seri no']];
const LOC=[['deck','Güverte (Deck)'],['mvz','Dikey bölge (MVZ)',['MVZ 1','MVZ 2','MVZ 3','MVZ 4','MVZ 5','MVZ 6','MVZ 7','MVZ 8']],['frame','Frame no'],['room','Mahal / kabin no']];
const DATA_KEYS=[...new Set([...COMMON,...LOC,...CATS.flatMap(c=>c.fields)].map(f=>f[0]).concat(['date','tech','note']))];

const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=t=>t?new Date(t).toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric'}):'';
const fmtDT=t=>t?new Date(t).toLocaleString('tr-TR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2800)}
const who=e=>e?(S.people&&S.people[e])||e:'—';

/* ---------- config ---------- */
function getCfg(){
  const c=window.APP_CONFIG||{};let url=c.SUPABASE_URL,key=c.SUPABASE_ANON_KEY;
  if(!url||!key){try{const s=JSON.parse(localStorage.getItem('gbk_cfg')||'{}');url=url||s.url;key=key||s.key}catch{}}
  return url&&key?{url,key}:null;
}
let sb=null, session=null;
const S={view:'home',projects:[],counts:{},pid:null,items:[],cat:'kamera',q:'',status:'',deck:'',loaded:false};
let modal=null, channel=null, reloadTimer=null;
const proj=()=>S.projects.find(p=>p.id===S.pid);
const photoUrl=p=>p.preview||sb.storage.from('photos').getPublicUrl(p.path).data.publicUrl;

(async function boot(){
  const cfg=getCfg();
  if(!cfg||!window.supabase){renderSetup(!window.supabase);return}
  sb=window.supabase.createClient(cfg.url,cfg.key);
  const {data}=await sb.auth.getSession();session=data.session;
  sb.auth.onAuthStateChange((_e,s)=>{const was=!!session;session=s;if(!!s!==was){s?start():renderLogin()}});
  session?start():renderLogin();
})();

function renderSetup(libFail){
  $('#app').innerHTML=`<div class="auth"><div class="eyebrow">Kurulum</div><h2>Supabase bağlantısı</h2>
  ${libFail?'<p class="banner">Supabase kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.</p>':''}
  <p class="muted" style="margin:0">config.js dosyasına Supabase adresini ve anon key'i yazın ya da burada girin (bu tarayıcıya kaydedilir).</p>
  <label class="f" for="cfgUrl">Project URL<input id="cfgUrl" placeholder="https://xxxx.supabase.co"></label>
  <label class="f" for="cfgKey">anon public key<input id="cfgKey"></label>
  <button class="btn primary" id="cfgSave">Kaydet</button></div>`;
  $('#cfgSave').onclick=()=>{try{localStorage.setItem('gbk_cfg',JSON.stringify({url:$('#cfgUrl').value.trim(),key:$('#cfgKey').value.trim()}))}catch{}location.reload()};
}
function renderLogin(msg){
  $('#settingsBtn').hidden=true;$('#navBtn').hidden=true;S.me=null;$('#userBar').textContent='';$('#backBtn').hidden=true;modal=null;renderModal();
  $('header.app').hidden=true;
  $('#app').innerHTML=`<form id="loginForm" style="max-width:320px;margin:22vh auto 0;display:flex;flex-direction:column;gap:12px">
  ${msg?`<div class="banner">${esc(msg)}</div>`:''}
  <input id="lEmail" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="Kullanıcı adı" aria-label="Kullanıcı adı" required>
  <input id="lPass" type="password" autocomplete="current-password" placeholder="Şifre" aria-label="Şifre" required>
  <button class="btn primary" type="submit" style="justify-content:center">Giriş yap</button></form>`;
  const em=()=>$('#lEmail').value.trim(),pw=()=>$('#lPass').value;
  $('#loginForm').onsubmit=async e=>{e.preventDefault();const u=em();let email=u;
    if(!u.includes('@')){const {data}=await sb.rpc('login_email',{p_username:u});email=data||(u.toLowerCase()+'@kullanici.local')}
    const {error}=await sb.auth.signInWithPassword({email,password:pw()});if(error)renderLogin(error.message==='Invalid login credentials'?'Kullanıcı adı veya şifre hatalı.':/banned/i.test(error.message)?'Bu hesap kullanıma kapalı. Yöneticinizle görüşün.':error.message)};
}

async function start(){
  const {data:me}=await sb.from('profiles').select('*').eq('id',session.user.id).maybeSingle();
  if(!me||!me.active){await sb.auth.signOut();renderLogin('Bu hesap kullanıma kapalı. Yöneticinizle görüşün.');return}
  S.me=me;$('header.app').hidden=false;await loadPeople();
  $('#settingsBtn').hidden=false;$('#navBtn').hidden=false;$('#userBar').textContent=me.full_name||me.username||'';
  await loadProjects();
  if(channel)sb.removeChannel(channel);
  channel=sb.channel('db').on('postgres_changes',{event:'*',schema:'public',table:'projects'},queueReload)
    .on('postgres_changes',{event:'*',schema:'public',table:'items'},queueReload).subscribe();
}
function queueReload(){clearTimeout(reloadTimer);reloadTimer=setTimeout(async()=>{await loadProjects();if(S.pid)await loadItems()},400)}

/* ---------- data ---------- */
function fromRow(r){return {...(r.data||{}),id:r.id,category:r.category,status:r.status||'',photos:r.photos||[],createdAt:r.created_at,updatedAt:r.updated_at,createdBy:r.created_by_email,updatedBy:r.updated_by_email}}
function fromProject(r){return {id:r.id,name:r.name,ship:r.ship,client:r.client,port:r.port,start:r.start||'',note:r.note,done:r.done,createdAt:r.created_at,updatedAt:r.updated_at}}
async function loadProjects(){
  const [{data:ps,error:e1},{data:its,error:e2}]=await Promise.all([
    sb.from('projects').select('*').order('created_at',{ascending:false}),
    sb.from('items').select('project_id,category').limit(10000)]);
  if(e1){S.err='Projeler okunamadı: '+e1.message;S.loaded=true;render();return}
  S.err=e2?'Sayımlar okunamadı: '+e2.message:'';
  S.projects=(ps||[]).map(fromProject);S.counts={};
  for(const i of its||[]){const c=S.counts[i.project_id]||(S.counts[i.project_id]={});c[i.category]=(c[i.category]||0)+1}
  S.loaded=true;if(S.pid&&!proj())leaveProject();render();
}
async function loadItems(){
  const {data,error}=await sb.from('items').select('*').eq('project_id',S.pid).order('created_at',{ascending:false}).limit(2000);
  if(error){toast('Bileşenler okunamadı: '+error.message);return}
  S.items=data.map(fromRow);S.itemsLoaded=true;
  if(modal?.type==='detail'&&!S.items.find(i=>i.id===modal.id))modal=null;
  render();if(modal?.type==='detail')renderModal();
}
async function openProject(id){S.pid=id;S.view='project';S.items=[];S.q='';S.status='';S.deck='';S.itemsLoaded=false;render();window.scrollTo(0,0);await loadItems()}
function leaveProject(){S.view='projects';S.pid=null;S.items=[];modal=null;renderModal();render()}
$('#backBtn').onclick=leaveProject;

/* ---------- render ---------- */
function render(){
  if(!session)return;
  const app=$('#app');
  $('#backBtn').hidden=S.view!=='project';
  $('#hdrSub').textContent=S.view==='project'&&proj()?(proj().ship||proj().name):'Kamera · kablo · ağ cihazı envanteri';
  let h='';if(S.err)h+=`<div class="banner">${esc(S.err)}</div>`;
  h+=S.view==='home'?'':S.view==='settings'?renderSettings():S.view==='users'?renderUsers():S.view==='projects'?renderProjects():renderProject();
  const ae=document.activeElement,aid=ae?.id,pos=ae?.selectionStart;
  app.innerHTML=h;
  if(aid){const el=document.getElementById(aid);if(el){el.focus();try{if(pos!=null)el.setSelectionRange(pos,pos)}catch{}}}
}
function countsChips(c){c=c||{};const parts=CATS.filter(k=>c[k.key]).map(k=>`<span class="chip"><b>${c[k.key]}</b> ${esc(k.label.toLocaleLowerCase('tr'))}</span>`);return parts.length?parts.join(''):'<span class="chip">Henüz bileşen yok</span>'}
function renderProjects(){
  let h=`<div class="phead"><div><div class="eyebrow">Projeler</div><h1>Gemi projeleri</h1>
  <p class="muted" style="margin:4px 0 0;max-width:60ch">Her proje bir gemi ya da iş paketidir. Projeye girip kameraları, kabloları ve diğer bileşenleri ayrı sekmelerde, fotoğraflarıyla kaydedin.</p></div>
  <button class="btn primary" data-act="newProject">+ Yeni proje</button></div>`;
  if(!S.loaded)return h+'<p class="muted">Yükleniyor…</p>';
  if(!S.projects.length)return h+`<div class="empty"><h3>Henüz proje yok</h3><p>“Yeni proje” ile ilk gemi projesini oluşturun. Örneğin: gemi adı, tersane ve başlangıç tarihi.</p></div>`;
  h+='<div class="pgrid">';
  for(const p of S.projects){const c=S.counts[p.id]||{};const total=Object.values(c).reduce((a,b)=>a+b,0);
    h+=`<button class="pcard" data-act="openProject" data-id="${esc(p.id)}"><div><div class="ship">${esc(p.ship||'Gemi adı yok')}</div><h2>${esc(p.name)}</h2></div>
      <div class="counts">${countsChips(c)}</div>
      <div class="meta"><span>${total} kayıt</span>${p.port?`<span>${esc(p.port)}</span>`:''}<span>${p.done?'Tamamlandı':'Devam ediyor'}</span>${p.updatedAt?`<span>Güncelleme: ${fmtDate(p.updatedAt)}</span>`:''}</div></button>`}
  return h+'</div>';
}
function filtered(){
  const q=S.q.trim().toLocaleLowerCase('tr');
  return S.items.filter(i=>i.category===S.cat&&(!S.status||i.status===S.status)&&(!S.deck||String(i.deck||'')===S.deck)&&(!q||[i.name,i.code,i.serial,i.brand,i.model,i.room,i.label,i.ip,i.from,i.to,i.note].join(' ').toLocaleLowerCase('tr').includes(q)));
}
function renderProject(){
  const p=proj();if(!p)return '<p class="muted">Proje bulunamadı.</p>';
  const counts={};for(const i of S.items)counts[i.category]=(counts[i.category]||0)+1;
  const cat=CAT[S.cat];
  let h=`<div class="phead"><div style="min-width:0"><div class="eyebrow">${esc(p.ship||'Proje')}</div><h1>${esc(p.name)}</h1>
   <div class="meta">${p.client?`<span>Firma: <b>${esc(p.client)}</b></span>`:''}${p.port?`<span>Liman/tersane: <b>${esc(p.port)}</b></span>`:''}${p.start?`<span>Başlangıç: <b>${fmtDate(p.start)}</b></span>`:''}<span>Toplam: <b>${S.items.length}</b> kayıt</span></div></div>
   <div class="row"><button class="btn sm" data-act="editProject">Proje bilgileri</button><button class="btn sm" data-act="exportXlsx">Excel</button><button class="btn sm" data-act="exportCsv">CSV</button><button class="btn sm" data-act="exportPdf">PDF rapor</button></div></div>
   ${p.note?`<p class="muted" style="margin:10px 0 0;max-width:70ch;white-space:pre-wrap">${esc(p.note)}</p>`:''}
   <div class="tabs" role="tablist">${CATS.map(c=>`<button class="tab" role="tab" aria-selected="${c.key===S.cat}" data-act="tab" data-id="${c.key}">${esc(c.label)}<span class="n">${counts[c.key]||0}</span></button>`).join('')}</div>`;
  const decks=[...new Set(S.items.filter(i=>i.category===S.cat&&i.deck).map(i=>String(i.deck)))].sort((a,b)=>a.localeCompare(b,'tr',{numeric:true}));
  h+=`<div class="toolbar"><input id="q" type="search" placeholder="Ara: ad, kod, seri no, mahal…" value="${esc(S.q)}" data-in="q">
   <select id="fs" data-in="status"><option value="">Tüm durumlar</option>${STATUS.map(s=>`<option value="${s[0]}" ${S.status===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select>
   <select id="fd" data-in="deck"><option value="">Tüm güverteler</option>${decks.map(d=>`<option ${S.deck===d?'selected':''}>${esc(d)}</option>`).join('')}</select>
   <button class="btn primary" data-act="newItem">+ ${esc(cat.one)} ekle</button></div>`;
  if(!S.itemsLoaded)return h+'<p class="muted">Yükleniyor…</p>';
  const list=filtered();
  if(!list.length){const any=S.items.some(i=>i.category===S.cat);
    return h+`<div class="empty"><h3>${any?'Filtreye uyan kayıt yok':esc(cat.label)+' için kayıt yok'}</h3><p>${any?'Aramayı veya filtreleri temizleyin.':`“${esc(cat.one)} ekle” ile ilk kaydı oluşturun; farklı açılardan fotoğraf çekip bilgilerini girin.`}</p></div>`}
  h+='<div class="list">';
  for(const i of list){const ph=i.photos?.[0];const st=ST[i.status];
    const loc=[i.deck&&('Deck '+i.deck),i.mvz,i.frame&&('Fr. '+i.frame),i.room].filter(Boolean).join(' · ');
    const extra=S.cat==='kablo'?[i.cableType,i.length&&(i.length+' m'),(i.from||i.to)&&`${i.from||'?'} → ${i.to||'?'}`].filter(Boolean).join(' · '):[i.brand,i.model].filter(Boolean).join(' ');
    h+=`<button class="item" data-act="openItem" data-id="${esc(i.id)}">
      ${ph?`<img class="thumb" src="${esc(photoUrl(ph))}" alt="" loading="lazy">`:`<span class="thumb">foto yok</span>`}
      <span class="t"><span class="nm">${esc(i.name||'(adsız)')}</span> ${i.code?`<span class="code muted">${esc(i.code)}</span>`:''}
        <span class="sub" style="display:block">${esc(extra)}${extra&&loc?' — ':''}${esc(loc)}</span>
        <span class="sub" style="display:block">${(i.photos||[]).length} fotoğraf · ${fmtDate(i.updatedAt||i.createdAt)}</span></span>
      <span class="status s-${st?st[2]:'none'}">${st?st[1]:'Durum yok'}</span></button>`}
  return h+'</div>';
}

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const id=b.dataset.id;
  switch(b.dataset.act){
    case 'newProject':modal={type:'project',data:{}};break;
    case 'editProject':modal={type:'project',data:{...proj()}};break;
    case 'openProject':openProject(id);return;
    case 'tab':S.cat=id;S.status='';S.deck='';render();return;
    case 'newItem':modal={type:'item',data:{category:S.cat,photos:[]}};break;
    case 'openItem':modal={type:'detail',id};break;
    case 'editItem':{const it=S.items.find(i=>i.id===modal.id);modal={type:'item',data:JSON.parse(JSON.stringify(it))};break}
    case 'close':modal=null;break;
    case 'saveProject':saveProject();return;
    case 'saveItem':saveItem();return;
    case 'askDelete':modal.confirm=true;break;
    case 'cancelDelete':modal.confirm=false;break;
    case 'delItem':deleteItem();return;
    case 'delProject':deleteProject();return;
    case 'rmPhoto':modal.data.photos.splice(+b.dataset.i,1);break;
    case 'lb':openLightbox(+b.dataset.i);return;
    case 'exportCsv':exportCsv();return;
    case 'exportXlsx':exportXlsx();return;
    case 'exportPdf':exportPdf();return;
    default:if(!userAct(b.dataset.act,id))return;
  }
  renderModal();
});
document.addEventListener('input',e=>{
  const k=e.target.dataset.in;if(k){S[k]=e.target.value;render();return}
  const f=e.target.dataset.f;if(f&&modal?.data){modal.data[f]=e.target.type==='checkbox'?e.target.checked:e.target.value}
  const a=e.target.dataset.angle;if(a!=null&&modal?.data){modal.data.photos[+a].angle=e.target.value}
});
document.addEventListener('change',e=>{
  if(e.target.matches('input[type=file][data-photo]')){addPhotos([...e.target.files]);e.target.value=''}
  else if(e.target.dataset.f&&modal?.data){modal.data[e.target.dataset.f]=e.target.type==='checkbox'?e.target.checked:e.target.value}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if($('.lightbox')){$('.lightbox').remove();return}if(modal&&!modal.busy){modal=null;renderModal()}}});

/* ---------- modals ---------- */
function field(key,label,opt,data,full){
  const v=data[key]??'';const id='f_'+key;let ctl;
  if(Array.isArray(opt))ctl=`<select id="${id}" data-f="${key}"><option value="">—</option>${opt.map(o=>`<option ${v===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
  else if(opt==='textarea')ctl=`<textarea id="${id}" data-f="${key}">${esc(v)}</textarea>`;
  else ctl=`<input id="${id}" data-f="${key}" type="${opt==='number'?'number':opt==='date'?'date':'text'}" ${opt==='number'?'inputmode="decimal" step="any"':''} value="${esc(v)}">`;
  return `<label class="f${full?' full':''}" for="${id}">${esc(label)}${ctl}</label>`;
}
function renderModal(){
  const L=$('#layer');
  if(!modal){L.innerHTML='';document.body.style.overflow='';return}
  document.body.style.overflow='hidden';
  const keepScroll=L.querySelector('.overlay')?.scrollTop||0;let h='';
  if(modal.type==='project'){
    const d=modal.data,isNew=!d.id;
    h=`<div class="sheet-h"><h2 class="grow">${isNew?'Yeni proje':'Proje bilgileri'}</h2><button class="btn sm" data-act="close">Kapat</button></div>
    <div class="sheet-b"><fieldset><legend>Proje</legend><div class="fgrid">
      ${field('name','Proje adı *',null,d,true)}${field('ship','Gemi adı',null,d)}${field('client','Firma / müşteri',null,d)}${field('port','Liman / tersane',null,d)}${field('start','Başlangıç tarihi','date',d)}
      ${field('note','Notlar','textarea',d,true)}
      <label class="f full" style="flex-direction:row;align-items:center;gap:8px;color:var(--ink)"><input type="checkbox" id="f_done" data-f="done" style="width:auto" ${d.done?'checked':''}> Proje tamamlandı</label>
    </div></fieldset>
    ${!isNew&&isAdmin()?(modal.confirm?`<div class="confirm"><b>Bu proje ve içindeki ${S.items.length} kayıt kalıcı olarak silinsin mi?</b><div class="row"><button class="btn danger solid" data-act="delProject">Evet, sil</button><button class="btn" data-act="cancelDelete">Vazgeç</button></div></div>`:`<div><button class="btn danger sm" data-act="askDelete">Projeyi sil</button></div>`):''}
    </div><div class="sheet-f"><button class="btn" data-act="close">Vazgeç</button><button class="btn primary" data-act="saveProject" ${modal.busy?'disabled':''}>${modal.busy?'Kaydediliyor…':'Kaydet'}</button></div>`;
  } else if(modal.type==='item'){
    const d=modal.data,c=CAT[d.category],isNew=!d.id;const uploading=(d.photos||[]).some(p=>p.pending);
    h=`<div class="sheet-h"><div class="grow"><div class="eyebrow">${esc(c.one)}</div><h2>${isNew?'Yeni kayıt':'Kaydı düzenle'}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
    <div class="sheet-b">
     <fieldset><legend>Fotoğraflar</legend>
       <div class="row" style="margin-bottom:12px">
         <label class="btn primary" for="camIn">Fotoğraf çek</label><input id="camIn" type="file" accept="image/*" capture="environment" data-photo hidden>
         <label class="btn" for="galIn">Galeriden seç</label><input id="galIn" type="file" accept="image/*" multiple data-photo hidden>
         <span class="muted" style="font-size:13px">Her fotoğrafın açısını seçin.</span></div>
       <div class="photos">${(d.photos||[]).map((p,i)=>`<div class="ph">${p.pending?`<div class="ph-img">Yükleniyor…</div>`:`<img src="${esc(photoUrl(p))}" alt="${esc(p.angle||'')}">`}
         <div class="ctrl"><select data-angle="${i}" aria-label="Açı">${ANGLES.map(a=>`<option ${p.angle===a?'selected':''}>${a}</option>`).join('')}</select><button class="x" data-act="rmPhoto" data-i="${i}" aria-label="Fotoğrafı kaldır">×</button></div></div>`).join('')}</div>
       ${!(d.photos||[]).length?'<p class="muted" style="margin:0;font-size:13px">Henüz fotoğraf yok. Önden, arkadan, bağlantı noktasından ve etiketten çekmeniz önerilir.</p>':''}
     </fieldset>
     <fieldset><legend>Temel bilgiler</legend><div class="fgrid">${COMMON.map(([k,l])=>field(k,l+(k==='name'?' *':''),null,d,k==='name')).join('')}${c.fields.map(([k,l,o])=>field(k,l,o,d)).join('')}</div></fieldset>
     <fieldset><legend>Konum</legend><div class="fgrid">${LOC.map(([k,l,o])=>field(k,l,o,d)).join('')}</div></fieldset>
     <fieldset><legend>Durum ve not</legend><div class="fgrid">
       <label class="f" for="f_status">Durum<select id="f_status" data-f="status"><option value="">—</option>${STATUS.map(s=>`<option value="${s[0]}" ${d.status===s[0]?'selected':''}>${s[1]}</option>`).join('')}</select></label>
       ${field('date','Kontrol / montaj tarihi','date',d)}${field('tech','Teknisyen',null,d)}
       ${field('note','Açıklama / not','textarea',d,true)}</div></fieldset>
    </div>
    <div class="sheet-f"><button class="btn" data-act="close">Vazgeç</button><button class="btn primary" data-act="saveItem" ${modal.busy||uploading?'disabled':''}>${modal.busy?'Kaydediliyor…':uploading?'Fotoğraflar yükleniyor…':'Kaydet'}</button></div>`;
  } else if(modal.type==='detail'){
    const i=S.items.find(x=>x.id===modal.id);if(!i){modal=null;return renderModal()}
    const c=CAT[i.category],st=ST[i.status];
    const dl=pairs=>`<dl class="dl">${pairs.filter(([,v])=>v!==''&&v!=null).map(([l,v])=>`<div><dt>${esc(l)}</dt><dd>${esc(v)}</dd></div>`).join('')||'<span class="muted">—</span>'}</dl>`;
    h=`<div class="sheet-h"><div class="grow" style="min-width:0"><div class="eyebrow">${esc(c.one)}${i.code?' · '+esc(i.code):''}</div><h2 style="overflow-wrap:anywhere">${esc(i.name||'(adsız)')}</h2></div><span class="status s-${st?st[2]:'none'}">${st?st[1]:'Durum yok'}</span><button class="btn sm" data-act="close">Kapat</button></div>
    <div class="sheet-b">
      ${(i.photos||[]).length?`<div class="photos">${i.photos.map((p,k)=>`<div class="ph"><button class="open" data-act="lb" data-i="${k}"><img src="${esc(photoUrl(p))}" alt="${esc(p.angle)}" loading="lazy"></button><div class="cap">${esc(p.angle||'')}</div></div>`).join('')}</div>`:'<p class="muted" style="margin:0">Fotoğraf yok.</p>'}
      <div><h3 style="margin-bottom:8px">Bilgiler</h3>${dl([...COMMON.slice(1),...c.fields].map(([k,l])=>[l,i[k]]))}</div>
      <div><h3 style="margin-bottom:8px">Konum</h3>${dl(LOC.map(([k,l])=>[l,i[k]]))}</div>
      <div><h3 style="margin-bottom:8px">Durum</h3>${dl([['Kontrol / montaj tarihi',i.date?fmtDate(i.date):''],['Teknisyen',i.tech],['Kaydeden',who(i.createdBy)],['Kayıt tarihi',fmtDT(i.createdAt)],['Son güncelleme',i.updatedAt?fmtDT(i.updatedAt)+' — '+who(i.updatedBy):'']])}</div>
      ${i.note?`<div><h3 style="margin-bottom:8px">Not</h3><div class="note">${esc(i.note)}</div></div>`:''}
      ${modal.confirm?`<div class="confirm"><b>Bu kayıt ve fotoğrafları kalıcı olarak silinsin mi?</b><div class="row"><button class="btn danger solid" data-act="delItem">Evet, sil</button><button class="btn" data-act="cancelDelete">Vazgeç</button></div></div>`:''}
    </div>
    <div class="sheet-f"><button class="btn danger" data-act="askDelete">Sil</button><span class="grow"></span><button class="btn primary" data-act="editItem">Düzenle</button></div>`;
  } else h=userModalHtml();
  L.innerHTML=`<div class="overlay"><div class="sheet" role="dialog" aria-modal="true">${h}</div></div>`;
  const ov=L.querySelector('.overlay');ov.scrollTop=keepScroll;
  ov.addEventListener('click',e=>{if(e.target===ov&&!modal?.busy&&modal.type==='detail'){modal=null;renderModal()}});
}
function openLightbox(k){
  const i=S.items.find(x=>x.id===modal.id);const ps=i.photos;let n=k;
  const lb=document.createElement('div');lb.className='lightbox';
  const draw=()=>{lb.innerHTML=`<img src="${esc(photoUrl(ps[n]))}" alt=""><div class="cap">${esc(ps[n].angle||'')} — ${n+1}/${ps.length}</div><div class="row"><button data-l="-1">‹ Önceki</button><button data-l="0">Kapat</button><button data-l="1">Sonraki ›</button></div>`};
  draw();lb.onclick=e=>{const d=e.target.dataset.l;if(d==null){if(e.target===lb)lb.remove();return}if(d==='0'){lb.remove();return}n=(n+ +d+ps.length)%ps.length;draw()};
  document.body.appendChild(lb);
}

/* ---------- photos ---------- */
async function compress(file){
  const img=await new Promise((res,rej)=>{const u=URL.createObjectURL(file);const im=new Image();im.onload=()=>res(im);im.onerror=rej;im.src=u});
  const max=1600,sc=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
  const cv=document.createElement('canvas');cv.width=Math.round(img.naturalWidth*sc);cv.height=Math.round(img.naturalHeight*sc);
  cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);URL.revokeObjectURL(img.src);
  return new Promise(r=>cv.toBlob(r,'image/jpeg',.82));
}
const uid=()=>(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));
async function addPhotos(files){
  if(!modal?.data)return;const d=modal.data;const used=new Set(d.photos.map(p=>p.angle));
  for(const f of files){
    const angle=ANGLES.find(a=>!used.has(a))||'Detay';used.add(angle);
    const ph={pending:true,angle};d.photos.push(ph);renderModal();
    try{const blob=await compress(f);const path=`${S.pid}/${uid()}.jpg`;
      const {error}=await sb.storage.from('photos').upload(path,blob,{contentType:'image/jpeg'});if(error)throw error;
      ph.path=path;ph.preview=URL.createObjectURL(blob);delete ph.pending}
    catch(e){d.photos.splice(d.photos.indexOf(ph),1);toast('Fotoğraf yüklenemedi: '+(e?.message||'hata'))}
    if(modal?.data===d)renderModal();
  }
}
const rmFiles=paths=>paths.length&&sb.storage.from('photos').remove(paths).catch(()=>{});

/* ---------- saves ---------- */
async function saveProject(){
  const d=modal.data;if(!String(d.name||'').trim()){toast('Proje adı gerekli.');$('#f_name')?.focus();return}
  modal.busy=true;renderModal();
  const body={name:d.name.trim(),ship:d.ship||'',client:d.client||'',port:d.port||'',start:d.start||null,note:d.note||'',done:!!d.done,updated_at:new Date().toISOString()};
  const q=d.id?sb.from('projects').update(body).eq('id',d.id).select().single():sb.from('projects').insert(body).select().single();
  const {data,error}=await q;
  if(error){modal.busy=false;renderModal();toast('Kaydedilemedi: '+error.message);return}
  modal=null;renderModal();await loadProjects();
  if(!d.id){openProject(data.id);toast('Proje oluşturuldu.')}else toast('Proje kaydedildi.');
}
async function touchProject(){await sb.from('projects').update({updated_at:new Date().toISOString()}).eq('id',S.pid)}
async function saveItem(){
  const d=modal.data;if(!String(d.name||'').trim()){toast('Ad / tanım gerekli.');$('#f_name')?.focus();return}
  modal.busy=true;renderModal();
  const before=d.id?S.items.find(i=>i.id===d.id):null;
  const photos=d.photos.filter(p=>p.path).map(p=>({path:p.path,angle:p.angle||''}));
  const data={};for(const k of DATA_KEYS)if(d[k]!=null&&d[k]!=='')data[k]=k==='name'?String(d[k]).trim():d[k];
  const email=session.user.email||'';
  const body={project_id:S.pid,category:d.category,status:d.status||'',data,photos,updated_at:new Date().toISOString(),updated_by_email:email};
  const q=d.id?sb.from('items').update(body).eq('id',d.id).select().single():sb.from('items').insert(body).select().single();
  const {data:row,error}=await q;
  if(error){modal.busy=false;renderModal();toast('Kaydedilemedi: '+error.message);return}
  if(before){const keep=new Set(photos.map(p=>p.path));rmFiles((before.photos||[]).map(p=>p.path).filter(p=>!keep.has(p)))}
  await touchProject();await loadItems();loadProjects();
  modal={type:'detail',id:row.id};renderModal();toast('Kayıt kaydedildi.');
}
async function deleteItem(){
  const i=S.items.find(x=>x.id===modal.id);if(!i)return;modal.busy=true;
  const {error}=await sb.from('items').delete().eq('id',i.id);
  if(error){modal.busy=false;toast('Silinemedi: '+error.message);return}
  rmFiles((i.photos||[]).map(p=>p.path));modal=null;renderModal();await loadItems();loadProjects();toast('Kayıt silindi.');
}
async function deleteProject(){
  const pid=modal.data.id;modal.busy=true;renderModal();
  const paths=S.items.flatMap(i=>(i.photos||[]).map(p=>p.path));
  const {error}=await sb.from('projects').delete().eq('id',pid);
  if(error){modal.busy=false;renderModal();toast('Silinemedi: '+error.message);return}
  rmFiles(paths);modal=null;leaveProject();await loadProjects();toast('Proje silindi.');
}

/* ---------- exports ---------- */
function rowsFor(items,c){
  const head=['Kategori',...COMMON.map(x=>x[1]),...c.fields.map(x=>x[1]),...LOC.map(x=>x[1]),'Durum','Kontrol / montaj tarihi','Teknisyen','Not','Fotoğraf sayısı','Fotoğraf açıları','Fotoğraf bağlantıları','Kaydeden','Kayıt tarihi','Son güncelleme'];
  const rows=items.map(i=>[c.one,...COMMON.map(([k])=>i[k]||''),...c.fields.map(([k])=>i[k]||''),...LOC.map(([k])=>i[k]||''),ST[i.status]?.[1]||'',i.date||'',i.tech||'',i.note||'',(i.photos||[]).length,(i.photos||[]).map(p=>p.angle).join(', '),(i.photos||[]).map(p=>photoUrl(p)).join(' '),who(i.createdBy),fmtDT(i.createdAt),fmtDT(i.updatedAt)]);
  return [head,...rows];
}
const fileBase=()=>{const p=proj();return ((p.ship?p.ship+' - ':'')+p.name).replace(/[\\/:*?"<>|]/g,'-')};
function save(filename,data,type){
  const blob=data instanceof Blob?data:new Blob([data],{type:type||'application/octet-stream'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);toast('Dosya indirildi.');
}
function exportCsv(){
  const out=[];
  for(const c of CATS){const its=S.items.filter(i=>i.category===c.key);if(!its.length)continue;const r=rowsFor(its,c);out.push(...(out.length?[[],...r]:r))}
  if(!out.length){toast('Dışa aktarılacak kayıt yok.');return}
  const csv='\uFEFF'+out.map(r=>r.map(v=>{v=String(v??'');return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(';')).join('\r\n');
  save(fileBase()+'.csv',csv,'text/csv;charset=utf-8');
}
function exportXlsx(){
  if(!window.XLSX){toast('Excel modülü yüklenemedi.');return}
  const wb=XLSX.utils.book_new();let n=0;const p=proj();
  const sum=[['Proje',p.name],['Gemi',p.ship||''],['Firma',p.client||''],['Liman / tersane',p.port||''],['Başlangıç',p.start||''],['Rapor tarihi',fmtDT(Date.now())],[],['Kategori','Kayıt',...STATUS.map(s=>s[1])]];
  for(const c of CATS){const its=S.items.filter(i=>i.category===c.key);sum.push([c.label,its.length,...STATUS.map(s=>its.filter(i=>i.status===s[0]).length)])}
  const ws0=XLSX.utils.aoa_to_sheet(sum);ws0['!cols']=[{wch:20},{wch:30}];XLSX.utils.book_append_sheet(wb,ws0,'Özet');
  for(const c of CATS){const its=S.items.filter(i=>i.category===c.key);if(!its.length)continue;n++;
    const ws=XLSX.utils.aoa_to_sheet(rowsFor(its,c));ws['!cols']=rowsFor([],c)[0].map(h=>({wch:Math.max(12,h.length+2)}));XLSX.utils.book_append_sheet(wb,ws,c.label.slice(0,31))}
  if(!n){toast('Dışa aktarılacak kayıt yok.');return}
  save(fileBase()+'.xlsx',new Blob([XLSX.write(wb,{bookType:'xlsx',type:'array'})],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
}
function loadImg(src){return new Promise(r=>{const im=new Image();im.crossOrigin='anonymous';im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src})}
async function exportPdf(){
  if(!window.jspdf){toast('PDF modülü yüklenemedi.');return}
  if(!S.items.length){toast('Dışa aktarılacak kayıt yok.');return}
  toast('PDF hazırlanıyor…');await document.fonts.ready;
  const W=1240,H=1754,M=80;
  const pdf=new jspdf.jsPDF({unit:'mm',format:'a4',compress:true});let first=true;
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');
  const F=(w,s,f='IBM Plex Sans')=>`${w} ${s}px "${f}", sans-serif`;
  const p=proj();let pageNo=0;
  const newPage=()=>{g.fillStyle='#fff';g.fillRect(0,0,W,H);pageNo++;g.fillStyle='#0f2433';g.fillRect(0,0,W,14);
    g.font=F(400,18,'IBM Plex Mono');g.fillStyle='#5a6d7a';g.fillText(`${p.ship?p.ship+' · ':''}${p.name}`,M,H-40);g.textAlign='right';g.fillText('Sayfa '+pageNo,W-M,H-40);g.textAlign='left'};
  const flush=()=>{if(!first)pdf.addPage();first=false;pdf.addImage(cv.toDataURL('image/jpeg',.85),'JPEG',0,0,210,297)};
  const wrap=(t,x,y,maxW,lh)=>{const words=String(t).split(/\s+/);let line='';for(const w of words){const test=line?line+' '+w:w;if(g.measureText(test).width>maxW&&line){g.fillText(line,x,y);y+=lh;line=w}else line=test}if(line){g.fillText(line,x,y);y+=lh}return y};
  newPage();let y=200;
  g.fillStyle='#0b6e8a';g.font=F(500,22,'IBM Plex Mono');g.fillText('BİLEŞEN KAYIT RAPORU',M,y);y+=70;
  g.fillStyle='#0f2433';g.font=F(700,64,'Barlow Condensed');y=wrap(p.name,M,y,W-2*M,70);
  g.font=F(400,28);g.fillStyle='#5a6d7a';y=wrap([p.ship,p.client,p.port].filter(Boolean).join(' · ')||'',M,y+10,W-2*M,38);
  g.fillText('Rapor tarihi: '+fmtDT(Date.now()),M,y+10);y+=90;
  g.font=F(600,22);g.fillStyle='#0f2433';const cols=[M,M+330,M+470,M+610,M+750,M+890];
  ['Kategori','Kayıt','Sağlam/Test','Bekliyor','Arızalı','Değişecek'].forEach((h,i)=>g.fillText(h,cols[i],y));y+=16;g.fillStyle='#d5dee3';g.fillRect(M,y,W-2*M,2);y+=40;
  g.font=F(400,24);
  for(const c of CATS){const its=S.items.filter(i=>i.category===c.key);if(!its.length)continue;const n=s=>its.filter(i=>s.includes(i.status)).length;
    g.fillStyle='#0f2433';[c.label,its.length,n(['ok','test']),n(['wait']),n(['fault']),n(['replace'])].forEach((v,i)=>g.fillText(String(v),cols[i],y));y+=44}
  flush();
  for(const c of CATS){
    for(const i of S.items.filter(x=>x.category===c.key)){
      newPage();y=110;
      g.fillStyle='#0b6e8a';g.font=F(500,20,'IBM Plex Mono');g.fillText((c.one+(i.code?' · '+i.code:'')).toLocaleUpperCase('tr'),M,y);y+=56;
      g.fillStyle='#0f2433';g.font=F(700,46,'Barlow Condensed');y=wrap(i.name||'(adsız)',M,y,W-2*M-260,52);
      const st=ST[i.status];if(st){const col={good:['#dff1e7','#1f7a4d'],warn:['#fbeed8','#a6620a'],bad:['#f9e0de','#b3261e'],info:['#e3e8f7','#3f5aa8']}[st[2]];g.font=F(600,22);const tw=g.measureText(st[1]).width+36;g.fillStyle=col[0];g.beginPath();g.roundRect?g.roundRect(W-M-tw,110,tw,44,22):g.rect(W-M-tw,110,tw,44);g.fill();g.fillStyle=col[1];g.fillText(st[1],W-M-tw+18,140)}
      y+=10;
      const pairs=[...COMMON.slice(1),...c.fields,...LOC].map(([k,l])=>[l,i[k]]).concat([['Kontrol / montaj tarihi',i.date?fmtDate(i.date):''],['Teknisyen',i.tech],['Kaydeden',who(i.createdBy)],['Son güncelleme',fmtDT(i.updatedAt||i.createdAt)]]).filter(([,v])=>v!==''&&v!=null);
      const colW=(W-2*M)/3;let k=0;
      for(const[l,v]of pairs){const x=M+(k%3)*colW;if(k%3===0&&k)y+=74;g.font=F(400,17);g.fillStyle='#5a6d7a';g.fillText(l,x,y+20);g.font=F(500,22);g.fillStyle='#0f2433';let t=String(v);while(g.measureText(t).width>colW-20&&t.length>1)t=t.slice(0,-2);if(t!==String(v))t=t.slice(0,-1)+'…';g.fillText(t,x,y+50);k++}
      y+=100;
      if(i.note){g.font=F(400,17);g.fillStyle='#5a6d7a';g.fillText('Not',M,y);y+=30;g.font=F(400,21);g.fillStyle='#0f2433';y=wrap(i.note.replace(/\n/g,' '),M,y,W-2*M,30)+10}
      const ps=i.photos||[];const gw=(W-2*M-30)/2,gh=gw*0.75;let col=0;
      for(const ph of ps){
        if(y+gh+40>H-90){flush();newPage();y=110;col=0}
        const x=M+col*(gw+30);const im=await loadImg(photoUrl(ph));
        g.fillStyle='#eef2f4';g.fillRect(x,y,gw,gh);
        if(im){const r=Math.min(gw/im.naturalWidth,gh/im.naturalHeight);const w=im.naturalWidth*r,h=im.naturalHeight*r;g.drawImage(im,x+(gw-w)/2,y+(gh-h)/2,w,h)}
        g.font=F(500,18);g.fillStyle='#0f2433';g.fillText(ph.angle||'',x,y+gh+28);
        col++;if(col===2){col=0;y+=gh+60}
      }
      flush();
    }
  }
  save(fileBase()+' - rapor.pdf',pdf.output('blob'));
}

/* ---------- kullanıcılar (hesapları yalnızca yönetici açar) ---------- */
S.people={};S.users=[];S.me=null;
const isAdmin=()=>S.me?.role==='admin';
async function loadPeople(){
  const {data,error}=await sb.from('profiles').select('*').order('created_at');
  if(error){toast('Kullanıcılar okunamadı: '+error.message);return}
  S.users=data;S.people=Object.fromEntries(data.map(u=>[u.email,u.full_name||u.username||u.email]));
}
function renderUsers(){
  if(!isAdmin())return '<p class="muted">Bu sayfa yalnızca yöneticilere açık.</p>';
  let h=`<div class="phead"><div><div class="eyebrow">Yönetim</div><h1>Kullanıcılar</h1>
  <p class="muted" style="margin:4px 0 0;max-width:60ch">Siteye yalnızca burada hesabı açılan kişiler girebilir. Yeni kişi ekleyin, şifre sıfırlayın veya hesabı pasif yapın.</p></div>
  <button class="btn primary" data-act="newUser">+ Kullanıcı ekle</button></div><div class="list" style="margin-top:16px">`;
  for(const u of S.users){
    const st=!u.active?['s-none','Pasif']:u.role==='admin'?['s-info','Yönetici']:['s-good','Kullanıcı'];
    h+=`<div class="item" style="grid-template-columns:1fr auto;cursor:default"><span class="t"><span class="nm">${esc(u.full_name||'(adsız)')}</span>${u.id===S.me.id?' <span class="code muted">(siz)</span>':''}<span class="sub" style="display:block">${esc(u.username||u.email)} · ${fmtDate(u.created_at)}</span></span>
    <span class="row" style="justify-content:flex-end"><span class="status ${st[0]}">${st[1]}</span><button class="btn sm" data-act="editUser" data-id="${esc(u.id)}">Düzenle</button><button class="btn sm" data-act="pwUser" data-id="${esc(u.id)}">Şifre</button>${u.id!==S.me.id?`<button class="btn sm danger" data-act="delUser" data-id="${esc(u.id)}">Sil</button>`:''}</span></div>`;
  }
  return h+'</div>';
}
const genPw=()=>{const c='abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(const n of crypto.getRandomValues(new Uint32Array(10)))s+=c[n%c.length];return s};
function userModalHtml(){
  const d=modal.data||{},busy=modal.busy;
  const head=t=>`<div class="sheet-h"><h2 class="grow">${t}</h2><button class="btn sm" data-act="close">Kapat</button></div>`;
  const foot=(act,label)=>`<div class="sheet-f"><button class="btn" data-act="close">Vazgeç</button><button class="btn primary" data-act="${act}" ${busy?'disabled':''}>${busy?'Kaydediliyor…':label}</button></div>`;
  const pwField=`<label class="f" for="f_password">Şifre (en az 6 karakter)<span class="row" style="flex-wrap:nowrap"><input id="f_password" data-f="password" type="text" autocomplete="off" value="${esc(d.password||'')}"><button class="btn sm" type="button" data-act="genPw">Yeni oluştur</button></span></label>`;
  if(modal.type==='user'){const isNew=!d.id;
    return head(isNew?'Yeni kullanıcı':'Kullanıcıyı düzenle')+`<div class="sheet-b"><fieldset><legend>Hesap</legend><div class="fgrid">
    ${field('full_name','Ad soyad',null,d)}
    ${isNew?field('username','Kullanıcı adı *',null,d):`<label class="f">Kullanıcı adı<input value="${esc(d.username||d.email)}" disabled></label>`}
    <label class="f" for="f_role">Rol<select id="f_role" data-f="role"><option value="user" ${d.role!=='admin'?'selected':''}>Kullanıcı</option><option value="admin" ${d.role==='admin'?'selected':''}>Yönetici</option></select></label>
    ${isNew?pwField:`<label class="f full" style="flex-direction:row;align-items:center;gap:8px;color:var(--ink)"><input type="checkbox" id="f_active" data-f="active" style="width:auto" ${d.active!==false?'checked':''}> Hesap aktif (pasif hesap giriş yapamaz)</label>`}
    </div></fieldset>${isNew?'<p class="muted" style="margin:0;font-size:13px">Kullanıcı adı küçük harf, rakam, nokta, tire veya alt çizgiden oluşur (3–30 karakter). Kullanıcı adını ve şifreyi kişiye siz iletin. Kullanıcı giriş yaptıktan sonra üstteki “Şifre” ile değiştirebilir.</p>':''}</div>`+foot('saveUser',isNew?'Hesabı oluştur':'Kaydet');}
  if(modal.type==='userPw')return head('Şifre sıfırla')+`<div class="sheet-b"><p style="margin:0">${esc(d.full_name||d.username||d.email)} için yeni şifre belirleyin.</p>${pwField}</div>`+foot('saveUserPw','Şifreyi kaydet');
  if(modal.type==='delUser')return head('Kullanıcıyı sil')+`<div class="sheet-b"><div class="confirm"><b>${esc(d.full_name||d.username||d.email)} hesabı kalıcı olarak silinsin mi?</b><span>Bu kişinin girdiği kayıtlar silinmez. Geçici olarak kapatmak için “Düzenle” ile pasif yapabilirsiniz.</span></div></div><div class="sheet-f"><button class="btn" data-act="close">Vazgeç</button><button class="btn danger solid" data-act="doDelUser" ${busy?'disabled':''}>Evet, sil</button></div>`;
  if(modal.type==='myPw')return head('Şifremi değiştir')+`<div class="sheet-b"><label class="f" for="f_p1">Yeni şifre (en az 6 karakter)<input id="f_p1" data-f="p1" type="password" autocomplete="new-password"></label><label class="f" for="f_p2">Yeni şifre (tekrar)<input id="f_p2" data-f="p2" type="password" autocomplete="new-password"></label></div>`+foot('saveMyPw','Şifreyi değiştir');
  return '';
}
async function callAdmin(body){
  const {data,error}=await sb.functions.invoke('admin-users',{body});
  if(error){let m=error.message;try{const j=await error.context.json();m=j.error||j.message||m}catch{}throw new Error(m)}
  if(data?.error)throw new Error(data.error);return data;
}
async function runAdmin(body,msg){
  modal.busy=true;renderModal();
  try{await callAdmin(body);modal=null;renderModal();await loadPeople();render();toast(msg)}
  catch(e){modal.busy=false;renderModal();toast(e.message)}
}
function saveUser(){const d=modal.data;
  if(!d.id){
    d.username=String(d.username||'').trim().toLowerCase();
    if(!/^[a-z0-9._-]{3,30}$/.test(d.username)){toast('Kullanıcı adı 3–30 karakter olmalı; sadece küçük harf, rakam, nokta, tire ve alt çizgi kullanın.');return}
    if(String(d.password||'').length<6){toast('Şifre en az 6 karakter olmalı.');return}
    runAdmin({action:'create',username:d.username,password:d.password,full_name:d.full_name||'',role:d.role},'Hesap oluşturuldu. Kullanıcı adını ve şifreyi kişiye iletin.');
  } else runAdmin({action:'update',id:d.id,full_name:d.full_name||'',role:d.role,active:d.active!==false},'Kullanıcı güncellendi.');
}
async function saveMyPw(){const d=modal.data;
  if(String(d.p1||'').length<6){toast('Şifre en az 6 karakter olmalı.');return}
  if(d.p1!==d.p2){toast('Şifreler aynı değil.');return}
  modal.busy=true;renderModal();
  const {error}=await sb.auth.updateUser({password:d.p1});
  if(error){modal.busy=false;renderModal();toast('Şifre değiştirilemedi: '+error.message);return}
  modal=null;renderModal();toast('Şifreniz değiştirildi.');
}
function userAct(act,id){
  const u=S.users.find(x=>x.id===id);
  switch(act){
    case 'menu':setNav(false);setMenu($('#settingsMenu').hidden);return false;
    case 'nav':setMenu(false);setNav($('#navMenu').hidden);return false;
    case 'home':S.view='home';S.pid=null;S.items=[];modal=null;renderModal();render();window.scrollTo(0,0);return false;
    case 'projects':leaveProject();window.scrollTo(0,0);return false;
    case 'settings':S.view='settings';modal=null;renderModal();render();window.scrollTo(0,0);return false;
    case 'logout':S.view='home';sb.auth.signOut();return false;
    case 'users':S.view='users';modal=null;renderModal();render();window.scrollTo(0,0);return false;
    case 'newUser':modal={type:'user',data:{role:'user',password:genPw()}};return true;
    case 'editUser':modal={type:'user',data:{...u}};return true;
    case 'pwUser':modal={type:'userPw',data:{...u,password:genPw()}};return true;
    case 'delUser':modal={type:'delUser',data:{...u}};return true;
    case 'myPw':modal={type:'myPw',data:{}};return true;
    case 'genPw':if(modal?.data)modal.data.password=genPw();return true;
    case 'saveUser':saveUser();return false;
    case 'saveUserPw':if(String(modal.data.password||'').length<6){toast('Şifre en az 6 karakter olmalı.');return false}
      runAdmin({action:'password',id:modal.data.id,password:modal.data.password},'Şifre güncellendi. Yeni şifreyi kullanıcıya iletin.');return false;
    case 'doDelUser':runAdmin({action:'delete',id:modal.data.id},'Kullanıcı silindi.');return false;
    case 'saveMyPw':saveMyPw();return false;
  }
  return false;
}

/* ---------- ayarlar ---------- */
function renderSettings(){
  const me=S.me||{};
  const row=(l,v)=>`<div><dt>${esc(l)}</dt><dd>${esc(v||'—')}</dd></div>`;
  return `<div class="phead"><div><div class="eyebrow">Hesap ve yönetim</div><h1>Ayarlar</h1></div></div>
  <div style="display:flex;flex-direction:column;gap:14px;margin-top:16px;max-width:720px">
  <fieldset><legend>Hesabım</legend><dl class="dl">${row('Ad soyad',me.full_name)}${row('Kullanıcı adı',me.username)}${row('Rol',me.role==='admin'?'Yönetici':'Kullanıcı')}</dl>
  <div class="row" style="margin-top:14px"><button class="btn" data-act="myPw">Şifremi değiştir</button></div></fieldset>
  ${isAdmin()?`<fieldset><legend>Kullanıcı yönetimi</legend><p class="muted" style="margin:0 0 12px">${S.users.length} hesap, ${S.users.filter(u=>u.active).length} aktif. Yeni kişi ekleyin, şifre sıfırlayın veya hesabı pasif yapın.</p><button class="btn primary" data-act="users">Kullanıcıları yönet</button></fieldset>`:''}
  <fieldset><legend>Oturum</legend><div class="row"><button class="btn danger" data-act="logout">Çıkış yap</button></div></fieldset>
  </div>`;
}

/* ---------- dişli menüsü ---------- */
function renderMenu(){
  const me=S.me||{};
  $('#settingsMenu').innerHTML=`<div class="who"><b>${esc(me.full_name||me.username||'')}</b><div class="muted">${esc(me.username||'')} · ${me.role==='admin'?'Yönetici':'Kullanıcı'}</div></div><hr>
  <button role="menuitem" data-act="settings">Hesabım</button>
  <button role="menuitem" data-act="myPw">Şifremi değiştir</button>
  ${isAdmin()?'<button role="menuitem" data-act="users">Kullanıcıları yönet</button>':''}<hr>
  <button role="menuitem" class="danger" data-act="logout">Çıkış yap</button>`;
}
function setMenu(open){
  const m=$('#settingsMenu');if(!m)return;
  if(open)renderMenu();
  m.hidden=!open;$('#settingsBtn').setAttribute('aria-expanded',String(open));
  if(open)m.querySelector('button')?.focus();
}
document.addEventListener('click',e=>{
  const m=$('#settingsMenu');if(!m||m.hidden)return;
  if(!e.target.closest('.menu-wrap')||e.target.closest('.menu [data-act]'))setMenu(false);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#settingsMenu')?.hidden){setMenu(false);$('#settingsBtn').focus()}});

/* ---------- sol üst menü (üç nokta) ---------- */
function renderNav(){
  const ps=S.projects.slice(0,6);
  $('#navMenu').innerHTML=`<button role="menuitem" data-act="home"${S.view==='home'?' aria-current="page"':''}>Ana sayfa</button><hr>
  <div class="sec">Projeler</div>
  <button role="menuitem" data-act="projects"${S.view==='projects'?' aria-current="page"':''}>Tüm projeler</button>
  ${ps.map(p=>`<button role="menuitem" data-act="openProject" data-id="${esc(p.id)}"${S.view==='project'&&S.pid===p.id?' aria-current="page"':''}><span class="pname">${esc(p.name)}</span></button>`).join('')}
  <button role="menuitem" data-act="newProject">+ Yeni proje</button>`;
}
function setNav(open){
  const m=$('#navMenu');if(!m)return;
  if(open)renderNav();
  m.hidden=!open;$('#navBtn').setAttribute('aria-expanded',String(open));
  if(open)m.querySelector('button')?.focus();
}
document.addEventListener('click',e=>{
  const m=$('#navMenu');if(!m||m.hidden)return;
  if(!e.target.closest('#navWrap')||e.target.closest('#navMenu [data-act]'))setNav(false);
},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#navMenu')?.hidden){setNav(false);$('#navBtn').focus()}});
