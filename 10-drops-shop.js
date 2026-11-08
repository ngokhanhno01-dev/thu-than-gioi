/* ===== Tỉ lệ rơi theo quái / cấp / vùng + Cửa hàng huyết mạch ===== */
/* Tinh Hoa hệ k chỉ rơi ở vùng k. Mọi con số sửa tại đây. */

/* % rơi cơ bản cho từng quái (slot 0-4 của vùng) và boss, với quái bậc Thường */
const DROP_BASE={
 //        tinh  thuoc qua  dan  huyet   (Tinh Hoa hệ k + Linh Thảo/Quả/Đan/Huyết: dùng cho huyết mạch & balo)
 0:{tinh:30,thuoc:12,qua:14,dan:3 ,huyet:.3},  /* quái 1: nhiều Tinh Hoa */
 1:{tinh:14,thuoc:30,qua:10,dan:3 ,huyet:.3},  /* quái 2: nhiều Linh Thảo */
 2:{tinh:14,thuoc:12,qua:30,dan:4 ,huyet:.3},  /* quái 3: nhiều Linh Quả */
 3:{tinh:16,thuoc:14,qua:10,dan:10,huyet:.5},  /* quái 4: nhiều Linh Đan */
 4:{tinh:18,thuoc:14,qua:8 ,dan:6 ,huyet:1.2}, /* quái 5: hiếm, dễ ra Huyết */
 boss:{tinh:60,thuoc:45,qua:30,dan:25,huyet:8}
};
/* ===== Nguyên liệu rèn trang bị (xem 12-equip.js) =====
   Mỗi vùng có 5 quái + 1 boss => 5 nguyên liệu riêng + 1 "Tinh Hoa [tên boss]".
   Quái thứ s của vùng z chỉ rơi đúng nguyên liệu của nó: id 'zm'+z+'_'+s. Boss rơi 'zb'+z. */
const ZM_ID=(z,s)=>'zm'+z+'_'+s, ZB_ID=z=>'zb'+z;
const DROP_MAT=[38,38,38,38,34];   /* % rơi nguyên liệu riêng của quái 1..5 (quái bậc Thường, cấp thấp nhất của vùng) */
const DROP_BOSS_MAT=65;            /* % rơi Tinh Hoa [boss] khi hạ boss (Trấn Thủ) */
const DROP_LV=[.85,.95,1.05,1.15,1.25,1.35];  /* nhân theo cấp 1..6 trong vùng (cấp cao rơi tốt hơn) */
const DROP_ZONE_ITEMS={dan:.04,huyet:.04};     /* Đan, Huyết tăng thêm mỗi vùng sâu (+4%/vùng) */
const DROP_TIER_NORMAL=[.7,1,1.3,1.7];         /* Yếu / Thường / Tinh Anh / Thống Lĩnh */
const DROP_TIER_BOSS=[1,1.3,1.7];              /* Trấn Thủ / Chúa Tể / Thiên Ma */
const DROP_ID=k=>k==='tinh'?null:k;            /* tinh -> 'mat'+vùng */

function dropRates(e,bonus){
 bonus=bonus||1;
 const m=e.m,z=m.zone,zb=VAN_KIEP_ZONE_BOUNDS[z],off=Math.max(0,Math.min(5,e.lv-zb.start));
 const slot=m.boss?'boss':Math.max(0,VAN_KIEP_ZONES[z].mobs.indexOf(m.n));
 const ti=m.boss?Math.max(0,TRB_.indexOf(e.tr)):Math.max(0,TRQ_.indexOf(e.tr));
 const tm=m.boss?DROP_TIER_BOSS[ti]:DROP_TIER_NORMAL[ti];
 const b=DROP_BASE[slot],out=[];
 for(const k of Object.keys(b)){
  let p=b[k]*DROP_LV[off]*tm*bonus*(1+z*(DROP_ZONE_ITEMS[k]||0));
  p=Math.min(95,p);
  let q=1;
  if(m.boss){if(k==='tinh')q=1+ti;else if(k==='thuoc'&&ti>=1)q=2}
  out.push({id:k==='tinh'?'mat'+z:k,p,q})
 }
 /* nguyên liệu rèn trang bị: quái rơi nguyên liệu của chính nó, boss rơi Tinh Hoa của boss */
 if(m.boss)out.push({id:ZB_ID(z),p:Math.min(95,DROP_BOSS_MAT*DROP_LV[off]*tm*bonus),q:ti>=2?2:1});
 else out.push({id:ZM_ID(z,slot),p:Math.min(95,DROP_MAT[slot]*DROP_LV[off]*tm*bonus),q:1});
 return out}
function rollDrops(e,bonus){
 return dropRates(e,bonus).filter(d=>Math.random()*100<d.p).map(d=>({id:d.id,q:d.q}))}

/* ===== Bình thuốc (buff theo số trận) ===== */
const POTION_TURNS=20;                         /* mỗi bình dùng được bao nhiêu trận THẮNG (thua hoặc chạy trốn không tính) */
const BUFF_MUL={exp:2,xu:2,drop:2};            /* hệ số nhân — sửa tại đây */
const POTIONS=[
 {id:'bt_exp', buff:'exp', n:'Bình Tụ Linh Dịch', i:'🧪', d:'×'+BUFF_MUL.exp+' EXP trong '+POTION_TURNS+' trận thắng.', price:600},
 {id:'bt_xu',  buff:'xu',  n:'Bình Kim Phú Dịch', i:'🏺', d:'×'+BUFF_MUL.xu+' xu thưởng trong '+POTION_TURNS+' trận thắng.', price:500},
 {id:'bt_drop',buff:'drop',n:'Bình Thiên Cơ Dịch',i:'⚗️', d:'×'+BUFF_MUL.drop+' tỉ lệ rơi vật phẩm trong '+POTION_TURNS+' trận thắng.', price:800}
];
const buffs={exp:0,xu:0,drop:0};
const BUFF_NAME={exp:'EXP',xu:'Xu',drop:'Tỉ lệ rơi'};
function buffMul(k){return buffs[k]>0?BUFF_MUL[k]:1}
function buffTick(){
 for(const k of Object.keys(buffs)){if(buffs[k]>0){buffs[k]--;if(buffs[k]===0)log('🧪 Hết hiệu lực thuốc <b>'+BUFF_NAME[k]+'</b>.')}}}
function buffLine(){
 const o=Object.keys(buffs).filter(k=>buffs[k]>0).map(k=>BUFF_NAME[k]+' ×'+BUFF_MUL[k]+' ('+buffs[k]+' trận thắng)');
 return o.length?o.join(' · '):'Chưa có thuốc nào đang dùng'}
for(const P of POTIONS){
 ITEMS[P.id]={n:P.n,i:P.i,d:P.d,use:()=>{buffs[P.buff]+=POTION_TURNS;log('🧪 Dùng <b>'+P.n+'</b>: '+BUFF_NAME[P.buff]+' ×'+BUFF_MUL[P.buff]+', còn <b>'+buffs[P.buff]+'</b> trận thắng.');
  popToast('🧪 ĐÃ DÙNG THUỐC',P.i+' <b>'+P.n+'</b><br>'+BUFF_NAME[P.buff]+' ×'+BUFF_MUL[P.buff]+' · còn <b>'+buffs[P.buff]+'</b> trận thắng','ok')}};
 SELL_PRICE[P.id]=Math.round(P.price/4)}

/* ===== Thông báo nổi (toast) dùng chung cho cửa hàng + balo ===== */
let _ptEl=null,_ptTimer=0;
function popToast(title,body,type,ms){
 if(!_ptEl){
  const st=document.createElement('style');
  st.textContent='#pop-toast{position:fixed;left:50%;top:14%;transform:translate(-50%,-12px) scale(.96);width:min(84vw,300px);box-sizing:border-box;padding:10px 12px;text-align:center;background:#0d1d22;border:3px solid #e8c36d;border-radius:10px;box-shadow:0 0 0 2px #071117,0 8px 26px rgba(0,0,0,.7);z-index:100000;opacity:0;pointer-events:none;transition:opacity .18s,transform .18s;color:#f6e9e4}'+
   '#pop-toast.show{opacity:1;transform:translate(-50%,0) scale(1)}'+
   '#pop-toast.ok{border-color:#72e4b0}#pop-toast.bad{border-color:#ff7654}'+
   '#pop-toast .tt{font-size:15px;font-weight:800;margin-bottom:4px}#pop-toast.ok .tt{color:#72e4b0}#pop-toast.bad .tt{color:#ff7654}'+
   '#pop-toast .tb{font-size:13px;line-height:1.4}';
  document.head.appendChild(st);
  _ptEl=document.createElement('div');_ptEl.id='pop-toast';document.body.appendChild(_ptEl)}
 _ptEl.className='show '+(type||'ok');
 _ptEl.innerHTML='<div class="tt">'+title+'</div><div class="tb">'+body+'</div>';
 clearTimeout(_ptTimer);_ptTimer=setTimeout(()=>_ptEl.classList.remove('show'),ms||2600)}

/* ===== Cửa hàng: hàng giới hạn + làm mới theo thời gian ===== */
const SHOP_REFRESH_MIN=30;                          /* cứ bao nhiêu PHÚT thì cửa hàng nhập lại hàng — sửa tại đây */
const SHOP_STOCK={bt_exp:3,bt_xu:5,bt_drop:3};      /* số lượng tối đa mỗi lần nhập của từng món — sửa tại đây */
const SHOP_REFRESH_MS=SHOP_REFRESH_MIN*60000;
const shopStock={};
let shopNextAt=Date.now()+SHOP_REFRESH_MS;
function shopRestock(){for(const P of POTIONS)shopStock[P.id]=SHOP_STOCK[P.id]||0}
shopRestock();
function shopCountdown(){
 const s=Math.max(0,Math.ceil((shopNextAt-Date.now())/1000));
 return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function shopList(){return POTIONS.map(P=>({id:P.id,p:P.price,s:shopStock[P.id],m:SHOP_STOCK[P.id]||0}))}
let shopEl=null;
function shopIsOpen(){return !!shopEl&&shopEl.style.display!=='none'}
setInterval(()=>{
 if(Date.now()>=shopNextAt){
  shopRestock();shopNextAt=Date.now()+SHOP_REFRESH_MS;
  log('🏪 Cửa hàng vừa <b>nhập hàng mới</b>!');
  if(shopIsOpen()){renderShop();popToast('🔄 CỬA HÀNG ĐÃ LÀM MỚI','Hàng đã được nhập lại đầy đủ!','ok')}}
 const cd=document.getElementById('shop-cd');if(cd)cd.textContent=shopCountdown()},1000);

function shopBuy(id,p,n){
 const st=shopStock[id]||0,I=ITEMS[id];
 if(st<=0){popToast('❌ HẾT HÀNG','<b>'+I.n+'</b> đã bán hết.<br>Chờ làm mới sau <b>'+shopCountdown()+'</b>.','bad');return}
 if(gold<p){popToast('⚠️ KHÔNG ĐỦ XU','Cần <b>'+p+'</b> xu, bạn đang có <b>'+gold+'</b> xu.','bad');return}
 n=Math.min(n,st,Math.floor(gold/p));
 const a=addItem(id,n);
 if(!a){popToast('🎒 BALO ĐẦY','Không còn chỗ để cất <b>'+I.n+'</b>.','bad');return}
 gold-=a*p;shopStock[id]=st-a;stats();
 log('🏪 Mua <b>'+I.n+'</b> ×'+a+' (−'+a*p+' xu).');
 popToast('✅ MUA THÀNH CÔNG',I.i+' <b>'+I.n+'</b> ×'+a+'<br>−'+a*p+' xu · còn '+shopStock[id]+' trong cửa hàng<br><span style="font-size:11px;color:#cdbfc4">Mở 🎒 Balo để dùng.'+(a<n?' (Balo chỉ đủ chỗ cho '+a+')':'')+'</span>','ok');
 renderShop()}
function renderShop(){
 if(!shopEl)return;
 const cnt2=id=>bag.reduce((x,s)=>x+(s.id===id?s.n:0),0);
 let h='<div style="font-size:15px;font-weight:900;color:#ffd24a">🏪 Cửa hàng</div>'+
  '<div style="font-size:11.5px;margin:2px 0">🪙 <b style="color:#ffd24a">'+gold+'</b> xu · 🎒 '+bag.length+'/'+BAG_SLOTS+' ô</div>'+
  '<div style="font-size:10.5px;color:#72e4b0;margin-bottom:2px">'+buffLine()+'</div>'+
  '<div style="font-size:11px;color:#8fd0ff;margin-bottom:6px">🔄 Làm mới hàng sau <b id="shop-cd">'+shopCountdown()+'</b></div>';
 h+=shopList().map(it=>{const I=ITEMS[it.id],out=it.s<=0,dis=out?' disabled':'';
  return'<div style="padding:6px 8px;margin:4px 0;border:1px solid rgba(168,92,78,.4);border-radius:9px;background:rgba(40,26,34,.7);text-align:left'+(out?';opacity:.6':'')+'">'+
  '<div style="display:flex;align-items:center;gap:7px"><span style="font-size:22px;flex:none">'+I.i+'</span>'+
  '<div style="flex:1;min-width:0;line-height:1.3"><b style="font-size:12.5px;color:#f6e9e4">'+I.n+'</b> <span style="font-size:10.5px;color:#9a8a90">(có '+cnt2(it.id)+')</span><div style="font-size:10.5px;color:#cdbfc4">'+I.d+'</div></div></div>'+
  '<div style="display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:5px"><span style="flex:1;font-size:12px;font-weight:800;color:#ffd24a">'+it.p+' xu <span style="font-size:10.5px;font-weight:700;color:'+(out?'#ff7654':'#72e4b0')+'">· '+(out?'Hết hàng':'Còn '+it.s+'/'+it.m)+'</span></span>'+
  '<button class="shop-b"'+dis+' onclick="shopBuy(\''+it.id+'\','+it.p+',1)">×1</button>'+
  '<button class="shop-b"'+dis+' onclick="shopBuy(\''+it.id+'\','+it.p+',5)">×5</button></div></div>'}).join('');
 h+='<button class="shop-b" style="width:100%;padding:7px;margin-top:6px;border-color:#ff7654;background:#a72f42" onclick="closeShop()">Đóng</button>';
 shopEl.innerHTML=h}
function openShop(){
 if(!hatched||!pet)return;
 if(!shopEl){
  shopEl=document.createElement('div');shopEl.id='shop-ov';
  shopEl.style.cssText='position:fixed;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;background:#100a11;color:#f6e9e4;text-align:center;padding:12px 10px;box-sizing:border-box';
  const st=document.createElement('style');
  st.textContent='.shop-b{width:54px;flex:none;padding:5px 0;margin:0;font-size:13px;font-weight:800;line-height:1.1}.shop-b:disabled{opacity:.4;cursor:not-allowed}#shop-ov>*{width:100%;max-width:360px;box-sizing:border-box}';
  document.head.appendChild(st);document.body.appendChild(shopEl)}
 shopEl.style.display='flex';renderShop()}
function closeShop(){if(shopEl)shopEl.style.display='none'}

/* ===== HUD trong trận: buff (trái, dưới thanh máu) + hệ (phải, ngang dòng số máu) ===== */
const HE_COL={Kim:'#f2d06a','Mộc':'#5be07a','Thủy':'#5bb8ff','Hỏa':'#ff6a3a','Thổ':'#d9a05a','Huyễn':'#c08aff'};
const BUFF_HUD={exp:['EXP','#72e4b0'],xu:['Xu','#ffd24a'],drop:['Rơi','#c08aff']};
/* ô nhỏ có nền màu, chữ nằm trong */
function _chip(t,c){return '<span style="display:inline-block;margin-right:3px;padding:1px 4px;border-radius:3px;background:'+c+';color:#101018;font-weight:700;font-size:12px;line-height:1;box-shadow:0 0 0 1px #071117;text-shadow:none">'+t+'</span>'}
/* dòng buff: nằm ngay dưới số máu của thú mình */
function _buffRow(){
 let r=document.getElementById('mob-pbar2');
 if(!r){
  const a=document.getElementById('mob-pt');if(!a)return null;
  r=document.createElement('div');r.id='mob-pbar2';
  r.style.cssText="margin-top:2px;font-family:'VT323',monospace;line-height:1;white-space:nowrap;overflow:hidden";
  a.parentNode.appendChild(r)}
 return r}
/* ô hệ: nằm bên phải, ngang dòng số máu */
function _heBadge(anchorId,id){
 const a=document.getElementById(anchorId);if(!a)return null;
 let b=document.getElementById(id);
 if(!b){
  b=document.createElement('span');b.id=id;
  b.style.cssText="position:absolute;right:0;font-family:'VT323',monospace;line-height:1;white-space:nowrap";
  a.parentNode.style.position='relative';a.parentNode.appendChild(b)}
 b.style.top=(a.offsetTop+2)+'px';
 return b}
function battleHudExtra(e){
 const pr=_buffRow();
 if(pr){pr.innerHTML=Object.keys(buffs).filter(k=>buffs[k]>0).map(k=>_chip(BUFF_HUD[k][0]+'×'+BUFF_MUL[k],BUFF_HUD[k][1])).join('')}
 const ph=pet&&BL[pet.bl]?BL[pet.bl].h:'',mh=e&&e.m&&BL[e.m.bl]?BL[e.m.bl].h:'';
 const pb=_heBadge('mob-pt','mob-pe'),mb=_heBadge('mob-mt','mob-me');
 if(pb)pb.innerHTML=ph?_chip(ph,HE_COL[ph]||'#fff').replace('margin-right:3px;',''):'';
 if(mb)mb.innerHTML=mh?_chip(mh,HE_COL[mh]||'#fff').replace('margin-right:3px;',''):'';
 const rb=document.getElementById('mob-run');if(rb)rb.style.top='60px';
 try{if(window.VanKiepSprites&&pet)VanKiepSprites.getSheet(pet.bl,pet.sp)}catch(e){}}

/* ===== Tô màu chữ quan trọng (tên vùng, hệ, vật phẩm, loài, Xu/EXP...) =====
   Tự quét các khung chữ (nhật ký, bảng chỉ số, kết quả trận, thông báo...) và tô màu từ khóa.
   Muốn đổi màu: sửa ZONE_COL / HL_ITEM / HL_BL bên dưới. */
const ZONE_COL=['#8fd8ff','#7fe0c8','#b9a8ff','#6fe3a8','#ffe86a','#a8b0ff','#ffb84a','#9aa0ff','#ffd24a','#a8ffd8','#7affc0','#ff7a6a','#b69cff','#c06aff','#7fc8ff','#ff9ad8','#fff2a0'];
const HL_ITEM={qua:'#ff8a7a',thuoc:'#72e4b0',dan:'#ffd24a',huyet:'#ff5a6a',bt_exp:'#72e4b0',bt_xu:'#ffd24a',bt_drop:'#c08aff'};
const HL_BL={ho:'#aebfe0',vu:'#6fc3e0',long:'#6fe08a',tuoc:'#ff8a5a',lan:'#f0c04a',hu:'#d6a8ff'};
const HL_SEL='#log,#info,#bag-info,#xp,#rates,#pick-desc,#mission,#btn-zone,#zone-list,#pop-toast,#shop-ov,#up-wrap';
const HL_KW={'Xu':'#ffd24a','EXP':'#72e4b0','Uy danh':'#ffb86b','uy danh':'#ffb86b'};
let _hlRE=null,_hlMap=null,_hlSpecies=null;
function _hlEsc(x){return x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function hlBuild(){
 const map=Object.assign({},HL_KW);
 const add=(t,c)=>{if(t&&t.length>1&&!map[t])map[t]=c};
 try{VAN_KIEP_ZONES.forEach((z,i)=>add(z.name,ZONE_COL[i]))}catch(e){}
 for(const id in ITEMS){const m=/^mat(\d+)$/.exec(id);add(ITEMS[id].n,m?ZONE_COL[+m[1]]:(HL_ITEM[id]||null))}
 for(const k in BL)add(BL[k].n,HL_BL[k]||'#fff');
 if(!_hlSpecies){_hlSpecies={};try{for(let sp=0;sp<EPI.length;sp++)for(const k in BL){const n=genOf(k,sp).name;if(n)_hlSpecies[n]=ZONE_COL[sp]}}catch(e){}}
 for(const n in _hlSpecies)add(n,_hlSpecies[n]);
 try{VAN_KIEP_ZONES.forEach((z,i)=>{(z.mobs||[]).forEach(n=>add(n,ZONE_COL[i]));(z.bosses||[]).forEach(n=>add(n,ZONE_COL[i]))})}catch(e){}
 const names=Object.keys(map).filter(k=>map[k]).sort((a,b)=>b.length-a.length).map(_hlEsc).join('|');
 const he=Object.keys(HE_COL).join('|'),zs=EPI.map(x=>x[0]).join('|'),qn=QN.join('|');
 _hlMap=map;
 _hlRE=new RegExp('(?<![\\p{L}])('+names+')(?![\\p{L}])|(?<=(?:hệ|Khắc|khắc|Bị|bị) )('+he+')(?![\\p{L}])|(?<=Vùng )('+zs+')(?![\\p{L}])|(?<![\\p{L}])('+qn+')(?= \\d)|(?<=trứng )('+qn+')(?=\\))','gu')}
function _hlPrevText(n){
 let s=n.previousSibling;
 if(s&&s.nodeType===3)return s.nodeValue;
 if(!s&&n.parentNode&&/^(B|SPAN|STRONG)$/.test(n.parentNode.nodeName)){s=n.parentNode.previousSibling;if(s&&s.nodeType===3)return s.nodeValue}
 return ''}
function _hlPaint(n,c){
 const p=n.parentNode;
 if(p.nodeName==='B'&&p.childNodes.length===1){p.style.color=c;p.classList.add('kw');return}
 const sp=document.createElement('span');sp.className='kw';sp.style.cssText='color:'+c+';font-weight:700';
 p.replaceChild(sp,n);sp.appendChild(n)}
function hlNode(n){
 const t=n.nodeValue;if(!t||!t.trim())return;
 const tr=t.trim(),prev=_hlPrevText(n);
 if(prev){
  if(HE_COL[tr]&&/(hệ|Khắc|khắc|Bị|bị)\s$/.test(prev)){_hlPaint(n,HE_COL[tr]);return}
  const zi=EPI.findIndex(x=>x[0]===tr);
  if(zi>=0&&/Vùng\s$/.test(prev)){_hlPaint(n,ZONE_COL[zi]);return}}
 const frag=document.createDocumentFragment();let last=0,hit=false;
 for(const m of t.matchAll(_hlRE)){
  const c=m[1]?_hlMap[m[1]]:m[2]?HE_COL[m[2]]:m[3]?ZONE_COL[EPI.findIndex(x=>x[0]===m[3])]:'rgb('+QC[QN.indexOf(m[4]||m[5])]+')';
  if(!c)continue;
  hit=true;
  frag.appendChild(document.createTextNode(t.slice(last,m.index)));
  const sp=document.createElement('span');sp.className='kw';sp.style.cssText='color:'+c+';font-weight:700';sp.textContent=m[0];
  frag.appendChild(sp);last=m.index+m[0].length}
 if(!hit)return;
 frag.appendChild(document.createTextNode(t.slice(last)));
 n.parentNode.replaceChild(frag,n)}
function hlProcess(root){
 let list=[];
 if(root.nodeType===3)list=[root];
 else if(root.nodeType===1){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode;
   return(!p||/^(SCRIPT|STYLE|TEXTAREA|INPUT|CANVAS)$/.test(p.nodeName)||(p.classList&&p.classList.contains('kw')))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
  while(w.nextNode())list.push(w.currentNode)}
 for(const n of list)if(n.parentNode&&!(n.parentNode.classList&&n.parentNode.classList.contains('kw')))hlNode(n)}
const _hlQueue=new Set();let _hlTimer=0;
function hlFlush(){
 _hlTimer=0;const q=[..._hlQueue];_hlQueue.clear();
 try{hlBuild();for(const n of q)if(n.isConnected)hlProcess(n)}catch(e){console.warn('hl',e)}
 _hlObs.takeRecords()}
const _hlObs=new MutationObserver(ms=>{
 for(const m of ms){
  if(m.type==='characterData'){const p=m.target.parentNode;if(p&&p.closest&&p.closest(HL_SEL))_hlQueue.add(m.target)}
  else m.addedNodes.forEach(n=>{const e=n.nodeType===1?n:n.parentNode;if(e&&e.closest&&e.closest(HL_SEL))_hlQueue.add(n)})}
 if(_hlQueue.size&&!_hlTimer)_hlTimer=setTimeout(hlFlush,30)});
_hlObs.observe(document.body,{childList:true,subtree:true,characterData:true});
document.querySelectorAll(HL_SEL).forEach(e=>_hlQueue.add(e));
_hlTimer=setTimeout(hlFlush,30);

/* ===== Sửa lỗi nháy "ngoại hình cũ" lúc nở trứng / vào trận =====
   Nguyên nhân: game vẽ thú bằng sheet theo bậc tuổi (VanKiepSprites.getSheet). Sheet này cần tải xong ảnh mới dựng được,
   trong lúc chờ thì code cũ vẽ tạm ảnh dự phòng (spriteFor = ảnh trưởng thành tĩnh) -> hiện đúng 1 khoảnh khắc rồi mới
   đổi sang ngoại hình thật. Ở đây: khi sheet chưa sẵn sàng thì KHÔNG trả ảnh dự phòng nữa (chờ sheet thật). */
const _spriteFor0=spriteFor,_SPRITE_WAIT={complete:false,naturalWidth:0};
spriteFor=function(bl,ei){
 const api=window.VanKiepSprites;
 if(api){
  let sh=null,ok=true;
  try{sh=api.getSheet(bl,ei)}catch(e){ok=false}   /* getSheet cũng là lệnh bắt đầu tải ảnh */
  if(ok&&!sh)return _SPRITE_WAIT}
 return _spriteFor0(bl,ei)};
