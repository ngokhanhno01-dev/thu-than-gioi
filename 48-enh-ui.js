/* ===== 48-enh-ui.js — [CUONG HOA 5, làm lại] Tab ⚡ Cường hóa trong mục 🛡️ Trang bị =====
   Nạp SAU 12-equip.js, 45-enh-border.js, 46-enh-items.js (cần thêm cnt/removeItem/upToast của 09-blood.js).
   Không sửa file cũ: bọc renderEquip() để thêm tab thứ 3 (eqTab='enh'); chỉ số tự tính lại từ it.e (xem eqVal ở 12-equip.js).
   Giao diện làm GIỐNG tab Rèn: nút chọn ở trên, vòng tròn nguyên liệu hình tam giác (đá / ngũ sắc / vé) quanh món ở giữa,
   cột phải chọn ô trang bị + TỈ LỆ THÀNH CÔNG + CHỈ SỐ TRƯỚC/SAU, rồi các khung 📦 Nguyên liệu · nút bấm · thông báo. Dùng lại class CSS của Rèn.
   [HỒI HỘP] Bấm Cường hóa: trừ đá/xu + quay kết quả + lưu NGAY (thoát game giữa chừng cũng không mất/không gian lận),
   rồi chiếu hiệu ứng ~3 giây (rung, tụ sáng, hạt xoáy vào) → nổ "bùm" → hiện THÀNH CÔNG/THẤT BẠI → mới hiện thông báo + thông tin.
   Hiệu ứng chạy bằng requestAnimationFrame (không dùng CSS animation, vì style.css có luật reduced-motion ép animation đứng yên).
   Mọi con số sửa ở khối cấu hình ngay bên dưới. */

/* ---------- Cấu hình ---------- */
const ENH_RATE=[95,90,85,75,65,55,45,35,25,15];   /* tỉ lệ thành công (%) theo cấp hiện tại 0→9 */
const ENH_STONE_QTY=[1,1,2,2,3,3,4,4,5,5];        /* số đá cường hóa mỗi lần theo cấp hiện tại 0→9 */
const ENH_XU_BASE=200;                            /* xu mỗi lần = ENH_XU_BASE × (cấp hiện tại + 1) */
const ENH_DROP_FROM=4;                            /* từ cấp này trở lên, thất bại bị tụt 1 cấp (+4…+9) */
const ENH_RB_PCT=5;                               /* mỗi Đá Ngũ Sắc cộng bấy nhiêu % tỉ lệ thành công */
const ENH_TAB_ICO=(typeof ENH_TAB_IMG!=='undefined')?ENH_TAB_IMG:'⚡';   /* [CUONG HOA 6] icon nút tab + nút Cường hóa = ảnh img-enh-tab.png (46-enh-items.js); lỗi thì rơi về emoji ⚡ */
const ENH_FX_MS=3000;                             /* thời gian tụ lực + trắng xóa trước khi lộ kết quả (ms) */
const ENH_BOOM_MS=1300;                           /* thời gian trắng tan + hiện kết quả (ms) */
const ENH_HOLD_MS=600;                            /* giữ kết quả thêm bao lâu rồi tự đóng (chạm màn hình để đóng sớm) */

/* ---------- Logic thuần (không đụng giao diện, dễ test) ---------- */
const enhNeed=e=>({stone:ENH_STONE_QTY[e],xu:ENH_XU_BASE*(e+1)});
const enhRateAt=(e,rb)=>Math.min(100,ENH_RATE[e]+ENH_RB_PCT*(rb||0));
const enhRbMax=e=>Math.max(0,Math.ceil((100-ENH_RATE[e])/ENH_RB_PCT));   /* số đá ngũ sắc tối đa còn có ích (chạm 100%) */
/* roll ∈ [0,100). Thành công: +1. Thất bại: ≥ +4 tụt 1 cấp, trừ khi dùng vé (saved=true → giữ cấp, mất 1 vé). Dưới +4: giữ cấp, KHÔNG mất vé. */
function enhResolve(e,roll,ticket,rate){
 if(roll<rate)return{ok:true,e2:e+1,saved:false};
 if(e>=ENH_DROP_FROM)return ticket?{ok:false,e2:e,saved:true}:{ok:false,e2:e-1,saved:false};
 return{ok:false,e2:e,saved:false}}

/* ---------- Trạng thái giao diện ---------- */
let enhUid=0,enhTier=0,enhRb=0,enhTicket=false,enhMsg='',enhBusy=false,enhBagOpen=false,enhInfoOpen=false;
const enhFind=uid=>{for(const it of eqWorn)if(it&&it.uid===uid)return it;return ebag.find(x=>x.uid===uid)||null};
const enhStoneChoice=it=>{const t=enhTierOf(it.z);return t.indexOf(enhTier)>=0?enhTier:t[0]};   /* mặc định đá đúng bậc vùng; bậc 6 nếu người chơi chọn */
function enhPick(uid){if(enhBusy)return;enhUid=uid;enhTier=0;enhRb=0;enhMsg='';enhBagOpen=false;renderEquip()}
function enhSetTier(t){if(enhBusy)return;enhTier=t;enhMsg='';renderEquip()}
function enhCycleTier(){if(enhBusy)return;const it=enhFind(enhUid);if(!it)return;const t=enhTierOf(it.z);if(t.length<2)return;enhTier=enhStoneChoice(it)===t[0]?t[1]:t[0];enhMsg='';renderEquip()}
function enhRbAdd(d){
 if(enhBusy)return;
 const it=enhFind(enhUid);if(!it)return;
 const lim=Math.min(cnt('da_ngu_sac'),enhRbMax(it.e||0));
 enhRb=Math.max(0,Math.min(lim,enhRb+d));enhMsg='';renderEquip()}
function enhRbCycle(){      /* chạm ô Đá Ngũ Sắc ở vòng tròn: +1 viên; đang ở mức tối đa thì về 0 */
 if(enhBusy)return;
 const it=enhFind(enhUid);if(!it)return;
 const lim=Math.min(cnt('da_ngu_sac'),enhRbMax(it.e||0));
 enhRb=enhRb>=lim?0:enhRb+1;enhMsg='';renderEquip()}
function enhToggleTicket(){if(enhBusy)return;if(!enhTicket&&!cnt('ve_bao_ho'))return;enhTicket=!enhTicket;renderEquip()}
function enhToggleBag(){enhBagOpen=!enhBagOpen;renderEquip()}
function enhToggleInfo(){enhInfoOpen=!enhInfoOpen;renderEquip()}

/* ---------- Hiệu ứng cường hóa — làm GIỐNG hiệu ứng Tái Sinh (18-rebirth.js), ~4.8 giây, vẽ bằng canvas + requestAnimationFrame ----------
   it = món đang cường hóa; kind = 'ok' | 'saved' | 'bad'; txt = dòng kết quả; done() chạy đúng 1 lần khi xong.
   0–0.9s   món rung nhẹ + sáng dần, hạt linh khí màu phẩm xoáy hút vào tâm
   0.9–2.3s quầng sáng đập nhịp nhanh dần, lớp trắng dâng lên từ từ
   2.3–3.0s trắng xóa toàn màn hình (kết quả đã chốt sẵn, đang bị trắng che)
   3.0–4.2s trắng tan dần + sóng xung kích, lộ món đồ và kết quả: vàng = thành công, xanh = được bảo hộ, đỏ = thất bại */
function enhPlay(it,kind,txt,done){
 let fin=false,ov=null;const end=()=>{if(fin)return;fin=true;try{ov&&ov.remove()}catch(_){}done()};
 try{
  const old=document.getElementById('enh-fx');if(old)old.remove();
  const c01=v=>v<0?0:v>1?1:v,sm=v=>{v=c01(v);return v*v*(3-2*v)};
  const rgb=QC[it.q]||'255,210,74',col='rgb('+rgb+')',
   BR=kind==='ok'?'255,210,74':kind==='saved'?'111,209,255':'255,74,74',bc='rgb('+BR+')';
  const dpr=Math.min(2,window.devicePixelRatio||1),VW=window.innerWidth,VH=window.innerHeight,cx=VW/2,cy=VH*.42;
  const FX=ENH_FX_MS,T={DIM:600,PULSE0:900,PULSE1:FX-700,RISE:FX-300,FADE0:FX,END:FX+ENH_BOOM_MS};
  ov=document.createElement('div');ov.id='enh-fx';
  ov.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;z-index:99000;background:rgba(5,6,16,.9);overflow:hidden;touch-action:none';
  ov.innerHTML='<canvas id="enh-fx-g" width="'+Math.round(VW*dpr)+'" height="'+Math.round(VH*dpr)+'" style="position:absolute;left:0;top:0;width:'+VW+'px;height:'+VH+'px"></canvas>'+
   '<div id="enh-fx-c" style="position:absolute;left:'+(cx-46)+'px;top:'+(cy-46)+'px;width:92px;height:92px;display:flex;align-items:center;justify-content:center;background:#183036;border:3px solid '+col+'">'+eqIco(it.s,it.z)+'</div>'+
   '<div id="enh-fx-t" style="position:absolute;left:0;right:0;top:'+Math.round(cy+84)+'px;text-align:center;font-size:24px;font-weight:700;color:#f6e9e4;padding:0 12px;text-shadow:0 2px 0 #000"></div>'+
   '<div id="enh-fx-f" style="position:absolute;left:0;top:0;right:0;bottom:0;background:#fff;opacity:0;pointer-events:none"></div>';
  document.body.appendChild(ov);
  const g=ov.querySelector('#enh-fx-g').getContext('2d'),c=ov.querySelector('#enh-fx-c'),t=ov.querySelector('#enh-fx-t'),f=ov.querySelector('#enh-fx-f');
  /* hạt linh khí xoáy vào tâm (giống Tái Sinh) */
  const NP=40,far=Math.max(VW,VH)*.5;
  const mk=()=>({a:Math.random()*6.2832,R:(90+Math.random()*(far-90)),u:0,s:1/(900+Math.random()*600),d:Math.random()<.5?-1:1,m:Math.random()<.6});
  const P=Array.from({length:NP},()=>{const p=mk();p.u=Math.random();return p});
  /* tia/mảnh văng ra lúc lộ kết quả */
  let burst=null;
  const mkBurst=()=>Array.from({length:kind==='ok'?44:28},()=>{
   const a=Math.random()*6.2832,v=kind==='ok'?70+Math.random()*260:50+Math.random()*170;
   return{x:cx,y:cy,vx:Math.cos(a)*v,vy:Math.sin(a)*v*(kind==='ok'?.8:.6)-(kind==='bad'?30:70),gy:kind==='ok'?40:kind==='bad'?420:120,sz:4+Math.floor(Math.random()*3)*2,w:Math.random()<.4}});
  const t0=performance.now();let last=t0,phase=0,revealed=false;
  ov.addEventListener('click',()=>{if(revealed&&performance.now()-t0>FX+500)end()});
  const frame=now=>{
   if(fin)return;
   const el=now-t0,dt=Math.min(100,now-last);last=now;
   if(el>=T.END+ENH_HOLD_MS){end();return}
   g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,VW,VH);
   /* món đồ: rung + sáng dần; lúc lộ kết quả bật to rồi về cỡ thường */
   if(el<FX){
    const a=2.2*sm(el/2400);
    c.style.transform='translate('+(Math.sin(el*.09)*a).toFixed(1)+'px,'+(Math.cos(el*.13)*a*.6).toFixed(1)+'px) scale('+(1+.12*sm(el/FX)).toFixed(3)+')';
    c.style.filter='brightness('+(1+1.6*sm((el-T.DIM)/1700)).toFixed(2)+')';
    c.style.boxShadow='0 0 '+(10+50*sm(el/FX)).toFixed(0)+'px '+(4+14*sm(el/FX)).toFixed(0)+'px '+col;
    t.style.opacity=String(.9);t.textContent='⚡ Đang cường hóa'+'...'.slice(0,1+Math.floor(el/350)%3);
   }else{
    const q=c01((el-FX)/ENH_BOOM_MS),sh=kind==='bad'?(1-q)*5:0;
    if(!revealed){revealed=true;burst=mkBurst();t.textContent=txt;t.style.color=bc;t.style.fontSize='26px';c.style.borderColor=bc}
    c.style.transform='translate('+(Math.sin(el*.7)*sh).toFixed(1)+'px,'+(Math.cos(el*.9)*sh*.6).toFixed(1)+'px) scale('+(1.3-.3*sm(q*1.6)).toFixed(3)+')';
    c.style.filter=kind==='bad'?'brightness('+(.65+.35*q).toFixed(2)+') saturate('+(.5+.5*q).toFixed(2)+')':'brightness('+(1.5-.5*q).toFixed(2)+')';
    c.style.boxShadow='0 0 '+(50*(1-q)+8).toFixed(0)+'px '+(14*(1-q)).toFixed(0)+'px '+bc;
   }
   /* hạt xoáy vào tâm */
   if(el<2300){
    g.save();
    for(const p of P){
     p.u+=dt*p.s;
     if(p.u>=1){if(el<1900)Object.assign(p,mk());else continue}
     const e=p.u*p.u,rr=p.R*(1-e)+8,an=p.a+p.d*p.u*1.3,
      x=Math.round((cx+Math.cos(an)*rr)/2)*2,y=Math.round((cy+Math.sin(an)*rr*.68)/2)*2,
      al=Math.min(1,p.u*6)*(1-c01((p.u-.88)*8))*(1-sm((el-1900)/400));
     if(al<=.02)continue;
     g.globalAlpha=al;g.fillStyle=col;g.fillRect(x-4,y-4,8,8);
     g.fillStyle=p.m?'#ffe9a8':'#fff';g.fillRect(x-2,y-2,4,4)}
    g.restore()}
   /* quầng sáng đập nhịp nhanh dần */
   let pulse=0;
   if(el<FX){
    const hz=el<T.PULSE0?1.5:el<T.PULSE1?2+9*Math.pow((el-T.PULSE0)/(T.PULSE1-T.PULSE0),1.6):11;
    phase+=dt*hz*.006283;pulse=.5+.5*Math.sin(phase)}
   if(el<FX+150){
    const A=.35*sm(el/T.PULSE0)+.65*sm((el-T.PULSE0)/1500),Rg=60+(Math.max(VW,VH)*.4)*sm(el/T.PULSE1)+26*pulse,
     al=Math.min(1,A*(.6+.4*pulse)),gr=g.createRadialGradient(cx,cy,2,cx,cy,Rg);
    gr.addColorStop(0,'rgba(255,255,255,'+al.toFixed(3)+')');
    gr.addColorStop(.45,'rgba('+rgb+','+(al*.5).toFixed(3)+')');
    gr.addColorStop(1,'rgba('+rgb+',0)');
    g.fillStyle=gr;g.fillRect(0,0,VW,VH)}
   /* lớp trắng: dâng từ từ, trắng xóa, rồi tan dần */
   let v;
   if(el<T.PULSE0)v=0;
   else if(el<T.PULSE1)v=.4*sm((el-T.PULSE0)/(T.PULSE1-T.PULSE0))*(.85+.15*pulse);
   else if(el<T.RISE)v=.4+.6*sm((el-T.PULSE1)/(T.RISE-T.PULSE1));
   else if(el<T.FADE0)v=1;
   else v=1-sm((el-T.FADE0)/(T.END-T.FADE0));
   f.style.opacity=v<.003?'0':v.toFixed(3);
   /* sóng xung kích + tia văng khi trắng bắt đầu tan */
   if(el>=T.FADE0){
    for(let n=0;n<2;n++){
     const u=(el-(T.FADE0+n*140))/950;if(u<=0||u>=1)continue;
     const Rr=Math.max(VW,VH)*.7*(1-(1-u)*(1-u)),a=(1-u)*(n?.7:1);
     g.save();g.lineWidth=2+8*(1-u);g.strokeStyle='rgba('+(n?BR:'255,255,255')+','+a.toFixed(3)+')';
     g.beginPath();g.ellipse(cx,cy,Rr,Rr*.72,0,0,6.2832);g.stroke();g.restore()}
    if(burst){
     const s=(el-FX)/1000,al=1-sm((s-.35)/.8);
     if(al>.02){g.save();g.globalAlpha=al;
      for(const b of burst){
       const x=Math.round((b.x+b.vx*s)/2)*2,y=Math.round((b.y+b.vy*s+.5*b.gy*s*s)/2)*2;
       g.fillStyle=b.w?'#fff':bc;g.fillRect(x-b.sz/2,y-b.sz/2,b.sz,b.sz)}
      g.restore()}}}
   requestAnimationFrame(frame)};
  requestAnimationFrame(frame);
  setTimeout(end,ENH_FX_MS+ENH_BOOM_MS+ENH_HOLD_MS+3000)   /* chốt an toàn (tab bị ẩn làm rAF dừng) */
 }catch(e){console.warn('[enh-fx]',e);end()}}

function enhDo(){
 if(!hatched||!pet||enhBusy)return;
 const it=enhFind(enhUid);
 if(!it){enhMsg='<span class="bad">Hãy chạm chọn một món trang bị trước.</span>';renderEquip();return}
 const e=it.e||0;
 if(e>=ENH_MAX){renderEquip();return}
 const need=enhNeed(e),tier=enhStoneChoice(it),sid=enhStoneId(tier),have=cnt(sid);
 if(have<need.stone){
  enhMsg='<span class="bad">Chưa đủ '+ITEMS[sid].n+' ('+have+'/'+need.stone+').</span>';
  upToast('warn','⚠️ CHƯA ĐỦ ĐÁ','Cần <b>'+ITEMS[sid].n+' ×'+need.stone+'</b>, bạn đang có '+have+'.');renderEquip();return}
 if(gold<need.xu){
  enhMsg='<span class="bad">Không đủ xu: cần '+need.xu+', bạn có '+gold+'.</span>';
  upToast('warn','⚠️ KHÔNG ĐỦ XU','Cần '+need.xu+' xu, bạn đang có '+gold+' xu.');renderEquip();return}
 enhBusy=true;
 let reveal,kind,txt;
 try{
  const rb=Math.min(enhRb,cnt('da_ngu_sac'),enhRbMax(e)),rate=enhRateAt(e,rb),ticket=enhTicket&&cnt('ve_bao_ho')>0,
   col=eqRgb(it),nm='<b style="color:'+col+'">['+QN[it.q]+'] '+eqName(it)+'</b>';
  /* trừ đá + xu + đá ngũ sắc TRƯỚC khi roll (thành công hay thất bại đều mất) */
  removeItem(sid,need.stone);if(rb>0)removeItem('da_ngu_sac',rb);
  gold-=need.xu;
  const r=enhResolve(e,Math.random()*100,ticket,rate);
  if(r.saved)removeItem('ve_bao_ho',1);          /* vé chỉ bị trừ khi thật sự cứu được cấp */
  it.e=r.e2;eqEnh(it);
  stats();try{renderInfo()}catch(_){}
  try{if(window.TTGSAVE&&TTGSAVE.save)TTGSAVE.save()}catch(_){}   /* kết quả đã chốt + lưu ngay; phần dưới chỉ là màn "công bố" */
  const rbTxt=rb>0?' (đá ngũ sắc ×'+rb+', tỉ lệ '+rate+'%)':' (tỉ lệ '+rate+'%)';
  if(r.ok){kind='ok';txt='✨ THÀNH CÔNG! +'+e+' → +'+r.e2;
   reveal=()=>{
    enhMsg='<span class="ok">✨ Cường hóa THÀNH CÔNG! '+eqName(it)+' +'+e+' → +'+r.e2+'.</span>';
    upToast('ok','✨ CƯỜNG HÓA THÀNH CÔNG!',nm+'<br><b>+'+e+' → +'+r.e2+'</b>'+rbTxt);
    log('⚡ <b style="color:var(--jade)">Cường hóa thành công!</b> '+nm+' +'+e+' → +'+r.e2+rbTxt+'.')}
  }else if(r.saved){kind='saved';txt='🛡️ THẤT BẠI · Vé Bảo Hộ giữ +'+e;
   reveal=()=>{
    enhMsg='<span class="bad">💥 Thất bại, nhưng Vé Bảo Hộ đã giữ nguyên +'+e+'. Mất đá, xu và 1 vé.</span>';
    upToast('bad','💥 THẤT BẠI (ĐƯỢC BẢO HỘ)',nm+'<br>Vé Bảo Hộ giữ nguyên <b>+'+e+'</b>.<br>Mất đá, <b>'+need.xu+' xu</b> và 1 vé.');
    log('⚡ <b style="color:#ff8a7a">Cường hóa thất bại</b> '+nm+'; Vé Bảo Hộ giữ nguyên +'+e+rbTxt+'.')}
  }else if(r.e2<e){kind='bad';txt='💥 THẤT BẠI! Tụt xuống +'+r.e2;
   reveal=()=>{
    enhMsg='<span class="bad">💥 Thất bại! Mất đá và xu, '+eqName(it)+' tụt xuống +'+r.e2+'.</span>';
    upToast('bad','💥 CƯỜNG HÓA THẤT BẠI!',nm+'<br>Tụt xuống <b>+'+r.e2+'</b>.<br>Mất đá và <b>'+need.xu+' xu</b>.');
    log('⚡ <b style="color:#ff8a7a">Cường hóa thất bại</b> '+nm+', tụt +'+e+' → +'+r.e2+rbTxt+'.')}
  }else{kind='bad';txt='💥 THẤT BẠI! Giữ nguyên +'+e;
   reveal=()=>{
    enhMsg='<span class="bad">💥 Thất bại! Mất đá và xu, '+eqName(it)+' giữ nguyên +'+e+' (dưới +'+ENH_DROP_FROM+' không tụt cấp).</span>';
    upToast('bad','💥 CƯỜNG HÓA THẤT BẠI!',nm+'<br>Giữ nguyên <b>+'+e+'</b> (dưới +'+ENH_DROP_FROM+' không tụt cấp).<br>Mất đá và <b>'+need.xu+' xu</b>.');
    log('⚡ <b style="color:#ff8a7a">Cường hóa thất bại</b> '+nm+', giữ nguyên +'+e+rbTxt+'.')}}
 }catch(err){enhBusy=false;console.warn('[enh]',err);renderEquip();return}
 enhPlay(it,kind,txt,()=>{try{reveal()}catch(err){console.warn('[enh]',err)}enhBusy=false;renderEquip()})}

/* ---------- CSS riêng cho vòng tròn cường hóa (còn lại dùng lại class của Rèn: upgrid/upcircle/upslot/eqzone/eqslotbtn/upnote/upmsg) ---------- */
{if(!document.getElementById('enh-ui-css')){const s=document.createElement('style');s.id='enh-ui-css';
 s.textContent=
  '.enhc{position:absolute;left:50%;top:56%;width:32%;aspect-ratio:1;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;background:#183036;border:2px solid #4d533b}'+
  '.enhc>span{display:flex;align-items:center;justify-content:center;width:100%}.enhc .pxi{width:68%;height:auto;aspect-ratio:1}'+
  '.enhc>b{position:absolute;right:2px;bottom:0;font-size:11px;color:var(--gold);z-index:4}'+
  '.upslot.enht{cursor:pointer}.upslot.enht.off{opacity:.45}'+
  '.enhtier{display:flex;gap:6px;margin-top:4px}.enhtier button{flex:1}'+
  '.enhzn{margin-top:4px;line-height:1.4;font-size:12.5px}'+
  '.enhside{margin-top:4px;font-size:12.5px;line-height:1.3}.enhside .eqstat{grid-template-columns:1fr;gap:1px;margin-top:3px;font-size:12px}'+
  '#enh-fx-c .pxi{width:64px;height:64px}';
 document.head.appendChild(s)}}

/* ---------- Giao diện ---------- */
const enhTabs=on=>'<div class="eqtabs" style="grid-template-columns:repeat(3,1fr)"><button class="mini" onclick="eqSetTab(\'wear\')">🛡️ Trang bị</button><button class="mini" onclick="eqSetTab(\'forge\')">'+EQ_REN_ICO+' Rèn</button><button class="mini'+(on?' jade':'')+'" data-enh="1" onclick="eqSetTab(\'enh\')">'+ENH_TAB_ICO+' Cường hóa</button></div>';
const enhSlotBtn=(it,sel)=>'<button class="slot'+(sel?' sel':'')+'" data-uid="'+it.uid+'" style="position:relative;border-color:'+(sel?'var(--gold)':eqRgb(it))+'" onclick="enhPick('+it.uid+')" title="'+eqName(it)+'"><span>'+eqIco(it.s,it.z)+'</span><b>+'+(it.e||0)+'</b></button>';
const enhZoneTag=z=>'<b style="color:'+ZONE_COL[z]+'">'+VAN_KIEP_ZONES[z].name+'</b>';

/* Gom mọi số liệu của món đang chọn (null nếu chưa chọn; {maxed:true} nếu đã +10) */
function enhCtx(it){
 if(!it)return null;
 const e=it.e||0;if(e>=ENH_MAX)return{e,maxed:true};
 const need=enhNeed(e),tiers=enhTierOf(it.z),tier=enhStoneChoice(it),sid=enhStoneId(tier),
  rbHave=cnt('da_ngu_sac'),rbLim=Math.min(rbHave,enhRbMax(e)),rb=Math.min(enhRb,rbLim),
  tkHave=cnt('ve_bao_ho'),tk=enhTicket&&tkHave>0;
 return{e,need,tiers,tier,sid,have:cnt(sid),rbHave,rbLim,rb,tkHave,tk,base:ENH_RATE[e],tot:enhRateAt(e,rb)}}

/* Vòng tròn giống Rèn: món ở giữa (có viền hiệu ứng theo +cấp), 3 ô tam giác: Đá Cường Hóa (trên), Đá Ngũ Sắc (trái dưới), Vé Bảo Hộ (phải dưới) */
function enhCircle(it,X){
 const FX=window.ENHFX,e=it?(it.e||0):0,live=!!(X&&!X.maxed);
 const slot=(x,y,cls,ico,txt,fn,title)=>'<button type="button" class="upslot enht'+cls+'" style="left:'+x+'%;top:'+y+'%" '+(fn?'onclick="'+fn+'" ':'')+'title="'+title+'"><span>'+ico+'</span><b>'+txt+'</b></button>';
 let h='<div class="upcircle"><svg viewBox="0 0 100 100"><circle cx="50" cy="56" r="38" class="r1"/><circle cx="50" cy="56" r="31" class="r2"/><polygon points="50,18 17,75 83,75" class="tri"/></svg>';
 if(live){
  h+=slot(50,18,X.have>=X.need.stone?' full':'',ITEMS[X.sid].i,X.have+'/'+X.need.stone,X.tiers.length>1?'enhCycleTier()':'',ITEMS[X.sid].n+(X.tiers.length>1?' (chạm để đổi bậc đá)':''));
  h+=slot(17,75,X.rb>0?' full':(X.rbHave?'':' off'),ITEMS.da_ngu_sac.i,X.rb+'/'+X.rbHave,'enhRbCycle()','Đá Ngũ Sắc (chạm để thêm 1 viên)');
  h+=slot(83,75,X.tk?' full':(X.tkHave?'':' off'),ITEMS.ve_bao_ho.i,X.tk?'✓ '+X.tkHave:'có '+X.tkHave,'enhToggleTicket()','Vé Bảo Hộ (chạm để bật/tắt)')
 }else{
  h+=slot(50,18,' off',ITEMS.da_ch1.i,'—','','Đá Cường Hóa');
  h+=slot(17,75,' off',ITEMS.da_ngu_sac.i,'—','','Đá Ngũ Sắc');
  h+=slot(83,75,' off',ITEMS.ve_bao_ho.i,'—','','Vé Bảo Hộ')}
 h+='<div class="enhc'+(FX&&e?' '+FX.cls(it):'')+'" style="border-color:'+(it?eqRgb(it):'#4d533b')+'">'+(FX&&e?FX.inner(it):'')+
  '<span style="opacity:'+(it?1:.4)+'">'+(it?eqIco(it.s,it.z):eqIco(0,null))+'</span>'+(it?'<b>+'+e+'</b>':'')+'</div></div>';
 return h}

/* Khối nhỏ ở cột phải: tỉ lệ thành công + chỉ số trước → sau + cảnh báo thất bại (gọn để nằm vừa dưới thông tin món) */
function enhRateMini(it,X){
 if(!it||X.maxed)return'';
 const e=X.e,a=eqLines(it),b=eqLines(Object.assign({},it,{e:e+1}));
 let h='<div class="enhside">✅ Tỉ lệ: gốc <b>'+X.base+'%</b>'+(X.rb>0?' + ngũ sắc <b>'+(X.tot-X.base)+'%</b>':'')+' = <b style="color:var(--jade)">'+X.tot+'%</b>'+
  '<div class="eqstat">'+a.map((l,i)=>{const d=EQ_STATS[l[0]],p=d.t==='p'?'%':'';
   return'<div><span>'+d.n+'</span><b>+'+l[1]+p+' → <span class="ok">+'+b[i][1]+p+'</span></b></div>'}).join('')+'</div>'+
  '<small style="color:var(--mute)">Chỉ số sau khi thành công.</small>';
 if(e>=ENH_DROP_FROM)h+='<div>'+(X.tk?'🎫 <span class="ok">Thất bại vẫn giữ <b>+'+e+'</b> (mất 1 vé).</span>':'<span class="bad">⚠️ Thất bại sẽ tụt xuống <b>+'+(e-1)+'</b>.</span>')+'</div>';
 else h+='<div><small>Thất bại: mất đá và xu, giữ +'+e+' (dưới +'+ENH_DROP_FROM+' không tụt, vé không mất).</small></div>';
 return h+'</div>'}

/* Cột phải: 4 nút ô đang mặc + thông tin món đang chọn + tỉ lệ/chỉ số */
function enhSide(it,X){
 const btns=[0,1,2,3].map(s=>{const w=eqWorn[s];
  if(!w)return'<button type="button" class="mini" disabled style="opacity:.3" title="'+EQ_SLOTS[s].n+' (trống)">'+eqIco(s,null)+'</button>';
  const sel=w.uid===enhUid;
  return'<button type="button" class="mini'+(sel?' jade':'')+'" data-uid="'+w.uid+'" style="position:relative;border-color:'+(sel?'var(--gold)':eqRgb(w))+'" onclick="enhPick('+w.uid+')" title="'+eqName(w)+' +'+(w.e||0)+'">'+eqIco(s,w.z)+'<small style="display:block;line-height:1;color:var(--gold)">+'+(w.e||0)+'</small></button>'}).join('');
 let info;
 if(!it)info='<small>Chạm một món đang mặc (hoặc nút 🎒 Chọn món từ kho ở trên).</small>';
 else{
  const e=it.e||0;
  info='<b style="color:'+eqRgb(it)+'">['+QN[it.q]+'] '+eqName(it)+'</b><br><small>Vùng '+enhZoneTag(it.z)+'<br>'+
   (X&&X.maxed?'<b style="color:var(--gold)">+'+e+' (tối đa)</b>':'Cường hóa <b>+'+e+' → +'+(e+1)+'</b>')+'</small>'}
 return'<div class="infobox" style="margin-bottom:4px"><small>Chọn ô trang bị đang mặc:</small></div><div class="eqslotbtn">'+btns+'</div>'+
  '<div class="infobox upinfo">'+info+'</div>'+enhRateMini(it,X)}

/* Khung 📦 Nguyên liệu cần: đá (đúng bậc / bậc 6), xu, và TÊN VÙNG đúng màu mà bậc đá đó cường hóa được */
function enhNeedBox(it,X){
 if(!it)return'<small>Chạm chọn một món trang bị để bắt đầu cường hóa.</small>';
 if(X.maxed)return'<div style="text-align:center"><b style="color:var(--gold)">Đã đạt cấp tối đa +'+ENH_MAX+'</b></div>';
 const I=ITEMS[X.sid],n=X.need;
 let h='📦 <b>Nguyên liệu cần:</b>'+
  '<div><span style="color:'+I.col+'">'+I.i+' '+I.n+'</span> ×<b style="color:'+(X.have>=n.stone?'var(--jade)':'#ff7654')+'">'+X.have+'/'+n.stone+'</b></div>'+
  '<div>🪙 Xu ×<b style="color:'+(gold>=n.xu?'var(--gold)':'#ff7654')+'">'+gold+'/'+n.xu+'</b></div>';
 if(X.tiers.length>1)h+='<div class="enhtier">'+X.tiers.map(t=>{const id=enhStoneId(t);
  return'<button type="button" class="mini'+(t===X.tier?' jade':'')+'" onclick="enhSetTier('+t+')">'+ITEMS[id].i+' Bậc '+t+' (có '+cnt(id)+')</button>'}).join('')+'</div>';
 h+='<div class="enhzn">Đá <b style="color:'+ENH_TIER_COL[X.tier-1]+'">bậc '+X.tier+'</b> cường hóa được '+(X.tier===ENH_TIER_MAX?'<b>mọi vùng</b>':'vùng')+':<br>'+enhTierZones(X.tier)+'</div>';
 h+='<small style="color:var(--mute)">'+(X.tiers.length>1?'Món này dùng đá bậc '+X.tiers[0]+'; đá bậc '+ENH_TIER_MAX+' thay được cho mọi vùng.':'Món vùng '+enhZoneTag(it.z)+' chỉ dùng được Đá Cường Hóa bậc '+ENH_TIER_MAX+'.')+'</small>';
 return h}

/* Khung đá ngũ sắc (+/−) và vé bảo hộ */
function enhOptBox(it,X){
 if(!it||X.maxed)return'';
 return'<div class="infobox upnote" style="margin-top:5px"><div style="display:flex;align-items:center;gap:6px"><span style="flex:1">'+ITEMS.da_ngu_sac.i+' Đá Ngũ Sắc <small>(+'+ENH_RB_PCT+'%/viên · có '+X.rbHave+(X.rbLim<X.rbHave?' · tối đa '+X.rbLim+' để đạt 100%':'')+')</small></span>'+
  '<button type="button" class="mini" style="width:34px" onclick="enhRbAdd(-1)"'+(X.rb<=0?' disabled':'')+'>−</button><b style="min-width:22px;text-align:center">'+X.rb+'</b><button type="button" class="mini" style="width:34px" onclick="enhRbAdd(1)"'+(X.rb>=X.rbLim?' disabled':'')+'>+</button></div>'+
  '<label style="display:flex;align-items:center;gap:6px;margin-top:5px;'+(X.tkHave?'':'opacity:.55')+'"><input type="checkbox" onchange="enhToggleTicket()"'+(X.tk?' checked':'')+(X.tkHave?'':' disabled')+'> '+ITEMS.ve_bao_ho.i+' Dùng Vé Bảo Hộ <small>(có '+X.tkHave+')</small></label></div>'}

/* Bảng 6 bậc đá ↔ vùng (mỗi tên vùng đúng màu), thu gọn/mở rộng như khung thông tin của Rèn */
function enhInfoBox(){
 let h='<div class="infobox upnote" style="margin-top:5px"><button class="eqinfo-h" onclick="enhToggleInfo()">'+ENH_TAB_ICO+' <b>Đá Cường Hóa theo vùng</b><span>'+(enhInfoOpen?'▴ Thu gọn':'▾ Xem thêm')+'</span></button>';
 if(!enhInfoOpen)h+='<small>6 bậc đá. Bậc 1–5 mỗi bậc cho một nhóm vùng, bậc '+ENH_TIER_MAX+' dùng cho mọi vùng kể cả Thần Điện.</small>';
 else for(let t=1;t<=ENH_TIER_MAX;t++)h+='<div class="enhzn">'+ITEMS[enhStoneId(t)].i+' <b style="color:'+ENH_TIER_COL[t-1]+'">Đá bậc '+t+'</b>: '+enhTierZones(t)+'</div>';
 return h+'</div>'}

function enhHtml(){
 const it=enhFind(enhUid),X=enhCtx(it),open=enhBagOpen||!it;
 const pickBtn='<button class="eqzone" onclick="enhToggleBag()">🎒 Chọn món từ kho · '+(it?'<span style="color:'+eqRgb(it)+'">'+eqName(it)+' +'+(it.e||0)+'</span>':'chưa chọn')+' · '+ebag.length+'/'+EQ_BAG+(open?' ▴':' ▾')+'</button>';
 let bagH='';
 if(open){bagH='<div class="eqbag" id="eq-bag" style="margin:6px 0 4px">';
  for(let i=0;i<EQ_BAG;i++){const b=ebag[i];bagH+=b?enhSlotBtn(b,b.uid===enhUid):'<button class="slot" disabled style="opacity:.3"></button>'}
  bagH+='</div>'}
 const maxed=X&&X.maxed;
 return'<div class="infobox" style="text-align:center;margin-bottom:4px">'+ENH_TAB_ICO+' Cường hóa · tối đa <b style="color:var(--gold)">+'+ENH_MAX+'</b> · mỗi cấp <b>+'+Math.round(ENH_GAIN*100)+'%</b> mọi chỉ số</div>'+
  '<div class="infobox" style="text-align:center;margin-bottom:4px">'+pickBtn+'</div>'+bagH+
  '<div class="upgrid"><div>'+enhCircle(it,X)+'</div><div>'+enhSide(it,X)+'</div></div>'+
  '<div class="infobox upnote" style="margin-top:5px">'+enhNeedBox(it,X)+'</div>'+
  enhOptBox(it,X)+
  (it&&!maxed?'<button class="jade" style="margin-top:5px" onclick="enhDo()">'+ENH_TAB_ICO+' Cường hóa</button>':'')+
  '<div class="infobox upmsg">'+enhMsg+'</div>'+enhInfoBox()}

/* ---------- Gắn tab thứ 3 vào renderEquip ---------- */
{const _re=renderEquip;
 renderEquip=function(){
  const el=$('eq-wrap');
  if(eqTab==='enh'&&el&&hatched&&pet){
   const keep=document.getElementById('eq-bag'),sc=keep?keep.scrollTop:0;
   const it=enhFind(enhUid);if(!it){enhUid=0}                                     /* món vừa bán/mất thì bỏ chọn */
   enhRb=Math.min(enhRb,it?Math.min(cnt('da_ngu_sac'),enhRbMax(it.e||0)):0);        /* chặn theo số đang có + mức 100% */
   if(!cnt('ve_bao_ho'))enhTicket=false;
   el.innerHTML=enhTabs(true)+enhHtml();
   const FX=window.ENHFX;
   if(FX){el.querySelectorAll('[data-uid]').forEach(b=>FX.decorate(b,enhFind(+b.dataset.uid)))}   /* viền hiệu ứng theo +cấp (45-enh-border.js) cho ô đang mặc + ô kho */
   const nb=document.getElementById('eq-bag');if(nb)nb.scrollTop=sc;
   return}
  const r=_re.apply(this,arguments);
  const tb=document.querySelector('#eq-wrap .eqtabs');
  if(tb&&!tb.querySelector('[data-enh]')){tb.style.gridTemplateColumns='repeat(3,1fr)';tb.insertAdjacentHTML('beforeend','<button class="mini" data-enh="1" onclick="eqSetTab(\'enh\')">'+ENH_TAB_ICO+' Cường hóa</button>')}
  return r}}
try{renderEquip()}catch(e){console.warn('[enh-ui]',e)}
