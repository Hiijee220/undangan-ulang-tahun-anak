'use strict';
export function parseMusicSource(value){
  const raw=String(value||'').trim();if(!raw)return {type:'default',url:'',openUrl:''};
  let url;try{url=new URL(raw)}catch{throw Error('Masukkan tautan musik HTTPS yang lengkap.')}
  if(url.protocol!=='https:'||url.username||url.password)throw Error('Gunakan tautan musik HTTPS.');
  const host=url.hostname.toLowerCase(),parts=url.pathname.split('/').filter(Boolean);
  if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com','youtu.be','www.youtu.be'].includes(host)){
    const id=host.endsWith('youtu.be')?parts[0]:url.searchParams.get('v')||(['embed','shorts','live'].includes(parts[0])?parts[1]:'');
    if(!/^[A-Za-z0-9_-]{11}$/.test(id||''))throw Error('Gunakan tautan satu video YouTube, bukan kanal atau playlist.');
    return {type:'youtube',id,url:'https://www.youtube.com/embed/'+id,openUrl:'https://www.youtube.com/watch?v='+id};
  }
  if(host==='drive.google.com'||host==='www.drive.google.com'){
    const id=parts[0]==='file'&&parts[1]==='d'?parts[2]:url.searchParams.get('id');
    if(!/^[A-Za-z0-9_-]{10,200}$/.test(id||''))throw Error('Gunakan tautan file audio Google Drive, bukan folder.');
    return {type:'drive',id,url:'https://drive.google.com/uc?export=download&id='+encodeURIComponent(id),previewUrl:'https://drive.google.com/file/d/'+id+'/preview',openUrl:'https://drive.google.com/file/d/'+id+'/view'};
  }
  return {type:'audio',url:url.href,openUrl:url.href};
}
