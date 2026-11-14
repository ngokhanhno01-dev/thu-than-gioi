/* Nút 📜 mở/đóng Nhật ký khi chơi màn hình ngang (CSS trong style.css; dọc thì nút bị ẩn). Chỉ giao diện, không đụng logic game. */
(()=>{
 'use strict';
 function boot(){
  if(document.getElementById('log-btn'))return;
  const b=document.createElement('button');b.id='log-btn';b.type='button';b.title='Nhật ký';b.textContent='📜';
  b.onclick=()=>document.body.classList.toggle('show-log');
  document.body.appendChild(b);
 }
 if(document.body)boot();else document.addEventListener('DOMContentLoaded',boot);
})();
