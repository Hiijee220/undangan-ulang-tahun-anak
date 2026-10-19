'use strict';
import {parseMusicSource} from './music-source.js?v=1';
let youtubeAPI;
function loadYouTubeAPI(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(youtubeAPI)return youtubeAPI;
  youtubeAPI=new Promise((resolve,reject)=>{
    const previous=window.onYouTubeIframeAPIReady;
    const timeout=setTimeout(()=>{youtubeAPI=null;reject(Error('YouTube belum dapat dimuat.'))},12000);
    window.onYouTubeIframeAPIReady=()=>{clearTimeout(timeout);previous?.();resolve(window.YT)};
    const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{clearTimeout(timeout);youtubeAPI=null;reject(Error('YouTube belum dapat dimuat.'))};document.head.append(script);
  });
  return youtubeAPI;
}
export function createMusicPlayer({audio,button,url,title,onState}){
  let source;try{source=parseMusicSource(url)}catch(error){source={type:'invalid'};button.title=error.message}
  let panel,body,note,external,player,playerReady,driveFrame,context,timer,step=0,wanted=false,playing=false,attempt=0;
  const melody=[523.25,659.25,783.99,659.25,698.46,783.99,880,783.99,659.25,587.33,659.25,523.25,587.33,659.25,523.25,392];
  const label=String(title||'Musik undangan').trim();
  function state(value){playing=value;button.classList.toggle('playing',value);button.setAttribute('aria-label',(value?'Jeda musik: ':'Putar musik: ')+label);button.title=label;onState?.(value)}
  function showPanel(message){
    if(!panel){
      panel=document.createElement('aside');panel.className='music-panel';panel.setAttribute('aria-label','Pemutar musik');
      const heading=document.createElement('div');heading.className='music-panel-heading';
      const name=document.createElement('strong');name.textContent=label;
      const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label','Tutup pemutar dan hentikan musik');close.onclick=()=>{stop();panel.hidden=true};
      heading.append(name,close);note=document.createElement('p');note.setAttribute('role','status');body=document.createElement('div');
      external=document.createElement('a');external.textContent='Buka musik di sumber asli ↗';external.href=source.openUrl||'#';external.target='_blank';external.rel='noopener';
      panel.append(heading,body,note,external);document.body.append(panel);
      panel.addEventListener('pointerdown',()=>document.dispatchEvent(new Event('invitation:pause-scroll')));
    }
    panel.hidden=false;note.textContent=message||'';
  }
  function playNote(frequency){
    const now=context.currentTime,voice=context.createOscillator(),gain=context.createGain();voice.type='sine';voice.frequency.setValueAtTime(frequency,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.075,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+.29);voice.connect(gain).connect(context.destination);voice.start(now);voice.stop(now+.31);
  }
  async function play(){
    const token=++attempt;wanted=true;
    try{
      if(source.type==='invalid')throw Error('Tautan musik belum valid. Perbarui lewat admin.');
      if(source.type==='youtube'){
        showPanel('Ketuk ▶ pada video bila musik belum mulai.');
        const YT=await loadYouTubeAPI();if(!wanted||token!==attempt)return;
        if(!player){
          const mount=document.createElement('div');body.append(mount);
          playerReady=new Promise(resolve=>{
            player=new YT.Player(mount,{width:'100%',height:200,videoId:source.id,playerVars:{playsinline:1,controls:1,loop:1,playlist:source.id,origin:location.origin},events:{
              onReady:()=>resolve(),
              onStateChange:event=>{state(event.data===1);if(event.data===1)note.textContent='Musik sedang diputar.';if(event.data===2)wanted=false},
              onAutoplayBlocked:()=>{wanted=false;state(false);note.textContent='Ketuk ▶ pada video untuk memutar musik.'},
              onError:()=>{wanted=false;state(false);note.textContent='Video tidak dapat diputar di sini. Gunakan tautan sumber asli atau pilih video lain.'}
            }});
          });
        }
        await playerReady;if(wanted&&token===attempt)player.playVideo();return;
      }
      if(source.type==='drive'&&driveFrame){
        showDrive();return;
      }
      if(source.type==='audio'||source.type==='drive'){
        if(!audio.src)audio.src=source.url;audio.loop=true;await audio.play();
        if(!wanted||token!==attempt){audio.pause();return}
      }else{
        const AudioContextType=window.AudioContext||window.webkitAudioContext;if(!AudioContextType)throw Error('Audio tidak didukung browser ini.');
        context??=new AudioContextType();await context.resume();if(!wanted||token!==attempt){context.suspend();return}
        if(!timer){playNote(melody[step++%melody.length]);timer=setInterval(()=>playNote(melody[step++%melody.length]),325)}
      }
      state(true);
    }catch(error){
      if(token!==attempt)return;
      wanted=false;state(false);
      if(source.type==='drive'&&error.name!=='NotAllowedError'){showDrive();return}
      if(source.type!=='default')showPanel(error.name==='NotAllowedError'?'Ketuk tombol musik sekali lagi untuk mulai memutar.':error.message||'Musik belum dapat diputar. Gunakan tautan sumber asli.');
      button.title=error.message;
    }
  }
  function showDrive(){
    showPanel('Ketuk ▶ pada pemutar Drive. File harus dapat diakses oleh siapa saja yang memiliki tautan.');
    if(!driveFrame){driveFrame=document.createElement('iframe');driveFrame.title=label+' — Google Drive';driveFrame.allow='autoplay';driveFrame.referrerPolicy='strict-origin-when-cross-origin';body.replaceChildren(driveFrame)}
    if(driveFrame.src!==source.previewUrl)driveFrame.src=source.previewUrl;wanted=true;state(true);button.setAttribute('aria-label','Tutup pemutar Google Drive');
  }
  function stop(){
    wanted=false;++attempt;audio.pause();player?.pauseVideo?.();if(driveFrame)driveFrame.src='about:blank';if(timer){clearInterval(timer);timer=0}context?.suspend();state(false);
  }
  audio.addEventListener('play',()=>{if(wanted)state(true)});
  audio.addEventListener('pause',()=>state(false));
  audio.addEventListener('error',()=>{if(wanted){state(false);if(source.type==='drive')showDrive();else showPanel('File audio belum dapat diputar. Periksa tautannya atau buka sumber asli.')}});
  if(source.type==='audio'||source.type==='drive')audio.src=source.url;
  button.title=label;
  button.addEventListener('click',()=>playing||wanted?stop():play());
  return {play,stop};
}
