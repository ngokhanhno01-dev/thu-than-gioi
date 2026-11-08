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
function adLock(){adminOn=false;if(adminEl)adminEl.style.display='none';log('🛠️ Đã khóa admin.')}
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
 const opts=Object.keys(ITEMS).map(id=>'<option value="'+id+'">'+ITEMS[id].i+' '+ITEMS[id].n+'</option>').join('');
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
  '<div id="ad-msg" style="font-size:11px;min-height:15px;margin:6px 0;color:#ffc978"></div>'+
  '<div style="display:flex;gap:6px"><button class="ad-b" style="flex:1;width:auto" onclick="adClearBag()">🗑️ Dọn balo</button><button class="ad-b" style="flex:1;width:auto" onclick="adLock()">🔒 Khóa</button><button class="ad-b" style="flex:1;width:auto;border-color:#ff7654;background:#a72f42" onclick="adClose()">Đóng</button></div>';
 adminEl.style.display='flex';adRefresh()}
{const s=document.querySelector('.seal');if(s){s.style.cursor='pointer';s.onclick=adminOpen}}
