/* Gemi Bileşen Kaydı — dil desteği (English / Türkçe)
   Arayüz Türkçe yazılmıştır; İngilizce seçiliyken ekrandaki metinler bu sözlükle çevrilir.
   Kayıtlarda saklanan değerler (açı, kablo tipi vb.) Türkçe kalır; sadece görünüm çevrilir. */
const LANG=(()=>{try{return localStorage.getItem('gbk_lang')||'en'}catch{return 'en'}})();
const LOCALE=LANG==='en'?'en-GB':'tr-TR';
document.documentElement.lang=LANG;

const DICT={
 // genel
 'Gemi Bileşen Kaydı':'Ship Component Log','Yükleniyor…':'Loading…','Kaydet':'Save','Kaydediliyor…':'Saving…','Vazgeç':'Cancel','Kapat':'Close',
 'Sil':'Delete','Düzenle':'Edit','Evet, sil':'Yes, delete','(adsız)':'(untitled)','hata':'error','Menü':'Menu','Ayarlar':'Settings',
 '← Projeler':'← Projects','Projelere dön':'Back to projects','Ana sayfa':'Home','Tüm projeler':'All projects',
 // kurulum ve giriş
 'Kurulum':'Setup','Supabase bağlantısı':'Supabase connection',
 'Supabase kütüphanesi yüklenemedi. İnternet bağlantınızı kontrol edin.':'The Supabase library could not be loaded. Check your internet connection.',
 "config.js dosyasına Supabase adresini ve anon key'i yazın ya da burada girin (bu tarayıcıya kaydedilir).":'Enter the Supabase URL and anon key in config.js, or enter them here (saved in this browser).',
 'Kullanıcı adı':'Username','Şifre':'Password','Giriş yap':'Sign in',
 'Kullanıcı adı veya şifre hatalı.':'Incorrect username or password.',
 'Bu hesap kullanıma kapalı. Yöneticinizle görüşün.':'This account is disabled. Contact your administrator.',
 // kategoriler
 'Kameralar':'Cameras','Kamera':'Camera','Kablolar':'Cables','Kablo':'Cable','Ağ cihazları':'Network devices','Ağ cihazı':'Network device',
 'Ekranlar':'Displays','Ekran':'Display','Sensörler':'Sensors','Sensör':'Sensor','Diğer':'Other','Bileşen':'Component',
 'kameralar':'cameras','kablolar':'cables','ağ cihazları':'network devices','ekranlar':'displays','sensörler':'sensors','diğer':'other',
 // alanlar
 'IP adresi':'IP address','Çözünürlük':'Resolution','Lens / görüş açısı':'Lens / field of view','Montaj tipi':'Mounting type',
 'Tavan':'Ceiling','Duvar':'Wall','Direk':'Pole','Gömme':'Recessed','Kablo tipi':'Cable type','Koaksiyel':'Coaxial','Enerji':'Power','Kontrol':'Control',
 'Uzunluk (m)':'Length (m)','Kablo etiketi':'Cable label','Başlangıç noktası':'Start point','Bitiş noktası':'End point',
 'Port sayısı':'Number of ports','Kabin / rack':'Cabinet / rack','Boyut (inç)':'Size (in)','Giriş tipi':'Input type',
 'Sensör tipi':'Sensor type','Ölçüm aralığı':'Measuring range','Bileşen türü':'Component type',
 'Ad / tanım':'Name / description','Ad / tanım *':'Name / description *','Envanter kodu':'Inventory code','Marka':'Brand','Model':'Model','Seri no':'Serial no',
 'Güverte (Deck)':'Deck','Dikey bölge (MVZ)':'Main vertical zone (MVZ)','Frame no':'Frame no','Mahal / kabin no':'Space / cabin no',
 // durumlar
 'Sağlam':'OK','Test edildi':'Tested','Montaj bekliyor':'Awaiting installation','Arızalı':'Faulty','Değişecek':'To be replaced','Durum yok':'No status',
 // açılar
 'Genel görünüm':'Overview','Ön':'Front','Arka':'Back','Sol':'Left','Sağ':'Right','Üst':'Top','Alt':'Bottom','Bağlantı noktası':'Connection point',
 'Etiket / seri no':'Label / serial no','Montaj yeri':'Mounting location','Detay':'Detail',
 // projeler
 'Projeler':'Projects','Gemi projeleri':'Ship projects','+ Yeni proje':'+ New project','Yeni proje':'New project',
 'Her proje bir gemi ya da iş paketidir. Projeye girip kameraları, kabloları ve diğer bileşenleri ayrı sekmelerde, fotoğraflarıyla kaydedin.':'Each project is a ship or work package. Open a project to log cameras, cables and other components in separate tabs, with photos.',
 'Henüz proje yok':'No projects yet',
 '“Yeni proje” ile ilk gemi projesini oluşturun. Örneğin: gemi adı, tersane ve başlangıç tarihi.':'Create the first ship project with “New project”, for example the ship name, shipyard and start date.',
 'Yönetici bir proje açtığında burada görünecek.':'Projects appear here once an administrator creates one.',
 'Gemi adı yok':'No ship name','Tamamlandı':'Completed','Devam ediyor':'In progress','Henüz bileşen yok':'No components yet',
 'Proje bulunamadı.':'Project not found.','Proje':'Project','Firma:':'Client:','Liman/tersane:':'Port/shipyard:','Başlangıç:':'Start:',
 'Toplam:':'Total:','Sizin kayıtlarınız:':'Your records:','kayıt':'records','Proje bilgileri':'Project details','PDF rapor':'PDF report',
 'Ara: ad, kod, seri no, mahal…':'Search: name, code, serial no, space…','Tüm durumlar':'All statuses','Tüm güverteler':'All decks',
 'Filtreye uyan kayıt yok':'No records match the filters','Aramayı veya filtreleri temizleyin.':'Clear the search or filters.','foto yok':'no photo',
 'Proje adı *':'Project name *','Gemi adı':'Ship name','Firma / müşteri':'Client','Liman / tersane':'Port / shipyard','Başlangıç tarihi':'Start date',
 'Notlar':'Notes','Proje tamamlandı':'Project completed','Projeyi sil':'Delete project',
 // kayıtlar
 'Yeni kayıt':'New record','Kaydı düzenle':'Edit record','Fotoğraflar':'Photos','Fotoğraf çek':'Take photo','Galeriden seç':'Choose from gallery',
 'Her fotoğrafın açısını seçin.':'Pick the angle for each photo.','Açı':'Angle','Fotoğrafı kaldır':'Remove photo',
 'Henüz fotoğraf yok. Önden, arkadan, bağlantı noktasından ve etiketten çekmeniz önerilir.':'No photos yet. Shots of the front, back, connection point and label are recommended.',
 'Temel bilgiler':'Basic information','Konum':'Location','Durum ve not':'Status and notes','Durum':'Status','Kontrol / montaj tarihi':'Inspection / installation date',
 'Teknisyen':'Technician','Açıklama / not':'Description / notes','Fotoğraflar yükleniyor…':'Uploading photos…','Fotoğraf yok.':'No photos.',
 'Bilgiler':'Details','Kaydeden':'Recorded by','Kayıt tarihi':'Created','Son güncelleme':'Last updated','Not':'Notes',
 'Bu kayıt ve fotoğrafları kalıcı olarak silinsin mi?':'Permanently delete this record and its photos?','‹ Önceki':'‹ Previous','Sonraki ›':'Next ›',
 // bildirimler
 'Proje adı gerekli.':'Project name is required.','Proje oluşturuldu.':'Project created.','Proje kaydedildi.':'Project saved.',
 'Ad / tanım gerekli.':'Name / description is required.','Kayıt kaydedildi.':'Record saved.','Kayıt silindi.':'Record deleted.','Proje silindi.':'Project deleted.',
 'Dosya indirildi.':'File downloaded.','Dışa aktarılacak kayıt yok.':'Nothing to export.','Excel modülü yüklenemedi.':'The Excel module could not be loaded.',
 'PDF modülü yüklenemedi.':'The PDF module could not be loaded.','PDF hazırlanıyor…':'Preparing PDF…',
 // dışa aktarma
 'Kategori':'Category','Fotoğraf sayısı':'Photo count','Fotoğraf açıları':'Photo angles','Fotoğraf bağlantıları':'Photo links','Gemi':'Ship','Firma':'Client',
 'Başlangıç':'Start','Rapor tarihi':'Report date','Kayıt':'Records','Özet':'Summary','- rapor.pdf':'- report.pdf','BİLEŞEN KAYIT RAPORU':'COMPONENT LOG REPORT',
 'Sağlam/Test':'OK/Tested','Bekliyor':'Waiting',
 // kullanıcılar
 'Bu sayfa yalnızca yöneticilere açık.':'This page is for administrators only.','Yönetim':'Administration','Kullanıcılar':'Users',
 'Siteye yalnızca burada hesabı açılan kişiler girebilir. Yeni kişi ekleyin, şifre sıfırlayın veya hesabı pasif yapın.':'Only people with an account created here can sign in. Add people, reset passwords or deactivate accounts.',
 '+ Kullanıcı ekle':'+ Add user','Pasif':'Inactive','Yönetici':'Administrator','Kullanıcı':'User','(siz)':'(you)','Yeni oluştur':'Generate',
 'Şifre (en az 6 karakter)':'Password (at least 6 characters)','Yeni kullanıcı':'New user','Kullanıcıyı düzenle':'Edit user','Hesap':'Account',
 'Ad soyad':'Full name','Kullanıcı adı *':'Username *','Rol':'Role','Hesap aktif (pasif hesap giriş yapamaz)':"Account active (inactive accounts can't sign in)",
 'Kullanıcı adı küçük harf, rakam, nokta, tire veya alt çizgiden oluşur (3–30 karakter). Kullanıcı adını ve şifreyi kişiye siz iletin. Kullanıcı giriş yaptıktan sonra üstteki “Şifre” ile değiştirebilir.':'Usernames use lowercase letters, digits, dots, hyphens or underscores (3–30 characters). Give the username and password to the person yourself; they can change the password after signing in.',
 'Hesabı oluştur':'Create account','Şifre sıfırla':'Reset password','Şifreyi kaydet':'Save password','Kullanıcıyı sil':'Delete user',
 'Bu kişinin girdiği kayıtlar silinmez. Geçici olarak kapatmak için “Düzenle” ile pasif yapabilirsiniz.':'Records this person entered are kept. To disable the account temporarily, set it to inactive with “Edit”.',
 'Şifremi değiştir':'Change my password','Yeni şifre (en az 6 karakter)':'New password (at least 6 characters)','Yeni şifre (tekrar)':'New password (again)',
 'Şifreyi değiştir':'Change password',
 'Kullanıcı adı 3–30 karakter olmalı; sadece küçük harf, rakam, nokta, tire ve alt çizgi kullanın.':'Usernames must be 3–30 characters, using only lowercase letters, digits, dots, hyphens and underscores.',
 'Şifre en az 6 karakter olmalı.':'Password must be at least 6 characters.','Hesap oluşturuldu. Kullanıcı adını ve şifreyi kişiye iletin.':'Account created. Give the username and password to the person.',
 'Kullanıcı güncellendi.':'User updated.','Şifreler aynı değil.':"Passwords don't match.",'Şifreniz değiştirildi.':'Your password has been changed.',
 'Şifre güncellendi. Yeni şifreyi kullanıcıya iletin.':'Password updated. Give the new password to the user.','Kullanıcı silindi.':'User deleted.',
 'Oturum geçersiz. Tekrar giriş yapın.':'Session expired. Please sign in again.','Bu işlem için yönetici yetkisi gerekli.':'Administrator permission is required for this.',
 'Bu kullanıcı adı zaten kullanılıyor.':'This username is already taken.','Kullanıcı seçilmedi.':'No user selected.',
 'Kendi yönetici yetkinizi kaldıramaz veya hesabınızı pasif yapamazsınız.':"You can't remove your own administrator role or deactivate your own account.",
 'En az 6 karakterli şifre gerekli.':'A password of at least 6 characters is required.','Kendi hesabınızı silemezsiniz.':"You can't delete your own account.",
 'Bilinmeyen işlem.':'Unknown action.',
 // ayarlar
 'Hesap ve yönetim':'Account and administration','Hesabım':'My account','Kullanıcı yönetimi':'User management','Kullanıcıları yönet':'Manage users',
 'Görünüm':'Appearance','Tema:':'Theme:','Koyu':'Dark','Açık':'Light','Açık temaya geç':'Switch to light theme','Koyu temaya geç':'Switch to dark theme',
 'Açık tema':'Light theme','Koyu tema':'Dark theme','Oturum':'Session','Çıkış yap':'Sign out','Dil':'Language'
};
// Kayıtlarda saklanan sabit seçenekler İngilizcedir; Türkçe görünümde bu tabloyla çevrilir.
const VALS={'Overview':'Genel görünüm','Front':'Ön','Back':'Arka','Left':'Sol','Right':'Sağ','Top':'Üst','Bottom':'Alt','Connection point':'Bağlantı noktası',
 'Label / serial no':'Etiket / seri no','Mounting location':'Montaj yeri','Detail':'Detay','Ceiling':'Tavan','Wall':'Duvar','Pole':'Direk','Recessed':'Gömme',
 'Other':'Diğer','Coaxial':'Koaksiyel','Power':'Enerji','Control':'Kontrol'};
const ONE='(Kamera|Kablo|Ağ cihazı|Ekran|Sensör|Bileşen)';
const PATS=[
 [/^(\d+) kayıt$/,(_,n)=>n+' records'],
 [/^Güncelleme: (.+)$/,(_,d)=>'Updated: '+d],
 [new RegExp('^\\+ '+ONE+' ekle$'),(_,c)=>'+ Add '+T(c).toLowerCase()],
 [/^(.+) için kayıt yok$/,(_,c)=>'No records for '+T(c).toLowerCase()],
 [new RegExp('^“'+ONE+' ekle” ile ilk kaydı oluşturun; farklı açılardan fotoğraf çekip bilgilerini girin\\.$'),(_,c)=>'Create the first record with “Add '+T(c).toLowerCase()+'”: take photos from different angles and enter the details.'],
 [/^(\d+) fotoğraf · (.*)$/,(_,n,d)=>n+(n==='1'?' photo':' photos')+(d?' · '+d:'')],
 [/^Bu proje ve içindeki (\d+) kayıt kalıcı olarak silinsin mi\?$/,(_,n)=>'Permanently delete this project and its '+n+' records?'],
 [new RegExp('^'+ONE+' · (.+)$'),(_,c,code)=>T(c)+' · '+code],
 [/^(.+) — (\d+\/\d+)$/,(_,a,n)=>T(a)+' — '+n],
 [/^(\d+) hesap, (\d+) aktif\. Yeni kişi ekleyin, şifre sıfırlayın veya hesabı pasif yapın\.$/,(_,a,b)=>a+' accounts, '+b+' active. Add people, reset passwords or deactivate accounts.'],
 [/^(.+) için yeni şifre belirleyin\.$/,(_,u)=>'Set a new password for '+u+'.'],
 [/^(.+) hesabı kalıcı olarak silinsin mi\?$/,(_,u)=>'Permanently delete the account '+u+'?'],
 [/^(.*) · (Yönetici|Kullanıcı)$/,(_,u,r)=>u+' · '+T(r)],
 [/^Sayfa (\d+)$/,(_,n)=>'Page '+n],
 [/^Rapor tarihi: (.+)$/,(_,d)=>'Report date: '+d],
 [/^(Projeler okunamadı|Sayımlar okunamadı|Bileşenler okunamadı|Fotoğraf yüklenemedi|Kaydedilemedi|Silinemedi|Kullanıcılar okunamadı|Şifre değiştirilemedi): ([\s\S]*)$/,(_,p,m)=>({
   'Projeler okunamadı':'Could not load projects','Sayımlar okunamadı':'Could not load counts','Bileşenler okunamadı':'Could not load components',
   'Fotoğraf yüklenemedi':'Photo upload failed','Kaydedilemedi':'Could not save','Silinemedi':'Could not delete',
   'Kullanıcılar okunamadı':'Could not load users','Şifre değiştirilemedi':'Could not change password'}[p])+': '+T(m)],
];
function T(s){
  if(s==null)return s;
  s=String(s);const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/);const core=m[2];if(!core)return s;
  if(LANG!=='en'){let r=VALS[core];if(r==null){const mm=core.match(/^(.+) — (\d+\/\d+)$/);if(mm&&VALS[mm[1]])r=VALS[mm[1]]+' — '+mm[2]}return r==null?s:m[1]+r+m[3]}
  let r=DICT[core];
  if(r==null)for(const [re,f] of PATS){const mm=core.match(re);if(mm){r=f(...mm);break}}
  return r==null?s:m[1]+r+m[3];
}
function translateTree(root){
  if(!root)return;
  if(root.nodeType===3){tText(root);return}
  if(root.nodeType!==1)return;
  tAttrs(root);
  for(const el of root.querySelectorAll('[placeholder],[aria-label],[title],img[alt]'))tAttrs(el);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;const list=[];
  while((n=w.nextNode()))list.push(n);
  list.forEach(tText);
}
function tText(n){
  const p=n.parentNode;if(!p||/^(TEXTAREA|SCRIPT|STYLE)$/.test(p.nodeName))return;
  const v=n.nodeValue,t=T(v);if(t===v)return;
  if(p.nodeName==='OPTION'&&!p.hasAttribute('value'))p.setAttribute('value',v.trim());
  n.nodeValue=t;
}
function tAttrs(el){
  for(const a of ['placeholder','aria-label','title','alt']){if(el.hasAttribute&&el.hasAttribute(a)){const v=el.getAttribute(a),t=T(v);if(t!==v)el.setAttribute(a,t)}}
}
{
  document.title=T(document.title);
  translateTree(document.body);
  new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)translateTree(n)}).observe(document.body,{childList:true,subtree:true});
}
