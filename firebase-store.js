import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import {getAuth,GoogleAuthProvider,onAuthStateChanged,signInWithPopup,signOut} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js';
import {getFirestore,doc,getDoc,runTransaction} from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';

const app=initializeApp({
  apiKey:'AIzaSyDIM6a1PYX8MLMObyLaP6HtOdH0LIK8vdQ',
  authDomain:'undangan-ulang-tahun-anak.firebaseapp.com',
  projectId:'undangan-ulang-tahun-anak',
  storageBucket:'undangan-ulang-tahun-anak.firebasestorage.app',
  messagingSenderId:'1099138920801',
  appId:'1:1099138920801:web:d9fb580a464f8526a71520'
});
const db=getFirestore(app);
const contentRef=doc(db,'invitation','content');
const adminEmail='remajasilo.rs@gmail.com';

export async function loadInvitation(){
  const snapshot=await getDoc(contentRef);
  return snapshot.exists()?snapshot.data().content:null;
}
export function onAdminChange(callback){
  return onAuthStateChanged(getAuth(app),user=>callback(user?.email?.toLowerCase()===adminEmail&&user.emailVerified?user:null));
}
export async function loginAdmin(){
  const auth=getAuth(app);
  if(auth.currentUser&&auth.currentUser.email?.toLowerCase()!==adminEmail)await signOut(auth);
  const result=await signInWithPopup(auth,new GoogleAuthProvider());
  if(result.user.email?.toLowerCase()!==adminEmail||!result.user.emailVerified){await signOut(auth);throw Error('Masuk dengan akun '+adminEmail+'.')}
  return result.user;
}
export async function logoutAdmin(){await signOut(getAuth(app))}
export async function publishInvitation(content,expected){
  const auth=getAuth(app),user=auth.currentUser;
  if(!user||user.email?.toLowerCase()!==adminEmail||!user.emailVerified)throw Error('Masuk dengan akun admin dahulu.');
  const serialized=JSON.stringify(content);
  if(new TextEncoder().encode(serialized).length>950000)throw Error('Total foto terlalu besar. Kurangi jumlah atau ukuran foto.');
  await runTransaction(db,async transaction=>{
    const snapshot=await transaction.get(contentRef);
    const current=snapshot.exists()?snapshot.data().content:expected;
    if(JSON.stringify(current)!==JSON.stringify(expected))throw Error('Undangan sudah diperbarui dari perangkat lain. Unduh cadangan konsep, lalu muat ulang admin.');
    transaction.set(contentRef,{content,revision:(snapshot.exists()?snapshot.data().revision||0:0)+1,updatedAt:Date.now()});
  });
}
