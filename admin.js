'use strict';
(async()=>{
const DRAFT='birthday-invitation-draft-v2';
let store;try{store=await import('./firebase-store.js?v=2')}catch(e){document.getElementById('status').textContent='Firebase gagal dimuat: '+e.message;return}
let published;try{const r=await fetch('config.json',{cache:'no-store'});if(!r.ok)throw Error('Data gagal dimuat');published=await r.json()}catch(e){document.getElementById('status').textContent=e.message;return}try{const cloud=await store.loadInvitation();if(cloud?.hero&&cloud?.event)published=cloud}catch(e){document.getElementById('status').textContent='Database belum dapat diakses. Konsep bisa diedit, tetapi tunggu koneksi pulih sebelum menyimpan.'}
let data=structuredClone(published),base=JSON.stringify(published);try{const draft=JSON.parse(localStorage.getItem(DRAFT));if(draft?.base===base&&draft?.data)data=draft.data;else if(!draft){const previous=JSON.parse(localStorage.getItem('birthday-invitation-draft-v1'));if(previous&&typeof previous==='object')for(const group of Object.keys(data))if(previous[group]&&typeof previous[group]==='object')data[group]={...data[group],...previous[group]}}}catch{/* Use the published version. */}
const themeAssets=new Set(['spider-swing.jpeg','spider-relax.jpeg','spider-hang.jpeg','spider-hero.jpeg']);
const isThemeAsset=src=>typeof src==='string'&&themeAssets.has(src.split(/[/?#]/).pop());
if(isThemeAsset(data.hero?.portrait))data.hero.portrait='';
if(isThemeAsset(data.hero?.cover))data.hero.cover='';
if(Array.isArray(data.extras?.gallery))data.extras.gallery=data.extras.gallery.filter(item=>!isThemeAsset(item?.src));
const specs={hero:{eyebrow:['Label pembuka'],name:['Nama anak'],displayName:['Judul superhero (contoh: MIRACLE)'],age:['Usia (tahun)','number'],subtitle:['Kalimat singkat'],portrait:['Foto utama anak','image'],cover:['Foto anak di sampul (opsional)','image']},invitation:{greeting:['Sapaan'],message:['Isi undangan','textarea'],closing:['Kalimat penutup'],from:['Dari keluarga']},event:{date:['Tanggal','date'],start:['Mulai (WITA)','time'],end:['Selesai (WITA)','time'],venue:['Nama tempat'],address:['Alamat lengkap','textarea'],map:['Tautan Google Maps','url'],dress:['Kode pakaian']},extras:{galleryTitle:['Judul galeri'],musicTitle:['Judul musik'],music:['Link MP3, OGG, YouTube, atau Google Drive','url'],whatsapp:['Nomor WhatsApp konfirmasi (628...)','tel'],rsvpMessage:['Teks konfirmasi; {name} = nama anak'],gift:['Informasi hadiah (opsional)','textarea'],note:['Pesan tentang hadiah','textarea']},copy:{coverTitle:['Judul sampul'],coverAccent:['Judul sampul berwarna'],coverIntro:['Label sampul'],coverHint:['Petunjuk buka'],heroLine:['Judul utama baris pertama'],heroAccent:['Judul utama berwarna'],heroPrefix:['Kata sebelum nama'],ticker:['Teks pita berjalan'],countdownTitle:['Judul hitung mundur'],countdownNote:['Pesan hitung mundur'],eventTitle:['Judul acara'],eventAccent:['Judul acara berwarna'],eventIntro:['Pengantar detail acara','textarea'],galleryIntro:['Pengantar galeri'],rsvpTitle:['Judul konfirmasi'],rsvpAccent:['Judul konfirmasi berwarna'],rsvpIntro:['Pesan konfirmasi','textarea'],footerTitle:['Penutup baris pertama'],footerAccent:['Penutup baris kedua']},theme:{red:['Merah','color'],blue:['Biru','color'],gold:['Kuning','color'],cream:['Latar terang','color']}};
const sectionLabels={countdown:'Hitung mundur',story:'Pesan undangan',gallery:'Galeri',details:'Detail acara',rsvp:'Konfirmasi',gift:'Hadiah'};
const status=(message,error=false)=>{const el=document.getElementById('status');el.textContent=message;el.className='status '+(error?'error':'ok')};
const field=(group,key,label,type='text',object=data)=>{const wrap=document.createElement('label');wrap.className='field'+(['message','address','note','gift'].includes(key)?' full':'');wrap.textContent=label;let input;if(type==='textarea'){input=document.createElement('textarea')}else{input=document.createElement('input');input.type=type==='image'?'file':type;if(type==='image')input.accept='image/jpeg,image/png,image/webp'}if(type!=='image')input.value=object[group][key]??'';input.dataset.path=`${group}.${key}`;wrap.append(input);if(type==='image'){const note=document.createElement('small');note.textContent=object[group][key]?'Foto sudah terpasang. Unggah baru untuk mengganti.':'Belum ada foto';wrap.append(note);input.addEventListener('change',async()=>{try{object[group][key]=await resizeImage(input.files[0]);note.textContent='Foto baru siap disimpan';saveDraft();refresh()}catch(e){status(e.message,true)}})}else input.addEventListener('input',()=>{object[group][key]=input.value;saveDraft()});return wrap};
for(const[group,items]of Object.entries(specs)){const target=document.querySelector(`[data-fields="${group}"]`);for(const[key,[label,type]]of Object.entries(items))(group==='extras'&&['music','musicTitle'].includes(key)?document.querySelector('[data-fields="music"]'):target).append(field(group,key,label,type))}
for(const[key,label]of Object.entries(sectionLabels)){const wrap=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=data.sections[key]!==false;input.addEventListener('change',()=>{data.sections[key]=input.checked;saveDraft()});wrap.append(input,label);document.getElementById('sectionsEditor').append(wrap)}

const {parseMusicSource}=await import('./music-source.js?v=1');
const musicInput=document.querySelector('[data-path="extras.music"]'),musicTitleInput=document.querySelector('[data-path="extras.musicTitle"]'),musicSourceHint=document.getElementById('musicSourceHint'),musicTestLink=document.getElementById('musicTestLink');
musicInput.placeholder='https://youtu.be/... atau https://drive.google.com/file/d/...';
musicTitleInput.placeholder='Contoh: Happy Birthday to You — versi anak-anak';
function updateMusicSource(){
  try{
    const source=parseMusicSource(musicInput.value);musicInput.setCustomValidity('');
    musicTestLink.hidden=!source.openUrl;musicTestLink.href=source.openUrl||'#';
    musicSourceHint.textContent=source.type==='youtube'?'YouTube: video tampil di pemutar undangan. Tamu dapat mengetuk ▶ bila belum mulai.':source.type==='drive'?'Google Drive: pilih file audio dan atur akses ke Siapa saja yang memiliki link.':'MP3/OGG: gunakan tautan langsung ke file audio. Kosongkan untuk memakai musik bawaan.';
  }catch(error){musicInput.setCustomValidity(error.message);musicSourceHint.textContent=error.message;musicTestLink.hidden=true}
}
musicInput.addEventListener('input',updateMusicSource);updateMusicSource();

function saveDraft(){try{localStorage.setItem(DRAFT,JSON.stringify({base,data}));status('Konsep tersimpan. Klik Simpan & perbarui undangan untuk menerbitkan.')}catch{status('Penyimpanan browser penuh. Kurangi ukuran foto lalu coba lagi.',true)}}
function resizeImage(file){return new Promise((resolve,reject)=>{if(!file)return reject(Error('Pilih foto.'));if(file.size>12*1024*1024)return reject(Error('Foto sumber terlalu besar (maksimal 12 MB).'));if(!['image/jpeg','image/png','image/webp'].includes(file.type))return reject(Error('Gunakan JPG, PNG, atau WebP.'));const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(url);const canvas=document.createElement('canvas');let scale=Math.min(1,800/Math.max(img.width,img.height)),out='';for(let attempt=0;attempt<8;attempt++){canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);out=canvas.toDataURL('image/jpeg',attempt<3?.78-attempt*.12:.52);if(out.length<=155000)break;scale*=.78}out.length>155000?reject(Error('Foto sulit diperkecil. Coba foto lain.')):resolve(out)};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error('Foto gagal dibaca.'))};img.src=url})}
function gallery(){const target=document.getElementById('galleryEditor');target.replaceChildren();data.extras.gallery.forEach((item,i)=>{const row=document.createElement('div');row.className='gallery-row';const title=document.createElement('strong');title.textContent=`Foto ${i+1}`;const cap=document.createElement('input');cap.placeholder='Keterangan foto';cap.value=item.caption||'';cap.addEventListener('input',()=>{item.caption=cap.value;saveDraft()});const file=document.createElement('input');file.type='file';file.accept='image/jpeg,image/png,image/webp';file.addEventListener('change',async()=>{try{item.src=await resizeImage(file.files[0]);saveDraft();status(`Foto ${i+1} siap diterbitkan.`)}catch(e){status(e.message,true)}});const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='Hapus foto';remove.addEventListener('click',()=>{data.extras.gallery.splice(i,1);gallery();saveDraft()});row.append(title,document.createElement('br'),cap,file,remove);target.append(row)})}gallery();document.getElementById('addPhoto').onclick=()=>{data.extras.gallery.push({src:'',caption:''});gallery();saveDraft()};
document.getElementById('download').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}));a.download='config.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
function refresh(){const iframe=document.getElementById('preview');const url=new URL('index.html',location.href);fetch(url).then(r=>r.text()).then(html=>{const json=JSON.stringify(data).replace(/</g,'\\u003c');iframe.srcdoc=html.replace('<script src="app.js?v=22" defer></script>',`<script>window.__INVITATION_PREVIEW__=true;const nativeFetch=window.fetch;window.fetch=(url,options)=>String(url).startsWith('config.json')?Promise.resolve(new Response(${JSON.stringify(json)},{headers:{'Content-Type':'application/json'}})):nativeFetch(url,options);<\/script><script src="app.js?v=22" defer></script>`).replace('<link rel="stylesheet" href="style.css?v=20">',`<base href="${new URL('.',location.href).href}"><link rel="stylesheet" href="style.css?v=20">`)}).catch(()=>status('Pratinjau gagal dimuat.',true))}
document.getElementById('refreshPreview').onclick=()=>{saveDraft();refresh()};
const connection=document.getElementById('connection'),connected=document.getElementById('connected');
let signedIn=false;
store.onAdminChange(user=>{signedIn=Boolean(user);connection.hidden=signedIn;connected.hidden=!signedIn;document.getElementById('publish').disabled=!signedIn;if(user)status('Masuk sebagai '+user.email+'. Edit undangan lalu klik Simpan & perbarui undangan.');});
document.getElementById('connect').onclick=async()=>{const button=document.getElementById('connect');button.disabled=true;try{await store.loginAdmin();status('Login berhasil. Kini Anda dapat menyimpan langsung tanpa token GitHub.')}catch(e){status('Login gagal: '+e.message,true)}finally{button.disabled=false}};
document.getElementById('disconnect').onclick=async()=>{await store.logoutAdmin();status('Anda telah keluar dari admin. Konsep di browser tetap tersimpan.')};
document.getElementById('publish').onclick=async()=>{if(!signedIn)return status('Masuk dengan Google terlebih dahulu.',true);const button=document.getElementById('publish');button.disabled=true;status('Menyimpan perubahan ke Firebase...');try{parseMusicSource(data.extras.music);await store.publishInvitation(data,published);published=structuredClone(data);base=JSON.stringify(published);localStorage.removeItem(DRAFT);localStorage.removeItem('birthday-invitation-draft-v1');status('Undangan berhasil diperbarui. Tamu yang membuka halaman akan langsung melihat versi terbaru.')}catch(e){status('Gagal menyimpan: '+e.message,true)}finally{button.disabled=!signedIn}};

const guestName=document.getElementById('guestName'),guestLink=document.getElementById('guestLink'),guestMessage=document.getElementById('guestMessage'),guestStatus=document.getElementById('guestShareStatus');
function updateGuestShare(){
  const name=guestName.value.trim(),url=new URL('matthew-miracle-joel-momongan.html',location.href);
  if(name)url.searchParams.set('to',name);
  url.searchParams.set('v','birthday2');
  guestLink.value=url.href;
  const child=String(data.hero.name||'si kecil').trim();
  guestMessage.value=(name?'Kepada Yth. '+name+'\n\n':'')+'Dengan penuh sukacita, kami mengundang Anda merayakan ulang tahun '+child+'.\n\nSilakan buka undangan berikut:\n'+url.href+'\n\nKehadiran dan doa Anda sangat berarti bagi kami. Terima kasih!';
  document.getElementById('openGuestLink').href=url.href;
  document.getElementById('shareGuestWhatsApp').href='https://wa.me/?text='+encodeURIComponent(guestMessage.value);
}
guestName.addEventListener('input',updateGuestShare);
document.querySelector('[data-path="hero.name"]')?.addEventListener('input',updateGuestShare);
async function copyGuest(field){
  updateGuestShare();
  try{
    if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(field.value);
    else{field.focus();field.select();field.setSelectionRange(0,field.value.length);if(!document.execCommand('copy'))throw Error('copy')}
    guestStatus.textContent='Berhasil disalin. Tempelkan di WhatsApp untuk tamu tersebut.';
  }catch{field.focus();field.select();field.setSelectionRange(0,field.value.length);guestStatus.textContent='Tekan lama teks yang dipilih, lalu pilih Salin.'}
}
document.getElementById('copyGuestLink').addEventListener('click',()=>copyGuest(guestLink));
document.getElementById('copyGuestMessage').addEventListener('click',()=>copyGuest(guestMessage));
updateGuestShare();
})();
