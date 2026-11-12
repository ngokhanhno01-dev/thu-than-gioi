/* ===== 32-prefight.js — Bảng SO SÁNH trước khi vào trận đấu trường =====
   Hiện: tên/cấp, HỆ (kèm khắc chế), vùng, TẦM ĐÁNH, BUFF VÙNG của 2 bên.
   Bấm "BẮT ĐẦU" để vào trận ngay, hoặc tự vào sau 5 giây.
   Dùng: TTGPREFIGHT.show({me:{...}, opp:{...}, secs:5}).then(()=>{ vào trận })
   Mỗi bên: {nick, lv, pet, h, hRel, zone, mark, color, mode, buff, buffOn}
     hRel = hệ số khắc chế của bên đó (1.25 khắc, 0.8 bị khắc, 1 trung lập). */
(()=>{
'use strict';
const $p=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const H_COL={Kim:'#f2d06a','Mộc':'#5be07a','Thủy':'#5bb8ff','Hỏa':'#ff6a3a','Thổ':'#d9a05a','Huyễn':'#c08aff'};
const fmt=v=>String(v).replace('.',',');

{const s=document.createElement('style');
 s.textContent=
 '#pf-ov{position:fixed;inset:0;z-index:140;display:none;align-items:center;justify-content:center;background:rgba(4,10,14,.86);padding:10px;box-sizing:border-box}'+
 '#pf-ov.show{display:flex}'+
 '#pf-ov .box{width:min(94vw,400px);max-height:92vh;overflow-y:auto;box-sizing:border-box;text-align:center;padding:8px 10px 12px;'+
 'border:3px solid #f6c66a;background-color:#14272d;background-image:repeating-conic-gradient(#1a3335 0 25%,#12262e 0 50%);background-size:4px 4px;'+
 'box-shadow:0 3px 0 0 #040a0e,0 0 0 2px #040a0e,inset 0 0 0 2px #78613a;font-family:"VT323",monospace!important;color:#f5edcf;animation:pfpop .25s steps(5) both}'+
 '#pf-ov .box *{font-family:"VT323",monospace!important}'+
 '#pf-ov .pt{font-size:26px!important;color:#f6c66a;font-weight:700;letter-spacing:1px;text-shadow:1px 1px 0 #071116;line-height:1.1}'+
 '#pf-ov .pt small{display:block;font-size:16px!important;color:#9fb0a4;font-weight:400;letter-spacing:0;margin-top:1px}'+
 '#pf-ov .pg{display:grid;grid-template-columns:1fr 58px 1fr;margin-top:8px;border-top:2px solid #465044}'+
 '#pf-ov .pg>div{padding:4px 3px;border-bottom:2px solid #465044;font-size:19px!important;line-height:1.15;display:flex;flex-direction:column;justify-content:center;align-items:center;min-height:30px;word-break:break-word}'+
 '#pf-ov .pg .lb{color:#9fb0a4;font-size:16px!important;border-left:2px solid #465044;border-right:2px solid #465044}'+
 '#pf-ov .pg .hd{font-size:20px!important;font-weight:700}'+
 '#pf-ov .pg .hd.me{color:#72e4b0}'+
 '#pf-ov .pg .hd.op{color:#ff9a94}'+
 '#pf-ov .pg .sm{font-size:15px!important;color:#cfd8c4}'+
 '#pf-ov .pg .up{color:#72e4b0}'+
 '#pf-ov .pg .dn{color:#ff9a94}'+
 '#pf-ov .pg .no{color:#cfd8c4}'+
 '#pf-ov .pg .bf{color:#fff0bd}'+
 '#pf-ov .pg .nb{color:#7d8a82}'+
 '#pf-ov .pvs{margin-top:8px;font-size:17px!important;color:#cfd8c4;min-height:20px}'+
 '#pf-ov .pvs b{color:#f6c66a}'+
 '#pf-ov button{margin:10px auto 0;display:block;min-width:170px;padding:6px 20px;font-size:23px!important;font-weight:700;color:#14272d;background:#f6c66a;border:3px solid #78613a;border-radius:0;box-shadow:0 3px 0 0 #040a0e;cursor:pointer}'+
 '#pf-ov button:active{transform:translateY(2px);box-shadow:0 1px 0 0 #040a0e}'+
 '@keyframes pfpop{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}';
 document.head.appendChild(s)}

function ui(){
  let el=$p('pf-ov');
  if(!el){el=document.createElement('div');el.id='pf-ov';
    el.innerHTML='<div class="box"><div id="pf-body"></div><button type="button" id="pf-go">BẮT ĐẦU</button></div>';
    document.body.appendChild(el)}
  return el}

function relCell(r,own){
  if(r>1)return'<span class="up">▲ Khắc ×'+fmt(r)+'</span>';
  if(r<1)return'<span class="dn">▼ Bị khắc ×'+fmt(r)+'</span>';
  return'<span class="no">Trung lập</span>'}
function hCell(s){
  const c=H_COL[s.h]||'#f5edcf';
  return'<span style="color:'+c+';font-weight:700">'+esc(s.h||'?')+'</span>'+(s.pet?'<span class="sm">'+esc(s.pet)+'</span>':'')+relCell(s.hRel||1)}
function zCell(s){
  return'<span style="color:'+esc(s.color||'#f5edcf')+'">'+esc(s.mark||'')+' '+esc(s.zone||'?')+'</span>'}
function bCell(s){
  return s.buff?'<span class="bf">✦ '+esc(s.buff)+'</span>':'<span class="nb">Không có</span>'}

function summary(me,op){
  const a=me.hRel||1,b=op.hRel||1;
  if(a>1)return'Hệ <b>'+esc(me.h)+'</b> của bạn khắc hệ <b>'+esc(op.h)+'</b>: sát thương ×'+fmt(a);
  if(b>1)return'Hệ <b>'+esc(op.h)+'</b> của đối thủ khắc hệ <b>'+esc(me.h)+'</b>: bạn chịu bất lợi';
  return'Hai hệ không khắc nhau'}

let cur=null;
function show(opt){
  opt=opt||{};
  const me=opt.me||{},op=opt.op||{},secs=Math.max(1,Math.round(opt.secs||5));
  if(cur)cur.finish();                                   /* đang mở bảng cũ -> đóng nó trước */
  return new Promise(resolve=>{
    const el=ui(),body=$p('pf-body'),go=$p('pf-go');
    body.innerHTML=
      '<div class="pt">⚔️ ĐỐI ĐẦU<small>So sánh trước khi vào trận</small></div>'+
      '<div class="pg">'+
        '<div class="hd me">'+esc(me.nick||'Bạn')+'</div><div class="lb">&nbsp;</div><div class="hd op">'+esc(op.nick||'Đối thủ')+'</div>'+
        '<div class="sm">Lv.'+esc(me.lv||'?')+'</div><div class="lb">Cấp</div><div class="sm">Lv.'+esc(op.lv||'?')+'</div>'+
        '<div>'+hCell(me)+'</div><div class="lb">Hệ</div><div>'+hCell(op)+'</div>'+
        '<div>'+zCell(me)+'</div><div class="lb">Vùng</div><div>'+zCell(op)+'</div>'+
        '<div>'+esc(me.mode||'')+'</div><div class="lb">Tầm đánh</div><div>'+esc(op.mode||'')+'</div>'+
        '<div>'+bCell(me)+'</div><div class="lb">Buff vùng</div><div>'+bCell(op)+'</div>'+
      '</div>'+
      '<div class="pvs">'+summary(me,op)+'</div>';
    let left=secs,done=false,tm=0;
    function label(){go.textContent='BẮT ĐẦU ('+left+')'}
    function finish(){
      if(done)return;done=true;clearInterval(tm);
      go.onclick=null;el.onclick=null;el.classList.remove('show');
      if(cur&&cur.finish===finish)cur=null;
      resolve()}
    cur={finish};
    go.onclick=ev=>{ev.stopPropagation();finish()};
    label();el.classList.add('show');
    tm=setInterval(()=>{left--;if(left<=0)finish();else label()},1000);
  })}

window.TTGPREFIGHT={show};
})();
