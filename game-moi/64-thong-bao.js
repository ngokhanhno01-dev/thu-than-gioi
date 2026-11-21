/* KHUNG THÔNG BÁO DÙNG CHUNG (20/11/2026) = ảnh game-moi/khung-thong-bao.webp (2121x724, nền trong suốt, chữ "Thông báo" in sẵn trên tiêu đề).
   Ảnh có 2 ô nút trống ở đáy; module phủ nút bấm lên đúng 2 ô đó. KHÔNG kéo giãn ảnh (tiêu đề có chữ nên giữ nguyên tỉ lệ), chỉ phóng to/thu nhỏ đều.
   Dùng:
     TTGTBAO.toast('Đã khóa'[,0,cb])                      // thông báo nổi tự tắt sau 3 giây hoặc chạm vào khung; cb chạy SAU khi khung tắt
     TTGTBAO.confirm('Vứt bỏ?', [{t:'Vứt bỏ',cls:'d',cb:fn},{t:'Hủy'}])   // hỏi 2 nút (nút nào cũng tự đóng khung sau khi bấm)
     TTGTBAO.panel(html, [{t:'Về sảnh',cb:fn}]) -> phần tử chứa nội dung (để vẽ canvas...)   // bảng kết quả, KHÔNG tự đóng khi bấm ngoài
     TTGTBAO.close()
   Ghi chú: 0 nút => khung trống; 1 nút => 1 ô nằm GIỮA; 2 nút => 2 ô trái/phải (mỗi kiểu một ảnh cắt ghép riêng). Muốn đổi vị trí ô nút hay vùng chữ thì sửa BOX (m0/m1/m2 = vùng chữ, b1 = nút đơn, b2a/b2b = 2 nút) bên dưới (đơn vị: pixel ảnh). */
(function(root){
var IMGS=['game-moi/khung-tb-0.webp?v=1','game-moi/khung-tb-1.webp?v=1','game-moi/khung-thong-bao.webp?v=1'],IW=2121,IH=724;/* ảnh theo SỐ NÚT: 0 nút (không ô), 1 nút (1 ô giữa), 2 nút (2 ô) */
var BOX={m0:{x:190,y:238,w:1740,h:410},m1:{x:190,y:238,w:1740,h:270},m2:{x:190,y:238,w:1740,h:270},b1:{x:830,y:528,w:460,h:130},b2a:{x:545,y:528,w:495,h:130},b2b:{x:1105,y:528,w:495,h:130}};
var css=[
'.tbo{position:fixed;left:0;top:0;right:0;bottom:0;z-index:300;display:none;align-items:center;justify-content:center;font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.tbo.on{display:flex}',
'.tbo.dim{background:rgba(3,4,18,.62)}',
'.tbo.tst{align-items:flex-start;pointer-events:none;padding-top:3vh}',
'.tbo-fr{position:relative;flex:none;background:0 0/100% 100% no-repeat;filter:drop-shadow(0 0 calc(var(--u)*24) rgba(60,140,255,.55));animation:tbo-in .18s ease-out}',
'.tbo.tst .tbo-fr{animation:tbo-in .18s ease-out;pointer-events:auto;cursor:pointer}',/* thông báo không nút: chạm vào khung để tắt ngay (vùng ngoài khung vẫn chạm xuyên xuống game) */
'@keyframes tbo-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}',
'.tbo-fr>*{position:absolute;box-sizing:border-box}',
'.tbo-m{display:flex;align-items:center;justify-content:center;text-align:center;overflow:hidden;color:#fff3c4;font-weight:700;line-height:1.3;font-size:calc(var(--u)*64);text-shadow:0 0 calc(var(--u)*8) #02061c,calc(var(--u)*3) calc(var(--u)*3) 0 #02061c,calc(var(--u)*-3) calc(var(--u)*3) 0 #02061c}',
'.tbo-m small{font-size:.78em;font-weight:600;color:#cfe3ff}',
'.tbo-m.row{gap:calc(var(--u)*34);text-align:left;justify-content:flex-start;padding:0 calc(var(--u)*40)}',
'.tbo-m.info{justify-content:stretch;align-items:stretch;text-align:left;gap:calc(var(--u)*30);padding:calc(var(--u)*6) calc(var(--u)*30)}',
'.tbo-tx{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*6)}',
'.tbo-t{font-size:calc(var(--u)*54);font-weight:800;line-height:1.15;color:#9ff5a8}',
'.tbo-t.y{color:#ffe9a0}',
'.tbo-s{font-size:calc(var(--u)*40);font-weight:700;line-height:1.2;color:#fff3c4}',
'.tbo-d{font-size:calc(var(--u)*38);font-weight:600;line-height:1.35;color:#d6e6ff;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;min-height:0;padding-right:calc(var(--u)*14);scrollbar-width:thin;scrollbar-color:#d9a93c rgba(0,0,40,.5)}',
'.tbo-d::-webkit-scrollbar{width:calc(var(--u)*12)}',
'.tbo-d::-webkit-scrollbar-thumb{background:#d9a93c;border-radius:calc(var(--u)*6)}',
'.tbo-ic{flex:none;aspect-ratio:1;height:100%;max-height:calc(var(--u)*250);align-self:center;display:flex;align-items:center;justify-content:center;box-sizing:border-box;border:calc(var(--u)*6) solid #d9a93c;border-radius:calc(var(--u)*22);background:linear-gradient(160deg,rgba(40,60,160,.75),rgba(8,12,60,.9));box-shadow:inset 0 0 calc(var(--u)*30) rgba(110,170,255,.45),0 0 calc(var(--u)*18) rgba(0,0,0,.6);overflow:hidden;font-size:calc(var(--u)*120);line-height:1}',
'.tbo-ic img,.tbo-ic canvas{position:static!important;left:auto!important;top:auto!important;width:86%;height:86%;object-fit:contain;display:block;image-rendering:auto}',/* canvas toàn game bị đặt position:fixed trong index.html => phải ép static kẻo thú bay ra giữa màn hình */
'.rk{position:absolute;left:var(--ins,0);top:var(--ins,0);right:var(--ins,0);bottom:var(--ins,0);box-sizing:border-box;border:var(--bw,2px) solid rgb(var(--rgb));border-radius:var(--rd,6px);pointer-events:none;z-index:3;animation:rkp var(--p,2.5s) ease-in-out infinite alternate}',
'@keyframes rkp{0%{opacity:.55;box-shadow:0 0 calc(var(--g)*.4) rgba(var(--rgb),.45),inset 0 0 calc(var(--g)*.4) rgba(var(--rgb),.3)}100%{opacity:1;box-shadow:0 0 var(--g) rgba(var(--rgb),.95),inset 0 0 calc(var(--g)*1.1) rgba(var(--rgb),.6)}}',
'.rk b{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden;border-radius:inherit}',
'.rk i{position:absolute;bottom:-6%;border-radius:50%;background:rgb(var(--rgb));box-shadow:0 0 5px 1px rgba(var(--rgb),.9);opacity:0;animation:rkq 3s linear infinite}',
'@keyframes rkq{0%{bottom:-6%;transform:scale(.6);opacity:0}15%{opacity:1}80%{opacity:.85}100%{bottom:104%;transform:scale(1);opacity:0}}',
'.tbo-ic.rkc{overflow:visible;border-color:transparent;box-shadow:none}',
'.tbo-ic .rk{--bw:calc(var(--u)*6);--ins:calc(var(--u)*-6);--rd:calc(var(--u)*22)}',
'.tbo-ic .rk i{width:calc(var(--u)*9);height:calc(var(--u)*9)}',
'.tt-c .rk{--ins:5%;--bw:2px;--rd:5px}',
'.tt-c .rk i{width:3px;height:3px}',
'.tbo-b{display:flex;align-items:center;justify-content:center;padding:0;border:0;background:transparent;cursor:pointer;color:#ffe9a0;font:800 calc(var(--u)*60)/1 "Noto Serif","Palatino Linotype",Georgia,serif;text-shadow:0 0 calc(var(--u)*8) #02061c,calc(var(--u)*3) calc(var(--u)*3) 0 #02061c;touch-action:manipulation;-webkit-tap-highlight-color:transparent;border-radius:calc(var(--u)*30)}',
'.tbo-b:active{background:rgba(255,224,102,.28)}',
'.tbo-b.d{color:#ffb8c0}'
].join('\n');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
/* HIỆU ỨNG VIỀN THEO BẬC thú: E trắng, D xanh lá, C lam, B tím, A vàng, S cam, SS đỏ. Viền phát sáng nhấp nháy + hạt bay lên (bậc càng cao càng nhiều hạt, sáng mạnh, nhịp nhanh).
   TTGBAO.fx('D',max) trả về chuỗi HTML của lớp hiệu ứng (đặt làm con ĐẦU của khung thú; khung cha phải position:relative/absolute). max = giới hạn số hạt (dùng cho ô nhỏ). */
var RK={E:['255,255,255',3,3.4,6],D:['61,255,106',4,3,8],C:['63,169,255',5,2.7,10],B:['179,107,255',6,2.4,12],A:['255,210,31',7,2.1,14],S:['255,138,31',9,1.8,16],SS:['255,48,48',12,1.4,20]};
function fx(bac,max){var r=RK[bac];if(!r)return '';var n=Math.min(r[1],max||99),h='<span class="rk" style="--rgb:'+r[0]+';--p:'+r[2]+'s;--g:'+r[3]+'px"><b>',i,d;
 for(i=0;i<n;i++){d=(1.8+Math.random()*1.6)*(r[2]<2?.8:1);h+='<i style="left:'+(6+Math.random()*88).toFixed(1)+'%;animation-duration:'+d.toFixed(2)+'s;animation-delay:-'+(Math.random()*d).toFixed(2)+'s"></i>';}
 return h+'</b></span>';}
var wrap,fr,msg,btn=[],tm=0,mode='',onc=null;
function put(el,b){var s=el.style;s.left=(b.x/IW*100)+'%';s.top=(b.y/IH*100)+'%';s.width=(b.w/IW*100)+'%';s.height=(b.h/IH*100)+'%';}
function build(){
 if(wrap)return;
 wrap=document.createElement('div');wrap.className='tbo';
 fr=document.createElement('div');fr.className='tbo-fr';wrap.appendChild(fr);
 msg=document.createElement('div');msg.className='tbo-m';fr.appendChild(msg);
 [0,1].forEach(function(){var e=document.createElement('button');e.type='button';e.className='tbo-b';fr.appendChild(e);btn.push(e);});
 IMGS.forEach(function(u){var i=new Image();i.src=u;});
 document.body.appendChild(wrap);
 window.addEventListener('resize',size);}
/* cỡ khung: vừa màn hình, không vượt maxW (CSS px), giữ tỉ lệ ảnh */
var MAXW=760;
function size(){if(!fr)return;var w=Math.min(innerWidth*.94,MAXW,innerHeight*.9*IW/IH);w=Math.max(160,Math.round(w));
 fr.style.width=w+'px';fr.style.height=Math.round(w*IH/IW)+'px';fr.style.setProperty('--u',(w/IW)+'px');}
function reset(){clearTimeout(tm);msg.className='tbo-m';btn.forEach(function(b){b.style.display='none';b.onclick=null;b.className='tbo-b';});}
function flush(){var f=onc;onc=null;if(f)try{f();}catch(e){}}
function open(m,w,dim){build();flush();reset();mode=m;MAXW=w;wrap.className='tbo on'+(dim?' dim':'')+(m==='toast'?' tst':'');size();}
function close(){if(!wrap)return;clearTimeout(tm);wrap.className='tbo';mode='';flush();}
function setBtns(list){list=(list||[]).slice(0,2);var n=list.length;fr.style.backgroundImage='url('+IMGS[n]+')';put(msg,BOX['m'+n]);
 if(n===1)put(btn[0],BOX.b1);else if(n===2){put(btn[0],BOX.b2a);put(btn[1],BOX.b2b);}
 list.forEach(function(d,i){var b=btn[i];b.style.display='flex';b.textContent=d.t;b.className='tbo-b'+(d.cls?' '+d.cls:'');
 b.onclick=function(ev){ev.stopPropagation();close();if(d.cb)d.cb();};});}
function toast(t,ms,cb){if(mode==='confirm'||mode==='panel'){if(cb)cb();return;}open('toast',520,false);setBtns([]);msg.textContent=t;onc=cb||null;fr.onclick=close;tm=setTimeout(close,3000);/* thông báo không có nút: luôn tự tắt sau 3 giây */}
function confirm(html,list){open('confirm',760,true);setBtns(list);msg.innerHTML=html;wrap.onclick=function(e){if(e.target===wrap)close();};}
function panel(html,list,o){open('panel',960,true);o=o||{};setBtns(list);if(o.row)msg.className='tbo-m row';msg.innerHTML=html;wrap.onclick=null;return msg;}
/* BẢNG THÔNG TIN: chữ nhỏ bên TRÁI (tiêu đề, dòng phụ, mô tả có thanh CUỘN), ô hình nhỏ có khung bên PHẢI.
   o = {icon:'<img>|<canvas>|chữ', title, sub, text, tc:'y' (tiêu đề vàng; mặc định xanh), modal:true (không đóng khi chạm nền)}
   Chạm nền tối = bấm nút cuối (Hủy/Đóng) nếu không modal. Trả về phần tử chữ (để vẽ canvas vào icon...). */
function info(o,list){open('panel',900,true);setBtns(list);msg.className='tbo-m info';
 msg.innerHTML='<div class="tbo-tx"><div class="tbo-t'+(o.tc?' '+o.tc:'')+'">'+(o.title||'')+'</div>'+(o.sub?'<div class="tbo-s">'+o.sub+'</div>':'')+(o.text?'<div class="tbo-d">'+o.text+'</div>':'')+'</div>'+(o.icon!=null?'<div class="tbo-ic'+(RK[o.bac]?' rkc':'')+'">'+fx(o.bac)+o.icon+'</div>':'');
 var last=list&&list[list.length-1];
 wrap.onclick=o.modal?null:function(e){if(e.target===wrap){close();if(last&&last.cb)last.cb();}};
 return msg;}
root.TTGBAO=root.TTGTBAO={fx:fx,toast:toast,confirm:confirm,panel:panel,info:info,close:close,BOX:BOX};
})(window);
