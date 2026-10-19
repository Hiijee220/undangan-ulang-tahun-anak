'use strict';
const form=document.getElementById('wishForm'),submit=document.getElementById('wishSubmit'),status=document.getElementById('wishStatus'),list=document.getElementById('wishList'),empty=document.getElementById('wishEmpty'),count=document.getElementById('wishCount'),nameInput=document.getElementById('wishName'),messageInput=document.getElementById('wishMessage');
let ready=false,sending=false;
form.addEventListener('focusin',()=>document.dispatchEvent(new Event('invitation:pause-scroll')));
const invitedName=new URLSearchParams(location.search).get('to');
if(invitedName)nameInput.value=invitedName.slice(0,80);
function render(items){
  list.replaceChildren();count.textContent=items.length?'('+items.length+')':'';
  empty.hidden=items.length>0;empty.textContent='Belum ada ucapan. Jadilah yang pertama mengirim doa terbaik!';
  for(const item of items){
    const card=document.createElement('li');card.className='wish-card';
    const name=document.createElement('strong');name.textContent=String(item.name||'Tamu');
    const message=document.createElement('p');message.textContent=String(item.message||'');
    card.append(name);
    const date=item.createdAt?.toDate?.();
    if(date&&!Number.isNaN(date.getTime())){const time=document.createElement('time');time.dateTime=date.toISOString();time.textContent=new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Makassar'}).format(date)+' WITA';card.append(time)}
    card.append(message);list.append(card);
  }
}
if(window.__INVITATION_PREVIEW__){
  render([]);status.textContent='Pratinjau saja. Pengiriman ucapan tersedia di undangan publik.';submit.disabled=true;
}else{
  try{
    const {watchWishes,sendWish}=await import('./firebase-store.js?v=2');
    watchWishes(items=>{render(items);if(!ready){ready=true;submit.disabled=sending;status.textContent='Nama dan ucapan yang dikirim dapat dilihat semua tamu.'}},()=>{
      ready=false;submit.disabled=true;empty.textContent='Daftar ucapan belum dapat dimuat.';
      status.textContent='Buku ucapan belum dapat terhubung. Silakan coba muat ulang nanti.';
    });
    form.addEventListener('submit',async event=>{
      event.preventDefault();if(!ready||sending||!form.reportValidity())return;
      const name=nameInput.value.trim(),message=messageInput.value.trim();
      if(!name||!message){status.textContent='Nama dan ucapan tidak boleh kosong.';return}
      sending=true;submit.disabled=true;status.textContent='Mengirim ucapan...';
      try{await sendWish(name,message);messageInput.value='';status.textContent='Terima kasih! Ucapanmu sudah terkirim dan tampil untuk semua tamu.'}
      catch{status.textContent='Ucapan belum terkirim. Periksa koneksi lalu coba lagi.'}
      finally{sending=false;submit.disabled=!ready}
    });
  }catch{
    empty.textContent='Daftar ucapan belum dapat dimuat.';status.textContent='Buku ucapan belum dapat terhubung. Silakan coba muat ulang nanti.';
  }
}
