/* 74-ren-cuong-hoa.js - GIAO DIỆN + thao tác của khung RÈN và khung CƯỜNG HÓA (khung ảnh ở 72-khung-ren-cuong-hoa.js, luật ở 73-luat-trang-bi.js).
   Nạp SAU 72 và 73. Dùng móc TTGKH.on('open'|'close'|'btn'|'pick') + TTGKH.frame(k).
   RÈN:  3 ô tam giác = Tinh Hoa boss (trên) / nguyên liệu chính của món (trái) / Linh Cốt (phải), số "có/cần" từng ô; ô to giữa = món sẽ rèn + giá Tinh Thạch.
         Cột giữa 8 ô: cột trái = chọn 1 trong 4 món (Vũ Khí/Giáp/Vòng/Ngọc), cột phải = chỉ số mặc định của món (Phàm~Thần). Nút "Bộ Trang Bị" = chọn bộ (17 vùng). Nút "Rèn" = rèn (gacha phẩm).
         Túi bên phải = túi Trang bị (đồ rèn ra vào đây). Chạm 1 món trong túi để xem chỉ số.
   CƯỜNG HÓA: ô to trên = món đang chọn (+cấp); vòng: trái = Đá Cường Hóa (chạm: đổi sang đá bậc 6 nếu được), phải = Vé Bảo Hộ (chạm: bật/tắt), dưới = Đá Ngũ Sắc (chạm: +1 viên, tối đa tới 100%).
         Bảng giữa = chỉ số trước -> sau, tỉ lệ, giá. Nút "Chọn Trang Bị" = danh sách trang bị (cả đang mặc). Nút "Đập" = cường hóa. Túi bên phải = Balo: chạm đá/vé cũng đặt vào vòng. */
(function(root){
'use strict';
if(!root.TTGKH||!root.TTGLT||!root.TTGKH.on)return;
var KH=root.TTGKH,LT=root.TTGLT,S={z:0,s:0,sel:null,tier:0,rb:0,tk:false,busyR:false,busyC:false,flash:null},W={};
function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function img(s){return s?'<img src="'+esc(s)+'" alt="" draggable="false">':'';}
function toast(t){if(root.TTGTBAO&&TTGTBAO.toast)TTGTBAO.toast(t,2600);else console.log('[TTG]',t);}
function css(){if(document.querySelector('style[data-lt]'))return;var s=document.createElement('style');s.setAttribute('data-lt','1');
 s.textContent='.lt-n{position:absolute;left:0;right:0;bottom:3%;text-align:center;font-size:calc(var(--u)*17);font-weight:800;line-height:1.05;color:#fff;text-shadow:0 1px 2px #000,0 0 3px #000;pointer-events:none}'+
 '.lt-z{position:absolute;left:0;right:0;top:3%;text-align:center;font-size:calc(var(--u)*17);font-weight:800;color:#ffe58a;text-shadow:0 1px 2px #000,0 0 3px #000;pointer-events:none;white-space:nowrap}'+
 '.lt-e{position:absolute;right:7%;top:5%;font-size:calc(var(--u)*26);font-weight:900;color:#ffe53a;text-shadow:0 1px 2px #000,0 0 4px #000;pointer-events:none}'+
 '.lt-r{text-align:center;font-size:calc(var(--u)*20);line-height:1.25;color:#cfe6ff;text-shadow:0 1px 2px #000;pointer-events:none}.lt-r b{color:#ffe58a}'+
 '.lt-info{padding:calc(var(--u)*16) calc(var(--u)*18);font-size:calc(var(--u)*21);line-height:1.38;color:#dfe6ff;overflow:auto;text-shadow:0 1px 2px rgba(0,0,0,.7)}'+
 '.lt-nm{font-size:calc(var(--u)*27);font-weight:800;line-height:1.15;text-align:center}.lt-sm{text-align:center;color:#9fe4ff;font-size:calc(var(--u)*18);margin-bottom:calc(var(--u)*6)}'+
 '.lt-lv{text-align:center;font-size:calc(var(--u)*30);font-weight:900;color:#ffe58a;margin:calc(var(--u)*4) 0}.lt-lv b{color:#7dffb0}'+
 '.lt-ln{display:flex;justify-content:space-between;gap:calc(var(--u)*8)}.lt-ln i{color:#7dffb0;font-style:normal}'+
 '.lt-rt{margin-top:calc(var(--u)*8);font-size:calc(var(--u)*23);text-align:center}.lt-rt b{color:#ffe58a}'+
 '.lt-sm2{font-size:calc(var(--u)*18);color:#b7c2ee;margin-top:calc(var(--u)*5)}.lt-em{text-align:center;color:#9aa6d8;margin-top:calc(var(--u)*60)}.lt-bad{color:#ff9a8a}.lt-good{color:#9dffb8}'+
 '.lt-ov{display:none;background:rgba(4,8,36,.97);border:calc(var(--u)*3) solid #d9b13c;border-radius:calc(var(--u)*12);padding:calc(var(--u)*10);overflow-y:auto;z-index:6;font-size:calc(var(--u)*20);color:#e8ecff}.lt-ov.on{display:block}'+
 '.lt-ov h5{margin:0 0 calc(var(--u)*8);text-align:center;color:#ffe58a;font-size:calc(var(--u)*24)}.lt-g{display:grid;grid-template-columns:repeat(2,1fr);gap:calc(var(--u)*8)}'+
 '.lt-b{display:flex;align-items:center;gap:calc(var(--u)*8);text-align:left;padding:calc(var(--u)*6) calc(var(--u)*8)!important;border:calc(var(--u)*2) solid #75613b!important;border-radius:calc(var(--u)*10);background:#162a55!important;color:#e8ecff;font-size:calc(var(--u)*18);font-weight:700;line-height:1.15}'+
 '.lt-b.on{border-color:#72e4b0!important;background:#1a3a32!important}.lt-bi{flex:none;width:calc(var(--u)*50);height:calc(var(--u)*50);display:flex;align-items:center;justify-content:center}.lt-bi img{width:100%;height:100%;object-fit:contain}'+
 '.lt-cl{justify-content:center;margin:calc(var(--u)*10) auto 0;width:50%}'+
 '@keyframes ltok{0%{box-shadow:0 0 0 0 rgba(120,255,170,0)}40%{box-shadow:0 0 calc(var(--u)*40) calc(var(--u)*14) rgba(120,255,170,.95)}100%{box-shadow:0 0 0 0 rgba(120,255,170,0)}}'+
 '@keyframes ltbad{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}'+
 '.kh-c.lt-ok{animation:ltok .9s ease-out}.kh-c.lt-bad{animation:ltbad .6s;box-shadow:0 0 calc(var(--u)*30) calc(var(--u)*8) rgba(255,90,70,.8)}.kh-c.lt-on{box-shadow:0 0 0 calc(var(--u)*3) #7dffb0,0 0 calc(var(--u)*14) calc(var(--u)*4) rgba(125,255,176,.7)}';
 document.head.appendChild(s);}
function mk(p,cls,x,y,w,h){var el=document.createElement('div'),d=p.d,st=el.style;el.className=cls;st.left=(x/d.w*100)+'%';st.top=(y/d.h*100)+'%';st.width=(w/d.w*100)+'%';st.height=(h/d.h*100)+'%';p.fr.appendChild(el);return el;}
function cnt(id){return root.TTGBALO?TTGBALO.count(id):0;}
function nm(id){var c=root.TTGBALO&&TTGBALO.CAT[id];return c?c.ten:id;}
function cellHtml(id,have,need){var ok=have>=need;return '<span class="kh-i">'+img(LT.itemImg(id))+'</span><span class="kh-q" style="color:'+(ok?'#9dffb8':'#ff9a8a')+'">'+have+'/'+need+'</span>';}
function fmt(k,v){return '+'+v+(LT.STATS[k].t==='p'?'%':'');}
function qcol(q){return 'rgb('+LT.QC[q]+')';}
/* ===================== RÈN ===================== */
function renRender(){
  var w=W.ren;if(!w)return;var sl=w.p.slots,z=S.z,s=S.s,c=LT.check(z,s),I=c.ids,n=c.need,tt=root.TTGTIEN?TTGTIEN.get('tt'):0,r,t,i;
  [[sl.top[0],I.boss,n.boss],[sl.side[0],I.main,n.main],[sl.side[1],I.shared,n.shared]].forEach(function(a){a[0].el.innerHTML=cellHtml(a[1],cnt(a[1]),a[2]);a[0].el.title=nm(a[1]);});
  var m=sl.main[0].el;
  if(S.flash){m.innerHTML='<span class="kh-i" style="width:90%;height:90%">'+img(S.flash.img)+'</span>';m.style.boxShadow='0 0 30px 10px '+qcol(S.flash.q);}
  else{m.style.boxShadow='';m.innerHTML='<span class="lt-z" style="color:'+LT.zoneCol(z)+'">'+esc(LT.zoneName(z))+'</span><span class="kh-i">'+img(LT.eqImg(z,s))+'</span><span class="kh-t" style="color:'+(tt>=n.xu?'#bfffd0':'#ff9a8a')+'">'+n.xu+' TT</span>';}
  m.title=LT.PIECE[s].n+' '+LT.zoneName(z)+' · bộ '+LT.setName(z);
  for(i=0;i<4;i++){
    var L=sl.set[2*i].el,R=sl.set[2*i+1].el;
    L.innerHTML='<span class="kh-i" style="width:56%;height:56%;margin-top:-8%">'+img(LT.eqImg(z,i))+'</span><span class="lt-n">'+LT.PIECE[i].n+'</span>';L.classList.toggle('sel',i===s);L.title=LT.PIECE[i].n+' '+LT.zoneName(z);
    t=LT.mainRange(z,i);r=t.indexOf(' +');R.innerHTML='<span class="lt-r"><b>'+esc(t.slice(0,r))+'</b><br>'+esc(t.slice(r+1))+'<br><small>(mặc định)</small></span>';
  }
}
function renZone(){
  var w=W.ren,h='<h5>Chọn bộ trang bị</h5><div class="lt-g">',z;
  for(z=0;z<LT.ZN.length;z++)h+='<button type="button" class="lt-b'+(z===S.z?' on':'')+'" data-z="'+z+'"><span class="lt-bi">'+img(LT.eqImg(z,0))+'</span><span style="color:'+LT.zoneCol(z)+'">'+(z+1)+'. '+esc(LT.zoneName(z))+'<br><small style="color:#9fe4ff">'+esc(LT.setName(z))+'</small></span></button>';
  w.ov.innerHTML=h+'</div><button type="button" class="lt-b lt-cl" data-cl="1">Đóng</button>';w.ov.classList.add('on');}
function renDo(){
  if(S.busyR)return;var r=LT.ren(S.z,S.s);
  if(r.err){toast(r.err);renRender();return;}
  var it=r.item;S.busyR=true;S.flash={img:it.img,q:it.q};renRender();KH.refresh('ren');
  toast('Rèn ra ['+LT.QN[it.q]+' phẩm] '+it.ten.replace(/^\[[^\]]*\]\s*/,'')+(it.q>=3?' - Món hiếm!':'')+': '+LT.lines(it).map(LT.lineTxt).join(' · '));
  setTimeout(function(){S.flash=null;S.busyR=false;if(KH.current()==='ren')renRender();},1800);}
/* ===================== CƯỜNG HÓA ===================== */
function chCtx(){
  var it=S.sel&&root.TTGTB&&TTGTB.get(S.sel);if(!it||it.z==null){S.sel=null;return null;}
  var e=it.e||0;if(e>=LT.ENH.MAX)return {it:it,e:e,maxed:true};
  var tiers=LT.tierOf(it.z),tier=tiers.indexOf(S.tier)>=0?S.tier:tiers[0],n=LT.enhNeed(e),sid='da_ch'+tier,rbHave=cnt('da_ngu_sac'),rbLim=Math.min(rbHave,LT.rbMax(e)),rb=Math.min(S.rb,rbLim),tkHave=cnt('ve_bao_ho');
  return {it:it,e:e,tiers:tiers,tier:tier,n:n,sid:sid,have:cnt(sid),rbHave:rbHave,rbLim:rbLim,rb:rb,tkHave:tkHave,tk:S.tk&&tkHave>0,rate:LT.rateAt(e,rb),tt:root.TTGTIEN?TTGTIEN.get('tt'):0};}
function chInfo(X){
  if(!X)return '<div class="lt-em">Chạm nút <b>Chọn Trang Bị</b> bên dưới để chọn món cần cường hóa.<br><br>Rồi chạm Đá Cường Hóa, Đá Ngũ Sắc, Vé Bảo Hộ trong túi để đặt vào vòng.</div>';
  var it=X.it,h='<div class="lt-nm" style="color:'+qcol(it.q)+'">'+esc(it.ten)+'</div><div class="lt-sm">Bộ '+esc(LT.setName(it.z))+' · mặc từ cấp '+LT.zbStart(it.z)+'</div>',cur=LT.lines(it),nx,i;
  if(X.maxed){h+='<div class="lt-lv">Đã đạt <b>+'+LT.ENH.MAX+'</b> (tối đa)</div>';cur.forEach(function(l){h+='<div class="lt-ln"><span>'+LT.STATS[l[0]].n+'</span><b>'+fmt(l[0],l[1])+'</b></div>';});return h;}
  nx=LT.lines(it,X.e+1);h+='<div class="lt-lv">+'+X.e+' → <b>+'+(X.e+1)+'</b></div>';
  for(i=0;i<cur.length;i++)h+='<div class="lt-ln"><span>'+LT.STATS[cur[i][0]].n+'</span><b>'+fmt(cur[i][0],cur[i][1])+' → <i>'+fmt(cur[i][0],nx[i][1])+'</i></b></div>';
  h+='<div class="lt-rt">Thành công <b>'+X.rate+'%</b>'+(X.rb?' <small>(Ngũ Sắc x'+X.rb+')</small>':'')+'</div>';
  h+='<div class="lt-sm2 '+(X.have>=X.n.stone?'lt-good':'lt-bad')+'">'+esc(nm(X.sid))+': '+X.have+'/'+X.n.stone+'</div><div class="lt-sm2 '+(X.tt>=X.n.xu?'lt-good':'lt-bad')+'">Tinh Thạch: '+X.tt+'/'+X.n.xu+'</div>';
  h+='<div class="lt-sm2">'+(X.e>=LT.ENH.DROP_FROM?(X.tk?'Thất bại: giữ +'+X.e+' (mất 1 Vé Bảo Hộ).':'Thất bại: <span class="lt-bad">tụt xuống +'+(X.e-1)+'</span>.'):'Thất bại: giữ +'+X.e+' (dưới +'+LT.ENH.DROP_FROM+' không tụt, không mất vé).')+'</div>';
  if(X.tiers.length>1)h+='<div class="lt-sm2">Đang dùng đá bậc '+X.tier+'. Chạm ô Đá để đổi bậc '+X.tiers.join('/')+'.</div>';
  return h;}
function chRender(){
  var w=W.ch;if(!w)return;var sl=w.p.slots,X=chCtx(),m=sl.main[0].el,a=sl.ring[0].el,b=sl.ring[1].el,c=sl.ring[2].el;
  if(X){m.innerHTML='<span class="kh-i" style="width:88%;height:88%">'+img(X.it.img)+'</span>'+(X.e>0?'<span class="lt-e">+'+X.e+'</span>':'');m.title=X.it.ten;}
  else{m.innerHTML='';m.title='';}
  if(X&&!X.maxed){
    a.innerHTML=cellHtml(X.sid,X.have,X.n.stone);a.title=nm(X.sid);
    b.innerHTML='<span class="kh-i">'+img(LT.itemImg('ve_bao_ho'))+'</span><span class="kh-q" style="color:'+(X.tk?'#9dffb8':'#cfd6e6')+'">'+(X.tk?'Bật ':'')+'x'+X.tkHave+'</span>';b.classList.toggle('lt-on',X.tk);b.title='Vé Bảo Hộ';
    c.innerHTML='<span class="kh-i">'+img(LT.itemImg('da_ngu_sac'))+'</span><span class="kh-q" style="color:'+(X.rb?'#9dffb8':'#cfd6e6')+'">'+X.rb+'/'+X.rbLim+'</span>';c.classList.toggle('lt-on',X.rb>0);c.title='Đá Ngũ Sắc (có '+X.rbHave+')';
  }else{a.innerHTML=b.innerHTML=c.innerHTML='';b.classList.remove('lt-on');c.classList.remove('lt-on');a.title=b.title=c.title='';}
  w.info.innerHTML=chInfo(X);}
function chPick(){
  var w=W.ch,list=(root.TTGTB?TTGTB.list():[]).filter(function(t){return t.z!=null&&LT.PIECE[t.s];}),eq=root.TTGTB&&TTGTB.equipped?TTGTB.equipped():{},mac={},k;
  for(k in eq)mac[eq[k]]=1;
  list.sort(function(x,y){return y.z-x.z||y.q-x.q||x.s-y.s;});
  w.ov.innerHTML='<h5>Chọn trang bị</h5>'+(list.length?'<div class="lt-g">'+list.map(function(t){return '<button type="button" class="lt-b'+(t.uid===S.sel?' on':'')+'" data-u="'+esc(t.uid)+'"><span class="lt-bi">'+img(t.img)+'</span><span style="color:'+qcol(t.q)+'">'+esc(t.ten)+(mac[t.uid]?' ★':'')+'</span></button>';}).join('')+'</div>':'<div class="lt-em">Bạn chưa có trang bị nào.<br>Hãy rèn ở mục Rèn.</div>')+'<button type="button" class="lt-b lt-cl" data-cl="1">Đóng</button>';
  w.ov.classList.add('on');}
function msgOf(r){return r.ok?'Cường hóa THÀNH CÔNG! +'+r.e+' → +'+r.e2:r.saved?'Thất bại, nhưng Vé Bảo Hộ giữ nguyên +'+r.e+' (mất đá, Tinh Thạch và 1 vé)':r.e2<r.e?'Thất bại! Tụt xuống +'+r.e2+' (mất đá và Tinh Thạch)':'Thất bại! Giữ nguyên +'+r.e+' (mất đá và Tinh Thạch)';}
function chDo(){
  if(S.busyC)return;var X=chCtx();
  if(!X){toast('Hãy chọn một món trang bị trước.');return;}
  if(X.maxed){toast('Món này đã đạt cấp tối đa +'+LT.ENH.MAX+'.');return;}
  var r=LT.cuongHoa(S.sel,{tier:X.tier,rb:X.rb,ticket:X.tk});
  if(r.err){toast(r.err);chRender();return;}
  S.busyC=true;S.rb=0;try{window.TTGNHIEMVU&&TTGNHIEMVU.sk('cuonghoa');}catch(_){}var el=W.ch.p.slots.main[0].el,cl=r.ok?'lt-ok':'lt-bad';el.classList.add(cl);
  setTimeout(function(){el.classList.remove(cl);S.busyC=false;toast(msgOf(r)+(r.rate<100?' (tỉ lệ '+r.rate+'%)':''));KH.refresh('ch');if(KH.current()==='ch')chRender();},900);}
function chRbCycle(){var X=chCtx();if(!X||X.maxed)return;if(X.rbHave<1){toast('Chưa có Đá Ngũ Sắc');return;}S.rb=X.rb>=X.rbLim?0:X.rb+1;chRender();}
function chTkToggle(){var X=chCtx();if(!X||X.maxed)return;if(X.tkHave<1){toast('Chưa có Vé Bảo Hộ');return;}S.tk=!S.tk;chRender();}
function chTierCycle(){var X=chCtx();if(!X||X.maxed)return;if(X.tiers.length<2){toast(nm(X.sid)+' (món vùng này chỉ dùng đá bậc '+X.tier+')');return;}S.tier=X.tier===X.tiers[0]?X.tiers[1]:X.tiers[0];chRender();}
/* ===================== DỰNG + MÓC ===================== */
function ensure(k){
  if(W[k])return W[k];css();var p=KH.frame(k),w={p:p},sl=p.slots;W[k]=w;
  if(k==='ren'){
    w.ov=mk(p,'lt-ov',640,238,400,500);
    w.ov.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.getAttribute('data-z')!=null){S.z=+b.getAttribute('data-z');w.ov.classList.remove('on');renRender();}else if(b.getAttribute('data-cl'))w.ov.classList.remove('on');});
    sl.set.forEach(function(c,i){if(i%2===0)c.el.addEventListener('click',function(){S.s=i/2;renRender();});});
    [[sl.top[0],'boss'],[sl.side[0],'main'],[sl.side[1],'shared']].forEach(function(a){a[0].el.addEventListener('click',function(){var I=LT.ids(S.z,S.s),n=LT.need(S.z);toast(nm(I[a[1]])+': có '+cnt(I[a[1]])+', cần '+n[a[1]]);});});
    sl.main[0].el.addEventListener('click',function(){var n=LT.need(S.z);toast(LT.PIECE[S.s].n+' '+LT.zoneName(S.z)+' · bộ '+LT.setName(S.z)+' · cần '+n.xu+' Tinh Thạch · mặc từ cấp '+LT.zbStart(S.z));});
  }else{
    w.info=mk(p,'lt-info',628,212,432,506);w.ov=mk(p,'lt-ov',628,212,432,506);
    w.ov.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.getAttribute('data-u')){S.sel=b.getAttribute('data-u');S.tier=0;S.rb=0;w.ov.classList.remove('on');chRender();}else if(b.getAttribute('data-cl'))w.ov.classList.remove('on');});
    sl.ring[0].el.addEventListener('click',chTierCycle);sl.ring[1].el.addEventListener('click',chTkToggle);sl.ring[2].el.addEventListener('click',chRbCycle);
    sl.main[0].el.addEventListener('click',function(){chPick();});
  }
  return w;}
KH.on('open',function(k){if(k!=='ren'&&k!=='ch')return;LT.demo();ensure(k);if(k==='ren')renRender();else chRender();});
KH.on('close',function(k){var w=W[k];if(w&&w.ov)w.ov.classList.remove('on');});
KH.on('btn',function(k,label){
  if(k==='ren'){if(label==='Rèn'){ensure(k);renDo();return true;}if(label==='Bộ Trang Bị'){ensure(k);renZone();return true;}}
  if(k==='ch'){if(label==='Đập'){ensure(k);chDo();return true;}if(label==='Chọn Trang Bị'){ensure(k);chPick();return true;}}
  return false;});
KH.on('pick',function(k,item){
  if(!item)return;
  if(k==='ren'){var t=root.TTGTB&&TTGTB.get(item.key);if(t)toast(t.ten+': '+(t.mo||''));return;}
  if(k!=='ch')return;
  var id=String(item.key),X=chCtx(),m=/^da_ch([1-6])$/.exec(id);
  if(!(m||id==='da_ngu_sac'||id==='ve_bao_ho'))return;
  if(!X){toast('Hãy chọn trang bị cần cường hóa trước.');return;}
  if(X.maxed)return;
  if(m){var t=+m[1];if(X.tiers.indexOf(t)<0){toast(nm(id)+' không dùng được cho món vùng '+LT.zoneName(X.it.z)+'.');return;}S.tier=t;chRender();}
  else if(id==='da_ngu_sac')chRbCycle();else chTkToggle();});
})(typeof window!=='undefined'?window:globalThis);
