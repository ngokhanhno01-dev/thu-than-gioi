
/* ===== 16-notify.js — Bảng thông báo LÊN CẤP / LÊN BẬC (+ ẩn dòng log "Thú đánh -26 ..." dưới khung đấu) =====
   - Lên cấp: hiện bảng ngay (khi không đang ở trong trận / màn kết quả), liệt kê chỉ số được cộng.
   - Lên bậc: đợi hiệu ứng tiến hóa (13-evolve.js) chạy xong HẾT (kể cả nhảy nhiều bậc cùng lúc) rồi mới hiện bảng.
   - Nếu vừa lên cấp vừa lên bậc: bảng lên cấp hiện trước -> bấm OK -> chạy hiệu ứng tiến hóa -> bảng lên bậc.
   Điểm móc: 05-hatch.js (addExp gọi NOTI.level) và 13-evolve.js (canStart / announce / finish gọi NOTI.*). */
(()=>{
'use strict';
const $n=id=>document.getElementById(id);
const KEYS=[['hp','Sinh Lực'],['atk','Công'],['def','Thủ'],['spd','Tốc'],['mag','Pháp Công']];

/* ---- CSS ---- */
{const s=document.createElement('style');
 s.textContent=
 '#mob-r{display:none!important}'+                                   /* bỏ dòng log dưới khung đấu */
 '#noti{position:fixed;inset:0;z-index:130;display:none;align-items:center;justify-content:center;background:rgba(4,10,14,.74);padding:12px;box-sizing:border-box}'+
 '#noti.show{display:flex}'+
 '#noti .box{width:min(88vw,330px);max-height:88vh;overflow-y:auto;box-sizing:border-box;text-align:center;padding:10px 14px 12px;'+
 'border:3px solid #f6c66a;background-color:#14272d;background-image:repeating-conic-gradient(#1a3335 0 25%,#12262e 0 50%);background-size:4px 4px;'+
 'box-shadow:0 3px 0 0 #040a0e,0 0 0 2px #040a0e,inset 0 0 0 2px #78613a;font-family:"VT323",monospace!important;color:#f5edcf;animation:notipop .3s steps(5) both}'+
 '#noti .box *{font-family:"VT323",monospace!important}'+
 '#noti .nt{font-size:26px!important;color:#f6c66a;font-weight:700;letter-spacing:1px;text-shadow:1px 1px 0 #071116;line-height:1.1}'+
 '#noti .nt b{color:#72e4b0}'+
 '#noti .ns{margin-top:3px;font-size:19px!important;color:#f5edcf}'+
 '#noti .ns b{color:#f6c66a}'+
 '#noti canvas{display:block;margin:6px auto 0;width:112px;height:112px;image-rendering:pixelated}'+
 '#noti .nr{margin:8px 0 0;border-top:2px solid #465044}'+
 '#noti .nr>div{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:2px 2px;border-bottom:2px solid #465044;font-size:20px!important}'+
 '#noti .nr span{color:#cfd8c4}'+
 '#noti .nr b{color:#f5edcf;font-weight:700}'+
 '#noti .nr i{font-style:normal;color:#72e4b0;margin-left:6px;font-weight:700}'+
 '#noti .nn{margin-top:6px;font-size:17px!important;color:#9fb0a4}'+
 '#noti button{margin:10px auto 0;display:block;min-width:120px;padding:5px 18px;font-size:22px!important;font-weight:700;color:#14272d;background:#f6c66a;border:3px solid #78613a;border-radius:0;box-shadow:0 3px 0 0 #040a0e;cursor:pointer}'+
 '#noti button:active{transform:translateY(2px);box-shadow:0 1px 0 0 #040a0e}'+
 '@keyframes notipop{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}';
 document.head.appendChild(s)}

/* ---- trạng thái ---- */
const N=window.NOTI={q:[],open:false,cur:null,raf:0};
N.blocking=()=>N.open||N.q.some(x=>x.k==='lv');                         /* đang có bảng lên cấp chờ/đang mở -> chưa cho tiến hóa chạy */
N.level=(l0,l1)=>{                                                         /* gọi từ addExp() */
  if(!(l1>l0))return;
  const last=N.q[N.q.length-1];
  if(last&&last.k==='lv'&&!last.shown){last.l1=l1;return}                  /* gộp nếu chưa kịp hiện */
  N.q.push({k:'lv',l0,l1});
};
N.rank=list=>{if(list&&list.length)N.q.push({k:'rank',list:list.slice()})}; /* gọi từ EVO.finish() khi tiến hóa xong hết */

/* ---- tiện ích ---- */
const stat=l=>{try{return statsOf(pet.bl,pet.pi,pet.base,l)}catch(_){return null}};
const visible=id=>{const e=$n(id);return !!e&&getComputedStyle(e).display!=='none'};
function canShow(it){
  if(typeof hatched!=='undefined'&&!hatched)return false;
  const m=$n('mob');if(m&&m.style.display==='block')return false;         /* đang đánh nhau */
  if(visible('xp'))return false;                                           /* đang ở màn kết quả / thám hiểm */
  const E=window.EVO;
  if(E){if(E.on)return false;if(it.k==='rank'&&E.queue.length)return false}
  return true;
}
function ui(){
  let el=$n('noti');
  if(!el){el=document.createElement('div');el.id='noti';
    el.innerHTML='<div class="box"><div id="noti-body"></div><button type="button" id="noti-ok">OK</button></div>';
    document.body.appendChild(el);
    $n('noti-ok').onclick=close}
  return el}
function rows(a,b,abs){                                                    /* a: chỉ số cũ, b: chỉ số mới */
  return '<div class="nr">'+KEYS.map(([k,n])=>{
    const d=b[k]-a[k];
    return '<div><span>'+n+'</span><span>'+(abs?'<b>'+b[k]+'</b>':'<b>'+a[k]+' → '+b[k]+'</b>')+(d>0?'<i>+'+d+'</i>':'')+'</span></div>'}).join('')+'</div>'}

function show(it){
  const el=ui(),body=$n('noti-body');
  if(!pet){N.q.shift();return}
  let html='';
  if(it.k==='lv'){
    const a=stat(it.l0),b=stat(it.l1);
    html='<div class="nt">⬆️ LÊN CẤP <b>'+it.l1+'</b>!</div>'+
      (it.l1-it.l0>1?'<div class="ns">Cấp <b>'+it.l0+'</b> → <b>'+it.l1+'</b></div>':'')+
      (a&&b?rows(a,b,false):'')+
      '<div class="nn">Chỉ số được cộng thêm khi lên cấp</div>';
    N.cur=null;
  }else{
    const first=it.list[0],to=it.list[it.list.length-1];
    const startL=Math.max(1,STAGES[first-1][0]),nowL=Math.max(level,STAGES[to][0]);
    const a=stat(startL),b=stat(nowL);
    html='<div class="nt">🌟 <b>TIẾN HÓA</b> THÀNH CÔNG!</div>'+
      '<canvas id="noti-pet" width="128" height="128"></canvas>'+
      '<div class="ns">'+(it.list.length>1?'<b>'+STAGES[first-1][1]+'</b> → ':'')+'<b>'+STAGES[to][1]+'</b></div>'+
      (a&&b?rows(a,b,true):'')+
      '<div class="nn">Chỉ số tăng so với đầu '+STAGES[first-1][1].replace(/\s*\(.*\)/,'')+' · đã mở hình dạng mới</div>';
    N.cur={stage:to};
  }
  it.shown=true;body.innerHTML=html;
  el.classList.add('show');N.open=true;
  if(it.k==='rank'&&!N.raf)N.raf=requestAnimationFrame(drawPet);
}
function drawPet(){
  const cv=$n('noti-pet');
  if(!cv||!N.open||!N.cur||!pet){N.raf=0;return}
  const x=cv.getContext('2d'),api=window.VanKiepSprites,stg=N.cur.stage;
  x.clearRect(0,0,128,128);x.imageSmoothingEnabled=false;
  if(!(api&&api.drawStageCentered(x,pet.bl,pet.sp,stg,64,64,128*api.stageScale(stg)))){
    try{const im=spriteFor(pet.bl,pet.sp);if(im.complete&&im.naturalWidth)x.drawImage(im,0,0,128,128)}catch(_){}}
  N.raf=requestAnimationFrame(drawPet);
}
function close(){
  const el=$n('noti');if(el)el.classList.remove('show');
  N.open=false;N.cur=null;N.q.shift();
}
/* kiểm tra định kỳ: tới lúc phù hợp thì mở bảng kế tiếp */
setInterval(()=>{
  if(N.open||!N.q.length)return;
  if(canShow(N.q[0]))show(N.q[0]);
},250);
})();
