/* 87-npc.js - BƯỚC 3: NPC = DỮ LIỆU + ẢNH + KHUNG THOẠI + GẶP TRONG THÁM HIỂM (25/11/2026), nhánh demo-thu-moi. Nạp động từ 81-nut-moi.js (không sửa thứ tự script index.html).
   ĐÃ gắn vào thám hiểm (tungGap, xem phần GẶP NPC cuối file). Chức năng thật của từng loại gắn ở file riêng qua TTGNPC.hanhDong[loai] (loại 'boss' = 88-npc-boss.js; loại khác CHƯA có).
   NPC có `san:true` mới được bốc khi thám hiểm thường; `san:false` chỉ ép gặp bằng ?npc=... KHUNG THOẠI: `loiChao` = mảng khung chat, mỗi khung là chuỗi hoặc {loi:'NPC nói', tra:'câu người chơi đáp (chữ trên nút Tiếp)'}; bấm hết các khung mới hiện nút chức năng + Rời đi. Mỗi vùng 6 NPC, mỗi NPC là 1 LOẠI: boss | cot-truyen | tien-hoa | luyen-khi | san-ban | thuong-nhan.
   Số vùng z theo 51-thu-moi.js (z0 Tuyết Nguyên .. z5 Nguyệt Cung). Thêm vùng sau: thêm 1 dòng tao(z,[...6 NPC theo thứ tự LOAI]) vào CFG.npc.
   ẢNH: game-moi/npc/<id>.webp (dọc 1024x1536, nền trong suốt). Thiếu ảnh thì hiện BÓNG NGƯỜI XÁM; có ảnh thì tự dùng (nạp lỗi thì quay về bóng). Muốn đổi đường dẫn riêng cho 1 NPC: điền trường `anh`.
   API (window.TTGNPC):
     list(vung) -> mảng NPC của vùng (bỏ vung = tất cả) | get(id) | tim(id) | congTim(id,n=1) (trần CFG.timMax)
     mo(id,opts) -> mở cửa sổ NPC. opts = {loi:'câu thoại riêng', nut:[{t,cb,cls}] (thay hàng nút mặc định), onClose:function(lyDo,npc){} (lyDo: 'roi-di' | 'het-gio' | 'thay' | 'dong'), demo:true (thêm nút Loại kế)}
     dong(lyDo) | dangMo() | tamDung() / tiepTuc() (đang trong luồng riêng như đánh boss, nhận việc thì dừng đếm 30 giây)
     hanhDong[loai] = function(npc, ctl, nutK) -> bước sau gắn chức năng thật cho nút của loại đó (ctl = {dong,tamDung,tiepTuc,reset}). Chưa gắn thì bấm nút chỉ hiện "sắp có".
   THIỆN CẢM (tim 0-100): chỉ LƯU ở ttg_moi_npc_v1 = {tim:{id:số}}, CHƯA có tác dụng và CHƯA có giao diện tim (chờ người dùng quyết).
   THỬ NHANH: ?npc=... (ép gặp khi thám hiểm, xem phần GẶP NPC), hoặc menu ẩn (chạm chữ "Danh Vọng") -> "NPC: hiện thử" (mỗi lần bấm sang 1 loại, vùng đang chọn) và "NPC +10 tim". */
(function(root){
'use strict';
var D='game-moi/',KEY='ttg_moi_npc_v1';
var LOAI=['boss','cot-truyen','tien-hoa','luyen-khi','san-ban','thuong-nhan'];
/* tao(z, 6 dòng [tên, mô tả] theo đúng thứ tự LOAI, ghi đè?) -> 6 NPC của vùng z, id dạng z0-boss. Trường mặc định: san:false (chưa giao), tinhCach:'', loiChao:[] (rỗng = câu chào mặc định của loại), td:{} (cấu hình tác dụng riêng).
   ghi đè = {loai:{...}} dùng khi người dùng giao NPC đó (ten, mota, tinhCach, loiChao, san:true, td:{...}). */
function tao(z,ds,gd){var a=[];LOAI.forEach(function(l,i){var n={id:'z'+z+'-'+l,ten:ds[i][0],vung:z,loai:l,mota:ds[i][1],anh:'',san:false,tinhCach:'',loiChao:[],td:{}};var g=gd&&gd[l];if(g)for(var k in g)n[k]=g[k];a.push(n);});return a;}
var CFG={
  timMax:100,                 /* trần thiện cảm */
  npcChoGiay:30,              /* gặp NPC mà không bấm gì trong ngần này giây thì NPC biến mất như bấm [Rời đi]; bấm bất kỳ chỗ nào thì đếm lại */
  anhDir:D+'npc/',            /* ảnh mặc định: game-moi/npc/<id>.webp */
  anhVer:'?v=2',
  tiLeGapNPC:5,               /* % tổng cho CẢ 6 NPC của 1 vùng (người dùng chốt 25/11/2026). Hướng (b): MỖI NPC sẵn sàng được tiLeGapNPC/6 % (~0,83%); đủ 6 NPC thì đúng 5%. Phần còn lại giữ nguyên tỉ lệ thú/quái/boss */
  trongSoLoai:{'boss':1,'cot-truyen':1,'tien-hoa':1,'luyen-khi':1,'san-ban':1,'thuong-nhan':1},   /* chỉnh độ hay gặp theo loại (tương đối so với trung bình các loại; bằng nhau = mỗi NPC đúng tiLeGapNPC/6) */
  boss:{heSoManh:1.5,cao:170,lat:true},   /* NPC Boss: heSoManh = nhân Máu/Tấn công/Giáp của boss thú hoang cùng vùng (đề xuất ban đầu x3, hạ còn 1,5 vì boss gốc Lv25 đã gấp ~2 máu thú V3 cùng cấp; chỉnh ở đây). cao = chiều cao ảnh NPC vẽ trong trận (px), lat = lật ngang ảnh để NPC quay mặt sang TRÁI (về phía thú của bạn) */
  tenVung:{0:'Tuyết Nguyên',1:'Sương Cốc',2:'Vân Đảo',3:'Phong Nguyên',4:'Lôi Vực',5:'Nguyệt Cung'},   /* dự phòng khi chưa có THU_MOI */
  /* mỗi loại: tên hiển thị, màu nhãn, hàng nút (chức năng gắn ở bước sau qua TTGNPC.hanhDong[loai]), câu chào ngẫu nhiên */
  loai:{
    'boss':{ten:'Boss',mau:'#ff7a86',nut:[{k:'khieu-chien',t:'Khiêu chiến'}],chao:['Kẻ nào dám xông vào lãnh địa của ta? Muốn đấu thì ra tay đi!','Thú Sư, ngươi có đủ dũng khí tiếp ta một trận không?']},
    'cot-truyen':{ten:'Cốt Truyện',mau:'#ffe066',nut:[{k:'nhan-nhiem-vu',t:'Nhận nhiệm vụ'}],chao:['Ngồi xuống nghe ta kể một chuyện cũ... nếu ngươi sẵn lòng giúp một việc.','Vùng đất này còn nhiều bí mật. Ngươi có muốn nghe?']},
    'tien-hoa':{ten:'Tiến Hóa',mau:'#9ff5a8',nut:[{k:'trao-doi',t:'Trao đổi'}],chao:['Thú của ngươi có tiềm năng lắm. Ta giúp được, nhưng cần vài thứ.','Tiến hóa là cả một nghệ thuật. Ngươi mang gì đến cho ta?']},
    'luyen-khi':{ten:'Luyện Khí',mau:'#ffb86b',nut:[{k:'doi-do',t:'Đổi đồ'}],chao:['Nguyên liệu rèn đây rồi? Đưa ta, ta luyện thành đá cường hóa.','Lò đang nóng. Có nguyên liệu thì đổi, đừng để nguội!']},
    'san-ban':{ten:'Săn Bắn',mau:'#7fd0ff',nut:[{k:'nhan-viec',t:'Nhận việc'}],chao:['Có con quái đang quấy phá vùng này. Ngươi dám nhận việc săn nó không?','Việc săn bắn có thưởng hậu hĩnh. Nhận hay không?']},
    'thuong-nhan':{ten:'Thương Nhân',mau:'#d9a8ff',nut:[{k:'ban-do',t:'Bán đồ'}],chao:['Mua bán đây! Có đồ thừa thì bán cho ta, giá hôm nay... khó đoán lắm.','Lại một vị khách. Cho ta xem hàng của ngươi nào.']}
  },
  /* 36 NPC = 6 vùng x 6 loại. Tên z0-boss do người dùng đặt; 35 tên còn lại là ĐỀ XUẤT (Hán-Việt theo chủ đề vùng), người dùng sửa sau. Thứ tự mỗi vùng: boss, cốt truyện, tiến hóa, luyện khí, săn bắn, thương nhân. */
  npc:[].concat(
    tao(0,[['Băng Tộc Thiếu Chủ - Tố Nữ Mạc Ly','Thiếu chủ Băng Tộc, kiêu ngạo và lạnh lùng; kẻ nào xông vào lãnh địa tuyết đều bị nàng thử sức. Không thể thu phục.'],
           ['Tuyết Sơn Ẩn Giả - Bạch Hàn Lão','Ẩn sĩ sống nhiều năm trên đỉnh tuyết, nhớ những câu chuyện cổ của Thú Thần Giới.'],
           ['Băng Tinh Linh Sư - Lăng Ngọc','Linh sư dùng tinh thể băng để thúc đẩy linh thú tiến hóa.'],
           ['Hàn Băng Luyện Sư - Cổ Thiết','Thợ rèn lò lạnh, biến nguyên liệu rèn thành đá cường hóa.'],
           ['Tuyết Nguyên Liệp Nhân - Lang Khiếu','Thợ săn dày dạn, hay treo thưởng cho ai hạ được con quái dữ.'],
           ['Hàn Thương Nhân - Kim Tuyết','Lái buôn đi qua băng giá, thu mua nguyên liệu của vùng với giá thất thường.']],
       {'boss':{san:true,tinhCach:'Kiêu ngạo, lạnh lùng',
         loiChao:[
           {loi:'Dừng bước. Đây là lãnh địa của Băng Tộc, phàm nhân như ngươi cũng dám tự tiện bước vào sao?',tra:'Ngươi là ai?'},
           {loi:'Tố Nữ Mạc Ly, thiếu chủ Băng Tộc. Cái tên này ngươi nghe một lần là đủ, đừng mong có lần thứ hai.',tra:'Ta chỉ đi ngang qua thôi.'},
           {loi:'Đi ngang qua? Hừ. Kẻ yếu như ngươi rồi cũng như bông tuyết, chưa chạm đất đã tan trước hơi thở của ta.',tra:'Vậy ngươi muốn gì?'},
           {loi:'Ra tay đi. Thắng được ta thì ngươi mới đáng để ta liếc mắt thêm một lần. Còn nếu không... cút khỏi tuyết nguyên của ta.'}],
         /* td = cấu hình riêng của NPC Boss (đọc bởi 88-npc-boss.js). lv cố định; chiSoTu = loài lấy chỉ số gốc (boss thú hoang vùng 0: Băng Sơn Cự Thú); kyNang = id sách kỹ năng boss; he/hiem hiển thị; KHÔNG bắt được, KHÔNG bậc Rank, KHÔNG hiện Vn */
         td:{lv:25,tien:3,chiSoTu:'1j',kyNang:'sach-bang-son-ap-dinh',he:['bang'],hiem:'truyenthuyet',
             thuong:{chau:{cap:1,n:5},tt:1000,trangBi:true,nguyenLieu:true,sach:true,sachTiLe:10,heSoExp:3}}}}),
    tao(1,[['Vụ Cốc Yêu Cơ - Mặc Sương','Yêu cơ ẩn trong màn sương dày, mê hoặc rồi ra tay với kẻ lạc đường.'],
           ['Vụ Cốc Thủ Hộ - Thanh Y Lão Bà','Bà lão canh giữ cổ đạo trong thung lũng, biết bí mật của làn sương.'],
           ['Lộ Châu Dược Sư - Tố Lộ','Dược sư hái sương mai, pha thuốc cho linh thú tiến hóa.'],
           ['Vụ Hỏa Luyện Sư - Thiết Lâm','Thợ rèn lò lửa giữa sương mù, đổi nguyên liệu lấy đá cường hóa.'],
           ['Vụ Ảnh Liệp Thủ - Ảnh Tiễn','Cung thủ ẩn trong sương, giao việc săn quái cho người can đảm.'],
           ['Sương Cốc Hành Thương - Lão Phú','Lái buôn rong ruổi giữa các thung lũng, giá cả đổi theo ngày.']]),
    tao(2,[['Vân Đảo Phong Chủ - Thiên Hạc Chân Nhân','Chủ đảo trên mây, kiếm pháp cao siêu, không chịu thua kẻ lạ.'],
           ['Vân Đảo Sử Quan - Lưu Vân Tiên Sinh','Người chép sử của các đảo bay, giữ nhiều truyền thuyết và nhiệm vụ cổ.'],
           ['Vân Thê Linh Sư - Bích Vân','Nữ linh sư dùng khí mây nuôi dưỡng thú, am hiểu tiến hóa.'],
           ['Thiên Công Luyện Sư - Vân Cương','Thợ luyện khí trên đảo bay, đổi nguyên liệu rèn lấy đá cường hóa.'],
           ['Vân Hải Liệp Nhân - Phi Ưng','Thợ săn cưỡi gió, chuyên nhận việc truy lùng quái vùng mây.'],
           ['Vân Đảo Thuyền Thương - Thái Bình','Thương nhân đi thuyền mây, mua nguyên liệu vùng đảo theo giá từng ngày.']]),
    tao(3,[['Phong Nguyên Kỵ Soái - Liệt Phong Tướng Quân','Kỵ soái của thảo nguyên gió, trận nào cũng xông lên đầu.'],
           ['Thảo Nguyên Trưởng Lão - Cổ Phong','Trưởng lão bộ tộc, kể chuyện cũ bên đống lửa thảo nguyên.'],
           ['Phong Linh Điều Giáo Sư - Tiêu Dao','Điều giáo sư am hiểu linh thú hệ gió, biết cách khơi dậy tiến hóa.'],
           ['Phong Nguyên Thiết Tượng - Liệt Thiết','Thợ rèn du mục, luyện nguyên liệu thành đá cường hóa.'],
           ['Phong Nguyên Liệp Kỵ - Truy Phong','Kỵ sĩ săn bắn, giao việc hạ quái cho ai đủ gan.'],
           ['Phong Nguyên Đoàn Thương - Sa Mạn','Trưởng đoàn buôn thảo nguyên, mua nguyên liệu vùng gió giá lên xuống thất thường.']]),
    tao(4,[['Lôi Vực Thiên Tướng - Chấn Lôi Hầu','Thiên tướng canh giữ lôi vực, sấm sét tuân theo lệnh.'],
           ['Lôi Vực Tế Tư - Điện Quang Lão Nhân','Lão tế tư đọc điềm sấm, biết nguồn gốc của vùng đất sét đánh.'],
           ['Lôi Linh Đạo Sĩ - Tử Điện','Đạo sĩ dẫn lôi điện nuôi linh thú, giúp thú tiến hóa.'],
           ['Lôi Hỏa Luyện Sư - Tiêu Lôi','Thợ luyện khí dùng lôi hỏa, đổi nguyên liệu lấy đá cường hóa.'],
           ['Lôi Vực Liệp Sát - Thiểm Điện','Sát thủ nhanh như chớp, giao việc săn quái có thưởng.'],
           ['Lôi Vực Hành Thương - Kim Điện','Lái buôn liều mạng giữa bão sét, mua nguyên liệu vùng với giá ngẫu nhiên.']]),
    tao(5,[['Nguyệt Cung Thánh Nữ - Thanh Quang Tiên Tử','Thánh nữ giữ cung trăng, ánh sáng thanh lạnh dò thử sức người đến.'],
           ['Nguyệt Cung Điển Quan - Quế Hương Tiên Tử','Tiên tử giữ điển tịch cung trăng, nắm giữ cốt truyện cuối của hành trình.'],
           ['Nguyệt Thố Linh Sư - Ngọc Thố Tiên','Linh sư nuôi thỏ ngọc, am hiểu tiến hóa của linh thú hệ trăng.'],
           ['Nguyệt Cung Thợ Ngọc - Tinh Nguyệt Tượng','Thợ chế ngọc trăng, đổi nguyên liệu rèn lấy đá cường hóa.'],
           ['Nguyệt Cung Thị Vệ - Dạ Quang Kiếm','Thị vệ cung trăng, thay mặt cung giao việc diệt quái.'],
           ['Nguyệt Cung Bảo Thương - Ngân Hà Cô','Nữ thương nhân bán báu vật trăng, mua nguyên liệu vùng với giá đổi theo đêm.']])
  )
};

/* ================= LƯU TRỮ (tim) ================= */
var S={tim:{}};
try{var o0=JSON.parse(localStorage.getItem(KEY)||'{}');if(o0&&o0.tim&&typeof o0.tim==='object')S.tim=o0.tim;}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}

/* ================= TIỆN ÍCH ================= */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function toast(t){try{if(root.TTGTBAO&&root.TTGTBAO.toast)root.TTGTBAO.toast(t,2200);}catch(e){}}
function tenVung(z){var l=(root.THU_MOI&&root.THU_MOI.zones)||[],i;for(i=0;i<l.length;i++)if(l[i].z===z)return l[i].ten;return CFG.tenVung[z]||('Vùng '+z);}
function vungHienTai(){try{if(root.TTGDV&&root.TTGDV.vung)return root.TTGDV.vung()|0;}catch(e){}return 0;}
function list(vung){return CFG.npc.filter(function(n){return vung==null||n.vung===(vung|0);});}
function get(id){var i;for(i=0;i<CFG.npc.length;i++)if(CFG.npc[i].id===id)return CFG.npc[i];return null;}
function tim(id){var v=+S.tim[id];return isFinite(v)?Math.max(0,Math.min(CFG.timMax,Math.floor(v))):0;}
function congTim(id,n){if(!get(id))return 0;n=(n==null)?1:Math.floor(+n)||0;var v=Math.max(0,Math.min(CFG.timMax,tim(id)+n));S.tim[id]=v;save();return v;}

/* ================= GIAO DIỆN ================= */
var SIL='<svg class="npc-sil" viewBox="0 0 200 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs><linearGradient id="npcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d86ab"/><stop offset="1" stop-color="#2b3052"/></linearGradient></defs><circle cx="100" cy="62" r="30" fill="url(#npcg)" opacity=".85"/><path d="M62 300 L68 128 Q100 104 132 128 L138 300 Z" fill="url(#npcg)" opacity=".85"/><path d="M68 128 Q40 170 46 230 L62 230 L72 150Z M132 128 Q160 170 154 230 L138 230 L128 150Z" fill="url(#npcg)" opacity=".7"/></svg>';
var css=[
'.npc{position:fixed;left:0;top:0;right:0;bottom:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.7);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;color:#e8ecff;-webkit-tap-highlight-color:transparent}',
'.npc.on{display:flex}',
'.npc-in{position:relative;display:flex;align-items:flex-end;gap:2%;width:min(97vw,920px);height:min(92vh,620px);animation:npc-in .2s ease-out}',
'@keyframes npc-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}',
'.npc-pic{flex:0 0 36%;height:100%;min-width:0;display:flex;align-items:flex-end;justify-content:center}',
'.npc-pic svg,.npc-pic img{width:100%;height:100%;object-fit:contain;object-position:center bottom;filter:drop-shadow(0 6px 14px rgba(0,0,0,.65));pointer-events:none;user-select:none;-webkit-user-select:none}',
'.npc-box{flex:1;min-width:0;max-height:100%;margin-bottom:2%;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;padding:14px 16px 10px;border:2px solid #d9a93c;border-radius:14px;background:linear-gradient(160deg,rgba(28,42,124,.95),rgba(6,10,46,.97));box-shadow:0 0 18px rgba(60,140,255,.5),inset 0 0 22px rgba(110,170,255,.25)}',
'.npc-hd{display:flex;align-items:center;flex-wrap:wrap;gap:8px}',
'.npc-nm{font-weight:800;font-size:clamp(16px,3.4vh,24px);line-height:1.2;color:#ffe9a0;text-shadow:0 2px 0 #02061c}',
'.npc-tg{font-size:12px;font-weight:800;padding:2px 9px;border-radius:99px;border:1px solid currentColor;background:rgba(0,0,30,.5);white-space:nowrap}',
'.npc-vg{font-size:13px;font-weight:700;color:#9fb4e8;margin-top:-4px}',
'.npc-ds{font-size:13px;line-height:1.4;color:#b9c6ee;font-style:italic;overflow-y:auto;min-height:0;touch-action:pan-y;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#d9a93c rgba(0,0,40,.5)}',
'.npc-ls{font-size:clamp(14px,2.6vh,18px);line-height:1.5;color:#fff3c4;font-weight:600;padding:8px 10px;border-radius:10px;background:rgba(0,0,40,.45);border-left:3px solid #d9a93c}',
'.npc-ls .fr{float:right;margin-left:8px;font-size:11px;font-weight:700;color:#8a90c0}',
'.npc-bt{display:flex;flex-wrap:wrap;gap:8px;margin-top:2px}',
'.npc-b{padding:10px 16px;border:2px solid #d9a93c;border-radius:10px;background:linear-gradient(180deg,#2a3a8c,#121a52);color:#ffe9a0;font:800 15px "Noto Serif","Palatino Linotype",Georgia,serif;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.npc-b:active{background:#3a4cb0}',
'.npc-b.d{color:#ffb8c0}',
'.npc-b.n{color:#9ff5a8}',
'.npc-tm{position:relative;height:18px;margin-top:2px}',
'.npc-tm::before{content:"";position:absolute;left:0;top:0;width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,.12)}',
'.npc-tm i{position:absolute;left:0;top:0;height:4px;width:100%;border-radius:2px;background:#d9a93c;transition:width .25s linear}',
'.npc-tm span{position:absolute;left:0;top:7px;font-size:11px;color:#8a90c0}',
'@media (orientation:portrait){.npc-in{flex-direction:column;align-items:stretch;gap:6px;width:min(94vw,520px);height:min(96vh,860px)}.npc-pic{flex:1 1 0;min-height:0;width:100%}.npc-box{flex:none;margin-bottom:0}}'
].join('\n');

var W=null,E={},cur=null,curOpts=null,on=false,paused=false,deadline=0,tmI=0,anhLoi={},frames=[],fi=0;
function build(){
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  W=document.createElement('div');W.className='npc';
  W.innerHTML='<div class="npc-in"><div class="npc-pic"></div><div class="npc-box"><div class="npc-hd"><div class="npc-nm"></div><span class="npc-tg"></span></div><div class="npc-vg"></div><div class="npc-ds"></div><div class="npc-ls"></div><div class="npc-bt"></div><div class="npc-tm"><i></i><span></span></div></div></div>';
  E.pic=W.querySelector('.npc-pic');E.nm=W.querySelector('.npc-nm');E.tg=W.querySelector('.npc-tg');E.vg=W.querySelector('.npc-vg');
  E.ds=W.querySelector('.npc-ds');E.ls=W.querySelector('.npc-ls');E.bt=W.querySelector('.npc-bt');E.tmi=W.querySelector('.npc-tm i');E.tmt=W.querySelector('.npc-tm span');
  E.ls.addEventListener('click',function(){if(on&&fi<frames.length-1)hienKhung(fi+1);});   /* chạm khung thoại = sang khung chat sau */
  W.addEventListener('pointerdown',reset,true);   /* bấm bất kỳ đâu trong cửa sổ = đếm lại 30 giây (bấm nền tối KHÔNG đóng, tránh lỡ tay) */
  document.body.appendChild(W);
  document.addEventListener('keydown',function(e){if(on&&e.key==='Escape')dong('roi-di');});
}
function reset(){if(!on||paused)return;deadline=Date.now()+CFG.npcChoGiay*1000;tick();}
function tick(){
  if(!on)return;
  if(paused){E.tmt.textContent='';E.tmi.style.width='0';return;}
  var tot=CFG.npcChoGiay*1000,left=deadline-Date.now();
  if(left<=0){dong('het-gio');return;}
  E.tmi.style.width=(left/tot*100).toFixed(1)+'%';E.tmt.textContent='Tự rời đi sau '+Math.ceil(left/1000)+'s';
}
function tamDung(){if(!on)return;paused=true;tick();}
function tiepTuc(){if(!on)return;paused=false;reset();}
function ctl(){return {dong:dong,tamDung:tamDung,tiepTuc:tiepTuc,reset:reset};}
function picNpc(n){   /* bóng xám hiện ngay; ảnh nạp xong thì thay vào, lỗi thì giữ bóng */
  E.pic.innerHTML=SIL;
  if(anhLoi[n.id])return;
  var im=new Image();im.alt=n.ten;
  im.onload=function(){if(cur===n){E.pic.innerHTML='';E.pic.appendChild(im);}};
  im.onerror=function(){anhLoi[n.id]=1;};
  im.src=n.anh||(CFG.anhDir+n.id+'.webp'+CFG.anhVer);
}
function chay(n,d){   /* bấm nút mặc định của loại: có hàm gắn ở bước sau thì gọi, chưa thì báo sắp có */
  var f=T.hanhDong[n.loai];
  if(typeof f==='function'){try{f(n,ctl(),d.k);}catch(e){}}
  else toast(d.t+': sắp có');
}
function keLoai(n,o){var i=LOAI.indexOf(n.loai);mo('z'+n.vung+'-'+LOAI[(i+1)%LOAI.length],o);}
/* hiện khung chat thứ i: lời NPC (+ số khung) rồi nút */
function hienKhung(i){
  fi=Math.max(0,Math.min(frames.length-1,i));var f=frames[fi];
  E.ls.innerHTML='“'+esc(f.loi)+'”'+(frames.length>1?'<span class="fr">'+(fi+1)+'/'+frames.length+'</span>':'');
  dungNut(cur,curOpts||{});}
function dungNut(n,o){
  var L=CFG.loai[n.loai]||{nut:[]};
  var ds=(o.nut||L.nut.map(function(d){return {t:d.t,cb:function(){chay(n,d);}};})).slice();
  if(fi<frames.length-1){var tr=frames[fi].tra||'Tiếp ▶';ds=[{t:tr,cls:'n',cb:function(){hienKhung(fi+1);}}];}   /* chưa hết khung chat: nút = câu người chơi đáp, bấm để sang khung sau (chưa hiện nút chức năng) */
  if(o.demo)ds.push({t:'Loại kế ▶',cls:'n',cb:function(){keLoai(n,o);}});
  ds.push({t:'Rời đi',cls:'d',cb:function(){dong('roi-di');}});
  E.bt.innerHTML='';
  ds.forEach(function(d){
    var b=document.createElement('button');b.type='button';b.className='npc-b'+(d.cls?' '+d.cls:'');b.textContent=d.t;
    b.addEventListener('click',function(ev){ev.stopPropagation();reset();if(d.cb)d.cb(ev);});
    E.bt.appendChild(b);
  });
}
function mo(id,o){
  var n=get(id);if(!n)return false;
  o=o||{};
  if(!W)build();
  if(on)dong('thay');
  var L=CFG.loai[n.loai]||{ten:n.loai,mau:'#fff',nut:[],chao:['...']};
  cur=n;curOpts=o;on=true;paused=false;
  E.nm.textContent=n.ten;E.tg.textContent=L.ten;E.tg.style.color=L.mau;
  E.vg.textContent=tenVung(n.vung)+' · Vùng '+(n.vung+1);
  E.ds.textContent=n.mota||'';
  frames=o.loi?[{loi:o.loi}]:((n.loiChao&&n.loiChao.length)?n.loiChao.map(function(x){return typeof x==='string'?{loi:x}:x;}):[{loi:L.chao[Math.floor(Math.random()*L.chao.length)]||'...'}]);
  fi=0;picNpc(n);hienKhung(0);
  W.classList.add('on');
  clearInterval(tmI);tmI=setInterval(tick,250);
  reset();
  return true;
}
function dong(ly){
  if(!on)return;
  on=false;clearInterval(tmI);W.classList.remove('on');
  var n=cur,f=curOpts&&curOpts.onClose;cur=null;curOpts=null;
  if(f){try{f(ly||'dong',n);}catch(e){}}
}
function dangMo(){return on;}

/* ================= GẶP NPC TRONG THÁM HIỂM (82-tham-hiem-auto.js gọi tungGap mỗi lượt) =================
   ?npc=demo -> ép gặp 100% mỗi lượt, NPC ngẫu nhiên của vùng (bỏ qua san) | ?npc=boss (cot-truyen, tien-hoa, luyen-khi, san-ban, thuong-nhan) -> ép đúng loại của vùng đang chọn | ?npc=z0-boss (id bất kỳ) -> ép đúng NPC đó.
   Không có tham số: tung theo tỉ lệ thật, CHỈ trong số NPC san:true của vùng đang chọn; mỗi NPC = tiLeGapNPC/6 % (nhân trongSoLoai tương đối). Vùng chưa có NPC san:true thì không tung. */
var FORCE=(function(){var m=/[?&]npc=([^&#]*)/.exec(location.search);return m?decodeURIComponent(m[1]):'';})();
var epGap=false;   /* nút test ẩn "NPC: 100% gặp" bật/tắt: mỗi lượt thám hiểm chắc chắn gặp 1 NPC của vùng đang chọn (ưu tiên NPC san:true, vùng chưa có thì lấy NPC bất kỳ của vùng) */
function tungGap(vung){
  vung=(vung==null)?vungHienTai():(vung|0);
  if(epGap&&!FORCE){var ds0=list(vung),rd=ds0.filter(function(n){return n.san;});if(rd.length)ds0=rd;return ds0.length?ds0[Math.floor(Math.random()*ds0.length)].id:null;}
  if(FORCE){
    if(FORCE==='demo'){var all=list(vung);return all.length?all[Math.floor(Math.random()*all.length)].id:null;}
    if(LOAI.indexOf(FORCE)>=0){return get('z'+vung+'-'+FORCE)?'z'+vung+'-'+FORCE:null;}
    return get(FORCE)?FORCE:null;}
  var ds=list(vung).filter(function(n){return n.san;});if(!ds.length)return null;
  var ws=CFG.trongSoLoai||{},tb=0,i;LOAI.forEach(function(l){tb+=(ws[l]!=null?+ws[l]:1);});tb=tb/LOAI.length||1;
  var base=(+CFG.tiLeGapNPC||0)/100/LOAI.length,r=Math.random(),acc=0;
  for(i=0;i<ds.length;i++){acc+=base*((ws[ds[i].loai]!=null?+ws[ds[i].loai]:1)/tb);if(r<acc)return ds[i].id;}
  return null;}

var T=root.TTGNPC={CFG:CFG,LOAI:LOAI,list:list,get:get,tim:tim,congTim:congTim,tenVung:tenVung,mo:mo,dong:dong,dangMo:dangMo,tamDung:tamDung,tiepTuc:tiepTuc,tungGap:tungGap,hanhDong:{}};

/* ================= THỬ NHANH ================= */
var lastId='',cyc=0;
var IC='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="20" r="10" fill="#8a93c0" stroke="#1b2250" stroke-width="3"/><path d="M14 58 Q16 34 32 32 Q48 34 50 58 Z" fill="#5a6395" stroke="#1b2250" stroke-width="3"/></svg>';
function thu(){var l=LOAI[cyc%LOAI.length];cyc++;lastId='z'+vungHienTai()+'-'+l;if(!mo(lastId))toast('Chưa có NPC '+lastId);}
function themTim(){var id=lastId||('z'+vungHienTai()+'-boss'),n=get(id);if(!n){toast('Chưa có NPC '+id);return;}toast('TEST: '+n.ten+' · tim '+congTim(id,10)+'/'+CFG.timMax);}
if(root.TTGNV&&root.TTGNV.add){
  root.TTGNV.add({id:'npc-thu',ten:'NPC: hiện thử',dev:true,onTap:thu,icon:IC});
  root.TTGNV.add({id:'npc-ep-gap',ten:'NPC: 100% gặp',dev:true,onTap:function(){epGap=!epGap;toast('TEST: '+(epGap?'BẬT - mỗi lượt thám hiểm chắc chắn gặp NPC vùng này':'TẮT - tỉ lệ gặp thật'));},icon:IC});
  root.TTGNV.add({id:'npc-tim',ten:'NPC +10 tim',dev:true,onTap:themTim,icon:IC});
}
})(typeof window!=='undefined'?window:globalThis);
