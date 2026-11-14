/* Kiểm tra nhanh 1 bộ buff KHÔNG cần node-canvas/mạng: ctx + engine giả (Proxy), chạy 63 tổ hợp (q,e,T), bắt lỗi chạy + NaN.
   Dùng: node tools/nan-harness.js <kind>   (chạy ở gốc repo). Ra "NaN 0" và không có dòng ERR là đạt. KHÔNG xem được hình — chỉ bắt lỗi. */
const fs=require('fs'),P=require('path');global.window=global;
let bad=0,calls=0;
const chk=(n,args)=>{calls++;for(const a of args){if(typeof a==='number'&&!isFinite(a)){bad++;if(bad<6)console.log('NaN in',n,args.slice(0,6))}}};
const mk=()=>new Proxy({},{get:(t,k)=>k==='createRadialGradient'||k==='createLinearGradient'?(...a)=>{chk(k,a);return{addColorStop(){}}}:(...a)=>{chk(String(k),a)},set:()=>true});
const E=new Proxy({},{get:(t,k)=>k==='rgba'?(c,a)=>{if(!isFinite(a)){bad++;console.log('rgba NaN alpha',a)}return'rgba(0,0,0,1)'}:k==='mix'?()=>'#000':(...a)=>{chk('E.'+String(k),a)}});
(0,eval)(fs.readFileSync(P.join(__dirname,'..','41-gear-aura.js'),'utf8'));
const kind=process.argv[2];let n=0;
if(!window.TTGGearAura[kind]){console.log('Không có bộ',kind);process.exit(1)}
for(const q of [0,.3,1])for(const e of [null,0,.2,.5,.9,1.5,3])for(const T of [0,3.1,3.55,3.62,3.7,3.9,4.4,6.6,6.75,6.9,9.7,9.9,10.2,17.77]){try{window.TTGGearAura[kind](mk(),85,q,T,e,E);n++}catch(err){console.log('ERR',q,e,T,err.stack.split('\n').slice(0,2).join('|'));process.exit(1)}}
console.log(kind,'combos',n,'calls',calls,'NaN',bad);
