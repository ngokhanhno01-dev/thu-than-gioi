/* ===== 46-enh-items.js — [CUONG HOA 2+4] Vật phẩm cường hóa + đá rơi từ quái/boss (chưa dùng được) =====
   Nạp NGAY SAU 45-enh-border.js. Không sửa file cũ: thêm vào ITEMS / SELL_PRICE / HL_ITEM, bọc bagUse() và rollDrops().
   Mọi con số sửa ở khối cấu hình ngay bên dưới. */

/* ---------- Cấu hình ---------- */
const ENH_TIERS=[[1,4],[5,7],[8,10],[11,13],[14,16]];   /* bậc 1..5 = vùng a..b (số vùng 1-based). Bậc 6 = mọi vùng 1..17 */
const ENH_TIER_MAX=6;
const ENH_TIER_COL=['#cfd8e3','#3fdc72','#4aa8ff','#b46bff','#ffc83a','#ff5a4a'];   /* màu bậc 1..6: trắng, lục, lam, tím, vàng, đỏ */
const ENH_TIER_HUE=['grayscale(1) brightness(1.5)','hue-rotate(95deg)','hue-rotate(190deg)','hue-rotate(250deg)','hue-rotate(12deg) saturate(1.3)','hue-rotate(-28deg) saturate(1.4)']; /* chỉ để tô màu emoji tạm 🔶 */
const ENH_SELL={stone:20,ticket:250,rainbow:375};       /* giá bán lại: đá = 20 × bậc */

/* Icon: đổi ĐÚNG 1 CHỖ ở 3 hàm này khi có file ảnh (đợt 6) */
const enhStoneIcon=t=>'<span style="display:inline-block;filter:'+ENH_TIER_HUE[t-1]+'">🔶</span>';
const enhTicketIcon=()=>'🎫';
const enhRainbowIcon=()=>'🌈';

/* Bậc đá có thể cường hóa món vùng z (z 0-based): vùng 1–16 → [bậc đúng vùng, 6]; vùng 17 → [6] */
function enhTierOf(z){
 const v=z+1;
 for(let i=0;i<ENH_TIERS.length;i++)if(v>=ENH_TIERS[i][0]&&v<=ENH_TIERS[i][1])return[i+1,ENH_TIER_MAX];
 return[ENH_TIER_MAX]}
/* Bậc "thường" cần dùng (đá bậc 6 thay thế được nếu người chơi chọn) */
function enhNeedTier(z){return enhTierOf(z)[0]}
const enhStoneId=t=>'da_ch'+t;
const enhIsItem=id=>/^da_ch[1-6]$/.test(id)||id==='ve_bao_ho'||id==='da_ngu_sac';

/* Danh sách vùng mà đá bậc t cường hóa được, MỖI TÊN VÙNG ĐÚNG MÀU VÙNG (ZONE_COL). Bậc 6 = cả 17 vùng. Trả chuỗi HTML. */
function enhTierZones(t){
 const all=t>=ENH_TIER_MAX,a=all?1:ENH_TIERS[t-1][0],b=all?VAN_KIEP_ZONES.length:ENH_TIERS[t-1][1],out=[];
 for(let v=a;v<=b;v++)out.push('<b style="color:'+ZONE_COL[v-1]+'">'+v+'. '+VAN_KIEP_ZONES[v-1].name+'</b>');
 return out.join(' · ')}

/* ---------- Vật phẩm ---------- */
for(let t=1;t<=ENH_TIER_MAX;t++){
 const id=enhStoneId(t),col=ENH_TIER_COL[t-1];
 ITEMS[id]={n:'Đá Cường Hóa bậc '+t,i:enhStoneIcon(t),e:'🔶',col,
  d:(t===ENH_TIER_MAX
   ?'Cường hóa trang bị của <b>MỌI vùng</b>, kể cả Thần Điện:<br>'
   :'Cường hóa trang bị thuộc các vùng:<br>')+enhTierZones(t)+
   '<br>Dùng ở mục 🛡️ Trang bị → ⚡ Cường hóa.'+(t===ENH_TIER_MAX?'':' Đá bậc '+ENH_TIER_MAX+' cũng thay được.'),use:null};
 SELL_PRICE[id]=ENH_SELL.stone*t;
 try{HL_ITEM[id]=col}catch(_){}}
ITEMS.ve_bao_ho={n:'Vé Bảo Hộ',i:enhTicketIcon(),e:'🎫',col:'#6fd1ff',d:'Dùng khi cường hóa: thất bại không bị tụt cấp. (mục 🛡️ Trang bị → Cường hóa)',use:null};
SELL_PRICE.ve_bao_ho=ENH_SELL.ticket;
ITEMS.da_ngu_sac={n:'Đá Ngũ Sắc',i:enhRainbowIcon(),e:'🌈',col:'#ff9ae8',d:'Bỏ vào khi cường hóa để tăng tỉ lệ thành công (+5% mỗi viên, tối đa 100%). (mục 🛡️ Trang bị → Cường hóa)',use:null};
SELL_PRICE.da_ngu_sac=ENH_SELL.rainbow;
try{HL_ITEM.ve_bao_ho='#6fd1ff';HL_ITEM.da_ngu_sac='#ff9ae8'}catch(_){}

/* Bấm Dùng trong balo: chỉ nhắc dùng ở mục Cường hóa, KHÔNG trừ vật phẩm */
{const _bu=bagUse;bagUse=function(){const s=bag[bagSel];
 if(s&&enhIsItem(s.id)){log('🔶 <b>'+ITEMS[s.id].n+'</b> dùng ở mục <b>Trang bị → Cường hóa</b>.');return}
 _bu()}}

/* ---------- [CUONG HOA 4] Đá Cường Hóa rơi từ quái / boss ----------
   Đá bậc t rơi ở quái các vùng thuộc bậc t (ENH_TIERS). Bậc 6 rơi ở vùng 15–17 với tỉ lệ bằng nửa; riêng boss vùng 17 rơi bậc 6 đủ tỉ lệ.
   Nhân hệ số may mắn/thuốc rơi (bonus) như đồ khác. Đồ cũ KHÔNG đổi: chỉ nối thêm đá vào kết quả rollDrops(). */
const ENH_DROP={
 mob:{'Yếu':6,'Thường':6,'Tinh Anh':10,'Thống Lĩnh':15},   /* % rơi theo bậc quái thường (Yếu chưa có số riêng nên để bằng Thường) */
 boss:35,                       /* % rơi khi hạ boss (mọi bậc boss) */
 mobQty:[1,1],bossQty:[1,2],    /* số viên: quái 1, boss 1–2 */
 t6Zones:[15,17],               /* đá bậc 6 rơi ở vùng a..b (số vùng 1-based) */
 t6Mul:.5,                      /* bậc 6 ở quái thường và boss vùng 15–16: nhân nửa tỉ lệ */
 t6BossZone:17                  /* boss vùng này rơi bậc 6 đủ tỉ lệ (không nhân nửa) */
};
/* Danh sách [{id,p,q:[min,max]}] đá có thể rơi từ con quái e (p đã nhân bonus, tối đa 95% như đồ cũ) */
function enhDropRates(e,bonus){
 bonus=bonus||1;const m=e&&e.m;if(!m)return[];
 const v=m.zone+1,boss=!!m.boss,out=[],D=ENH_DROP,
  base=boss?D.boss:(D.mob[e.tr&&e.tr.n]!=null?D.mob[e.tr.n]:D.mob['Thường']),q=boss?D.bossQty:D.mobQty;
 for(let t=1;t<=ENH_TIERS.length;t++)if(v>=ENH_TIERS[t-1][0]&&v<=ENH_TIERS[t-1][1])out.push({id:enhStoneId(t),p:Math.min(95,base*bonus),q});
 if(v>=D.t6Zones[0]&&v<=D.t6Zones[1])out.push({id:enhStoneId(ENH_TIER_MAX),p:Math.min(95,base*((boss&&v===D.t6BossZone)?1:D.t6Mul)*bonus),q});
 return out}
function enhRollDrops(e,bonus){
 try{return enhDropRates(e,bonus).filter(d=>Math.random()*100<d.p).map(d=>({id:d.id,q:d.q[0]+Math.floor(Math.random()*(d.q[1]-d.q[0]+1))}))}
 catch(_){return[]}}   /* lỗi gì cũng không được làm hỏng phần thưởng trận */
{const _rd=rollDrops;rollDrops=function(){return _rd.apply(this,arguments).concat(enhRollDrops.apply(this,arguments))}}
