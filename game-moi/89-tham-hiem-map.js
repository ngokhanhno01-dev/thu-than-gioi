/* ===== 89-tham-hiem-map.js (TTGMAP): ENGINE "THÁM HIỂM ĐI BỘ" =====
   THAY cho build()/script() của 82-tham-hiem-auto.js (màn "đang tìm" giả). Vùng làm trước: Tuyết Nguyên.
   TRẠNG THÁI: B1 = bảng cấu hình + hàm thuần (khu, tỉ lệ, đồng hồ boss) + khung API.
     B3 (canvas fullscreen, camera, joystick/WASD, nhân vật) | B4 (điểm rung + HUD khu) | B5 (boss) = ĐÃ CÓ trong open/pause/close/active.
     CHƯA: B2 mask đường (chưa va chạm, nhân vật đi tự do trong biên map) | B6 resume(kq) + nối 82 + index.html.

   TOẠ ĐỘ: mọi toạ độ trong CFG tính theo ảnh GỐC 1536x1024 ("đơn vị map"). Engine tự nhân hệ số (ảnh.naturalWidth/1536), nên đổi ảnh khác độ phân giải vẫn đúng.
   CHỈNH TAY: chỉ sửa khối CFG bên dưới (điểm rung, khu, tỉ lệ, boss, thời gian).

   GIAO DIỆN VỚI CODE HIỆN CÓ (đã đọc 82, 61, prepExplore/startExplore trong index.html):
     - TTGTHAMHIEM.prep(npcId)  = prepExplore: chọn thú ra trận + tung địch (createEncounter) -> {player,ps,enemy,tag} | null. KHÔNG nhận độ hiếm/boss  => B6 phải thêm tham số tuỳ chọn opts {hiem, boss} (xem hàm tungDich bên dưới).
     - TTGTHAMHIEM.battle(pre)  = startExplore(pre): vào trận. 82 bọc lại thành TTGTX.vaoTran(pre).
     - TTGTX.next() (thắng/thua/bắt thú xong) và TTGTX.stop() do index.html gọi. TTGTX.active() = đang chạy vòng lặp.
   HỢP ĐỒNG TTGMAP <-> 82 (B6):
     TTGMAP.open(host)   host = {vung, onTouch(ev), onStop()}   ev = {loai:'diem'|'boss', hiem:'thuong'|..., khu:1..4}
     TTGMAP.pause()      vào trận: dừng rAF + bỏ listener phím, GIỮ NGUYÊN vị trí/trạng thái điểm/đồng hồ
     TTGMAP.resume(kq)   sau trận: kq = {diemId?, boss?:true}; điểm vừa chạm biến mất rồi hồi theo CFG.hoi; boss bắt đầu đếm 15 phút; bật cooldown chạm
     TTGMAP.close()      Dừng/Esc: dọn sạch, trả màn hình về sảnh
*/
(function(root){
'use strict';
var D=document,DIR='game-moi/';

/* ---------- ĐỘ HIẾM (khoá trùng TTGCS.DO_HIEM trong 56b-loai.js: thuong|hiem|suthi|huyenthoai; 'truyenthuyet' chỉ dành cho boss nên KHÔNG có trên điểm rung) ---------- */
var HIEM={
  thuong:{ten:'Thường',mau:'#35e0bd'},
  hiem:{ten:'Hiếm',mau:'#4aa8ff'},
  suthi:{ten:'Sử thi',mau:'#b56cff'},
  huyenthoai:{ten:'Huyền thoại',mau:'#ffd45c'}
};
var HIEM_KEYS=['thuong','hiem','suthi','huyenthoai'];

/* ---------- CẤU HÌNH CHUNG ---------- */
var CFG={
  debugMask:false,            /* true = hiện lớp mask đường (bật/tắt bằng nút debug hoặc phím M, làm ở B3) */
  rung:20000,                 /* ms điểm rung hiện trước khi tự biến mất */
  hoi:15000,                  /* ms điểm hồi lại sau khi biến mất / sau khi chạm */
  soDiemHien:[3,4],           /* mỗi khu cùng lúc hiện 3-4 điểm (trong 4 điểm cố định) */
  banKinhCham:24,             /* đơn vị map: khoảng cách chạm vào điểm rung */
  banKinhMaskDiem:26,         /* đơn vị map: vòng tròn mở rộng mask quanh mỗi điểm để chạm được dù điểm nằm ngoài đường */
  cooldownSauTran:900,        /* ms không cho chạm lại sau khi quay về map */
  nhanVat:{toc:190,kich:64,anh:null,nhun:3},   /* toc = đơn vị map/giây; anh = đường dẫn ảnh 512x512 quay PHẢI (null = vẽ tạm bằng THU_MOI.draw); nhun = biên độ nhún khi đi (px) */
  camera:{zoom:1},
  joystick:{kinh:112,kinhNho:94},
  boss:{hoiMs:15*60*1000,luuKhoa:'ttg_map_boss_'}   /* hồi theo GIỜ THỰC (Date.now), lưu localStorage theo từng vùng */
};

/* ---------- DỮ LIỆU VÙNG ----------
   khu: y0 (trên) -> y1 (dưới) theo ảnh 1536x1024; khu 1 ở dưới cùng. ti = tỉ lệ ra thú (%), tổng mỗi khu phải = 100 (checkCfg() báo nếu lệch).
   diem: 4 điểm rung cố định mỗi khu, vị trí ƯỚC LƯỢNG (cần chỉnh khi xem debug mask: điểm phải nằm cạnh đường).
   Tên khu 1, 3, 4 là TÊN TẠM tự đặt theo cảnh trong ảnh (chỉ khu 2 "Cầu Đá" là theo mô tả) - sửa ten ở đây. */
var VUNG={
  'tuyet-nguyen':{
    ten:'Tuyết Nguyên',
    anh:DIR+'map-tham-hiem-tuyet-nguyen.webp',
    rong:1536,cao:1024,
    mask:DIR+'mask-tuyet-nguyen.png',        /* B2 tạo file này (1 kênh, trắng = đi được) */
    xuatPhat:{x:790,y:980},
    khu:[
      {id:1,ten:'Khu 1 – Hồ Băng',     y0:780,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cầu Đá',      y0:520,y1:780, ti:{thuong:60,hiem:30,suthi:8,  huyenthoai:2}},
      {id:3,ten:'Khu 3 – Thác Nước',   y0:270,y1:520, ti:{thuong:35,hiem:35,suthi:22, huyenthoai:8}},
      {id:4,ten:'Khu 4 – Cổng Hang Băng',y0:0, y1:270, ti:{thuong:15,hiem:30,suthi:35, huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:330, y:880,ghiChu:'hồ băng trái'},{id:'1b',x:630, y:850,ghiChu:'gốc cây cụt'},
         {id:'1c',x:120, y:860,ghiChu:'cụm pha lê góc trái'},{id:'1d',x:1100,y:880,ghiChu:'tảng đá lớn phải'}],
      2:[{id:'2a',x:370, y:560,ghiChu:'cây khô cổ thụ'},{id:'2b',x:620, y:650,ghiChu:'suối cạnh cầu'},
         {id:'2c',x:1130,y:600,ghiChu:'hang đá nhỏ phải'},{id:'2d',x:1000,y:620,ghiChu:'pha lê cạnh hang'}],
      3:[{id:'3a',x:330, y:300,ghiChu:'thác nước'},{id:'3b',x:700, y:370,ghiChu:'tảng đá lớn giữa'},
         {id:'3c',x:1020,y:330,ghiChu:'bậc thang phải'},{id:'3d',x:725, y:410,ghiChu:'pha lê'}],
      4:[{id:'4a',x:610, y:150,ghiChu:'cột đá trái'},{id:'4b',x:1010,y:110,ghiChu:'cột đá phải'},
         {id:'4c',x:1170,y:100,ghiChu:'pha lê phải'},{id:'4d',x:780, y:90, ghiChu:'gần cổng hang'}]
    },
    boss:{x:780,y:150,banKinhCham:38,ten:'Boss Truyền Thuyết'},   /* đứng cố định giữa quảng trường khu 4, KHÔNG có tỉ lệ ngẫu nhiên */
    /* hình đa giác quảng trường khu 4 (sàn đá màu khác đường) để B2 THÊM TAY vào mask; toạ độ map, chỉnh khi xem debug */
    maskThem:[
      {loai:'da-giac',ten:'quảng trường khu 4',pts:[[560,70],[1060,70],[1120,200],[1000,260],[560,260],[520,160]]}
    ]
  }
};

/* ---------- HÀM THUẦN (không DOM) ---------- */
function rnd(a,b,rng){return a+(rng||Math.random)()*(b-a);}
function vung(slug){return VUNG[slug||'tuyet-nguyen']||null;}

/* khu chứa toạ độ y (đơn vị map). Ngoài biên thì kẹp vào khu gần nhất. */
function khuTai(v,y){
  var i,k;if(!v)return null;
  for(i=0;i<v.khu.length;i++){k=v.khu[i];if(y>=k.y0&&y<k.y1)return k;}
  return y<v.khu[v.khu.length-1].y0?v.khu[v.khu.length-1]:v.khu[0];}

/* tung độ hiếm theo tỉ lệ của khu; trả khoá HIEM ('thuong'|'hiem'|'suthi'|'huyenthoai'). Tỉ lệ không cần tổng đúng 100 (chuẩn hoá). */
function tungHiem(khu,rng){
  var t=khu&&khu.ti,sum=0,i,w,x;if(!t)return 'thuong';
  for(i=0;i<HIEM_KEYS.length;i++)sum+=Math.max(0,+t[HIEM_KEYS[i]]||0);
  if(sum<=0)return 'thuong';
  x=(rng||Math.random)()*sum;
  for(i=0;i<HIEM_KEYS.length;i++){w=Math.max(0,+t[HIEM_KEYS[i]]||0);x-=w;if(x<0)return HIEM_KEYS[i];}
  return 'thuong';}

/* số điểm rung cần hiện trong 1 lần làm mới của khu (3-4) */
function soDiemCan(rng){var a=CFG.soDiemHien;return Math.floor(rnd(a[0],a[1]+1,rng));}

/* ---------- ĐỒNG HỒ BOSS (giờ thực, sống qua đóng/mở game) ---------- */
function bossKey(slug){return CFG.boss.luuKhoa+(slug||'tuyet-nguyen');}
function bossReadyAt(slug){var v=0;try{v=+localStorage.getItem(bossKey(slug))||0;}catch(e){}return v;}
function bossConLai(slug,now){return Math.max(0,bossReadyAt(slug)-(now==null?Date.now():now));}   /* ms còn lại; 0 = boss đang đứng đó */
function bossDanhXong(slug,now){var t=(now==null?Date.now():now)+CFG.boss.hoiMs;try{localStorage.setItem(bossKey(slug),String(t));}catch(e){}return t;}
function dinhDangDem(ms){var s=Math.ceil(ms/1000),m=Math.floor(s/60);s%=60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;}

/* kiểm tra bảng cấu hình, trả mảng cảnh báo (rỗng = ổn). Tự chạy 1 lần lúc nạp file. */
function checkCfg(){
  var w=[],slug,v,i,k,sum,j,d;
  for(slug in VUNG){v=VUNG[slug];
    for(i=0;i<v.khu.length;i++){k=v.khu[i];sum=0;
      for(j=0;j<HIEM_KEYS.length;j++)sum+=+k.ti[HIEM_KEYS[j]]||0;
      if(Math.abs(sum-100)>0.001)w.push(slug+' khu '+k.id+': tổng tỉ lệ = '+sum+' (cần 100)');
      d=v.diem[k.id]||[];
      if(d.length<CFG.soDiemHien[1])w.push(slug+' khu '+k.id+': chỉ có '+d.length+' điểm, cần >= '+CFG.soDiemHien[1]);
      d.forEach(function(p){if(p.y<k.y0||p.y>=k.y1)w.push(slug+' điểm '+p.id+' (y='+p.y+') nằm ngoài khu '+k.id);});
      if(i&&k.y1!==v.khu[i-1].y0)w.push(slug+': khu '+k.id+' và khu '+v.khu[i-1].id+' không liền nhau');}
    if(v.boss.y>=v.khu[v.khu.length-1].y1)w.push(slug+': boss nằm ngoài khu cao nhất');}
  return w;}

/* ---------- CẦU NỐI TUNG ĐỊCH (dùng ở B6) ----------
   Gọi TTGTHAMHIEM.prep SAU KHI đã chốt độ hiếm của điểm (hoặc boss). prep hiện chưa nhận opts => B6 thêm: prepExplore(npcId,opts) -> createEncounter(player,rng,opts)
   với opts.hiem = khoá độ hiếm (lọc thú hoang thường theo TTGCS.hiemInfo(id).key; không có thú đúng độ hiếm thì lấy gần nhất bên dưới) và opts.boss = true (ép boss, giữ nguyên Rank gacha). */
function tungDich(ev){
  var h=root.TTGTHAMHIEM;if(!h||!h.prep)return null;
  return ev.loai==='boss'?h.prep(null,{boss:true}):h.prep(null,{hiem:ev.hiem});}

/* ====================================================================
   ENGINE B3-B5: canvas fullscreen, camera, nhân vật, joystick, điểm rung, HUD khu, boss
   Toàn bộ vẽ/di chuyển tính theo "đơn vị map" (1536x1024); camera + zoom đổi sang pixel màn hình.
   Đồng hồ điểm rung chạy theo S.clock (cộng dồn dt trong vòng lặp) nên pause() đóng băng đúng trạng thái.
   Đồng hồ boss chạy theo giờ thực (bossConLai) như thiết kế B1.
   ==================================================================== */
var S=null;   /* phiên đang mở (null = chưa mở) */

function el(tag,css,txt){var e=D.createElement(tag);if(css)e.style.cssText=css;if(txt!=null)e.textContent=txt;return e;}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
function fmtPct(n){return (Math.round((+n||0)*10)/10)+'%';}
function txt(c,str,x,y,size,fill){
  c.font='bold '+size+'px sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.lineJoin='round';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.75)';c.strokeText(str,x,y);
  c.fillStyle=fill;c.fillText(str,x,y);}

/* ---------- DOM ---------- */
function buildDom(s){
  var root_=el('div','position:fixed;left:0;top:0;right:0;bottom:0;z-index:99990;background:#0a1018;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;font-family:sans-serif');
  var cv=el('canvas','position:absolute;left:0;top:0;width:100%;height:100%;display:block');
  var load=el('div','position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;color:#cfe6ff;font-size:16px;pointer-events:none','Đang tải bản đồ…');
  var hud=el('div','position:absolute;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);max-width:92%;text-align:center;pointer-events:none;background:rgba(8,16,28,.72);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 12px;color:#fff;opacity:0;transition:opacity .35s');
  var stop=el('button','position:absolute;right:max(12px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));padding:8px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.35);background:rgba(8,16,28,.78);color:#fff;font-size:14px;font-weight:bold;cursor:pointer;touch-action:manipulation','⏸ Dừng');
  var rot=el('div','position:absolute;left:0;right:0;bottom:max(150px,calc(env(safe-area-inset-bottom) + 150px));display:none;justify-content:center;pointer-events:none');
  rot.appendChild(el('div','background:rgba(8,16,28,.8);color:#ffd45c;font-size:13px;padding:6px 12px;border-radius:999px','↻ Xoay ngang màn hình để chơi'));
  var jb=el('div','position:absolute;left:max(18px,env(safe-area-inset-left));bottom:max(18px,env(safe-area-inset-bottom));border-radius:50%;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.35);touch-action:none');
  var kn=el('div','position:absolute;left:50%;top:50%;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(255,255,255,.85);pointer-events:none');
  jb.appendChild(kn);
  root_.appendChild(cv);root_.appendChild(hud);root_.appendChild(load);root_.appendChild(rot);root_.appendChild(jb);root_.appendChild(stop);
  D.body.appendChild(root_);
  s.root=root_;s.cv=cv;s.ctx=cv.getContext('2d');s.load=load;s.hud=hud;s.rot=rot;s.joyBase=jb;s.joyKnob=kn;
  stop.addEventListener('click',function(e){e.preventDefault();stopReq();});
  /* joystick */
  jb.addEventListener('pointerdown',function(e){
    if(!S||S.joy.id!==null)return;
    S.joy.id=e.pointerId;try{jb.setPointerCapture(e.pointerId);}catch(_){}
    joyMove(e);e.preventDefault();});
  jb.addEventListener('pointermove',function(e){if(S&&e.pointerId===S.joy.id){joyMove(e);e.preventDefault();}});
  jb.addEventListener('pointerup',joyEnd);
  jb.addEventListener('pointercancel',joyEnd);
}
function joyMove(e){
  var s=S,r=s.joyBase.getBoundingClientRect(),R=r.width/2,dx=e.clientX-(r.left+R),dy=e.clientY-(r.top+R),len=Math.sqrt(dx*dx+dy*dy);
  if(len>R&&len>0){dx*=R/len;dy*=R/len;}
  s.joy.x=R?dx/R:0;s.joy.y=R?dy/R:0;
  s.joyKnob.style.transform='translate('+dx+'px,'+dy+'px)';}
function joyEnd(e){
  var s=S;if(!s)return;
  if(e&&e.pointerId!==s.joy.id)return;
  joyReset(s);}
function joyReset(s){
  s.joy.id=null;s.joy.x=0;s.joy.y=0;
  if(s.joyKnob)s.joyKnob.style.transform='translate(0px,0px)';}

function fit(){
  var s=S;if(!s)return;
  var w=window.innerWidth,h=window.innerHeight,d=Math.min(2,window.devicePixelRatio||1),big,ks;
  s.vw=w;s.vh=h;s.dpr=d;
  s.cv.width=Math.round(w*d);s.cv.height=Math.round(h*d);
  big=Math.min(w,h)<420?CFG.joystick.kinhNho:CFG.joystick.kinh;ks=Math.round(big*0.42);
  s.joyBase.style.width=big+'px';s.joyBase.style.height=big+'px';
  s.joyKnob.style.width=ks+'px';s.joyKnob.style.height=ks+'px';
  s.joyKnob.style.marginLeft=(-ks/2-2)+'px';s.joyKnob.style.marginTop=(-ks/2-2)+'px';
  s.rot.style.display=h>w?'flex':'none';
  if(s.ready)draw(s);}

/* ---------- INPUT ---------- */
function onKeyDown(e){
  var s=S;if(!s)return;
  var c=e.code;
  if(c==='Escape'){e.preventDefault();stopReq();return;}
  if(c==='KeyW'||c==='KeyA'||c==='KeyS'||c==='KeyD'||c==='ArrowUp'||c==='ArrowDown'||c==='ArrowLeft'||c==='ArrowRight'){
    s.keys[c]=true;e.preventDefault();}}
function onKeyUp(e){var s=S;if(!s)return;if(s.keys[e.code]){s.keys[e.code]=false;e.preventDefault();}}
function onBlur(){if(S)S.keys={};}
function bindKeys(){window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur);}
function unbindKeys(){window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);}
function stopReq(){
  var s=S;if(!s)return;
  var h=s.host;
  if(h&&typeof h.onStop==='function'){try{h.onStop();}catch(e){try{console.error('[TTGMAP] onStop lỗi',e);}catch(_){}close();}}
  else close();}
function readInput(s){
  var k=s.keys,x=0,y=0,j=s.joy,m,jm;
  if(k.KeyA||k.ArrowLeft)x-=1;
  if(k.KeyD||k.ArrowRight)x+=1;
  if(k.KeyW||k.ArrowUp)y-=1;
  if(k.KeyS||k.ArrowDown)y+=1;
  m=Math.sqrt(x*x+y*y);if(m>1){x/=m;y/=m;}
  jm=Math.sqrt(j.x*j.x+j.y*j.y);
  if(jm>0.12){x=j.x;y=j.y;}
  return {x:x,y:y};}

/* ---------- ĐIỂM RUNG (B4) ---------- */
function visCount(g){var n=0;g.pts.forEach(function(p){if(p.on)n++;});return n;}
function spawnSpots(s,g,jit){
  var n=visCount(g),rd,p;
  while(n<g.target){
    rd=g.pts.filter(function(q){return !q.on&&s.clock>=q.hoiAt;});
    if(!rd.length)break;
    p=rd[Math.floor(Math.random()*rd.length)];
    p.on=true;p.hiem=tungHiem(g.k);p.until=s.clock+CFG.rung*(jit?rnd(0.6,1):1);n++;}}
function buildSpots(s){
  var v=s.v;
  s.groups=v.khu.map(function(k){
    return {k:k,target:soDiemCan(),pts:(v.diem[k.id]||[]).map(function(d){
      return {id:d.id,x:d.x,y:d.y,khu:k.id,on:false,hoiAt:0,until:0,hiem:'thuong',ph:Math.random()*6.283};})};});
  s.groups.forEach(function(g){spawnSpots(s,g,true);});}
function tickSpots(s){
  s.groups.forEach(function(g){
    g.pts.forEach(function(p){
      if(!p.on||s.clock<p.until)return;
      var ready=g.pts.some(function(q){return !q.on&&s.clock>=q.hoiAt;});
      if(visCount(g)>CFG.soDiemHien[0]||ready){p.on=false;p.hoiAt=s.clock+CFG.hoi;g.target=soDiemCan();}   /* hết hạn -> ẩn, hồi sau CFG.hoi */
      else p.until=s.clock+1000;});                                                                        /* giữ đủ tối thiểu 3 điểm/khu */
    spawnSpots(s,g,false);});}

/* ---------- HUD KHU (B4) ---------- */
function showHud(s,k){
  var h=s.hud,row;
  while(h.firstChild)h.removeChild(h.firstChild);
  h.appendChild(el('div','font-size:17px;font-weight:bold;margin-bottom:3px',k.ten));
  row=el('div','');
  HIEM_KEYS.forEach(function(key){
    row.appendChild(el('span','display:inline-block;margin:2px 3px;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid '+HIEM[key].mau+';color:'+HIEM[key].mau,HIEM[key].ten+' '+fmtPct(k.ti[key])));});
  h.appendChild(row);
  h.style.opacity='1';
  clearTimeout(s.hudTimer);
  s.hudTimer=setTimeout(function(){if(S===s)h.style.opacity='0';},4500);}

/* ---------- CẬP NHẬT ---------- */
function clampCam(val,view,size){return size<=view?(size-view)/2:clamp(val,0,size-view);}
function snapCam(s){
  var z=s.zoom;
  s.cam.x=clampCam(s.p.x-s.vw/z/2,s.vw/z,s.v.rong);
  s.cam.y=clampCam(s.p.y-s.vh/z/2,s.vh/z,s.v.cao);}
function update(s,dt){
  var v=s.v,p=s.p,z=s.zoom,inp,len,k,i,g,j,sp,dx,dy,r,b;
  s.clock+=dt*1000;
  /* di chuyển */
  inp=readInput(s);len=Math.sqrt(inp.x*inp.x+inp.y*inp.y);
  p.moving=len>0.05;
  if(p.moving){
    p.x=clamp(p.x+inp.x*CFG.nhanVat.toc*dt,0,v.rong);
    p.y=clamp(p.y+inp.y*CFG.nhanVat.toc*dt,0,v.cao);
    if(inp.x<-0.05)p.face=-1;else if(inp.x>0.05)p.face=1;
    p.walk+=dt*12;}
  else p.walk=0;
  /* camera bám nhân vật, kẹp trong biên map */
  s.cam.x+=(clampCam(p.x-s.vw/z/2,s.vw/z,v.rong)-s.cam.x)*Math.min(1,dt*9);
  s.cam.y+=(clampCam(p.y-s.vh/z/2,s.vh/z,v.cao)-s.cam.y)*Math.min(1,dt*9);
  s.cam.x=clampCam(s.cam.x,s.vw/z,v.rong);s.cam.y=clampCam(s.cam.y,s.vh/z,v.cao);
  /* bước vào khu mới -> HUD */
  k=khuTai(v,p.y);
  if(k&&k.id!==s.khuId){s.khuId=k.id;showHud(s,k);}
  /* điểm rung */
  tickSpots(s);
  /* đồng hồ boss (đọc localStorage mỗi ~250ms) */
  if(s.bossT<0||s.clock-s.bossT>=250){s.bossT=s.clock;s.bossMs=bossConLai(s.slug);}
  /* chạm (không trong cooldown) */
  if(s.clock<s.coolUntil)return;
  r=CFG.banKinhCham;
  for(i=0;i<s.groups.length;i++){
    g=s.groups[i];
    for(j=0;j<g.pts.length;j++){
      sp=g.pts[j];if(!sp.on)continue;
      dx=p.x-sp.x;dy=p.y-sp.y;
      if(dx*dx+dy*dy<=r*r){fireTouch(s,{loai:'diem',hiem:sp.hiem,khu:sp.khu,diemId:sp.id});return;}}}
  b=v.boss;
  if(b&&s.bossMs===0){
    dx=p.x-b.x;dy=p.y-b.y;
    if(dx*dx+dy*dy<=b.banKinhCham*b.banKinhCham){fireTouch(s,{loai:'boss',khu:4});return;}}}
function fireTouch(s,ev){
  s.coolUntil=s.clock+CFG.cooldownSauTran;   /* chống gọi lặp nếu host chưa kịp pause() */
  var h=s.host;
  if(h&&typeof h.onTouch==='function'){try{h.onTouch(ev);}catch(e){try{console.error('[TTGMAP] onTouch lỗi',e);}catch(_){}}}}

/* ---------- VẼ ---------- */
function ellipse(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.2832);c.fill();}
function drawSpot(s,sp){
  var c=s.ctx,col=HIEM[sp.hiem].mau,t=s.clock/1000,left=sp.until-s.clock,r=CFG.banKinhCham*0.62,pul=1+Math.sin(t*4+sp.ph)*0.12,a=1,g,f,q;
  if(left<3000)a=0.45+0.55*Math.abs(Math.sin(t*9));
  c.save();c.globalAlpha=a;c.translate(sp.x,sp.y);
  g=c.createRadialGradient(0,0,2,0,0,r*2.2*pul);g.addColorStop(0,hexA(col,0.55));g.addColorStop(1,hexA(col,0));
  c.fillStyle=g;c.beginPath();c.arc(0,0,r*2.2*pul,0,6.2832);c.fill();
  c.shadowColor=col;c.shadowBlur=18;c.lineWidth=3;c.strokeStyle=col;
  c.beginPath();c.arc(0,0,r*pul,0,6.2832);c.stroke();
  q=r*0.5;c.fillStyle=col;c.beginPath();c.moveTo(0,-q);c.lineTo(q*0.7,0);c.lineTo(0,q);c.lineTo(-q*0.7,0);c.closePath();c.fill();
  c.shadowBlur=0;
  f=clamp(left/CFG.rung,0,1);
  c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.85)';
  c.beginPath();c.arc(0,0,r*pul+6,-Math.PI/2,-Math.PI/2+f*6.2832);c.stroke();
  c.restore();}

function drawBoss(s){
  var b=s.v.boss,c=s.ctx,t=s.clock/1000,ms=s.bossMs,wait=ms>0,r=b.banKinhCham,bob=Math.sin(t*2)*3,g,y0=-r*0.9+bob;
  c.save();c.translate(b.x,b.y);
  c.globalAlpha=wait?0.35:1;
  ellipse(c,0,0,r*0.9,r*0.28,'rgba(0,0,0,.35)');
  if(!wait){
    g=c.createRadialGradient(0,y0,r*0.3,0,y0,r*1.7+Math.sin(t*3)*6);
    g.addColorStop(0,'rgba(255,212,92,.45)');g.addColorStop(1,'rgba(255,120,60,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,y0,r*1.8,0,6.2832);c.fill();}
  /* sừng */
  c.fillStyle='#e8f3ff';
  c.beginPath();c.moveTo(-r*0.6,y0-r*0.5);c.lineTo(-r*0.95,y0-r*1.25);c.lineTo(-r*0.2,y0-r*0.8);c.closePath();c.fill();
  c.beginPath();c.moveTo(r*0.6,y0-r*0.5);c.lineTo(r*0.95,y0-r*1.25);c.lineTo(r*0.2,y0-r*0.8);c.closePath();c.fill();
  /* thân */
  g=c.createLinearGradient(0,y0-r,0,y0+r);g.addColorStop(0,'#6f55d6');g.addColorStop(1,'#2c2470');
  c.fillStyle=g;c.beginPath();c.arc(0,y0,r*0.9,0,6.2832);c.fill();
  c.lineWidth=3;c.strokeStyle=wait?'#8aa0c0':'#ffd45c';c.stroke();
  /* mắt */
  c.fillStyle=wait?'#c8d6ea':'#ffd45c';
  ellipse(c,-r*0.33,y0-r*0.1,r*0.16,r*0.1,c.fillStyle);ellipse(c,r*0.33,y0-r*0.1,r*0.16,r*0.1,c.fillStyle);
  c.restore();
  /* nhãn trên đầu (không bị mờ) */
  c.save();c.globalAlpha=1;
  if(wait)txt(c,'⏳ '+dinhDangDem(ms),b.x,b.y-r*2.15,15,'#ffffff');
  else txt(c,b.ten||'Boss',b.x,b.y-r*2.15,15,'#ffd45c');
  c.restore();}

function chibi(c,k){
  c.fillStyle='#3d7be0';c.beginPath();c.ellipse(0,-k*0.24,k*0.22,k*0.24,0,0,6.2832);c.fill();
  c.fillStyle='#ff6b6b';c.fillRect(-k*0.2,-k*0.5,k*0.4,k*0.08);
  c.fillStyle='#ffe0c2';c.beginPath();c.arc(0,-k*0.68,k*0.26,0,6.2832);c.fill();
  c.fillStyle='#e8f3ff';c.beginPath();c.arc(0,-k*0.72,k*0.27,Math.PI,0);c.fill();
  c.fillStyle='#222';c.beginPath();c.arc(k*0.1,-k*0.66,k*0.035,0,6.2832);c.fill();
  c.fillStyle='#2a3f6e';c.fillRect(-k*0.14,-k*0.02,k*0.1,k*0.04);c.fillRect(k*0.04,-k*0.02,k*0.1,k*0.04);}
/* gốc toạ độ = chân nhân vật, quay PHẢI (đã scale(face,1) bên ngoài) */
function drawSprite(s,c,k){
  var T=root.THU_MOI,sp;
  if(CFG.nhanVat.anh){
    if(!s.sprite){s.sprite=new Image();s.sprite.src=CFG.nhanVat.anh;}
    sp=s.sprite;
    if(sp.complete&&sp.naturalWidth){c.drawImage(sp,-k/2,-k,k,k);return true;}}
  if(!s.thuFail&&T&&typeof T.draw==='function'){
    try{T.draw(c,0,-k/2,k);return true;}catch(e){s.thuFail=true;}}   /* lỗi 1 lần là thôi, rơi về chibi tạm */
  return false;}
function drawPlayer(s){
  var p=s.p,c=s.ctx,k=CFG.nhanVat.kich,bob=p.moving?Math.abs(Math.sin(p.walk))*CFG.nhanVat.nhun:0;
  ellipse(c,p.x,p.y,k*0.3*(1-bob*0.03),k*0.1,'rgba(0,0,0,.3)');
  c.save();c.translate(p.x,p.y-bob);c.scale(p.face,1);
  if(!drawSprite(s,c,k))chibi(c,k);
  c.restore();}

function draw(s){
  var c=s.ctx,v=s.v,z=s.zoom,d=s.dpr,ents=[],i,j,g;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#0a1018';c.fillRect(0,0,s.cv.width,s.cv.height);
  c.setTransform(d*z,0,0,d*z,-s.cam.x*z*d,-s.cam.y*z*d);
  c.drawImage(s.img,0,0,v.rong,v.cao);
  for(i=0;i<s.groups.length;i++){g=s.groups[i];for(j=0;j<g.pts.length;j++)if(g.pts[j].on)drawSpot(s,g.pts[j]);}
  if(v.boss)ents.push({y:v.boss.y,f:drawBoss});
  ents.push({y:s.p.y,f:drawPlayer});
  ents.sort(function(a,b){return a.y-b.y;});
  for(i=0;i<ents.length;i++)ents[i].f(s);}

/* ---------- VÒNG LẶP ---------- */
function frame(t){
  var s=S;if(!s||s.paused)return;
  s.raf=requestAnimationFrame(frame);
  var dt=s.last?Math.min(0.05,(t-s.last)/1000):0;s.last=t;
  update(s,dt);
  if(S!==s)return;   /* onTouch có thể đã close() */
  draw(s);}
function go(s){
  s.paused=false;s.last=0;
  bindKeys();
  if(s.ready&&!s.raf)s.raf=requestAnimationFrame(frame);}

/* ---------- API ---------- */
function open(host){
  var v,s;
  if(S)close();
  host=host||{};
  v=vung(host.vung);
  if(!v){try{console.warn('[TTGMAP] không có vùng: '+host.vung);}catch(e){}return false;}
  s=S={host:host,slug:host.vung||'tuyet-nguyen',v:v,img:null,ready:false,paused:false,raf:0,last:0,clock:0,coolUntil:0,
    keys:{},joy:{id:null,x:0,y:0},p:{x:v.xuatPhat.x,y:v.xuatPhat.y,face:1,walk:0,moving:false},
    cam:{x:0,y:0},zoom:CFG.camera.zoom||1,vw:0,vh:0,dpr:1,khuId:0,groups:[],bossT:-1,bossMs:bossConLai(host.vung||'tuyet-nguyen'),
    hudTimer:0,sprite:null,thuFail:false};
  buildDom(s);
  buildSpots(s);
  fit();
  window.addEventListener('resize',fit);
  try{var rf=s.root.requestFullscreen||s.root.webkitRequestFullscreen;if(rf){var pr=rf.call(s.root);if(pr&&pr.catch)pr.catch(function(){});}}catch(e){}
  try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(function(){});}catch(e){}
  s.img=new Image();
  s.img.onload=function(){
    if(S!==s)return;
    s.ready=true;s.load.style.display='none';
    fit();snapCam(s);
    if(!s.paused)go(s);else draw(s);};
  s.img.onerror=function(){if(S===s)s.load.textContent='Không tải được ảnh bản đồ.';};
  s.img.src=v.anh;
  return true;}

/* vào trận: dừng rAF + bỏ listener phím, GIỮ NGUYÊN vị trí / điểm rung / đồng hồ */
function pause(){
  var s=S;if(!s)return false;
  if(s.raf){cancelAnimationFrame(s.raf);s.raf=0;}
  unbindKeys();
  s.keys={};joyReset(s);
  s.paused=true;s.last=0;s.bossT=-1;
  s.coolUntil=s.clock+CFG.cooldownSauTran;   /* S.clock đứng yên lúc pause => cooldown tính từ lúc quay về map */
  return true;}

function resume(kq){return todo('resume','B6');}

/* Dừng/Esc: dọn sạch */
function close(){
  var s=S;if(!s)return false;
  S=null;
  if(s.raf){cancelAnimationFrame(s.raf);s.raf=0;}
  unbindKeys();
  window.removeEventListener('resize',fit);
  clearTimeout(s.hudTimer);
  s.img&&(s.img.onload=s.img.onerror=null);
  try{if(D.fullscreenElement===s.root&&D.exitFullscreen)D.exitFullscreen().catch(function(){});
      else if(D.webkitFullscreenElement===s.root&&D.webkitExitFullscreen)D.webkitExitFullscreen();}catch(e){}
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();}catch(e){}
  if(s.root&&s.root.parentNode)s.root.parentNode.removeChild(s.root);
  return true;}

/* đang mở và không tạm dừng */
function active(){return !!(S&&!S.paused);}
function debug(on){CFG.debugMask=on==null?!CFG.debugMask:!!on;return CFG.debugMask;}

/* ---------- KHUNG API CÒN LẠI (B6 điền vào) ---------- */
function todo(ten,buoc){try{console.warn('[TTGMAP] '+ten+' chưa làm (bước '+buoc+')');}catch(e){}return false;}

try{var _w=checkCfg();if(_w.length)console.warn('[TTGMAP] cấu hình có vấn đề:\n - '+_w.join('\n - '));}catch(e){}

root.TTGMAP={CFG:CFG,HIEM:HIEM,HIEM_KEYS:HIEM_KEYS,VUNG:VUNG,vung:vung,khuTai:khuTai,tungHiem:tungHiem,soDiemCan:soDiemCan,
  bossReadyAt:bossReadyAt,bossConLai:bossConLai,bossDanhXong:bossDanhXong,dinhDangDem:dinhDangDem,checkCfg:checkCfg,tungDich:tungDich,
  open:open,pause:pause,resume:resume,close:close,active:active,debug:debug};
})(typeof window!=='undefined'?window:globalThis);
