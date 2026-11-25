/* 88-npc-boss.js - BỘ MÁY NPC LOẠI BOSS (25/11/2026), nhánh demo-thu-moi. Nạp động từ 81-nut-moi.js, SAU 87-npc.js.
   NPC đầu tiên: z0-boss "Băng Tộc Thiếu Chủ - Tố Nữ Mạc Ly". NPC Boss khác chỉ cần thêm cấu hình `td` trong CFG.npc (87-npc.js), không sửa file này.
   LUỒNG: gặp NPC (87) -> khung chat -> [Khiêu chiến] -> prep(npcId) dựng địch NPC (taoDich) -> vào trận bằng bộ máy cũ (startExplore trong index.html).
   ĐỊCH NPC = địch giả source:'npc' (không phải 'main' / 'demo'), nên các hệ thống cũ tự bỏ qua nó:
     - KHÔNG BẮT ĐƯỢC: 62-bat-thu.js chỉ cho bắt source==='demo' (canCatch) => nút Bắt không hiện.
     - Không tính Danh Vọng (80-danh-vong.js chỉ nhận source 'demo'), không rơi đồ kiểu quái vùng (TTGLT.roiDo chỉ nhận 'main'), không rơi item kiểu thú hoang (TTGTH.roiDo chỉ nhận 'demo'): phần thưởng NPC do thang() bên dưới trao riêng.
   HÌNH: ảnh NPC (game-moi/npc/<id>.webp) thay cho thú trong giao diện chiến đấu (veDich, index.html gọi trong pet()). Hệ: td.he (Băng); độ hiếm: td.hiem (Truyền Thuyết); không hiện Rank, không hiện Vn.
   CHỈ SỐ: lấy chỉ số gốc của loài td.chiSoTu (boss thú hoang cùng vùng) ở cấp td.lv (cố định 25), rồi nhân Máu / Tấn công / Giáp với CFG.boss.heSoManh (87-npc.js). Kỹ năng: td.kyNang (sách kỹ năng boss, vd Băng Sơn Áp Đỉnh) + nội tại sách + buff boss vùng, đúng như boss thú hoang.
   PHẦN THƯỞNG khi THẮNG (td.thuong): Ngự Thú Châu (chau.cap x chau.n) + Tinh Thạch cố định (tt) + 1 trang bị phẩm ngẫu nhiên của vùng (TTGLT.taoMon, gacha 55/28/12/4/1) + nguyên liệu như boss thú hoang (TTGTH.roiDo với địch giả {source:'demo',boss:true}), EXP như boss thường. KHÔNG rơi bong-6 (chặn cứng bên dưới).
   Thua/bỏ chạy: như trận thường (thua mất 1 nửa Tinh Thạch của lần thắng theo công thức boss, không nhân đôi). Chưa có giới hạn lượt/ngày.
   API (window.TTGNPC thêm): taoDich(npcId,player) | veDich(ctx,enemy,x,by,bob) | thang(enemy,mm) -> [chuỗi báo] | ttThang(enemy) -> số Tinh Thạch | hanhDong.boss
   THỬ: ?npc=z0-boss rồi bấm Thám hiểm (lượt nào cũng gặp), hoặc menu ẩn (chạm chữ "Danh Vọng") -> "Boss NPC: thắng ngay" để kiểm phần thưởng không cần đánh. */
(function(root){
'use strict';
var T=root.TTGNPC;if(!T)return;
var BONG_MAX_CHO_PHEP=5;   /* luật chung: bong-6 CHỈ phát từ NPC Cốt truyện vùng 6; NPC Boss không bao giờ cho bậc 6 */

function toast(t){try{if(root.TTGTBAO&&root.TTGTBAO.toast)root.TTGTBAO.toast(t,2600);}catch(e){}}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function tenNgan(n){var i=String(n.ten||'').lastIndexOf(' - ');return i>=0?n.ten.slice(i+3):n.ten;}   /* "Băng Tộc Thiếu Chủ - Tố Nữ Mạc Ly" -> "Tố Nữ Mạc Ly" (tên ngắn cho thanh máu) */
function npcCuaDich(e){return e&&e.npcId?T.get(e.npcId):null;}
function tdCua(n){return (n&&n.td)||{};}

/* ---------- DỰNG ĐỊCH ---------- */
function taoDich(npcId,player){
  var n=T.get(npcId);if(!n||n.loai!=='boss'||!root.TTGCS)return null;
  var td=tdCua(n),B=T.CFG.boss||{},z=n.vung|0,lv=clamp(Math.floor(td.lv||25),1,100),tien=clamp(Math.floor(td.tien||3),1,3),he=Math.max(0.1,+B.heSoManh||1);
  var e={id:'npc-'+n.id,ten:tenNgan(n),source:'npc',npcId:n.id,boss:true,lv:lv,tien:tien,bac:'C',hienBac:false,anBac:true,   /* bac 'C' chỉ để công thức tính (EXP, Tinh Thạch phạt); hienBac:false = không hiện Rank */
    hiem:td.hiem||'truyenthuyet',he:(td.he&&td.he.length)?td.he.slice():undefined,vung:z,record:{npcId:n.id}};
  var slug=null;try{var zs=(root.THU_MOI&&THU_MOI.zones)||[],i;for(i=0;i<zs.length;i++)if(zs[i].z===z){slug=zs[i].slug;break;}}catch(x){}
  if(slug)e.zoneSlug=slug;
  if(td.kyNang)e.kn=[td.kyNang];
  var goc={id:td.chiSoTu||e.id,lv:lv,tien:tien,bac:e.bac,boss:true,vung:z};
  var st=TTGCS.tinh(goc,{mod:(TTGCS.sachMod&&e.kn)?TTGCS.sachMod(e):[]});   /* chỉ số boss thú hoang + nội tại sách, y như ganSachBoss */
  ['hp','tc','pt'].forEach(function(k){st[k]=Math.max(1,Math.round(st[k]*he));});
  e.stats=st;return e;}

/* ---------- VẼ NPC THAY THÚ ---------- */
var IMG={};
function anhNpc(n){
  var src=n.anh||(T.CFG.anhDir+n.id+'.webp'+T.CFG.anhVer),o=IMG[src];
  if(!o){o=IMG[src]={im:new Image(),ok:false};o.im.onload=function(){o.ok=true;};o.im.onerror=function(){o.err=true;};o.im.src=src;}
  return o.ok?o.im:null;}
function veDich(ctx,e,x,by,bob){
  var n=npcCuaDich(e),B=T.CFG.boss||{},h=B.cao||170,im=n?anhNpc(n):null;
  if(!im)return;   /* ảnh chưa nạp xong thì chưa vẽ (nạp ở khung thoại trước đó nên thường đã có sẵn) */
  var w=h*(im.naturalWidth/im.naturalHeight||1);
  ctx.save();ctx.imageSmoothingEnabled=false;   /* ảnh pixel art: giữ nét */
  ctx.drawImage(im,x-w/2,by+bob+8-h,w,h);ctx.restore();}

/* ---------- PHẦN THƯỞNG ---------- */
function ttThang(e){var n=npcCuaDich(e),t=tdCua(n).thuong||{};return Math.max(0,Math.floor(+t.tt||0));}
/* trao phần thưởng (trừ Tinh Thạch: index.html cộng theo ttThang). Trả mảng chuỗi để ghép vào thông báo thắng trận */
function thang(e,mm){
  var n=npcCuaDich(e),out=[];if(!n)return out;
  var th=tdCua(n).thuong||{},z=n.vung|0;
  if(th.chau&&root.TTGBALO&&root.TTGBONG){   /* Ngự Thú Châu (không bao giờ bậc 6) */
    var cap=clamp(Math.floor(th.chau.cap||1),1,BONG_MAX_CHO_PHEP),sl=Math.max(1,Math.floor(th.chau.n||1)),id=TTGBONG.idBong(cap);
    TTGBALO.add(id,sl);out.push('Ngự Thú Châu bậc '+cap+' x'+sl);}
  if(th.trangBi&&root.TTGLT&&TTGLT.taoMon){   /* 1 trang bị phẩm ngẫu nhiên của vùng */
    var r=TTGLT.taoMon(z);
    if(r&&r.item)out.push(r.item.ten||('Trang bị phẩm '+TTGLT.QN[r.q]));   /* tên món đã có sẵn phẩm, vd "[Linh] Vòng Tuyết Nguyên" */
    else if(r&&r.err)out.push('Trang bị: '+r.err);}
  if(th.nguyenLieu&&root.TTGTH&&TTGTH.roiDo){   /* nguyên liệu như boss thú hoang cùng vùng (cùng tỉ lệ, cùng ảnh hưởng may mắn) */
    var rl=[];try{rl=TTGTH.roiDo({source:'demo',boss:true,vung:z},mm||0);}catch(x){}
    if(rl.length)out.push(TTGTH.moTa(rl));}
  return out;}

/* ---------- NÚT TRONG KHUNG THOẠI ---------- */
T.hanhDong.boss=function(npc,ctl,k){
  if(k!=='khieu-chien')return;
  var pre=(root.TTGTHAMHIEM&&TTGTHAMHIEM.prep)?TTGTHAMHIEM.prep(npc.id):null;
  if(!pre)return;   /* prep đã báo lý do (chưa chọn thú, đang có trận...): giữ cửa sổ NPC để người chơi thử lại hoặc Rời đi */
  ctl.dong('khieu-chien');   /* 82-tham-hiem-auto.js thấy lý do này thì KHÔNG chạy tiếp vòng lặp */
  if(root.TTGTX&&TTGTX.active()&&TTGTX.vaoTran)TTGTX.vaoTran(pre);
  else if(TTGTHAMHIEM.battle)TTGTHAMHIEM.battle(pre);};   /* gọi từ nút test ngoài vòng thám hiểm: vào trận thẳng */

T.taoDich=taoDich;T.veDich=veDich;T.thang=thang;T.ttThang=ttThang;

/* ---------- NÚT TEST ẨN ---------- */
function testThang(){
  var id='z'+((root.TTGDV&&TTGDV.vung)?(TTGDV.vung()|0):0)+'-boss',n=T.get(id);
  if(!n||!n.td||!n.td.thuong){n=T.get('z0-boss');}   /* vùng đang chọn chưa có NPC Boss được giao thì thử bằng z0 */
  var e={source:'npc',npcId:n.id,boss:true,vung:n.vung};
  var tt=ttThang(e);if(root.TTGTIEN&&tt)TTGTIEN.add('tt',tt);
  var rn=thang(e,0);toast('TEST Boss NPC thắng: +'+tt+' Tinh Thạch'+(rn.length?' · Nhận '+rn.join(', '):''));}
var IC='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="20" r="10" fill="#9fd8ff" stroke="#1b2250" stroke-width="3"/><path d="M14 58 Q16 34 32 32 Q48 34 50 58 Z" fill="#6fb0ff" stroke="#1b2250" stroke-width="3"/></svg>';
if(root.TTGNV&&root.TTGNV.add)root.TTGNV.add({id:'npc-boss-thang',ten:'Boss NPC: thắng ngay',dev:true,onTap:testThang,icon:IC});
})(typeof window!=='undefined'?window:globalThis);
