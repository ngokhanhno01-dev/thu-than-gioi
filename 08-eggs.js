
/* Shared celestial altar + isolated egg sprites. The rank changes the egg/effects only. */
(() => {
  const spriteData = [
    'img-eggs-egg-01.webp',
    'img-eggs-egg-02.webp',
    'img-eggs-egg-03.webp',
    'img-eggs-egg-04.webp',
    'img-eggs-egg-05.webp'
  ];
  const sprites = spriteData.map(src => { const im = new Image(); im.src = src; return im; });
  const originalEggDraw = window.egg;
  const palette = [
    { color: [205, 162, 94], hex: '#ddb76e' },
    { color: [52, 236, 196], hex: '#34ecc4' },
    { color: [255, 166, 57], hex: '#ffa639' },
    { color: [95, 184, 255], hex: '#5fb8ff' },
    { color: [255, 217, 112], hex: '#ffd970' }
  ];
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rollFx = null;

  /* One fixed, shared pixel-art sanctuary for all five egg grades. */
  const backdrop = document.createElement('canvas');
  backdrop.width = W; backdrop.height = H;
  const b = backdrop.getContext('2d');
  const grad = (x0,y0,x1,y1,stops) => { const g=b.createLinearGradient(x0,y0,x1,y1); stops.forEach(s=>g.addColorStop(s[0],s[1])); return g; };
  function poly(points, fill, stroke, width=1) {
    b.beginPath(); points.forEach((p,i)=>i?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1])); b.closePath();
    if(fill){b.fillStyle=fill;b.fill()} if(stroke){b.strokeStyle=stroke;b.lineWidth=width;b.stroke()}
  }
  function drawPillar(x, y, h, s=1) {
    b.save(); b.translate(x,y); b.scale(s,1);
    b.fillStyle='#101528'; b.fillRect(-11,0,22,h);
    b.fillStyle=grad(-10,0,10,0,[[0,'#26334a'],[.28,'#687180'],[.5,'#30364a'],[.82,'#8a7860'],[1,'#28283c']]);
    b.fillRect(-8,7,16,h-14);
    b.fillStyle='rgba(229,207,160,.48)'; b.fillRect(-5,10,2,h-20);
    b.fillStyle='#171b2d'; b.fillRect(-15,-4,30,8); b.fillRect(-13,h-5,26,8);
    b.fillStyle='#d5ae65'; b.fillRect(-16,-6,32,3); b.fillRect(-14,h+3,28,3);
    for(let yy=16;yy<h-15;yy+=18){b.fillStyle='rgba(216,189,132,.18)';b.fillRect(-7,yy,14,1);b.fillStyle='rgba(15,18,35,.7)';b.fillRect(-1,yy+2,2,7)}
    b.fillStyle='#f1d18a'; b.fillRect(-2,22,4,4); b.fillRect(-2,h-25,4,4);
    b.restore();
  }
  function drawBackdrop() {
    b.fillStyle=grad(0,0,0,H,[[0,'#071126'],[.35,'#17284c'],[.68,'#211b40'],[1,'#090d1c']]); b.fillRect(0,0,W,H);
    const neb=b.createRadialGradient(180,63,2,180,69,145); neb.addColorStop(0,'rgba(116,174,225,.42)'); neb.addColorStop(.38,'rgba(89,105,180,.22)'); neb.addColorStop(1,'rgba(29,31,77,0)'); b.fillStyle=neb;b.fillRect(0,0,W,190);
    const sun=b.createRadialGradient(180,48,2,180,48,52);sun.addColorStop(0,'#fff4d0');sun.addColorStop(.12,'#ffe19a');sun.addColorStop(.48,'rgba(244,192,102,.55)');sun.addColorStop(1,'rgba(244,192,102,0)');b.fillStyle=sun;b.fillRect(104,0,152,110);
    b.fillStyle='rgba(255,224,164,.52)';b.beginPath();b.arc(180,44,9,0,Math.PI*2);b.fill();
    for(let i=0;i<15;i++){const a=-Math.PI*.92+i*Math.PI/14;const r=145;poly([[180,51],[180+Math.cos(a-.018)*r,51+Math.sin(a-.018)*r],[180+Math.cos(a+.018)*r,51+Math.sin(a+.018)*r]],'rgba(226,193,135,.035)')}
    for(let i=0;i<48;i++){const x=(i*73+19)%W,y=(i*47+11)%124,sz=i%9===0?2:1,alpha=.3+.6*Math.abs(Math.sin(i*11.7));b.fillStyle=`rgba(255,235,190,${alpha})`;b.fillRect(x,y,sz,sz);if(i%11===0){b.fillRect(x-3,y,7,1);b.fillRect(x,y-3,1,7)}}
    // Distant mountain ranges and floating sanctuaries.
    poly([[0,133],[0,105],[24,82],[38,105],[61,70],[83,110],[111,86],[139,121],[166,99],[193,120],[224,77],[250,112],[282,83],[302,116],[330,74],[360,107],[360,145]],'#141e39','#39456a',1);
    poly([[0,143],[26,120],[45,131],[68,105],[93,135],[121,111],[144,141],[177,119],[205,139],[236,108],[261,132],[290,112],[317,140],[343,112],[360,129],[360,157]],'#1b2543','#53607e',1);
    // Star-bridge and monumental central arch.
    b.save(); b.lineCap='round';
    b.beginPath();b.moveTo(75,157);b.lineTo(75,112);b.quadraticCurveTo(75,37,180,30);b.quadraticCurveTo(285,37,285,112);b.lineTo(285,157);
    b.strokeStyle='rgba(14,18,37,.96)';b.lineWidth=18;b.stroke();b.strokeStyle='#706b73';b.lineWidth=11;b.stroke();b.strokeStyle='#d2ac65';b.lineWidth=2.5;b.stroke();
    b.beginPath();b.moveTo(86,156);b.lineTo(86,112);b.quadraticCurveTo(86,48,180,43);b.quadraticCurveTo(274,48,274,112);b.lineTo(274,156);b.strokeStyle='rgba(132,199,230,.55)';b.lineWidth=1;b.stroke();
    b.restore();
    // Arch keystones and suspended crystal lamps.
    for(let i=0;i<13;i++){const a=Math.PI+i*Math.PI/12,x=180+99*Math.cos(a),y=112+69*Math.sin(a);b.fillStyle=i%2?'#a98b5b':'#536179';b.fillRect(x-3,y-4,6,8);b.fillStyle='rgba(255,224,150,.72)';b.fillRect(x-1,y-2,2,4)}
    // Grand pillars and flanking towers.
    drawPillar(30,57,125,.9);drawPillar(330,57,125,.9);drawPillar(77,94,87,.68);drawPillar(283,94,87,.68);
    // Floating temple platforms.
    poly([[0,119],[22,112],[44,117],[39,124],[8,126]],'#374158','#c7a667',1);poly([[316,117],[339,110],[360,116],[352,126],[322,124]],'#374158','#c7a667',1);
    b.fillStyle='rgba(73,211,225,.82)';b.fillRect(17,115,2,5);b.fillRect(340,114,2,5);
    // A fixed celestial halo behind the egg.
    b.save();b.translate(180,131);b.scale(1,.47);
    for(let i=0;i<4;i++){b.beginPath();b.ellipse(0,0,57+i*12,57+i*12,0,0,Math.PI*2);b.strokeStyle=i===0?'rgba(255,223,146,.72)':'rgba(116,195,232,.34)';b.lineWidth=i===0?2:1;b.stroke()}
    for(let i=0;i<12;i++){const a=i*Math.PI/6;b.fillStyle=i%3?'#90d9ed':'#ffe3a4';b.fillRect(Math.cos(a)*98-1,Math.sin(a)*98-2,3,4)}
    b.restore();
    // Ground plane with long perspective lines and illuminated runes.
    b.fillStyle=grad(0,146,0,H,[[0,'#29334a'],[.3,'#1d263c'],[1,'#080d1a']]);b.fillRect(0,145,W,H-145);
    b.strokeStyle='rgba(160,184,208,.22)';b.lineWidth=1;
    for(let i=-7;i<=7;i++){b.beginPath();b.moveTo(180+i*5,146);b.lineTo(180+i*31,H);b.stroke()}
    for(let j=0;j<6;j++){const y=151+j*j*3.8;b.beginPath();b.moveTo(0,y);b.lineTo(W,y);b.stroke()}
    // Broad stairway leading toward the altar.
    for(let i=0;i<5;i++){const y=166+i*13,half=30+i*17;b.fillStyle=i%2?'#222a3f':'#30394e';poly([[180-half,y],[180+half,y],[180+half+8,y+5],[180-half-8,y+5]],b.fillStyle,'rgba(227,196,133,.4)',1);b.fillStyle='rgba(255,225,163,.45)';b.fillRect(180-half,y,half*2,1)}
    // Shared summoning dais: stone tiers, engraved gold and a luminous center.
    const floorGlow=b.createRadialGradient(180,207,3,180,207,95);floorGlow.addColorStop(0,'rgba(245,205,120,.5)');floorGlow.addColorStop(.45,'rgba(102,181,207,.18)');floorGlow.addColorStop(1,'rgba(23,35,61,0)');b.fillStyle=floorGlow;b.fillRect(80,174,200,76);
    b.fillStyle='#11182b';b.beginPath();b.ellipse(180,211,91,23,0,0,Math.PI*2);b.fill();
    b.fillStyle='#263047';b.beginPath();b.ellipse(180,205,88,22,0,0,Math.PI*2);b.fill();b.strokeStyle='#d2b070';b.lineWidth=2;b.stroke();
    b.fillStyle='#3c4657';b.beginPath();b.ellipse(180,203,71,15,0,0,Math.PI*2);b.fill();b.strokeStyle='rgba(255,226,159,.78)';b.lineWidth=1.5;b.stroke();
    b.beginPath();b.ellipse(180,203,52,10,0,0,Math.PI*2);b.strokeStyle='rgba(96,219,224,.85)';b.lineWidth=1.4;b.stroke();
    b.fillStyle='#1a2237';poly([[116,208],[244,208],[232,228],[128,228]],'#1a2237','#b89458',1.5);
    for(let x=130;x<=230;x+=20){b.fillStyle='rgba(229,192,117,.65)';b.fillRect(x,214,2,10);b.fillStyle='rgba(134,199,222,.7)';b.fillRect(x+5,218,2,3)}
    b.beginPath();b.ellipse(180,202,31,6,0,0,Math.PI*2);b.strokeStyle='rgba(255,235,181,.75)';b.lineWidth=1;b.stroke();
    // Jewel points, banners and edge lights.
    for(const x of [15,57,303,345]){b.fillStyle='rgba(80,220,235,.9)';b.beginPath();b.moveTo(x,177);b.lineTo(x+4,184);b.lineTo(x,191);b.lineTo(x-4,184);b.closePath();b.fill();b.fillStyle='rgba(255,215,130,.8)';b.fillRect(x-1,174,2,3)}
    const vignette=b.createRadialGradient(180,123,80,180,123,235);vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,0,0,.48)');b.fillStyle=vignette;b.fillRect(0,0,W,H);
  }
  drawBackdrop();
  const sharedArt = new Image();
  sharedArt.onload = () => {
    const scale = Math.max(W / sharedArt.naturalWidth, H / sharedArt.naturalHeight);
    const cropW = W / scale, cropH = H / scale;
    const sx = (sharedArt.naturalWidth - cropW) / 2, sy = (sharedArt.naturalHeight - cropH) / 2;
    b.clearRect(0, 0, W, H);
    b.drawImage(sharedArt, sx, sy, cropW, cropH, 0, 0, W, H);
    const shade = b.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(5,12,26,.08)'); shade.addColorStop(1, 'rgba(7,10,20,.17)');
    b.fillStyle = shade; b.fillRect(0, 0, W, H);
  };
  sharedArt.src = 'img-misc-sharedart.webp';

  function summon(q){rollFx={tier:q,started:performance.now()};}
  function drawAura(t,q,cx,cy,w,h) {
    const p=palette[q],rgb=p.color.join(','),pulse=.9+.1*Math.sin(t*2.2),r=84+q*8;
    c.save();c.globalCompositeOperation='screen';
    const gl=c.createRadialGradient(cx,cy,4,cx,cy,r);
    gl.addColorStop(0,`rgba(${rgb},${.48+q*.035})`);
    gl.addColorStop(.44,`rgba(${rgb},${.34*pulse})`);
    gl.addColorStop(1,`rgba(${rgb},0)`);
    c.fillStyle=gl;c.fillRect(cx-r,cy-r,r*2,r*2);
    // Bright tier-colored halo surrounding the shell, with orbiting sparks.
    c.save();c.translate(cx,cy);c.rotate(Math.sin(t*.8+q)*.055);c.scale(1,.9);
    c.shadowColor=p.hex;c.shadowBlur=10+q*3;
    c.beginPath();c.ellipse(0,0,w*.71+14,h*.54+12,0,0,Math.PI*2);
    c.strokeStyle=`rgba(${rgb},${.72+q*.035})`;c.lineWidth=2+q*.25;c.stroke();
    c.shadowBlur=4;
    c.beginPath();c.ellipse(0,0,w*.85+23,h*.63+18,0,0,Math.PI*2);
    c.strokeStyle=`rgba(${rgb},${.42+q*.035})`;c.lineWidth=1.4;c.stroke();
    c.restore();
    for(let i=0;i<12;i++){
      const a=t*(.8+q*.035)+i*Math.PI*2/12,rx=w*.84+23,ry=h*.56+17;
      const px=cx+Math.cos(a)*rx,py=cy+Math.sin(a)*ry;
      const blink=.55+.45*Math.abs(Math.sin(t*3.2+i*1.9));
      c.globalAlpha=blink;c.fillStyle=i%3===0?'#fff4d6':p.hex;c.shadowColor=p.hex;c.shadowBlur=10+q*2;
      c.beginPath();c.arc(px,py,i%3===0?2.5:1.8,0,Math.PI*2);c.fill();
    }
    c.restore();
  }
  function drawBeam(q,elapsed,top) {
    const p=palette[q],rgb=p.color.join(','),duration=1420+q*150;
    if(elapsed>duration){rollFx=null;return}
    const grow=Math.max(0,Math.min(1,(elapsed-40)/(350+q*65))),fade=Math.min(1,(duration-elapsed)/300),pulse=.78+.22*Math.sin(elapsed*.024);
    const end=Math.max(28,top+12),w=(16+q*3.6)*grow,topW=(4+q*.8)*grow;
    c.save();c.globalCompositeOperation='screen';c.globalAlpha=fade*pulse;
    const beam=c.createLinearGradient(180,0,180,end);beam.addColorStop(0,`rgba(${rgb},.14)`);beam.addColorStop(.32,`rgba(${rgb},${.2+q*.035})`);beam.addColorStop(.76,`rgba(${rgb},${.42+q*.045})`);beam.addColorStop(1,`rgba(255,247,219,${.72+q*.035})`);
    c.shadowColor=p.hex;c.shadowBlur=14+q*7;c.fillStyle=beam;c.beginPath();c.moveTo(180-topW,0);c.lineTo(180+topW,0);c.lineTo(180+w,end);c.lineTo(180-w,end);c.closePath();c.fill();c.shadowBlur=0;
    const core=c.createLinearGradient(180,0,180,end);core.addColorStop(0,'rgba(255,250,227,.38)');core.addColorStop(1,'rgba(255,255,255,.92)');c.strokeStyle=core;c.lineWidth=2+q*.45;c.shadowColor=p.hex;c.shadowBlur=9+q*4;c.beginPath();c.moveTo(180,0);c.lineTo(180,end);c.stroke();c.shadowBlur=0;
    const burst=Math.min(1,elapsed/360);c.globalAlpha*=1-burst*.28;c.fillStyle=p.hex;c.beginPath();c.arc(180,end,2+q+burst*5,0,Math.PI*2);c.fill();
    c.strokeStyle=p.hex;c.lineWidth=2;c.beginPath();c.ellipse(180,top+11,10+burst*(35+q*6),4+burst*12,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<5+q*2;i++){const a=elapsed*.006+i*Math.PI*2/(5+q*2),rad=16+burst*(20+q*2),x=180+Math.cos(a)*rad,y=top+12+Math.sin(a)*rad*.34;c.globalAlpha=fade*(.5+.5*Math.sin(elapsed*.018+i));c.fillStyle='#fff4d0';c.fillRect(x-1,y-1,2,2)}
    c.restore();
  }
  function drawEgg(t) {
    const q=Math.max(0,Math.min(4,Number.isInteger(eggQ)?eggQ:0)),im=sprites[q],now=performance.now();
    // Repaint the same shared background each frame; rolling never swaps this layer.
    c.drawImage(backdrop,0,0,W,H);
    const h=118,w=im.naturalHeight?im.naturalWidth/im.naturalHeight*h:96,baseY=190,top=baseY-h,cx=180,cy=top+h*.52;
    drawAura(t,q,cx,cy,w,h);
    if(im.complete&&im.naturalWidth){
      const age=rollFx&&rollFx.tier===q?now-rollFx.started:-1;
      const appear=age>=0?Math.max(.15,Math.min(1,age/360)):1;
      const motionScale=reducedMotion?.8:1;
      const shake=age>=0?(1-Math.min(1,age/680))*motionScale:0;
      const dx=Math.sin(t*6.1+q)*2.8*motionScale+shake*Math.sin(age*.13)*(5+q*.8);
      const rot=Math.sin(t*4.6+q)*.045*motionScale+shake*Math.sin(age*.16)*.032;
      const idleY=Math.sin(t*5.3+q)*2.3*motionScale;
      c.save();c.translate(cx+dx,cy+idleY);c.rotate(rot);c.scale((.94+.06*appear)*(1+Math.sin(t*3.7+q)*.02*motionScale),(.94+.06*appear)*(1+Math.sin(t*3.7+q+1)*.02*motionScale));c.globalAlpha=appear;
      c.drawImage(im,-w/2,-h/2,w,h);c.restore();
    } else {
      c.save();c.fillStyle='#2d2830';c.beginPath();c.ellipse(cx,cy,34,48,0,0,Math.PI*2);c.fill();c.restore();
    }
    // Foreground orbit and runes are also tier-colored; the altar remains unchanged.
    c.save();c.globalCompositeOperation='screen';c.strokeStyle=`rgba(${palette[q].color.join(',')},.82)`;c.lineWidth=2;c.shadowColor=palette[q].hex;c.shadowBlur=9;
    c.save();c.translate(cx,cy+7);c.rotate(-.2+Math.sin(t*.7)*.05);c.scale(1,.28);c.beginPath();c.ellipse(0,0,w*.78+13,24,0,0,Math.PI*2);c.stroke();c.restore();c.shadowBlur=0;
    c.strokeStyle=`rgba(${palette[q].color.join(',')},.86)`;c.lineWidth=1.5;c.beginPath();c.ellipse(cx,193,50,8,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<8;i++){const a=t*.55+i*Math.PI/4,x=cx+Math.cos(a)*50,y=193+Math.sin(a)*8;c.fillStyle=palette[q].hex;c.fillRect(x-1,y-1,3,3)}c.restore();
    if(rollFx&&rollFx.tier===q)drawBeam(q,now-rollFx.started,top);
  }
  window.egg=drawEgg;
  const oldReroll=window.rerollEgg;
  if(oldReroll)window.rerollEgg=function(){const before=rerollLeft;oldReroll();if(rerollLeft<before){burst=0;summon(eggQ)}};
  const oldSwap=window.swapEgg;
  if(oldSwap)window.swapEgg=function(i){const valid=!chosen&&hist[i]!==undefined;oldSwap(i);if(valid){burst=0;summon(eggQ)}};
})();
