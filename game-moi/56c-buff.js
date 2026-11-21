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
   ev (bước D thực thi): lop{ten,them} thêm lớp | hutMau{pct} | tuBuff{stat,pct,luot} boss tự buff | debuff{stat,pct,luot} lên đối thủ (giảm theo khu) | choang{xs,luot} (kc chặn) */
var KY_NANG_BOSS=[
  {id:'bang-son-ap-dinh',ten:'Băng Sơn Áp Đỉnh',boss:'1j',he:'bang',hsTc:1.8,cd:5,ev:[],
   mt:'Triệu hồi 1 ngọn núi băng trấn áp đối thủ',
   noiTai:{ten:'Lạnh Thấu Xương',mod:[],ev:[{k:'debuff',stat:'pt',pct:-20,luot:2}]}},
  {id:'suong-nuot',ten:'Sương Nuốt',boss:'2j',he:'thuy',hsTc:1.5,cd:5,ev:[{k:'hutMau',pct:30}],
   noiTai:{ten:'Sương Che',mod:[],ev:[{k:'debuff',stat:'tc',pct:-15,luot:2}]}},
  {id:'con-bang-trien-si',ten:'Côn Bằng Triển Sí',boss:'3j',he:'phong',hsTc:2.0,cd:5,ev:[{k:'tuBuff',stat:'td',pct:30,luot:2}],
   noiTai:{ten:'Vân Cánh',mod:[],ev:[{k:'khienDau',pctHp:5}]}},
  {id:'vu-xa-trien',ten:'Vũ Xà Triền',boss:'6j',he:'phong',hsTc:1.4,cd:5,ev:[{k:'debuff',stat:'td',pct:-50,luot:2}],
   noiTai:{ten:'Xà Hành',mod:[],ev:[{k:'debuff',stat:'pt',pct:-10,luot:2}]}},
  {id:'thien-loi-giang',ten:'Thiên Lôi Giáng',boss:'4j',he:'loi',hsTc:2.2,cd:6,ev:[{k:'choang',xs:40,luot:1}],
   noiTai:{ten:'Lôi Kích',mod:[],ev:[{k:'debuff',stat:'pt',pct:-10,luot:2}]}},
  {id:'nguyet-thuc-nuot',ten:'Nguyệt Thực Nuốt',boss:'5j',he:'am',hsTc:2.0,cd:5,ev:[{k:'debuff',stat:'td',pct:-20,luot:2}],
   noiTai:{ten:'Nguyệt Ảnh',mod:[],ev:[{k:'debuff',stat:'tc',pct:-10,luot:2}]}}
];
/* SÁCH KỸ NĂNG = NGUỒN DUY NHẤT: mỗi sách (id 'sach-'+id kỹ năng) gồm 3 phần theo đúng thiết kế:
   (1) CHỈ SỐ = % sát thương theo hệ (hsTc, he; vd 180% sát thương Băng) + hồi chiêu cd (+ ev kèm theo của kỹ năng nếu có: hút máu, choáng...);
   (2) NỘI TẠI = noiTai {ten, ev}: hiệu ứng kèm theo, vd 'Lạnh Thấu Xương': giảm 20% giáp đối thủ trong 2 lượt (debuff, bị giảm theo Kháng của người bị gắn);
   (3) HIỆU ỨNG = hình ảnh kỹ năng (57-fx-ky-nang-boss.js), không phải số liệu.
   Sách KHÔNG cộng chỉ số cho thú mang sách. Boss thú hoang được GÁN sách của mình (boss:'..'); người chơi gắn sách vào thú (thu.kn = [id sách]) thì dùng được y hệt boss. Số trong bảng trên là số mẫu, chỉnh tại đó. */
function sachKyNang(bid){if(typeof bid!=='string'||bid.indexOf('sach-')!==0)return null;var id=bid.slice(5);for(var i=0;i<KY_NANG_BOSS.length;i++)if(KY_NANG_BOSS[i].id===id)return KY_NANG_BOSS[i];return null;}
function sachBoss(bossId){for(var i=0;i<KY_NANG_BOSS.length;i++)if(KY_NANG_BOSS[i].boss===bossId)return 'sach-'+KY_NANG_BOSS[i].id;return null;}
function sachBuffs(thu){var r=[];((thu&&thu.kn)||[]).forEach(function(b){var k=sachKyNang(b);if(!k)return;var n=k.noiTai||{};r.push({mod:n.mod||[],ev:n.ev||[]});});return r;}   /* sách không cộng chỉ số: chỉ nội tại */
function sachMod(thu){var o=[];sachBuffs(thu).forEach(function(h){(h.mod||[]).forEach(function(m){o.push({stat:m.stat,pct:m.pct});});});return o;}   /* chỉ số từ sách -> TTGCS.tinh(thu,{mod:sachMod(thu)}) */
var STAT_VI={hp:'Máu',tc:'Tấn công',pt:'Giáp',td:'Tốc độ',mm:'May mắn',ne:'Né',cx:'Chính xác',cm:'Chí mạng',khu:'Kháng',hutm:'Hút máu',pd:'Phản đòn'};
var HE_VI={bang:'Băng',thuy:'Thủy',phong:'Phong',loi:'Lôi',am:'Âm',hoa:'Hỏa',moc:'Mộc',tho:'Thổ',doc:'Độc',kim:'Kim'};
function evVi(e){if(e.k==='lop')return 'gắn '+e.them+' lớp lạnh';if(e.k==='hutMau')return 'hút '+e.pct+'% sát thương thành máu';if(e.k==='tuBuff')return 'bản thân +'+e.pct+'% '+(STAT_VI[e.stat]||e.stat)+' '+e.luot+' lượt';if(e.k==='debuff')return 'giảm '+Math.abs(e.pct)+'% '+(STAT_VI[e.stat]||e.stat)+' đối thủ trong '+e.luot+' lượt';if(e.k==='choang')return e.xs+'% làm choáng '+e.luot+' lượt';if(e.k==='khienDau')return 'khiên đầu trận '+e.pctHp+'% máu';return '';}
function modVi(a){return (a||[]).map(function(m){return (m.pct>0?'+':'')+m.pct+'% '+(STAT_VI[m.stat]||m.stat);}).join(', ');}
/* mô tả sách (Balo/bảng thú): sinh từ đúng dữ liệu bảng nên không lệch số. Chỉ số = % sát thương + hệ; Nội tại = hiệu ứng kèm; Hiệu ứng = hình ảnh. */
function sachMoTa(bid){var k=sachKyNang(bid);if(!k)return '';var n=k.noiTai||{},nt=[modVi(n.mod)].concat((n.ev||[]).map(evVi)).filter(Boolean).join(', '),
  cs=[Math.round(k.hsTc*100)+'% sát thương '+(HE_VI[k.he]||k.he)].concat((k.ev||[]).map(evVi)).filter(Boolean).join(', ');
  return (k.mt?k.mt+'. ':'')+'Chỉ số: '+cs+', hồi chiêu '+k.cd+' lượt. Nội tại '+(n.ten||'')+': '+(nt||'-')+((n.ev||[]).some(function(e){return e.k==='debuff';})?' (giảm theo Kháng của đối thủ)':'')+'. Hiệu ứng: hình ảnh kỹ năng khi tung chiêu. Chỉ thú có hệ chính hoặc phụ trùng hệ sách mới gắn được.';}
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
