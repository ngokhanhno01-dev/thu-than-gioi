/* 56c-buff.js - BUFF (NỘI TẠI) / DEBUFF VÙNG + BUFF RIÊNG BOSS + TÊN ĐÒN CƠ BẢN (6 vùng z0..z5). Thuần dữ liệu + hàm tính, KHÔNG DOM, KHÔNG vẽ. Mở rộng window.TTGCS.
   Nạp SAU 56b-loai.js. Nguồn sự thật: THIET_KE_CHI_SO.md mục 6-7. MỌI SỐ chỉnh ở bảng VUNG bên dưới.
   Quy tắc (mục 6): buff/debuff vùng áp cho MỌI thú thuộc loài của vùng (thú, quái, boss, thú người chơi).
   Debuff vùng gắn lên ĐỐI THỦ khi vào trận, kéo dài cả trận, và bị giảm theo (1 - khu/100) của người bị gắn. Buff không bị khu ảnh hưởng.
   3 ô tròn của giao diện thú: buff (nội tại) | debuff | đòn cơ bản. Đòn cơ bản = đánh thường theo chỉ số (hsKyNang 1), KHÔNG hồi chiêu, KHÔNG hiệu ứng kèm: chỉ có TÊN riêng mỗi vùng.
   Mọi hiệu ứng đặc biệt (lớp, hồi máu, khiên, choáng...) nằm trong buff nội tại. Boss: 2 buff (buff vùng + buff riêng) + 1 debuff (debuff vùng) + đòn cơ bản. Kỹ năng độc quyền boss (có cd, kiêm sách kỹ năng, rơi 1,5% khi giết boss): bảng KY_NANG_BOSS.

   Mỗi hiệu ứng gồm:
   - mod: [{stat,pct}] cộng THẲNG vào chỉ số (đưa vào ctx.mod của TTGCS.tinh). Chính hp/tc/pt/td/mm nhân (1+pct/100); chỉ số phụ cộng điểm %.
   - tam: [{stat,pct,luot?,hpDuoi?}] chỉ số TẠM THỜI/CÓ ĐIỀU KIỆN: luot = chỉ có hiệu lực ở N lượt đầu của trận; hpDuoi = khi hp dưới X% hp tối đa. Lấy bằng modTam().
   - ev: [{...}] sự kiện trong trận do bước D (bộ máy trận) thực thi: tả bằng dữ liệu, ở đây KHÔNG chạy trận.
     loại ev: hoiLuot{pctHp} hồi %hp tối đa mỗi lượt | khienDau{pctHp} khiên đầu trận | lop{ten,du,moiDon,ra} mỗi đòn gắn 1 lớp, đủ `du` lớp thì kích `ra` (rồi xóa lớp)
              | chiMangRa{choang:{xs,luot}} khi chí mạng thì xs% làm choáng | neRa{stat,pct,luot} né thành công thì lượt sau cộng stat | tamKhiHp ... (xem tam)
   API: TTGCS.vungBuff(z) | debuffVung(z) | buffBoss(z) | modTinh(thu, doiThu?, opt?) | modTam(thu, st) | suKien(thu) | hoiLuot(thu,hpMax) | khienDau(thu,hpMax) | donCoBan(z) | kyNangBoss(z) | VUNG_BUFF, KY_NANG_BOSS, TY_LE_ROI_SACH */
(function(root){
'use strict';

/* ===== BẢNG BUFF/DEBUFF 6 VÙNG ===== */
var VUNG={
  0:{ /* Tuyết Nguyên */
    debuff:{ten:'Hàn Khí',mod:[{stat:'td',pct:-15}]},
    buff:{ten:'Đông Cứng',mod:[],ev:[{k:'lop',ten:'lanh',du:4,moiDon:1,ra:{dongBang:1}}]},                 /* đủ 4 lớp lạnh thì đóng băng 1 lượt (khu chặn; miễn đóng băng 2 lượt sau đó) */
    boss:{ten:'Băng Giáp',mod:[{stat:'pt',pct:20}],ev:[]}
  },
  1:{ /* Sương Cốc */
    debuff:{ten:'Sương Mù',mod:[{stat:'cx',pct:-15}]},
    buff:{ten:'Sương Tức',mod:[],ev:[{k:'hoiLuot',pctHp:3}]},
    boss:{ten:'Sương Dày',mod:[{stat:'ne',pct:20}],ev:[]}
  },
  2:{ /* Vân Đảo */
    debuff:{ten:'Vân Nặng',mod:[{stat:'tc',pct:-10}]},
    buff:{ten:'Vân Hộ',mod:[],ev:[{k:'khienDau',pctHp:15}]},
    boss:{ten:'Phi Thiên',mod:[],tam:[{stat:'ne',pct:25,luot:2}],ev:[]}
  },
  3:{ /* Phong Nguyên */
    debuff:{ten:'Cuồng Phong',mod:[{stat:'ne',pct:-10}]},
    buff:{ten:'Phong Tích',mod:[{stat:'td',pct:15}],ev:[{k:'lop',ten:'gio',du:3,moiDon:1,ra:{lienKich:{hsTc:0.6}}}]},
    boss:{ten:'Xà Hành',mod:[],tam:[{stat:'td',pct:20,luot:1}],ev:[]}
  },
  4:{ /* Lôi Vực */
    debuff:{ten:'Tĩnh Điện',mod:[{stat:'khu',pct:-15}]},
    buff:{ten:'Lôi Kích',mod:[{stat:'cm',pct:15}],ev:[{k:'chiMangRa',choang:{xs:20,luot:1}}]},
    boss:{ten:'Lôi Giáp',mod:[{stat:'pd',pct:15}],ev:[]}
  },
  5:{ /* Nguyệt Cung */
    debuff:{ten:'Nguyệt Quang',mod:[{stat:'cm',pct:-20}]},
    buff:{ten:'Nguyệt Ảnh',mod:[{stat:'ne',pct:15}],ev:[{k:'neRa',stat:'tc',pct:30,luot:1}]},
    boss:{ten:'Nguyệt Thực',mod:[],tam:[{stat:'tc',pct:30,hpDuoi:30},{stat:'hutm',pct:15,hpDuoi:30}],ev:[]}
  }
};

/* tên đòn cơ bản (đánh thường) theo vùng; không số liệu riêng */
var DON_CO_BAN=['Băng Tinh','Sương Phủ','Vân Tỏa','Phong Nhận','Sấm Rền','Nguyệt Huy'];
function donCoBan(z){return DON_CO_BAN[z]?{ten:DON_CO_BAN[z],hsKyNang:1,hoiChieu:0}:null;}

/* ===== KỸ NĂNG ĐỘC QUYỀN BOSS (mục 7b THIET_KE). hsTc = hsKyNang của satThuong; cd = hồi chiêu (lượt); he = hệ của kỹ năng (một hệ của boss).
   QUY TẮC KHI THÊM / SỬA KỸ NĂNG (đọc trước, tránh khai hiệu ứng "ma"):
   1. Mô tả sách (Balo, bảng thú) TỰ SINH từ bảng này (sachMoTa) => cái gì khai ở đây là cái người chơi SẼ ĐỌC THẤY. Khai mà trận không chạy = người chơi thấy hiệu ứng không có thật.
   2. Chỉ khai ev mà index.html ĐÃ CÓ CODE chạy (liệt kê bên dưới). Muốn hiệu ứng mới: viết code ở index.html + ghi vào danh sách này TRƯỚC, rồi mới khai cho kỹ năng.
   3. cd và số liệu chỉ sửa Ở ĐÂY. 54-thu-than.js đọc cd từ bảng này (hàm cdSach), KHÔNG khai cd riêng cho sách boss.
   4. Sửa xong thì cập nhật THIET_KE_CHI_SO.md mục 7b và GHI_CHU.md cho khớp.
   ev của KỸ NĂNG (k.ev, chạy khi kỹ năng trúng): hutMau{pct} hút % sát thương thành máu | choang{xs,luot} choáng (kc chặn).
   ev của NỘI TẠI (noiTai.ev, chạy sau khi dùng kỹ năng): debuff{stat:'pt' hoặc 'tc',pct,luot} lên đối thủ (giảm theo khu) | buHutMau{pct,luot} | buXuyenGiap{pct,luot} | khienSau{pctHp} | gayMu{pct,luot} (giảm theo khu) | choangNT{xs,luot} (kc chặn) | thuyAn (gắn Thủy Ấn: kỹ năng kế tiếp trúng x2 rồi mất ấn) | dietThe{luot,td,pt,cx,tc,gh,kn} (debuff gộp Diệt Thế: giảm tốc độ/giáp/chính xác/tấn công, giảm hồi máu, khóa kỹ năng; xem dtApply) | mocTam{pct,max} (kỹ năng tự dùng tuHoi: +1 Mộc Tâm mỗi lần dùng, tối đa max, giữ đến hết trận; cuối mỗi lượt của chính bên đó hồi pct% máu tối đa x số Mộc Tâm) | hoaAn{pct,luot} (gắn Hỏa Ấn: cuối mỗi lượt của bên dính, chịu pct% Công người gắn, sát thương chuẩn).
   CHƯA CÓ CODE CHẠY, ĐỪNG KHAI cho kỹ năng: tuBuff (tự buff), debuff đơn với stat khác pt/tc (tốc độ/chính xác/giảm hồi máu/khóa kỹ năng CHỈ có trong ev gộp 'dietThe'), lop (lớp lạnh). */
var KY_NANG_BOSS=[
  {id:'bang-son-ap-dinh',ten:'Băng Sơn Áp Đỉnh',boss:'1j',he:'bang',hsTc:1.8,cd:5,ev:[],
   mt:'Triệu hồi 1 ngọn núi băng trấn áp đối thủ',
   noiTai:{ten:'Lạnh Thấu Xương',mod:[],ev:[{k:'debuff',stat:'pt',pct:-20,luot:2}]}},
  {id:'suong-nuot',ten:'Sương Nuốt',boss:'2j',he:'thuy',hsTc:1.5,cd:5,ev:[{k:'hutMau',pct:30}],
   noiTai:{ten:'Huyết Sương',mod:[],ev:[{k:'buHutMau',pct:10,luot:3}]}},
  {id:'con-bang-trien-si',ten:'Côn Bằng Triển Sí',boss:'3j',he:'phong',hsTc:2.0,cd:5,ev:[],
   noiTai:{ten:'Vân Cánh',mod:[],ev:[{k:'khienSau',pctHp:20}]}},
  {id:'vu-xa-trien',ten:'Vũ Xà Triền',boss:'6j',he:'phong',hsTc:1.4,cd:4,ev:[],
   noiTai:{ten:'Xà Hành',mod:[],ev:[{k:'buXuyenGiap',pct:15,luot:3}]}},
  {id:'thien-loi-giang',ten:'Thiên Lôi Giáng',boss:'4j',he:'loi',hsTc:2.2,cd:6,ev:[],
   noiTai:{ten:'Lôi Kích',mod:[],ev:[{k:'choangNT',xs:30,luot:1}]}},
  {id:'nguyet-thuc-nuot',ten:'Nguyệt Thực Nuốt',boss:'5j',he:'am',hsTc:2.0,cd:5,ev:[],
   noiTai:{ten:'Nguyệt Mê',mod:[],ev:[{k:'gayMu',pct:40,luot:2}]}},
  {id:'thuy-long-pha-nguyet',ten:'Thủy Long Phá Nguyệt',boss:'7j',he:'thuy',hsTc:1.5,cd:5,ev:[],
   noiTai:{ten:'Thủy Ấn',mod:[],ev:[{k:'thuyAn'}]}},
  {id:'viem-long-pha-nhat',ten:'Viêm Long Phá Nhật',boss:'8j',he:'hoa',hsTc:2.0,cd:5,ev:[],
   noiTai:{ten:'Hỏa Ấn',mod:[],ev:[{k:'hoaAn',pct:40,luot:3}]}},
  /* KỸ NĂNG TỰ DÙNG (tuHoi): không gây sát thương, không né/hụt, dùng lên chính bản thân: hồi tuHoi.pct% máu tối đa ngay + nội tại Mộc Tâm. hsTc=0 (không dùng). cd 3 = chu kỳ 3 lượt. */
  {id:'van-moc-hoi-xuan',ten:'Vạn Mộc Hồi Xuân',boss:'9j',he:'moc',hsTc:0,cd:3,tuHoi:{pct:20},ev:[],
   noiTai:{ten:'Mộc Tâm',mod:[],ev:[{k:'mocTam',pct:5,max:10}]}},
  /* BOSS THẦN (phẩm chất Thần, hệ Không Gian). Diệt Thế: 1 debuff gộp, chạy ở index.html (dtApply/effS/hoiHs/knDecide). Số chỉnh ngay dòng dưới: td/pt/cx/tc = % (cx tính theo ĐIỂM Chính xác), gh = % giảm hồi máu, kn = khóa kỹ năng.
     Kháng (khu) giảm hiệu lực các số % ở trên; khóa kỹ năng KHÔNG bị Kháng chặn. */
  {id:'tinh-ha-van-lac',ten:'Tinh Hà Vẫn Lạc',boss:'th1',he:'khonggian',hsTc:5.0,cd:7,ev:[],
   mt:'Triệu hồi nhiều lỗ đen không gian và ném các tinh cầu vào kẻ địch',
   noiTai:{ten:'Diệt Thế',mod:[],ev:[{k:'dietThe',luot:3,td:-30,pt:-30,cx:-30,tc:-25,gh:50,kn:1}]}},
  /* BOSS THẦN Chúc Long (hệ Thời Gian). Thời Gian Tỉnh Lặng: tinhLang={tcPct:% Tấn công cộng thêm cho người dùng, hits:số đòn đánh thường cộng dồn rồi nổ}. Chạy ở index.html (tlBegin/tlAcc/tlBoom). cd TẠM 8 (chỉ đếm khi hết ngưng đọng), chờ người dùng chốt. hsTc=0: không dùng công thức sát thương kỹ năng. */
  {id:'thoi-gian-tinh-lang',ten:'Thời Gian Tỉnh Lặng',boss:'th2',he:'thoigian',hsTc:0,cd:8,ev:[],tinhLang:{tcPct:100,hits:5},
   mt:'Ngưng đọng thời gian: thú đối phương đứng yên, các đòn đánh thường được tích lại rồi nổ một lần'}
];
/* SÁCH KỸ NĂNG = NGUỒN DUY NHẤT: mỗi sách (id 'sach-'+id kỹ năng) gồm 3 phần theo đúng thiết kế:
   (1) CHỈ SỐ = % sát thương theo hệ (hsTc, he; vd 180% sát thương Băng) + hồi chiêu cd (+ ev kèm theo của kỹ năng nếu có: hút máu, choáng...);
   (2) NỘI TẠI = noiTai {ten, ev}: hiệu ứng kèm theo, vd 'Lạnh Thấu Xương': giảm 20% giáp đối thủ trong 2 lượt (debuff, bị giảm theo Kháng của người bị gắn);
   (3) HIỆU ỨNG = hình ảnh kỹ năng (57-fx-ky-nang-boss.js), không phải số liệu.
   Sách KHÔNG cộng chỉ số cho thú mang sách. Boss thú hoang được GÁN sách của mình (boss:'..'); người chơi gắn sách vào thú (thu.kn = [id sách]) thì dùng được y hệt boss. Số trong bảng trên là số chính thức hiện tại (cd chốt 22/11/2026), chỉnh tại đó. */
function sachKyNang(bid){if(typeof bid!=='string'||bid.indexOf('sach-')!==0)return null;var id=bid.slice(5);for(var i=0;i<KY_NANG_BOSS.length;i++)if(KY_NANG_BOSS[i].id===id)return KY_NANG_BOSS[i];return null;}
function sachBoss(bossId){for(var i=0;i<KY_NANG_BOSS.length;i++)if(KY_NANG_BOSS[i].boss===bossId)return 'sach-'+KY_NANG_BOSS[i].id;return null;}
function sachBuffs(thu){var r=[];((thu&&thu.kn)||[]).forEach(function(b){var k=sachKyNang(b);if(!k)return;var n=k.noiTai||{};r.push({mod:n.mod||[],ev:n.ev||[]});});return r;}   /* sách không cộng chỉ số: chỉ nội tại */
function sachMod(thu){var o=[];sachBuffs(thu).forEach(function(h){(h.mod||[]).forEach(function(m){o.push({stat:m.stat,pct:m.pct});});});return o;}   /* chỉ số từ sách -> TTGCS.tinh(thu,{mod:sachMod(thu)}) */
var STAT_VI={hp:'Máu',tc:'Tấn công',pt:'Giáp',td:'Tốc độ',mm:'May mắn',ne:'Né',cx:'Chính xác',cm:'Chí mạng',khu:'Kháng',hutm:'Hút máu',pd:'Phản đòn'};
var HE_VI={thoigian:'Thời Gian',khonggian:'Không Gian',bang:'Băng',thuy:'Thủy',phong:'Phong',loi:'Lôi',am:'Âm',hoa:'Hỏa',moc:'Mộc',tho:'Thổ',doc:'Độc',kim:'Kim'};
function evVi(e){if(e.k==='dietThe')return 'gắn Diệt Thế lên đối thủ trong '+e.luot+' lượt: Tốc độ '+e.td+'%, Giáp '+e.pt+'%, Chính xác '+e.cx+' điểm, Tấn công '+e.tc+'%, hồi máu giảm '+e.gh+'% và KHÔNG dùng được kỹ năng (các chỉ số giảm theo Kháng của đối thủ, khóa kỹ năng thì không)';if(e.k==='mocTam')return 'mỗi lần dùng được 1 Mộc Tâm (cộng dồn tối đa '+e.max+', giữ đến hết trận). Mỗi lượt, mỗi Mộc Tâm hồi '+e.pct+'% máu tối đa (tối đa '+(e.pct*e.max)+'% máu mỗi lượt), bắt đầu tính từ lượt kế tiếp';if(e.k==='hoaAn')return 'trúng thì gắn Hỏa Ấn trong '+e.luot+' lượt (đối thủ né được thì không dính): mỗi lượt đối thủ bị thiêu đốt, chịu sát thương chuẩn bằng '+e.pct+'% Công của người dùng chiêu';if(e.k==='thuyAn')return 'trúng thì gắn 1 Thủy Ấn (đối thủ né được thì không dính). Kỹ năng kế tiếp đánh trúng đối thủ có ấn gây gấp đôi sát thương (chiêu này: 300%) rồi ấn biến mất';if(e.k==='lop')return 'gắn '+e.them+' lớp lạnh';if(e.k==='hutMau')return 'hút '+e.pct+'% sát thương thành máu';if(e.k==='tuBuff')return 'bản thân +'+e.pct+'% '+(STAT_VI[e.stat]||e.stat)+' '+e.luot+' lượt';if(e.k==='debuff')return 'giảm '+Math.abs(e.pct)+'% '+(STAT_VI[e.stat]||e.stat)+' đối thủ trong '+e.luot+' lượt';if(e.k==='choang')return e.xs+'% làm choáng '+e.luot+' lượt';if(e.k==='khienDau')return 'khiên đầu trận '+e.pctHp+'% máu';if(e.k==='buHutMau')return 'sau khi dùng kỹ năng: hút '+e.pct+'% sát thương gây ra thành máu trong '+e.luot+' lượt';if(e.k==='khienSau')return 'sau khi dùng kỹ năng: nhận khiên bằng '+e.pctHp+'% máu tối đa';if(e.k==='buXuyenGiap')return 'sau khi dùng kỹ năng: Xuyên Giáp +'+e.pct+'% trong '+e.luot+' lượt';if(e.k==='choangNT')return 'khi dùng kỹ năng: '+e.xs+'% làm choáng đối thủ '+e.luot+' lượt';if(e.k==='gayMu')return 'sau khi dùng kỹ năng: gây mù, đối thủ đánh hụt '+e.pct+'% trong '+e.luot+' lượt';return '';}
function modVi(a){return (a||[]).map(function(m){return (m.pct>0?'+':'')+m.pct+'% '+(STAT_VI[m.stat]||m.stat);}).join(', ');}
/* mô tả sách (Balo/bảng thú): sinh từ đúng dữ liệu bảng nên không lệch số. Chỉ số = % sát thương + hệ; Nội tại = hiệu ứng kèm; Hiệu ứng = hình ảnh. */
function sachMoTa(bid,ngan){var k=sachKyNang(bid);if(!k)return '';var n=k.noiTai||{},nt=[modVi(n.mod)].concat((n.ev||[]).map(evVi)).filter(Boolean).join(', '),
  cs=[k.tinhLang?'tăng '+k.tinhLang.tcPct+'% Tấn công hiện tại và ngưng đọng đối thủ (đứng yên, không hành động được); các đòn đánh thường trong lúc này không trừ máu ngay mà cộng dồn, đủ '+k.tinhLang.hits+' đòn thì nổ một lần toàn bộ sát thương cộng dồn thành sát thương chuẩn (bỏ qua giáp, có thể chí mạng); nổ xong kỹ năng kết thúc':k.tuHoi?'dùng lên bản thân (không gây sát thương), hồi ngay '+k.tuHoi.pct+'% máu tối đa':Math.round(k.hsTc*100)+'% sát thương '+(HE_VI[k.he]||k.he)].concat((k.ev||[]).map(evVi)).filter(Boolean).join(', '),
  heT='Hệ '+(HE_VI[k.he]||k.he);
  if(ngan)return cs+', hồi chiêu '+k.cd+' lượt.'+(n.ten?' Nội tại '+n.ten+': '+(nt||'-')+'.':'');   /* bản ngắn cho bảng chọn kỹ năng trong Thú Thần */
  return heT+'. '+(k.mt?k.mt+'. ':'')+'Chỉ số: '+cs+', hồi chiêu '+k.cd+' lượt.'+(n.ten?' Nội tại '+n.ten+': '+(nt||'-')+((n.ev||[]).some(function(e){return e.k==='debuff'||e.k==='gayMu'||e.k==='choangNT';})?' (giảm theo Kháng của đối thủ)':'')+'.':'')+' Hiệu ứng: hình ảnh kỹ năng khi tung chiêu. Chỉ thú có hệ chính hoặc phụ trùng hệ sách mới gắn được.';}
var TY_LE_ROI_SACH=1.5;   /* % rơi sách kỹ năng boss, CHỈ khi giết chết boss (bắt không rơi); mm nhân thêm như tỉ lệ rớt item */
function kyNangBoss(z){return KY_NANG_BOSS[z]?copy(KY_NANG_BOSS[z]):null;}

function copy(o){return o?JSON.parse(JSON.stringify(o)):null;}
function zOf(thu){
  if(thu&&thu.vung!=null)return thu.vung;
  var L=root.TTGCS&&root.TTGCS.loai?root.TTGCS.loai(thu&&thu.id):null;
  return L?L.vung:null;
}
function laBoss(thu){
  if(thu&&thu.boss!=null)return !!thu.boss;
  var L=root.TTGCS&&root.TTGCS.loai?root.TTGCS.loai(thu&&thu.id):null;
  return !!(L&&L.boss);
}

function vungBuff(z){return VUNG[z]?copy(VUNG[z].buff):null;}
function debuffVung(z){return VUNG[z]?copy(VUNG[z].debuff):null;}
function buffBoss(z){return VUNG[z]?copy(VUNG[z].boss):null;}

/* các hiệu ứng buff đang có của một thú: buff vùng, thêm buff riêng nếu là boss */
function dsBuff(thu){
  var z=zOf(thu),r=[];
  if(z!=null&&VUNG[z]){r.push(VUNG[z].buff);if(laBoss(thu))r.push(VUNG[z].boss);}
  return r.concat(sachBuffs(thu));   /* + chỉ số/nội tại từ sách đang mang (thu.kn) */
}

/* modTinh(thu, doiThu, opt): mảng [{stat,pct}] để đưa vào TTGCS.tinh(thu,{mod:...}).
   - buff vùng (+ buff boss) của CHÍNH thú: cộng nguyên.
   - debuff vùng của ĐỐI THỦ (nếu có doiThu): giá trị x (1 - khu/100), khu = khu của thú (opt.khu nếu truyền, ngược lại thu.phu.khu), kẹp 0..100.
   Chỉ gồm phần cố định (mod). Phần tạm thời/điều kiện lấy bằng modTam. */
function modTinh(thu,doiThu,opt){
  var out=[];
  dsBuff(thu).forEach(function(h){(h.mod||[]).forEach(function(m){out.push({stat:m.stat,pct:m.pct});});});
  if(doiThu){
    var zd=zOf(doiThu);
    if(zd!=null&&VUNG[zd]){
      var khu=opt&&opt.khu!=null?opt.khu:((thu&&thu.phu&&thu.phu.khu)||0);
      khu=Math.max(0,Math.min(100,khu));
      (VUNG[zd].debuff.mod||[]).forEach(function(m){out.push({stat:m.stat,pct:m.pct*(1-khu/100)});});
    }
  }
  return out;
}

/* modTam(thu, st): phần chỉ số TẠM/CÓ ĐIỀU KIỆN đang có hiệu lực. st = {luot (1 = lượt đầu), hpTyLe (hp hiện tại / hp tối đa, 0..1)} */
function modTam(thu,st){
  var out=[],luot=(st&&st.luot)||1,ty=st&&st.hpTyLe!=null?st.hpTyLe:1;
  dsBuff(thu).forEach(function(h){
    (h.tam||[]).forEach(function(m){
      if(m.luot!=null&&luot>m.luot)return;
      if(m.hpDuoi!=null&&!(ty*100<m.hpDuoi))return;
      out.push({stat:m.stat,pct:m.pct});
    });
  });
  return out;
}

/* suKien(thu): danh sách sự kiện trận (ev) của thú, cho bộ máy trận bước D đọc */
function suKien(thu){
  var out=[];
  dsBuff(thu).forEach(function(h){(h.ev||[]).forEach(function(e){out.push(copy(e));});});
  return out;
}

/* hồi máu mỗi lượt / khiên đầu trận (số nguyên, 0 nếu thú không có) */
function tongEv(thu,k,f){
  var s=0;suKien(thu).forEach(function(e){if(e.k===k)s+=e[f];});return s;
}
function hoiLuot(thu,hpMax){return Math.floor(hpMax*tongEv(thu,'hoiLuot','pctHp')/100);}
function khienDau(thu,hpMax){return Math.floor(hpMax*tongEv(thu,'khienDau','pctHp')/100);}

root.TTGCS=Object.assign(root.TTGCS||{},{
  VUNG_BUFF:VUNG,DON_CO_BAN:DON_CO_BAN,donCoBan:donCoBan,KY_NANG_BOSS:KY_NANG_BOSS,kyNangBoss:kyNangBoss,sachKyNang:sachKyNang,sachBoss:sachBoss,sachMod:sachMod,sachMoTa:sachMoTa,heVi:function(h){return HE_VI[h]||h;},TY_LE_ROI_SACH:TY_LE_ROI_SACH,vungBuff:vungBuff,debuffVung:debuffVung,buffBoss:buffBoss,
  modTinh:modTinh,modTam:modTam,suKien:suKien,hoiLuot:hoiLuot,khienDau:khienDau
});
if(typeof module!=='undefined'&&module.exports)module.exports=root.TTGCS;
})(typeof window!=='undefined'?window:globalThis);
