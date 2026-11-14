/* ===== 46-enh-items.js — [CUONG HOA 2] Vật phẩm cường hóa (chưa bán, chưa rơi, chưa dùng được) =====
   Nạp NGAY SAU 45-enh-border.js. Không sửa file cũ: thêm vào ITEMS / SELL_PRICE / HL_ITEM và bọc bagUse().
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

/* ---------- Vật phẩm ---------- */
for(let t=1;t<=ENH_TIER_MAX;t++){
 const id=enhStoneId(t),col=ENH_TIER_COL[t-1];
 ITEMS[id]={n:'Đá Cường Hóa bậc '+t,i:enhStoneIcon(t),e:'🔶',col,
  d:t===ENH_TIER_MAX?'Cường hóa mọi vùng, kể cả Thần Điện. (mục 🛡️ Trang bị → Cường hóa)'
   :'Dùng cường hóa trang bị vùng '+ENH_TIERS[t-1][0]+'–'+ENH_TIERS[t-1][1]+' (mục 🛡️ Trang bị → Cường hóa). Đá bậc 6 cũng thay được.',use:null};
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
