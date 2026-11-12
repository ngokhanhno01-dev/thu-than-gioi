/* ===== 30-stat-tip.js — BẤM VÀO CHỈ SỐ ĐỂ XEM CHÚ THÍCH =====
   Dùng chung cho mọi bảng chỉ số: bảng thú ngoài màn chính, thẻ thú xem người khác, tổng chỉ số trang bị,
   khoảng giá trị ở mục Rèn, dòng chỉ số của từng món trang bị, bảng thông báo tăng chỉ số.
   Không cần sửa từng chỗ vẽ: lắng nghe click ở cấp tài liệu, đọc tên chỉ số ở đầu ô rồi tra bảng STAT_TIPS.
   Muốn sửa chú thích hoặc thêm chỉ số mới: chỉ sửa bảng STAT_TIPS bên dưới (khóa = đúng tên hiển thị). Nạp SAU 29-guard.js. */
(()=>{
'use strict';
const STAT_TIPS={
 'Sinh Lực':'Máu của thú. Hết Sinh Lực là thua trận. Mỗi trận kéo dài tối đa 14 hiệp, hết hiệp bên còn nhiều % máu hơn thắng.',
 'Công':'Sức đánh gốc của mỗi đòn. Công càng cao, mỗi đòn gây càng nhiều sát thương.',
 'Thủ':'Giảm sát thương nhận vào. Sát thương bị chia theo (100 + Thủ) nên Thủ càng cao càng đỡ đau, nhưng tăng dần càng ít hiệu quả.',
 'Tốc':'Quyết định ai ra đòn trước trong mỗi hiệp: bên có Tốc cao hơn đánh trước. Đánh trước có lợi vì có thể hạ địch trước khi bị đánh trả.',
 'Pháp Công':'Sát thương phép cộng thêm vào mỗi đòn đánh: được tính bằng 30% giá trị Pháp Công. Nó phụ trợ cho Công chứ không thay thế Công.',
 'Né tránh':'Tỉ lệ % đòn của đối thủ bị trượt hoàn toàn (không mất máu). Có trần 45%.',
 'Chí mạng':'Tỉ lệ % mỗi đòn đánh thành chí mạng, gây nhiều sát thương hơn bình thường (xem Sát thương chí mạng). Có trần 60% từ trang bị.',
 'ST chí mạng':'Sát thương của đòn chí mạng so với đòn thường. Mặc định 150%, kỹ năng loài có thể tăng thêm.',
 'Choáng':'Tỉ lệ % mỗi đòn trúng làm đối thủ choáng, mất lượt đánh kế tiếp. Có trần 35%. Kháng hiệu ứng của đối thủ làm giảm tỉ lệ này.',
 'Hồi/lượt':'Tự hồi một phần trăm Sinh Lực tối đa vào cuối mỗi hiệp. Có trần 8%.',
 'Kháng hiệu ứng':'Giảm hiệu lực các hiệu ứng xấu đối thủ gây lên thú của bạn (choáng, giảm Tốc, thiêu đốt...).',
 'Xuyên giáp':'Mỗi đòn đánh bỏ qua một phần trăm Thủ của đối thủ.',
 'Hút máu':'Hồi lại một phần trăm sát thương gây ra cho đối thủ thành Sinh Lực của mình.',
 'Phản đòn':'Phản lại một phần trăm sát thương nhận vào cho kẻ đánh mình.',
 'Liên kích':'Tỉ lệ % sau mỗi đòn trúng đánh thêm một nhát nữa bằng 50% sát thương đòn đó.',
 'Khiên':'Đầu mỗi trận có khiên hấp thụ sát thương bằng một phần trăm Sinh Lực tối đa.'
};
const SEL='.stg>div,.sg>div,.eqstat>div,.stl,.nr>div';
{const s=document.createElement('style');
 s.textContent=SEL.split(',').map(x=>x+'{cursor:help}').join('')+
  '#sttip{position:fixed;z-index:2147483000;display:none;max-width:min(270px,88vw);box-sizing:border-box;padding:8px 10px;background:#14272d;border:2px solid #e8c36d;box-shadow:0 3px 0 #050c11;color:#f5edcf;font-size:13px;line-height:1.35;text-align:left;pointer-events:none}'+
  '#sttip b{display:block;margin-bottom:3px;color:#ffd24a;font-size:14px}#sttip.show{display:block}';
 document.head.appendChild(s)}
let tip=null,timer=0,lastEl=null;
function box(){if(!tip){tip=document.createElement('div');tip.id='sttip';document.body.appendChild(tip)}return tip}
function hide(){if(tip)tip.classList.remove('show');lastEl=null;clearTimeout(timer)}
function nameOf(el){
 const n=el.firstChild;let t=n?(n.nodeType===3?n.nodeValue:n.textContent):el.textContent;
 t=String(t||'').replace(/⭐/g,'').replace(/\(mặc định\)/g,'').split(' +')[0].split(' →')[0].trim();
 return t}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function show(el,name){
 const b=box();b.innerHTML='<b>'+esc(name)+'</b>'+esc(STAT_TIPS[name]);
 b.style.left='0px';b.style.top='0px';b.classList.add('show');
 const r=el.getBoundingClientRect(),W=window.innerWidth,H=window.innerHeight,bw=b.offsetWidth,bh=b.offsetHeight;
 let x=r.left+r.width/2-bw/2,y=r.bottom+6;
 if(y+bh>H-6)y=Math.max(6,r.top-bh-6);                 /* hết chỗ phía dưới thì hiện phía trên */
 x=Math.max(6,Math.min(W-bw-6,x));
 b.style.left=Math.round(x)+'px';b.style.top=Math.round(y)+'px';
 lastEl=el;clearTimeout(timer);timer=setTimeout(hide,6000)}
document.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 const el=t.closest(SEL);
 if(!el){hide();return}
 const name=nameOf(el);
 if(!STAT_TIPS[name]){hide();return}
 if(lastEl===el&&tip&&tip.classList.contains('show')){hide();return}   /* bấm lại cùng ô thì tắt */
 show(el,name)},true);
window.addEventListener('scroll',hide,true);
window.addEventListener('resize',hide);
window.STAT_TIPS=STAT_TIPS;
})();
