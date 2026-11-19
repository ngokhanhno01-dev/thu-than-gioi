/* 56-chi-so.js - LÕI TÍNH CHỈ SỐ (thuần tính toán, KHÔNG DOM, KHÔNG vẽ). Xuất window.TTGCS.
   Nguồn sự thật: game-moi/THIET_KE_CHI_SO.md (mục 1-5). MỌI SỐ chỉnh ở khối CFG ngay dưới.
   BƯỚC A: hệ (18 hệ), bậc (gacha), cấp/EXP, chỉ số, sát thương. CHƯA có: bảng loài (56b), buff vùng (56c), kỹ năng (56d), TTGLV (56e).
   Hàm có ngẫu nhiên đều nhận tham số rng (mặc định Math.random) để test bằng node.
   API: HE, HE_TEN, BANG_HE, heHeSo, heTotNhat, BAC, tungBac, hsBac, expCan, tranCap, expThuong, goc, tinh, satThuong, CFG */
(function(root){
'use strict';

/* ===== CFG: toàn bộ số chỉnh ở đây ===== */
var CFG={
  /* hs cấp = 1 + k x (cấp-1). mm không tăng theo cấp */
  hsCap:{hp:0.07,tc:0.07,pt:0.07,td:0.02},
  /* hs tiến hóa theo tien 1/2/3 (mm chỉ tăng khi tiến hóa) */
  hsTien:{hp:[1,1.35,1.8],tc:[1,1.35,1.8],pt:[1,1.35,1.8],td:[1,1.1,1.2],mm:[1,1.5,2.2]},
  /* gốc loài vùng z=0, cấp 1, vai Cân bằng */
  goc:{hp:150,tc:40,pt:30,td:40,mm:10},
  hsVungMoiZ:0.3,        /* hp,tc,pt,td nhân (1 + 0,3 x z); mm KHÔNG nhân theo vùng */
  hsBoss:1.6,            /* boss: hp,tc,pt,td nhân thêm */
  /* nhân theo vai trò (hp,tc,pt,td) */
  vai:{
    tank:    {hp:1.3, tc:0.8, pt:1.4, td:0.7},
    cong:    {hp:0.9, tc:1.4, pt:0.8, td:1.0},
    nhanh:   {hp:0.85,tc:1.0, pt:0.8, td:1.5},
    canbang: {hp:1,   tc:1,   pt:1,   td:1}
  },
  /* bậc: tỉ lệ tung (%) và hs hp,tc,pt,td. mm KHÔNG nhân bậc */
  bac:[['E',28,0.85],['D',24,0.92],['C',20,1.00],['B',14,1.08],['A',8,1.16],['S',4.5,1.25],['SS',1.5,1.35]],
  bacQuai:'C',bacThuHoang:'C',bacBoss:'A',   /* bậc cố định KHI ĐANG ĐÁNH (bắt xong mới tung bậc thật) */
  /* hệ: hệ số một đòn lên MỖI hệ của mục tiêu. cheDo 'nhan' = nhân các hệ số của 2 hệ (song hệ cùng yếu 1,5x1,5=2,25), 'tb' = trung bình.
     Muốn kiểu Pokémon gốc: khac 2, kem 0.5, mien 0, cheDo 'nhan'. Muốn chênh nhẹ hơn: giảm khac/tăng kem. */
  he:{cheDo:'nhan',khac:1.5,kem:0.7,mien:0.3},
  /* cấp / EXP / sao */
  capMax:100,
  tranCapNen:10,tranCapMoiSao:0.55,     /* trần cấp = min(100, 10 + floor(sao x 0,55)) */
  expA:25,expMu:1.5,                    /* EXP cần lên cấp n->n+1 = round(25 x n^1,5) */
  expThuongNen:10,expThuongMoiCap:8,    /* EXP thưởng = (10 + 8 x cấpQuái) x hsChenh */
  chenhMoiCap:0.1,chenhMin:0.3,chenhMax:1.5,
  hsExpBoss:5,hsExpThuHoang:1.3,
  chiMang:1.5                           /* nhân sát thương khi chí mạng */
};

var CHINH=['hp','tc','pt','td','mm'];
var PHU=['cm','hm','hutm','ne','choang','cx','pd','lk','stcm','stdb','xg','khu','kdb','kc','kne','klk','khutm','khm','kpd'];   /* khớp PAGES của 54-thu-than.js */
function rngMac(){return Math.random();}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}

/* ===== HỆ: 18 hệ (khung khắc chế lấy theo Pokémon, đổi tên cho hợp game) =====
   BANG_HE[hệ tấn công] = {khac:[hệ bị khắc], kem:[hệ kháng], mien:[hệ miễn nhiễm]}. Sửa quan hệ nào cứ sửa ở đây. Hệ không liệt kê = x1.
   Thêm hệ mới: thêm vào HE_TEN + một dòng BANG_HE + (nếu cần) thêm tên vào dòng của các hệ khác. */
var HE_TEN={thuong:'Thường',hoa:'Hỏa',thuy:'Thủy',loi:'Lôi',moc:'Mộc',bang:'Băng',vo:'Võ',doc:'Độc',tho:'Thổ',phong:'Phong',tam:'Tâm Linh',trung:'Trùng',nham:'Nham',ma:'Ma',long:'Long',am:'Ám',kim:'Kim',tien:'Tiên'};
var HE=Object.keys(HE_TEN);
function ds(x){return x?x.split(' '):[];}
function H(khac,kem,mien){return {khac:ds(khac),kem:ds(kem),mien:ds(mien)};}
var BANG_HE={
  thuong:H('','nham kim','ma'),
  hoa:   H('moc bang trung kim','hoa thuy nham long',''),
  thuy:  H('hoa tho nham','thuy moc long',''),
  loi:   H('thuy phong','loi moc long','tho'),
  moc:   H('thuy tho nham','hoa moc doc phong trung long kim',''),
  bang:  H('moc tho phong long','hoa thuy bang kim',''),
  vo:    H('thuong bang nham am kim','doc phong tam trung tien','ma'),
  doc:   H('moc tien','doc tho nham ma','kim'),
  tho:   H('hoa loi doc nham kim','moc trung','phong'),
  phong: H('moc vo trung','loi nham kim',''),
  tam:   H('vo doc','tam kim','am'),
  trung: H('moc tam am','hoa vo doc phong ma kim tien',''),
  nham:  H('hoa bang phong trung','vo tho kim',''),
  ma:    H('tam ma','am','thuong'),
  long:  H('long','kim','tien'),
  am:    H('tam ma','vo am tien',''),
  kim:   H('bang nham tien','hoa thuy loi kim',''),
  tien:  H('vo long am','hoa doc kim','')
};
/* hs một đòn hệ heDon lên 1 hệ mục tiêu h */
function heMot(heDon,h){
  var r=BANG_HE[heDon];if(!r)return 1;
  if(r.mien.indexOf(h)>=0)return CFG.he.mien;
  if(r.khac.indexOf(h)>=0)return CFG.he.khac;
  if(r.kem.indexOf(h)>=0)return CFG.he.kem;
  return 1;
}
/* hs một đòn hệ heDon lên mục tiêu có 1-2 hệ (cách gộp: CFG.he.cheDo) */
function heHeSo(heDon,heMucTieu){
  var d=(heMucTieu&&heMucTieu.length)?heMucTieu:[];
  if(!d.length||!heDon)return 1;
  var v=d.map(function(h){return heMot(heDon,h);});
  if(CFG.he.cheDo==='tb')return v.reduce(function(a,b){return a+b;},0)/v.length;
  return v.reduce(function(a,b){return a*b;},1);
}
/* đòn thường tự chọn hệ có lợi nhất trong các hệ của người đánh. Trả {he, hs} */
function heTotNhat(heNguoiDanh,heMucTieu){
  var best=null;
  (heNguoiDanh||[]).forEach(function(h){var hs=heHeSo(h,heMucTieu);if(!best||hs>best.hs)best={he:h,hs:hs};});
  return best||{he:null,hs:1};
}

/* ===== BẬC (gacha) ===== */
var BAC=CFG.bac.map(function(b){return b[0];});
function hsBac(bac){for(var i=0;i<CFG.bac.length;i++)if(CFG.bac[i][0]===bac)return CFG.bac[i][2];return 1;}
/* tung bậc: KHÔNG nhận cấp/vùng, chỉ random theo bảng tỉ lệ. Dùng khi bắt xong thú và khi chọn thú đầu game */
function tungBac(rng){
  var r=(rng||rngMac)()*100,acc=0;
  for(var i=0;i<CFG.bac.length;i++){acc+=CFG.bac[i][1];if(r<acc)return CFG.bac[i][0];}
  return CFG.bac[CFG.bac.length-1][0];
}

/* ===== CẤP / EXP / SAO ===== */
function expCan(n){return Math.round(CFG.expA*Math.pow(n,CFG.expMu));}   /* EXP cần để từ cấp n lên n+1 */
function tranCap(sao){return Math.min(CFG.capMax,CFG.tranCapNen+Math.floor((sao||0)*CFG.tranCapMoiSao));}
/* loai: 'quai' | 'thu' (thú hoang) | 'boss' */
function expThuong(o){
  var cq=o.capQuai||1,ct=o.capThu||1;
  var chenh=clamp(1+CFG.chenhMoiCap*(cq-ct),CFG.chenhMin,CFG.chenhMax);
  var v=(CFG.expThuongNen+CFG.expThuongMoiCap*cq)*chenh;
  if(o.loai==='boss')v*=CFG.hsExpBoss;else if(o.loai==='thu')v*=CFG.hsExpThuHoang;
  return Math.round(v);
}

/* ===== CHỈ SỐ ===== */
/* gốc cấp 1 (số thực, chưa làm tròn): vung = z (0,1,2...), vai = tank|cong|nhanh|canbang, laBoss = true/false */
function goc(loai,vung,vai,laBoss){
  var v=CFG.vai[vai]||CFG.vai.canbang,z=vung||0,hz=1+CFG.hsVungMoiZ*z,hb=laBoss?CFG.hsBoss:1,o={};
  ['hp','tc','pt','td'].forEach(function(k){o[k]=CFG.goc[k]*v[k]*hz*hb;});
  o.mm=CFG.goc.mm;
  return o;
}
/* tinh(thu, ctx): thu = {id, lv, tien, bac, vai?, vung?, boss?, he?, phu?, chiso?}
   - thu.chiso có sẵn (thú dựng tay/demo) thì dùng nguyên, không tính.
   - vai/vung/boss thiếu thì lấy từ TTGCS.loai(id) (bảng loài, bước B) nếu đã nạp.
   - ctx.mod = [{stat, pct}] cộng dồn % lên chỉ số cuối (buff/debuff, bước C): hp/tc/pt/td/mm nhân (1+tổng/100); chỉ số phụ cộng điểm %.
   Trả {hp,tc,pt,td,mm, + chỉ số phụ}, số nguyên (làm tròn). */
function tinh(thu,ctx){
  thu=thu||{};
  var L=root.TTGCS&&root.TTGCS.loai?root.TTGCS.loai(thu.id):null;
  var vai=thu.vai||(L&&L.vai)||'canbang';
  var vung=thu.vung!=null?thu.vung:(L&&L.vung!=null?L.vung:0);
  var boss=thu.boss!=null?thu.boss:!!(L&&L.boss);
  var lv=clamp(Math.floor(thu.lv||1),1,CFG.capMax);
  var tien=clamp(Math.floor(thu.tien||1),1,3);
  var bac=thu.bac||'C';
  var b,o={},base;
  if(thu.chiso){base={};CHINH.forEach(function(k){base[k]=thu.chiso[k]||0;});}
  else{
    b=goc(thu.id,vung,vai,boss);base={};
    var hb=hsBac(bac);
    ['hp','tc','pt'].forEach(function(k){base[k]=b[k]*(1+CFG.hsCap[k]*(lv-1))*CFG.hsTien[k][tien-1]*hb;});
    base.td=b.td*(1+CFG.hsCap.td*(lv-1))*CFG.hsTien.td[tien-1]*hb;
    base.mm=b.mm*CFG.hsTien.mm[tien-1];     /* mm: không theo cấp, không theo bậc */
  }
  var mod={};
  ((ctx&&ctx.mod)||[]).forEach(function(m){mod[m.stat]=(mod[m.stat]||0)+(m.pct||0);});
  CHINH.forEach(function(k){o[k]=Math.round(base[k]*(1+(mod[k]||0)/100));});
  PHU.forEach(function(k){o[k]=((thu.phu&&thu.phu[k])||0)+(mod[k]||0);});
  return o;
}

/* ===== SÁT THƯƠNG =====
   = tc x hsKyNang x tc/(tc+pt) x hsHe x (chí mạng ? 1,5 : 1), làm tròn xuống, tối thiểu 1.
   chiMang: true/false; nếu bỏ trống mà có cm (%) thì tung bằng rng. Đòn thường hsKyNang = 1. */
function satThuong(o){
  var tc=o.tc||0,pt=o.pt||0,hk=o.hsKyNang!=null?o.hsKyNang:1,hh=o.hsHe!=null?o.hsHe:1;
  var cm=o.chiMang;
  if(cm==null&&o.cm!=null)cm=(o.rng||rngMac)()*100<o.cm;
  var d=tc*hk*(tc+pt>0?tc/(tc+pt):1)*hh*(cm?CFG.chiMang:1);
  return Math.max(1,Math.floor(d));
}

var api={CFG:CFG,CHINH:CHINH,PHU:PHU,HE:HE,HE_TEN:HE_TEN,BANG_HE:BANG_HE,heHeSo:heHeSo,heTotNhat:heTotNhat,BAC:BAC,hsBac:hsBac,tungBac:tungBac,
  expCan:expCan,tranCap:tranCap,expThuong:expThuong,goc:goc,tinh:tinh,satThuong:satThuong};
/* giữ các phần mở rộng nếu file khác (56b/56c/56d) nạp trước */
root.TTGCS=Object.assign(root.TTGCS||{},api);
if(typeof module!=='undefined'&&module.exports)module.exports=root.TTGCS;
})(typeof window!=='undefined'?window:globalThis);

/* Nạp 56b-loai.js ngay sau file này (đồng bộ, đúng thứ tự, như một thẻ script đặt liền sau). Chỉ chạy trong trình duyệt, bỏ qua khi test bằng node.
   Nếu sau này thêm thẻ <script src="game-moi/56b-loai.js"> vào index.html thì dòng này tự bỏ qua (đã có TTGCS.loai) hoặc xóa đi. */
if(typeof document!=='undefined'&&document.write&&!(window.TTGCS&&window.TTGCS.loai)){document.write('<script src="game-moi/56b-loai.js"><\/script>');}
