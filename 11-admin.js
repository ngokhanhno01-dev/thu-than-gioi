/* ===== Bảng Admin =====
   Chỉ hiện / bấm được khi admins/{uid} = true trên Realtime Database.
   Mật khẩu SHA-256 vẫn là lớp thứ hai (ADMIN_HASH).
   Cách thêm admin: Firebase Console → Realtime Database → Data → admins → [uid] = true
   Lấy uid: sau khi đăng nhập, Console gõ firebase.auth().currentUser.uid
*/
const ADMIN_HASH='456ceed90dcb760523a34ba599380cc6c225f2a04eae0d170762c647a0dcd158';
let adminOn=false,adminFail=0,adminLockUntil=0,adminEl=null;
let isAdminUser=false;   // true khi admins/{uid} === true

async function adminCheck(pw){
 if(!(window.crypto&&crypto.subtle))return null;
 const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tt-admin:'+pw));
 return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')===ADMIN_HASH}

async function adminOpen(){
 if(!isAdminUser){log('🔒 Bạn không có quyền admin.');return}
 if(adminOn){adminShow();return}
 const wait=Math.ceil((adminLockUntil-Date.now())/1000);
 if(wait>0){log('🔒 Nhập sai nhiều lần, thử lại sau <b>'+wait+'</b> giây.');return}
 const pw=prompt('Nhập mật khẩu admin');
 if(pw===null)return;
 const ok=await adminCheck(pw);
 if(ok===null){log('🔒 Trình duyệt không hỗ trợ kiểm tra mật khẩu (cần mở bằng https).');return}
 if(!ok){adminFail++;if(adminFail>=3){adminFail=0;adminLockUntil=Date.now()+30000;log('🔒 Sai mật khẩu 3 lần, khóa 30 giây.')}else log('🔒 Sai mật khẩu.');return}
 adminOn=true;adminFail=0;log('🛠️ Đã bật admin.');adminShow()}

const adNum=id=>{const v=Math.floor(Number(document.getElementById(id).value));return v>0?Math.min(v,1e9):0};
function adMsg(h){const d=document.getElementById('ad-msg');if(d)d.innerHTML=h}

/* ===== Gửi quà vào Hộp thư người chơi ===== */
async function adFindUidByNick(nick){
  nick = (nick||'').trim();
  if(!nick) return null;
  if(!window.db && !(window.firebase && firebase.apps.length)) return null;
  const fs = window.db || firebase.firestore();
  const key = nick.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]/g,'');
  if(!key || key.length < 3) return null;
  try{
    const sn = await fs.collection('nicks').doc(key).get();
    if(sn.exists && sn.data().uid) return String(sn.data().uid);
  }catch(e){ console.warn('[admin] find nick', e); }
  return null;
}

async function adSendMail(){
  if(!isAdminUser) return adMsg('Không có quyền admin.');
  const nick = (document.getElementById('ad-gift-nick')||{}).value || '';
  const type = (document.getElementById('ad-gift-type')||{}).value || 'gold';
  const qty  = adNum('ad-gift-qty');
  const title = (document.getElementById('ad-gift-title')||{}).value || 'Quà từ Admin';
  const body  = (document.getElementById('ad-gift-body')||{}).value || 'Bạn nhận được quà từ Ban Quản Trị.';

  if(!nick.trim()) return adMsg('Nhập biệt danh người nhận.');
  if(!qty) return adMsg('Nhập số lượng lớn hơn 0.');

  adMsg('Đang tìm người chơi...');
  const uid = await adFindUidByNick(nick);
  if(!uid) return adMsg('Không tìm thấy biệt danh "<b>'+nick+'</b>".');

  let rdb = null;
  try{
    if(window.TTGNET && TTGNET.rdb) rdb = TTGNET.rdb;
    else if(firebase.apps.length) rdb = firebase.database();
  }catch(_){}
  if(!rdb) return adMsg('Chưa kết nối Realtime Database.');

  const rewards = {};
  if(type === 'gold'){
    rewards.gold = qty;
  } else if(type === 'zone'){
    rewards.chooseZone = true;
    rewards.zoneQty = qty;
  } else {
    rewards.items = [{id: type, q: qty}];
  }

  const mid = 'adm_' + Date.now() + '_' + Math.random().toString(36).slice(2,7);
  const mail = {
    type: 'admin_gift',
    title: title.trim() || 'Quà từ Admin',
    body: body.trim() || 'Bạn nhận được quà từ Ban Quản Trị.',
    rewards: rewards,
    claimed: false,
    t: Date.now()
  };

  try{
    await rdb.ref('mail/' + uid + '/' + mid).set(mail);
    adMsg('✅ Đã gửi thư cho <b>'+nick+'</b> (uid: '+uid.slice(0,8)+'…).');
    log('🛠️ Admin gửi quà vào hộp thư của <b>'+nick+'</b>.');
  }catch(e){
    console.warn('[admin] send mail', e);
    adMsg('❌ Gửi thất bại: '+(e.message||e));
  }
}

/* ===== 🕵️ Người chơi đáng ngờ =====
   Quét bảng xếp hạng mùa hiện tại + các BÁO CÁO của người chơi (27-report.js), tìm dấu hiệu gian lận.
   Mỗi dấu hiệu có nút Xem: số liệu cụ thể + giải thích + lý do có thể vô tội. Khóa là quyết định của bạn.
   Chỉ nhìn được dữ liệu công khai (seasonRank, thẻ thú, báo cáo). KHÔNG thấy xu/balo trong save (save là riêng tư).
   Luật tính ngưỡng lấy từ game (đổi ở đây nếu sau này đổi luật):
   - Thắng 1 trận cộng tối đa 28 uy danh, kỹ năng Danh vọng cộng thêm tối đa +60% => 28×1,6 ≈ 45 / trận
   - Mỗi trận tốn 1 vé; vé tối đa 10, hồi 1 vé / 30 phút; mùa 7 ngày bắt đầu 00:00 thứ Hai giờ VN
   Báo cáo: REP_MIN người KHÁC NHAU báo cáo thì mới tính "nhiều người báo cáo". Tài khoản báo cáo từ REP_MASS người trở lên
   bị coi là báo cáo hàng loạt (có thể trả đũa/phá) và KHÔNG được tính. Báo cáo chỉ là gợi ý, không phải bằng chứng. */
const ADS={FAME_FIGHT:45,SLACK:20,TICKET_MAX:10,REGEN_MS:30*60*1000,START:Date.parse('2026-11-09T00:00:00+07:00'),WEEK:7*24*3600*1000,TOP:200,REP_MIN:3,REP_MASS:8,REP_LOOK:40,IGN:'ttg_adm_ign',SNAP:'ttg_adm_snap_'};
const ADS_RS={fame:'Uy danh tăng nhanh / cao phi lý',pet:'Thú hoặc chỉ số mạnh phi lý',gold:'Xu / vật phẩm nhiều phi lý',other:'Lý do khác'};
let adSusRows=[],adSusBanned={},adSusSeason=0,adSusTotal=0,adSusHadPrev=false,adSusMass=0,adSusRepErr=false;

const adEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function adRdb(){try{if(window.TTGNET&&TTGNET.rdb)return TTGNET.rdb}catch(_){}try{if(window.firebase&&firebase.apps.length)return firebase.database()}catch(_){}return null}
function adNow(){try{if(window.TTGSEASON&&TTGSEASON.nowSrv)return TTGSEASON.nowSrv()}catch(_){}try{if(window.TTGNET&&TTGNET.offset)return Date.now()+(TTGNET.offset()||0)}catch(_){}return Date.now()}
function adSeasonInfo(){   /* ưu tiên lấy từ module mùa của game, không có thì dùng hằng số ở trên */
  let st=ADS.START,wk=ADS.WEEK,tm=ADS.TICKET_MAX,rg=ADS.REGEN_MS;
  try{if(window.TTGSEASON){st=TTGSEASON.START_MONDAY_MS||st;wk=TTGSEASON.WEEK_MS||wk;tm=TTGSEASON.TICKET_MAX||tm;rg=TTGSEASON.TICKET_REGEN_MS||rg}}catch(_){}
  const n=adNow(),s=n<st?1:Math.max(1,Math.floor((n-st)/wk)+1);
  return{season:s,begin:st+(s-1)*wk,tm:tm,rg:rg}}
function adIgn(){try{return JSON.parse(localStorage.getItem(ADS.IGN)||'{}')||{}}catch(_){return{}}}
function adIgnGet(g,uid){const x=g[uid];if(x==null)return null;return typeof x==='object'?{f:Number(x.f)||0,n:Number(x.n)||0}:{f:Number(x)||0,n:0}}
function adFmtT(t){try{return new Date(t).toLocaleString('vi-VN')}catch(_){return String(t)}}
function adMaxFights(el,I){return I.tm+Math.floor(Math.max(0,el)/I.rg)+1}
const adHasData=v=>v&&v.fame!==undefined;

/* Phân tích số liệu 1 người -> danh sách dấu hiệu. sev: 3 = không thể xảy ra khi chơi bình thường, 2 = rất bất thường, 1 = chỉ để theo dõi */
function adSusAnalyze(v,I,prev){
  const fl=[],T=adNow();
  const fame=Number(v.fame),wins=Number(v.wins),foes=Number(v.foes),t=Number(v.t)||T;
  const bad=x=>!isFinite(x)||x<0||Math.floor(x)!==x||x>1e7;
  if(bad(fame)||bad(wins)||bad(foes)){
    fl.push({sev:3,code:'GIA_TRI_LA',title:'Giá trị không hợp lệ',
      info:'Uy danh = '+adEsc(v.fame)+', thắng = '+adEsc(v.wins)+', đối thủ = '+adEsc(v.foes)+'. Game luôn ghi số nguyên không âm, và không bao giờ lớn đến mức này.',
      ok:'Gần như không có lý do vô tội: game không tạo ra số như vậy.'});
    return fl}
  const el=Math.max(0,Math.min(t,T)-I.begin),fights=adMaxFights(el,I),cap=fights*ADS.FAME_FIGHT+ADS.SLACK;
  const days=(el/86400000).toFixed(1);
  if(fame>cap){
    fl.push({sev:3,code:'FAME_VUOT_TRAN',title:'Uy danh vượt mức tối đa có thể đạt trong mùa',
      info:'Uy danh <b>'+fame+'</b>, trong khi sau '+days+' ngày của mùa chỉ đánh được tối đa <b>'+fights+'</b> trận (vé đầu mùa '+I.tm+' + hồi 1 vé/30 phút). Dù trận nào cũng thắng với thưởng cao nhất ('+ADS.FAME_FIGHT+'/trận) cũng chỉ được <b>'+cap+'</b>.',
      ok:'Có thể vô tội nếu: bạn đổi luật game (tăng thưởng/vé) mà chưa sửa ngưỡng trong code admin, hoặc đây là tài khoản test mà bạn dùng nút "+ Uy danh". Ngoài ra là rất đáng ngờ.'})}
  else if(fame>cap*0.7&&fame>300){
    fl.push({sev:1,code:'FAME_GAN_TRAN',title:'Uy danh gần mức tối đa lý thuyết',
      info:'Uy danh <b>'+fame+'</b> bằng '+Math.round(fame/cap*100)+'% mức tối đa lý thuyết ('+cap+'). Muốn vậy phải dùng hết mọi vé, thắng gần như mọi trận, mỗi trận đều thưởng cao.',
      ok:'Người chơi rất chăm và may mắn vẫn có thể đạt. Một mình dấu hiệu này không đủ để khóa.'})}
  if(wins>fights){
    fl.push({sev:3,code:'WINS_VUOT',title:'Số trận thắng vượt số trận có thể đánh',
      info:'Thắng <b>'+wins+'</b> trận trước người chơi thật, nhưng sau '+days+' ngày chỉ đánh được tối đa <b>'+fights+'</b> trận.',
      ok:'Có thể vô tội nếu bạn đã đổi luật vé. Ngoài ra rất đáng ngờ.'})}
  if(foes>wins){
    fl.push({sev:2,code:'FOES_LON_WINS',title:'Số đối thủ khác nhau đã thắng lớn hơn số trận thắng',
      info:'Đối thủ khác nhau = <b>'+foes+'</b>, số trận thắng = <b>'+wins+'</b>. Mỗi đối thủ mới phải ứng với ít nhất 1 trận thắng nên không thể có đối thủ nhiều hơn.',
      ok:'Có thể do lỗi đồng bộ khi một người chơi cùng lúc ở hai thiết bị. Nếu chỉ dấu hiệu này thì chưa nên khóa.'})}
  if(prev&&prev.s===I.season&&t>prev.t&&fame>prev.f){
    const dt=t-prev.t,dm=fame-prev.f,allow=adMaxFights(dt,I)*ADS.FAME_FIGHT+ADS.SLACK;
    if(dm>allow){
      fl.push({sev:3,code:'TANG_NHANH',title:'Uy danh tăng nhanh hơn mức có thể',
        info:'Từ lần quét trước ('+adFmtT(prev.t)+') uy danh tăng <b>+'+dm+'</b> (từ '+prev.f+' lên '+fame+') trong '+Math.round(dt/60000)+' phút. Tối đa có thể đạt trong khoảng đó là <b>'+allow+'</b>.',
        ok:'Có thể vô tội nếu bạn vừa cộng uy danh thử bằng nút admin. Ngoài ra rất đáng ngờ.'})}}
  return fl}

/* Gom báo cáo của 1 người bị báo cáo. rcount = số báo cáo mỗi người báo đã gửi (để loại người báo hàng loạt) */
function adRepInfo(o,rcount){
  if(!o)return null;
  const list=[];
  Object.keys(o).forEach(rp=>{const x=o[rp]||{};list.push({by:rp,r:String(x.r||''),t:Number(x.t)||0,n:x.n,mass:(rcount[rp]||0)>=ADS.REP_MASS})});
  const ok=list.filter(x=>!x.mass),rs={};
  ok.forEach(x=>{rs[x.r]=(rs[x.r]||0)+1});
  return{all:list.length,ok:ok.length,massN:list.length-ok.length,reasons:rs,last:list.reduce((a,x)=>Math.max(a,x.t),0),nick:(list.find(x=>x.n)||{}).n||''}}
function adRepReasons(rp){return Object.keys(rp.reasons).map(k=>(ADS_RS[k]||adEsc(k))+' ×'+rp.reasons[k]).join('; ')}
function adRepFlag(rp){
  if(!rp||!rp.ok)return null;
  const info='<b>'+rp.ok+'</b> người chơi khác nhau báo cáo người này'+(rp.massN?' (đã loại '+rp.massN+' báo cáo từ tài khoản báo hàng loạt)':'')+'. Lý do: '+adRepReasons(rp)+'. Gần nhất: '+adFmtT(rp.last)+'.';
  const ok='Báo cáo chỉ là ý kiến, không phải bằng chứng. Có thể do ganh ghét, hiểu lầm (thấy người khác mạnh nên nghi ngờ) hoặc rủ nhau báo cáo. Hãy đối chiếu với số liệu ở trên rồi mới quyết định.';
  return rp.ok>=ADS.REP_MIN?{sev:2,code:'BAO_CAO_NHIEU',title:'Nhiều người chơi báo cáo ('+rp.ok+' người)',info:info,ok:ok}
                          :{sev:1,code:'BAO_CAO_IT',title:'Có người chơi báo cáo ('+rp.ok+' người)',info:info,ok:ok+' Mới '+rp.ok+' người báo nên chưa đủ để coi là đáng chú ý.'}}

async function adSusScan(){
  if(!isAdminUser)return adMsg('Không có quyền admin.');
  const rdb=adRdb();if(!rdb)return adMsg('Chưa kết nối Realtime Database.');
  const box=document.getElementById('ad-sus');if(box)box.innerHTML='<div style="font-size:11px;color:#ffc978">Đang quét...</div>';
  const I=adSeasonInfo();adSusSeason=I.season;
  let snap;
  try{snap=await rdb.ref('seasonRank/'+I.season).orderByChild('fame').limitToLast(ADS.TOP).once('value')}
  catch(e){console.warn('[admin] quét',e);if(box)box.innerHTML='<div style="font-size:11px;color:#ff9a8a">❌ Không đọc được bảng xếp hạng: '+adEsc(e.message||e)+'</div>';return}
  adSusBanned={};
  try{const b=await rdb.ref('banned').once('value');adSusBanned=b.val()||{}}catch(e){console.warn('[admin] đọc danh sách khóa (đã Publish Rules mới chưa?)',e)}
  let reps={};adSusRepErr=false;
  try{const r=await rdb.ref('reports').once('value');reps=r.val()||{}}catch(e){adSusRepErr=true;console.warn('[admin] đọc báo cáo (đã Publish Rules mới chưa?)',e)}
  const rcount={};
  Object.keys(reps).forEach(tg=>Object.keys(reps[tg]||{}).forEach(rp=>{rcount[rp]=(rcount[rp]||0)+1}));
  adSusMass=Object.keys(rcount).filter(k=>rcount[k]>=ADS.REP_MASS).length;
  let prevAll={};try{prevAll=JSON.parse(localStorage.getItem(ADS.SNAP+I.season)||'{}')||{}}catch(_){}
  const ign=adIgn(),rows=[],seen={},nextSnap={};let total=0;
  const addRow=(uid,v,hasData,rep,prev)=>{
    const fl=hasData?adSusAnalyze(v,I,prev):[];
    const rf=adRepFlag(rep);if(rf)fl.push(rf);
    const banned=!!adSusBanned[uid];
    if(!fl.length&&!banned)return;
    const mx=fl.reduce((a,f)=>Math.max(a,f.sev),0);
    const g=adIgnGet(ign,uid);
    if(!banned&&g&&(Number(v.fame)||0)<=g.f&&(rep?rep.ok:0)<=g.n)return;   /* đã bấm Bỏ qua và chưa có gì mới */
    rows.push({uid:uid,v:v,hasData:hasData,fl:fl,mx:mx,rep:rep,banned:banned,card:undefined})};
  snap.forEach(ch=>{
    const uid=ch.key,v=ch.val()||{};total++;seen[uid]=1;
    const p=prevAll[uid]?{f:prevAll[uid][0],t:prevAll[uid][1],s:I.season}:null;
    nextSnap[uid]=[Number(v.fame)||0,Number(v.t)||0];
    addRow(uid,v,true,adRepInfo(reps[uid],rcount),p)});
  /* người bị báo cáo nhưng không nằm trong top: lấy riêng hàng của họ (tối đa REP_LOOK người, nhiều báo cáo nhất trước) */
  const extra=Object.keys(reps).filter(uid=>!seen[uid]).map(uid=>({uid:uid,rep:adRepInfo(reps[uid],rcount)}))
    .filter(x=>x.rep&&x.rep.ok>0).sort((a,b)=>b.rep.ok-a.rep.ok).slice(0,ADS.REP_LOOK);
  await Promise.all(extra.map(async x=>{
    let v=null;try{const s=await rdb.ref('seasonRank/'+I.season+'/'+x.uid).once('value');if(s.exists())v=s.val()}catch(_){}
    const has=!!v&&adHasData(v);
    addRow(x.uid,has?v:{nick:x.rep.nick||'(không rõ)'},has,x.rep,null)}));
  try{localStorage.setItem(ADS.SNAP+I.season,JSON.stringify(nextSnap))}catch(_){}
  rows.sort((a,b)=>(b.mx-a.mx)||((b.rep?b.rep.ok:0)-(a.rep?a.rep.ok:0))||((Number(b.v.fame)||0)-(Number(a.v.fame)||0)));
  adSusRows=rows;adSusTotal=total;adSusHadPrev=Object.keys(prevAll).length>0;adSusDraw()}

function adSusBadge(mx){return mx>=3?'<span style="color:#ff6a5a">🔴 Rất đáng ngờ</span>':mx==2?'<span style="color:#ffa24a">🟠 Bất thường</span>':'<span style="color:#ffd24a">🟡 Theo dõi</span>'}
function adSusDraw(){
  const total=adSusTotal,hadPrev=adSusHadPrev,box=document.getElementById('ad-sus');if(!box)return;
  const live=adSusRows.filter(r=>!r.banned),locked=Object.keys(adSusBanned);
  let h='<div style="font-size:10.5px;color:#b9a9a2;margin:4px 0">Mùa '+adSusSeason+' · quét '+total+' người đứng đầu + người bị báo cáo · '+live.length+' đáng ngờ'+(hadPrev?'':' · <i>(lần quét đầu: chưa so được tốc độ tăng, hãy quét lại sau)</i>')+'</div>';
  if(adSusRepErr)h+='<div style="font-size:10.5px;color:#ff9a8a;margin:3px 0">⚠️ Không đọc được báo cáo người chơi (đã Publish Rules mới chưa?).</div>';
  if(adSusMass)h+='<div style="font-size:10.5px;color:#ffa24a;margin:3px 0">⚠️ Có '+adSusMass+' tài khoản báo cáo hàng loạt (từ '+ADS.REP_MASS+' người trở lên). Báo cáo của họ không được tính.</div>';
  if(!live.length)h+='<div style="font-size:11.5px;color:#72e4b0;margin:8px 0">✅ Không thấy ai có dấu hiệu bất thường.</div>';
  live.forEach(r=>{const i=adSusRows.indexOf(r);
    h+='<div style="border:1px solid #3a2a33;border-radius:6px;margin:5px 0;padding:6px;text-align:left;background:#1a1117">'+
      '<div style="display:flex;align-items:center;gap:6px"><div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+adEsc(r.v.nick||'(không tên)')+'</div>'+
      '<div style="font-size:10.5px">'+(r.hasData?'Uy danh '+adEsc(r.v.fame):'Chưa có hàng xếp hạng')+(r.rep&&r.rep.ok?' · 🚩 '+r.rep.ok+' báo cáo':'')+' · '+adSusBadge(r.mx)+'</div></div>'+
      '<button class="ad-b" onclick="adSusView('+i+')">👁️ Xem</button></div>'+
      '<div id="ad-sd-'+i+'" style="display:none"></div></div>'});
  if(locked.length){
    h+='<div style="margin:10px 0 2px;font-size:11px;color:#ff9a8a;border-top:1px solid #3a2a33;padding-top:6px">🔒 Đang bị khóa ('+locked.length+')</div>';
    locked.forEach(uid=>{const b=adSusBanned[uid]||{};
      h+='<div style="display:flex;align-items:center;gap:6px;margin:4px 0;text-align:left"><div style="flex:1;min-width:0;font-size:11px"><b>'+adEsc(b.nick||uid.slice(0,8))+'</b><br><span style="color:#b9a9a2">'+adEsc(b.why||'')+(b.t?' · '+adFmtT(b.t):'')+'</span></div>'+
        '<button class="ad-b" data-u="'+adEsc(uid)+'" onclick="adSusUnban(this.dataset.u)">Mở khóa</button></div>'})}
  box.innerHTML=h}

async function adSusView(i){
  const r=adSusRows[i],d=document.getElementById('ad-sd-'+i);if(!r||!d)return;
  if(d.style.display==='block'){d.style.display='none';return}
  d.style.display='block';
  if(r.card===undefined){   /* lấy thẻ thú công khai để đối chiếu cấp */
    d.innerHTML='<div style="font-size:11px;color:#ffc978;margin-top:6px">Đang tải chi tiết...</div>';
    r.card=null;
    try{const fs=window.db||firebase.firestore(),sn=await fs.collection('cards').doc(r.uid).get();if(sn.exists)r.card=sn.data()}catch(e){console.warn('[admin] thẻ thú',e);r.card=false}
    if(r.hasData&&r.card&&Number.isFinite(Number(r.card.lv))&&Math.abs(Number(r.card.lv)-Number(r.v.lv))>=10&&!r.fl.some(f=>f.code==='LV_LECH')){
      r.fl.push({sev:1,code:'LV_LECH',title:'Cấp trên bảng xếp hạng lệch cấp trên thẻ thú',
        info:'Bảng xếp hạng ghi cấp <b>'+adEsc(r.v.lv)+'</b>, thẻ thú ghi cấp <b>'+adEsc(r.card.lv)+'</b>.',
        ok:'Thường vô tội: hai nơi cập nhật vào lúc khác nhau, thẻ thú có thể chưa kịp đồng bộ.'});
      r.mx=Math.max(r.mx,1)}}
  let h='<div style="margin-top:6px;border-top:1px dashed #3a2a33;padding-top:6px;font-size:11px;line-height:1.45">';
  h+=r.hasData
    ?'<div style="color:#b9a9a2">Cấp '+adEsc(r.v.lv)+' · thắng '+adEsc(r.v.wins)+' · đối thủ '+adEsc(r.v.foes)+' · bị trừ '+adEsc(r.v.lost||0)+'<br>Ghi lần cuối: '+(r.v.t?adFmtT(r.v.t):'?')+' · uid '+adEsc(r.uid.slice(0,8))+'…</div>'
    :'<div style="color:#b9a9a2">Không có hàng xếp hạng mùa này (chưa đánh trận nào trong mùa) · uid '+adEsc(r.uid.slice(0,8))+'…</div>';
  if(r.card)h+='<div style="color:#b9a9a2;margin-top:3px">Thẻ thú: cấp '+adEsc(r.card.lv)+', huyết mạch +'+adEsc(r.card.up)+', phẩm '+adEsc(r.card.q)+'</div>';
  else if(r.card===null)h+='<div style="color:#b9a9a2;margin-top:3px">Chưa có thẻ thú công khai.</div>';
  r.fl.slice().sort((a,b)=>b.sev-a.sev).forEach(f=>{
    h+='<div style="margin-top:7px;padding:6px;border-radius:5px;background:#241820"><div style="font-weight:800">'+(f.sev>=3?'🔴':f.sev==2?'🟠':'🟡')+' '+f.title+'</div>'+
      '<div style="margin-top:2px">'+f.info+'</div><div style="margin-top:3px;color:#9fe0c0">💡 '+f.ok+'</div></div>'});
  const hi=r.fl.filter(f=>f.sev>=3).length;
  h+='<div style="margin-top:8px;font-weight:800;color:'+(hi?'#ff9a8a':'#ffd24a')+'">'+
    (hi?'Kết luận gợi ý: có '+hi+' dấu hiệu không thể xảy ra khi chơi bình thường. Hãy đọc kỹ phần 💡 rồi mới khóa.':'Kết luận gợi ý: chưa có số liệu nào không thể xảy ra. Báo cáo/dấu hiệu nhẹ chưa đủ căn cứ để khóa; nên bỏ qua hoặc quét lại sau.')+'</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px"><button class="ad-b" style="flex:1;width:auto;border-color:#ff7654;background:#a72f42" onclick="adSusBan('+i+')">🔒 Khóa</button>'+
    '<button class="ad-b" style="flex:1;width:auto" onclick="adSusIgnore('+i+')">Bỏ qua</button></div>'+
    (r.rep&&r.rep.all?'<div style="margin-top:6px"><button class="ad-b" style="width:100%" onclick="adSusClearRep('+i+')">✔️ Đã xử lý, xóa báo cáo</button></div>':'')+'</div>';
  d.innerHTML=h}

function adSusIgnore(i){const r=adSusRows[i];if(!r)return;const g=adIgn();g[r.uid]={f:Number(r.v.fame)||0,n:r.rep?r.rep.ok:0};try{localStorage.setItem(ADS.IGN,JSON.stringify(g))}catch(_){}
  adSusRows.splice(i,1);adSusDraw();adMsg('Đã bỏ qua <b>'+adEsc(r.v.nick)+'</b> (hiện lại nếu uy danh tăng thêm hoặc có thêm báo cáo).')}

async function adSusClearRep(i){
  const r=adSusRows[i];if(!r)return;const rdb=adRdb();if(!rdb)return adMsg('Chưa kết nối Realtime Database.');
  if(!confirm('Xóa '+r.rep.all+' báo cáo về "'+(r.v.nick||r.uid)+'"?\n\nNgười đã báo cáo có thể báo lại nếu thấy vấn đề mới.'))return;
  try{await rdb.ref('reports/'+r.uid).remove();adMsg('✔️ Đã xóa báo cáo về <b>'+adEsc(r.v.nick)+'</b>.');adSusScan()}
  catch(e){console.warn('[admin] xóa báo cáo',e);adMsg('❌ Xóa thất bại: '+adEsc(e.message||e)+' (đã Publish Rules mới chưa?)')}}

async function adSusBan(i){
  const r=adSusRows[i];if(!r)return;
  const rdb=adRdb();if(!rdb)return adMsg('Chưa kết nối Realtime Database.');
  const me=(()=>{try{return firebase.auth().currentUser.uid}catch(_){return null}})();if(!me)return adMsg('Chưa đăng nhập.');
  const why=prompt('Lý do khóa (ghi lại để sau này xem lại):',r.fl.filter(f=>f.sev>=2).map(f=>f.code).join(', '));if(why===null)return;
  if(!confirm('Khóa "'+(r.v.nick||r.uid)+'"?\n\n• Không ghi được bảng xếp hạng, chat, trận đấu trường.\n• Bị gỡ khỏi bảng xếp hạng mùa này.\n• Dữ liệu KHÔNG bị xóa, có thể mở khóa lại.'))return;
  const up={};
  up['banned/'+r.uid]={nick:String(r.v.nick||'').slice(0,20),why:String(why).slice(0,200),by:me,t:firebase.database.ServerValue.TIMESTAMP};
  if(r.hasData)up['seasonRank/'+adSusSeason+'/'+r.uid]=null;
  try{await rdb.ref().update(up);adMsg('🔒 Đã khóa <b>'+adEsc(r.v.nick)+'</b>.');log('🛠️ Admin khóa <b>'+adEsc(r.v.nick)+'</b>.');adSusScan()}
  catch(e){console.warn('[admin] khóa',e);adMsg('❌ Khóa thất bại: '+adEsc(e.message||e)+' (đã Publish Rules Realtime Database mới chưa?)')}}

async function adSusUnban(uid){
  const rdb=adRdb();if(!rdb||!uid)return;
  const b=adSusBanned[uid]||{};if(!confirm('Mở khóa "'+(b.nick||uid)+'"?'))return;
  try{await rdb.ref('banned/'+uid).remove();adMsg('🔓 Đã mở khóa <b>'+adEsc(b.nick||uid.slice(0,8))+'</b>.');adSusScan()}
  catch(e){adMsg('❌ Mở khóa thất bại: '+adEsc(e.message||e))}}

function adGold(){const n=adNum('ad-gold');if(!n)return adMsg('Nhập số lớn hơn 0.');gold+=n;stats();adMsg('+'+n+' xu.');log('🛠️ Admin: +'+n+' xu.')}
function adFame(){const n=adNum('ad-fame');if(!n)return adMsg('Nhập số lớn hơn 0.');fame+=n;stats();adMsg('+'+n+' uy danh.');log('🛠️ Admin: +'+n+' uy danh.')}
function adExp(){if(!hatched)return adMsg('Cần nở thú trước.');const n=adNum('ad-exp');if(!n)return adMsg('Nhập số lớn hơn 0.');addExp(n);adMsg('+'+n+' EXP (cấp '+level+').');log('🛠️ Admin: +'+n+' EXP.')}
function adLevel(){if(!hatched)return adMsg('Cần nở thú trước.');const n=adNum('ad-lv');if(!n)return adMsg('Nhập số lớn hơn 0.');
 const l0=level;for(let i=0;i<n&&level<MAXLV;i++)addExp(expNeed(level)-exp);adMsg('Cấp '+l0+' → '+level+'.');log('🛠️ Admin: cấp '+l0+' → '+level+'.')}
function adItem(){const id=document.getElementById('ad-item').value,n=adNum('ad-iqty');if(!n)return adMsg('Nhập số lượng lớn hơn 0.');
 const a=addItem(id,n);adMsg(a?'Thêm '+ITEMS[id].n+' ×'+a+(a<n?' (balo đầy, thiếu '+(n-a)+')':'')+'.':'Balo đầy.');if(a)log('🛠️ Admin: +'+ITEMS[id].n+' ×'+a+'.')}
function adBuff(){const k=document.getElementById('ad-buff').value,n=adNum('ad-bturn');if(!n)return adMsg('Nhập số trận lớn hơn 0.');
 buffs[k]+=n;adMsg(BUFF_NAME[k]+' ×'+BUFF_MUL[k]+': còn '+buffs[k]+' trận thắng.');log('🛠️ Admin: thuốc '+BUFF_NAME[k]+' +'+n+' trận.');adRefresh()}
function adClearBag(){if(!confirm('Xóa toàn bộ vật phẩm trong balo?'))return;bag.length=0;bagSel=-1;renderBag();adMsg('Đã dọn balo.')}
function adRefreshAll(){stats();updateStage();renderExp();renderInfo();
 try{if(typeof renderBlood==='function'&&pet)renderBlood()}catch(e){}
 try{if(typeof renderEquip==='function')renderEquip()}catch(e){}}
function adZoneMats(){const z=+document.getElementById('ad-zone').value,n=adNum('ad-zqty');if(!n)return adMsg('Nhập số lượng lớn hơn 0.');
 const ids=[ZB_ID(z)];for(let s2=0;s2<5;s2++)ids.push(ZM_ID(z,s2));
 let got=0,miss=0;ids.forEach(id=>{const a=addItem(id,n);got+=a;miss+=n-a});
 adMsg('Bộ '+VAN_KIEP_ZONES[z].name+': thêm '+got+' nguyên liệu'+(miss?' (balo đầy, thiếu '+miss+')':'')+'.');log('🛠️ Admin: nguyên liệu rèn bộ '+VAN_KIEP_ZONES[z].name+' ×'+n+' mỗi loại.')}
function adSetLv(){if(!hatched)return adMsg('Cần nở thú trước (dùng nút Thú mới).');
 const n=Math.floor(Number(document.getElementById('ad-setlv').value));if(!(n>=1))return adMsg('Nhập cấp từ 1 đến '+MAXLV+'.');
 const l0=level;level=Math.min(MAXLV,n);exp=0;adRefreshAll();adMsg('Cấp '+l0+' → '+level+'.');log('🛠️ Admin: đặt cấp '+l0+' → '+level+'.')}
function adSetUp(){if(!hatched||!pet)return adMsg('Cần nở thú trước.');
 const n=Math.floor(Number(document.getElementById('ad-up').value));if(!(n>=0))return adMsg('Nhập từ 0 đến 10.');
 pet.up=Math.min(10,n);adRefreshAll();adMsg('Huyết mạch +'+pet.up+'.');log('🛠️ Admin: đặt huyết mạch +'+pet.up+'.')}
function adNewPet(){const q=+document.getElementById('ad-pq').value,sp=document.getElementById('ad-psp').value;
 if(!confirm('Tạo thú mới? Thú hiện tại sẽ bị thay (cấp, xu, balo, trang bị giữ nguyên).'))return;
 eggQ=q;if(!hatched){chosen=true;hatch()}else{pet=rollPet()}
 if(sp!=='r')pet.sp=+sp;
 pet.up=0;adRefreshAll();
 adMsg('Thú mới: '+genOf(pet.bl,pet.sp).name+' · phẩm '+QN[pet.q]+'.');log('🛠️ Admin: tạo thú mới <b>'+genOf(pet.bl,pet.sp).name+'</b> (phẩm '+QN[pet.q]+').')}
function adSpeed(){BSPD=+document.getElementById('ad-spd').value||1;adMsg('Thám hiểm + trận đấu: tốc độ ×'+BSPD+(BSPD>1?' (áp dụng từ trận kế tiếp).':'.'));log('🛠️ Admin: tốc độ thám hiểm ×'+BSPD+'.')}
function adLock(){BSPD=1;adminOn=false;if(adminEl)adminEl.style.display='none';log('🛠️ Đã khóa admin.')}
function adClose(){if(adminEl)adminEl.style.display='none'}
function adRefresh(){const d=document.getElementById('ad-buffs');if(d)d.textContent=buffLine()}
function adRow(label,idv,def,btn,fn){return'<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><span style="flex:none;width:62px;text-align:left;font-size:11.5px">'+label+'</span>'+
 '<input id="'+idv+'" type="number" min="1" value="'+def+'" inputmode="numeric" style="flex:1;min-width:0;width:auto;padding:5px">'+
 '<button class="ad-b" onclick="'+fn+'()">'+btn+'</button></div>'}
function adminShow(){
 if(!adminEl){
  adminEl=document.createElement('div');adminEl.id='admin-ov';
  adminEl.style.cssText='position:fixed;inset:0;z-index:60;display:none;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;background:#100a11;color:#f6e9e4;text-align:center;padding:12px 10px;box-sizing:border-box';
  const st=document.createElement('style');
  st.textContent='.ad-b{width:74px;flex:none;padding:5px 0;margin:0;font-size:12px;font-weight:800;line-height:1.1}#admin-ov>*{width:100%;max-width:360px;box-sizing:border-box}';
  document.head.appendChild(st);document.body.appendChild(adminEl)}
 const opts=Object.keys(ITEMS).map(id=>'<option value="'+id+'">'+(ITEMS[id].e||ITEMS[id].i)+' '+ITEMS[id].n+'</option>').join('');
 const zopts=VAN_KIEP_ZONES.map((z,i)=>'<option value="'+i+'">'+(i+1)+'. '+z.name+' (cấp '+VAN_KIEP_ZONE_BOUNDS[i].start+'+)</option>').join('');
 const spopts='<option value="r">🎲 Vùng ngẫu nhiên</option>'+EPI.map((e,i)=>'<option value="'+i+'">'+e[0]+'</option>').join('');
 const qopts=QN.map((n,i)=>'<option value="'+i+'">'+n+' phẩm</option>').join('');
 adminEl.innerHTML='<div style="font-size:15px;font-weight:900;color:#ffd24a">🛠️ Admin</div>'+
  '<div id="ad-buffs" style="font-size:10.5px;color:#72e4b0;margin:2px 0 6px"></div>'+
  adRow('🪙 Xu','ad-gold',1000,'+ Xu','adGold')+
  adRow('✨ EXP','ad-exp',500,'+ EXP','adExp')+
  adRow('⬆️ Cấp','ad-lv',1,'Lên cấp','adLevel')+
  adRow('🏅 Uy danh','ad-fame',100,'+ Uy danh','adFame')+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><select id="ad-item" style="flex:1;min-width:0;width:auto;padding:5px">'+opts+'</select>'+
  '<input id="ad-iqty" type="number" min="1" value="10" inputmode="numeric" style="flex:none;width:52px;padding:5px"><button class="ad-b" onclick="adItem()">+ Item</button></div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><select id="ad-buff" style="flex:1;min-width:0;width:auto;padding:5px"><option value="exp">🧪 ×2 EXP</option><option value="xu">🏺 ×2 Xu</option><option value="drop">⚗️ ×2 Rơi</option></select>'+
  '<input id="ad-bturn" type="number" min="1" value="50" inputmode="numeric" style="flex:none;width:52px;padding:5px"><button class="ad-b" onclick="adBuff()">Bật buff</button></div>'+
  '<div style="margin:8px 0 2px;font-size:11px;color:#ffd24a;border-top:1px solid #3a2a33;padding-top:6px">🔨 Test trang bị</div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><select id="ad-zone" style="flex:1;min-width:0;width:auto;padding:5px">'+zopts+'</select>'+
  '<input id="ad-zqty" type="number" min="1" value="30" inputmode="numeric" style="flex:none;width:52px;padding:5px"><button class="ad-b" onclick="adZoneMats()">+ Rèn</button></div>'+
  '<div style="margin:8px 0 2px;font-size:11px;color:#ffd24a;border-top:1px solid #3a2a33;padding-top:6px">🐾 Test thú</div>'+
  adRow('📌 Đặt cấp','ad-setlv',50,'Đặt cấp','adSetLv')+
  adRow('🩸 Huyết mạch','ad-up',5,'Đặt +N','adSetUp')+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><select id="ad-psp" style="flex:1;min-width:0;width:auto;padding:5px">'+spopts+'</select>'+
  '<select id="ad-pq" style="flex:none;width:92px;padding:5px">'+qopts+'</select><button class="ad-b" onclick="adNewPet()">Thú mới</button></div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><span style="flex:none;width:62px;text-align:left;font-size:11.5px">⏩ Tốc độ</span><select id="ad-spd" style="flex:1;min-width:0;width:auto;padding:5px">'+[1,2,3,4].map(v=>'<option value="'+v+'"'+(v===BSPD?' selected':'')+'>×'+v+(v===1?' (bình thường)':' nhanh hơn')+'</option>').join('')+'</select><button class="ad-b" onclick="adSpeed()">Đặt</button></div>'+
  
  '<div style="margin:10px 0 2px;font-size:12px;color:#72e4b0;border-top:1px solid #3a2a33;padding-top:8px">🎁 Gửi quà vào Hộp thư người chơi</div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><input id="ad-gift-nick" placeholder="Biệt danh người nhận" style="flex:1;min-width:0;padding:5px;font-size:12px"></div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0">'+
    '<select id="ad-gift-type" style="flex:1;min-width:0;width:auto;padding:5px;font-size:12px">'+
      '<option value="gold">🪙 Xu</option>'+
      '<option value="hopnl">🎁 Hộp Nguyên Liệu (người nhận tự chọn vùng khi dùng)</option>'+
      '<option value="dan">💊 Linh Đan</option>'+
      '<option value="qua">🍎 Linh Quả</option>'+
    '</select>'+
    '<input id="ad-gift-qty" type="number" min="1" value="100" inputmode="numeric" style="flex:none;width:60px;padding:5px">'+
  '</div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><input id="ad-gift-title" placeholder="Tiêu đề thư (tuỳ chọn)" style="flex:1;min-width:0;padding:5px;font-size:12px"></div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><input id="ad-gift-body" placeholder="Nội dung thư (tuỳ chọn)" style="flex:1;min-width:0;padding:5px;font-size:12px"></div>'+
  '<div style="margin:6px 0"><button class="ad-b" style="width:100%;border-color:#72e4b0;background:#1a3a32;color:#72e4b0" onclick="adSendMail()">📨 Gửi vào Hộp thư</button></div>'+
'<div style="margin:12px 0 2px;font-size:12px;color:#ff9a8a;border-top:1px solid #3a2a33;padding-top:8px">🕵️ Người chơi đáng ngờ</div>'+
  '<div style="font-size:10.5px;color:#b9a9a2;margin:2px 0 5px">Quét bảng xếp hạng + báo cáo của người chơi. Bấm 👁️ Xem để biết vì sao đáng ngờ trước khi khóa.</div>'+
  '<div style="margin:4px 0"><button class="ad-b" style="width:100%" onclick="adSusScan()">🔍 Quét</button></div>'+
  '<div id="ad-sus"></div>'+
  '<div id="ad-msg" style="font-size:11px;min-height:15px;margin:6px 0;color:#ffc978"></div>'+
  '<div style="display:flex;gap:6px"><button class="ad-b" style="flex:1;width:auto" onclick="adClearBag()">🗑️ Dọn balo</button><button class="ad-b" style="flex:1;width:auto" onclick="adLock()">🔒 Khóa</button><button class="ad-b" style="flex:1;width:auto;border-color:#ff7654;background:#a72f42" onclick="adClose()">Đóng</button></div>';
 adminEl.style.display='flex';adRefresh()}

/* ---------- Khóa theo admins/{uid} ---------- */
function applyAdminSeal(){
  const s = document.querySelector('.seal');
  if(!s) return;
  if(isAdminUser){
    s.style.cursor = 'pointer';
    s.style.color = '#ff5a5a';
    s.title = 'Admin (Thú Thần Giới)';
    s.onclick = adminOpen;
  } else {
    s.style.cursor = '';
    s.style.color = '';
    s.title = '';
    s.onclick = null;
  }
}

/** Gọi sau khi đã có uid (sau login / TTGNET.start). */
async function checkAdminStatus(uid){
  isAdminUser = false;
  if(!uid){ applyAdminSeal(); return false; }
  try{
    let rdb = null;
    if(window.TTGNET && TTGNET.rdb) rdb = TTGNET.rdb;
    else if(window.firebase && firebase.apps.length) rdb = firebase.database();
    if(!rdb){ applyAdminSeal(); return false; }
    const sn = await rdb.ref('admins/' + uid).once('value');
    isAdminUser = sn.val() === true;
  }catch(e){
    console.warn('[admin] check', e);
    isAdminUser = false;
  }
  applyAdminSeal();
  return isAdminUser;
}

// Xuất để 19-save / 20-online gọi sau khi login
window.checkAdminStatus = checkAdminStatus;
window.isAdminUser = function(){ return isAdminUser; };

// Ban đầu ẩn (chưa biết uid)
{ const s = document.querySelector('.seal'); if(s){ s.onclick = null; s.style.cursor = ''; } }
