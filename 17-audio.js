/* ===== 17-audio.js — ÂM THANH: hiệu ứng (SFX) + nhạc nền, tạo hoàn toàn bằng WebAudio =====
   Không cần file mp3/ogg. Không sửa file cũ: chỉ "lắng nghe" game qua
     · #log (dòng nhật ký)  → lên cấp, nở trứng, tiến hóa, nhặt đồ, mua/bán, rèn, nâng huyết mạch...
     · #mob-r (dòng thông báo trong trận) → trúng đòn, chí mạng, né, choáng, khiên, hồi máu, thắng/thua
     · #beads (hạt trên trứng) → tiếng nứt vỏ trứng, cao dần theo tiến độ
     · window.EVO (13-evolve.js) → tiếng tích tụ + nổ lúc tiến hóa
   Nhạc nền: 2 chế độ tự đổi — "calm" (bình thường) và "battle" (khi đang đánh nhau).
   Trên điện thoại, âm thanh chỉ bật sau lần chạm đầu tiên của người chơi (quy định của trình duyệt).
   Nút 🔊 góc phải dưới: bật/tắt nhạc nền, hiệu ứng, chỉnh âm lượng (lưu trong localStorage 'ttg_audio'). */
(()=>{
'use strict';
const KEY='ttg_audio',BGM_LEVEL=.2;
const S={sfx:true,bgm:true,vol:.7};
try{const j=JSON.parse(localStorage.getItem(KEY)||'null');
  if(j){if('sfx' in j)S.sfx=!!j.sfx;if('bgm' in j)S.bgm=!!j.bgm;if(typeof j.vol==='number')S.vol=Math.min(1,Math.max(0,j.vol))}}catch(_){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(_){}};

let ctx=null,master,sfxBus,bgmBus,echoIn,noiseBuf,duck=1;

function ensure(){
  if(ctx)return ctx;
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{ctx=new AC()}catch(_){ctx=null;return null}
  const comp=ctx.createDynamicsCompressor();
  master=ctx.createGain();sfxBus=ctx.createGain();bgmBus=ctx.createGain();
  sfxBus.connect(master);bgmBus.connect(master);master.connect(comp);comp.connect(ctx.destination);
  /* vọng nhẹ cho nhạc nền */
  echoIn=ctx.createGain();
  const dl=ctx.createDelay(1),fb=ctx.createGain(),wet=ctx.createGain();
  dl.delayTime.value=.34;fb.gain.value=.3;wet.gain.value=.4;
  echoIn.connect(bgmBus);echoIn.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(bgmBus);
  noiseBuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);
  {const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}
  applyVol();
  return ctx}
function applyVol(){
  if(!ctx)return;const t=ctx.currentTime;
  master.gain.setTargetAtTime(S.vol,t,.03);
  sfxBus.gain.setTargetAtTime(S.sfx?.9:0,t,.03);
  bgmBus.gain.setTargetAtTime(S.bgm?BGM_LEVEL*duck:0,t,.15)}

/* mở khóa âm thanh ở lần chạm đầu (iOS/Android/Chrome) */
function unlock(){
  const c=ensure();if(!c)return;
  if(c.state!=='running'){
    try{c.resume&&c.resume().catch(()=>{})}catch(_){}
    try{const b=c.createBuffer(1,1,22050),s=c.createBufferSource();s.buffer=b;s.connect(c.destination);s.start(0)}catch(_){}}}
['pointerdown','touchend','click','keydown'].forEach(ev=>document.addEventListener(ev,unlock,{passive:true,capture:true}));
document.addEventListener('visibilitychange',()=>{
  if(!ctx)return;
  try{if(document.hidden)ctx.suspend&&ctx.suspend();else ctx.resume&&ctx.resume()}catch(_){}});

/* ---------- nguyên liệu âm ---------- */
const mt=n=>440*Math.pow(2,(n-69)/12);
const R=()=>1+(Math.random()-.5)*.14;
function tone(o){
  const c=ctx,t=o.t||c.currentTime,d=o.d||.2,a=o.a||.005,v=o.v||.2,osc=c.createOscillator(),g=c.createGain();
  osc.type=o.type||'sine';osc.frequency.setValueAtTime(o.f,t);
  if(o.f2)osc.frequency.exponentialRampToValueAtTime(Math.max(20,o.f2),t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  let n=osc;if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;osc.connect(f);n=f}
  n.connect(g);g.connect(o.dest||sfxBus);osc.start(t);osc.stop(t+d+.05);return g}
function noise(o){
  const c=ctx,t=o.t||c.currentTime,d=o.d||.1,a=Math.min(o.a||.003,d*.9),src=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
  src.buffer=noiseBuf;src.loop=true;
  f.type=o.ft||'lowpass';f.frequency.setValueAtTime(o.ff||2000,t);
  if(o.ff2)f.frequency.exponentialRampToValueAtTime(Math.max(20,o.ff2),t+d);
  f.Q.value=o.q||.7;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(o.v||.2,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  src.connect(f);f.connect(g);g.connect(o.dest||sfxBus);src.start(t,Math.random()*.5);src.stop(t+d+.05);return g}
const T0=()=>ctx.currentTime;

/* ---------- hiệu ứng ---------- */
let evoH=null;
const SFX={
  tick(){tone({f:1200,f2:800,d:.035,v:.05,type:'triangle'})},
  crack(p){p=Math.min(1,Math.max(0,p||0));const k=1+p*.6;
    noise({ft:'bandpass',ff:2500*k,q:1.2,d:.07,v:.28});
    tone({f:170*k,f2:70,d:.12,v:.3});
    tone({f:2200*k*R(),f2:1400,d:.05,v:.06,type:'square'})},
  hatch(){const t=T0();
    noise({ft:'bandpass',ff:3000,q:.8,d:.18,v:.35});tone({f:120,f2:45,d:.35,v:.4});
    [72,76,79,84,88,91].forEach((m,i)=>tone({t:t+.12+i*.08,f:mt(m),d:.9,v:.1,a:.01,type:'triangle'}));
    [60,64,67].forEach(m=>tone({t:t+.2,f:mt(m),d:1.6,v:.08,a:.05,lp:2500}))},
  hit(mine){const k=(mine?1.15:.85)*R();
    noise({ft:'lowpass',ff:3200,ff2:400,d:.1,v:.32});tone({f:210*k,f2:60,d:.14,v:.32,type:'triangle'})},
  crit(mine){const k=mine?1.1:.9,t=T0();
    noise({ft:'lowpass',ff:5000,ff2:300,d:.18,v:.4});
    tone({f:260*k,f2:50,d:.22,v:.4,type:'sawtooth',lp:1500});
    tone({t:t+.01,f:1320,d:.35,v:.1,type:'square',lp:4000});tone({t:t+.03,f:1980,d:.3,v:.07})},
  miss(){noise({ft:'bandpass',ff:500,ff2:2200,q:2,d:.16,v:.18})},
  stun(){const t=T0();for(let i=0;i<4;i++)tone({t:t+i*.07,f:i%2?520:700,d:.09,v:.1,type:'triangle'})},
  block(){tone({f:950*R(),d:.12,v:.14,type:'square',lp:3500});tone({f:1430,d:.18,v:.1,type:'triangle'});
    noise({ft:'highpass',ff:4000,d:.04,v:.15})},
  heal(){const t=T0();[72,76,79].forEach((m,i)=>tone({t:t+i*.07,f:mt(m),d:.35,v:.1}))},
  revive(){const t=T0();[60,64,67,72,76,79].forEach((m,i)=>tone({t:t+i*.09,f:mt(m),d:.6,v:.1,type:'triangle'}));
    noise({t:t+.3,ft:'highpass',ff:5000,d:.5,v:.06,a:.2})},
  burn(){noise({ft:'bandpass',ff:1800,q:.6,d:.18,v:.22});noise({t:T0()+.05,ft:'highpass',ff:3500,d:.1,v:.12})},
  win(){const t=T0();
    [[72,0],[76,.13],[79,.26],[84,.39]].forEach(([m,d])=>{tone({t:t+d,f:mt(m),d:.5,v:.12,type:'triangle'});tone({t:t+d,f:mt(m),d:.4,v:.05,type:'square',lp:2500})});
    [72,76,79,84].forEach(m=>tone({t:t+.55,f:mt(m),d:1.4,v:.08,a:.03,type:'triangle'}))},
  lose(){const t=T0();[69,65,62,57].forEach((m,i)=>tone({t:t+i*.2,f:mt(m),d:.5,v:.12,type:'sawtooth',lp:900}))},
  flee(){tone({f:700,f2:200,d:.35,v:.15,type:'triangle'});noise({ft:'bandpass',ff:900,ff2:300,d:.3,v:.1})},
  battleStart(){tone({f:98,f2:49,d:.5,v:.35,type:'sawtooth',lp:600});noise({ft:'lowpass',ff:900,d:.25,v:.2});
    tone({t:T0()+.12,f:mt(50),d:.4,v:.1,type:'square',lp:1200})},
  levelUp(){const t=T0();[72,76,79,84,88].forEach((m,i)=>{tone({t:t+i*.075,f:mt(m),d:.45,v:.12,type:'triangle'});tone({t:t+i*.075,f:mt(m)*2,d:.3,v:.04})})},
  pickup(){tone({f:660,f2:1100,d:.09,v:.12})},
  coin(){const t=T0();tone({t,f:1318,d:.12,v:.12,type:'square',lp:4000});tone({t:t+.07,f:1760,d:.3,v:.12,type:'square',lp:4000})},
  bad(){tone({f:180,f2:110,d:.2,v:.16,type:'square',lp:900})},
  good(){const t=T0();tone({t,f:880,d:.1,v:.1,type:'triangle'});tone({t:t+.08,f:1175,d:.2,v:.1,type:'triangle'})},
  equip(){noise({ft:'bandpass',ff:2500,q:1.5,d:.06,v:.2});tone({f:520,f2:700,d:.12,v:.12,type:'square',lp:2000})},
  forge(){const t=T0();
    [0,.14].forEach((d,i)=>{noise({t:t+d,ft:'bandpass',ff:3500,q:2,d:.08,v:.3});tone({t:t+d,f:i?1400:1000,d:.25,v:.1,type:'square',lp:3500})});
    tone({t:t+.3,f:mt(84),d:.6,v:.08,type:'triangle'})},
  upOk(){const t=T0();[67,72,76,79,84].forEach((m,i)=>tone({t:t+i*.06,f:mt(m),d:.5,v:.11,type:'triangle'}));
    noise({t:t+.1,ft:'highpass',ff:6000,d:.4,v:.06,a:.15})},
  upFail(){const t=T0();[62,58,53].forEach((m,i)=>tone({t:t+i*.14,f:mt(m),d:.35,v:.12,type:'sawtooth',lp:800}));noise({ft:'lowpass',ff:800,d:.3,v:.15})},
  unlock(){const t=T0();[79,84,91].forEach((m,i)=>tone({t:t+i*.1,f:mt(m),d:.7,v:.1,type:'triangle'}))},
  /* tiến hóa */
  evoCharge(I){I=I||.5;const c=ctx,t=c.currentTime,d=2.5,v=.1+.12*I;
    const o1=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();
    o1.type='sawtooth';o2.type='sine';
    o1.frequency.setValueAtTime(110,t);o1.frequency.exponentialRampToValueAtTime(880,t+d);
    o2.frequency.setValueAtTime(220,t);o2.frequency.exponentialRampToValueAtTime(1760,t+d);
    f.type='lowpass';f.frequency.setValueAtTime(300,t);f.frequency.exponentialRampToValueAtTime(5000,t+d);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+d*.9);g.gain.linearRampToValueAtTime(.0001,t+d+.12);
    o1.connect(f);o2.connect(f);f.connect(g);g.connect(sfxBus);
    o1.start(t);o2.start(t);o1.stop(t+d+.2);o2.stop(t+d+.2);
    noise({ft:'bandpass',ff:400,ff2:6000,q:1.5,d,v:.08+.06*I,a:d*.8});
    evoH={g,o1,o2}},
  evoBoom(I){I=I||.5;const t=T0();
    noise({ft:'lowpass',ff:6000,ff2:200,d:.9,v:.3+.2*I});
    tone({f:100,f2:30,d:1,v:.35+.2*I});
    [60,67,72].forEach(m=>tone({t:t+.02,f:mt(m),d:1.4,v:.1,a:.02,type:'sawtooth',lp:1800}));
    [84,88,91,96].forEach((m,i)=>tone({t:t+.15+i*.07,f:mt(m),d:.8,v:.06,type:'triangle'}))},
  evoReveal(){const t=T0();
    [60,64,67,72].forEach(m=>tone({t,f:mt(m),d:2,v:.09,a:.05,type:'triangle'}));
    [72,76,79,84,88,91,96].forEach((m,i)=>tone({t:t+.1+i*.09,f:mt(m),d:.9,v:.08,type:'triangle'}))}
};
function stopEvo(){
  if(!evoH||!ctx)return;
  try{const t=ctx.currentTime;evoH.g.gain.cancelScheduledValues(t);evoH.g.gain.setTargetAtTime(.0001,t,.04);
    evoH.o1.stop(t+.3);evoH.o2.stop(t+.3)}catch(_){}
  evoH=null}

const GAP={levelUp:600,evoReveal:1500,hatch:1500,win:1000,lose:1000,battleStart:800,pickup:80,coin:80,upOk:500,upFail:500,hit:35};
const lastT={};
function sfx(name,a,b){
  if(!S.sfx)return;
  const c=ensure();if(!c||c.state!=='running')return;
  const n=performance.now();if(n-(lastT[name]||0)<(GAP[name]||30))return;lastT[name]=n;
  try{SFX[name](a,b)}catch(_){}}

/* ---------- nhạc nền ---------- */
const POOL=[62,65,67,69,72,74,77,81];            /* Rê thứ ngũ cung: D F G A C */
const ROOT=[38,41,36,43],PAD=[[50,53,57],[53,57,60],[48,55,60],[55,58,62]],ROOT_B=[38,38,41,36];
const STEP={calm:60/70/2,battle:60/132/4};
const moodG={};let mood='',step=0,nextT=0;
function moodGain(m){
  if(!moodG[m]){const g=ctx.createGain();g.gain.value=0;g.connect(m==='battle'?bgmBus:echoIn);moodG[m]=g}
  return moodG[m]}
function setMood(m){
  const t=ctx.currentTime;
  if(mood&&moodG[mood])moodG[mood].gain.setTargetAtTime(0,t,.25);
  mood=m;step=0;nextT=t+.08;
  if(m)moodGain(m).gain.setTargetAtTime(1,t,.25)}
function calmStep(s,t,dest){
  const bar=Math.floor(s/8)%4,k=s%8;
  if(k===0){PAD[bar].forEach(m=>tone({t,f:mt(m),d:3.6,v:.06,a:.7,type:'triangle',lp:1100,dest}));
    tone({t,f:mt(ROOT[bar]),d:1.6,v:.14,a:.03,dest})}
  if(k===4)tone({t,f:mt(ROOT[bar]),d:1,v:.1,a:.03,dest});
  if(Math.random()<(k%2===0?.7:.35)){
    const m=POOL[(Math.random()*POOL.length)|0];
    tone({t,f:mt(m),d:1.4,v:.055,a:.008,dest});tone({t,f:mt(m)*2.01,d:.7,v:.02,dest})}}
function battleStep(s,t,dest){
  const bar=Math.floor(s/16)%4,k=s%16;
  if(k%4===0)tone({t,f:150,f2:45,d:.2,v:.5,dest});
  if(k===4||k===12)noise({t,ft:'bandpass',ff:1800,q:.8,d:.12,v:.22,dest});
  if(k%2===1)noise({t,ft:'highpass',ff:7000,d:.04,v:.07,dest});
  if(k%2===0){const r=ROOT_B[bar],m=(k===6||k===14)?r+12:(k===10?r+7:r);
    tone({t,f:mt(m),d:.2,v:.17,type:'square',lp:500,dest})}
  if((k%2===0||Math.random()<.3)&&Math.random()<.55){
    const m=POOL[(Math.random()*POOL.length)|0];
    tone({t,f:mt(m),d:.22,v:.05,type:'sawtooth',lp:2200,dest})}}

const battleOn=()=>{const m=document.getElementById('mob');return !!m&&m.style.display==='block'};
let evoSeen=null,evoTimer=0;
function tick(){
  /* tiến hóa: theo dõi window.EVO */
  const E=window.EVO;
  if(E&&E.on&&E.cur&&E.cur!==evoSeen){
    evoSeen=E.cur;const cur=E.cur;sfx('evoCharge',cur.I);
    clearTimeout(evoTimer);evoTimer=setTimeout(()=>{if(window.EVO&&window.EVO.cur===cur)sfx('evoBoom',cur.I)},2700)}
  else if((!E||!E.on)&&evoSeen){evoSeen=null;clearTimeout(evoTimer);stopEvo()}
  const d=(E&&E.on)?.12:1;
  if(d!==duck){duck=d;applyVol()}
  /* nhạc nền */
  if(!ctx||ctx.state!=='running')return;
  const want=S.bgm?(battleOn()?'battle':'calm'):'';
  if(want!==mood){if(want==='battle')sfx('battleStart');setMood(want)}
  if(!mood)return;
  if(nextT<ctx.currentTime-.1)nextT=ctx.currentTime+.05;
  const g=moodGain(mood),fn=mood==='calm'?calmStep:battleStep;
  while(nextT<ctx.currentTime+.25){fn(step,nextT,g);nextT+=STEP[mood];step++}}
setInterval(tick,60);

/* ---------- lắng nghe game ---------- */
function onLog(t){
  if(/Tiến hóa\]/.test(t))sfx('evoReveal');
  else if(/Kỳ tích\]/.test(t))sfx('hatch');
  else if(/Lên cấp \d+/.test(t))sfx('levelUp');
  else if(/Nhặt được/.test(t))sfx('pickup');
  else if(/Chạy khỏi/.test(t))sfx('flee');
  else if(/Nâng cấp huyết mạch thành công/.test(t))sfx('upOk');
  else if(/Nâng cấp huyết mạch thất bại/.test(t))sfx('upFail');
  else if(/Rèn ra/.test(t))sfx('forge');
  else if(/^\s*💰 Bán|^\s*🏪 Mua/.test(t))sfx('coin');
  else if(/^\s*🛡️/.test(t))sfx('equip');
  else if(/Mở khóa vùng/.test(t))sfx('unlock');
  else if(/Chính xác!/.test(t))sfx('good');
  else if(/Nhầm rồi|Không đủ xu/.test(t))sfx('bad');
  else if(/^\s*⚔️ Thắng/.test(t))sfx('win');
  else if(/^\s*⚔️ Thua/.test(t))sfx('lose')}
let lastMsg='';
function onMob(t){
  if(t===lastMsg)return;lastMsg=t;
  if(/^Tốc:/.test(t))return;
  if(t.indexOf('Chiến thắng')>=0){sfx('win');return}
  if(t.indexOf('Bại trận')>=0){sfx('lose');return}
  const mine=/^(?:💥 Chí mạng! )?Thú /.test(t);
  if(/Chí mạng/.test(t))sfx('crit',mine);
  else if(/né được đòn/.test(t))sfx('miss');
  else if(/choáng|đóng băng/.test(t))sfx('stun');
  else if(/Khiên hấp thụ/.test(t))sfx('block');
  else if(/Hồi sinh/.test(t))sfx('revive');
  else if(/hồi sức|Hút máu/.test(t))sfx('heal');
  else if(/Thiêu đốt/.test(t))sfx('burn');
  else if(/-\d/.test(t))sfx('hit',mine)}

function watch(){
  const $=id=>document.getElementById(id);
  const lg=$('log'),mr=$('mob-r'),bd=$('beads');
  if(lg)new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)onLog(n.textContent||'')}))).observe(lg,{childList:true});
  if(mr)new MutationObserver(()=>onMob(mr.textContent||'')).observe(mr,{childList:true,characterData:true,subtree:true});
  if(bd)new MutationObserver(ms=>{
    if(ms.some(m=>m.target.classList&&m.target.classList.contains('on'))){
      const all=bd.querySelectorAll('.bead').length||1,on=bd.querySelectorAll('.bead.on').length;sfx('crack',on/all)}
  }).observe(bd,{attributes:true,attributeFilter:['class'],subtree:true});
  /* bấm nút → tiếng "tách" nhẹ (trừ nút chạm trứng và nút chạy, vì đã có tiếng riêng) */
  document.addEventListener('click',e=>{
    const b=e.target&&e.target.closest?e.target.closest('button,summary,select,label,.mini'):null;
    if(!b||b.disabled||b.id==='btn-tap'||b.id==='mob-run')return;sfx('tick')},true);
  /* toast cảnh báo của cửa hàng/huyết mạch */
  if(typeof window.popToast==='function'){const o=window.popToast;
    window.popToast=function(a,b,type){try{if(type==='bad')sfx('bad')}catch(_){}return o.apply(this,arguments)}}}

/* ---------- nút bật/tắt ---------- */
function ui(){
  const st=document.createElement('style');
  st.textContent=
   '#ttg-aud{position:fixed;right:10px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:60}'+
   '#ttg-aud .ab{width:38px!important;height:38px!important;min-height:0!important;padding:0!important;margin:0!important;border-radius:50%!important;border:1px solid #f6e8b7!important;background:rgba(16,10,18,.88)!important;color:#f6e8b7!important;font-size:18px!important;line-height:1!important;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.45)!important}'+
   '#ttg-aud .ap{display:none;position:absolute;right:0;bottom:46px;width:190px;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid #f6e8b7;background:rgba(16,10,18,.96);color:#f6e9e4;font-size:13px;text-align:left}'+
   '#ttg-aud.open .ap{display:block}'+
   '#ttg-aud .ap label{display:flex;align-items:center;gap:8px;margin:5px 0;color:#f6e9e4;font-size:13px}'+
   '#ttg-aud .ap input[type=checkbox]{width:18px;height:18px;margin:0;flex:none}'+
   '#ttg-aud .ap input[type=range]{width:100%;margin:6px 0 0;padding:0}';
  document.head.appendChild(st);
  const w=document.createElement('div');w.id='ttg-aud';
  w.innerHTML='<div class="ap"><label><input type="checkbox" id="aud-bgm"> 🎵 Nhạc nền</label><label><input type="checkbox" id="aud-sfx"> 🔊 Hiệu ứng</label><div style="font-size:12px;color:#cdbfc4;margin-top:4px">Âm lượng</div><input type="range" id="aud-vol" min="0" max="100"></div><button class="ab" id="aud-btn" type="button" aria-label="Âm thanh">🔊</button>';
  document.body.appendChild(w);
  const bgm=w.querySelector('#aud-bgm'),sf=w.querySelector('#aud-sfx'),vol=w.querySelector('#aud-vol'),btn=w.querySelector('#aud-btn');
  const paint=()=>{bgm.checked=S.bgm;sf.checked=S.sfx;vol.value=Math.round(S.vol*100);btn.textContent=(S.bgm||S.sfx)&&S.vol>0?'🔊':'🔇'};
  paint();
  btn.addEventListener('click',()=>w.classList.toggle('open'));
  bgm.addEventListener('change',()=>{S.bgm=bgm.checked;save();applyVol();paint()});
  sf.addEventListener('change',()=>{S.sfx=sf.checked;save();applyVol();paint()});
  vol.addEventListener('input',()=>{S.vol=vol.value/100;save();applyVol();paint()});
  document.addEventListener('click',e=>{if(!w.contains(e.target))w.classList.remove('open')},true)}

function init(){try{watch()}catch(e){}try{ui()}catch(e){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

window.AUD={S,sfx,SFX,setVol(v){S.vol=Math.min(1,Math.max(0,v));save();applyVol()}};
})();
