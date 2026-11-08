/* ===== Tỉ lệ rơi theo quái / cấp / vùng + Cửa hàng huyết mạch ===== */
/* Tinh Hoa hệ k chỉ rơi ở vùng k. Mọi con số sửa tại đây. */

/* % rơi cơ bản cho từng quái (slot 0-4 của vùng) và boss, với quái bậc Thường */
const DROP_BASE={
 //        tinh  thuoc qua  dan  huyet
 0:{tinh:30,thuoc:12,qua:14,dan:3 ,huyet:.3},  /* quái 1: nhiều Tinh Hoa */
 1:{tinh:14,thuoc:30,qua:10,dan:3 ,huyet:.3},  /* quái 2: nhiều Linh Thảo */
 2:{tinh:14,thuoc:12,qua:30,dan:4 ,huyet:.3},  /* quái 3: nhiều Linh Quả */
 3:{tinh:16,thuoc:14,qua:10,dan:10,huyet:.5},  /* quái 4: nhiều Linh Đan */
 4:{tinh:18,thuoc:14,qua:8 ,dan:6 ,huyet:1.2}, /* quái 5: hiếm, dễ ra Huyết */
 boss:{tinh:60,thuoc:45,qua:30,dan:25,huyet:8}
};
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
 ITEMS[P.id]={n:P.n,i:P.i,d:P.d,use:()=>{buffs[P.buff]+=POTION_TURNS;log('🧪 Dùng <b>'+P.n+'</b>: '+BUFF_NAME[P.buff]+' ×'+BUFF_MUL[P.buff]+', còn <b>'+buffs[P.buff]+'</b> trận thắng.')}};
 SELL_PRICE[P.id]=Math.round(P.price/4)}

/* ===== Cửa hàng ===== */
function shopList(){return POTIONS.map(P=>({id:P.id,p:P.price}))}
let shopEl=null;
function shopMsg(h){const d=document.getElementById('shop-msg');if(d)d.innerHTML=h}
function shopBuy(id,p,n){
 if(gold<p){shopMsg('<span style="color:#ff7654">Không đủ xu (cần '+p+').</span>');return}
 n=Math.min(n,Math.floor(gold/p));
 const a=addItem(id,n);
 if(!a){shopMsg('<span style="color:#ff7654">Balo đầy.</span>');return}
 gold-=a*p;stats();
 log('🏪 Mua <b>'+ITEMS[id].n+'</b> ×'+a+' (−'+a*p+' xu).');
 shopMsg('<span style="color:#72e4b0">Đã mua '+ITEMS[id].n+' ×'+a+' (−'+a*p+' xu). Mở 🎒 Balo để dùng.'+(a<n?' Balo chỉ còn chỗ cho '+a+'.':'')+'</span>');
 renderShop()}
function renderShop(){
 if(!shopEl)return;
 const cnt2=id=>bag.reduce((x,s)=>x+(s.id===id?s.n:0),0);
 let h='<div style="font-size:15px;font-weight:900;color:#ffd24a">🏪 Cửa hàng</div>'+
  '<div style="font-size:11.5px;margin:2px 0">🪙 <b style="color:#ffd24a">'+gold+'</b> xu · 🎒 '+bag.length+'/'+BAG_SLOTS+' ô</div>'+
  '<div style="font-size:10.5px;color:#72e4b0;margin-bottom:6px">'+buffLine()+'</div>';
 h+=shopList().map(it=>{const I=ITEMS[it.id];
  return'<div style="padding:6px 8px;margin:4px 0;border:1px solid rgba(168,92,78,.4);border-radius:9px;background:rgba(40,26,34,.7);text-align:left">'+
  '<div style="display:flex;align-items:center;gap:7px"><span style="font-size:22px;flex:none">'+I.i+'</span>'+
  '<div style="flex:1;min-width:0;line-height:1.3"><b style="font-size:12.5px;color:#f6e9e4">'+I.n+'</b> <span style="font-size:10.5px;color:#9a8a90">(có '+cnt2(it.id)+')</span><div style="font-size:10.5px;color:#cdbfc4">'+I.d+'</div></div></div>'+
  '<div style="display:flex;align-items:center;justify-content:flex-end;gap:6px;margin-top:5px"><span style="flex:1;font-size:12px;font-weight:800;color:#ffd24a">'+it.p+' xu</span>'+
  '<button class="shop-b" onclick="shopBuy(\''+it.id+'\','+it.p+',1)">×1</button>'+
  '<button class="shop-b" onclick="shopBuy(\''+it.id+'\','+it.p+',5)">×5</button></div></div>'}).join('');
 h+='<div id="shop-msg" style="font-size:10.5px;min-height:14px;margin:4px 0"></div>'+
  '<button class="shop-b" style="width:100%;padding:7px;border-color:#ff7654;background:#a72f42" onclick="closeShop()">Đóng</button>';
 shopEl.innerHTML=h}
function openShop(){
 if(!hatched||!pet)return;
 if(!shopEl){
  shopEl=document.createElement('div');shopEl.id='shop-ov';
  shopEl.style.cssText='position:fixed;inset:0;z-index:50;display:none;flex-direction:column;align-items:center;justify-content:flex-start;overflow-y:auto;background:#100a11;color:#f6e9e4;text-align:center;padding:12px 10px;box-sizing:border-box';
  const st=document.createElement('style');
  st.textContent='.shop-b{width:54px;flex:none;padding:5px 0;margin:0;font-size:13px;font-weight:800;line-height:1.1}#shop-ov>*{width:100%;max-width:360px;box-sizing:border-box}';
  document.head.appendChild(st);document.body.appendChild(shopEl)}
 shopEl.style.display='flex';renderShop()}
function closeShop(){if(shopEl)shopEl.style.display='none'}
