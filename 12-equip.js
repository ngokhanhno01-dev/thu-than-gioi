/* ===== Trang bị: 4 ô · bộ theo vùng · rèn kiểu gacha =====
   - 17 vùng = 17 bộ. Mỗi bộ có 4 món (Vũ Khí, Giáp, Vòng, Ngọc). Mặc 2 món cùng vùng: buff của vùng; đủ 4 món: buff mạnh hơn.
   - Rèn: Tinh Hoa của vùng + nguyên liệu theo ô (Móng/Vảy/Nanh/Nhãn) + xu. Phẩm (Phàm→Thần) quay gacha.
   - Chỉ số mỗi dòng ngẫu nhiên; giá trị tính theo chỉ số tham chiếu của cấp vùng nên không lệch cân bằng.
   Mọi con số sửa ở khối cấu hình ngay bên dưới. */

/* ---------- Cấu hình ---------- */
const EQ_SLOTS=[
 {n:'Vũ Khí',i:'⚔️',mat:'mong'},
 {n:'Giáp',  i:'🛡️',mat:'vay'},
 {n:'Vòng',  i:'📿',mat:'nanh'},
 {n:'Ngọc',  i:'💎',mat:'nhan'}];
const EQ_BAG=100;                    /* số ô kho trang bị */
const EQ_QW=[55,28,12,4,1];          /* tỉ lệ gacha phẩm: Phàm / Linh / Địa / Thiên / Thần (dùng tên + màu QN, QC có sẵn) */
const EQ_QMUL=[1,1.15,1.35,1.6,2];   /* phẩm càng cao, mỗi dòng càng mạnh */
const EQ_LINES=[2,2,3,3,4];          /* số dòng chỉ số theo phẩm */
const EQ_ROLL=[.6,1];                /* mỗi dòng roll từ 60% đến 100% giá trị tối đa */
const EQ_STATS={                     /* b = giá trị gốc. t:'f' = số cố định (tính theo % chỉ số tham chiếu), t:'p' = % điểm */
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
const EQ_SET={2:1,4:2.5};            /* mặc 2 món cùng vùng: ×1 buff vùng · đủ 4 món: ×2,5 */
const EQ_STAT_NAME={hp:'Sinh Lực',atk:'Công',def:'Thủ',spd:'Tốc',mag:'Linh',eva:'Né tránh',stun:'Choáng',regen:'Hồi/lượt',crit:'Chí mạng'};
function eqNeed(z){return{tinh:8+z,part:3+Math.floor(z/3),xu:40*(z+1)}}      /* giá rèn theo vùng z (0..16) */
function eqSellPrice(it){return Math.round((6+it.z*4)*(1+it.q*1.5))}

/* ---------- Nguyên liệu mới ---------- */
const EQ_MATS={
 mong:{n:'Móng Vuốt',i:'🐾',col:'#ffb86b'},
 vay: {n:'Vảy Giáp', i:'🐟',col:'#6fc3e0'},
 nanh:{n:'Nanh Thú', i:'🦷',col:'#f0e6c8'},
 nhan:{n:'Nhãn Châu',i:'👁️',col:'#c08aff'}};
for(const id in EQ_MATS){
 const m=EQ_MATS[id],sl=EQ_SLOTS.find(s=>s.mat===id);
 ITEMS[id]={n:m.n,i:m.i,col:m.col,d:'Nguyên liệu rèn '+sl.n+' (mở mục 🛡️ Trang bị → Rèn).',use:null};
 SELL_PRICE[id]=8;HL_ITEM[id]=m.col}
for(let k=0;k<17;k++)ITEMS['mat'+k].d='Nâng cấp huyết mạch thú vùng '+EPI[k][0]+' và rèn trang bị bộ '+VAN_KIEP_ZONES[k].name+'.';
{const _bu2=bagUse;bagUse=function(){const s=bag[bagSel];if(s&&EQ_MATS[s.id]){log('🛡️ <b>'+ITEMS[s.id].n+'</b> dùng ở mục <b>Trang bị → Rèn</b>.');return}_bu2()}}

/* ---------- Dữ liệu ---------- */
let eqWorn=[null,null,null,null],ebag=[],eqUid=1,eqTab='wear',eqSel=null,fgSlot=0,fgZone=-1,fgLast=null,eqMsg='',eqRaf=0;
const eqRgb=it=>'rgb('+QC[it.q]+')';
const eqName=it=>EQ_SLOTS[it.s].n+' '+VAN_KIEP_ZONES[it.z].name;
const eqLine=l=>{const d=EQ_STATS[l[0]];return d.n+' +'+l[1]+(d.t==='p'?'%':'')};
function eqRef(z){const zb=VAN_KIEP_ZONE_BOUNDS[z];return 72/5*(1+3*petGrow((zb.start+zb.end)/2))}

function eqRoll(z,s,q){
 const ref=eqRef(z),keys=Object.keys(EQ_STATS);
 for(let i=keys.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[keys[i],keys[j]]=[keys[j],keys[i]]}
 const L=keys.slice(0,EQ_LINES[q]).map(k=>{
  const d=EQ_STATS[k],r=EQ_ROLL[0]+Math.random()*(EQ_ROLL[1]-EQ_ROLL[0]),pct=d.b*EQ_QMUL[q]*r;
  return[k,d.t==='f'?Math.max(1,Math.round(ref*(k==='hp'?8:1)*pct/100)):Math.round(pct*10)/10]});
 return{uid:eqUid++,z,s,q,lv:VAN_KIEP_ZONE_BOUNDS[z].start,L}}

/* ---------- Tổng chỉ số + buff bộ ---------- */
function eqTotals(){
 const t={hp:0,atk:0,def:0,spd:0,mag:0,eva:0,stun:0,regen:0,crit:0},m={hp:0,atk:0,def:0,spd:0,mag:0},c={},sets=[];
 for(const it of eqWorn){if(!it)continue;c[it.z]=(c[it.z]||0)+1;for(const[k,v]of it.L)t[k]+=v}
 for(const z in c){
  const n=c[z],mult=n>=4?EQ_SET[4]:n>=2?EQ_SET[2]:0,b=VAN_KIEP_ZONES[z].buff;
  sets.push({z:+z,n,mult,b});
  if(!mult)continue;
  const p=b.pct*mult;
  if(b.stat in m)m[b.stat]+=p;else if(b.stat==='regen')t.regen+=p/2;else if(b.stat in t)t[b.stat]+=p}
 return{t,m,sets}}
function eqSetTxt(b,mult){const v=Math.round(b.pct*mult*(b.stat==='regen'?.5:1)*10)/10;return b.label+': +'+v+'% '+(EQ_STAT_NAME[b.stat]||b.stat)}
function eqApply(s){
 const T=eqTotals();
 for(const k of['hp','atk','def','spd','mag'])s[k]=Math.round((s[k]+T.t[k])*(1+T.m[k]/100));
 for(const k in EQ_CAP)s[k]=Math.min(EQ_CAP[k],(s[k]||0)+T.t[k]);
 return s}
{const _statsOf0=statsOf;
 statsOf=function(bl,pi,base,a){
  const s=_statsOf0(bl,pi,base,a);
  return(pet&&!pv.on&&bl===pet.bl&&base===pet.base&&pi===pet.pi)?eqApply(s):s}}

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
function fgSetZone(z){fgZone=+z;eqMsg='';renderEquip()}
function fgDo(){
 if(!hatched||!pet)return;
 const z=fgZone,s=fgSlot,need=eqNeed(z),ids={tinh:'mat'+z,part:EQ_SLOTS[s].mat};
 const miss=[];
 if(cnt(ids.tinh)<need.tinh)miss.push(ITEMS[ids.tinh].n+' ('+cnt(ids.tinh)+'/'+need.tinh+')');
 if(cnt(ids.part)<need.part)miss.push(ITEMS[ids.part].n+' ('+cnt(ids.part)+'/'+need.part+')');
 if(miss.length){eqMsg='<span class="bad">Chưa đủ nguyên liệu: '+miss.join(', ')+'.</span>';upToast('warn','⚠️ CHƯA ĐỦ NGUYÊN LIỆU','Còn thiếu: '+miss.join(', ')+'.');renderEquip();return}
 if(gold<need.xu){eqMsg='<span class="bad">Không đủ xu: cần '+need.xu+', bạn có '+gold+'.</span>';upToast('warn','⚠️ KHÔNG ĐỦ XU','Cần '+need.xu+' xu, bạn đang có '+gold+' xu.');renderEquip();return}
 if(ebag.length>=EQ_BAG){eqMsg='<span class="bad">Kho trang bị đã đầy ('+EQ_BAG+' ô). Hãy bán bớt.</span>';upToast('warn','🎒 KHO TRANG BỊ ĐẦY','Hãy bán hoặc dọn bớt đồ rồi rèn tiếp.');renderEquip();return}
 removeItem(ids.tinh,need.tinh);removeItem(ids.part,need.part);gold-=need.xu;stats();
 const q=pick(EQ_QW),it=eqRoll(z,s,q);ebag.push(it);fgLast=it;
 const col=eqRgb(it);
 eqMsg='<span class="ok">✨ Rèn ra <b style="color:'+col+'">['+QN[q]+'] '+eqName(it)+'</b>!</span>';
 upToast('ok','🔨 RÈN THÀNH CÔNG','<b style="color:'+col+'">['+QN[q]+' phẩm] '+eqName(it)+'</b><br>'+it.L.map(eqLine).join('<br>')+(q>=3?'<br>🌟 Món hiếm!':''));
 log('🔨 Rèn ra <b style="color:'+col+'">['+QN[q]+'] '+eqName(it)+'</b> (−'+need.xu+' xu).');
 renderEquip()}

/* ---------- Giao diện ---------- */
function eqItemHtml(it,withCmp){
 if(!it)return'<small>Chạm vào một món trang bị để xem.</small>';
 let h='<b style="color:'+eqRgb(it)+'">['+QN[it.q]+'] '+eqName(it)+'</b><br><small'+(level<it.lv?' class="bad"':'')+'>Cấp yêu cầu '+it.lv+' · Bộ '+VAN_KIEP_ZONES[it.z].name+'</small>'+
  it.L.map(l=>'<div>'+eqLine(l)+'</div>').join('');
 const w=withCmp?eqWorn[it.s]:null;
 if(w)h+='<small style="color:var(--mute)">Đang mặc: <span style="color:'+eqRgb(w)+'">['+QN[w.q]+'] '+eqName(w)+'</span><br>'+w.L.map(eqLine).join(' · ')+'</small>';
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
 const T=eqTotals();
 const setH=T.sets.length?T.sets.map(x=>'<div><b style="color:'+ZONE_COL[x.z]+'">Bộ '+VAN_KIEP_ZONES[x.z].name+'</b> '+x.n+'/4 · '+(x.mult?'<span class="ok">'+eqSetTxt(x.b,x.mult)+'</span>':'<small>cần 2 món: '+eqSetTxt(x.b,1)+'</small>')+'</div>').join(''):'<small>Mặc 2 món cùng bộ để có buff của vùng, đủ 4 món buff mạnh hơn (×'+EQ_SET[4]+').</small>';
 return'<div class="infobox" style="text-align:center;margin-bottom:4px">Trang bị thú · Cấp <b style="color:var(--jade)">'+level+'</b></div>'+
  '<div class="upgrid"><div>'+circ+'</div><div><div class="eqhead"><span>Kho <b id="eq-cnt">'+ebag.length+'/'+EQ_BAG+'</b></span><button class="mini" onclick="eqSort()">Sắp xếp</button></div>'+bagH+'</div></div>'+
  '<div class="infobox upnote" style="margin-top:5px">'+eqItemHtml(it,true)+'</div>'+
  (btns?'<div class="eqbtns">'+btns+'</div>':'')+
  '<div class="infobox upnote" style="margin-top:5px">'+setH+'</div>'+
  '<div class="infobox upmsg">'+eqMsg+'</div>'}
function eqForgeHtml(){
 if(fgZone<0)fgZone=VAN_KIEP_ZONE_AT_LEVEL(level);
 const z=fgZone,s=fgSlot,need=eqNeed(z),Z=VAN_KIEP_ZONES[z],zb=VAN_KIEP_ZONE_BOUNDS[z];
 const defs=[[ 'mat'+z,need.tinh,50,18,null],[EQ_SLOTS[s].mat,need.part,17,75,null],['xu',need.xu,83,75,null]];
 let circ='<div class="upcircle"><svg viewBox="0 0 100 100"><circle cx="50" cy="56" r="38" class="r1"/><circle cx="50" cy="56" r="31" class="r2"/><polygon points="50,18 17,75 83,75" class="tri"/></svg>'+
  '<div class="uppet" style="font-size:34px;background:radial-gradient(circle,rgba(255,200,110,.35),rgba(255,200,110,.05) 70%)">'+EQ_SLOTS[s].i+'</div>';
 for(const[id,n,x,y]of defs){
  const have=id==='xu'?gold:cnt(id),it=id==='xu'?{i:'🪙',col:'#ffd24a'}:ITEMS[id],full=have>=n;
  circ+='<div class="upslot'+(full?' full':'')+'" style="left:'+x+'%;top:'+y+'%"><span style="color:'+(it.col||'inherit')+'">'+it.i+'</span><b>'+(id==='xu'?(full?'✔':have)+'/'+n:Math.min(have,99)+'/'+n)+'</b></div>'}
 circ+='</div>';
 const slotBtns=EQ_SLOTS.map((o,i)=>'<button class="mini'+(i===s?' jade':'')+'" onclick="fgSetSlot('+i+')" title="'+o.n+'">'+o.i+'</button>').join('');
 const zoneSel='<select class="eqsel" onchange="fgSetZone(this.value)">'+VAN_KIEP_ZONES.map((q,i)=>'<option value="'+i+'"'+(i===z?' selected':'')+'>Bộ '+q.name+' · cấp '+VAN_KIEP_ZONE_BOUNDS[i].start+'+</option>').join('')+'</select>';
 const tot=EQ_QW.reduce((a,b)=>a+b,0),odds=EQ_QW.map((w,i)=>'<span style="color:rgb('+QC[i]+')">'+QN[i]+' '+Math.round(w/tot*1000)/10+'%</span>').join(' · ');
 let last='';
 if(fgLast)last='<div class="infobox upnote" style="margin-top:5px"><small>Món vừa rèn (đã vào kho):</small><br>'+eqItemHtml(fgLast,false)+'</div>';
 return'<div class="infobox" style="text-align:center;margin-bottom:4px">'+zoneSel+'</div>'+
  '<div class="upgrid"><div>'+circ+'</div><div><div class="infobox" style="margin-bottom:4px"><small>Chọn ô trang bị:</small></div><div class="eqslotbtn">'+slotBtns+'</div>'+
  '<div class="infobox upinfo"><b style="color:'+ZONE_COL[z]+'">'+EQ_SLOTS[s].n+' '+Z.name+'</b><br><small>Cấp yêu cầu '+zb.start+'<br>Bộ: '+Z.buff.label+' ('+Z.buff.desc+')</small></div></div></div>'+
  '<div class="infobox upnote" style="margin-top:5px">📦 Cần: <b>'+need.tinh+'</b> '+ITEMS['mat'+z].n+' · <b>'+need.part+'</b> '+ITEMS[EQ_SLOTS[s].mat].n+' · <b>'+need.xu+'</b> xu<br>🎲 Phẩm ngẫu nhiên: '+odds+'<br>📈 Số dòng chỉ số: '+EQ_LINES.map((n,i)=>'<span style="color:rgb('+QC[i]+')">'+n+'</span>').join('/')+' (theo phẩm), chỉ số ngẫu nhiên.</div>'+
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
