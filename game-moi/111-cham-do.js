/* 111-cham-do.js - CHẤM ĐỎ báo cho người chơi (gắn lên nút ở thanh nút, 52-nut-vuong.js).
   - Nút "Nhiệm vụ" (nhiem-vu): có nhiệm vụ ĐÃ XONG chưa nhận thưởng, hoặc rương điểm hoạt động đủ điểm chưa mở (TTGNHIEMVU.coThuong).
   - Nút "Linh Thú" (thu-than): thú đang ra trận ĐỦ nguyên liệu + Tinh Thạch để tiến hóa bậc kế (TTGTH.yeuCau(...).ok, chưa V3).
   - Nút "Luyện Khí" (ren): có ít nhất 1 (bộ x món) ĐỦ nguyên liệu + Tinh Thạch để rèn (TTGLT.check).
   - Nút "Cường hóa" (cuong-hoa): có ít nhất 1 món trang bị chưa đạt +10 mà ĐỦ Đá Cường Hóa (bậc nào của vùng món cũng được) + Tinh Thạch.
   Cơ chế: quét mỗi CF.ms mili giây (nhẹ), bật/tắt chấm theo kết quả. Nút nào chưa có trên màn hình thì bỏ qua, có rồi mới gắn.
   API: TTGDOT.set(id,bool) (ép bật/tắt thử) | .scan() (quét ngay) | .state() (xem đang bật nút nào) | .CF | .RULES (thêm luật mới: TTGDOT.RULES['id-nut']=function(){return true/false;}) */
(function(root){
'use strict';
var CF={ms:900};
var on={};
function css(){
 if(document.querySelector('style[data-dot]'))return;var s=document.createElement('style');s.setAttribute('data-dot','1');
 s.textContent='.nv .nv-dot{position:absolute;right:9%;top:5%;width:25%;height:25%;min-width:9px;min-height:9px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8a7a 0%,#ff2a2a 45%,#c40d0d 100%);border:2px solid #fff;box-shadow:0 0 6px 2px rgba(255,40,40,.85),0 1px 2px rgba(0,0,0,.7);pointer-events:none;z-index:8;display:none;animation:nvdot 1.3s ease-in-out infinite}'+
 '.nv.nv-has-dot .nv-dot{display:block}'+
 '@keyframes nvdot{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}';
 document.head.appendChild(s);}
function btn(id){return document.querySelector('.nv[data-id="'+id+'"]');}
function show(id,v){
 var e=btn(id);if(!e)return false;
 var d=e.querySelector('.nv-dot');
 if(v&&!d){d=document.createElement('i');d.className='nv-dot';e.appendChild(d);}
 e.classList.toggle('nv-has-dot',!!v);
 return true;}
/* ===== LUẬT: mỗi luật trả true/false ===== */
var RULES={
 'nhiem-vu':function(){return !!(root.TTGNHIEMVU&&TTGNHIEMVU.coThuong&&TTGNHIEMVU.coThuong());},
 'thu-than':function(){
  if(!root.TTGTH||!TTGTH.yeuCau||!root.TTGTHU||!TTGTHU.getRaTran)return false;
  var t=TTGTHU.getRaTran();if(!t)return false;var r=TTGTH.yeuCau(t);return !!(r&&!r.max&&r.ok);},
 'ren':function(){
  var LT=root.TTGLT;if(!LT||!LT.check||!LT.ZN||!LT.PIECE)return false;var z,s;
  for(z=0;z<LT.ZN.length;z++)for(s=0;s<LT.PIECE.length;s++)if(LT.check(z,s).ok)return true;
  return false;},
 'cuong-hoa':function(){
  var LT=root.TTGLT;if(!LT||!root.TTGTB||!TTGTB.list||!root.TTGBALO||!root.TTGTIEN)return false;
  var tt=TTGTIEN.get('tt'),L=TTGTB.list(),i,t,e,n,tiers,j;
  for(i=0;i<L.length;i++){t=L[i];if(t.z==null||!LT.PIECE[t.s])continue;e=t.e||0;if(e>=LT.ENH.MAX)continue;
   n=LT.enhNeed(e);if(tt<n.xu)continue;tiers=LT.tierOf(t.z);
   for(j=0;j<tiers.length;j++)if(TTGBALO.count('da_ch'+tiers[j])>=n.stone)return true;}
  return false;}
};
function scan(){
 var id,v;css();
 for(id in RULES){try{v=!!RULES[id]();}catch(e){v=false;}on[id]=v;show(id,v);}}
function start(){scan();setInterval(scan,CF.ms);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
root.TTGDOT={set:function(id,v){on[id]=!!v;return show(id,v);},scan:scan,state:function(){return JSON.parse(JSON.stringify(on));},CF:CF,RULES:RULES};
})(typeof window!=='undefined'?window:globalThis);
