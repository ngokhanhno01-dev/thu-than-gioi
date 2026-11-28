/* 110-hieu-ung-tien-hoa.js - HIỆU ỨNG TIẾN HÓA THÚ (toàn màn hình, vẽ bằng DOM + canvas, không cần file ảnh/âm thanh).
   Trình tự (khoảng 4,5 giây): màn tối dần, hình thú hiện tại hiện giữa màn hình, vòng pháp trận xoay -> thú TRẮNG DẦN thành bóng trắng, các tia sáng "chíu chíu"
   bay hút vào thú (càng lúc càng dày, kèm tiếng chíu tăng tông) -> LÓE trắng xóa 1 cái -> hiện KẾT QUẢ kèm hình:
     THÀNH CÔNG: thú ở bậc mới hiện ra, nổ tia vàng + vòng sóng + tia sáng xoay, chữ vàng "TIẾN HÓA THÀNH CÔNG  V1 -> V2".
     THẤT BẠI: thú bậc cũ xám đi, rung, mảnh vỡ tím rơi, màn đỏ tím, chữ "TIẾN HÓA THẤT BẠI  vẫn ở V1".
   Chạm màn hình khi đang chạy = bỏ qua phần tích tụ, nhảy thẳng tới lúc lóe. Chạm sau khi có kết quả = đóng (tự đóng sau 9 giây).
   KẾT QUẢ ĐÃ ĐƯỢC TÍNH TRƯỚC (75-tien-hoa-thu.js gọi tienHoa rồi mới gọi hiệu ứng này), hiệu ứng chỉ trình chiếu, đóng giữa chừng cũng không mất/đổi gì.
   API: TTGTHFX.play({before:'đường dẫn ảnh thú bậc cũ', after:'ảnh bậc mới (khi thành công)', ok:true|false, ten:'tên thú', from:1, to:2}, callback khi đóng) | .busy() | .stop() | .test(ok) (thử với thú đang ra trận, KHÔNG đổi dữ liệu)
   Chỉnh thời gian ở CF (ms), màu ở các mảng COL. */
(function(root){
'use strict';
var CF={charge:2900,flashUp:3080,flashEnd:3750,textAt:3450,ready:4100,auto:9000,sound:true};
var COLC=['#ffffff','#9fefff','#ffe58a','#c9b8ff'],COLB=['#fff6c8','#ffd23a','#ffffff','#7be0ff','#ffb347'],COLF=['#c9a8ff','#8a6bd8','#6b6f8a','#ff7a8a','#b3b8d0'];
var ST=null,AC=null;
/* ảnh thú vẽ sát đáy khung 192x192: đo vùng không trong suốt rồi phóng + căn GIỮA khung để vòng sáng/tia hút đúng tâm thú */
function fit(im){try{var c=document.createElement('canvas'),x,d,i,j,x0=96,y0=96,x1=-1,y1=-1;c.width=c.height=96;x=c.getContext('2d');x.drawImage(im,0,0,96,96);d=x.getImageData(0,0,96,96).data;
 for(j=0;j<96;j++)for(i=0;i<96;i++)if(d[(j*96+i)*4+3]>24){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j;}
 if(x1<0)return;var w=x1-x0+1,h=y1-y0+1,sc=Math.min(3,0.88*96/Math.max(w,h)),st=im.style;
 st.width=st.height=(sc*100)+'%';st.left=((0.5-((x0+w/2)/96)*sc)*100)+'%';st.top=((0.5-((y0+h/2)/96)*sc)*100)+'%';}catch(e){}}
function clamp(x,a,b){return x<a?a:x>b?b:x;}
function rnd(a,b){return a+Math.random()*(b-a);}
function pick(a){return a[(Math.random()*a.length)|0];}
function css(){
 if(document.querySelector('style[data-thfx]'))return;var s=document.createElement('style');s.setAttribute('data-thfx','1');
 s.textContent='.thfx{position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483000;background:rgba(2,4,18,0);transition:background .4s;touch-action:manipulation;-webkit-tap-highlight-color:transparent;user-select:none;overflow:hidden;font-family:"Noto Serif","Palatino Linotype",Georgia,serif}'+
 '.thfx.on{background:radial-gradient(ellipse at 50% 46%,rgba(18,28,80,.92),rgba(2,4,18,.97) 75%)}'+
 '.thfx.bad{background:radial-gradient(ellipse at 50% 46%,rgba(60,16,50,.94),rgba(10,2,16,.98) 75%)}'+
 '.thfx-cv{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}'+
 '.thfx-pet{position:absolute;left:50%;top:46%;width:min(54vw,54vh,400px);aspect-ratio:1/1;transform:translate(-50%,-50%);pointer-events:none;opacity:0;transition:opacity .45s}'+
 '.thfx.on .thfx-pet{opacity:1}'+
 '.thfx-pet img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:contain;-webkit-user-drag:none;image-rendering:auto}'+
 '.thfx-pet img.w{filter:brightness(0) invert(1);opacity:0}'+
 '.thfx-fl{position:absolute;left:0;top:0;right:0;bottom:0;background:#fff;opacity:0;pointer-events:none}'+
 '.thfx-tx{position:absolute;left:0;right:0;top:calc(46% + min(30vw,30vh,230px));text-align:center;pointer-events:none;opacity:0;transform:translateY(12px) scale(.9);transition:opacity .5s,transform .5s cubic-bezier(.2,1.4,.4,1)}'+
 '.thfx-tx.show{opacity:1;transform:none}'+
 '.thfx-tx h2{margin:0;font-size:clamp(22px,5.4vw,40px);font-weight:900;letter-spacing:.04em;color:#ffe58a;text-shadow:0 2px 0 #7a4a00,0 0 14px #ffb300,0 0 30px rgba(255,200,60,.8)}'+
 '.thfx-tx.bad h2{color:#d9c8ff;text-shadow:0 2px 0 #2a0f45,0 0 14px #8a4bd8,0 0 28px rgba(150,80,220,.7)}'+
 '.thfx-tx p{margin:8px 0 0;font-size:clamp(15px,3.4vw,24px);font-weight:700;color:#eaf1ff;text-shadow:0 1px 2px #000,0 0 6px #000}'+
 '.thfx-tx small{display:block;margin-top:14px;font-size:clamp(12px,2.6vw,16px);color:#9fb0e8;opacity:0;transition:opacity .6s}'+
 '.thfx.rdy .thfx-tx small{opacity:.85}'+
 '@keyframes thfxShake{0%{transform:translate(0,0)}20%{transform:translate(-9px,4px)}40%{transform:translate(8px,-5px)}60%{transform:translate(-6px,-3px)}80%{transform:translate(5px,3px)}100%{transform:translate(0,0)}}'+
 '.thfx.shake{animation:thfxShake .5s linear}';
 document.head.appendChild(s);}
/* ---------- âm thanh nhỏ bằng WebAudio (không cần file) ---------- */
function ac(){if(!CF.sound)return null;try{if(!AC){var C=root.AudioContext||root.webkitAudioContext;if(C)AC=new C();}if(AC&&AC.state==='suspended')AC.resume();}catch(e){AC=null;}return AC;}
function blip(f1,f2,dur,type,vol,delay){var a=ac();if(!a)return;try{var o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(delay||0);
 o.type=type||'sine';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t+dur);
 g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.05,t+dur*0.15);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
 o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+0.05);}catch(e){}}
function noise(dur,vol,hp){var a=ac();if(!a)return;try{var n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0),i;
 for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
 var s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type='highpass';f.frequency.value=hp||800;g.gain.value=vol||0.12;s.connect(f);f.connect(g);g.connect(a.destination);s.start();}catch(e){}}
function sndOk(){noise(0.5,0.14,1200);[523,659,784,1047,1319].forEach(function(f,i){blip(f,f*1.01,0.7,'triangle',0.06,i*0.09);});}
function sndBad(){noise(0.4,0.12,300);blip(220,70,0.8,'sawtooth',0.07);blip(165,55,0.9,'square',0.04,0.05);}
/* ---------- chạy hiệu ứng ---------- */
function play(o,done){
 if(!document||!document.body){if(done)done();return;}
 if(ST)stop();css();o=o||{};
 var ok=!!o.ok,el=document.createElement('div');el.className='thfx';
 el.innerHTML='<canvas class="thfx-cv"></canvas><div class="thfx-pet"><img class="a" alt="" draggable="false"><img class="w" alt="" draggable="false"></div><div class="thfx-fl"></div><div class="thfx-tx"><h2></h2><p></p><small>Chạm để đóng</small></div>';
 document.body.appendChild(el);
 var cv=el.querySelector('canvas'),g=cv.getContext('2d'),pet=el.querySelector('.thfx-pet'),ia=el.querySelector('img.a'),iw=el.querySelector('img.w'),fl=el.querySelector('.thfx-fl'),tx=el.querySelector('.thfx-tx'),
  h2=tx.querySelector('h2'),pp=tx.querySelector('p'),W=1,H=1,dpr=Math.min(2,root.devicePixelRatio||1),cx=0,cy=0,R=100;
 function size(){W=root.innerWidth||800;H=root.innerHeight||600;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);g.setTransform(dpr,0,0,dpr,0,0);cx=W/2;cy=H*0.46;R=Math.min(W*0.54,H*0.54,400)/2;}
 size();
 ia.onload=iw.onload=function(){fit(this);};
 ia.src=iw.src=o.before||'';
 var S={el:el,ok:ok,done:done,t0:0,last:0,raf:0,acc:0,nextChirp:300,swapped:false,skipped:false,ready:false,text:false,streaks:[],sparks:[],rings:[],rays:0,rayT:0,end:false,resize:size};
 ST=S;
 var after=o.after||o.before||'';
 if(ok&&after&&after!==o.before){var pre=new Image();pre.src=after;}   /* nạp trước ảnh bậc mới */
 requestAnimationFrame(function(){el.classList.add('on');});
 function spawnStreak(p){var ang=rnd(0,Math.PI*2),far=Math.max(W,H)*rnd(0.55,0.8);S.streaks.push({a:ang,r:far,v:rnd(0.25,0.5),ac:rnd(0.0016,0.0034)*(0.6+p),c:pick(COLC),w:rnd(1.2,2.8)});}
 function burst(n,cols,sp,life,grav,r0){for(var i=0;i<n;i++){var a=rnd(0,Math.PI*2),v=rnd(sp*0.25,sp);S.sparks.push({x:cx+Math.cos(a)*(r0||0),y:cy+Math.sin(a)*(r0||0),vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:rnd(life*0.6,life),m:0,c:pick(cols),s:rnd(1.5,4.5),g:grav||0});}}
 function ring(c,w,sp){S.rings.push({r:R*0.3,v:sp,c:c,w:w,l:0,m:900});}
 function chirp(p){var f=500+p*1500+rnd(-60,60);blip(f,f*rnd(1.5,2.1),0.09,'sine',0.035+p*0.03);}
 function drawRing(rad,alpha,rot,dash){g.save();g.translate(cx,cy);g.rotate(rot);g.strokeStyle='rgba(170,230,255,'+alpha+')';g.lineWidth=2;g.setLineDash(dash);g.beginPath();g.arc(0,0,rad,0,Math.PI*2);g.stroke();g.restore();}
 function frame(now){
  if(S.end)return;if(!S.t0){S.t0=now;S.last=now;}
  var t=now-S.t0,dt=Math.min(48,now-S.last);S.last=now;
  g.clearRect(0,0,W,H);
  var p=clamp((t-300)/(CF.charge-300),0,1),pe=p*p;
  /* ---- tích tụ ---- */
  if(t<CF.flashUp){
   if(t>=CF.charge)p=1,pe=1;
   iw.style.opacity=String(clamp(pe*1.05,0,1));
   var sh=p*5,sc=1+p*0.07+Math.sin(t/(90-60*p))*0.012*p;
   pet.style.transform='translate(calc(-50% + '+rnd(-sh,sh).toFixed(1)+'px),calc(-50% + '+rnd(-sh,sh).toFixed(1)+'px)) scale('+sc.toFixed(3)+')';
   pet.style.filter='drop-shadow(0 0 '+(6+p*46).toFixed(0)+'px rgba(170,230,255,'+(0.35+p*0.6).toFixed(2)+'))';
   drawRing(R*1.18,0.15+p*0.55,t/1400,[10,8]);drawRing(R*1.45,0.1+p*0.4,-t/1000,[3,12]);
   var gl=g.createRadialGradient(cx,cy,R*0.2,cx,cy,R*(1.2+p*1.6));gl.addColorStop(0,'rgba(190,235,255,'+(0.08+p*0.5).toFixed(2)+')');gl.addColorStop(1,'rgba(190,235,255,0)');g.fillStyle=gl;g.fillRect(0,0,W,H);
   if(t>300){S.acc+=dt*(0.02+0.13*pe);while(S.acc>=1){S.acc-=1;spawnStreak(p);}
    if(t>=S.nextChirp){chirp(p);S.nextChirp=t+300-235*p;}}
  }
  /* ---- lóe sáng ---- */
  if(t>=CF.charge&&t<CF.flashUp)fl.style.opacity=String(clamp((t-CF.charge)/(CF.flashUp-CF.charge),0,1));
  if(t>=CF.flashUp&&!S.swapped){
   S.swapped=true;fl.style.opacity='1';
   if(ok){if(after)ia.src=iw.src=after;burst(150,COLB,1.15,1500,0.0004,R*0.15);ring('#ffe58a',5,1.0);ring('#ffffff',3,1.6);ring('#7be0ff',2,0.7);S.rays=1;S.rayT=t;sndOk();}
   else{ia.style.filter='grayscale(.85) brightness(.7)';el.classList.add('bad');burst(70,COLF,0.5,1700,0.0016,R*0.2);ring('#b48aff',3,0.5);el.classList.add('shake');sndBad();}
   iw.style.opacity='1';pet.style.filter='';pet.style.transform='translate(-50%,-50%)';
  }
  if(t>=CF.flashUp){
   var k=clamp((t-CF.flashUp)/(CF.flashEnd-CF.flashUp),0,1);
   fl.style.opacity=String(1-k);iw.style.opacity=String(1-k);
   if(S.swapped&&!ok){pet.style.transform='translate(calc(-50% + '+rnd(-3,3).toFixed(1)+'px * '+(1-k).toFixed(2)+'),-50%)';}
   if(ok){pet.style.filter='drop-shadow(0 0 '+(10+22*Math.sin(t/260)).toFixed(0)+'px rgba(255,214,90,.75))';}
   /* tia sáng xoay (thành công) */
   if(S.rays&&t-S.rayT<2400){var ra=1-(t-S.rayT)/2400,n=14,i,a0=t/1800;g.save();g.translate(cx,cy);g.globalCompositeOperation='lighter';
    for(i=0;i<n;i++){var a=a0+i*Math.PI*2/n;g.fillStyle='rgba(255,226,120,'+(0.22*ra).toFixed(3)+')';g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a-0.07)*Math.max(W,H),Math.sin(a-0.07)*Math.max(W,H));g.lineTo(Math.cos(a+0.07)*Math.max(W,H),Math.sin(a+0.07)*Math.max(W,H));g.closePath();g.fill();}
    g.restore();}
  }
  /* ---- chữ kết quả ---- */
  if(t>=CF.textAt&&!S.text){S.text=true;h2.textContent=ok?'TIẾN HÓA THÀNH CÔNG':'TIẾN HÓA THẤT BẠI';
   pp.textContent=(o.ten?o.ten+'  ':'')+(ok?'V'+o.from+' → V'+o.to:'vẫn ở V'+o.from);tx.classList.toggle('bad',!ok);tx.classList.add('show');}
  if(t>=CF.ready&&!S.ready){S.ready=true;el.classList.add('rdy');}
  if(t>=CF.ready+CF.auto){end();return;}
  /* ---- vẽ hạt ---- */
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  var i,s,q;
  for(i=S.streaks.length-1;i>=0;i--){s=S.streaks[i];s.v+=s.ac*dt;s.r-=s.v*dt;
   if(s.r<R*0.3||t>=CF.flashUp){if(s.r<R*0.3&&t<CF.flashUp&&Math.random()<0.5)S.sparks.push({x:cx+Math.cos(s.a)*R*0.3,y:cy+Math.sin(s.a)*R*0.3,vx:rnd(-0.1,0.1),vy:rnd(-0.1,0.1),l:300,m:0,c:s.c,s:rnd(1.5,3),g:0});S.streaks.splice(i,1);continue;}
   var len=22+s.v*90,x1=cx+Math.cos(s.a)*s.r,y1=cy+Math.sin(s.a)*s.r,x2=cx+Math.cos(s.a)*(s.r+len),y2=cy+Math.sin(s.a)*(s.r+len),
    lg=g.createLinearGradient(x1,y1,x2,y2);lg.addColorStop(0,s.c);lg.addColorStop(1,'rgba(255,255,255,0)');
   g.strokeStyle=lg;g.lineWidth=s.w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
  for(i=S.sparks.length-1;i>=0;i--){q=S.sparks[i];q.m+=dt;if(q.m>=q.l){S.sparks.splice(i,1);continue;}
   q.vy+=q.g*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;var al=1-q.m/q.l;g.globalAlpha=al;g.fillStyle=q.c;g.beginPath();g.arc(q.x,q.y,q.s*(0.5+al*0.5),0,Math.PI*2);g.fill();}
  g.globalAlpha=1;
  for(i=S.rings.length-1;i>=0;i--){q=S.rings[i];q.l+=dt;if(q.l>=q.m){S.rings.splice(i,1);continue;}
   q.r+=q.v*dt*0.55*(1-q.l/q.m*0.6);g.globalAlpha=(1-q.l/q.m);g.strokeStyle=q.c;g.lineWidth=q.w*(1-q.l/q.m*0.5);g.beginPath();g.arc(cx,cy,q.r,0,Math.PI*2);g.stroke();}
  g.restore();
  S.raf=requestAnimationFrame(frame);
 }
 function onTap(e){
  if(e&&e.preventDefault)e.preventDefault();
  if(S.ready){end();return;}
  if(!S.swapped&&!S.skipped){S.skipped=true;var t=performance.now()-S.t0;if(t<CF.charge)S.t0-=(CF.charge-t);}   /* chạm khi đang tích tụ: nhảy tới lúc lóe */
 }
 el.addEventListener('pointerup',onTap);
 root.addEventListener('resize',size);
 S.raf=requestAnimationFrame(frame);
 return S;
}
function end(){
 var S=ST;if(!S||S.end)return;S.end=true;ST=null;cancelAnimationFrame(S.raf);root.removeEventListener('resize',S.resize);
 var el=S.el;el.style.transition='opacity .3s';el.style.opacity='0';
 setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},320);
 if(S.done){try{S.done();}catch(e){}}}
function stop(){end();}
/* thử với thú đang ra trận (không đổi dữ liệu): TTGTHFX.test(true|false) */
function test(ok){var t=root.TTGTHU&&TTGTHU.getRaTran?TTGTHU.getRaTran():null;if(!t){console.log('[TTGTHFX] chưa có thú ra trận');return false;}
 var from=Math.min(3,Math.max(1,(t.tien|0)||1)),to=Math.min(3,from+1);
 play({before:TTGTHU.anh(t),after:TTGTHU.anh(Object.assign({},t,{tien:to})),ok:ok!==false,ten:TTGTHU.ten?TTGTHU.ten(t):'',from:from,to:to});return true;}
root.TTGTHFX={play:play,stop:stop,busy:function(){return !!ST;},test:test,CF:CF};
})(typeof window!=='undefined'?window:globalThis);
