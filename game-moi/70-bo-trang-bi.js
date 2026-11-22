/* 70-bo-trang-bi.js — LUẬT BỘ TRANG BỊ TRONG TRẬN (chép luật từ main: 12-equip.js EQ_SETS + EQFX), KHÔNG vẽ aura.
   17 bộ ứng với 17 vùng z (0..16). Mặc >=2 món cùng bộ: buff v2; đủ 4 món: buff v4. Giá trị nhân (1 + z*0,03) và (1 + phẩm trung bình các món cùng bộ) như main (phẩm đọc từ trường q của món, thiếu = Phàm).
   Món trang bị khai trường  bo = số vùng (0..16)  (vd {slot:0,bo:11,...} = món bộ Dung Nham). Đọc món đang mặc qua TTGTB.dangMac().
   XEM THỬ không cần đồ: thêm ?bo=11 (hoặc ?bo=lava) vào link game = người chơi mang đủ 4 món bộ đó.
   Sự kiện kích hoạt: hiện CHỮ tên sự kiện trên đầu thú chủ bộ; Dung Nham / Lôi Phạt / Phong Nhận / Nguyệt Ảnh còn chạy hiệu ứng đòn (31 + 33..40) với đúng nhãn của main.
   Cách nối với index.html: TTGBO.attach(env) một lần; TTGBO.start() đầu trận; hit() gọi pre/dodge/crit/mod/after; fin() gọi round/dead; vòng vẽ gọi draw.
   env = { st(): trạng thái trận, eff(side): chỉ số hiện tại (effS), px(side), gy(), hurt(side,d,now,màu): trừ máu có qua khiên, eStats(): chỉ số gốc của địch, fxText(side,nhãn): chạy hiệu ứng đòn có nhãn }.
   Khác main vì trận demo chạy thanh thời gian thật (không có "hiệp"): "cuối hiệp" = ngay sau lượt đánh của chính bên có bộ; "né đòn" = đòn của địch bị Mù/Vân Ẩn làm hụt.
   Chưa có trong demo nên bộ nào cần cũng chưa chạy: Tinh Quang chỉ nổ khi chí mạng (hiện chỉ U Ảnh Ám Sát gây chí mạng). */
(function(root){
'use strict';
var ZSTEP=.03,K=['frost','mist','cloud','wind','thunder','counter','sun','shield','thorn','revive','grove','lava','ambush','star','first','weaken','judge'];
/* ch = tỉ lệ kích hoạt (%), pct/mul = độ mạnh (%) — đúng số của main */
var SETS=[
 {k:'frost',  ten:'Băng Phong',          v2:{ch:12},        v4:{ch:25}},
 {k:'mist',   ten:'Sương Tán',           v2:{ch:15},        v4:{ch:30}},
 {k:'cloud',  ten:'Vân Ẩn',              v2:{ch:15},        v4:{ch:30}},
 {k:'wind',   ten:'Phong Nhận',          v2:{ch:15,pct:60}, v4:{ch:30,pct:90}},
 {k:'thunder',ten:'Lôi Phạt',            v2:{ch:12,pct:40}, v4:{ch:25,pct:80}},
 {k:'counter',ten:'Nguyệt Ảnh',          v2:{ch:30,mul:80}, v4:{ch:60,mul:120}},
 {k:'sun',    ten:'Dương Diệm',          v2:{pct:20},       v4:{pct:40}},
 {k:'shield', ten:'Uyên Khiên',          v2:{pct:12},       v4:{pct:24}},
 {k:'thorn',  ten:'Kim Cương Phản Chấn', v2:{ch:20,pct:50}, v4:{ch:40,pct:80}},
 {k:'revive', ten:'Ngọc Hộ Mệnh',        v2:{pct:15},       v4:{pct:35}},
 {k:'grove',  ten:'Sinh Cơ Cổ Thụ',      v2:{pct:2},        v4:{pct:4}},
 {k:'lava',   ten:'Dung Nham Phun Trào', v2:{ch:20,pct:120},v4:{ch:40,pct:180}},
 {k:'ambush', ten:'U Ảnh Ám Sát',        v2:{ch:50},        v4:{ch:100}},
 {k:'star',   ten:'Tinh Quang Bùng Nổ',  v2:{pct:30},       v4:{pct:60}},
 {k:'first',  ten:'Thiên Uy',            v2:{pct:25},       v4:{pct:50}},
 {k:'weaken', ten:'Phấn Hoa Suy Yếu',    v2:{pct:8},        v4:{pct:18}},
 {k:'judge',  ten:'Thần Phán',           v2:{pct:25},       v4:{pct:50}}];
/* chữ sự kiện hiện trên đầu thú chủ bộ: [tên hiển thị, màu] */
var EV={thunder:['Lôi Phạt Giáng Xuống','#ffe53a'],wind:['Phong Nhận Chém Thêm','#a0ffd0'],lava:['Dung Nham Phun Trào','#ff8a3a'],counter:['Nguyệt Ảnh Phản Kích','#b8a8ff'],
 grove:['Sinh Cơ Cổ Thụ','#8be04a'],revive:['Ngọc Hộ Mệnh','#ffe27a'],cloud:['Vân Ẩn','#c9d8ff'],mist:['Sương Tán','#9fd9c8'],sun:['Dương Diệm','#ffb84a'],
 judge:['Thần Phán','#ffd24a'],star:['Tinh Quang','#c08aff'],first:['Thiên Uy','#fff0a0'],frost:['Băng Phong','#9fe4ff'],thorn:['Phản Chấn','#9fd0ff']};
var QB=[0,.10,.22,.38,.60];   /* phẩm Phàm/Linh/Địa/Thiên/Thần cộng thêm cho buff bộ (EQ_QBONUS của main); lấy trung bình phẩm các món cùng bộ */
var EV_MS=1500,env=null;
function r1(x){return Math.round(x*10)/10;}
function scale(v,z,qb){var o={},zm=1+(z||0)*ZSTEP;qb=qb||0;for(var k in v){o[k]=r1(v[k]*(1+qb)*zm);if(k==='ch')o[k]=Math.min(100,o[k]);}return o;}
function forced(){try{var m=/[?&]bo=([\w-]+)/.exec(root.location.search);if(!m)return null;var v=m[1],z=/^\d+$/.test(v)?+v:K.indexOf(v);return z>=0&&z<K.length?z:null;}catch(e){return null;}}
/* các bộ đang kích hoạt của người chơi: [{z,k,ten,n,full,v}] */
function sets(){
 var f=forced(),out=[],cnt={},qs={},l,z;
 if(f!=null)return [{z:f,k:SETS[f].k,ten:SETS[f].ten,n:4,full:true,v:scale(SETS[f].v4,f)}];
 try{l=root.TTGTB&&root.TTGTB.dangMac?root.TTGTB.dangMac():[];l.forEach(function(t){z=Math.floor(Number(t&&t.bo));if(z>=0&&z<K.length){cnt[z]=(cnt[z]||0)+1;(qs[z]=qs[z]||[]).push(QB[Math.max(0,Math.min(4,Math.floor(Number(t.q)||0)))]);}});}catch(e){}
 for(z in cnt){var n=cnt[z];if(n>=2){var S=SETS[+z],qb=qs[z].reduce(function(a,b){return a+b;},0)/qs[z].length;out.push({z:+z,k:S.k,ten:S.ten,n:n,full:n>=4,v:scale(n>=4?S.v4:S.v2,+z,qb)});}}
 return out;}
function attach(e){env=e;}
function S0(){return env&&env.st?env.st():null;}
function opp(w){return w==='me'?'en':'me';}
function A(w){var s=S0();return s&&s.bo&&s.bo[w]||null;}
function mx(w){var s=S0();return w==='me'?s.maxMe:s.maxEn;}
function say(w,k,n){var s=S0(),e=EV[k];if(!s||!s.bo||!e)return;s.bo.ev.push({w:w,k:k,t:n});}
function hurt(w,x,n,col){env.hurt(w,x,n,col);}
function heal(w,h,n){var s=S0();s[w]=Math.min(mx(w),s[w]+h);s.fx.push({x:env.px(w),y:env.gy()-135,t:n,s:'+'+h,c:'#3c3'});}
function baseDmg(from,to){var a=env.eff(from),z=env.eff(to);return root.TTGCS?root.TTGCS.satThuong({tc:a.tc,pt:z.pt,hsHe:1}):1;}
function stunned(w){var s=S0();return (w==='me'?s.stun:s.stunEn)>0;}
/* ĐẦU TRẬN: gọi sau khi st đã tạo */
function start(){
 var s=S0();if(!s)return;
 var me={fx:sets().map(function(x){return {k:x.k,v:x.v};}),rv:0,rvP:0,ac:0,open:0,cloud:0};
 s.bo={me:me,en:{fx:[],rv:0,rvP:0,ac:0,open:0,cloud:0},ev:[]};
 me.fx.forEach(function(f){var v=f.v;
  if(f.k==='shield'){s.shMe=(s.shMe||0)+Math.round(s.maxMe*v.pct/100);s.shMaxMe=Math.max(s.shMaxMe||0,s.shMe);}
  else if(f.k==='weaken'){var z=env.eStats();if(z)z.tc=Math.max(1,Math.round(z.tc*(1-v.pct/100)));}
  else if(f.k==='revive'){me.rv=1;me.rvP=v.pct;}
  else if(f.k==='ambush')me.ac=Math.random()*100<v.ch?1:0;
  else if(f.k==='first'){me.open=v.pct;if(!s.g)s.g={me:1.5,en:1};}   /* thanh me đầy trước nên ra đòn trước */
 });}
/* TRƯỚC ĐÒN của w: bên bị đánh đang ẩn mình trong mây -> đòn trượt (true) */
function pre(w,n){var d=opp(w),b=A(d);if(!b||!b.cloud)return false;b.cloud=0;say(d,'cloud',n);var s=S0();s.fx.push({x:env.px(w),y:env.gy()-110,t:n,s:'Hụt!',c:'#cfd6e6'});return true;}
/* đòn của w bị hụt (Mù): bên bị đánh phản kích (Nguyệt Ảnh) */
function dodge(w,n){
 var s=S0(),d=opp(w),b=A(d);if(!b||s[w]<=0||s[d]<=0)return;
 b.fx.forEach(function(f){if(f.k!=='counter'||s[w]<=0||Math.random()*100>=f.v.ch)return;
  var x=Math.max(1,Math.round(baseDmg(d,w)*f.v.mul/100));hurt(w,x,n,'#b8a8ff');say(d,'counter',n);env.fxText(d,'Nguyệt Ảnh phản kích -'+x);});}
/* đòn đánh đầu tiên chắc chí mạng (U Ảnh Ám Sát): true nếu đòn này chí mạng */
function crit(w){var b=A(w);if(!b||!b.ac)return false;b.ac=0;return true;}
/* chỉnh sát thương đòn thường của w */
function mod(w,dmg,cr,n){
 var s=S0(),a=A(w),d=opp(w),t=A(d),m=1;
 if(a)a.fx.forEach(function(f){var v=f.v;
  if(f.k==='sun'&&s[d]>mx(d)*.6){m*=1+v.pct/100;say(w,'sun',n);}
  else if(f.k==='judge'&&s[d]<mx(d)*.3){m*=1+v.pct/100;say(w,'judge',n);}
  else if(f.k==='star'&&cr){m*=1+v.pct/100;say(w,'star',n);}
  else if(f.k==='first'&&a.open){m*=1+a.open/100;a.open=0;say(w,'first',n);}});
 if(t)t.fx.forEach(function(f){if(f.k==='mist'&&Math.random()*100<f.v.ch){m*=.5;say(d,'mist',n);}});
 return m===1?dmg:Math.max(1,Math.round(dmg*m));}
/* SAU KHI đòn của w đã trúng (dm = sát thương đòn đó) */
function after(w,dm,n){
 if(dm<=0)return;
 var s=S0(),a=A(w),d=opp(w),t=A(d);
 if(a)a.fx.forEach(function(f){var v=f.v,x;if(s[d]<=0)return;
  if(f.k==='thunder'&&Math.random()*100<v.ch){x=Math.max(1,Math.round(dm*(1+v.pct/100)));hurt(d,x,n,'#ffe53a');say(w,'thunder',n);env.fxText(w,'Lôi Phạt giáng xuống -'+x);}
  else if(f.k==='wind'&&Math.random()*100<v.ch){x=Math.max(1,Math.round(dm*v.pct/100));hurt(d,x,n,'#a0ffd0');say(w,'wind',n);env.fxText(w,'Phong Nhận chém thêm -'+x);}});
 if(t)t.fx.forEach(function(f){var v=f.v,x;if(s[w]<=0)return;
  if(f.k==='frost'&&!stunned(w)&&Math.random()*100<v.ch){if(w==='me')s.stun=1;else s.stunEn=1;say(d,'frost',n);}
  else if(f.k==='thorn'&&Math.random()*100<v.ch){x=Math.max(1,Math.round(dm*v.pct/100));hurt(w,x,n,'#9fd0ff');say(d,'thorn',n);}});}
/* CUỐI LƯỢT của w (thay cho "cuối hiệp" của main) */
function round(w,n){
 var s=S0(),a=A(w),d=opp(w);if(!a)return;n=n||performance.now();
 a.fx.forEach(function(f){var v=f.v;if(s[w]<=0||s[d]<=0)return;
  if(f.k==='grove'){var p=v.pct*(s[w]<mx(w)*.5?2:1),h=Math.min(mx(w)-s[w],Math.round(mx(w)*p/100));if(h>0){heal(w,h,n);say(w,'grove',n);}}
  else if(f.k==='lava'&&Math.random()*100<v.ch){var x=Math.max(1,Math.round(env.eff(w).tc*v.pct/100));hurt(d,x,n,'#ff8a3a');say(w,'lava',n);env.fxText(w,'Dung Nham Phun Trào -'+x);}
  else if(f.k==='cloud'&&Math.random()*100<v.ch)a.cloud=1;});}
/* TRƯỚC KHI XÉT THẮNG/THUA: bên nào gục mà còn Ngọc Hộ Mệnh thì hồi sinh (1 lần/trận) */
function dead(n){
 var s=S0();n=n||performance.now();
 ['me','en'].forEach(function(w){var b=A(w);if(s[w]>0||!b||!b.rv)return;b.rv=0;s[w]=Math.max(1,Math.round(mx(w)*b.rvP/100));say(w,'revive',n);s.fx.push({x:env.px(w),y:env.gy()-135,t:n,s:'+'+s[w],c:'#3c3'});});}
/* vẽ chữ sự kiện trên đầu thú chủ bộ: hiện nhanh, giữ, mờ dần, nhiều sự kiện cùng bên thì xếp chồng */
function draw(g,ts){
 var s=S0();if(!s||!s.bo||!s.bo.ev.length)return;
 s.bo.ev=s.bo.ev.filter(function(e){return ts-e.t<EV_MS;});
 var used={me:0,en:0};
 g.save();g.font='bold 14px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=4;
 s.bo.ev.forEach(function(e){var u=Math.max(0,(ts-e.t)/EV_MS);if(ts<e.t)return;
  var al=Math.min(1,u/.08,(1-u)/.3+.1),x=env.px(e.w),y=env.gy()-160-used[e.w]*16-u*10;used[e.w]++;
  g.globalAlpha=Math.max(0,Math.min(1,al));g.strokeStyle='rgba(16,8,24,.92)';g.strokeText(EV[e.k][0],x,y);g.fillStyle=EV[e.k][1];g.fillText(EV[e.k][0],x,y);});
 g.restore();}
root.TTGBO={KINDS:K,SETS:SETS,sets:sets,attach:attach,start:start,pre:pre,dodge:dodge,crit:crit,mod:mod,after:after,round:round,dead:dead,draw:draw};
})(typeof window!=='undefined'?window:globalThis);
