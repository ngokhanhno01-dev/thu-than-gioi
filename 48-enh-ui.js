/* ===== 48-enh-ui.js — [CUONG HOA 5] Tab ⚡ Cường hóa trong mục 🛡️ Trang bị =====
   Nạp SAU 12-equip.js, 45-enh-border.js, 46-enh-items.js (cần thêm cnt/removeItem/upToast của 09-blood.js).
   Không sửa file cũ: bọc renderEquip() để thêm tab thứ 3 (eqTab='enh'); chỉ số tự tính lại từ it.e (xem eqVal ở 12-equip.js).
   Kiểu giao diện/thông báo bắt chước 09-blood.js (upToast + log). Mọi con số sửa ở khối cấu hình ngay bên dưới. */

/* ---------- Cấu hình ---------- */
const ENH_RATE=[95,90,85,75,65,55,45,35,25,15];   /* tỉ lệ thành công (%) theo cấp hiện tại 0→9 */
const ENH_STONE_QTY=[1,1,2,2,3,3,4,4,5,5];        /* số đá cường hóa mỗi lần theo cấp hiện tại 0→9 */
const ENH_XU_BASE=200;                            /* xu mỗi lần = ENH_XU_BASE × (cấp hiện tại + 1) */
const ENH_DROP_FROM=4;                            /* từ cấp này trở lên, thất bại bị tụt 1 cấp (+4…+9) */
const ENH_RB_PCT=5;                               /* mỗi Đá Ngũ Sắc cộng bấy nhiêu % tỉ lệ thành công */
const ENH_TAB_ICO='⚡';                            /* icon nút tab + nút Cường hóa: đổi ĐÚNG 1 CHỖ này khi có file ảnh (đợt 6) */

/* ---------- Logic thuần (không đụng giao diện, dễ test) ---------- */
const enhNeed=e=>({stone:ENH_STONE_QTY[e],xu:ENH_XU_BASE*(e+1)});
const enhRateAt=(e,rb)=>Math.min(100,ENH_RATE[e]+ENH_RB_PCT*(rb||0));
const enhRbMax=e=>Math.max(0,Math.ceil((100-ENH_RATE[e])/ENH_RB_PCT));   /* số đá ngũ sắc tối đa còn có ích (chạm 100%) */
/* roll ∈ [0,100). Thành công: +1. Thất bại: ≥ +4 tụt 1 cấp, trừ khi dùng vé (saved=true → giữ cấp, mất 1 vé). Dưới +4: giữ cấp, KHÔNG mất vé. */
function enhResolve(e,roll,ticket,rate){
 if(roll<rate)return{ok:true,e2:e+1,saved:false};
 if(e>=ENH_DROP_FROM)return ticket?{ok:false,e2:e,saved:true}:{ok:false,e2:e-1,saved:false};
 return{ok:false,e2:e,saved:false}}

/* ---------- Trạng thái giao diện ---------- */
let enhUid=0,enhTier=0,enhRb=0,enhTicket=false,enhMsg='',enhBusy=false;
const enhFind=uid=>{for(const it of eqWorn)if(it&&it.uid===uid)return it;return ebag.find(x=>x.uid===uid)||null};
const enhStoneChoice=it=>{const t=enhTierOf(it.z);return t.indexOf(enhTier)>=0?enhTier:t[0]};   /* mặc định đá đúng bậc vùng; bậc 6 nếu người chơi chọn */
function enhPick(uid){enhUid=uid;enhTier=0;enhMsg='';renderEquip()}
function enhSetTier(t){enhTier=t;enhMsg='';renderEquip()}
function enhRbAdd(d){
 const it=enhFind(enhUid);if(!it)return;
 const lim=Math.min(cnt('da_ngu_sac'),enhRbMax(it.e||0));
 enhRb=Math.max(0,Math.min(lim,enhRb+d));enhMsg='';renderEquip()}
function enhToggleTicket(){enhTicket=!enhTicket;renderEquip()}

function enhDo(){
 if(!hatched||!pet||enhBusy)return;
 const it=enhFind(enhUid);
 if(!it){enhMsg='<span class="bad">Hãy chạm chọn một món trang bị trước.</span>';renderEquip();return}
 const e=it.e||0;
 if(e>=ENH_MAX){renderEquip();return}
 const need=enhNeed(e),tier=enhStoneChoice(it),sid=enhStoneId(tier),have=cnt(sid);
 if(have<need.stone){
  enhMsg='<span class="bad">Chưa đủ '+ITEMS[sid].n+' ('+have+'/'+need.stone+').</span>';
  upToast('warn','⚠️ CHƯA ĐỦ ĐÁ','Cần <b>'+ITEMS[sid].n+' ×'+need.stone+'</b>, bạn đang có '+have+'.');renderEquip();return}
 if(gold<need.xu){
  enhMsg='<span class="bad">Không đủ xu: cần '+need.xu+', bạn có '+gold+'.</span>';
  upToast('warn','⚠️ KHÔNG ĐỦ XU','Cần '+need.xu+' xu, bạn đang có '+gold+' xu.');renderEquip();return}
 enhBusy=true;
 try{
  const rb=Math.min(enhRb,cnt('da_ngu_sac'),enhRbMax(e)),rate=enhRateAt(e,rb),ticket=enhTicket&&cnt('ve_bao_ho')>0,
   col=eqRgb(it),nm='<b style="color:'+col+'">['+QN[it.q]+'] '+eqName(it)+'</b>';
  /* trừ đá + xu + đá ngũ sắc TRƯỚC khi roll (thành công hay thất bại đều mất) */
  removeItem(sid,need.stone);if(rb>0)removeItem('da_ngu_sac',rb);
  gold-=need.xu;
  const r=enhResolve(e,Math.random()*100,ticket,rate);
  if(r.saved)removeItem('ve_bao_ho',1);          /* vé chỉ bị trừ khi thật sự cứu được cấp */
  it.e=r.e2;eqEnh(it);
  stats();try{renderInfo()}catch(_){}
  const rbTxt=rb>0?' (đá ngũ sắc ×'+rb+', tỉ lệ '+rate+'%)':' (tỉ lệ '+rate+'%)';
  if(r.ok){
   enhMsg='<span class="ok">✨ Cường hóa THÀNH CÔNG! '+eqName(it)+' +'+e+' → +'+r.e2+'.</span>';
   upToast('ok','✨ CƯỜNG HÓA THÀNH CÔNG!',nm+'<br><b>+'+e+' → +'+r.e2+'</b>'+rbTxt);
   log('⚡ <b style="color:var(--jade)">Cường hóa thành công!</b> '+nm+' +'+e+' → +'+r.e2+rbTxt+'.')
  }else if(r.saved){
   enhMsg='<span class="bad">💥 Thất bại, nhưng Vé Bảo Hộ đã giữ nguyên +'+e+'. Mất đá, xu và 1 vé.</span>';
   upToast('bad','💥 THẤT BẠI (ĐƯỢC BẢO HỘ)',nm+'<br>Vé Bảo Hộ giữ nguyên <b>+'+e+'</b>.<br>Mất đá, <b>'+need.xu+' xu</b> và 1 vé.');
   log('⚡ <b style="color:#ff8a7a">Cường hóa thất bại</b> '+nm+'; Vé Bảo Hộ giữ nguyên +'+e+rbTxt+'.')
  }else if(r.e2<e){
   enhMsg='<span class="bad">💥 Thất bại! Mất đá và xu, '+eqName(it)+' tụt xuống +'+r.e2+'.</span>';
   upToast('bad','💥 CƯỜNG HÓA THẤT BẠI!',nm+'<br>Tụt xuống <b>+'+r.e2+'</b>.<br>Mất đá và <b>'+need.xu+' xu</b>.');
   log('⚡ <b style="color:#ff8a7a">Cường hóa thất bại</b> '+nm+', tụt +'+e+' → +'+r.e2+rbTxt+'.')
  }else{
   enhMsg='<span class="bad">💥 Thất bại! Mất đá và xu, '+eqName(it)+' giữ nguyên +'+e+' (dưới +'+ENH_DROP_FROM+' không tụt cấp).</span>';
   upToast('bad','💥 CƯỜNG HÓA THẤT BẠI!',nm+'<br>Giữ nguyên <b>+'+e+'</b> (dưới +'+ENH_DROP_FROM+' không tụt cấp).<br>Mất đá và <b>'+need.xu+' xu</b>.');
   log('⚡ <b style="color:#ff8a7a">Cường hóa thất bại</b> '+nm+', giữ nguyên +'+e+rbTxt+'.')}
  try{if(window.TTGSAVE&&TTGSAVE.save)TTGSAVE.save()}catch(_){}
 }finally{enhBusy=false}
 renderEquip()}

/* ---------- Giao diện ---------- */
const enhTabs=on=>'<div class="eqtabs"><button class="mini" onclick="eqSetTab(\'wear\')">🛡️ Trang bị</button><button class="mini" onclick="eqSetTab(\'forge\')">'+EQ_REN_ICO+' Rèn</button><button class="mini'+(on?' jade':'')+'" data-enh="1" onclick="eqSetTab(\'enh\')">'+ENH_TAB_ICO+' Cường hóa</button></div>';
const enhSlotBtn=(it,sel)=>'<button class="slot'+(sel?' sel':'')+'" data-uid="'+it.uid+'" style="position:relative;border-color:'+(sel?'var(--gold)':eqRgb(it))+'" onclick="enhPick('+it.uid+')" title="'+eqName(it)+'"><span>'+eqIco(it.s,it.z)+'</span><b>+'+(it.e||0)+'</b></button>';
function enhPanelHtml(it){
 if(!it)return'<small>Chạm một món đang mặc hoặc trong kho ở trên để cường hóa.</small>';
 const e=it.e||0,col=eqRgb(it),FX=window.ENHFX;
 let h='<div style="display:flex;gap:6px;align-items:flex-start"><span class="eqpv'+(FX&&e?' '+FX.cls(it):'')+'" style="border-color:'+col+'">'+(FX&&e?FX.inner(it):'')+eqIco(it.s,it.z)+'</span><div style="min-width:0;flex:1"><b style="color:'+col+'">['+QN[it.q]+'] '+eqName(it)+'</b><br><small>Cường hóa hiện tại <b>+'+e+'</b> / +'+ENH_MAX+'</small></div></div>';
 if(e>=ENH_MAX)return h+'<div style="margin-top:6px;text-align:center"><b style="color:var(--gold)">Đã đạt cấp tối đa +'+ENH_MAX+'</b></div>';
 const need=enhNeed(e),tiers=enhTierOf(it.z),tier=enhStoneChoice(it),sid=enhStoneId(tier),have=cnt(sid),
  rbHave=cnt('da_ngu_sac'),rbLim=Math.min(rbHave,enhRbMax(e)),rb=Math.min(enhRb,rbLim),
  tkHave=cnt('ve_bao_ho'),tk=enhTicket&&tkHave>0,base=ENH_RATE[e],tot=enhRateAt(e,rb);
 h+='<div style="margin-top:6px"><b>Nâng +'+e+' → +'+(e+1)+'</b></div>';
 /* chọn đá */
 if(tiers.length>1)h+='<div style="margin-top:4px"><small>Chọn loại đá:</small><div style="display:flex;gap:6px;margin-top:2px">'+tiers.map(t=>{const id=enhStoneId(t);
  return'<button class="mini'+(t===tier?' jade':'')+'" style="flex:1" onclick="enhSetTier('+t+')">'+ITEMS[id].i+' Bậc '+t+' (có '+cnt(id)+')</button>'}).join('')+'</div>'+
  '<small style="color:var(--mute)">'+(tiers[0]===ENH_TIER_MAX?'':'Đá bậc '+ENH_TIER_MAX+' thay được cho mọi vùng.')+'</small></div>';
 else h+='<div style="margin-top:2px"><small style="color:var(--mute)">Món vùng này chỉ dùng được Đá Cường Hóa bậc '+ENH_TIER_MAX+'.</small></div>';
 h+='<div style="margin-top:4px">📦 Cần: <span style="color:'+(ITEMS[sid].col||'inherit')+'">'+ITEMS[sid].i+' '+ITEMS[sid].n+'</span> ×<b style="color:'+(have>=need.stone?'var(--jade)':'#ff7654')+'">'+have+'/'+need.stone+'</b> · 🪙 <b style="color:'+(gold>=need.xu?'var(--gold)':'#ff7654')+'">'+need.xu+' xu</b> (bạn có '+gold+')</div>';
 /* đá ngũ sắc */
 h+='<div style="margin-top:5px;display:flex;align-items:center;gap:6px"><span style="flex:1">'+ITEMS.da_ngu_sac.i+' Đá Ngũ Sắc <small>(+'+ENH_RB_PCT+'%/viên · có '+rbHave+(rbLim<rbHave?' · tối đa '+rbLim+' để đạt 100%':'')+')</small></span>'+
  '<button class="mini" onclick="enhRbAdd(-1)"'+(rb<=0?' disabled':'')+'>−</button><b style="min-width:22px;text-align:center">'+rb+'</b><button class="mini" onclick="enhRbAdd(1)"'+(rb>=rbLim?' disabled':'')+'>+</button></div>';
 /* vé bảo hộ */
 h+='<label style="display:flex;align-items:center;gap:6px;margin-top:5px;'+(tkHave?'':'opacity:.55')+'"><input type="checkbox" onchange="enhToggleTicket()"'+(tk?' checked':'')+(tkHave?'':' disabled')+'> '+ITEMS.ve_bao_ho.i+' Dùng Vé Bảo Hộ <small>(có '+tkHave+')</small></label>';
 /* tỉ lệ */
 h+='<div style="margin-top:5px">✅ Tỉ lệ thành công: gốc <b>'+base+'%</b>'+(rb>0?' + ngũ sắc <b>'+(tot-base)+'%</b>':'')+' = <b style="color:var(--jade)">'+tot+'%</b></div>';
 /* chỉ số trước / sau */
 const a=eqLines(it),b=eqLines(Object.assign({},it,{e:e+1}));
 h+='<div class="eqstat" style="margin-top:4px">'+a.map((l,i)=>{const d=EQ_STATS[l[0]],p=d.t==='p'?'%':'';
  return'<div><span>'+d.n+'</span><b>+'+l[1]+p+' → <span class="ok">+'+b[i][1]+p+'</span></b></div>'}).join('')+'</div><small style="color:var(--mute)">Chỉ số sau khi thành công. Buff bộ không đổi.</small>';
 /* cảnh báo thất bại */
 if(e>=ENH_DROP_FROM)h+='<div style="margin-top:4px">'+(tk?'🎫 <span class="ok">Có Vé Bảo Hộ: thất bại vẫn giữ <b>+'+e+'</b> (mất 1 vé).</span>':'<span class="bad">⚠️ Thất bại sẽ tụt xuống <b>+'+(e-1)+'</b>.</span>')+'</div>';
 else h+='<div style="margin-top:4px"><small>Thất bại: mất đá và xu, giữ nguyên +'+e+' (dưới +'+ENH_DROP_FROM+' không tụt cấp, vé không bị trừ).</small></div>';
 return h}
function enhHtml(){
 const it=enhFind(enhUid);
 let worn='<div style="display:flex;gap:6px;justify-content:center;margin:2px 0 4px">';
 for(let s=0;s<4;s++){const w=eqWorn[s];
  worn+=w?enhSlotBtn(w,w.uid===enhUid).replace('style="','style="flex:none;width:46px;height:46px;')
   :'<button class="slot" disabled style="flex:none;width:46px;height:46px;opacity:.3"><span>'+eqIco(s,null)+'</span></button>'}
 worn+='</div>';
 let bagH='<div class="eqbag" id="eq-bag">';
 for(let i=0;i<EQ_BAG;i++){const b=ebag[i];bagH+=b?enhSlotBtn(b,b.uid===enhUid):'<button class="slot" disabled style="opacity:.3"></button>'}
 bagH+='</div>';
 const maxed=it&&(it.e||0)>=ENH_MAX;
 return'<div class="infobox" style="text-align:center;margin-bottom:4px">'+ENH_TAB_ICO+' Cường hóa trang bị · tối đa <b style="color:var(--gold)">+'+ENH_MAX+'</b> · mỗi cấp <b>+'+Math.round(ENH_GAIN*100)+'%</b> mọi chỉ số</div>'+
  '<div class="infobox upnote" style="text-align:center"><small>Đang mặc:</small>'+worn+'<div class="eqhead"><span>Kho <b>'+ebag.length+'/'+EQ_BAG+'</b></span></div>'+bagH+'</div>'+
  '<div class="infobox upnote" style="margin-top:5px">'+enhPanelHtml(it)+'</div>'+
  (it&&!maxed?'<button class="jade" style="margin-top:5px" onclick="enhDo()">'+ENH_TAB_ICO+' Cường hóa</button>':'')+
  '<div class="infobox upmsg">'+enhMsg+'</div>'}

/* ---------- Gắn tab thứ 3 vào renderEquip ---------- */
{const _re=renderEquip;
 renderEquip=function(){
  const el=$('eq-wrap');
  if(eqTab==='enh'&&el&&hatched&&pet){
   const keep=document.getElementById('eq-bag'),sc=keep?keep.scrollTop:0;
   const it=enhFind(enhUid);if(!it){enhUid=0}                                     /* món vừa bán/mất thì bỏ chọn */
   enhRb=Math.min(enhRb,it?Math.min(cnt('da_ngu_sac'),enhRbMax(it.e||0)):0);        /* chặn theo số đang có + mức 100% */
   if(!cnt('ve_bao_ho'))enhTicket=false;
   el.innerHTML=enhTabs(true)+enhHtml();
   const FX=window.ENHFX;
   if(FX){el.querySelectorAll('.slot[data-uid]').forEach(b=>FX.decorate(b,enhFind(+b.dataset.uid)))}   /* viền hiệu ứng theo +cấp (45-enh-border.js) */
   const nb=document.getElementById('eq-bag');if(nb)nb.scrollTop=sc;
   return}
  const r=_re.apply(this,arguments);
  const tb=document.querySelector('#eq-wrap .eqtabs');
  if(tb&&!tb.querySelector('[data-enh]'))tb.insertAdjacentHTML('beforeend','<button class="mini" data-enh="1" onclick="eqSetTab(\'enh\')">'+ENH_TAB_ICO+' Cường hóa</button>');
  return r}}
try{renderEquip()}catch(e){console.warn('[enh-ui]',e)}
