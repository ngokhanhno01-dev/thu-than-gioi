/* KHUNG THÔNG BÁO DÙNG CHUNG (20/11/2026) = ảnh game-moi/khung-thong-bao.webp (2121x724, nền trong suốt, chữ "Thông báo" in sẵn trên tiêu đề).
   Ảnh có 2 ô nút trống ở đáy; module phủ nút bấm lên đúng 2 ô đó. KHÔNG kéo giãn ảnh (tiêu đề có chữ nên giữ nguyên tỉ lệ), chỉ phóng to/thu nhỏ đều.
   Dùng:
     TTGTBAO.toast('Đã khóa')                              // thông báo nổi tự tắt (không chặn chạm)
     TTGTBAO.confirm('Vứt bỏ?', [{t:'Vứt bỏ',cls:'d',cb:fn},{t:'Hủy'}])   // hỏi 2 nút (nút nào cũng tự đóng khung sau khi bấm)
     TTGTBAO.panel(html, [{t:'Về sảnh',cb:fn}]) -> phần tử chứa nội dung (để vẽ canvas...)   // bảng kết quả, KHÔNG tự đóng khi bấm ngoài
     TTGTBAO.close()
   Ghi chú: 1 nút => nằm ô TRÁI; 2 nút => trái/phải. Muốn đổi vị trí ô nút hay vùng chữ thì sửa BOX bên dưới (đơn vị: pixel ảnh). */
(function(root){
var IMG='game-moi/khung-thong-bao.webp?v=1',IW=2121,IH=724;
var BOX={msg:{x:190,y:238,w:1740,h:270},b1:{x:545,y:528,w:495,h:130},b2:{x:1105,y:528,w:495,h:130}};
var css=[
'.tbo{position:fixed;left:0;top:0;right:0;bottom:0;z-index:300;display:none;align-items:center;justify-content:center;font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.tbo.on{display:flex}',
'.tbo.dim{background:rgba(3,4,18,.62)}',
'.tbo.tst{align-items:flex-start;pointer-events:none;padding-top:3vh}',
'.tbo-fr{position:relative;flex:none;background:url('+IMG+') 0 0/100% 100% no-repeat;filter:drop-shadow(0 0 calc(var(--u)*24) rgba(60,140,255,.55));animation:tbo-in .18s ease-out}',
'.tbo.tst .tbo-fr{animation:tbo-in .18s ease-out}',
'@keyframes tbo-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}',
'.tbo-fr>*{position:absolute;box-sizing:border-box}',
'.tbo-m{display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;color:#fff3c4;font-weight:700;line-height:1.3;font-size:calc(var(--u)*64);text-shadow:0 0 calc(var(--u)*8) #02061c,calc(var(--u)*3) calc(var(--u)*3) 0 #02061c,calc(var(--u)*-3) calc(var(--u)*3) 0 #02061c}',
'.tbo-m small{font-size:.78em;font-weight:600;color:#cfe3ff}',
'.tbo-m.row{gap:calc(var(--u)*34);text-align:left;justify-content:flex-start;padding:0 calc(var(--u)*40)}',
'.tbo-b{display:flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;cursor:pointer;color:#ffe9a0;font:800 calc(var(--u)*60)/1 "Noto Serif","Palatino Linotype",Georgia,serif;text-shadow:0 0 calc(var(--u)*8) #02061c,calc(var(--u)*3) calc(var(--u)*3) 0 #02061c;touch-action:manipulation;-webkit-tap-highlight-color:transparent;border-radius:calc(var(--u)*30)}',
'.tbo-b:active{background:rgba(255,224,102,.28)}',
'.tbo-b.d{color:#ffb8c0}'
].join('\n');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var wrap,fr,msg,btn=[],tm=0,mode='';
function put(el,b){var s=el.style;s.left=(b.x/IW*100)+'%';s.top=(b.y/IH*100)+'%';s.width=(b.w/IW*100)+'%';s.height=(b.h/IH*100)+'%';}
function build(){
 if(wrap)return;
 wrap=document.createElement('div');wrap.className='tbo';
 fr=document.createElement('div');fr.className='tbo-fr';wrap.appendChild(fr);
 msg=document.createElement('div');msg.className='tbo-m';put(msg,BOX.msg);fr.appendChild(msg);
 [BOX.b1,BOX.b2].forEach(function(b){var e=document.createElement('button');e.type='button';e.className='tbo-b';put(e,b);fr.appendChild(e);btn.push(e);});
 document.body.appendChild(wrap);
 window.addEventListener('resize',size);}
/* cỡ khung: vừa màn hình, không vượt maxW (CSS px), giữ tỉ lệ ảnh */
var MAXW=760;
function size(){if(!fr)return;var w=Math.min(innerWidth*.94,MAXW,innerHeight*.9*IW/IH);w=Math.max(160,Math.round(w));
 fr.style.width=w+'px';fr.style.height=Math.round(w*IH/IW)+'px';fr.style.setProperty('--u',(w/IW)+'px');}
function reset(){clearTimeout(tm);msg.className='tbo-m';btn.forEach(function(b){b.style.display='none';b.onclick=null;b.className='tbo-b';});}
function open(m,w,dim){build();reset();mode=m;MAXW=w;wrap.className='tbo on'+(dim?' dim':'')+(m==='toast'?' tst':'');size();}
function close(){if(!wrap)return;clearTimeout(tm);wrap.className='tbo';mode='';}
function setBtns(list){(list||[]).slice(0,2).forEach(function(d,i){var b=btn[i];b.style.display='flex';b.textContent=d.t;b.className='tbo-b'+(d.cls?' '+d.cls:'');
 b.onclick=function(ev){ev.stopPropagation();close();if(d.cb)d.cb();};});}
function toast(t,ms){if(mode==='confirm'||mode==='panel')return;open('toast',520,false);msg.textContent=t;tm=setTimeout(close,ms||1600);}
function confirm(html,list){open('confirm',760,true);msg.innerHTML=html;setBtns(list);wrap.onclick=function(e){if(e.target===wrap)close();};}
function panel(html,list,o){open('panel',960,true);o=o||{};if(o.row)msg.className='tbo-m row';msg.innerHTML=html;setBtns(list);wrap.onclick=null;return msg;}
root.TTGBAO=root.TTGTBAO={toast:toast,confirm:confirm,panel:panel,close:close,BOX:BOX};
})(window);
