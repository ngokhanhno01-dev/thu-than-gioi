/* ===== Bảng Admin tạm thời =====
   Bấm vào chữ "Thú Thần Giới" cạnh Xu -> nhập mật khẩu -> mở bảng.
   Mật khẩu KHÔNG nằm trong code, chỉ lưu bản băm SHA-256 (ADMIN_HASH).
   Đây chỉ là rào chắn sơ sơ chạy ở trình duyệt, ai biết dùng F12 vẫn có thể gọi hàm trực tiếp.
   Sau này nên thay bằng kiểm tra phía server. */
const ADMIN_HASH='456ceed90dcb760523a34ba599380cc6c225f2a04eae0d170762c647a0dcd158';
let adminOn=false,adminFail=0,adminLockUntil=0,adminEl=null;
async function adminCheck(pw){
 if(!(window.crypto&&crypto.subtle))return null;
 const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tt-admin:'+pw));
 return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')===ADMIN_HASH}
async function adminOpen(){
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
  // Dùng nickKey giống game
  const key = nick.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]/g,'');
  if(!key || key.length < 3) return null;
  try{
    const sn = await fs.collection('nicks').doc(key).get();
    if(sn.exists && sn.data().uid) return String(sn.data().uid);
  }catch(e){ console.warn('[admin] find nick', e); }
  return null;
}

async function adSendMail(){
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

  // Lấy Realtime Database
  let rdb = null;
  try{
    if(window.TTGNET && TTGNET.rdb) rdb = TTGNET.rdb;
    else if(firebase.apps.length) rdb = firebase.database();
  }catch(_){}
  if(!rdb) return adMsg('Chưa kết nối Realtime Database.');

  // Tạo nội dung thư
  const rewards = {};
  if(type === 'gold'){
    rewards.gold = qty;
  } else if(type === 'zone'){
    rewards.chooseZone = true;
    rewards.zoneQty = qty;
  } else {
    // item
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
/* --- Test trang bị / thú --- */
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
      '<option value="zone">📦 Rương nguyên liệu (chọn vùng)</option>'+
      '<option value="dan">💊 Linh Đan</option>'+
      '<option value="qua">🍎 Linh Quả</option>'+
    '</select>'+
    '<input id="ad-gift-qty" type="number" min="1" value="100" inputmode="numeric" style="flex:none;width:60px;padding:5px">'+
  '</div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><input id="ad-gift-title" placeholder="Tiêu đề thư (tuỳ chọn)" style="flex:1;min-width:0;padding:5px;font-size:12px"></div>'+
  '<div style="display:flex;align-items:center;gap:6px;margin:5px 0"><input id="ad-gift-body" placeholder="Nội dung thư (tuỳ chọn)" style="flex:1;min-width:0;padding:5px;font-size:12px"></div>'+
  '<div style="margin:6px 0"><button class="ad-b" style="width:100%;border-color:#72e4b0;background:#1a3a32;color:#72e4b0" onclick="adSendMail()">📨 Gửi vào Hộp thư</button></div>'+
'<div id="ad-msg" style="font-size:11px;min-height:15px;margin:6px 0;color:#ffc978"></div>'+
  '<div style="display:flex;gap:6px"><button class="ad-b" style="flex:1;width:auto" onclick="adClearBag()">🗑️ Dọn balo</button><button class="ad-b" style="flex:1;width:auto" onclick="adLock()">🔒 Khóa</button><button class="ad-b" style="flex:1;width:auto;border-color:#ff7654;background:#a72f42" onclick="adClose()">Đóng</button></div>';
 adminEl.style.display='flex';adRefresh()}
{const s=document.querySelector('.seal');if(s){s.style.cursor='pointer';s.onclick=adminOpen}}
