
/* ===== 18-rebirth.js — TÁI SINH =====
   Luồng:
   1. Nút ♻️ Tái Sinh (Tu Luyện Đường) -> về giao diện roll trứng. Mỗi lượt Quay tốn RB_COST xu (không còn 3 lượt miễn phí).
   2. Giao diện roll có 3 nút: Quay · Tái Sinh · Quay lại (nút "Ấp Trứng Này" và "Gieo Quẻ" bị ẩn).
   3. Tái Sinh -> bảng xác nhận (thông tin trứng + cảnh báo) -> Có: hiệu ứng trắng lóe ~5s rồi sang giao diện ấp trứng.
      Không: đóng bảng, về lại giao diện roll.
   4. Quay lại -> về game cũ, thú/cấp/EXP giữ nguyên (xu đã tiêu cho lượt quay thì không hoàn).
   Khi Tái Sinh: MẤT thú hiện tại, cấp, EXP, năm tuổi, nâng cấp huyết mạch.
                 GIỮ xu, uy danh, balo, kho trang bị, trang bị đang mặc, thuốc buff.
   Mọi con số sửa ngay dưới đây. */
(()=>{
'use strict';
const RB_COST=500;      /* xu mỗi lượt Quay */
const FX_IN=3000;       /* ms: màn hình từ từ trắng lóe */
const FX_OUT=2000;      /* ms: trắng tan dần, lộ giao diện ấp trứng (tổng ≈ 5s) */

/* hidden = vừa vào giao diện roll, chưa tốn xu quay lần nào: trứng bị ẩn (❓) và nút Tái Sinh bị khóa -> không có lượt xem trứng miễn phí */
const R=window.REBIRTH={on:false,fx:false,hidden:false,stash:null,cost:RB_COST};

/* ---------- tiện ích ---------- */
function isBusy(){ /* đang thám hiểm / đánh nhau / tiến hóa / bảng lên cấp thì chưa cho Tái Sinh */
  const x=$('xp'),m=$('mob');
  if(x&&getComputedStyle(x).display!=='none')return true;
  if(m&&m.style.display==='block')return true;
  if(window.EVO&&(EVO.on||EVO.queue.length))return true;
  if(window.NOTI&&(NOTI.open||NOTI.q.length))return true;
  return false}
function lockEntry(on){const b=$('btn-rebirth');if(!b)return;b.disabled=on;b.classList.toggle('locked',on)}
function layout(){ /* bật/tắt nút theo chế độ Tái Sinh */
  const rb=R.on;
  $('btn-reroll').style.display=rb?'none':'';
  $('btn-confirm').style.display=rb?'none':'';
  $('rb-top').style.display=rb?'grid':'none';
  $('rb-back').style.display=rb?'block':'none';
  $('pick-title').textContent=rb?'Tái Sinh · Chọn Linh Trứng':'Chọn Linh Trứng'}

/* ---------- vào giao diện roll ---------- */
function enter(){
  if(R.on||R.fx||!hatched||!pet)return;
  if(isBusy()){popToast('⚠️ CHƯA THỂ TÁI SINH','Hãy dừng thám hiểm và chờ các hiệu ứng kết thúc rồi thử lại.','bad');return}
  R.stash={pet,eggQ,hist:hist.slice(),rolls,rerollLeft};
  R.on=true;R.hidden=true;
  /* về trạng thái "đang chọn trứng": thú/cấp cũ được cất trong stash, cấp & EXP chỉ bị xóa khi bấm Có */
  pet=null;hatched=false;chosen=false;prog=0;
  eggQ=pick(QW);hist=[];rolls=0;rerollLeft=0;burst=.5; /* eggQ chỉ là chỗ giữ chỗ, không bao giờ được hiển thị khi còn ẩn */
  $('s-main').style.display='none';$('s-egg').style.display='none';$('s-pick').style.display='';
  layout();
  $('h-status').textContent='Tái Sinh';
  $('banner').textContent='Tái Sinh: Chọn Linh Trứng';
  renderPick();
  log('♻️ <b style="color:var(--gold)">Tái Sinh</b>: mỗi lượt quay linh trứng tốn <b>'+RB_COST+' xu</b>.')}

/* ---------- Quay (tốn xu) ---------- */
function roll(){
  if(!R.on||R.fx)return;
  if(gold<RB_COST){
    popToast('⚠️ KHÔNG ĐỦ XU','Mỗi lượt quay tốn <b>'+RB_COST+' xu</b>, bạn đang có <b>'+gold+'</b> xu.','bad');
    log('♻️ Không đủ xu để quay (cần '+RB_COST+', đang có '+gold+').');renderPick();return}
  gold-=RB_COST;stats();
  rerollLeft=1;rerollEgg();rerollLeft=0; /* dùng lại logic + tia sáng của rerollEgg (08-eggs.js) */
  if(R.hidden){hist.shift();R.hidden=false} /* bỏ quả trứng ẩn khỏi lịch sử để không thể bấm xem lại miễn phí */
  log('♻️ Quay linh trứng (−'+RB_COST+' xu): <b style="color:rgb('+QC[eggQ]+')">'+QN[eggQ]+' phẩm</b>.');
  renderPick()}

/* ---------- Quay lại ---------- */
function back(){
  if(!R.on||R.fx)return;
  const s=R.stash;R.hidden=false;
  pet=s.pet;eggQ=s.eggQ;hist=s.hist;rolls=s.rolls;rerollLeft=s.rerollLeft;
  hatched=true;chosen=true;lastTick=Date.now();
  R.on=false;R.stash=null;
  $('s-pick').style.display='none';$('s-main').style.display='';
  layout();
  burst=Math.max(burst,.3);
  const sn=STAGES[stageOf(level)][1];$('h-status').textContent=sn;$('banner').textContent=sn; /* trả tên bậc + banner về như cũ (không kích hoạt tiến hóa) */
  renderInfo();renderExp();
  log('↩ Quay lại, bạn giữ nguyên thú hiện tại.')}

/* ---------- bảng xác nhận ---------- */
let ov=null;
function buildOv(){
  ov=document.createElement('div');ov.id='rb-ov';document.body.appendChild(ov)}
function ask(){
  if(!R.on||R.fx||R.hidden)return;
  if(!ov)buildOv();
  const q=eggQ,t=pct(TW[q]);
  const tiers=TIERN.map((n,i)=>'<span style="color:'+TIERC[i]+'">'+n+' '+t[i]+'%</span>').join(' · ');
  ov.innerHTML='<div class="rb-box">'+
    '<div class="rb-t">♻️ TÁI SINH</div>'+
    '<div class="rb-q">Bạn có muốn tái sinh với trứng này không?</div>'+
    '<div class="rb-egg"><img src="img-eggs-egg-0'+(q+1)+'.webp" alt="">'+
      '<div>Linh Trứng <b class="rb-qn" style="color:rgb('+QC[q]+')">'+QN[q]+' phẩm</b><br>'+
      'Vùng đất: '+tiers+'<br>'+
      'Tộc Cửu Vĩ Hồ: '+FOXP[q]+'%<br>'+
      '<small>Huyết mạch được giấu đến lúc trứng nở.</small></div></div>'+
    '<div class="rb-warn">⚠️ Tái Sinh sẽ ấp quả trứng này và cày lại từ đầu (thú hiện tại, cấp và huyết mạch sẽ mất). <b>Xu và tài nguyên sẽ không bị mất.</b></div>'+
    '<div class="rb-btns"><button class="jade" id="rb-yes">Có</button><button id="rb-no">Không</button></div></div>';
  $('rb-yes').onclick=go;$('rb-no').onclick=closeAsk;
  ov.classList.add('show')}
function closeAsk(){if(ov)ov.classList.remove('show')}

/* ---------- Có: trắng lóe ~5s rồi sang giao diện ấp trứng ---------- */
function go(){
  if(!R.on||R.fx||R.hidden)return;
  closeAsk();R.fx=true;
  const f=document.createElement('div');f.id='rb-flash';document.body.appendChild(f);
  f.style.transition='opacity '+FX_IN+'ms cubic-bezier(.45,0,.85,.55)';
  requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.opacity='1'}));
  setTimeout(()=>{            /* màn hình đã trắng hoàn toàn: đổi sang ấp trứng phía sau */
    apply();
    f.style.transition='opacity '+FX_OUT+'ms ease-out';f.style.opacity='0';
    setTimeout(()=>{f.remove();R.fx=false},FX_OUT+60)
  },FX_IN+120)}

function apply(){
  const old=R.stash?R.stash.pet:null,oldLv=level;
  R.on=false;R.hidden=false;R.stash=null;
  /* --- reset tiến trình thú --- */
  level=1;exp=0;age=0;taps=0;prog=0;waiting=false;task=null;shake=0;hatchAge=0;
  gs=0;curStage=-1;vs=0;pv.on=false;
  upPut.huyet=0;upPut.thuoc=0;upPut.tinh=0;upSel=null;upMsg=''; /* ô nâng cấp huyết mạch (09-blood.js) */
  if(window.EVO){EVO.queue.length=0;EVO.shown=null;EVO.got=[]}
  /* --- xu, uy danh, balo, trang bị, buff: KHÔNG đụng tới --- */
  $('h-age').textContent=0;
  layout();
  $('s-main').style.display='';
  $('main-title').textContent='Tu Luyện Đường (Đang Khóa)';
  ['train','arena','shop'].forEach(k=>{const b=$('btn-'+k);b.disabled=true;b.classList.add('locked')});
  lockEntry(true);
  $('mission').textContent='Chạm liên tục để làm vỡ vỏ trứng!';
  confirmEgg(); /* sang giao diện ấp trứng (ẩn s-pick, hiện s-egg, setupTap) */
  renderExp();stats();
  log('♻️ <b style="color:var(--gold)">Tái Sinh</b>'+(old?' — '+genOf(old.bl,old.sp).name+' cấp '+oldLv+' đã trở về hư vô':'')+'. Xu và tài nguyên vẫn còn nguyên, hành trình mới bắt đầu!')}

/* ---------- nối vào game ---------- */
/* trứng ẩn: vẽ bóng trứng + dấu ❓ thay vì trứng thật (không lộ phẩm qua sprite, hào quang hay tia sáng) */
const _eg=window.egg;
window.egg=function(t){
  if(!(R.on&&R.hidden))return _eg(t);
  const q0=eggQ;eggQ=0;try{_eg(t)}finally{eggQ=q0} /* chỉ lấy nền + bệ, màu trung tính */
  const x=180,y=133+Math.sin(t*3)*2;
  c.save();c.translate(x,y);c.scale(1.7,1.7);
  const g=c.createLinearGradient(0,-46,0,46);g.addColorStop(0,'#2d2347');g.addColorStop(1,'#0d0919');
  c.fillStyle=g;c.fill(EGGP);c.lineWidth=1.6;c.strokeStyle='rgba(242,199,106,.92)';c.stroke(EGGP);c.restore();
  c.save();c.textAlign='center';c.textBaseline='middle';c.font='bold 48px sans-serif';
  c.shadowColor='#f2c76a';c.shadowBlur=12+4*Math.sin(t*3);c.fillStyle='#ffe9a8';c.fillText('?',x,y+3);c.restore()};

/* bảng "Chỉ số" cũng không được lộ phẩm trứng khi còn ẩn */
function hideInfo(){const el=$('info');if(el)el.innerHTML='Phẩm chất trứng: <b>❓ Chưa rõ</b><br><small>Hãy quay để xem linh trứng.</small>'}
{const _ri=renderInfo;renderInfo=function(){_ri.apply(this,arguments);if(R.on&&R.hidden)hideInfo()}}

{const _rp=renderPick;
 renderPick=function(){_rp();
  if(!R.on)return;
  const b=$('rb-roll'),can=gold>=RB_COST,go=$('rb-go');
  b.innerHTML='<span class="ic">🎲</span>Quay ('+RB_COST+' xu)';
  b.disabled=!can;b.classList.toggle('locked',!can);
  go.disabled=R.hidden;go.classList.toggle('locked',R.hidden); /* mờ + không bấm được cho tới khi quay ít nhất 1 lần */
  if(R.hidden){
    $('pick-desc').innerHTML='Linh trứng hiện tại: <b style="color:var(--gold)">❓ Chưa rõ</b><br><small>Bấm <b>Quay</b> để xem linh trứng. Chỉ có thể Tái Sinh sau khi đã quay.</small>';
    $('rates').innerHTML='<b>Tỉ lệ phẩm trứng:</b> '+QN.map((n,i)=>n+' '+QW[i]+'%').join(' · ');
    hideInfo()}
  $('pick-desc').insertAdjacentHTML('beforeend','<br><small style="color:var(--gold)">♻️ Mỗi lượt quay tốn <b>'+RB_COST+' xu</b> · bạn có <b>'+gold+'</b> xu</small>')}}
{const _h=hatch;hatch=function(){_h.apply(this,arguments);lockEntry(false)}} /* nở xong -> mở nút Tái Sinh */

$('rb-roll').onclick=roll;
$('rb-go').onclick=ask;
$('rb-back').onclick=back;
window.rebirthOpen=enter;
lockEntry(!hatched);
})();
