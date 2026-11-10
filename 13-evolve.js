
/* ===== 13-evolve.js — BƯỚC 2: hiệu ứng tiến hóa ~5 giây mỗi khi thú lên bậc =====
   Móc vào game qua window.EVO (các điểm móc nằm ở 03-game-core.js và 06-mobs.js, đều có chú thích "EVO").
   Mốc thời gian (ms, tính từ lúc bắt đầu một lần tiến hóa):
     0–1000    màn tối nhẹ, thú rung, hạt năng lượng bay từ rìa vào thú
     1000–2500 thú thành bóng trắng, nhịp phát sáng nhanh dần
     2450–3200 flash trắng + sóng xung kích, ĐỔI SPRITE đúng lúc flash đạt đỉnh (SWAP)
     3200–4500 thú hiện hình mới rồi lắng xuống
     4500–5000 banner tên bậc mới + dòng log
   Bước 3 (aura/hiệu ứng riêng từng bậc, từng hệ) CHƯA làm ở đây. */
(()=>{
'use strict';
const T={SWAP:2750,FL0:2450,FL1:3200,BANNER:4500,END:5000};
const BIG={2:1,5:1,9:1};                          /* bậc 3, 6, 10 (chỉ số 2, 5, 9) hoành tráng hơn */
const AURA=['176,162,151','101,220,181','99,158,255','199,115,255','255,202,73']; /* màu viền theo phẩm huyết mạch */
const AURC=AURA.map(s=>'rgb('+s+')');
const BRI=[.72,.84,.95,1,1.12];                    /* độ sáng theo phẩm huyết mạch */
const NP=40;                                       /* tổng hạt tối đa */
const pX=new Float32Array(NP),pY=new Float32Array(NP),pA=new Float32Array(NP),pR=new Float32Array(NP),
      pU=new Float32Array(NP),pS=new Float32Array(NP),pAl=new Float32Array(NP);
const pK=new Uint8Array(NP),pM=new Uint8Array(NP),pD=new Int8Array(NP); /* K: 0 tắt, 1 hút vào, 2 bắn ra */
const clamp=(v,a,b)=>v<a?a:v>b?b:v, c01=v=>clamp(v,0,1), sm=v=>{v=c01(v);return v*v*(3-2*v)};
const SIL=new WeakMap(), RGB=[];
const $e=id=>document.getElementById(id);
let skipBtn=null, stageEl=null, lastShake='';

const E=window.EVO={
  on:false, cur:null, t:0, queue:[], shown:null, phase:0, pulse:0, lastMs:0, wall:0,
  rect:{cx:180,cy:150,w:60,h:60}, done:0
};
try{E.done=parseInt(localStorage.getItem('ttg_evo_done')||'0',10)||0}catch(_){}
const saveDone=()=>{try{localStorage.setItem('ttg_evo_done',String(E.done))}catch(_){}};

/* ---- CSS chèn bằng JS để không phải sửa style.css ---- */
{const s=document.createElement('style');
 s.textContent='.evo-lock{pointer-events:none;opacity:.5;transition:opacity .2s}'+
 '.evo-skip{position:absolute;right:8px;bottom:8px;z-index:6;padding:4px 10px;border-radius:9px;border:1px solid #f6e8b7;background:rgba(16,10,18,.82);color:#f6e8b7;font-weight:700;font-size:12px;cursor:pointer;display:none}'+
 '@keyframes evopop{0%{transform:scale(2.1);opacity:0}35%{opacity:1}100%{transform:scale(1);opacity:1}}'+
 '.banner.evo-pop{animation:evopop .5s steps(6) both;color:#fff6c8}';
 document.head.appendChild(s)}

/* ---- thông tin thú đang hiển thị ---- */
function petInfo(){
  const p=(typeof pv!=='undefined'&&pv.on)?pv:pet; /* pv: {sp,pi}  pet: {sp,pi} */
  return {sp:p?p.sp:0,pi:p?p.pi:0};
}
function rgbOf(sp){return RGB[sp]||(RGB[sp]=(h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)).join(','))(EPI[sp][1]))}

/* ---- API cho các điểm móc ---- */
E.dispStage=(real,preview)=>(!preview&&E.shown!==null)?E.shown:real;   /* bậc sprite đang được vẽ */
E.holdStatus=()=>E.on||E.queue.length>0;                                 /* chưa cho lộ tên bậc mới trên header */
E.onStage=(from,to)=>{                                                   /* gọi từ updateStage(): true = EVO tiếp quản log/banner */
  if(to<from){reset();return false}
  if(E.shown===null)E.shown=from;
  for(let s=from+1;s<=to;s++)E.queue.push(s);
  lock(true);
  return true;
};
E.flush=async()=>{                                                       /* gọi từ vòng thám hiểm: chờ tiến hóa xong + chờ người chơi đọc xong bảng thông báo (NOTI) */
  const nq=()=>!!(window.NOTI&&(NOTI.open||NOTI.q.length));
  if(!E.on&&!E.queue.length&&!nq())return;
  const x=$e('xp');if(x)x.style.display='none';
  while(E.on||E.queue.length||nq())await new Promise(r=>setTimeout(r,80));
};

function lock(on){const m=$e('s-main');if(m)m.classList.toggle('evo-lock',on)}
function canStart(){
  if(window.NOTI&&NOTI.blocking())return false;       /* NOTI: đang có bảng lên cấp chờ/đang mở thì tiến hóa đợi */
  const m=$e('mob'),x=$e('xp');
  if(m&&m.style.display==='block')return false;
  if(x&&getComputedStyle(x).display!=='none')return false;
  return true;
}
function ensureUI(){
  if(!stageEl)stageEl=document.querySelector('.stage');
  if(!skipBtn&&stageEl){
    skipBtn=document.createElement('button');skipBtn.className='evo-skip';skipBtn.textContent='⏭ Bỏ qua';
    skipBtn.onclick=skip;stageEl.appendChild(skipBtn);
  }
}
function showSkip(){ensureUI();if(skipBtn)skipBtn.style.display=(E.on&&E.done>=1)?'block':'none'}
function shakeStage(dx,dy){
  if(!stageEl)return;
  const s=(dx||dy)?'translate('+dx+'px,'+dy+'px)':'';
  if(s!==lastShake){stageEl.style.transform=s;lastShake=s}
}

function start(){
  const to=E.queue.shift();
  const I=.25+.75*(to-1)/8;                      /* cường độ 0.25 (bậc 2) → 1 (bậc 10) */
  E.cur={to,t:0,sw:false,lg:false,I,big:!!BIG[to]};
  E.on=true;E.t=0;E.phase=0;E.pulse=0;E.wall=Date.now();
  burst=0;                                       /* tắt vòng sáng cũ để không chồng hiệu ứng */
  const n=Math.round(16+18*I);
  for(let i=0;i<NP;i++){pK[i]=0;if(i<n){respawn(i,0);pU[i]=Math.random()}}
  showSkip();
}
function respawn(i,t){
  const I=E.cur?E.cur.I:.5;
  pK[i]=1;pU[i]=0;pA[i]=Math.random()*6.2832;pR[i]=(120+70*I)*(.8+.4*Math.random());
  pS[i]=1/((1150-600*c01(t/2200))*(.8+.4*Math.random()));
  pM[i]=Math.random()<.7?1:0;pD[i]=Math.random()<.5?-1:1;
}
function burstOut(k){
  const I=k.I,nb=Math.min(NP,Math.round(22+18*I));
  for(let i=0;i<NP;i++){
    if(i<nb){pK[i]=2;pU[i]=0;pA[i]=i/nb*6.2832+Math.random()*.4;pR[i]=(60+110*Math.random())*(.6+.4*I);
      pS[i]=1/(1000+Math.random()*500);pM[i]=Math.random()<.6?1:0}
    else pK[i]=0;
  }
}
function swap(k){
  k.sw=true;E.shown=k.to;
  if(window.VanKiepSprites&&typeof vs!=='undefined')vs=VanKiepSprites.stageScale(k.to); /* kích thước nhảy theo flash, không giãn từ từ */
  burstOut(k);
}
function announce(k){
  k.lg=true;(E.got=E.got||[]).push(k.to);              /* NOTI: nhớ các bậc đã lên để hiện bảng sau khi xong hết */
  log('🌟 <b>[Tiến hóa]</b> Thú đã lớn thành <b style="color:var(--gold)">'+STAGES[k.to][1]+'</b>!');
  $e('banner').textContent=STAGES[k.to][1];$e('h-status').textContent=STAGES[k.to][1];
  const b=$e('banner');b.classList.remove('evo-pop');void b.offsetWidth;b.classList.add('evo-pop');
  setTimeout(()=>b.classList.remove('evo-pop'),600);
}
function endStep(){
  E.done++;saveDone();E.cur=null;E.on=false;
  if(E.queue.length){start();return}
  finish();
}
function finish(){
  E.on=false;E.cur=null;E.shown=null;lock(false);shakeStage(0,0);showSkip();
  for(let i=0;i<NP;i++)pK[i]=0;
  if(E.got&&E.got.length&&window.NOTI)NOTI.rank(E.got);   /* NOTI: tiến hóa xong hết -> hiện bảng lên bậc */
  E.got=[];
}
function reset(){E.queue.length=0;E.got=[];finish()}
function skip(){                                   /* bỏ qua: chốt hết các bậc còn lại ngay, vẫn ghi log từng bậc */
  if(!E.on)return;
  const k=E.cur;if(!k.sw)swap(k);if(!k.lg)announce(k);
  while(E.queue.length){const s=E.queue.shift();E.shown=s;announce({to:s})}
  if(window.VanKiepSprites&&typeof vs!=='undefined')vs=VanKiepSprites.stageScale(E.shown);
  E.done++;saveDone();finish();
}

/* ---- đường cong thời gian ---- */
function whiteOf(t){
  if(t<1000)return 0;if(t<1500)return sm((t-1000)/500);
  if(t<T.FL1)return 1;if(t<3900)return 1-sm((t-T.FL1)/700);return 0;
}
function flashOf(k){
  const t=k.t,m=.85+.15*k.I;
  if(t<T.FL0)return 0;if(t<2700)return m*sm((t-T.FL0)/250);
  if(t<2800)return m;if(t<T.FL1)return m*(1-sm((t-2800)/400));return 0;
}
function dimOf(k){
  const t=k.t,mx=.34+.24*k.I;
  if(t<2500)return mx*sm(t/800);if(t<T.FL1)return mx;
  if(t<T.BANNER)return mx*(1-sm((t-T.FL1)/1300));return 0;
}
function petShake(k){const t=k.t;return t<T.SWAP?(.6+2*k.I)*sm(t/900):0}
function screenShake(k){
  if(!k.big)return 0;const t=k.t,I=k.I;
  if(t<1000)return 0;if(t<2450)return .8*I*sm((t-1000)/1450);
  if(t<2900)return 2.2+3*I;if(t<3400)return (2.2+3*I)*(1-sm((t-2900)/500));return 0;
}

/* ---- cập nhật mỗi khung hình ---- */
function advance(dt){
  const k=E.cur;k.t+=dt;E.t=k.t;
  if(!k.sw&&k.t>=T.SWAP)swap(k);
  if(!k.lg&&k.t>=T.BANNER)announce(k);
  if(k.t>=T.END){endStep();return}
  /* nhịp phát sáng nhanh dần (1000–2500ms) */
  if(k.t>=1000&&k.t<2500){const u=(k.t-1000)/1500,hz=2+9*Math.pow(u,1.6);E.phase+=dt*hz*.006283;E.pulse=.5+.5*Math.sin(E.phase)}
  else E.pulse=0;
  /* hạt */
  const r=E.rect,cx=r.cx,cy=r.cy;
  for(let i=0;i<NP;i++){
    const kd=pK[i];if(!kd)continue;
    pU[i]+=dt*pS[i];
    if(pU[i]>=1){if(kd===1&&k.t<2200){respawn(i,k.t)}else pK[i]=0;if(pK[i]===1){}else continue}
    const u=pU[i];
    if(kd===1){
      const e=u*u,rr=pR[i]*(1-e)+6,a=pA[i]+pD[i]*u*1.3;
      pX[i]=cx+Math.cos(a)*rr;pY[i]=cy+Math.sin(a)*rr*.68;
      pAl[i]=Math.min(1,u*6)*(1-c01((u-.88)*8));
    }else{
      const rr=pR[i]*(1-(1-u)*(1-u));
      pX[i]=cx+Math.cos(pA[i])*rr;pY[i]=cy+Math.sin(pA[i])*rr*.8-u*14;
      pAl[i]=1-u*u;
    }
  }
  /* đồng hồ năm tạm dừng: đẩy lastTick tiến theo thời gian thực */
  clockShift();
  const sa=screenShake(k);
  if(sa>0)shakeStage(Math.round(Math.sin(k.t*.09)*sa),Math.round(Math.cos(k.t*.13)*sa*.6));else shakeStage(0,0);
}
function clockShift(){
  if(!E.on)return;
  const n=Date.now();if(typeof lastTick!=='undefined')lastTick+=n-E.wall;E.wall=n;
}
setInterval(clockShift,50);                         /* vẫn giữ đồng hồ khi tab chạy nền */

/* ---- HOOK 1 (trước khi vẽ thú): cập nhật + màn tối + tia sáng phía sau ---- */
E.pre=(c,ms)=>{
  const dt=Math.min(100,Math.max(0,ms-E.lastMs));E.lastMs=ms;
  if(!E.on&&E.queue.length&&canStart())start();
  if(!E.on){if(lastShake)shakeStage(0,0);return}
  advance(dt);
  const k=E.cur;if(!E.on||!k)return;
  const a=dimOf(k);
  if(a>.003){c.fillStyle='rgba(8,5,20,'+a.toFixed(3)+')';c.fillRect(0,0,360,250)}
  /* tia sáng (chỉ bậc 3, 6, 10) */
  if(k.big){
    const t=k.t,ra=.26*sm((t-1500)/1000)*(t<2700?1:1-sm((t-2700)/700));
    if(ra>.01){
      const r=E.rect,n=k.to===9?18:12,len=k.to===9?330:260;
      c.save();c.translate(r.cx,r.cy);c.rotate(t*.0004*(k.to===9?1.6:1));c.fillStyle='rgba(255,252,225,'+ra.toFixed(3)+')';
      for(let i=0;i<n;i++){const an=i*6.2832/n,w=.05+(i%3)*.012;
        c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(an-w)*len,Math.sin(an-w)*len);c.lineTo(Math.cos(an+w)*len,Math.sin(an+w)*len);c.closePath();c.fill()}
      c.restore();
    }
  }
};

/* ---- HOOK 2 (thay lệnh vẽ sprite thú trong beast()): rung, bóng trắng, nhịp sáng, hiện hình mới ---- */
function sil(img){
  let s=SIL.get(img);
  if(!s){s=document.createElement('canvas');s.width=img.width;s.height=img.height;
    const x=s.getContext('2d');x.drawImage(img,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#fff';x.fillRect(0,0,s.width,s.height);SIL.set(img,s)}
  return s;
}
E.petDraw=(c,img,bb,x,y,dw,dh)=>{
  const r=E.rect;r.cx=x;r.cy=y-dh/2;r.w=dw;r.h=dh;   /* luôn cập nhật vị trí thú cho hạt/sóng */
  const k=E.cur;if(!E.on||!k)return false;
  const t=k.t,I=k.I,g=E.pulse,pl=(t>=1000&&t<2500);
  let w=whiteOf(t);if(pl)w*=.82+.18*g;
  const am=petShake(k),ox=Math.round(Math.sin(t*.11)*am+Math.sin(t*.37)*am*.5),oy=Math.round(Math.sin(t*.13+1)*am*.35);
  let s=1;if(pl)s=1+.05*I*g;else if(t>=T.SWAP){const u=c01((t-T.SWAP)/1250);s=1+(.16+.1*I)*(1-u)*(1-u)}
  const w2=Math.max(1,Math.round(dw*s)),h2=Math.max(1,Math.round(dh*s));
  const px=Math.round(x)+ox-Math.round(w2/2),py=Math.round(y)+oy-h2;
  c.save();c.imageSmoothingEnabled=false;
  const inf=petInfo();
  if(w>.02){                                         /* quầng sáng màu hệ phía sau bóng trắng */
    const R=Math.max(w2,h2)*(.75+.25*g)+14,cy=py+h2/2,cx=px+w2/2,rgb=rgbOf(inf.sp),al=Math.min(1,w*(.4+.35*g)*BRI[inf.pi]);
    const gr=c.createRadialGradient(cx,cy,2,cx,cy,R);
    gr.addColorStop(0,'rgba(255,255,255,'+al.toFixed(3)+')');gr.addColorStop(.45,'rgba('+rgb+','+(al*.5).toFixed(3)+')');gr.addColorStop(1,'rgba('+rgb+',0)');
    c.fillStyle=gr;c.fillRect(cx-R,cy-R,R*2,R*2);
  }
  c.drawImage(img,bb.x,bb.y,bb.w,bb.h,px,py,w2,h2);
  if(w>.01){c.globalAlpha=Math.min(1,w);c.drawImage(sil(img),bb.x,bb.y,bb.w,bb.h,px,py,w2,h2)}
  c.restore();
  return true;
};

/* ---- HOOK 3 (sau viền tối, cuối khung hình): hạt, sóng xung kích, flash trắng ---- */
E.top=c=>{
  const k=E.cur;if(!E.on||!k)return;
  const inf=petInfo(),sp=EPI[inf.sp],pts=MOTIF_PIXELS[sp[2]]||MOTIF_PIXELS.star,bri=BRI[inf.pi],U=k.I>.6?3:2;
  c.save();
  for(let i=0;i<NP;i++){
    if(!pK[i])continue;
    const al=Math.min(1,pAl[i]*bri);if(al<=.02)continue;
    const x=Math.round(pX[i]/2)*2,y=Math.round(pY[i]/2)*2;
    c.globalAlpha=al;
    if(pM[i]){
      c.fillStyle=AURC[inf.pi];                       /* viền: màu phẩm huyết mạch */
      for(let j=0;j<pts.length;j++){const q=pts[j];c.fillRect(x+q[0]*U-1,y+q[1]*U-1,U+2,U+2)}
      c.fillStyle=sp[1];                              /* ruột: màu hệ */
      for(let j=0;j<pts.length;j++){const q=pts[j];c.fillRect(x+q[0]*U,y+q[1]*U,U,U)}
    }else{c.fillStyle=(i&1)?'#fff':sp[1];c.fillRect(x,y,U,U)}
  }
  c.globalAlpha=1;
  /* sóng xung kích: 1 vòng, bậc lớn thêm vòng */
  const r=E.rect,t=k.t,rings=k.to===9?3:k.big?2:1;
  for(let n=0;n<rings;n++){
    const u=(t-(2700+n*110))/850;if(u<=0||u>=1)continue;
    const R=(k.big?240:180)*(1-(1-u)*(1-u)),a=(1-u)*(n?0.7:1);
    c.save();c.translate(r.cx,r.cy);c.scale(1,.72);c.lineWidth=2+7*(1-u);
    c.strokeStyle=n===1?sp[1]:'rgba(255,255,255,'+a.toFixed(3)+')';c.globalAlpha=n===1?a:1;
    c.beginPath();c.arc(0,0,R,0,6.2832);c.stroke();c.restore();
  }
  /* flash trắng */
  const f=flashOf(k);
  if(f>.004){c.fillStyle='rgba(255,255,255,'+f.toFixed(3)+')';c.fillRect(0,0,360,250)}
  c.restore();
};
})();
