'use strict';
// Public invitation data is independent of Google Sign-In and the guestbook SDK.
export function decodeFirestoreValue(value){
  if('mapValue' in value)return Object.fromEntries(Object.entries(value.mapValue.fields||{}).map(([key,item])=>[key,decodeFirestoreValue(item)]));
  if('arrayValue' in value)return (value.arrayValue.values||[]).map(decodeFirestoreValue);
  if('stringValue' in value)return value.stringValue;
  if('booleanValue' in value)return value.booleanValue;
  if('integerValue' in value)return Number(value.integerValue);
  if('doubleValue' in value)return value.doubleValue;
  if('nullValue' in value)return null;
  return null;
}
export async function loadPublicInvitation(){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch('https://firestore.googleapis.com/v1/projects/undangan-ulang-tahun-anak/databases/(default)/documents/invitation/content',{cache:'no-store',signal:controller.signal});
    if(!response.ok)throw Error('Firebase HTTP '+response.status);
    const document=await response.json(),field=document.fields?.content;
    if(!field)throw Error('Data undangan kosong');
    const content=decodeFirestoreValue(field);
    if(!content?.hero||!content?.event||!content?.extras)throw Error('Data undangan tidak lengkap');
    return content;
  }finally{clearTimeout(timer)}
}
