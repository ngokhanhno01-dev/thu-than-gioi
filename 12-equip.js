/* ===== Trang bị: 4 ô · 17 bộ theo vùng · rèn kiểu gacha =====
   - 17 vùng = 17 bộ. Mỗi bộ 4 món (Vũ Khí, Giáp, Vòng, Ngọc).
   - Mặc 2 món cùng vùng: kích hoạt buff bộ (hiệu ứng riêng của vùng); đủ 4 món: buff mạnh hơn.
   - Rèn: Tinh Hoa [boss] + nguyên liệu của quái vùng đó + Linh Cốt (quái 5) + xu. Phẩm (Phàm→Thần) quay gacha.
   - Phẩm cao: MỌI chỉ số và buff bộ cộng thêm % (xem EQ_QBONUS).
   - Trang bị KHÔNG rơi từ quái, chỉ rèn được. Mọi con số sửa ở khối cấu hình ngay bên dưới. */

/* ===== Pixel art icon 16x16 (vẽ bằng code, không cần file ảnh) =====
   Mỗi icon là lưới 16x16 ký tự. Viền đen được tự thêm quanh hình.
   m/l/d = màu vùng (chính / sáng / tối) · w trắng · g,G thép sáng/tối · y,Y vàng · n,N xương · r,R nâu · p đồng tử */
const PX_NEUT={w:'#ffffff',g:'#d3dce6',G:'#7f8c9c',s:'#eef3f8',y:'#ffd24a',Y:'#b8841c',n:'#f6eedc',N:'#c4b394',r:'#9a6238',R:'#5a3820',p:'#1a1022',k:'#150d1c'};
function pxMix(h,t,a){const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)),T=t?255:0;return'#'+c.map(v=>('0'+Math.round(v+(T-v)*a).toString(16)).slice(-2)).join('')}
function pxPal(col){return Object.assign({m:col,l:pxMix(col,1,.5),d:pxMix(col,0,.45)},PX_NEUT)}
function pxGrid(rows){const g=[];for(let y=0;y<16;y++){const r=(rows[y]||'');g.push((r+'................').slice(0,16).split(''))}return g}
function pxMirror(half,vert){ /* half: các hàng 8 cột trái → soi gương sang phải; vert=true thì soi cả trên/dưới */
 const rows=half.map(r=>{r=(r+'........').slice(0,8);return r+r.split('').reverse().join('')});
 if(!vert)return pxGrid(rows);
 const out=rows.slice(0,8);while(out.length<8)out.push('.'.repeat(16));
 return pxGrid(out.concat(out.slice().reverse()))}
function pxOutline(g){const o=g.map(r=>r.slice());
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){if(g[y][x]!=='.')continue;
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<16&&Y<16&&g[Y][X]!=='.'){o[y][x]='k';break}}}
 return o}
const PX_DRAW={
 claw:()=>pxGrid(['','......mmmmmm','....mmllmmmmmm','...mmlmmmmmmmmm','..mmlmmm....dmm','..mlmmm......dmm','..mmmm........dm','..dmmm.........d','...dmm','....dmm','.....dm','......d']),
 scale:()=>pxMirror(['','....mmmm','..mmllll','.mlllmmm','.mlmmmmm','mmlmmmdd','mmmlmmmd','mmmmdddm','.mmmmmmd','.dmmddmd','..dmmmmd','...ddmmd','.....ddd']),
 fang:()=>pxGrid(['','..mmmmmmmmmm','..mlmmmmmmdm','..nnnnnnnnnN','..nwnnnnnnNN','...nwnnnnnN','...nwnnnnNN','....nnnnnNN','....nnnnnN','.....nnnNN','.....nnnN','......nNN','......nN','.......N']),
 eye:()=>{const g=pxGrid([]);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x-7.5,dy=y-7.5,d=Math.hypot(dx,dy);
   if(d>6.4)continue;let c=(dx+dy>3.5)?'N':'n';
   if(d<4){c=(dx+dy<-1)?'l':(dx+dy>2)?'d':'m'}
   if(d<1.9)c='p';
   g[y][x]=c}
  g[5][5]='w';g[5][6]='w';g[6][5]='w';g[10][10]='l';return g},
 bone:()=>{const g=pxGrid([]);const P=(x,y,c)=>{if(x>=0&&y>=0&&x<16&&y<16)g[y][x]=c};
  for(let i=0;i<=7;i++){const x=4+i,y=12-i;P(x,y,'n');P(x,y-1,'n');P(x+1,y,'N');P(x+1,y-1,'N')}
  [[3,11],[3,12],[2,11],[2,12],[4,13],[5,13],[4,14],[5,14]].forEach(([x,y])=>P(x,y,'n')); /* đầu xương dưới-trái: 2 cục */
  [[10,2],[11,2],[10,3],[11,3],[12,4],[13,4],[12,5],[13,5]].forEach(([x,y])=>P(x,y,'n')); /* đầu xương trên-phải */
  [[3,12],[5,14],[11,3],[13,5],[2,12],[4,14],[10,3],[12,5]].forEach(([x,y])=>P(x,y,'N'));
  [[7,9],[8,8],[9,7]].forEach(([x,y])=>P(x,y,'m'));return g},
 essence:()=>pxMirror(['.......m','.......l','......ml','......ml','.....mml','...mmmll','.mlllllw','.mllwwww'],true),
 sword:()=>{const g=pxGrid([]);const P=(x,y,c)=>{if(x>=0&&y>=0&&x<16&&y<16)g[y][x]=c};
  P(14,1,'s');for(let i=1;i<=8;i++){P(14-i+0,1+i,'s');P(15-i,1+i,'g');P(15-i,2+i,'G')}
  P(15,2,'G');
  /* tay chắn (vàng) vuông góc lưỡi + cán nâu */
  [[2,8],[3,9],[4,10],[5,11],[6,12],[7,13],[3,8],[4,9],[5,10],[6,11],[7,12]].forEach(([x,y])=>P(x,y,'y'));
  [[2,9],[3,10],[4,11],[5,12],[6,13]].forEach(([x,y])=>P(x,y,'Y'));
  P(3,8,'m');P(7,12,'m');
  [[3,12],[2,13],[1,14]].forEach(([x,y])=>P(x,y,'r'));[[2,12],[1,13],[0,14]].forEach(([x,y])=>P(x,y,'R'));P(0,15,'m');P(1,15,'m');
  return g},
 armor:()=>pxMirror(['','.gggg','gwwgggg','gwggggmm','ggggggml','.gggmmml','.gggmlll','..ggmmlm','..gggmmm','...gggmm','...ggggm','....gggm','....ggdd','.....GGG']),
 ring:()=>{const g=pxGrid([]);for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x-7.5,dy=y-8.5,d=Math.hypot(dx,dy);
   if(d>=3.7&&d<=6.6)g[y][x]=(dx+dy<-2)?'s':(dx+dy>3)?'Y':'y'}
  [[7,1],[8,1],[6,2],[7,2],[8,2],[9,2],[7,3],[8,3]].forEach(([x,y])=>g[y][x]='m');
  g[2][7]='w';g[1][7]='l';g[1][8]='l';g[3][8]='d';return g},
 gem:()=>pxMirror(['','...lllll','..llwlmm','.lwwlmmm','lllllllm','.lmlmmmd','..lmmmdd','..lmmddd','...lmddd','....lmdd','.....lmd','......ld','.......d']),
};
const PX_CACHE={};
function pxData(kind,col){const k=kind+col;if(PX_CACHE[k])return PX_CACHE[k];
 const g=pxOutline(PX_DRAW[kind]()),P=pxPal(col);
 if(typeof document==='undefined')return g.map(r=>r.map(c=>c==='.'?null:P[c]||'#f0f'));
 const cv=document.createElement('canvas');cv.width=cv.height=16;const x=cv.getContext('2d');
 for(let j=0;j<16;j++)for(let i=0;i<16;i++){const c=g[j][i];if(c==='.')continue;x.fillStyle=P[c]||'#f0f';x.fillRect(i,j,1,1)}
 return PX_CACHE[k]=cv.toDataURL()}
/* trả về thẻ <img> pixel art để chèn vào HTML */
function pxImg(kind,col){return'<img class="pxi" alt="" src="'+pxData(kind,col||'#ffd24a')+'">'}

/* ---------- Cấu hình ---------- */
const EQ_CAT=[                       /* loại nguyên liệu = quái thứ 1..5 của vùng (tên vật phẩm = loại + tên quái) */
 {n:'Móng Vuốt',i:'🐾',px:'claw'},{n:'Vảy Giáp',i:'🐟',px:'scale'},{n:'Nanh Thú',i:'🦷',px:'fang'},{n:'Nhãn Châu',i:'👁️',px:'eye'},{n:'Linh Cốt',i:'🦴',px:'bone'}];
const EQ_SLOTS=[                     /* cat = loại nguyên liệu chính của ô; Linh Cốt (loại 5) dùng chung cho mọi ô */
 {n:'Vũ Khí',i:'⚔️',px:'sword',cat:0},
 {n:'Giáp',  i:'🛡️',px:'armor',cat:1},
 {n:'Vòng',  i:'📿',px:'ring',cat:2},
 {n:'Ngọc',  i:'💎',px:'gem',cat:3}];
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
  ITEMS[id]={n:c.n+' '+mn,i:pxImg(c.px,col),e:c.i,col,d:'Nguyên liệu bộ '+Z.name+', chỉ rơi từ '+mn+'. '+(s<EQ_SHARED?'Dùng rèn '+EQ_SLOTS[s].n+'.':'Dùng chung để rèn mọi món của bộ.')+' (mục 🛡️ Trang bị → Rèn)',use:null};
  SELL_PRICE[id]=6+z*2;HL_ITEM[id]=col});
 const bn=Z.bosses[0],bid=ZB_ID(z);
 ITEMS[bid]={n:'Tinh Hoa '+bn,i:pxImg('essence',col),e:'✨',col,d:'Tinh hoa của chủ vùng '+Z.name+', chỉ rơi từ boss '+bn+'. Dùng rèn mọi món của bộ. (mục 🛡️ Trang bị → Rèn)',use:null};
 SELL_PRICE[bid]=30+z*5;HL_ITEM[bid]=col}
for(let k=0;k<17;k++)ITEMS['mat'+k].d='Chỉ dùng nâng cấp huyết mạch cho thú vùng '+EPI[k][0]+' (mở mục 🩸 Huyết mạch).';
const eqIsMat=id=>/^z[mb]\d/.test(id);
{const _bu2=bagUse;bagUse=function(){const s=bag[bagSel];if(s&&eqIsMat(s.id)){log('🛡️ <b>'+ITEMS[s.id].n+'</b> dùng ở mục <b>Trang bị → Rèn</b>.');return}_bu2()}}


/* =====================================================================
   🎁 HỘP NGUYÊN LIỆU — vật phẩm trong balo (id 'hopnl')
   Nhận từ thư (rewards.items=[{id:'hopnl',q:N}]) -> vào balo như vật phẩm thường.
   Bấm "Dùng" -> chọn vùng -> trừ 1 hộp, cộng đủ nguyên liệu RÈN TRỌN 1 BỘ (mọi ô EQ_SLOTS) của vùng đó.
   Công thức (khớp fgDo): mỗi món cần eqNeed(z): boss + main (loại nguyên liệu của ô) + shared (Linh Cốt).
   => 1 bộ = Tinh Hoa boss × (boss × số ô) + mỗi loại nguyên liệu chính × main + Linh Cốt × (shared × số ô).
   KHÔNG gồm xu rèn (người chơi tự trả khi rèn).
   ===================================================================== */
PX_DRAW.chest=()=>pxGrid([
 '',
 '..mmmmmmmmmmmm',
 '.mlllllllllllmd',
 '.mlllllyyllllmd',
 '.mmmmmmyymmmmmd',
 '.yyyyyyyYyyyyyy',
 '.mmmmmmyymmmmmd',
 '.mlllllyyllllmd',
 '.mlllllYYllllmd',
 '.mmmmmmykmmmmmd',
 '.mmmmmmmmmmmmmd',
 '.mmmmmmmmmmmmmd',
 '.dddddddddddddd',
 '..dddddddddddd']);
ITEMS.hopnl={n:'Hộp Nguyên Liệu',i:pxImg('chest','#c9863a'),e:'🎁',col:'#ffd24a',
 d:'Bấm Dùng, chọn 1 vùng: nhận đủ nguyên liệu để rèn trọn 1 bộ trang bị (4 món) của vùng đó. (Xu rèn tự trả.)',use:null};
SELL_PRICE.hopnl=1;
try{HL_ITEM.hopnl='#ffd24a'}catch(_){}

function hopSetNeed(z){            /* danh sách [{id,q}] nguyên liệu của 1 bộ ở vùng z */
 const n=eqNeed(z),k=EQ_SLOTS.length,out=[];
 out.push({id:ZB_ID(z),q:n.boss*k});
 EQ_SLOTS.forEach(o=>out.push({id:ZM_ID(z,o.cat),q:n.main}));
 out.push({id:ZM_ID(z,EQ_SHARED),q:n.shared*k});
 return out}

/* Balo còn đủ chỗ sau khi trừ 1 hộp và cộng items không? (mô phỏng, không đụng balo thật) */
function hopRoomOk(items){
 const sim=bag.map(s=>({id:s.id,n:s.n})),bi=sim.findIndex(s=>s.id==='hopnl');
 if(bi<0)return false;
 sim[bi].n--;
 const arr=sim.filter(s=>s.n>0);let slots=arr.length;
 for(const it of items){let free=0;arr.forEach(s=>{if(s.id===it.id&&s.n<STACK)free+=STACK-s.n});
  slots+=Math.ceil(Math.max(0,it.q-free)/STACK)}
 return slots<=BAG_SLOTS}

let hopEl=null,hopZone=-1,hopBusy=false;
function hopStyle(){
 if(document.getElementById('hop-css'))return;
 const st=document.createElement('style');st.id='hop-css';
 st.textContent='#hop-ov{position:fixed;inset:0;z-index:99000;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center;padding:14px}'+
  '#hop-ov.show{display:flex}#hop-ov .box{width:100%;max-width:340px;max-height:92vh;overflow-y:auto;background:#1a1218;border:3px solid #e8c36d;border-radius:12px;padding:12px;color:#f6e9e4;text-align:center}'+
  '#hop-ov h4{margin:0 0 2px;color:#ffd24a;font-size:15px}#hop-ov .sub{font-size:11px;color:#c9b8b0;margin-bottom:8px}'+
  '#hop-ov .zl{display:grid;grid-template-columns:1fr 1fr;gap:5px;max-height:200px;overflow-y:auto;margin-bottom:8px}'+
  '#hop-ov .zl button{padding:7px 3px;border-radius:8px;border:2px solid #75613b;background:#2a1e26;font-size:11.5px;font-weight:800;cursor:pointer}'+
  '#hop-ov .zl button.on{border-color:#72e4b0;background:#1a3a32}'+
  '#hop-ov .pv{font-size:11.5px;text-align:left;padding:6px 8px;border-radius:8px;background:#241820;margin-bottom:8px;min-height:34px}'+
  '#hop-ov .pv .pxi{width:18px;height:18px;vertical-align:middle}'+
  '#hop-ov .act{display:flex;gap:8px}#hop-ov .act button{flex:1;padding:9px;border-radius:8px;border:2px solid #75613b;background:#2a1e26;color:#f6e9e4;font-weight:800;cursor:pointer}'+
  '#hop-ov .act button.ok{border-color:#72e4b0;background:#1a3a32;color:#72e4b0}#hop-ov .act button:disabled{opacity:.4;cursor:default}';
 document.head.appendChild(st)}
function hopItemsHtml(list){
 return list.map(it=>{const I=ITEMS[it.id];return'<span style="color:'+(I.col||'#f6e9e4')+'">'+I.i+' '+I.n+'</span> <b>×'+it.q+'</b>'}).join('<br>')}
function hopRender(){
 const z=hopZone,has=cnt('hopnl');
 let zl='';for(let i=0;i<VAN_KIEP_ZONES.length;i++)
  zl+='<button type="button" class="'+(i===z?'on':'')+'" style="color:'+ZONE_COL[i]+'" onclick="hopPick('+i+')">'+VAN_KIEP_ZONES[i].name+'</button>';
 hopEl.innerHTML='<div class="box"><h4>🎁 Hộp Nguyên Liệu</h4><div class="sub">Bạn có <b>'+has+'</b> hộp. Chọn vùng để nhận nguyên liệu rèn trọn 1 bộ.</div>'+
  '<div class="zl">'+zl+'</div>'+
  '<div class="pv">'+(z<0?'<span style="color:#c9b8b0">Chưa chọn vùng.</span>':'<b style="color:'+ZONE_COL[z]+'">'+VAN_KIEP_ZONES[z].name+'</b> — sẽ nhận:<br>'+hopItemsHtml(hopSetNeed(z)))+'</div>'+
  '<div class="act"><button type="button" onclick="hopClose()">Hủy</button><button type="button" class="ok" '+(z<0||has<1?'disabled':'')+' onclick="hopConfirm()">Mở hộp</button></div></div>'}
function hopOpen(){
 if(cnt('hopnl')<1)return;
 hopStyle();
 if(!hopEl){hopEl=document.createElement('div');hopEl.id='hop-ov';
  hopEl.addEventListener('click',e=>{if(e.target===hopEl)hopClose()});document.body.appendChild(hopEl)}
 hopZone=-1;hopRender();hopEl.classList.add('show')}
function hopClose(){if(hopEl)hopEl.classList.remove('show')}
function hopPick(z){hopZone=z;hopRender()}
function hopConfirm(){
 if(hopBusy||hopZone<0)return;hopBusy=true;
 try{
  const z=hopZone;
  if(cnt('hopnl')<1){hopClose();return}
  const items=hopSetNeed(z);
  if(!hopRoomOk(items)){popToast('🎒 Balo không đủ chỗ','Hãy dọn bớt balo rồi mở lại. Hộp vẫn còn, bạn không mất gì.','bad',3200);return}
  removeItem('hopnl',1);                                   /* trừ hộp TRƯỚC, rồi mới cộng để không bao giờ nhận 2 lần */
  items.forEach(it=>{try{addItem(it.id,it.q)}catch(e){console.warn('[hopnl] addItem',it.id,e)}});
  try{stats()}catch(_){}
  hopClose();
  popToast('🎁 Đã mở Hộp Nguyên Liệu','Vùng <b>'+VAN_KIEP_ZONES[z].name+'</b>, bạn nhận được:<br>'+hopItemsHtml(items)+'<br><small>Đủ rèn trọn 1 bộ (chưa gồm xu).</small>','ok',5200);
  try{log('🎁 Mở <b>Hộp Nguyên Liệu</b> vùng <b>'+VAN_KIEP_ZONES[z].name+'</b>: nhận nguyên liệu rèn trọn 1 bộ trang bị.')}catch(_){}
  try{if(window.TTGSAVE&&TTGSAVE.save)TTGSAVE.save()}catch(_){}
 }finally{hopBusy=false}}
{const _bu3=bagUse;bagUse=function(){const s=bag[bagSel];if(s&&s.id==='hopnl'){hopOpen();return}_bu3()}}

/* ---------- Dữ liệu ---------- */
let fgInfo=false,eqWorn=[null,null,null,null],ebag=[],eqUid=1,eqTab='wear',eqSel=null,fgSlot=0,fgZone=-1,fgLast=null,fgOpen=false,eqMsg='',eqRaf=0;
const eqIco=(s,z)=>pxImg(EQ_SLOTS[s].px,z==null?'#8a95a0':ZONE_COL[z]);
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

/* Khoảng giá trị 1 dòng chỉ số k của bộ vùng z ở phẩm q (hiển thị ở mục Rèn; công thức khớp eqRoll) */
function eqRange(z,k,q){
 const ref=eqRef(z),d=EQ_STATS[k];
 return EQ_ROLL.map(r=>{const pct=d.b*(1+EQ_QBONUS[q])*r;
  return d.t==='f'?Math.max(1,Math.round(ref*(k==='hp'?8:1)*pct/100)):Math.round(pct*10)/10})}
function eqInfoHtml(z,s,need){
 const Z=VAN_KIEP_ZONES[z],S=EQ_SETS[z],col=ZONE_COL[z],ids=fgIds(z,s),zb=VAN_KIEP_ZONE_BOUNDS[z];
 const fmt=(r,p)=>r[0]===r[1]?r[0]+p:r[0]+'–'+r[1]+p;
 const rows=Object.keys(EQ_STATS).map(k=>{const d=EQ_STATS[k],p=d.t==='p'?'%':'',lo=eqRange(z,k,0),hi=eqRange(z,k,4);
  return'<div><span>'+d.n+'</span><b>Phàm +'+fmt(lo,p)+' · Thần +'+fmt(hi,p)+'</b></div>'}).join('');
 const head='<button class="eqinfo-h" onclick="fgInfoToggle()" style="color:'+col+'">'+eqIco(s,z)+' <b>Thông tin '+EQ_SLOTS[s].n+' '+Z.name+'</b><span>'+(fgInfo?'▴ Thu gọn':'▾ Xem thêm')+'</span></button>';
 if(!fgInfo)return'<div class="infobox upnote" style="margin-top:5px">'+head+'<small>Bộ '+S.name+' · mặc được từ cấp '+zb.start+' · '+EQ_LINES+' dòng chỉ số ngẫu nhiên</small></div>';
 return'<div class="infobox upnote" style="margin-top:5px">'+head+
  '<small>• Thuộc bộ <b style="color:'+col+'">'+S.i+' '+S.name+'</b> (mặc 2 hoặc 4 món cùng bộ để có buff bộ)<br>'+
  '• Cấp yêu cầu để mặc: <b>'+zb.start+'</b><br>'+
  '• Nguyên liệu: '+ITEMS[ids.boss].n+' ×'+need.boss+', '+ITEMS[ids.main].n+' ×'+need.main+', '+ITEMS[ids.shared].n+' ×'+need.shared+', '+need.xu+' xu<br>'+
  '• Mỗi món rèn ra có <b>'+EQ_LINES+' dòng chỉ số</b> bốc ngẫu nhiên trong '+Object.keys(EQ_STATS).length+' loại dưới đây (mọi ô bốc như nhau, loại ô chỉ khác nguyên liệu và hình dáng). Mỗi dòng roll từ '+Math.round(EQ_ROLL[0]*100)+'% đến '+Math.round(EQ_ROLL[1]*100)+'% giá trị tối đa của phẩm.</small>'+
  '<div class="eqstat eqrange" style="margin-top:4px">'+rows+'</div>'+
  '<small style="color:var(--mute)">Sinh Lực/Công/Thủ/Tốc/Linh là số cố định theo cấp vùng; Né tránh/Choáng/Hồi/Chí mạng là % và có trần tổng ('+Object.keys(EQ_CAP).map(k=>EQ_STAT_NAME[k]+' '+EQ_CAP[k]+'%').join(', ')+').</small></div>'}

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
function fgInfoToggle(){fgInfo=!fgInfo;renderEquip()}
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
   '<span style="opacity:'+(it?1:.4)+'">'+eqIco(s,it?it.z:null)+'</span>'+(it?'<b>'+(it.z+1)+'</b>':'')+'</button>'}
 circ+='</div>';
 let bagH='<div class="eqbag" id="eq-bag">';
 for(let i=0;i<EQ_BAG;i++){
  const it=ebag[i];
  if(!it){bagH+='<button class="slot" disabled style="opacity:.3"></button>';continue}
  const sel=eqSel&&!eqSel.w&&eqSel.i===i;
  bagH+='<button class="slot'+(sel?' sel':'')+'" style="border-color:'+(sel?'var(--gold)':eqRgb(it))+'" onclick="eqPick(false,'+i+')" title="'+eqName(it)+'"><span>'+eqIco(it.s,it.z)+'</span><b>'+(it.z+1)+'</b></button>'}
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
 circ+='<div class="uppet" style="font-size:30px;background:radial-gradient(circle,rgba(255,200,110,.35),rgba(255,200,110,.05) 70%)">'+eqIco(s,z)+'</div></div>';
 const slotBtns=EQ_SLOTS.map((o,i)=>'<button class="mini'+(i===s?' jade':'')+'" onclick="fgSetSlot('+i+')" title="'+o.n+'">'+eqIco(i,z)+'</button>').join('');
 const zoneBtn='<button class="eqzone" onclick="fgToggle()">🗺️ Bộ <span style="color:'+ZONE_COL[z]+'">'+Z.name+'</span> · cấp '+zb.start+'+'+(fgOpen?' ▴':' ▾')+'</button>';
 const zoneList=fgOpen?'<div class="eqzlist">'+VAN_KIEP_ZONES.map((q,i)=>'<div class="eqz'+(i===z?' on':'')+'" onclick="fgSetZone('+i+')"><span>'+(i===z?'✅ ':'🗺️ ')+'<b style="color:'+ZONE_COL[i]+'">'+q.name+'</b></span><span>cấp '+VAN_KIEP_ZONE_BOUNDS[i].start+'+</span></div>').join('')+'</div>':'';
 const tot=EQ_QW.reduce((a,b)=>a+b,0),odds=EQ_QW.map((w,i)=>'<span style="color:rgb('+QC[i]+')">'+QN[i]+' '+Math.round(w/tot*1000)/10+'% (+'+Math.round(EQ_QBONUS[i]*100)+'%)</span>').join(' · ');
 let last='';
 if(fgLast)last='<div class="infobox upnote" style="margin-top:5px"><small>Món vừa rèn (đã vào kho):</small><br>'+eqItemHtml(fgLast,false)+'</div>';
 const src=(id,z2,cat)=>'<div><span style="color:'+ZONE_COL[z2]+'">'+ITEMS[id].i+' '+ITEMS[id].n+'</span> ×<b>'+cnt(id)+'/'+(cat==='boss'?need.boss:cat==='main'?need.main:need.shared)+'</b></div>';
 return'<div class="infobox" style="text-align:center;margin-bottom:4px">'+zoneBtn+'</div>'+zoneList+
  '<div class="upgrid"><div>'+circ+'</div><div><div class="infobox" style="margin-bottom:4px"><small>Chọn ô trang bị:</small></div><div class="eqslotbtn">'+slotBtns+'</div>'+
  '<div class="infobox upinfo"><b style="color:'+ZONE_COL[z]+'">'+EQ_SLOTS[s].n+' '+Z.name+'</b><br><small>Cấp yêu cầu '+zb.start+'</small></div></div></div>'+
  eqInfoHtml(z,s,need)+
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
 const stg=stageOf(level);
 if(!(api&&api.drawStageCentered(x,pet.bl,pet.sp,stg,64,64,128*api.stageScale(stg)))){const im=spriteFor(pet.bl,pet.sp);if(im.complete&&im.naturalWidth)x.drawImage(im,0,0,128,128)}
 eqRaf=requestAnimationFrame(eqLoop)}
document.getElementById('equip-box').addEventListener('toggle',e=>{if(e.target.open)renderEquip()});
renderEquip();
if(typeof renderBag==='function')renderBag();
