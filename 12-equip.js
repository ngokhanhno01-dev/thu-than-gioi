/* ===== Trang bị: 4 ô · 17 bộ theo vùng · rèn kiểu gacha =====
   - 17 vùng = 17 bộ. Mỗi bộ 4 món (Vũ Khí, Giáp, Vòng, Ngọc).
   - Mặc 2 món cùng vùng: kích hoạt buff bộ (hiệu ứng riêng của vùng); đủ 4 món: buff mạnh hơn.
   - Rèn: Tinh Hoa [boss] + nguyên liệu của quái vùng đó + Linh Cốt (quái 5) + xu. Phẩm (Phàm→Thần) quay gacha.
   - Phẩm cao: MỌI chỉ số và buff bộ cộng thêm % (xem EQ_QBONUS).
   - Trang bị KHÔNG rơi từ quái, chỉ rèn được. Mọi con số sửa ở khối cấu hình ngay bên dưới. */

/* ---------- Cấu hình ---------- */
const EQ_CAT=[                       /* loại nguyên liệu = quái thứ 1..5 của vùng (tên vật phẩm = loại + tên quái) */
 {n:'Móng Vuốt',i:'🐾'},{n:'Vảy Giáp',i:'🐟'},{n:'Nanh Thú',i:'🦷'},{n:'Nhãn Châu',i:'👁️'},{n:'Linh Cốt',i:'🦴'}];
const EQ_SLOTS=[                     /* cat = loại nguyên liệu chính của ô; Linh Cốt (loại 5) dùng chung cho mọi ô */
 {n:'Vũ Khí',i:'⚔️',cat:0},
 {n:'Giáp',  i:'🛡️',cat:1},
 {n:'Vòng',  i:'📿',cat:2},
 {n:'Ngọc',  i:'💎',cat:3}];
const EQ_SHARED=4;
const EQ_BAG=100;                    /* số ô kho trang bị */
const EQ_QW=[55,28,12,4,1];          /* tỉ lệ gacha phẩm: Phàm / Linh / Địa / Thiên / Thần */
const EQ_QBONUS=[0,.06,.12,.20,.30]; /* phẩm càng cao càng mạnh: Linh +6% · Địa +12% · Thiên +20% · Thần +30% (cộng cho MỌI chỉ số và buff bộ) */
const EQ_LINES=3;                    /* số dòng chỉ số mỗi món (ngẫu nhiên) */
const EQ_ROLL=[.6,1];                /* mỗi dòng roll từ 60% đến 100% giá trị tối đa */
const EQ_STATS={                     /* b = giá trị gốc. t:'f' = số cố định (tính theo chỉ số tham chiếu của vùng), t:'p' = % điểm */
 hp:  {n:'Sinh Lực',b:7,  t:'f'},
 atk: {n:'Công',    b:7,  t:'f'},
 def: {n:'Thủ',     b:7,  t:'f'},
 spd: {n:'Tốc',     b:7,  t:'f'},
 mag: {n:'Linh',    b:7,  t:'f'},
 eva: {n:'Né tránh',b:3,  t:'p'},
 stun:{n:'Choáng',  b:2.2,t:'p'},
 regen:{n:'Hồi/lượt',b:.8, t:'p'},
 crit:{n:'Chí mạng',b:2.5,t:'p'}};
const EQ_CAP={eva:45,stun:35,regen:8,crit:60};   /* trần tổng (khớp trần sẵn có của game) */
/* Giá rèn theo vùng z (0..16): boss = Tinh Hoa [boss], main = nguyên liệu chính của ô, shared = Linh Cốt */
function eqNeed(z){return{boss:1+Math.floor(z/6),main:5+Math.floor(z/4),shared:3+Math.floor(z/5),xu:40*(z+1)}}
function eqSellPrice(it){return Math.round((6+it.z*4)*(1+it.q*1.5))}

/* ---------- 17 buff bộ theo phong cách vùng ----------
   v2 = mặc 2-3 món · v4 = đủ 4 món. ch = tỉ lệ kích hoạt (%), pct/mul = độ mạnh (%). Phẩm cao nhân thêm EQ_QBONUS. */
const EQ_SETS=[
 {k:'frost',  i:'❄️',name:'Băng Phong',     v2:{ch:12},          v4:{ch:25},           t:v=>'Khi bị đánh, <b>'+v.ch+'%</b> đóng băng đối thủ, khiến chúng mất lượt kế tiếp.'},
 {k:'mist',   i:'🌫️',name:'Sương Tán',      v2:{ch:15},          v4:{ch:30},           t:v=>'Mỗi đòn nhận vào có <b>'+v.ch+'%</b> tan thành sương, giảm một nửa sát thương.'},
 {k:'cloud',  i:'☁️',name:'Vân Ẩn',         v2:{ch:15},          v4:{ch:30},           t:v=>'Cuối mỗi hiệp có <b>'+v.ch+'%</b> ẩn mình trong mây, né hoàn toàn đòn kế tiếp của địch.'},
 {k:'wind',   i:'🌪️',name:'Phong Nhận',     v2:{ch:15,pct:60},   v4:{ch:30,pct:90},    t:v=>'Mỗi đòn trúng có <b>'+v.ch+'%</b> chém thêm một nhát gió bằng <b>'+v.pct+'%</b> sát thương đòn đó.'},
 {k:'thunder',i:'⚡',name:'Lôi Phạt',        v2:{ch:12,pct:40},   v4:{ch:25,pct:80},    t:v=>'Mỗi đòn trúng có <b>'+v.ch+'%</b> giáng Lôi Phạt, sát thương = sát thương thú vừa đánh <b>+'+v.pct+'%</b>.'},
 {k:'counter',i:'🌙',name:'Nguyệt Ảnh',     v2:{ch:30,mul:80},   v4:{ch:60,mul:120},   t:v=>'Khi né được đòn, <b>'+v.ch+'%</b> phản kích ngay bằng <b>'+v.mul+'%</b> sát thương thường.'},
 {k:'sun',    i:'☀️',name:'Dương Diệm',     v2:{pct:20},         v4:{pct:40},          t:v=>'Đòn đánh vào kẻ địch còn trên 60% sinh lực gây thêm <b>'+v.pct+'%</b> sát thương.'},
 {k:'shield', i:'🔮',name:'Uyên Khiên',     v2:{pct:12},         v4:{pct:24},          t:v=>'Đầu trận được khiên hấp thụ sát thương bằng <b>'+v.pct+'%</b> sinh lực tối đa.'},
 {k:'thorn',  i:'💠',name:'Kim Cương Phản Chấn',v2:{ch:20,pct:50},v4:{ch:40,pct:80},   t:v=>'Khi bị đánh, <b>'+v.ch+'%</b> phản lại <b>'+v.pct+'%</b> sát thương nhận vào.'},
 {k:'revive', i:'💎',name:'Ngọc Hộ Mệnh',   v2:{pct:15},         v4:{pct:35},          t:v=>'Một lần mỗi trận, khi bị hạ gục sẽ hồi sinh với <b>'+v.pct+'%</b> sinh lực.'},
 {k:'grove',  i:'🌿',name:'Sinh Cơ Cổ Thụ', v2:{pct:2},          v4:{pct:4},           t:v=>'Cuối mỗi hiệp hồi <b>'+v.pct+'%</b> sinh lực tối đa, gấp đôi khi dưới 50% sinh lực.'},
 {k:'lava',   i:'🌋',name:'Dung Nham Phun Trào',v2:{ch:20,pct:120},v4:{ch:40,pct:180}, t:v=>'Cuối mỗi hiệp có <b>'+v.ch+'%</b> dung nham phun lên, gây <b>'+v.pct+'%</b> Công của thú (bỏ qua Thủ).'},
 {k:'ambush', i:'🌑',name:'U Ảnh Ám Sát',   v2:{ch:50},          v4:{ch:100},          t:v=>'<b>'+v.ch+'%</b> đòn đánh đầu tiên mỗi trận chắc chắn chí mạng.'},
 {k:'star',   i:'✨',name:'Tinh Quang Bùng Nổ',v2:{pct:30},      v4:{pct:60},          t:v=>'Đòn chí mạng nổ tinh quang, gây thêm <b>'+v.pct+'%</b> sát thương.'},
 {k:'first',  i:'🪽',name:'Thiên Uy',       v2:{pct:25},         v4:{pct:50},          t:v=>'Luôn ra đòn trước; đòn đầu tiên mỗi trận gây thêm <b>'+v.pct+'%</b> sát thương.'},
 {k:'weaken', i:'🌸',name:'Phấn Hoa Suy Yếu',v2:{pct:8},         v4:{pct:18},          t:v=>'Đầu trận làm kẻ địch suy yếu, giảm <b>'+v.pct+'%</b> Công.'},
 {k:'judge',  i:'⚖️',name:'Thần Phán',      v2:{pct:25},         v4:{pct:50},          t:v=>'Kẻ địch dưới 30% sinh lực chịu thêm <b>'+v.pct+'%</b> sát thương.'}];
const EQ_STAT_NAME={hp:'Sinh Lực',atk:'Công',def:'Thủ',spd:'Tốc',mag:'Linh',eva:'Né tránh',stun:'Choáng',regen:'Hồi/lượt',crit:'Chí mạng'};
const _r1=x=>Math.round(x*10)/10;

/* ---------- Nguyên liệu: 5 quái + 1 boss mỗi vùng ---------- */
for(let z=0;z<17;z++){
 const Z=VAN_KIEP_ZONES[z],col=ZONE_COL[z];
 Z.mobs.forEach((mn,s)=>{
  const id=ZM_ID(z,s),c=EQ_CAT[s];
  ITEMS[id]={n:c.n+' '+mn,i:c.i,col,d:'Nguyên liệu bộ '+Z.name+', chỉ rơi từ '+mn+'. '+(s<EQ_SHARED?'Dùng rèn '+EQ_SLOTS[s].n+'.':'Dùng chung để rèn mọi món của bộ.')+' (mục 🛡️ Trang bị → Rèn)',use:null};
  SELL_PRICE[id]=6+z*2;HL_ITEM[id]=col});
 const bn=Z.bosses[0],bid=ZB_ID(z);
 ITEMS[bid]={n:'Tinh Hoa '+bn,i:'✨',col,d:'Tinh hoa của chủ vùng '+Z.name+', chỉ rơi từ boss '+bn+'. Dùng rèn mọi món của bộ. (mục 🛡️ Trang bị → Rèn)',use:null};
 SELL_PRICE[bid]=30+z*5;HL_ITEM[bid]=col}
for(let k=0;k<17;k++)ITEMS['mat'+k].d='Chỉ dùng nâng cấp huyết mạch cho thú vùng '+EPI[k][0]+' (mở mục 🩸 Huyết mạch).';
const eqIsMat=id=>/^z[mb]\d/.test(id);
{const _bu2=bagUse;bagUse=function(){const s=bag[bagSel];if(s&&eqIsMat(s.id)){log('🛡️ <b>'+ITEMS[s.id].n+'</b> dùng ở mục <b>Trang bị → Rèn</b>.');return}_bu2()}}

/* ---------- Dữ liệu ---------- */
let eqWorn=[null,null,null,null],ebag=[],eqUid=1,eqTab='wear',eqSel=null,fgSlot=0,fgZone=-1,fgLast=null,fgOpen=false,eqMsg='',eqRaf=0;
const eqRgb=it=>'rgb('+QC[it.q]+')';
const eqName=it=>EQ_SLOTS[it.s].n+' '+VAN_KIEP_ZONES[it.z].name;
const eqLine=l=>{const d=EQ_STATS[l[0]];return d.n+' +'+l[1]+(d.t==='p'?'%':'')};
function eqRef(z){const zb=VAN_KIEP_ZONE_BOUNDS[z];return 72/5*(1+3*petGrow((zb.start+zb.end)/2))}

function eqRoll(z,s,q){
 const ref=eqRef(z),keys=Object.keys(EQ_STATS);
 for(let i=keys.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[keys[i],keys[j]]=[keys[j],keys[i]]}
 const L=keys.slice(0,EQ_LINES).map(k=>{
  const d=EQ_STATS[k],r=EQ_ROLL[0]+Math.random()*(EQ_ROLL[1]-EQ_ROLL[0]),pct=d.b*(1+EQ_QBONUS[q])*r;
  return[k,d.t==='f'?Math.max(1,Math.round(ref*(k==='hp'?8:1)*pct/100)):Math.round(pct*10)/10]});
 return{uid:eqUid++,z,s,q,lv:VAN_KIEP_ZONE_BOUNDS[z].start,L}}

/* ---------- Tổng chỉ số + buff bộ ---------- */
function eqTotals(){
 const t={hp:0,atk:0,def:0,spd:0,mag:0,eva:0,stun:0,regen:0,crit:0};
 for(const it of eqWorn){if(!it)continue;for(const[k,v]of it.L)t[k]+=v}
 return t}
/* Danh sách buff bộ đang kích hoạt (đã nhân phẩm trung bình của các món cùng bộ) */
function eqSetInfo(){
 const c={},qs={},out=[];
 for(const it of eqWorn){if(!it)continue;c[it.z]=(c[it.z]||0)+1;(qs[it.z]=qs[it.z]||[]).push(EQ_QBONUS[it.q])}
 for(const z in c){
  const n=c[z],S=EQ_SETS[z],qb=qs[z].reduce((a,b)=>a+b,0)/qs[z].length,on=n>=2,full=n>=4;
  out.push({z:+z,n,S,on,full,qb,v:on?eqScale(full?S.v4:S.v2,qb):null})}
 return out}
function eqScale(v,qb){const o={};for(const k in v){o[k]=_r1(v[k]*(1+qb));if(k==='ch')o[k]=Math.min(100,o[k])}return o}
function eqApply(s){
 const T=eqTotals();
 for(const k of['hp','atk','def','spd','mag'])s[k]=Math.round(s[k]+T[k]);
 for(const k in EQ_CAP)s[k]=Math.min(EQ_CAP[k],(s[k]||0)+T[k]);
 return s}
{const _statsOf0=statsOf;
 statsOf=function(bl,pi,base,a){
  const s=_statsOf0(bl,pi,base,a);
  return(pet&&!pv.on&&bl===pet.bl&&base===pet.base&&pi===pet.pi)?eqApply(s):s}}

/* ---------- Hiệu ứng bộ trong trận (được sim() trong 06-mobs.js gọi) ---------- */
const EQFX={
 _n:'',
 note(){const n=EQFX._n;EQFX._n='';return n},
 init(P,Q){                                   /* đầu trận */
  EQFX._n='';P.fx=eqSetInfo().filter(x=>x.on).map(x=>({k:x.S.k,v:x.v}));
  for(const f of P.fx){const v=f.v;
   if(f.k==='shield')P.sh=(P.sh||0)+Math.round(P.mx*v.pct/100);
   else if(f.k==='weaken')Q.atk=Math.max(1,Math.round(Q.atk*(1-v.pct/100)));
   else if(f.k==='revive'){P.eqRv=1;P.eqRvP=v.pct}
   else if(f.k==='ambush')P.eqAC=Math.random()*100<v.ch?1:0;
   else if(f.k==='first'){P.spd=Math.max(P.spd,Q.spd);P.eqOpen=v.pct}}},
 pre(a,d,push){                               /* trước khi ra đòn: Vân Ẩn */
  if(d.eqCloud){d.eqCloud=0;push(a,'miss',0,'☁️ '+d.n+' ẩn mình trong mây, đòn trượt!');return true}
  return false},
 dodge(a,d,push){                             /* d vừa né đòn của a: Nguyệt Ảnh phản kích */
  if(!d.fx||a.hp<=0||d.hp<=0)return;
  for(const f of d.fx)if(f.k==='counter'&&Math.random()*100<f.v.ch){
   const x=Math.max(1,Math.round((d.atk+d.mag*.3)*1.6*100/(100+a.def)*d.r*f.v.mul/100));
   a.hp-=x;push(d,'hit',x,'🌙 Nguyệt Ảnh phản kích -'+x)}},
 mod(a,d,dm,cr){                              /* chỉnh sát thương của đòn đánh */
  let m=1;
  if(a.fx)for(const f of a.fx){const v=f.v;
   if(f.k==='sun'&&d.hp>d.mx*.6){m*=1+v.pct/100;EQFX._n+=' · ☀️ Dương Diệm'}
   else if(f.k==='judge'&&d.hp<d.mx*.3){m*=1+v.pct/100;EQFX._n+=' · ⚖️ Thần Phán'}
   else if(f.k==='star'&&cr){m*=1+v.pct/100;EQFX._n+=' · ✨ Tinh Quang'}
   else if(f.k==='first'&&a.eqOpen){m*=1+a.eqOpen/100;a.eqOpen=0;EQFX._n+=' · 🪽 Thiên Uy'}}
  if(d.fx)for(const f of d.fx)if(f.k==='mist'&&Math.random()*100<f.v.ch){m*=.5;EQFX._n+=' · 🌫️ Sương Tán'}
  return m===1?dm:Math.max(1,Math.round(dm*m))},
 after(a,d,dm,cr,push){                       /* sau khi đòn đã trúng */
  if(dm<=0)return;
  if(a.fx)for(const f of a.fx){const v=f.v;
   if(d.hp<=0)break;
   if(f.k==='thunder'&&Math.random()*100<v.ch){const x=Math.max(1,Math.round(dm*(1+v.pct/100)));d.hp-=x;push(a,'hit',x,'⚡ Lôi Phạt giáng xuống -'+x)}
   else if(f.k==='wind'&&Math.random()*100<v.ch){const x=Math.max(1,Math.round(dm*v.pct/100));d.hp-=x;push(a,'hit',x,'🌪️ Phong Nhận chém thêm -'+x)}}
  if(d.fx)for(const f of d.fx){const v=f.v;
   if(a.hp<=0)break;
   if(f.k==='frost'&&!a.stn&&Math.random()*100<v.ch)a.stn=2;
   else if(f.k==='thorn'&&Math.random()*100<v.ch){const x=Math.max(1,Math.round(dm*v.pct/100));a.hp-=x;push(d,'hit',x,'💠 Phản Chấn -'+x)}}},
 round(P,Q,r,push){                           /* cuối mỗi hiệp */
  if(!P.fx)return;
  for(const f of P.fx){const v=f.v;
   if(P.hp<=0||Q.hp<=0)break;
   if(f.k==='grove'){const p=v.pct*(P.hp<P.mx*.5?2:1),h=Math.min(P.mx-P.hp,Math.round(P.mx*p/100));if(h>0){P.hp+=h;push(P,'heal',h,'🌿 Sinh Cơ Cổ Thụ +'+h+' HP')}}
   else if(f.k==='lava'&&Math.random()*100<v.ch){const x=Math.max(1,Math.round(P.atk*v.pct/100));Q.hp-=x;push(P,'hit',x,'🌋 Dung Nham Phun Trào -'+x)}
   else if(f.k==='cloud'&&Math.random()*100<v.ch)P.eqCloud=1}}};
window.EQFX=EQFX;

/* ---------- Thao tác kho / mặc / tháo / bán ---------- */
const eqSelItem=()=>eqSel?(eqSel.w?eqWorn[eqSel.i]:ebag[eqSel.i]):null;
function eqSetTab(t){eqTab=t;eqMsg='';renderEquip()}
function eqPick(w,i){eqSel={w,i};eqMsg='';renderEquip()}
function eqSort(){const cur=eqSelItem();ebag.sort((a,b)=>b.z-a.z||b.q-a.q||a.s-b.s);eqSel=cur&&!eqSel.w?{w:false,i:ebag.indexOf(cur)}:eqSel;renderEquip()}
function eqEquip(){
 if(!eqSel||eqSel.w)return;const it=ebag[eqSel.i];if(!it)return;
 if(level<it.lv){eqMsg='<span class="bad">Cần đạt cấp '+it.lv+' để mặc món này.</span>';renderEquip();return}
 const old=eqWorn[it.s];eqWorn[it.s]=it;
 if(old)ebag[eqSel.i]=old;else ebag.splice(eqSel.i,1);
 eqSel={w:true,i:it.s};eqMsg='<span class="ok">Đã mặc '+eqName(it)+'.</span>';
 renderInfo();renderEquip()}
function eqUnequip(){
 if(!eqSel||!eqSel.w)return;const it=eqWorn[eqSel.i];if(!it)return;
 if(ebag.length>=EQ_BAG){eqMsg='<span class="bad">Kho trang bị đã đầy ('+EQ_BAG+' ô).</span>';renderEquip();return}
 eqWorn[eqSel.i]=null;ebag.push(it);eqSel={w:false,i:ebag.length-1};eqMsg='';
 renderInfo();renderEquip()}
function eqSell(){
 if(!eqSel||eqSel.w)return;const it=ebag[eqSel.i];if(!it)return;
 if(it.q>=3&&!confirm('Bán '+eqName(it)+' ('+QN[it.q]+' phẩm)?'))return;
 const g=eqSellPrice(it);ebag.splice(eqSel.i,1);gold+=g;stats();eqSel=null;
 log('💰 Bán <b>'+eqName(it)+'</b>, nhận <b style="color:var(--gold)">'+g+'</b> xu.');
 eqMsg='<span class="ok">Đã bán, +'+g+' xu.</span>';renderEquip()}

/* ---------- Rèn ---------- */
function fgSetSlot(s){fgSlot=s;eqMsg='';renderEquip()}
function fgSetZone(z){fgZone=+z;fgOpen=false;eqMsg='';renderEquip()}
function fgToggle(){fgOpen=!fgOpen;renderEquip()}
function fgIds(z,s){return{boss:ZB_ID(z),main:ZM_ID(z,EQ_SLOTS[s].cat),shared:ZM_ID(z,EQ_SHARED)}}
function fgDo(){
 if(!hatched||!pet)return;
 const z=fgZone,s=fgSlot,need=eqNeed(z),ids=fgIds(z,s);
 const miss=[];
 for(const k of['boss','main','shared'])if(cnt(ids[k])<need[k])miss.push(ITEMS[ids[k]].n+' ('+cnt(ids[k])+'/'+need[k]+')');
 if(miss.length){eqMsg='<span class="bad">Chưa đủ nguyên liệu: '+miss.join(', ')+'.</span>';upToast('warn','⚠️ CHƯA ĐỦ NGUYÊN LIỆU','Còn thiếu: '+miss.join(', ')+'.');renderEquip();return}
 if(gold<need.xu){eqMsg='<span class="bad">Không đủ xu: cần '+need.xu+', bạn có '+gold+'.</span>';upToast('warn','⚠️ KHÔNG ĐỦ XU','Cần '+need.xu+' xu, bạn đang có '+gold+' xu.');renderEquip();return}
 if(ebag.length>=EQ_BAG){eqMsg='<span class="bad">Kho trang bị đã đầy ('+EQ_BAG+' ô). Hãy bán bớt.</span>';upToast('warn','🎒 KHO TRANG BỊ ĐẦY','Hãy bán hoặc dọn bớt đồ rồi rèn tiếp.');renderEquip();return}
 for(const k of['boss','main','shared'])removeItem(ids[k],need[k]);
 gold-=need.xu;stats();
 const q=pick(EQ_QW),it=eqRoll(z,s,q);ebag.push(it);fgLast=it;
 const col=eqRgb(it);
 eqMsg='<span class="ok">✨ Rèn ra <b style="color:'+col+'">['+QN[q]+'] '+eqName(it)+'</b>!</span>';
 upToast('ok','🔨 RÈN THÀNH CÔNG','<b style="color:'+col+'">['+QN[q]+' phẩm] '+eqName(it)+'</b><br>'+it.L.map(eqLine).join('<br>')+(q>=3?'<br>🌟 Món hiếm!':''));
 log('🔨 Rèn ra <b style="color:'+col+'">['+QN[q]+'] '+eqName(it)+'</b> (−'+need.xu+' xu).');
 renderEquip()}

/* ---------- Giao diện ---------- */
function eqItemHtml(it,withCmp){
 if(!it)return'<small>Chạm vào một món trang bị để xem.</small>';
 let h='<b style="color:'+eqRgb(it)+'">['+QN[it.q]+'] '+eqName(it)+'</b><br><small'+(level<it.lv?' class="bad"':'')+'>Cấp yêu cầu '+it.lv+' · Bộ '+VAN_KIEP_ZONES[it.z].name+(it.q?' · Phẩm +'+Math.round(EQ_QBONUS[it.q]*100)+'%':'')+'</small>'+
  it.L.map(l=>'<div>'+eqLine(l)+'</div>').join('');
 const w=withCmp?eqWorn[it.s]:null;
 if(w)h+='<small style="color:var(--mute)">Đang mặc: <span style="color:'+eqRgb(w)+'">['+QN[w.q]+'] '+eqName(w)+'</span><br>'+w.L.map(eqLine).join(' · ')+'</small>';
 return h}
function eqStatBox(){
 const T=eqTotals(),any=Object.keys(T).some(k=>T[k]>0);
 let h='<div style="text-align:center;font-weight:800;color:var(--gold);margin-bottom:3px">📊 Chỉ số trang bị đang mang</div>';
 if(!any)return h+'<small>Chưa mang món trang bị nào.</small>';
 h+='<div class="eqstat">'+Object.keys(EQ_STATS).map(k=>{const d=EQ_STATS[k],v=_r1(T[k]);
  return'<div'+(v>0?'':' class="z"')+'><span>'+d.n+'</span><b>'+(v>0?'+'+v+(d.t==='p'?'%':''):'—')+'</b></div>'}).join('')+'</div>';
 const si=eqSetInfo();
 h+='<div style="margin-top:4px;border-top:1px solid #3a4a44;padding-top:3px">'+(si.length?si.map(x=>{
  const hd='<b style="color:'+ZONE_COL[x.z]+'">'+x.S.i+' Bộ '+VAN_KIEP_ZONES[x.z].name+'</b> '+x.n+'/4';
  if(!x.on)return'<div>'+hd+' · <small>mặc thêm '+(2-x.n)+' món để kích hoạt <b>'+x.S.name+'</b></small></div>';
  return'<div>'+hd+' · <span class="ok"><b>'+x.S.name+'</b>'+(x.full?' (đủ bộ)':'')+(x.qb>0?' · phẩm +'+Math.round(x.qb*100)+'%':'')+'</span><br><small>'+x.S.t(x.v)+'</small></div>'}).join(''):'<small>Chưa có buff bộ. Mặc 2 món cùng bộ để kích hoạt, đủ 4 món buff mạnh hơn.</small>')+'</div>';
 return h}
function eqWearHtml(){
 const B=BL[pet.bl],pos=[[50,14],[14,56],[86,56],[50,86]];
 let circ='<div class="upcircle"><svg viewBox="0 0 100 100"><circle cx="50" cy="56" r="38" class="r1"/><circle cx="50" cy="56" r="31" class="r2"/></svg>'+
  '<div class="uppet" style="background:radial-gradient(circle,rgba('+B.au+',.55),rgba('+B.au+',.08) 70%)"><canvas id="eq-pet" width="128" height="128"></canvas></div>';
 for(let s=0;s<4;s++){
  const it=eqWorn[s],sel=eqSel&&eqSel.w&&eqSel.i===s;
  circ+='<button class="upslot eqs'+(sel?' sel':'')+'" style="left:'+pos[s][0]+'%;top:'+pos[s][1]+'%;border-color:'+(it?eqRgb(it):'#4d533b')+'!important" onclick="eqPick(true,'+s+')" title="'+EQ_SLOTS[s].n+'">'+
   '<span style="opacity:'+(it?1:.35)+'">'+EQ_SLOTS[s].i+'</span>'+(it?'<b>'+(it.z+1)+'</b>':'')+'</button>'}
 circ+='</div>';
 let bagH='<div class="eqbag" id="eq-bag">';
 for(let i=0;i<EQ_BAG;i++){
  const it=ebag[i];
  if(!it){bagH+='<button class="slot" disabled style="opacity:.3"></button>';continue}
  const sel=eqSel&&!eqSel.w&&eqSel.i===i;
  bagH+='<button class="slot'+(sel?' sel':'')+'" style="border-color:'+(sel?'var(--gold)':eqRgb(it))+'" onclick="eqPick(false,'+i+')" title="'+eqName(it)+'"><span>'+EQ_SLOTS[it.s].i+'</span><b>'+(it.z+1)+'</b></button>'}
 bagH+='</div>';
 const it=eqSelItem();
 let btns='';
 if(it&&eqSel.w)btns='<button class="mini" onclick="eqUnequip()">⬇ Tháo</button>';
 else if(it)btns='<button class="mini jade" onclick="eqEquip()">⬆ Mặc</button><button class="mini" onclick="eqSell()">💰 Bán '+eqSellPrice(it)+'</button>';
 return'<div class="infobox" style="text-align:center;margin-bottom:4px">Trang bị thú · Cấp <b style="color:var(--jade)">'+level+'</b></div>'+
  '<div class="upgrid"><div>'+circ+'</div><div><div class="eqhead"><span>Kho <b id="eq-cnt">'+ebag.length+'/'+EQ_BAG+'</b></span><button class="mini" onclick="eqSort()">Sắp xếp</button></div>'+bagH+'</div></div>'+
  '<div class="infobox upnote" style="margin-top:5px">'+eqItemHtml(it,true)+'</div>'+
  (btns?'<div class="eqbtns">'+btns+'</div>':'')+
  '<div class="infobox upmsg">'+eqMsg+'</div>'+
  '<div class="infobox upnote eqsum">'+eqStatBox()+'</div>'}
function eqForgeHtml(){
 if(fgZone<0)fgZone=VAN_KIEP_ZONE_AT_LEVEL(level);
 const z=fgZone,s=fgSlot,need=eqNeed(z),Z=VAN_KIEP_ZONES[z],zb=VAN_KIEP_ZONE_BOUNDS[z],ids=fgIds(z,s),S=EQ_SETS[z];
 const defs=[[ids.boss,need.boss,50,18],[ids.main,need.main,17,75],[ids.shared,need.shared,83,75],['xu',need.xu,50,50]];
 let circ='<div class="upcircle"><svg viewBox="0 0 100 100"><circle cx="50" cy="56" r="38" class="r1"/><circle cx="50" cy="56" r="31" class="r2"/><polygon points="50,18 17,75 83,75" class="tri"/></svg>';
 for(const[id,n,x,y]of defs){
  const isXu=id==='xu',have=isXu?gold:cnt(id),it=isXu?{i:'🪙',col:'#ffd24a'}:ITEMS[id],full=have>=n;
  if(isXu){continue}
  circ+='<div class="upslot'+(full?' full':'')+'" style="left:'+x+'%;top:'+y+'%" title="'+it.n+'"><span style="color:'+(it.col||'inherit')+'">'+it.i+'</span><b>'+Math.min(have,999)+'/'+n+'</b></div>'}
 circ+='<div class="uppet" style="font-size:30px;background:radial-gradient(circle,rgba(255,200,110,.35),rgba(255,200,110,.05) 70%)">'+EQ_SLOTS[s].i+'</div></div>';
 const slotBtns=EQ_SLOTS.map((o,i)=>'<button class="mini'+(i===s?' jade':'')+'" onclick="fgSetSlot('+i+')" title="'+o.n+'">'+o.i+'</button>').join('');
 const zoneBtn='<button class="eqzone" onclick="fgToggle()">🗺️ Bộ '+Z.name+' · cấp '+zb.start+'+'+(fgOpen?' ▴':' ▾')+'</button>';
 const zoneList=fgOpen?'<div class="eqzlist">'+VAN_KIEP_ZONES.map((q,i)=>'<div class="eqz'+(i===z?' on':'')+'" onclick="fgSetZone('+i+')"><span>'+(i===z?'✅ ':'🗺️ ')+q.name+'</span><span>cấp '+VAN_KIEP_ZONE_BOUNDS[i].start+'+</span></div>').join('')+'</div>':'';
 const tot=EQ_QW.reduce((a,b)=>a+b,0),odds=EQ_QW.map((w,i)=>'<span style="color:rgb('+QC[i]+')">'+QN[i]+' '+Math.round(w/tot*1000)/10+'% (+'+Math.round(EQ_QBONUS[i]*100)+'%)</span>').join(' · ');
 let last='';
 if(fgLast)last='<div class="infobox upnote" style="margin-top:5px"><small>Món vừa rèn (đã vào kho):</small><br>'+eqItemHtml(fgLast,false)+'</div>';
 const src=(id,z2,cat)=>'<div><span style="color:'+ZONE_COL[z2]+'">'+ITEMS[id].i+' '+ITEMS[id].n+'</span> ×<b>'+cnt(id)+'/'+(cat==='boss'?need.boss:cat==='main'?need.main:need.shared)+'</b></div>';
 return'<div class="infobox" style="text-align:center;margin-bottom:4px">'+zoneBtn+'</div>'+zoneList+
  '<div class="upgrid"><div>'+circ+'</div><div><div class="infobox" style="margin-bottom:4px"><small>Chọn ô trang bị:</small></div><div class="eqslotbtn">'+slotBtns+'</div>'+
  '<div class="infobox upinfo"><b style="color:'+ZONE_COL[z]+'">'+EQ_SLOTS[s].n+' '+Z.name+'</b><br><small>Cấp yêu cầu '+zb.start+'</small></div></div></div>'+
  '<div class="infobox upnote" style="margin-top:5px">📦 <b>Nguyên liệu cần:</b>'+src(ids.boss,z,'boss')+src(ids.main,z,'main')+src(ids.shared,z,'shared')+'<div>🪙 Xu ×<b>'+gold+'/'+need.xu+'</b></div></div>'+
  '<div class="infobox upnote" style="margin-top:5px"><b style="color:'+ZONE_COL[z]+'">'+S.i+' Buff bộ: '+S.name+'</b><br><small>2 món: '+S.t(eqScale(S.v2,0))+'<br>4 món: '+S.t(eqScale(S.v4,0))+'</small></div>'+
  '<div class="infobox upnote" style="margin-top:5px">🎲 Phẩm ngẫu nhiên: '+odds+'<br><small>Phẩm cao cộng thêm % cho mọi chỉ số và buff bộ. Mỗi món có '+EQ_LINES+' dòng chỉ số ngẫu nhiên.</small></div>'+
  '<button class="jade" style="margin-top:5px" onclick="fgDo()">🔨 Rèn trang bị</button>'+last+
  '<div class="infobox upmsg">'+eqMsg+'</div>'}
function renderEquip(){
 const el=$('eq-wrap');if(!el)return;
 if(!hatched||!pet){el.innerHTML='<div class="infobox" style="text-align:center">Cần nở thú trước khi dùng trang bị.</div>';return}
 const keep=document.getElementById('eq-bag'),sc=keep?keep.scrollTop:0;
 el.innerHTML='<div class="eqtabs"><button class="mini'+(eqTab==='wear'?' jade':'')+'" onclick="eqSetTab(\'wear\')">🛡️ Trang bị</button><button class="mini'+(eqTab==='forge'?' jade':'')+'" onclick="eqSetTab(\'forge\')">🔨 Rèn</button></div>'+(eqTab==='wear'?eqWearHtml():eqForgeHtml());
 const nb=document.getElementById('eq-bag');if(nb)nb.scrollTop=sc;
 if(!eqRaf)eqRaf=requestAnimationFrame(eqLoop)}
function eqLoop(t){
 const cv=document.getElementById('eq-pet');
 if(!cv||!pet||!document.getElementById('equip-box').open){eqRaf=0;return}
 const x=cv.getContext('2d'),api=window.VanKiepSprites;x.clearRect(0,0,128,128);x.imageSmoothingEnabled=false;
 const sh=api?api.getSheet(pet.bl,pet.sp):null,r=api?api.frameRect(stageOf(level),Math.floor(t/200)%api.frameCount):null;
 if(sh&&r)x.drawImage(sh,r.sx,r.sy,r.sw,r.sh,0,0,128,128);
 else{const im=spriteFor(pet.bl,pet.sp);if(im.complete&&im.naturalWidth)x.drawImage(im,0,0,128,128)}
 eqRaf=requestAnimationFrame(eqLoop)}
document.getElementById('equip-box').addEventListener('toggle',e=>{if(e.target.open)renderEquip()});
renderEquip();
