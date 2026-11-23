/* ===== 84-chu-tran.js (TTGCHU): SỐ SÁT THƯƠNG + CHỮ HIỆU ỨNG TRONG TRẬN =====
   Thay đoạn vẽ chữ nhỏ cũ (bold 18px bay từ giữa thân thú) trong index.html. Dữ liệu vẫn là st.fx = [{x,y,t,s,c}] như cũ (không đổi chỗ nào đẩy fx).
   - SỐ sát thương / hồi máu (chuỗi kết thúc bằng -N hoặc +N): chữ ĐẬM TO, mọc ngay ĐẦU thú rồi bay lên. Tiền tố như "Phản đòn", "Liên kích", "Khiên" tách thành chữ hiệu ứng nhỏ.
   - CHỮ hiệu ứng (Chí mạng!, Né!, Hụt!, Khắc hệ! ×1.5, Choáng, Mù, Đối kháng!...): cùng kiểu chữ CHIẾN!/THẮNG! (viền tối dày, viền màu, ruột gradient, vầng sáng, lao vào rồi ổn định) nhưng NHỎ, xếp chồng lên TRÊN đầu thú (không che thân); nhiều chữ cùng lúc thì xếp tầng, số nằm dưới chữ.
   CHỈNH: khối CFG. Màu mỗi chữ lấy từ trường c của fx (đổi màu ở chỗ index.html đẩy fx), nên không cần bảng riêng.
   API: TTGCHU.fx(ctx, ts, danhSachFx, {px:{me,en}, head:{me,en}, mid, top}) - vẽ + không giữ trạng thái. Lỗi bị nuốt (try/catch). */
(function(root){'use strict';
var CFG={
  life:1100,                 /* thời gian sống 1 chữ (ms); index.html lọc fx theo con số này (+ chút dư) */
  numSize:27,numRise:38,numStart:2,          /* số: cỡ chữ, bay lên bao nhiêu điểm, bắt đầu cao hơn đỉnh đầu bấy nhiêu */
  lblSize:14,lblRise:12,lblStart:30,lblGap:15,lblMax:4,   /* chữ: cỡ, bay lên, bắt đầu cao hơn đỉnh đầu, khoảng cách giữa các tầng, tối đa tầng */
  maxW:120                   /* chữ dài hơn mức này (điểm game) thì tự co lại */
};
var FONT='italic 900 {S}px "Noto Serif",Georgia,serif';
function F(s){return FONT.replace('{S}',Math.max(6,Math.round(s)));}
function eo(x){x=x<0?0:x>1?1:x;return 1-Math.pow(1-x,3);}
/* pop kiểu CHIẾN: lao vào từ to, chạm đáy rồi ổn định */
function pop(l,big){if(l<=0)return big;if(l<130)return big-(big-.9)*eo(l/130);if(l<230)return .9+.1*eo((l-130)/100);return 1;}
/* trộn màu #rgb/#rrggbb với màu khác */
function rgb(h){h=String(h||'#d11');if(h.charAt(0)!=='#')return[221,17,17];if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];var n=parseInt(h.slice(1),16);return isNaN(n)?[221,17,17]:[n>>16&255,n>>8&255,n&255];}
function mix(a,b,k){return 'rgb('+Math.round(a[0]+(b[0]-a[0])*k)+','+Math.round(a[1]+(b[1]-a[1])*k)+','+Math.round(a[2]+(b[2]-a[2])*k)+')';}
var CC={};
function pal(c){var p=CC[c];if(p)return p;var a=rgb(c),W=[255,255,255],B=[0,0,0];
  return CC[c]={a:mix(a,W,.78),b:mix(a,W,.12),c:mix(a,B,.42),line:mix(a,B,.78),glow:c};}

/* vẽ 1 chữ kiểu CHIẾN! thu nhỏ tại (x,y) (tâm chữ), sc = hệ số pop, al = độ đậm */
function glyph(ctx,txt,x,y,fs,sc,al,P,maxW){
  ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);ctx.globalAlpha=Math.max(0,al);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.miterLimit=2;ctx.font=F(fs);
  if(maxW){var w=ctx.measureText(txt).width;if(w>maxW){fs=fs*maxW/w;ctx.font=F(fs);}}
  ctx.shadowColor=P.glow;ctx.shadowBlur=fs*.4;ctx.lineWidth=Math.max(2,fs*.2);ctx.strokeStyle=P.line;ctx.strokeText(txt,0,0);   /* viền tối dày + vầng sáng */
  ctx.shadowBlur=0;ctx.lineWidth=Math.max(1,fs*.09);ctx.strokeStyle=P.c;ctx.strokeText(txt,0,0);                                  /* viền màu */
  var g=ctx.createLinearGradient(0,-fs*.5,0,fs*.5);g.addColorStop(0,P.a);g.addColorStop(.5,P.b);g.addColorStop(1,P.c);ctx.fillStyle=g;ctx.fillText(txt,0,0);   /* ruột gradient */
  ctx.lineWidth=Math.max(.6,fs*.012);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.strokeText(txt,0,0);
  ctx.restore();}

function fx(ctx,ts,list,o){
  try{
    var i,f,age,side,items=[],L=CFG.life,m,pre,num,txt;
    for(i=0;i<list.length;i++){f=list[i];age=ts-f.t;if(age<0||age>=L)continue;
      side=(o.px&&Math.abs(f.x-o.px.me)<4)?'me':(o.px&&Math.abs(f.x-o.px.en)<4)?'en':'mid';
      m=/^(.*?)\s*([-+]\d+)$/.exec(String(f.s));
      if(m){num=m[2];pre=m[1];}else{num=null;pre=String(f.s);}
      if(pre)items.push({k:'l',f:f,side:side,age:age,s:pre,x:f.x,seq:i});
      if(num)items.push({k:'n',f:f,side:side,age:age,s:num,x:f.x,seq:i});}
    if(!items.length)return;
    /* xếp tầng cho chữ cùng bên (theo thứ tự xuất hiện), số cùng bên lệch ngang để không đè nhau */
    var cnt={me:{l:0,n:0},en:{l:0,n:0},mid:{l:0,n:0}};
    items.sort(function(a,b){return a.f.t-b.f.t||a.seq-b.seq;});   /* tầng tính từ chữ CŨ nhất (sát đầu) lên chữ mới (cao hơn) */
    ctx.save();
    for(i=0;i<items.length;i++){var it=items[i],c=cnt[it.side],hy=(o.head&&o.head[it.side]!=null)?o.head[it.side]:(o.mid||0),P=pal(it.f.c||'#ff4b3c'),sc,al,y,x=it.x;
      al=Math.min(1,it.age/60)*(1-Math.max(0,(it.age-L*.72)/(L*.28)));
      if(it.k==='n'){
        var j=c.n++,dxn=j?((j%2?1:-1)*Math.ceil(j/2)*16):0;
        sc=pop(it.age,1.7);y=hy-CFG.numStart-CFG.numRise*eo(it.age/L);x+=dxn;
        glyph(ctx,it.s,x,y,CFG.numSize,sc,al,P,0);
      }else{
        var s=Math.min(c.l++,CFG.lblMax-1);
        sc=pop(it.age,2);y=hy-CFG.lblStart-s*CFG.lblGap-CFG.lblRise*eo(it.age/L);
        if(o.top!=null&&y<o.top)y=o.top;
        glyph(ctx,it.s,x,y,CFG.lblSize,sc,al,P,CFG.maxW);
      }}
    ctx.restore();
  }catch(e){try{ctx.restore();}catch(e2){}}}

root.TTGCHU={CFG:CFG,fx:fx};
})(window);
