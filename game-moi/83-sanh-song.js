/* ===== 83-sanh-song.js (TTGSANH): THÚ Ở SẢNH "ĐANG SỐNG" =====
   Thú đứng ở sảnh không còn đứng im: nó thỉnh thoảng nhảy lóc cóc sang chỗ khác (giống lúc đi tìm mục tiêu ở màn Thám hiểm),
   nhảy tại chỗ, ngó nghiêng; lâu lâu hiện bong bóng EMOJI vài giây; cứ vài giây lại nói 1 câu trong KHUNG CHAT (châm chọc, trách móc,
   tức giận, vui vẻ, than vãn, hoặc mẹo hướng dẫn chức năng). Chạm vào thú thì nó phản ứng + nói ngay.
   NỐI VỚI index.html (tìm "TTGSANH"): hàm petSanh gọi TTGSANH.pose(ts,o) lấy vị trí/độ nảy/độ bẹp/hướng quay rồi vẽ thú theo đó;
   hàm draw() gọi TTGSANH.draw(ctx,ts) sau cùng để vẽ bong bóng đè lên trên.
   Mọi thứ vẽ trên canvas theo ts (không timer, không DOM) nên không cần dọn dẹp; rời sảnh (SCENE đổi) thì pose/draw không được gọi nữa.
   CHỈNH: khối CFG (nhịp nhảy, tần suất emoji/chat, cỡ chữ) và các bảng LINES / EMO bên dưới (thêm câu = thêm 1 chuỗi vào đúng nhóm).
   Mọi lỗi đều bị nuốt (try/catch) để không bao giờ làm sập vòng vẽ. */
(function(root){'use strict';
var CFG={
  on:true,
  range:.28,            /* thú đi lại trong ±(range x bề rộng khung trên) quanh giữa khung */
  idle:[1500,3600],     /* nghỉ giữa 2 hành động (ms) */
  hopDur:400,hopH:13,hopStep:34,   /* 1 bước nhảy: thời gian, độ cao, bước ngang (điểm game) */
  chance:{hop:.58,jump:.18,look:.24},
  emo:{first:[4500,7500],gap:[9000,16000],show:[2600,3400]},    /* emoji LÂU LÂU mới hiện, mỗi lần vài giây */
  chat:{first:[3500,6000],gap:[3500,7000],base:1700,perChar:55,max:6200,cps:34},  /* nói VÀI GIÂY 1 LẦN; hiện lâu = base + perChar x số chữ (tối đa max); cps = chữ/giây khi "gõ" */
  maxW:150,font:'bold 11px "Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',lh:14,pad:7,
  off:46,hy:76,         /* khung chat cách thú bao xa theo chiều ngang / cao bao nhiêu so với chân */
  tay:.18               /* xác suất chọn câu theo tình trạng thật (hết châu, có Tinh Thạch...) khi có */
};

/* ---------- EMOJI (bong bóng nhỏ) ---------- */
var EMO=['❓','🧐','💦','💢','😵‍💫','🤩','✨😆✨','💤','🎵','❗','😏','😤','🥱','😴','💭'];

/* ---------- CÂU NÓI: mỗi nhóm có màu viền + emoji góc ---------- */
var MOOD={
  chamChoc:{ic:'😏',col:'#d0952a'},
  tracMoc:{ic:'😒',col:'#7d8fbd'},
  gianDu:{ic:'😡',col:'#d9482f'},
  vui:{ic:'😄',col:'#e3b21c'},
  than:{ic:'😩',col:'#6d93b9'},
  meo:{ic:'💡',col:'#3fae6a'},
  cham:{ic:'😖',col:'#c9709a'}
};
var LINES={
  chamChoc:[
    'Ủa, nay chủ nhân rảnh ghé thăm ta cơ à?',
    'Nhìn gì mà nhìn, chưa thấy thú đáng yêu bao giờ hả?',
    'Cứ đứng đó đi, trận nào cũng để ta gánh mà.',
    'Giỏi thì tự đi mà đánh, ta xem bạn được mấy chiêu.',
    'Hừm, thú bạn mới bắt về chắc còn yếu hơn ta nhỉ?',
    'Ngắm ta hoài vậy, ta nổi tiếng rồi đó nha.',
    'Bạn mà chăm thám hiểm bằng nửa chăm ngắm ta là ta mừng rồi.',
    'Ồ, vẫn còn nhớ ta tồn tại cơ đấy.'
  ],
  tracMoc:[
    'Mấy hôm nay bạn chẳng dẫn ta đi chơi gì cả.',
    'Ta đứng đây mỏi chân lắm rồi đó.',
    'Có Tinh Thạch thì cũng nghĩ tới ta một chút chứ.',
    'Lần trước thua là tại ai? Ta đâu có lỗi!',
    'Bạn hứa cho ta tiến hóa mà, sao chưa thấy đâu?',
    'Đồ ngon toàn để dành cho thú khác hả?',
    'Bạn cứ lơ ta hoài, ta buồn đó nha.'
  ],
  gianDu:[
    'Đi thám hiểm ngay! Không là ta giận thật đấy!',
    'Còn chọc nữa là ta húc bạn đó!',
    'Lề mề quá! Ta sốt ruột lắm rồi!',
    'Hừ! Ta mà nổi giận là lửa bay tứ tung!',
    'Đừng bắt ta đứng yên nữa, ngứa chân rồi!',
    'Ta không phải thú cảnh đâu nhé!'
  ],
  vui:[
    'Hôm nay đẹp trời, đánh trận thôi!',
    'Hehe, ta thấy mình mạnh lên rồi đó!',
    'Có bạn ở đây là ta vui rồi!',
    'Yeah! Mau dẫn ta đi săn thú hiếm nào!',
    'Ta khỏe như vâm, sẵn sàng thắng liên tục!',
    'Hôm nay chắc chắn là ngày may mắn của ta!'
  ],
  than:[
    'Haizz, đứng hoài chán quá đi mất...',
    'Ta đói rồi... ai cho ta chút EXP đi...',
    'Mắt ta díp lại rồi này... ngáp...',
    'Sao trận nào bạn cũng bắt ta xông lên trước...',
    'Mệt quá, cho ta nghỉ một chút được không?',
    'Chán ghê... chẳng ai chơi với ta cả...'
  ],
  /* MẸO: câu nào cũng khớp chức năng thật trong game (xem GHI_CHU.md). Sửa luật game thì sửa câu ở đây cho khớp. */
  meo:[
    'Bấm nút Thám hiểm ở giữa thanh nút, ta sẽ tự đi tìm thú và đánh liên tục. Muốn dừng thì bấm nút Dừng.',
    'Chạm khung tên vùng ngay dưới nút Thám hiểm để đổi sang vùng đã mở.',
    'Danh Vọng là số loài thú hoang và boss bạn đã hạ. Mỗi loài chỉ tính lần đầu tiên.',
    'Muốn mở vùng mới thì cần đủ Danh Vọng. Mở rồi không bị tốn đâu.',
    'Danh Vọng càng cao thì trần cấp của ta càng cao. Đạt trần là ta ngừng nhận EXP đó!',
    'Ngự Thú Châu chỉ ném được khi thú hoang còn dưới 60% máu. Đánh cho nó yếu rồi hãy ném.',
    'Boss khó bắt hơn thú thường. Nhớ mang đủ châu và đánh cho nó thật yếu.',
    'Châu cấp cao bắt dễ hơn ở vùng thấp, nhưng châu thấp thì không ném nổi ở vùng quá cao.',
    'Thắng trận có Tinh Thạch. Thua mất một nửa, còn bấm Chạy giữa trận thì mất đủ phần của lần thắng.',
    'Chỉ boss thú hoang mới rơi Sách kỹ năng (1,5%). Bắt boss thì không rơi, phải hạ gục mới có.',
    'Sách kỹ năng chỉ gắn được cho thú cùng hệ chính hoặc hệ phụ với sách. Vào Linh Thú để gắn nhé.',
    'Vào Linh Thú để chọn thú ra trận, xem chỉ số, hoặc thả thú không cần nữa.',
    'Túi Trữ Vật chứa châu, sách, nguyên liệu và đá cường hóa. Khóa món quý để khỏi vứt nhầm.',
    'Quái vùng rơi nguyên liệu rèn và đá cường hóa. Mang qua Luyện Khí và Cường hóa để làm đồ mạnh hơn.',
    'Mặc đủ 2 hoặc 4 món cùng bộ sẽ có thêm buff bộ. Xem mô tả trong bảng Pháp Bảo.',
    'Chỉ thú hoang và boss thú hoang mới rơi vật phẩm tiến hóa. Gom đủ rồi nâng bậc cho ta nhé.',
    'Hệ khắc nhau thì sát thương nhân 1,5. Bị khắc thì chỉ còn 0,7. Chọn thú hợp hệ với vùng nhé.',
    'Thú có tốc độ cao sẽ đánh trước. Xem thanh vàng dưới khung thông tin trong trận.',
    'Icon kỹ năng dưới khung thông tin: mờ là còn hồi chiêu, sáng viền vàng là lượt sau dùng lại.',
    'Boss thú hoang có kỹ năng riêng, nhìn ở bảng Phát hiện mục tiêu trước khi vào trận.',
    'Nhãn V1, V2, V3 cạnh tên thú hoang là dạng tiến hóa của nó. Càng cao càng đáng gờm.',
    'Đang thám hiểm mà muốn dừng thì bấm nút Dừng trên cùng, hoặc phím Esc nếu bạn chơi trên máy tính.',
    'Danh hiệu mặc ở Pháp Bảo sẽ nổi ngay trên đầu ta. Oai lắm đó!'
  ],
  cham:[
    'Á! Đừng chọc ta!',
    'Nhột quá, hihi!',
    'Chọc nữa là ta cắn đấy nhé!',
    'Có chuyện gì? Muốn đi thám hiểm hả?',
    'Ê, đừng có sờ lung tung!',
    'Hửm? Gọi ta hả?',
    'Ui da! Ta đâu phải trái bóng!'
  ]
};
/* trọng số khi chọn nhóm cho câu nói tự động (nhóm "cham" chỉ dùng khi bị chạm) */
var W_NHOM=[['chamChoc',17],['tracMoc',15],['gianDu',12],['vui',16],['than',15],['meo',25]];

/* ---------- trạng thái ---------- */
var S={init:false,last:0,dx:0,face:1,act:null,rx:null,nextAct:0,nextEmo:0,nextChat:0,chat:null,emo:null,
  bag:{},lastLine:'',o:null,px:0,foot:0,m:null,seen:0,bound:false,lay:{}};
function rnd(a,b){return a+Math.random()*(b-a);}
function rr(r){return rnd(r[0],r[1]);}
function clamp(x,a,b){return x<a?a:(x>b?b:x);}
function pickOne(a,not){var r,n=0;do{r=a[Math.floor(Math.random()*a.length)];}while(r===not&&a.length>1&&++n<9);return r;}

/* ---------- chọn câu nói (túi xáo: hết cả nhóm mới lặp lại, không lặp ngay câu vừa nói) ---------- */
function takeLine(nhom){
  var b=S.bag[nhom];
  if(!b||!b.length){b=S.bag[nhom]=LINES[nhom].slice();
    for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t;}}
  var s=b.pop();if(s===S.lastLine&&b.length)s=b.pop();return s;}
function pickNhom(){
  var tot=0,i,r;for(i=0;i<W_NHOM.length;i++)tot+=W_NHOM[i][1];
  r=Math.random()*tot;for(i=0;i<W_NHOM.length;i++){r-=W_NHOM[i][1];if(r<=0)return W_NHOM[i][0];}
  return 'meo';}
/* câu theo tình trạng thật của người chơi (nuốt mọi lỗi; không có dữ liệu thì trả null) */
function ctxLine(){
  try{
    var out=[],B=root.TTGBALO,N=root.TTGBONG,T=root.TTGTIEN,tong=0,i;
    if(B&&B.count&&N&&N.CFG&&N.idBong){for(i=1;i<=N.CFG.capBongMax;i++)tong+=B.count(N.idBong(i))||0;
      if(tong<=0)out.push(['tracMoc','Túi hết sạch Ngự Thú Châu rồi. Bạn định bắt thú bằng tay không à?']);
      else if(tong<=3)out.push(['than','Chỉ còn '+tong+' viên châu thôi... bắt thú cho khéo nhé.']);}
    if(T&&T.get){var tt=T.get('tt')|0;if(tt>0&&T.fmt)out.push(['chamChoc','Có '+T.fmt(tt)+' Tinh Thạch trong túi mà cứ ôm đó hả? Đi kiếm thêm đi!']);}
    var rt=root.TTGTHU&&root.TTGTHU.getRaTran?root.TTGTHU.getRaTran():null;
    if(rt&&rt.ten)out.push(['vui','Ta là '+rt.ten+', thú xuất sắc nhất sảnh này đó nha!']);
    return out.length?pickOne(out):null;
  }catch(e){return null;}}

/* ---------- bắt đầu một câu / một emoji ---------- */
function say(ts,nhom,text){
  var m=MOOD[nhom]||MOOD.meo,txt=text||takeLine(nhom);S.lastLine=txt;
  S.chat={t0:ts,text:txt,mood:m,nhom:nhom,dur:Math.min(CFG.chat.max,CFG.chat.base+CFG.chat.perChar*txt.length),side:(S.px<(S.o?S.o.cx:0))?'r':'l',lay:null};
  S.emo=null;S.nextEmo=Math.max(S.nextEmo,ts+S.chat.dur+2500);
  /* phản ứng của thú theo tâm trạng */
  S.rx={t0:ts,k:nhom==='gianDu'?'shake':(nhom==='vui'||nhom==='cham')?'dbl':nhom==='than'?'droop':'bounce',dur:nhom==='gianDu'?900:700};}
function autoChat(ts){
  var c=Math.random()<CFG.tay?ctxLine():null;
  if(c)say(ts,c[0],c[1]);else say(ts,pickNhom());}
function showEmo(ts){S.emo={t0:ts,text:pickOne(EMO,S.emo&&S.emo.text),dur:rr(CFG.emo.show)};}

/* ---------- hành động chuyển động ---------- */
function range(){var o=S.o;return Math.max(40,(o.r-o.l)*CFG.range);}
function startAct(ts){
  var r=Math.random(),c=CFG.chance,R=range();
  if(r<c.hop){
    var tgt=S.dx,k;for(k=0;k<8;k++){var t=rnd(-R,R);if(Math.abs(t-S.dx)>=50){tgt=t;break;}}
    if(Math.abs(tgt-S.dx)<30)tgt=clamp(S.dx+(S.dx>0?-1:1)*60,-R,R);
    var n=clamp(Math.round(Math.abs(tgt-S.dx)/CFG.hopStep),2,6);
    S.face=tgt<S.dx?-1:1;
    S.act={k:'hop',t0:ts,n:n,dur:CFG.hopDur,d0:S.dx,d1:tgt,h:CFG.hopH};
  }else if(r<c.hop+c.jump){
    S.act={k:'hop',t0:ts,n:Math.random()<.5?1:2,dur:CFG.hopDur+60,d0:S.dx,d1:S.dx,h:CFG.hopH*1.7};
  }else{
    S.act={k:'look',t0:ts,dur:1500,f:0};
  }}
/* dáng 1 bước nhảy tại u (0..1): nảy lên, tiếp đất bẹp rồi bật lại như thú ở màn Thám hiểm */
function hopShape(u,h){
  var a=Math.min(1,u/.88),y=-h*Math.sin(Math.PI*a),sx=1,sy=1,k;
  if(u<.88){k=Math.sin(Math.PI*a);sx=1-.06*k;sy=1+.07*k;}
  else{k=1-(u-.88)/.12;sx=1+.13*k;sy=1-.14*k;}
  return {y:y,sx:sx,sy:sy};}

/* ---------- API: tư thế thú mỗi khung hình ----------
   o = {cx: giữa khung, l, r: mép trái/phải khung, t: mép trên, gy: y chân thú (đã nâng), bob: nhịp thở}
   trả {x, y (độ nảy, âm = lên), sx, sy, face}; vẽ thú: translate(x, gy+bob+y) rồi scale(face*sx, sy), chân ở gốc. */
function pose(ts,o){
  var P={x:o.cx,y:0,sx:1,sy:1,face:1};
  try{
    if(!CFG.on)return P;
    S.o=o;S.seen=ts;
    if(!S.init){S.init=true;S.last=ts;S.nextAct=ts+rr(CFG.idle);S.nextEmo=ts+rr(CFG.emo.first);S.nextChat=ts+rr(CFG.chat.first);}
    /* quay lại sau khi tab bị ẩn / rời sảnh lâu: dời mọi mốc thời gian để không dồn cục */
    if(ts-S.last>1500){var d=ts-S.last-16;S.nextAct+=d;S.nextEmo+=d;S.nextChat+=d;if(S.act)S.act.t0+=d;if(S.rx)S.rx.t0+=d;if(S.chat)S.chat.t0+=d;if(S.emo)S.emo.t0+=d;}
    S.last=ts;
    var R=range();S.dx=clamp(S.dx,-R,R);
    var ox=S.dx,oy=0,sx=1,sy=1,a=S.act,e,u,i,hs;
    if(a){
      e=ts-a.t0;
      if(a.k==='hop'){
        i=Math.floor(e/a.dur);
        if(i>=a.n){S.dx=ox=a.d1;S.act=null;S.nextAct=ts+rr(CFG.idle);}
        else{u=(e-i*a.dur)/a.dur;var p=Math.min(1,u/.88);ox=a.d0+(a.d1-a.d0)*(i+p)/a.n;hs=hopShape(u,a.h);oy=hs.y;sx=hs.sx;sy=hs.sy;}
      }else if(a.k==='look'){
        if(e>=a.dur){S.act=null;S.nextAct=ts+rr(CFG.idle);}
        else{if(a.f===0&&e>380){S.face=-S.face;a.f=1;}if(a.f===1&&e>980){S.face=-S.face;a.f=2;}
          sx=1+.03*Math.sin(e/120);}
      }
    }else if(ts>=S.nextAct)startAct(ts);
    /* phản ứng khi nói / bị chạm */
    var x=S.rx;
    if(x){var ex=ts-x.t0;
      if(ex>=x.dur)S.rx=null;
      else{u=ex/x.dur;
        if(x.k==='shake'){ox+=Math.sin(ex/32)*2.4*(1-u);sy*=1-.03*Math.sin(Math.PI*u);}
        else if(x.k==='dbl'){oy-=9*Math.abs(Math.sin(Math.PI*u*2));}
        else if(x.k==='droop'){sy*=1-.05*Math.sin(Math.PI*u);sx*=1+.03*Math.sin(Math.PI*u);}
        else{oy-=5*Math.sin(Math.PI*u);}}}
    /* emoji lâu lâu / câu nói vài giây một lần (không chồng nhau) */
    if(S.chat&&ts-S.chat.t0>S.chat.dur+300){S.chat=null;S.nextChat=ts+rr(CFG.chat.gap);}
    if(S.emo&&ts-S.emo.t0>S.emo.dur+200){S.emo=null;S.nextEmo=ts+rr(CFG.emo.gap);}
    if(!S.chat&&ts>=S.nextChat)autoChat(ts);
    else if(!S.chat&&!S.emo&&ts>=S.nextEmo&&ts<S.nextChat-1500)showEmo(ts);   /* không hiện emoji sát ngay trước câu nói */
    P.x=o.cx+ox;P.y=oy;P.sx=sx;P.sy=sy;P.face=S.face;
    S.px=P.x;S.foot=o.gy+(o.bob||0)+oy;
  }catch(err){}
  return P;}

/* ---------- vẽ bong bóng ---------- */
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function popScale(age,ms){if(age>=ms)return 1;var p=age/ms;return p<.55?.3+(1.22-.3)*(p/.55):p<.8?1.22+(.94-1.22)*((p-.55)/.25):.94+.06*((p-.8)/.2);}
function wrap(c,text,maxW){
  var words=text.split(' '),lines=[],cur='',i,t;
  for(i=0;i<words.length;i++){t=cur?cur+' '+words[i]:words[i];if(c.measureText(t).width>maxW&&cur){lines.push(cur);cur=words[i];}else cur=t;}
  if(cur)lines.push(cur);return lines;}
function layout(c,ch){
  if(ch.lay)return ch.lay;
  c.font=CFG.font;
  var lines=wrap(c,ch.text,CFG.maxW),w=0,i;
  for(i=0;i<lines.length;i++)w=Math.max(w,c.measureText(lines[i]).width);
  return ch.lay={lines:lines,w:Math.ceil(w)+CFG.pad*2,h:lines.length*CFG.lh+CFG.pad*2-2};}

function drawChat(c,ts){
  var ch=S.chat,o=S.o;if(!ch||!o)return;
  var age=ts-ch.t0,L=layout(c,ch),w=L.w,h=L.h,side=ch.side,bx,top,mid,pad=CFG.pad;
  if(age<0)return;
  var left=o.l+6,right=o.r-6;
  bx=side==='r'?S.px+CFG.off:S.px-CFG.off-w;
  if(bx<left||bx+w>right){side=side==='r'?'l':'r';bx=side==='r'?S.px+CFG.off:S.px-CFG.off-w;ch.side=side;}
  bx=clamp(bx,left,Math.max(left,right-w));
  top=Math.max(o.t+28,S.foot-CFG.hy-h/2);mid=top+h*.6;
  var alpha=1,fade=ch.dur+300-age;if(fade<280)alpha=Math.max(0,fade/280);
  var sc=popScale(age,320),px0=side==='r'?bx-9:bx+w+9,py0=mid+7;
  c.save();c.globalAlpha=alpha;c.translate(px0,py0);c.scale(sc,sc);c.translate(-px0,-py0);
  c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=6;c.shadowOffsetY=2;
  c.fillStyle='rgba(255,251,238,.97)';c.strokeStyle=ch.mood.col;c.lineWidth=2;
  rrect(c,bx,top,w,h,9);c.fill();
  /* đuôi bong bóng chỉ về phía thú */
  c.beginPath();
  if(side==='r'){c.moveTo(bx+1,mid-6);c.lineTo(bx-9,mid+7);c.lineTo(bx+1,mid+6);}else{c.moveTo(bx+w-1,mid-6);c.lineTo(bx+w+9,mid+7);c.lineTo(bx+w-1,mid+6);}
  c.closePath();c.fill();
  c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;
  rrect(c,bx,top,w,h,9);c.stroke();
  /* che mép viền chỗ đuôi cho liền nét */
  c.fillStyle='rgba(255,251,238,.97)';
  if(side==='r')c.fillRect(bx-1,mid-5,3,11);else c.fillRect(bx+w-2,mid-5,3,11);
  c.beginPath();
  if(side==='r'){c.moveTo(bx,mid-6);c.lineTo(bx-9,mid+7);c.lineTo(bx,mid+6);}else{c.moveTo(bx+w,mid-6);c.lineTo(bx+w+9,mid+7);c.lineTo(bx+w,mid+6);}
  c.strokeStyle=ch.mood.col;c.lineWidth=2;c.stroke();
  /* chữ hiện dần như đang nói */
  c.fillStyle='#3a2a14';c.font=CFG.font;c.textAlign='left';c.textBaseline='top';
  var left2=Math.floor(age/1000*CFG.chat.cps)+1,i,s,y=top+pad-1;
  for(i=0;i<L.lines.length&&left2>0;i++){s=L.lines[i];if(s.length>left2)s=s.slice(0,left2);c.fillText(s,bx+pad,y);left2-=L.lines[i].length+1;y+=CFG.lh;}
  /* chip tâm trạng ở góc (biểu tượng khung chat) */
  var cx2=side==='r'?bx+w-2:bx+2,cy2=top+1;
  c.fillStyle=ch.mood.col;c.beginPath();c.arc(cx2,cy2,9,0,Math.PI*2);c.fill();
  c.fillStyle='#fff';c.font='11px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(ch.mood.ic,cx2,cy2+.5);
  c.restore();}

function drawEmo(c,ts){
  var em=S.emo,o=S.o;if(!em||!o)return;
  var age=ts-em.t0;if(age<0)return;
  var alpha=1,fade=em.dur+200-age;if(fade<200)alpha=Math.max(0,fade/200);
  c.save();c.font='19px sans-serif';
  var tw=c.measureText(em.text).width,w=Math.max(34,tw+16),h=32,dir=(S.px<o.cx)?1:-1;
  var ex=S.px+dir*(30+w/2-8),ey=S.foot-CFG.hy-34+Math.sin(ts/260)*1.5;
  ex=clamp(ex,o.l+w/2+6,o.r-w/2-6);
  var sc=popScale(age,340);
  c.globalAlpha=alpha;c.translate(ex-dir*w/2,ey+h/2);c.scale(sc,sc);c.translate(-(ex-dir*w/2),-(ey+h/2));
  c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=5;c.shadowOffsetY=2;
  c.fillStyle='rgba(255,252,242,.97)';c.strokeStyle='#cda94a';c.lineWidth=1.6;
  rrect(c,ex-w/2,ey,w,h,16);c.fill();c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;c.stroke();
  /* chấm tròn nối về phía thú (bong bóng suy nghĩ) */
  c.fillStyle='rgba(255,252,242,.97)';
  c.beginPath();c.arc(ex-dir*(w/2-4),ey+h+5,3.2,0,Math.PI*2);c.fill();c.stroke();
  c.beginPath();c.arc(ex-dir*(w/2+3),ey+h+11,2,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle='#000';c.textAlign='center';c.textBaseline='middle';c.fillText(em.text,ex,ey+h/2+1);
  c.restore();}

/* ---------- API: vẽ bong bóng (gọi sau cùng trong khung hình sảnh) ---------- */
function draw(c,ts){
  try{
    if(!CFG.on||!S.init||!S.o||ts-S.seen>200)return;
    S.m=c.getTransform?c.getTransform():null;S.cv=c.canvas;
    if(!S.bound&&c.canvas){S.bound=true;c.canvas.addEventListener('pointerdown',onTap,{passive:true});}
    drawEmo(c,ts);drawChat(c,ts);
  }catch(err){try{c.restore();}catch(e2){}}}

/* ---------- chạm vào thú: phản ứng + nói ngay ---------- */
function onTap(e){
  try{
    var ts=performance.now(),cv=S.cv,m=S.m,o=S.o;
    if(!CFG.on||!cv||!m||!o||ts-S.seen>300)return;
    var rc=cv.getBoundingClientRect();if(!rc.width||!rc.height)return;
    var cx=(e.clientX-rc.left)*cv.width/rc.width,cy=(e.clientY-rc.top)*cv.height/rc.height,
        lx=(cx-m.e)/m.a,ly=(cy-m.f)/m.d;
    if(Math.abs(lx-S.px)>46||ly<S.foot-112||ly>S.foot+6)return;
    if(S.chat&&ts-S.chat.t0<900)return;      /* chống bấm dồn */
    say(ts,Math.random()<.35?'gianDu':'cham');
    S.act=null;S.nextAct=ts+rr(CFG.idle)+900;                       /* dừng đi lại để phản ứng */
    S.nextChat=ts+S.chat.dur+rr(CFG.chat.gap);
  }catch(err){}}

root.TTGSANH={CFG:CFG,LINES:LINES,EMO:EMO,pose:pose,draw:draw,say:function(nhom,text){say(performance.now(),nhom||'meo',text);}};
})(window);
